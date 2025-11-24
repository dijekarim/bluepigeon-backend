const { Server } = require("socket.io");
const { contextRoom, huddleRoom } = require("../utils/huddleRooms");

let ioInstance = null;

function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("join-context-room", ({ contextType, contextId }) => {
      const room = contextRoom(contextType, contextId);
      if (!room) return;
      socket.join(room);
      socket.emit("context-room-joined", { room });
    });

    socket.on("join-huddle-room", ({ sessionId }) => {
      const room = huddleRoom(sessionId);
      if (!room) return;
      socket.join(room);
      socket.emit("huddle-room-joined", { room });
    });

    socket.on("webrtc-signal", ({ sessionId, payload }) => {
      const room = huddleRoom(sessionId);
      if (!room) return;
      socket.to(room).emit("webrtc-signal", { sessionId, payload });
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io instance is not initialized yet");
  }

  return ioInstance;
}

function hasSocket() {
  return Boolean(ioInstance);
}

module.exports = {
  initSocket,
  getIO,
  hasSocket,
};

