var express = require("express");
var router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const validateAudioDuration = require("../middleware/ffmpeg-check-duration");

const ctrl = require("../controllers/channelController");

router.post("/", verifyToken, ctrl.createChannel);
router.post("/:channelId/close", verifyToken, ctrl.closeChannel);

router.post("/:channelId/participants", verifyToken, ctrl.addParticipants);
router.get("/:channelId/participants", verifyToken, ctrl.listParticipants);
router.delete(
  "/:channelId/participants/:userId",
  verifyToken,
  ctrl.removeParticipant
);

router.post("/:channelId/permissions", verifyToken, ctrl.setPermissions);

router.post(
  "/:channelId/messages",
  verifyToken,
  upload.single("file"),
  validateAudioDuration,
  ctrl.sendMessage
);
router.get("/:channelId/messages", verifyToken, ctrl.listMessages);

module.exports = router;
