const admin = require('../config/firebase');
// const serviceAccount = require('../../blue-pigeon-e78da-firebase-adminsdk-fbsvc-80d5b3fa1b.json');

async function sendNotification(deviceToken, payload) {
    try {

        const message = {
            token: deviceToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return { success: true, response };
    } catch (error) {console.error('Error sending message:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendNotification };