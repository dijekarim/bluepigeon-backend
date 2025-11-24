const db = require("../models");
const Channel = db.channel;
const ChannelParticipant = db.channel_participant;
const ChannelMessage = db.channel_message;
const User = db.user_data;

const { Op } = require("sequelize");
const { to } = require("await-to-js");

// Helper functions for message encoding/decoding(Optial)
function encodeMessage(message) {
  return Buffer.from(message, "utf8").toString("base64");
}

function decodeMessage(encodedMessage) {
  if (!encodedMessage) return "";
  try {
    return Buffer.from(encodedMessage, "base64").toString("utf8");
  } catch (error) {
    return encodedMessage; // Return original if decoding fails (Man)
  }
}

// Create a new channel
exports.createChannel = async (req, res) => {
  try {
    const { name } = req.body;
    const creatorId = req.user.id;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ 
        error: "Channel name is required" 
      });
    }

    // Create the new  channel
    const newChannel = await Channel.create({ 
      name: name.trim(), 
      created_by: creatorId 
    });

    // Add creator as admin role (creator)
    await ChannelParticipant.create({
      channel_id: newChannel.id,
      user_id: creatorId,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Channel created successfully",
      channel: newChannel
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(500).json({ 
      error: "Failed to create channel" 
    });
  }
};

// Add participants to a channel
exports.addParticipants = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userIds } = req.body;
    //Valde
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        error: "Please provide a valid list of user IDs" 
      });
    }

    // Check if channel exists
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({ 
        error: "Channel not found" 
      });
    }

    // Check if user is admin
    const isAdmin = await ChannelParticipant.findOne({
      where: { 
        channel_id: channelId, 
        user_id: req.user.id, 
        role: "admin" 
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        error: "Only channel admins can add participants" 
      });
    }

    // Check participant limit (max 10)
    const currentParticipantCount = await ChannelParticipant.count({
      where: { channel_id: channelId },
    });

    if (currentParticipantCount + userIds.length > 10) {
      return res.status(400).json({ 
        error: "Channel cannot have more than 10 participants" 
      });
    }

    // Validate that all users exist
    const existingUsers = await User.findAll({
      where: { id: { [Op.in]: userIds } },
    });

    if (existingUsers.length !== userIds.length) {
      return res.status(400).json({ 
        error: "One or more users not found" 
      });
    }

    // Add participants (skip if already exists)
    const addParticipantPromises = userIds.map(userId =>
      ChannelParticipant.findOrCreate({
        where: { channel_id: channelId, user_id: userId },
        defaults: { role: "member" },
      })
    );

    await Promise.all(addParticipantPromises);

    return res.json({ 
      success: true,
      message: "Participants added successfully" 
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    return res.status(500).json({ 
      error: "Failed to add participants" 
    });
  }
};

// Remove a participant from channel
exports.removeParticipant = async (req, res) => {
  try {
    const { channelId, userId } = req.params;

    // Check if user is admin
    const isAdmin = await ChannelParticipant.findOne({
      where: { 
        channel_id: channelId, 
        user_id: req.user.id, 
        role: "admin" 
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        error: "Only channel admins can remove participants" 
      });
    }

    // Remove the participant
    const removedCount = await ChannelParticipant.destroy({
      where: { channel_id: channelId, user_id: userId },
    });

    if (removedCount === 0) {
      return res.status(404).json({ 
        error: "Participant not found in this channel" 
      });
    }

    return res.json({ 
      success: true,
      message: "Participant removed successfully" 
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    return res.status(500).json({ 
      error: "Failed to remove participant" 
    });
  }
};

// Close a channel
exports.closeChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Check if user is admin
    const isAdmin = await ChannelParticipant.findOne({
      where: {
        channel_id: channelId,
        user_id: req.user.id,
        role: "admin",
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        error: "Only channel admins can close the channel" 
      });
    }

    // Find and close the channel
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({ 
        error: "Channel not found" 
      });
    }

    channel.is_closed = true;
    await channel.save();

    return res.json({ 
      success: true,
      message: "Channel closed successfully" 
    });
  } catch (error) {
    console.error("Error closing channel:", error);
    return res.status(500).json({ 
      error: "Failed to close channel" 
    });
  }
};

// Update channel permissions
exports.setPermissions = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { permissions } = req.body;

    const validPermissions = ["all_can_post", "admin_only_post"];
    if (!validPermissions.includes(permissions)) {
      return res.status(400).json({ 
        error: "Invalid permissions. Must be 'all_can_post' or 'admin_only_post'" 
      });
    }

    const isAdmin = await ChannelParticipant.findOne({
      where: { 
        channel_id: channelId, 
        user_id: req.user.id, 
        role: "admin" 
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ 
        error: "Only channel admins can update permissions" 
      });
    }

    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({ 
        error: "Channel not found" 
      });
    }

    channel.permissions = permissions;
    await channel.save();

    return res.json({ 
      success: true,
      message: "Channel permissions updated successfully" 
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return res.status(500).json({ 
      error: "Failed to update permissions" 
    });
  }
};

exports.listParticipants = async (req, res) => {
  try {
    const { channelId } = req.params;

    const participants = await ChannelParticipant.findAll({
      where: { channel_id: channelId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    return res.json({
      success: true,
      participants: participants
    });
  } catch (error) {
    console.error("Error listing participants:", error);
    return res.status(500).json({ 
      error: "Failed to fetch participants" 
    });
  }
};

// Send a message to channel
exports.sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { file_type, message, reply_to_id } = req.body;
    const senderId = req.user.id;

    // Check if channel exists. and is not closed
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({ 
        error: "Channel not found" 
      });
    }

    if (channel.is_closed) {
      return res.status(400).json({ 
        error: "Cannot send messages to a closed channel" 
      });
    }

    // Check if user is a member or admin .
    const membership = await ChannelParticipant.findOne({
      where: { channel_id: channelId, user_id: senderId },
    });

    if (!membership) {
      return res.status(403).json({ 
        error: "You must be a channel member to send messages" 
      });
    }

    // Check posting permissions is what
    if (channel.permissions === "admin_only_post" && membership.role !== "admin") {
      return res.status(403).json({ 
        error: "Only admins can post messages in this channel" 
      });
    }

    // Create the message follow
    const newMessage = await ChannelMessage.create({
      channel_id: channelId,
      sender_id: senderId,
      reply_to_id: reply_to_id || null,
      message: file_type === "text" ? encodeMessage(message) : "",
      file_path: file_type !== "text" && req.file ? `/uploads/${req.file.filename}` : "",
      file_type,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ 
      error: "Failed to send message" 
    });
  }
};

// List messages in a channel(Get)
exports.listMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const messages = await ChannelMessage.findAll({
      where: { channel_id: channelId },
      order: [["createdAt", "ASC"]],
      limit: 50,
      offset: 0,
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'email']
      }]
    });

    // Format messages for response
    const formattedMessages = messages.map(message => ({
      id: message.id,
      sender: {
        id: message.sender_id,
        name: message.sender?.name || "Unknown",
        email: message.sender?.email || ""
      },
      reply_to_id: message.reply_to_id,
      message: message.file_type === "text" ? decodeMessage(message.message) : message.message,
      file_type: message.file_type,
      file_url: message.file_path ? `${baseUrl}${message.file_path}` : null,
      created_at: message.createdAt
    }));

    return res.json({
      success: true,
      messages: formattedMessages,
      total: formattedMessages.length
    });
  } catch (error) {
    console.error("Error listing messages:", error);
    return res.status(500).json({ 
      error: "Failed to fetch messages" 
    });
  }
};