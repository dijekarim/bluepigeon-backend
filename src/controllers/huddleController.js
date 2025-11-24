const db = require("../models");
const Channel = db.channel;
const ChannelParticipant = db.channel_participant;
const Conversation = db.conversation;
const {
  startSession,
  joinSessionByContext,
  leaveSessionByContext,
  endSession,
  getSessionByContext,
  HUDDLE_DURATION_MS,
} = require("../services/huddle.service");

const CHANNEL = "channel";
const DM = "dm";

async function ensureChannelAccess(channelId, userId, { requireAdmin = false } = {}) {
  const channel = await Channel.findByPk(channelId);
  if (!channel) {
    const error = new Error("Channel not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await ChannelParticipant.findOne({
    where: { channel_id: channelId, user_id: userId },
  });

  if (!membership) {
    const error = new Error("You are not a member of this channel");
    error.statusCode = 403;
    throw error;
  }

  if (requireAdmin && membership.role !== "admin") {
    const error = new Error("Only channel admins can perform this action");
    error.statusCode = 403;
    throw error;
  }

  if (channel.is_closed) {
    const error = new Error("Channel is closed");
    error.statusCode = 400;
    throw error;
  }

  return { channel, membership };
}

async function ensureConversationAccess(conversationId, userId) {
  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    conversation.participant_one !== userId &&
    conversation.participant_two !== userId
  ) {
    const error = new Error("You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  return conversation;
}

function handleControllerError(res, error) {
  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: error.message || "Unexpected error",
  });
}

exports.startChannelHuddle = async (req, res) => {
  try {
    const { channelId } = req.params;
    await ensureChannelAccess(channelId, req.user.id);

    const result = await startSession({
      contextType: CHANNEL,
      contextId: channelId,
      initiatorId: req.user.id,
    });

    return res.status(result.created ? 201 : 200).json({
      success: true,
      created: result.created,
      session: result.session,
      max_duration_ms: HUDDLE_DURATION_MS,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.startDmHuddle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ensureConversationAccess(conversationId, req.user.id);

    const result = await startSession({
      contextType: DM,
      contextId: conversationId,
      initiatorId: req.user.id,
    });

    return res.status(result.created ? 201 : 200).json({
      success: true,
      created: result.created,
      session: result.session,
      max_duration_ms: HUDDLE_DURATION_MS,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.joinChannelHuddle = async (req, res) => {
  try {
    const { channelId } = req.params;
    await ensureChannelAccess(channelId, req.user.id);
    const session = await joinSessionByContext({
      contextType: CHANNEL,
      contextId: channelId,
      userId: req.user.id,
      isMuted: req.body.is_muted,
    });
    return res.json({ success: true, session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.joinDmHuddle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ensureConversationAccess(conversationId, req.user.id);
    const session = await joinSessionByContext({
      contextType: DM,
      contextId: conversationId,
      userId: req.user.id,
      isMuted: req.body.is_muted,
    });
    return res.json({ success: true, session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.leaveChannelHuddle = async (req, res) => {
  try {
    const { channelId } = req.params;
    await ensureChannelAccess(channelId, req.user.id);
    const session = await leaveSessionByContext({
      contextType: CHANNEL,
      contextId: channelId,
      userId: req.user.id,
    });
    return res.json({ success: true, session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.leaveDmHuddle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ensureConversationAccess(conversationId, req.user.id);
    const session = await leaveSessionByContext({
      contextType: DM,
      contextId: conversationId,
      userId: req.user.id,
    });
    return res.json({ success: true, session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getChannelHuddle = async (req, res) => {
  try {
    const { channelId } = req.params;
    await ensureChannelAccess(channelId, req.user.id);
    const session = await getSessionByContext(CHANNEL, channelId);
    return res.json({ success: true, session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.getDmHuddle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ensureConversationAccess(conversationId, req.user.id);
    const session = await getSessionByContext(DM, conversationId);
    return res.json({ success: true, session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await db.huddle_session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    if (session.context_type === CHANNEL) {
      const { membership } = await ensureChannelAccess(session.context_id, req.user.id);
      const isInitiator = session.initiator_id === req.user.id;
      if (!isInitiator && membership.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Only the initiator or channel admins can end this huddle",
        });
      }
    } else if (session.context_type === DM) {
      await ensureConversationAccess(session.context_id, req.user.id);
      if (session.initiator_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Only the initiator can end this direct huddle",
        });
      }
    }

    const result = await endSession(sessionId, "manual");
    return res.json({ success: true, session: result });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

