const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const ctrl = require("../controllers/huddleController");

// Channel-based huddles
router.post("/channel/:channelId/start", verifyToken, ctrl.startChannelHuddle);
router.post("/channel/:channelId/join", verifyToken, ctrl.joinChannelHuddle);
router.post("/channel/:channelId/leave", verifyToken, ctrl.leaveChannelHuddle);
router.get("/channel/:channelId", verifyToken, ctrl.getChannelHuddle);

// Direct message huddles
router.post("/dm/:conversationId/start", verifyToken, ctrl.startDmHuddle);
router.post("/dm/:conversationId/join", verifyToken, ctrl.joinDmHuddle);
router.post("/dm/:conversationId/leave", verifyToken, ctrl.leaveDmHuddle);
router.get("/dm/:conversationId", verifyToken, ctrl.getDmHuddle);

// Manual termination
router.post("/sessions/:sessionId/end", verifyToken, ctrl.endSession);

module.exports = router;

