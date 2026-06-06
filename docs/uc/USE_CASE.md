# 📝 Kirenz Platform - Full Use Case Catalog

*Note: This list is optimized for team sharing and Slack communication.*

---

### 👤 1. IDENTITY & RELATIONSHIP SERVICE (Identity Service)
*Owner: Identity Service owns all User identity, Friendship connectivity, Privacy, and Blocking data.*

- **UC-ID-01: User Onboarding** 🆕
  - Register new account with email validation.
- **UC-ID-02: Secure Access** 🔐
  - Login/Logout using JWT stateless authentication.
- **UC-ID-03: Profile Customization** 🎨
  - Manage bio, display name, and avatars.
- **UC-ID-04: User Presence** 🟢
  - Auto-track online/offline status for all users.
- **UC-ID-05: Friendship Lifecycle** 🤝
  - Send, Accept, Decline, and Cancel friend requests.
- **UC-ID-06: Social Graph Connectivity** 🔍
  - View "Mutual Friends" and receive "People You May Know" suggestions.
- **UC-ID-07: Privacy & Visibility** 👁️
  - Set profile/post visibility (Public, Friends-only, Private).
- **UC-ID-08: Defensive Controls** 🚫
  - Block users to prevent visibility and interaction.
- **UC-ID-09: Account Governance** 🔑
  - Manage active sessions or deactivate account.

---

### 📸 2. SOCIAL CONTENT & DISCOVERY (Social Service)

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
- **UC-SO-06: Content Bookmarking** 🔖
  - Save posts to a personal "Read Later" collection.
- **UC-SO-07: Global Search** 🔍
  - Search across Users, Posts, and Hashtags.
- **UC-SO-08: Content Reporting** 🚩
  - Users can report posts, comments, or profiles for moderation.
- **UC-SO-09: Media Management** 🖼️
  - Upload/Delete media assets; auto-generate optimized Cloudinary URLs.

---

### ⚡ 3. REAL-TIME COMMUNICATION (Social Service)

- **UC-RT-01: Private 1-on-1 Chat** 📥
  - Secure real-time messaging between two users.
- **UC-RT-02: Community Group Chat** 👥
  - Create groups and manage membership.
- **UC-RT-03: Group Roles & Permissions** 👑
  - Distinct roles: **Owner**, **Admin**, and **Member**.
- **UC-RT-04: Group Administration** 🛡️
  - Promote members to Admin, remove members, or transfer ownership.
- **UC-RT-05: Multimedia Messaging** 🖼️
  - Send photos and videos directly within chat threads.
- **UC-RT-06: Typing & Delivery Status** ✅
  - See "Typing..." indicators and Sent/Delivered/Read status.

---

### 🔔 4. NOTIFICATION ENGINE (Social Service)

- **UC-NT-01: Event Triggers** 📢
  - Real-time alerts for social interactions (likes, shares, reports).
- **UC-NT-02: Connectivity Alerts** 🔔
  - Instant alerts for friend requests and group activities.
- **UC-NT-03: Inbox Management** 📥
  - View historical notifications and manage "Read" status.
- **UC-NT-04: Delivery Preferences** ⚙️
  - Customize alert channels (Push vs. In-app).

---

### 🏛️ 5. ADMIN & PLATFORM ANALYTICS (Admin Role)

- **UC-AD-01: System Health Dashboard** 📊
  - Monitor service uptime, response latencies, and error rates.
- **UC-AD-02: Live Traffic Monitoring** 🕵️
  - View real-time active users and concurrent connections.
- **UC-AD-03: User Analytics** 📈
  - Track Total Users, DAU (Daily Active Users), and new registrations.
- **UC-AD-04: Engagement Metrics** 🔥
  - Identify top trending posts and most active community members.
- **UC-AD-05: Content Moderation Hub** 🛡️
  - Process user reports; flag, hide, or delete violating content.
- **UC-AD-06: Identity Governance** 🚫
  - Suspend/Ban users and manage global system roles.

---

### 🧬 6. CROSS-SERVICE INTEGRATION (Under-the-hood)

- **UC-INT-01: Unified Authentication** 🔗
  - Gateway-level security validation for all incoming requests.
- **UC-INT-02: Event-Driven Architecture** 🔄
  - Asynchronous state syncing between services via RabbitMQ.
- **UC-INT-03: Distributed Fault Tolerance** 🔌
  - Circuit-breaking for reliable service-to-service communication.
