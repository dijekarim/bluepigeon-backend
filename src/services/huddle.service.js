const { Op } = require("sequelize");
const db = require("../models");
const { contextRoom, huddleRoom } = require("../utils/huddleRooms");
const { getIO, hasSocket } = require("./socket.service");

const HuddleSession = db.huddle_session;
const HuddleParticipant = db.huddle_participant;

const HUDDLE_DURATION_MS =
  Number(process.env.HUDDLE_DURATION_MS || 2 * 60 * 1000);

const timerRegistry = new Map();

function getIoSafe() {
  if (!hasSocket()) return null;
  try {
    return getIO();
  } catch (error) {
    console.warn("[socket.io] unavailable:", error.message);
    return null;
  }
}

function emitLifecycleEvent(session, event, payload = {}) {
  const io = getIoSafe();
  if (!io || !session) return;

  const basePayload = {
    session_id: session.id,
    context_type: session.context_type,
    context_id: session.context_id,
    status: session.status,
    ...payload,
  };

  const cRoom = contextRoom(session.context_type, session.context_id);
  if (cRoom) {
    io.to(cRoom).emit(event, basePayload);
  }

  const hRoom = huddleRoom(session.id);
  if (hRoom) {
    io.to(hRoom).emit(event, basePayload);
  }
}

function clearSessionTimer(sessionId) {
  const timer = timerRegistry.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    timerRegistry.delete(sessionId);
  }
}

function scheduleSessionTimeout(session) {
  if (!session) return;
  clearSessionTimer(session.id);

  const delay = new Date(session.ends_at).getTime() - Date.now();
  if (delay <= 0) {
    endSession(session.id, "timeout").catch((error) =>
      console.error("[huddle] failed to auto-end session", error)
    );
    return;
  }

  const timer = setTimeout(() => {
    endSession(session.id, "timeout").catch((error) =>
      console.error("[huddle] failed to auto-end session", error)
    );
  }, delay);

  timerRegistry.set(session.id, timer);
}

function formatParticipant(participant) {
  if (!participant) return null;
  const base = {
    id: participant.id,
    session_id: participant.session_id,
    user_id: participant.user_id,
    status: participant.status,
    joined_at: participant.joined_at,
    left_at: participant.left_at,
    is_muted: participant.is_muted,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
  };

  if (participant.user) {
    base.user = {
      id: participant.user.id,
      name: participant.user.name,
      email: participant.user.email,
      userName: participant.user.userName,
      image_url: participant.user.image_url,
    };
  }

  return base;
}

function serializeSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    context_type: session.context_type,
    context_id: session.context_id,
    initiator_id: session.initiator_id,
    status: session.status,
    started_at: session.started_at,
    ends_at: session.ends_at,
    ended_at: session.ended_at,
    ended_reason: session.ended_reason,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    participants: Array.isArray(session.participants)
      ? session.participants.map(formatParticipant)
      : [],
  };
}

async function fetchSessionWithParticipants(sessionId) {
  return HuddleSession.findByPk(sessionId, {
    include: [
      {
        model: HuddleParticipant,
        as: "participants",
        include: [{ model: db.user_data, as: "user" }],
      },
    ],
    order: [[{ model: HuddleParticipant, as: "participants" }, "joined_at", "ASC"]],
  });
}

async function getActiveSession(contextType, contextId) {
  return HuddleSession.findOne({
    where: {
      context_type: contextType,
      context_id: contextId,
      status: "active",
    },
    include: [
      {
        model: HuddleParticipant,
        as: "participants",
        include: [{ model: db.user_data, as: "user" }],
      },
    ],
  });
}

async function bootstrapActiveHuddles() {
  const sessions = await HuddleSession.findAll({
    where: {
      status: "active",
      ends_at: {
        [Op.gt]: new Date(),
      },
    },
    include: [{ model: HuddleParticipant, as: "participants" }],
  });

  sessions.forEach((session) => scheduleSessionTimeout(session));

  if (sessions.length > 0) {
    console.log(`[huddle] restored ${sessions.length} active session timers`);
  } else {
    console.log("[huddle] no active sessions to restore");
  }

  return sessions.length;
}

async function ensureSessionFresh(sessionId) {
  const session = await fetchSessionWithParticipants(sessionId);
  if (!session) {
    const error = new Error("Huddle session not found");
    error.statusCode = 404;
    throw error;
  }
  if (session.status !== "active") {
    const error = new Error("Huddle session is no longer active");
    error.statusCode = 400;
    throw error;
  }
  if (new Date(session.ends_at).getTime() <= Date.now()) {
    await endSession(session.id, "timeout");
    const error = new Error("Huddle session already expired");
    error.statusCode = 410;
    throw error;
  }
  return session;
}

async function startSession({ contextType, contextId, initiatorId }) {
  const existing = await getActiveSession(contextType, contextId);
  if (existing) {
    return { session: serializeSession(existing), created: false };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + HUDDLE_DURATION_MS);

  const session = await HuddleSession.create({
    context_type: contextType,
    context_id: contextId,
    initiator_id: initiatorId,
    started_at: startedAt,
    ends_at: endsAt,
    status: "active",
  });

  await HuddleParticipant.create({
    session_id: session.id,
    user_id: initiatorId,
    status: "joined",
    is_muted: false,
  });

  const hydratedSession = await fetchSessionWithParticipants(session.id);
  scheduleSessionTimeout(hydratedSession);
  emitLifecycleEvent(hydratedSession, "huddle-started", {
    ends_at: hydratedSession.ends_at,
  });

  return { session: serializeSession(hydratedSession), created: true };
}

async function joinSessionByContext({ contextType, contextId, userId, isMuted }) {
  const session = await getActiveSession(contextType, contextId);
  if (!session) {
    const error = new Error("No active huddle session for this context");
    error.statusCode = 404;
    throw error;
  }
  return joinSession(session.id, userId, { isMuted });
}

async function joinSession(sessionId, userId, { isMuted = false } = {}) {
  const session = await ensureSessionFresh(sessionId);

  const [participant] = await HuddleParticipant.findOrCreate({
    where: { session_id: session.id, user_id: userId },
    defaults: {
      status: "joined",
      joined_at: new Date(),
      is_muted: Boolean(isMuted),
    },
  });

  if (participant.status === "left") {
    participant.status = "joined";
    participant.left_at = null;
    participant.joined_at = new Date();
  }
  if (typeof isMuted === "boolean") {
    participant.is_muted = isMuted;
  }
  await participant.save();

  const updated = await fetchSessionWithParticipants(session.id);
  scheduleSessionTimeout(updated);
  emitLifecycleEvent(updated, "huddle-participant-joined", {
    user_id: userId,
  });

  return serializeSession(updated);
}

async function leaveSessionByContext({ contextType, contextId, userId }) {
  const session = await getActiveSession(contextType, contextId);
  if (!session) {
    const error = new Error("No active huddle session for this context");
    error.statusCode = 404;
    throw error;
  }
  return leaveSession(session.id, userId);
}

async function leaveSession(sessionId, userId) {
  const session = await ensureSessionFresh(sessionId);
  const participant = await HuddleParticipant.findOne({
    where: { session_id: session.id, user_id: userId },
  });

  if (!participant) {
    const error = new Error("Participant is not part of this huddle");
    error.statusCode = 404;
    throw error;
  }

  participant.status = "left";
  participant.left_at = new Date();
  await participant.save();

  const updated = await fetchSessionWithParticipants(session.id);
  emitLifecycleEvent(updated, "huddle-participant-left", {
    user_id: userId,
  });

  await maybeEndSessionIfEmpty(updated);

  return serializeSession(updated);
}

async function maybeEndSessionIfEmpty(session) {
  const activeParticipants = session.participants.filter(
    (participant) => participant.status === "joined"
  );

  if (activeParticipants.length === 0) {
    await endSession(session.id, "empty");
  }
}

async function endSession(sessionId, reason = "manual") {
  const session = await HuddleSession.findByPk(sessionId);
  if (!session || session.status !== "active") {
    return null;
  }

  session.status = reason === "timeout" ? "expired" : "ended";
  session.ended_at = new Date();
  session.ended_reason = reason;
  await session.save();

  clearSessionTimer(session.id);

  const hydrated = await fetchSessionWithParticipants(session.id);
  emitLifecycleEvent(hydrated, "huddle-ended", { reason });
  return serializeSession(hydrated);
}

async function getSessionByContext(contextType, contextId) {
  const session = await getActiveSession(contextType, contextId);
  if (!session) return null;
  scheduleSessionTimeout(session);
  return serializeSession(session);
}

module.exports = {
  HUDDLE_DURATION_MS,
  bootstrapActiveHuddles,
  startSession,
  joinSessionByContext,
  leaveSessionByContext,
  joinSession,
  leaveSession,
  endSession,
  getSessionByContext,
};

