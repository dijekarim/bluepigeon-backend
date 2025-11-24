const db = require("../models");
const Conversation = db.conversation;
const DirectMessage = db.direct_message;
const UserData = db.user_data;
const { to } = require("await-to-js");
const { Op } = require("sequelize");

exports.createChat = async (req, res) => {
  try {
    const { user_id_one, user_id_two } = req.body;

    if (!user_id_one || !user_id_two) {
      return res.status(400).json({ 
        success: false, 
        error: "Both user_id_one and user_id_two are required." 
      });
    }

    if (user_id_one === user_id_two) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot create a conversation with yourself." 
      });
    }

    const [user1, user2] = await Promise.all([
      UserData.findByPk(user_id_one),
      UserData.findByPk(user_id_two)
    ]);

    if (!user1 || !user2) {
      return res.status(404).json({ 
        success: false, 
        error: "One or both users not found." 
      });
    }

    const existingConversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant_one: user_id_one, participant_two: user_id_two },
          { participant_one: user_id_two, participant_two: user_id_one }
        ]
      }
    });

    if (existingConversation) {
      return res.status(200).json({ 
        success: true, 
        message: "Conversation already exists.",
        data: existingConversation 
      });
    }

    const [participant_one, participant_two] = [user_id_one, user_id_two].sort();
    
    const [error, conversation] = await to(Conversation.create({
      participant_one,
      participant_two
    }));

    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    return res.status(201).json({ 
      success: true, 
      message: "Conversation created successfully.",
      data: conversation 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to create conversation." 
    });
  }
};

exports.getAllChats = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant_one: userId },
          { participant_two: userId }
        ]
      },
      include: [
        {
          model: UserData,
          as: 'participantOne',
          attributes: ['id', 'name', 'email', 'userName', 'image_url']
        },
        {
          model: UserData,
          as: 'participantTwo',
          attributes: ['id', 'name', 'email', 'userName', 'image_url']
        },
        {
          model: DirectMessage,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'message', 'file_type', 'createdAt', 'sender_id']
        }
      ],
      order: [['last_message_at', 'DESC']]
    });

    const formattedConversations = [];
    for (let i = 0; i < conversations.length; i++) {
      const conv = conversations[i];
      const otherParticipant = conv.participant_one === userId 
        ? conv.participantTwo 
        : conv.participantOne;
      
      formattedConversations.push({
        conversation_id: conv.id,
        other_participant: otherParticipant,
        last_message: conv.messages && conv.messages.length > 0 ? conv.messages[0] : null,
        last_message_at: conv.last_message_at,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: formattedConversations 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch conversations." 
    });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(chatId, {
      include: [
        {
          model: UserData,
          as: 'participantOne',
          attributes: ['id', 'name', 'email', 'userName', 'image_url']
        },
        {
          model: UserData,
          as: 'participantTwo',
          attributes: ['id', 'name', 'email', 'userName', 'image_url']
        },
        {
          model: DirectMessage,
          as: 'messages',
          include: [
            {
              model: UserData,
              as: 'sender',
              attributes: ['id', 'name', 'userName', 'image_url']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        error: "Conversation not found." 
      });
    }

    if (conversation.participant_one !== userId && conversation.participant_two !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You are not authorized to view this conversation." 
      });
    }

    const formattedMessages = [];
    for (let i = 0; i < conversation.messages.length; i++) {
      const msg = conversation.messages[i];
      formattedMessages.push({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender: msg.sender,
        message: msg.message,
        file_type: msg.file_type,
        file_url: msg.file_path || null, 
        read_by: msg.read_by,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        id: conversation.id,
        participant_one: conversation.participantOne,
        participant_two: conversation.participantTwo,
        last_message_at: conversation.last_message_at,
        messages: formattedMessages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch conversation." 
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversation_id, message, file_type } = req.body;
    const sender_id = req.user.id;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const conversation = await Conversation.findByPk(conversation_id);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        error: "Conversation not found." 
      });
    }

    if (conversation.participant_one !== sender_id && conversation.participant_two !== sender_id) {
      return res.status(403).json({ 
        success: false, 
        error: "You are not a participant in this conversation." 
      });
    }

    //
    const [error, directMessage] = await to(DirectMessage.create({
      conversation_id,
      sender_id,
      message: file_type === 'text' ? message : '',
      file_path: file_type !== 'text' && req.file ? `${baseUrl}/uploads/${req.file.filename}` : null,
      file_type: file_type || 'text',
      read_by: [sender_id] 
    }));

    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    await conversation.update({ last_message_at: new Date() });

    return res.status(201).json({ 
      success: true, 
      message: "Message sent successfully.",
      data: directMessage 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to send message." 
    });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await DirectMessage.findByPk(messageId, {
      include: [{
        model: Conversation,
        as: 'conversation'
      }]
    });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        error: "Message not found." 
      });
    }

    const conversation = message.conversation;
    if (conversation.participant_one !== userId && conversation.participant_two !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You are not authorized to mark this message as read." 
      });
    }

    const readBy = message.read_by || [];
    if (readBy.includes(userId)) {
      return res.status(200).json({ 
        success: true, 
        message: "Message already marked as read.",
        data: message 
      });
    }

    readBy.push(userId);
    await message.update({ read_by: readBy });

    return res.status(200).json({ 
      success: true, 
      message: "Message marked as read successfully.",
      data: message 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to mark message as read." 
    });
  }
};


exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        error: "Conversation not found." 
      });
    }

    if (conversation.participant_one !== userId && conversation.participant_two !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You are not a participant in this conversation." 
      });
    }

    const messages = await DirectMessage.findAll({
      where: {
        conversation_id: conversationId,
        read_by: {
          [Op.notLike]: `%${userId}%`
        }
      }
    });
    
    for (const message of messages) {
      const readBy = message.read_by || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        await message.update({ read_by: readBy });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `${messages.length} messages marked as read.`,
      count: messages.length
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to mark conversation as read." 
    });
  }
};