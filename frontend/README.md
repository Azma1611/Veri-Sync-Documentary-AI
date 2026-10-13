# VeriSync AI — Frontend

> **Multi-Domain Document Verification & Resume Career Fit Intelligence Platform**

This is the frontend-only client for **VeriSync AI**, engineered with React 19, TypeScript, Vite, Tailwind CSS, and Lucide React. It provides an enterprise SaaS interface for document verification, conflict analysis, and candidate career matching.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router v7 (`react-router-dom`)
- **Icons:** Lucide React

---

## 📂 Project Architecture

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── DomainSelector.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NoticeBanner.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── UploadZone.tsx
│   │   ├── layout/             # Topbar & Sidebar layout navigation
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── resume/             # Resume analysis components
│   │   │   ├── FitScoreGauge.tsx
│   │   │   ├── JobMatchCard.tsx
│   │   │   └── ResumeSkillsView.tsx
│   │   └── verification/       # Multi-document discrepancy review
│   │       ├── DocumentInconsistencySummary.tsx
│   │       ├── EvidenceComparison.tsx
│   │       └── FindingCard.tsx
│   ├── data/
│   │   └── mockData.ts         # Pure demonstration datasets & simulation values
│   ├── layouts/
│   │   └── DashboardLayout.tsx # Shared dashboard shell with collapsible sidebar
│   ├── pages/
│   │   ├── LandingPage.tsx     # Hero presentation & value proposition
│   │   ├── DashboardPage.tsx   # Metrics overview & quick feature actions
│   │   ├── ResumeCareerPage.tsx # Resume upload, qualification gap & job matching
│   │   ├── DocumentVerificationPage.tsx # Contract vs offer letter discrepancy review
│   │   ├── HistoryPage.tsx     # Searchable audit history with filter matrix
│   │   └── SettingsPage.tsx    # Preferences, profile placeholder & backend status
│   ├── services/
│   │   └── api.ts              # Typed backend service contracts & demo fallback
│   ├── types/
│   │   └── index.ts            # Strongly-typed domain models & interfaces
│   ├── App.tsx                 # Route definitions & application root
│   ├── index.css               # Tailwind CSS entry & base styling
│   └── main.tsx                # React DOM entry
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The application will run locally at `http://localhost:5173/`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔗 Backend Integration Guide

The frontend is completely decoupled from the backend. When no backend is connected, the application runs in **Demonstration Mode** using synthetic simulation data.

### Connecting to the Live Backend
1. Create a `.env` file in the `frontend` root directory:
   ```bash
   cp .env.example .env
   ```
2. Set the base URL of your backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Endpoints specified in `src/services/api.ts`:
   - `POST /resumes/analyze` — Multipart resume upload, domain, and role fitness.
   - `GET /jobs/matches` — Career opportunities based on extracted competencies.
   - `POST /documents/verify` — Multipart multi-document cross-referencing and clause analysis.
   - `GET /history` — Historical verification logs and metrics.

---

## 🛡️ Demonstration Mode Notice

- All metrics, discrepancy findings (such as ₹30,000 offer letter vs ₹25,000 contract), candidate profiles, and job listings are **simulated demonstration data**.
- No real documents or candidate data are transmitted to external services.
- Backend-dependent actions display clear feedback indicating that the backend is currently unlinked.
