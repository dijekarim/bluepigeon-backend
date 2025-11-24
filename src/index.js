const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./models/index");
const session = require("express-session");
var passport = require("passport");

const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const { initSocket } = require("./services/socket.service");
const { bootstrapActiveHuddles } = require("./services/huddle.service");

var authRoutes = require("./routes/user_data");
var orgRoutes = require("./routes/organization");
var inviteRoutes = require("./routes/invite");
var chatRoutes = require("./routes/chat");
var channelRoutes = require("./routes/channel"); // updated
var directMessageRoutes = require("./routes/directMessage");
var huddleRoutes = require("./routes/huddle");

var cors = require("cors");

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

app.use(
  session({
    secret: "SECRET_KEY",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/organization", orgRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/dm", directMessageRoutes);
app.use("/api/huddles", huddleRoutes);

const port = process.env.PORT || 8080;
const server = http.createServer(app);

const socketsDisabled = String(process.env.DISABLE_SOCKET_IO || "").toLowerCase() === "true";

if (!socketsDisabled) {
  try {
    initSocket(server);
    console.log("[socket.io] signaling server initialized");
  } catch (error) {
    console.error("[socket.io] failed to initialize", error);
  }
} else {
  console.warn("[socket.io] initialization skipped via DISABLE_SOCKET_IO flag");
}

server.listen(port, () => {
  console.log(`server listen on http://localhost:${port}`);
  bootstrapActiveHuddles().catch((error) =>
    console.error("[huddle] bootstrap failed", error)
  );
});
