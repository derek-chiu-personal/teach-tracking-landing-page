# PRD: IEP Manager Mission & Demo Landing Page

**Status:** Draft | **Version:** 1.0 | **Date:** Feb 2026
**Target Stack:** Next.js 15+, Tailwind CSS, Framer Motion

---

## 1. Product Vision & Goals
The objective is to create a high-authority entry point for school district decision-makers. We are moving the narrative from "compliance software" to "intelligent student success platforms."

### Primary Goals:
* **Authority:** Establish the brand as a leader in *Intelligent IEP Management*.
* **Education:** Use a video-first approach to show, not tell, the product's value.
* **Conversion:** Capture high-intent leads via a demo scheduling funnel.
* **SEO:** Rank for modern special education administrative keywords.

---

## 2. Target Personas
1.  **Special Education Directors:** Focused on district-wide compliance and reducing litigation risk.
2.  **Case Managers/Teachers:** Focused on reducing "paperwork burnout" and reclaiming time for instruction.
3.  **IT/Innovation Leads:** Focused on modern, secure, and easy-to-integrate SaaS stacks.

---

## 3. User Journey & Funnel
**Entry Point:** Organic Search (SEO) / Social / Direct
  ↓
**The Hook:** Hero section with Mission Statement (Emotional Resonance)
  ↓
**The Proof:** System Overview — "How TeachTracker Works in Practice" (replaces vision demo; see `docs/system-overview-user-story.MD`)
  ↓
**The Action:** Integrated Scheduler (Cal.com/Calendly)
  ↓
**Post-Action:** Automated "Success" email with a PDF "District Implementation Guide."

---

## 4. Functional Requirements

### 4.1 Global SEO & Performance
* **Server-Side Rendering (SSR):** Must use Next.js App Router for optimal indexability.
* **Metadata API:** Dynamic Title/Meta tags for every "Feature" section.
* **Web Vitals:** Must score 90+ on Lighthouse (LCP < 2.5s).

### 4.2 Hero Section (Mission-Centric)
* **Headline:** "Intelligent IEP Management for Modern School Districts."
* **Sub-headline:** "Deliver compliant, collaborative, and data-driven student plans at scale — empowering educators and parents with clarity and confidence."
* **Primary CTA:** "See How It Works" (Scrolls to System Overview section).

### 4.3 System Overview (replaces Vision Demo)
* **Content:** "How TeachTracker Works in Practice" — Sarah persona, four steps (Structured IEP Creation, Automated Safeguards & Deadlines, Unified Collaboration, District-Level Intelligence). Source: `docs/system-overview-user-story.MD`.
* **Optional:** Video module may be retained or removed; overlay CTA (e.g. "Schedule Full Demo") can be tied to this section instead.

### 4.4 Lead Capture & Scheduling
* **Two-Step Flow:**
    1. Simple Form (Name, Work Email, District).
    2. Calendar Embed (Triggered only after form submission to ensure lead capture).

---

## 5. Technical Specifications

| Feature | Implementation |
| :--- | :--- |
| **Framework** | Next.js 15 (React 19) |
| **Styling** | Tailwind CSS (Utility-first for speed) |
| **Animation** | Framer Motion (Subtle entry fades for "premium" feel) |
| **Icons** | Lucide-React (Clean, professional linework) |
| **Forms** | React Hook Form + Zod (Strict validation for .edu emails) |

---

## 6. Content Map (Sitemap)

1.  **Hero:** The Mission & Vision.
2.  **The Crisis:** Brief data-viz section on "The Cost of Outdated IEP Processes."
3.  **The Solution (System Overview):** "How TeachTracker Works in Practice" (replaces video demo).
4.  **Core Pillars:**
    * *Compliance:* Automated guardrails.
    * *Collaboration:* Parent-teacher-admin synced views.
    * *Data:* Real-time student progress tracking.
5.  **Final CTA:** Schedule a Meeting / Sign up for Beta.

---

## 7. Success Metrics (KPIs)
* **Engagement:** % of users who scroll to / complete the System Overview section (or video completion if video retained).
* **Lead Quality:** % of signups from valid school district domains (.gov, .edu, .org).
* **SEO Visibility:** Tracking ranking for "Intelligent IEP Software."