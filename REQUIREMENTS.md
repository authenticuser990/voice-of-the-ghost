# Voice of the Ghost (VotG) — Platform Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** 2026-07-07  
> **Status:** Draft  
> **Author:** [Your Name]  
> **License:** This Requirements Document is provided “as-is” under the original project’s open-source terms.

---

## 1. Executive Summary

**Project Identity:** A judgment-free social platform built for people who feel unheard. By pairing Help Seekers with compassionate listeners (Sages), VotG creates a safe space for emotional expression, peer support, and community-driven healing.

**Mission Statement:** “No one should feel alone when they need to be heard.”

**Problem / Opportunity:** Modern social media prioritizes performance and virality, leaving people with mental health struggles, addiction, or emotional pain without a safe outlet. Existing platforms lack nuanced support for uncensored discussion (psychological, not violent) and peer-to-peer accountability. VotG bridges this gap by combining anonymity, role-based support, and flexible community structures.

**Proposed Solution:** A Progressive Web App (PWA) where users can share experiences anonymously, find support through structured roles (Sage and Help Seeker), and join or create specialized communities for deeper connection.

**Target Platforms:**
- **Web (PWA):** Responsive across mobile and desktop, installable on any device.
- **Future Consideration:** Native mobile apps (iOS/Android) can be built using the same backend API once the PWA is stable.

**Tech Philosophy:** Fully free, fully open-source. No licensing fees, no proprietary dependencies. All core components will be built using freely available tools and frameworks.

---

## 2. Goals and Objectives

| Objective | Description | Success Criteria |
| :------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Peer Support** | Enable real-time, balanced interaction between Sages and Help Seekers using structured roles and accountability. | >80% of active users engage in at least one interaction per week. |
| **Safe Expression** | Provide a configurable experience where users control the level of content they see, including opt-in uncensored spaces. | User reporting of “feeling safe” >90% via in-app feedback SOURCES. |
| **Community Building** | Allow users to discover, create, and manage public, private, and uncensored communities with robust moderation. | >50% of active users join at least two communities by Day 30. |
| **Accountability** | Allow Sages to take ownership of a Help Seeker’s progress via scheduled check-ins, managed through the app’s native tools. | Successful check-ins tracked and visible in user dashboard. |
| **Accessibility** | Ensure the app is usable and intuitive on both mobile and desktop with zero cost for storage, bandwidth, or compute. | Lighthouse audit showing Accessibility score of ≥95. |

---

## 3. Target Audience and User Personas

### Persona 1: The Sage (Listener)
- **Name & Role:** Alex, a trained social care volunteer and empathetic individual.
- **Pain Points:** Wants to help but lacks a structured platform to find people in need without being overwhelmed. Existing platforms are either too generic or too clinical.
- **Needs:**
  - Clear role definition and boundaries.
  - Tools for mentorship and accountability.
  - Ability to connect casually while maintaining a helpful stance.
  - Control over which conversations they engage in.

### Persona 2: The Help Seeker
- **Name & Role:** Sam, a university student struggling with pornography addiction, anxiety, and isolation.
- **Pain Points:** Feels judged on mainstream platforms; needs a space that understands nuanced, sensitive issues without censorship.
- **Needs:**
  - Anonymity to be open without fear.
  - Easy categorization of emotional states.
  - Access to both peer support and professional-level advice.
  - Structured venting options for immediate relief.

### Persona 3: The Community Curator
- **Name & Role:** Jordan, a mental health advocate.
- **Pain Points:** Mainstream social media does not allow the formation of tightly knit, moderated, or uncensored support spaces.
- **Needs:**
  - Private, invite-only, or approval-based community creation.
  - Granular control over content and member safety.
  - Tools to prevent burnout (sub-admin moderation).

---

## 4. Functional Requirements

### 4.1 User Authentication & Onboarding

| Priority | Requirement | Description |
| :------- | :------------------------------- | --------------------------------------------------------------------------------------------------- |
| P0 | **Unique Username** | Each user must choose a unique, unambiguous username (case insensitive). |
| P0 | **Role Selection** | Users select a primary role during onboarding: `Sage`, `Help Seeker`, or `Both`. |
| P1 | **Re-authentication** | Users can switch their primary role after a cool-down period or approval. |
| P1 | **Profile Data** | Include sections for Interests, Personality, and Sub-Interests (e.g., Music > Jazz > Miles Davis). |
| P1 | **Anonymous Posting** | The app must allow users to create posts without revealing their main username. |

### 4.2 User Roles & Permissions

1. **Sage (Listener & Advisor)**
   - **Permissions:**
     - Initiate and accept conversations with Help Seekers.
     - Assign themselves as an “Accountability Partner” to a Help Seeker.
     - Post in all public and private communities they are part of.
     - Use `everyone` only if granted by a community admin.
   - **Restrictions:** Cannot post publicly as a Sage without mandatory role badge visible.
   - **Accountability:** Must conduct a “Wellness Check-in” every 7 days for active accountability assignments.

2. **Help Seeker (User requiring support)**
   - **Permissions:**
     - Create posts with categories, tags, and emotional flags.
     - Send Direct Messages (DMs) to Sages who are accepting new connections.
     - Create and join communities.
   - **Restrictions:** Encouraged (but not required) to verify identity to increase trust score with Sages.

### 4.3 Profile Management

| Feature | Details |
| :--------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Profile Fields** | Unique username (cannot be changed), Display name, Bio, Location (optional), Profile Picture, Personality types, Interests, Sub-interests. |
| **Account Management** | Multi-account switching, Profile visibility (Public / Friends / Private). |
| **Account Deletion** | Requires typing the word `“delete”` into a confirmation field. A clear warning must state all data, including communities and messages, is irreversibly removed. |
| **Role Badge** | Visible `Sage` or `Help Seeker` badge on profiles and posts. |

### 4.4 Posting & Content

#### 4.4.1 Post Creation
- **Title & Body:** Users must be able to write long-form body text with no character limit.
- **Category (Required):**
  - `Mental Health`
  - `Friends`
  - `Loneliness and Left out`
  - `Broken Hearted`
  - `Bullied`
  - `Harassed`
  - `Self Harm`
  - `Joy`
  - `Others`
- **Emotion Tags (Required):** Users select an emotional state from a predefined list (e.g., 😊 Happy, 😐 Calm, 😭 Sad, 😫 Depressed).
- **Vent Tag:** If selected, the post immediately redirects to the dedicated **Vent Section** and bypasses the main Home Feed.
- **Anonymity Toggle:** Posts can be submitted under a random, one-time pseudonym (e.g., `Ghost_123`) if the user chooses anonymity.
- **Post Lifecycle:** Users can **Edit** or **Delete** their own posts at any time.
- **Media:** Users can attach text, images, and short video clips.

#### 4.4.2 Home Feed
A modular feed with distinct sections, toggled by a top-segment button:

| Section | Description |
| :--------------- | ----------------------------------------------------------------------------------------------- |
| **Posts** | Main feed of text, images, and videos from followed users and communities. Only shows uncensored content if the user toggles this on in Settings. |
| **Reels** | Vertical-scrolling short-form video content (distinct from standard posts). |
| **My Followers** | Filtered feed showing only content from accounts the user follows. |
| **Vent** | A dedicated, ephemeral space for short, anonymous, and uncensored emotional release (the `Vent` post tag). |

### 4.5 Community System

#### 4.5.1 Types of Communities
Users can create communities with the following visibility and content settings:

- **Public:** Open to all. No joining restrictions.
- **Private:** Join by invitation or admin/sub-admin approval.
- **Public Uncensored (NSFW):** Open to all, but content will not be visible without a global account toggle (`Show Uncensored`).
- **Private Uncensored (NSFW):** Closed access with approval-based joining around sensitive, uncensored topics (addiction, self-harm support, etc.).

#### 4.5.2 Community Creation
- **Required Fields:** Name, Description, Rules / Guidelines.
- **Tags (2):**
  1. **Access:** `Public` or `Private`
  2. **Content Rating:** `SFW` (Safe For Work) or `NSFW` (Not Safe For Work / Uncensored)
- **Content Rules for NSFW:**
  - **No censorship** on specific keywords (e.g., `suicide`, `self-harm`, `addiction`).
  - **Strict Prohibition:** Content advocating violence, murder, or illegal activities is **strictly forbidden** and enforceable by moderation tools and takedown logic.
- **Administration:**
  - **Admin:** The community creator. Has full control.
  - **Sub-Admin:** Appointed by the Admin. Can approve/reject join requests for private communities, moderate posts, and use `everyone`.

#### 4.5.3 Community Joining
- **Public Communities:** Join immediately via a button.
- **Private Communities:**
  - Display a dedicated “Private Community” landing page.
  - Show a `Request to Join` button.
  - **Approval Workflow:**
    - If approved: User receives a push/in-app notification: *“Admin approved your request to join [Community Name].”*
    - If rejected: User receives a message: *“Sorry, your request to join [Community Name] was not approved.”*
- **Leave Community:** Any member can leave a community at any time.

### 4.6 Messaging, Mentions, and Notifications

#### 4.6.1 Messaging & File Sharing
- Enabled within all communities (public and private) and direct messages (DMs).
- **Supported File Types:**
  - **Images:** All standard formats (JPEG, PNG, WebP)
  - **Videos:** MP4 only.
  - **Documents:** PDF, DOCX, and MD (Markdown).

#### 4.6.2 Mentions
- **Individual Mentions:** Any user can mention another user using the ` symbol (e.g., `alex_the_sage`).
- **Global Mentions (`everyone`):**
  - **Restricted to Admin/Sub-Admin by default** for private communities.
  - **Granular Control:** Admin can enable/disable the `everyone` privilege for regular members.

#### 4.6.3 Notification System
- **In-App:** Stored in a dedicated notification center.
- **Push Notifications:** For approved join requests, new DM, new mentions, and new followers.
- **Muting & Duration:** Users can customize their notification experience per community:
  - **Mute Options:**
    1. `Mute All Notifications`
    2. `Mute Only Mentions`
    3. `Mute `everyone` notifications`
    4. `Get only mentions notifications`
    5. `Get all notifications`
  - **Mute Durations:** `1 hour`, `8 hours`, `1 day`, `1 week`, `1 month`, `Forever`.

### 4.7 Settings

| Section | Features |
| :------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Theme** | Toggle between Light and Dark modes. |
| **Manage Accounts** | Add and remove multiple accounts. Switch between profiles. |
| **Delete Account** | Type `delete` into a confirmation field, with a full warning about irreversible data loss. |
| **Content Filters** | **`Show Uncensored`**: Global account toggle. When active, reveals NSFW/Uncensored posts in the Home Feed and enables access to NSFW communities. Hidden by default. |
| **Notifications** | Toggle for Posts, Communities, and Following. |
| **About & Legal** | App version, tools/libraries, Privacy Policy, Terms of Service. |

---

## 5. Non-Functional Requirements

### 5.1 Performance & Scalability
- **Load Time:** Initial page load must not exceed 2-3 seconds on a 3G network.
- **Responsiveness:** Interface must be fluid on both mobile (< 5.5" screen) and desktop (> 1080p) viewports.
- **Media Scaling:** Images and videos must be compressed and served via a CDN or proxy.
- **Database:** Scalable to handle thousands of concurrent users and real-time messaging.

### 5.2 Security & Privacy
- **Data Encryption:** All communication (API, WebSocket, chat) must use **TLS/SSL**.
- **Authentication:** Passwords must be hashed using **bcrypt** with a salt of at least 10 rounds.
- **Anonymity:** Anonymous posts must be identifiable by the system (for moderation) but must never expose the real username to other users.
- **Sensitive Data:** Community join requests, DMs, and uncensored content must be restricted by the server and not rely solely on client-side hiding.
- **Rate Limiting:** Apply strict rate limiting for post creation, messaging, file uploads, and joining communities to prevent abuse.

### 5.3 Accessibility
- **Compliance:** Adhere to WCAG 2.1 Level AA standards.
- **Visual:** Support for high contrast modes and scalable fonts.
- **Interaction:** All core features must be fully accessible via screen readers and keyboard navigation.

### 5.4 Availability & Reliability
- **Uptime Target:** 99.9% uptime for the production environment.
- **Data Backup:** Daily automated backups for the user database, messages, and media metadata.
- **Graceful Degradation:** If real-time chat is down, the app must fall back to standard REST API polling to ensure users can still read messages.

---

## 6. UI/UX Design Requirements

### 6.1 Navigation Structure
The application will feature a **persistent bottom navigation bar** to maximize screen real estate on mobile, while adapting to a side/top bar on desktop.

| Bottom Tab | Icon | Destination |
| :--------- | :------------------- | :------------------- |
| `Dms` | Chat/Message | Direct Messages inbox. |
| `Communities` | Group/People | List of all joined and discoverable communities. |
| `Settings` | Gear/Settings | User account, preferences, and app configuration. |

(Note: `Home`, `Profile`, and `Create Post` are accessed via the main header or floating action buttons.)

### 6.2 Core Page Flows
1. **Authentication Flow:** Welcome Screen > Role Selection > Username/Form > Home Feed.
2. **Posting Flow:** Home Feed > Create Post Button > Compose Screen (Title, Body, Category, Emotion, Anon Toggle) > Publish > Feed refresh.
3. **Vent Flow:** Anywhere > "Need to Vent" button > Anonymous Compose > Vent Section.
4. **Community Join Flow:** Community List > Click Community > (If Public: Auto-Join | If Private: Request Screen) > Approval Status > Community Chat.

### 6.3 Design Principles
- **Calm & Muted:** Typography and colors should be soft, avoiding anxiety-inducing bright reds or harsh contrasts.
- **Safety-First:** After a user posts something tagged with `Self-Harm`, an optional, non-intrusive banner with recommended resources should appear (configurable in settings).
- **Responsiveness:** The app must fluidly handle layout changes from mobile portrait to desktop widescreen using a fluid grid system (CSS Grid / Flexbox).

---

## 7. Technical Requirements

### 7.1 Free & Open-Source Architecture
The platform will be built entirely on a **100% free and open-source (F/OSS)** stack to ensure self-hostability, zero licensing costs, and community contribution potential.

### 7.2 Proposed Tech Stack

#### Frontend
| Layer | Technology | Rationale |
| :---------------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| **Framework** | React 19 | Industry standard; you already have a Vite scaffold. |
| **Styling** | Tailwind CSS | Rapid development, utility-first, highly responsive across devices. |
| **State Management** | Zustand / Redux Toolkit | Lightweight, unopinionated, and simple to debug. |
| **PWA** | Vite PWA Plugin | Transforms the current Vite scaffold into an installable PWA for mobile/desktop. |
| **Build Tool** | Vite | Extremely fast HMR and optimized bundling out of the box. |

#### Backend
| Layer | Technology | Rationale |
| :---------------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| **Language** | TypeScript | Type safety for a complex API, widely supported by the open-source ecosystem. |
| **Runtime** | Node.js | Matches the frontend build chain; massive ecosystem. |
| **Framework** | Express.js / NestJS | Express for rapid prototyping; NestJS for large-scale, structured apps. |
| **API Style** | REST | Industry standard for the primary API; clear and cacheable. |
| **Real-time** | Socket.io | Handles real-time chat, presence, and live notifications with auto-fallback to polling. |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt | Stateless auth, easy to scale, perfectly suited for APIs and microservices. |

#### Database & Storage
| Layer | Technology | Rationale |
| :---------------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| **Database** | PostgreSQL | The gold standard for SQL. Relational data fits your User > Community > Post model perfectly. You can host this for free on **Neon** or **Supabase**. |
| **ORM** | Prisma / Drizzle | Excellent developer experience and type-safe database queries for Node.js. |
| **File Storage** | Local (MinIO) / Cloudinary | **MinIO** is a free, open-source alternative to AWS S3 for self-hosted media. **Cloudinary**, while using a free tier, is not open-source and should be avoided if strict F/OSS is required. |

#### Infrastructure
| Layer | Technology | Rationale |
| :---------------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| **Version Control** | Git (GitHub / GitLab) | Free, open-source, and standard for global collaboration. |
| **CI / CD** | GitHub Actions / GitLab CI | Free, managed runners for open-source projects. |
| **Hosting (Frontend)** | Netlify / Vercel | Free tiers are generous, easy to deploy via Git. |
| **Hosting (Backend)** | Render / Railway / Fly.io | Generous free tiers for Node.js backends. Great for bootstrapping. |

### 7.3 Free Database Hosting
To keep the project completely free, use the following free tiers for the database:
- **Neon:** Serverless PostgreSQL with a generous free tier.
- **Supabase:** PostgreSQL + auto-generated APIs, also with a generous free tier.

---

## 8. Development Roadmap

### Phase 1: Core Foundation (Weeks 1-3)
- [ ] Initialize `frontend` (Vite + React + Tailwind) and `backend` (Node.js + Express) projects.
- [ ] Set up the **PostgreSQL** database on a free tier (Neon).
- [ ] Define the database schema (Users, Posts, Communities, Members).
- [ ] Implement unique username validation and user registration.
- [ ] Implement **Role Selection** on the onboarding screen.
- [ ] Build the **Alexandar** profile page with editable fields.

### Phase 2: Content & Communities (Weeks 4-6)
- [ ] Build core **CRUD** for posts (Create, Read, Update, Delete).
- [ ] Implement the **Category** and **Emotion** selection for posts.
- [ ] Implement the **Anonymous** posting logic.
- [ ] Build the **Home Feed** and the **Vent Section** (separating vent posts from the main feed).
- [ ] Implement **Community Creation** (Name, Description, Rules, Public/Private, SFW/NSFW tags).
- [ ] Implement **Private Community** joining with the approval system (Admin/Sub-Admin).

### Phase 3: Interaction & Communication (Weeks 7-9)
- [ ] Set up **Socket.io** for real-time chat within communities.
- [ ] Implement the **Mentions** system (`user`, `everyone`) with privilege control.
- [ ] Build the **DM system** (Direct Messages) outside of communities.
- [ ] Implement the **File Sharing** feature (Images, PDF, DOCX, MD, MP4).

### Phase 4: Notifications & Polish (Week 10-12)
- [ ] Build the **Notification Center** (in-app storage of all events).
- [ ] Implement **Muting** (with duration) and the granular notification settings.
- [ ] Build the **PWA** configuration (making it installable on mobile/desktop with offline fallback).
- [ ] Implement **Settings** (Theme, Delete Account, Content Filters, Notification toggles).
- [ ] Write the `Privacy Policy` and `Terms of Service`.

### Phase 5: Testing, QA, & Launch (Week 13-14)
- [ ] Perform thorough security audits (injection, rate-limiting, access control).
- [ ] Run accessibility audits using WAVE and axe DevTools.
- [ ] Load testing with `k6` or `artillery`.
- [ ] Soft launch to a small group of users for feedback.

---

## 9. Maintenance and Maintenance Opportunities

### 9.1 Security & Compliance
- **Monthly:** Review and rotate backend secrets, JWT tokens, and API keys.
- **Quarterly:** Review community rules and ensure content moderation tooling covers new edge cases.
- **Ongoing:** Moderation queue for reported posts and flagged messages.

### 9.2 Feature Prioritization Matrix (MoSCoW)

| Must Have (P0) | Should Have (P1) | Could Have (P2) |
| :--------------------------------------------------------------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| User sign-up, role selection, profile | Group chat / DMs in communities | Full-fledged video chat |
| Post creation (text/image/video) | Reels section | AI chatbot / moderation |
| Community creation (public/private) | Dark Mode | Custom community themes |
| Real-time chat | Push notifications for web (via `web-push`) | Gamification / Badges |

---

## 10. Appendices

### Appendix A: Database Schema (High-Level)
1. **users:** `id`, `username`, `display_name`, `role`, `email`, `password_hash`, `created_at`
2. **profiles:** `user_id`, `bio`, `personality`, `interests[]`, `sub_interests[]`
3. **posts:** `id`, `user_id` (nullable for anon), `title`, `body`, `category`, `emotion`, `is_vent`, `is_anomymous`, `created_at`
4. **communities:** `id`, `name`, `description`, `rules`, `visibility`, `content_rating`, `admin_id`, `created_at`
5. **community_members:** `community_id`, `user_id`, `role` (member/sub-admin/admin), `joined_at`
6. **community_join_requests:** `community_id`, `user_id`, `status` (pending/approved/rejected), `requested_at`
7. **messages:** `id`, `community_id` (or `dm_id`), `sender_id`, `content`, `file_url`, `created_at`
8. **notifications:** `id`, `user_id`, `type`, `reference_id`, `is_read`, `created_at`

### Appendix B: Open Source Tech Stack Summary
- **Frontend:** React, Tailwind CSS, Zustand, Vite PWA Plugin
- **Backend:** Node.js, Express/NestJS, TypeScript
- **Database:** PostgreSQL (hosted on Neon or Supabase), Prisma ORM
- **Real-time:** Socket.io
- **Authentication:** JWT, bcrypt
- **Storage:** MinIO (Self-hosted S3), Multer
- **Hosting:** Netlify (Frontend), Render (Backend)