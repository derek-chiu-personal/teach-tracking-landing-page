# 📋 Database Backlog: IEP Manager Landing Page
**Project:** IEP Manager Lead Intelligence

*Focus: Data Persistence, Attribution, and Engagement Tracking*

---

## 1. Core Lead Capture (The "Identity" Epic)

### User Story #1: Basic Lead Ingestion
**As a** Marketing Manager
**I want** to store a visitor's name, email, and school district information
**So that** I have a record of who is interested in the product for manual or automated follow-up.

#### Acceptance Criteria
- Create `leads` table with a unique constraint on the **email** field.
- Implement `user_role` as an ENUM (`Admin`, `Teacher`, etc.) to ensure data consistency.
- Generate a UUID for every new lead to prevent predictable ID scanning.
- Capture `created_at` and `updated_at` timestamps automatically.

---

## 2. Marketing Attribution (The "SEO" Epic)

### User Story #2: Traffic Source Tracking
**As a** Growth Lead
**I want** to capture UTM parameters and referrer URLs when a lead signs up
**So that** I can identify which SEO keywords or social posts are driving the highest quality demo bookings.

#### Acceptance Criteria
- Create `sessions` table linked to `leads` via `lead_id`.
- Capture `utm_source`, `utm_medium`, and `utm_campaign` from the URL.
- Store the `referrer_url` to see which external sites are sending traffic.
- Store the `landing_page_url` to support future A/B testing on different page variants.

---

## 3. Engagement Analytics (The "Video" Epic)

### User Story #3: Video Engagement "Heartbeat"
**As a** Product Owner
**I want** to track how much of the demo video a lead watches
**So that** I can identify which features (e.g., automated compliance) generate the most interest and where people drop off.

#### Acceptance Criteria
- Include a `completed` boolean flag (triggered at **>90%** watch time).

### User Story #4: In-Video CTA Tracking
**As a** Salesperson
**I want** to know if a lead clicked the “Book Demo” button while watching the video
**So that** I can gauge their level of “hotness” before the call.

#### Acceptance Criteria
- Add a boolean `clicked_cta_in_video` to the `video_analytics` table.
- Ensure the record updates if a user watches the video across multiple sittings (upsert logic).

---

## 4. Conversion Sync (The "Booking" Epic)

### User Story #5: Meeting Schedule Integration
**As a** Founder
**I want** to link a Cal.com/Calendly booking event to an existing lead record
**So that** I have a unified timeline of the user's journey from “Search” to “Meeting.”

#### Acceptance Criteria
- Create `demo_bookings` table linked to `leads`.
- Implement `booking_status` ENUM (`scheduled`, `completed`, `no_show`).
- Store the `scheduled_at` timestamp and the `meeting_link`.
- Provide a `notes_from_user` text field to capture specific pain points entered during booking.

---

## 5. Security & Maintenance (The "Integrity" Epic)

### User Story #6: Lead Privacy & Audit Trail
**As a** Compliance Officer
**I want** to ensure all lead data is timestamped and identifiable
**So that** we remain compliant with data handling best practices in the EdTech space.

#### Acceptance Criteria
- Ensure no PII (Personally Identifiable Information) is logged in plaintext in the `sessions` table (e.g., IP addresses should be anonymized if required by future GDPR/FERPA rules).
- Implement a **soft-delete** or status flag if a lead requests to be removed from the list.





Technical Context of the change is here

CREATE TYPE user_role AS ENUM ('Administrator', 'Special Ed Coordinator', 'Teacher', 'IT/Operations', 'Other');

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    job_title user_role NOT NULL,
    district_name TEXT NOT NULL,
    school_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    utm_source TEXT,      -- e.g., 'google'
    utm_medium TEXT,      -- e.g., 'organic'
    utm_campaign TEXT,    -- e.g., 'iep_compliance_2026'
    referrer_url TEXT,
    landing_page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE video_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    video_id TEXT NOT NULL,
    watch_duration_seconds INTEGER, -- How long they stayed
    completed BOOLEAN DEFAULT FALSE,
    milestone_reached TEXT,         -- e.g., 'compliance_feature_shown'
    clicked_cta_in_video BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE booking_status AS ENUM ('scheduled', 'completed', 'no_show', 'cancelled');

CREATE TABLE demo_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status booking_status DEFAULT 'scheduled',
    meeting_link TEXT,
    notes_from_user TEXT,           -- Any specific pain points they mentioned in the form
    created_at TIMESTAMPTZ DEFAULT NOW()
);

