# BluePigeon-Backend

BluePigeon-Backend is the repository for the backend code of Blue Pigeon, a voice note-based messenger app for enterprises, similar to Slack, Microsoft Teams, and Flock. This project is built using Node.js and Express.js, with additional features implemented as per the test task.

## **Project Overview**

- **Application Type**: Enterprise messenger app with voice notes, direct messages, channels, and real-time features.
- **Key Features**:
  - Login
  - Direct Messages
  - Channels (Group Messages)
  - Slack’s Huddle-like Feature (voice-only sessions)
- **Test Task Focus**: Development of Feature 4 (Slack’s Huddle-like feature) using Node.js backend only (no frontend required).
- **Deliverables**: Node.js backend code, Postman collection for endpoints, and push to GitHub repository.

## **Feature 4: Slack’s Huddle-like Feature**

### **Overview**
- Lightweight, voice-only "Huddle" sessions that can be started in a channel or 1-on-1 Direct Message.
- Instantly joinable (no scheduling), voice-only (no video), and automatically ends after 5 minutes (server-enforced hard cutoff).

### **User Flow**
1. **Initiation**: User A clicks "Start Huddle" in a channel or DM; server creates a huddle session and starts a 5-minute timer.
2. **Notifications**: Sent to relevant channel members; members can join to participate.
3. **Connection**: Participants connect via WebRTC; client UI (not built here) shows speaker avatars, countdown timer, mute/unmute, and leave controls.
4. **Termination**: At timer end (0), server sends END_HUDDLE event, terminates streams, and closes the session.

### **Tech Stack & Architecture**
- **Backend Framework**: Node.js 20 with Express.js.
- **Realtime Communication**: Socket.io or WebSocket for signaling, session control, invites, and enforcing time limits.
- **Media Handling**: WebRTC for peer-to-peer voice; optional media servers (e.g., Janus, Mediasoup) for NAT traversal or multi-party mixing.
- **Database**: PostgreSQL for session metadata, participants, and indexes.
- **Caching**: Redis for ephemeral session state and countdown timers.
- **Storage**: S3 (or similar) for audio blobs and transcripts.
- **Authentication**: JWT + session tokens, integrated with tenant/workspace auth.
- **Client (Not Required)**: React (Web) + React Native (Mobile) or WebView components.

### **Server Responsibilities**
- Create huddle session records (session_id, channel_id, initiator, start_time, end_time_max = start_time + 5m).
- Enforce 5-minute hard cutoff and send END_HUDDLE event.
- Manage invites, permissions (channel members only), and participant presence.
- Route signaling messages and persist call metadata/audio.

## **Prerequisites**
- Node.js 20.x
- PostgreSQL database
- Redis server
- Git for repository management

## **Local Setup and Running**
1. **Clone the Repository**: `git pull` (or `git clone` if initial setup).
2. **Install Dependencies**: Run `npm install` to install all required packages.
3. **Run Locally**: Use the script `npm run local` to start the server in development mode.
   - Ensure PostgreSQL and Redis are running locally or via configured connections.
   - The app will start on the default port (e.g., 8080; check package.json for details).

## **API Endpoints**
- Refer to the provided Postman collection for detailed endpoint testing.
- Key endpoints include those for starting/joining huddles, signaling, and session management.

## **Contributing**
- Push completed code to the provided GitHub repository.
- If needed, reference existing codebase for Features 2 and 3.

---