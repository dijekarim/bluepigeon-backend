const db = require("../models");
const Chat = db.chat;
const user_data = db.user_data;
const Fcm_tokens = db.fcm_tokens;

const { to } = require("await-to-js");
const { Op } = require("sequelize");
const {sendNotification} = require('../services/send-notification');
const { use } = require("passport");

function encodeBase64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}


exports.send = async (req, res) => {
  try {
    const { sender, receiver, file_type, message } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let userSender = await user_data.findOne({ where: { id: sender } });

    var name = "user";

    var response = await to(Chat.create({
      message: (file_type === 'text') ? encodeBase64(message) : '',
      sender,
      receiver,
      file_path: (file_type != 'text') ? `${baseUrl}/uploads/${req.file.filename}` : '',
      file_type,
    }));

    var type = (file_type == 'text') ? "message" : "voice note";
    type = (file_type == 'image') ? "image": type;

    if(userSender){
      name = userSender.name;
      let fcm_tokens = await Fcm_tokens.findAll({ where: { user_id: receiver } });
    
      for (let i = 0; i < fcm_tokens.length; i++) {
        const token = fcm_tokens[i].token;
        sendNotification(token, {title: "New Message", body: name+" sent you a "+type+".",});
      }
    }

    return res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
}

exports.getChats = async (req, res) => {
  try {
    const user1 = req.params.user1 || req.query.user1;
    const user2 = req.params.user2 || req.query.user2;
    
    const page = parseInt(req.query.page) || 1;
    const limit = 50; 
    const offset = (page - 1) * limit;

    if (!user1 || !user2) {
        return res.status(400).json({ error: "Both user1 and user2 are required." });
    }

    const totalCount = await Chat.count({
      where: {
          [Op.or]: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 }
          ]
      }
    });

    const chats = await Chat.findAll({
      where: {
          [Op.or]: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 }
          ]
      },
      order: [['createdAt', 'DESC']], 
      limit: limit,
      offset: offset
    });

    const data = [];
    for (let i = 0; i < chats.length; i++) {
      const c = chats[i];
      data.push({
        id: c.id,
        sender: c.sender,
        receiver: c.receiver,
        message: c.message,
        file_type: c.file_type,
        file_url: c.file_path || null,
        createdAt: c.createdAt,
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalMessages: totalCount,
        messagesPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body;

    if (!["sent", "delivered", "seen"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    chat.read_status = status;
    await chat.save();

    return res.json({ message: "Chat status updated successfully.", chat });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        error: "Chat message not found." 
      });
    }

    if (chat.sender !== userId && chat.receiver !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You are not authorized to mark this message as read." 
      });
    }

    const readBy = chat.read_by || [];
    if (readBy.includes(userId)) {
      return res.status(200).json({ 
        success: true, 
        message: "Message already marked as read.",
        data: chat 
      });
    }

    readBy.push(userId);
    await chat.update({ read_by: readBy });

    return res.status(200).json({ 
      success: true, 
      message: "Message marked as read successfully.",
      data: chat 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to mark message as read." 
    });
  }
};
