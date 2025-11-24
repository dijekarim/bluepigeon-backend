var express = require("express");
var router = express.Router();
const {sendOtpToEmail, verifyOtp, googleAuth, fca_token, getProfileByToken, getAllUser, updateUserDeatils, generateToken} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/send/otp", sendOtpToEmail);
router.post("/verify/otp", verifyOtp);
router.get("/google", googleAuth);
router.post('/firebase-user-data', fca_token);
router.get("/token/profile",verifyToken, getProfileByToken );
router.get("/get/all",getAllUser);
router.put("/user/update",verifyToken,updateUserDeatils);
router.post("/token/generate",generateToken);

module.exports = router;