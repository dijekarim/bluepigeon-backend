var express = require("express");
var router = express.Router();
const { 
  createChat, 
  getAllChats, 
  getChatById, 
  sendMessage, 
  markMessageAsRead,
  markConversationAsRead 
} = require("../controllers/directMessageController");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const validateAudioDuration = require("../middleware/ffmpeg-check-duration");

router.post("/conversations", verifyToken, createChat);
router.get("/conversations", verifyToken, getAllChats);
router.get("/conversations/:chatId", verifyToken, getChatById);
router.post("/messages", verifyToken, upload.single('file'), validateAudioDuration, sendMessage);
router.put("/messages/:messageId/read", verifyToken, markMessageAsRead);
router.put("/conversations/:conversationId/read", verifyToken, markConversationAsRead);

module.exports = router;
