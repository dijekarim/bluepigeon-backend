## **Test Task – (Dimas Jabbar Karim)**

### **Date:** November 21, 2025 **Deadline:** November 28, 2025 

### **Project Overview**

There is a voice note–based, messenger app for enterprises, similar to that of Slack, Microsoft Teams, and Flock. And, the app consists of the following features. 

---

### **Sub-Features**

1. Login

2. Direct Messages

3. Channels (Group Messages)

4. Slack’s *Huddle*\-like Feature

---

### **Task Instructions**

Your task is to **develop; Feature 4 (Slack’s Huddle-like feature)** using **Node.js**.

* You only need to build the **backend** (no frontend).

* Please provide a **Postman collection** for your backend endpoints.

* Push your completed code to the **GitHub repository** we provide.

* If needed, we can share the existing **codebase for Features 2 and 3** for reference.

---

### **Feature 4: Slack’s Huddle-like Feature**

#### **1\. Overview**

Develop a lightweight, **voice-only “Huddle” session** that:

* Can be started within a **channel** or a **1-on-1 Direct Message**

* Is **joinable instantly** (no scheduling)

* Is **voice-only** (no video)

* **Automatically ends after 2 minutes**

---

####   **2\. User Flow (Concise)**

1. **User A** clicks *Start Huddle* in a channel or DM.

   * The server creates a new **huddle session** and starts a **5-minute timer**.

2. **Notifications** are sent to relevant channel members.

   * Members can click *Join* to participate.

3. Participants connect via **WebRTC**.

   * The client UI (not required in this task) shows:

     * Speaker avatars

     * Countdown timer

     * Mute/Unmute and Leave controls

4. When the timer reaches **0**, the server sends an **END\_HUDDLE** event, terminates all media streams, and the clients close the session.

---

#### **3\. Recommended Tech Stack & Architecture**

* **Realtime Media:** WebRTC (peer-to-peer where possible)

* **Signaling Layer / Session Control:** Node.js backend using **Socket.io** or **WebSocket**

  * Responsible for session lifecycle, invites, and enforcing the 2-minute limit

* **Media Servers (if needed):** Janus, Mediasoup, or Jitsi for NAT traversal, recording, or multi-party mixing

* **Storage:** S3 (or any object store) for audio blobs and transcripts

* **Database:**

  * MySQL for session metadata, participants, and indexes

  * Redis for ephemeral session state and countdown timers

* **Authentication:** JWT \+ session tokens, integrated with tenant/workspace authentication

* **Client:** React (Web) \+ React Native (Mobile) or native WebView components (not required in this task)

---

####     **4\. Server Responsibilities (Must-Haves)**

* Create a **huddle session record**

  * session\_id, channel\_id, initiator, start\_time, end\_time\_max \= start\_time \+ 5m

* Enforce a **5-minute hard cutoff** (server sends END\_HUDDLE event)

* Manage **invites and permissions** (only channel members may join)

* Route **signaling messages** and maintain participant presence

* Persist minimal **call metadata** and optionally the recorded audio

---

✅ **Deliverables**

* Node.js backend code pushed to GitHub

* Postman collection with working endpoints

---

