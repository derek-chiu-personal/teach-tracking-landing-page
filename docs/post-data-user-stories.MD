# 📋 Post-Migration Backlog: Functional Implementation

## Epic 1: The "Smart" Lead Capture (Frontend + API) ✅ COMPLETED

### User Story #1: UTM & Referrer Persistence
**As a** Developer
**I want** to extract UTM parameters from the URL and store them in the browser's `sessionStorage`
**So that** even if the user navigates around the landing page before signing up, I don't lose their attribution data.

#### Acceptance Criteria
- [x] Create a `useAttribution` hook in React.
- [x] Logic captures `utm_source`, `utm_medium`, `utm_campaign`, and `referrer`.
- [x] Data is passed as hidden fields (or directly via the API) when the leads form is submitted.

### User Story #2: Lead Creation API Route
**As a** System
**I want** to provide a secure Next.js API route (`/api/leads`) to handle form submissions
**So that** I can validate the data with Zod before inserting it into the `leads` and `sessions` tables.

#### Acceptance Criteria
- [x] Endpoint validates that the email is a valid format.
- [x] On success, it creates a record in `leads` and a corresponding record in `sessions` using a transaction (to ensure both happen or neither does).
- [x] Returns the `lead_id` to the frontend for use in video tracking.

**Notes:**
- Ghost ID implementation added: Anonymous users are tracked via localStorage ghost_id
- On form submission, ghost_id promotes all video/session data to real lead

## Epic 2: The Video Engagement Engine ✅ COMPLETED

### User Story #3: Video "Heartbeat" Tracking
**As a** Product Owner
**I want** to send an update to the database every 10 seconds while a user is watching the demo video
**So that** I have accurate `watch_duration_seconds` even if they close the tab abruptly.

#### Acceptance Criteria
- [x] Implement a `useEffect` or a custom hook that pings `/api/video-progress`.
- [x] The API updates the `video_analytics` table using an upsert (update if exists, insert if not) based on the `lead_id`.
- [x] Tracking stops when the video is paused or the component unmounts.

### User Story #4: Dynamic Milestone Trigger
**As a** Marketer
**I want** to update the `milestone_reached` field when the user hits specific timestamps in the video (e.g., 0:30 for "Compliance", 1:15 for "Collaboration")
**So that** I can personalize my follow-up emails based on what they actually saw.

#### Acceptance Criteria
- [x] Frontend monitors the `currentTime` of the video player.
- [x] Triggers an API call to update the `milestone_reached` string in the DB when crossing pre-defined thresholds.

**Notes:**
- Milestones: 30s (compliance), 75s (collaboration), 120s (automation)
- Completion threshold: 90% watch time

## Epic 3: The Conversion Handshake ✅ COMPLETED

### User Story #5: Scheduling Webhook Integration
**As a** Salesperson
**I want** to automatically update the `demo_bookings` table when a user picks a time on the embedded calendar
**So that** I don't have to manually match calendar invites to lead records.

#### Acceptance Criteria
- [x] Set up a Webhook receiver (`/api/webhooks/calendar`).
- [x] Match the email from the calendar event to the email in the `leads` table.
- [x] Create the `demo_bookings` record with a status of scheduled.

**Notes:**
- HMAC SHA-256 signature verification implemented
- Auto-creates lead if email not found (captures "mystery" bookings)
- Supports Cal.com events: booking_created, booking_completed, booking_cancelled, booking_no_show
- Deduplication via calendar_event_id

## Epic 4: SEO & Technical Performance ✅ COMPLETED

### User Story #6: Dynamic Metadata Injection
**As an** SEO Specialist
**I want** to use the Next.js `generateMetadata` function to inject the "Intelligent IEP Management" keywords into the page's `<head>`
**So that** search engines index the mission statement and core value props correctly.

#### Acceptance Criteria
- [x] `title` and `description` are optimized for the "Modern School District" keywords.
- [x] OpenGraph (OG) tags are configured so the link looks professional when shared on LinkedIn or via email.

**Notes:**
- JSON-LD structured data added (SoftwareApplication + Organization)
- Tailwind CSS v4 configured
- robots.txt and sitemap.xml generated