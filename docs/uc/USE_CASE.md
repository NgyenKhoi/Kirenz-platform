# 📝 Kirenz Platform - Full Use Case Catalog

*Note: This list is optimized for team sharing and Slack communication.*

---

### 👤 1. IDENTITY SERVICE (Identity Service)
*Owner: Identity Service owns authentication, authorization, account status, OTP verification, JWT issuing, and lightweight profile fields.*

- **UC-ID-01: Register** 🆕
  - Register new account with email validation.
- **UC-ID-02: Login** 🔐
  - Login/Logout using JWT stateless authentication.
- **UC-ID-03: Profile** 🎨
  - Manage bio, display name, and avatars.

---

### 🤝 2. USER RELATIONSHIP SERVICE (User Service)
*Owner: User Service owns Friendship connectivity, Privacy, and Blocking data.*

- **UC-ID-04: Friendship** 🤝
  - Send, Accept, Decline, and cancel friend requests.
- **UC-ID-05: Mutual Friends** 🔍
  - View "Mutual Friends" and receive "People You May Know" suggestions.
- **UC-ID-06: Block** 🚫
  - Block users to prevent visibility and interaction.
- **UC-ID-07: Privacy** 👁️
  - Set profile/post visibility (Public, Friends-only, Private).

---

### 📸 3. SOCIAL CONTENT & DISCOVERY (Social Service)

- **UC-SO-01: Multi-modal Posting** 📤
  - Create posts with text, images, or video.
- **UC-SO-02: Post Management** 🛠️
  - Edit or Delete own posts; restore from "Recently Deleted" within 30 days.
- **UC-SO-03: Content Sharing** 🔄
  - Share another user's post to your feed with an optional caption.
- **UC-SO-04: Emoji Reactions** ❤️
  - React to posts with a variety of emojis.
- **UC-SO-05: Threaded Comments** 💬
  - Comment on posts with nested reply support.
- **UC-SO-06: Saved Posts** 🔖
  - Save posts from other users to a personal saved posts list for later viewing.
- **UC-SO-07: Global Search** 🔍
  - Search across Users, Posts, and Hashtags.
- **UC-SO-08: Content Reporting** 🚩
  - Users can report posts, comments, or profiles for moderation.
- **UC-SO-09: Media Management** 🖼️
  - Upload/Delete media assets; auto-generate optimized Cloudinary URLs.

---

### ⚡ 4. REAL-TIME COMMUNICATION (Social Service)

- **UC-RT-01: Private 1-on-1 Chat** 📥
  - Secure real-time messaging between two users.
- **UC-RT-02: Community Group Chat** 👥
  - Create group chat and manage membership.
- **UC-RT-03: Group Roles & Permissions** 👑
  - Distinct roles: **Owner**, **Admin**, and **Member**.
- **UC-RT-04: Group Administration** 🛡️
  - Promote members to Admin, remove members, or transfer ownership.
- **UC-RT-05: Multimedia Messaging** 🖼️
  - Send photos and videos directly within chat threads.
- **UC-RT-06: Typing & Delivery Status** ✅
  - See "Typing..." indicators and Sent/Delivered/Read status.
- **UC-RT-07: Presence Tracking** 🟢
  - Real-time online/offline status tracking via WebSocket sessions.

---

### 🔔 5. NOTIFICATION ENGINE (Notification Service)

- **UC-NT-01: Event Triggers** 📢
  - Real-time alerts for social interactions (likes, shares, reports).
- **UC-NT-02: Connectivity Alerts** 🔔
  - Instant alerts for friend requests and group activities.
- **UC-NT-03: Inbox Management** 📥
  - View historical notifications and manage "Read" status.
- **UC-NT-04: Delivery Preferences** ⚙️
  - Customize alert channels (Push vs. In-app).

---

### 🏛️ 6. ADMIN & PLATFORM ANALYTICS (Admin Role)

- **UC-AD-01: System Health Dashboard** 📊
  - Monitor service uptime, response latencies, and error rates.
- **UC-AD-02: Live Traffic Monitoring** 🕵️
  - View real-time active users and concurrent connections.
- **UC-AD-03: User Analytics** 📈
  - Track Total Users, DAU (Daily Active Users), and new registrations.
- **UC-AD-06: Identity Governance** 🚫
  - Suspend/Ban users and manage global system roles.

---

### 🧬 7. CROSS-SERVICE INTEGRATION (Under-the-hood)

- **UC-INT-01: Unified Authentication** 🔗
  - Gateway-level security validation for all incoming requests.
- **UC-INT-02: Event-Driven Architecture** 🔄
  - Asynchronous state syncing between services via Kafka.
- **UC-INT-03: Distributed Fault Tolerance** 🔌
  - Circuit-breaking for reliable service-to-service communication.
