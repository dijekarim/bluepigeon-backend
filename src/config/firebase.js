const admin = require("firebase-admin");
const path = require("path");
// const serviceAccount = require(path.resolve(
//   __dirname,
//   "../../blue-pigeon-e78da-firebase-adminsdk-fbsvc-80d5b3fa1b.json"
// ));

if (!admin.apps.length) {
  admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
