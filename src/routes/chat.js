var express = require("express");
var router = express.Router();
const { send, getChats, updateStatus, markChatAsRead } = require("../controllers/chatController");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const validateAudioDuration = require("../middleware/ffmpeg-check-duration");

router.post("/send", verifyToken,upload.single('file'), validateAudioDuration, send);
router.get("/list", verifyToken, getChats);
router.put("/:chatId/status", verifyToken, updateStatus);
router.put("/:chatId/read", verifyToken, markChatAsRead);

module.exports = router;
