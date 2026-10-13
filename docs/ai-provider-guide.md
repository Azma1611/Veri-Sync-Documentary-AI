# VeriSync AI — AI Provider & Integration Guide

> **Module:** Step 6 — Optional Provider-Independent AI Assistance  
> **Status:** Production-Ready, Graceful Fallback Architecture  
> **Principle:** Evidence-First & Advisory Only. Never represents AI opinion as legal proof of authenticity or fraud.

---

## 1. Architecture Overview

VeriSync AI implements a **provider-independent AI assistance layer** that complements the deterministic verification engine:

```
┌─────────────────────────────────────────────────────────────┐
│                     VeriSync AI Backend                     │
├─────────────────────────────────────────────────────────────┤
│  1. Deterministic Extraction & Validation                   │
│     (PyMuPDF, python-docx, Ingestion Store)                 │
├─────────────────────────────────────────────────────────────┤
│  2. Deterministic Rule Engine                               │
│     (Completeness, Numeric/Duration Comparison, Rules)      │
├─────────────────────────────────────────────────────────────┤
│  3. Optional Advisory AI Assistance Layer                   │
│     ┌─────────────────────────────────────────────────────┐ │
│     │ PII Minimizer (Redacts Email, Phone, PAN, Aadhaar)  │ │
│     ├─────────────────────────────────────────────────────┤ │
│     │ Grounding Validator (Rejects Hallucinated Excerpts) │ │
│     ├─────────────────────────────────────────────────────┤ │
│     │ Provider Abstraction (OpenAI, Groq, Ollama, Mock)   │ │
│     └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Guarantees
1. **Deterministic Priority:** The core verification engine (completeness and cross-document comparison) runs deterministically. If the AI provider is unavailable, offline, unconfigured, or times out, the core report completes successfully with zero disruption.
2. **Strict Grounding:** The `GroundingValidator` cross-references every AI-cited excerpt, page number, and paragraph reference against the document's actual layout and extracted text blocks. Ungrounded citations are rejected.
3. **No Key Leakage:** API keys are read exclusively from backend environment variables and are never surfaced to the browser, logs, or API responses.
4. **Advisory Role:** All AI outputs are labeled with `is_ai_generated: true` and explicit disclaimers:
   > *"AI-assisted observation for human reviewer reference only. Advisory output does not constitute a determination of authenticity, legal validity, or fraud."*

---

## 2. Configuration & Environment Variables

Configure the AI assistance layer in `backend/.env` (use `.env.example` as a template):

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `LLM_ENABLED` | `bool` | `false` | Master toggle. If `false`, verification runs in pure deterministic mode. |
| `LLM_PROVIDER` | `str` | `openai` | Provider adapter: `openai` (OpenAI/Groq/Ollama/vLLM), `mock`, `none`. |
| `LLM_API_KEY` | `str` | `""` | Secret API key. **Never commit to Git or expose in frontend.** |
| `LLM_API_BASE` | `str` | `https://api.openai.com/v1` | Base URL for REST endpoint (override for Groq, Ollama, LocalAI, etc.). |
| `LLM_MODEL` | `str` | `gpt-4o-mini` | Model identifier (e.g. `gpt-4o-mini`, `llama-3.1-70b-versatile`). |
| `LLM_TIMEOUT_SECONDS` | `float` | `12.0` | Strict timeout per call. Requests exceeding this fail fast and gracefully. |
| `LLM_MAX_RETRIES` | `int` | `2` | Bounded retries with exponential backoff on transient 429/5xx codes. |
| `LLM_TEMPERATURE` | `float` | `0.0` | Sampling temperature (`0.0` recommended for deterministic audits). |
| `LLM_REDACT_PII` | `bool` | `true` | Automatically redact emails, phone numbers, and identity cards before transmission. |

---

## 3. Supported Provider Configurations

### Option A: OpenAI (Production)
```env
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_API_KEY=sk-proj-your-actual-api-key
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### Option B: Groq (High-Speed Inference)
```env
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_API_KEY=gsk_your_groq_api_key
LLM_API_BASE=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-70b-versatile
```

### Option C: Ollama / LocalAI (Local & Air-Gapped)
Zero data leaves your local infrastructure:
```env
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_API_KEY=""
LLM_API_BASE=http://localhost:11434/v1
LLM_MODEL=llama3.1:8b
```

### Option D: Deterministic Mock Provider (Testing / CI / Offline)
Runs without internet connectivity or external credentials:
```env
LLM_ENABLED=true
LLM_PROVIDER=mock
LLM_MODEL=mock-auditor
```

---

## 4. Privacy, Data Handling & PII Minimization

VeriSync AI complies with strict enterprise privacy and confidentiality practices:

1. **Automatic Redaction (`pii_minimizer.py`):**
   - Email addresses $\rightarrow$ `[REDACTED_EMAIL]`
   - Phone numbers $\rightarrow$ `[REDACTED_PHONE]`
   - National identity cards (PAN, Aadhaar, SSN) $\rightarrow$ `[REDACTED_ID]`
2. **Context Window Minimization:**
   - VeriSync AI **never** sends entire multi-page documents to external LLM providers when only specific clauses are in dispute.
   - Only the isolated ~300 character clause excerpts surrounding the finding are transmitted.
3. **Data Retention Guidance:**
   - When deploying with OpenAI or Groq, enable **Zero Data Retention (ZDR)** or Enterprise HIPAA/SOC2 agreements to ensure prompts are not stored for training.

---

## 5. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/ai/status` | Readiness probe (reports provider, model, timeout; hides secrets). |
| `POST` | `/api/v1/ai/explain-finding` | Grounded advisory explanation for a specific discrepancy finding. |
| `POST` | `/api/v1/ai/semantic-compare` | Semantic analysis of two clauses with legal nuance breakdown. |
| `POST` | `/api/v1/ai/extract-fields` | Candidate structured field extraction with evidence grounding checks. |
| `POST` | `/api/v1/ai/map-clause` | Classifies non-standard phrasing into domain rule catalog. |

---

## 6. Verification Enrichment Flow

When `LLM_ENABLED=true`, `POST /api/v1/documents/verify` automatically runs:
1. Deterministic file validation and text extraction.
2. Completeness and missing clause checks.
3. Cross-document comparison engine.
4. Optional enrichment step:
   - For every finding, generates an `AIExplanationResponse`.
   - Validates grounded citations.
   - Populates `VerificationResult.ai_assistance`.
5. If the AI call fails or times out, the deterministic report returns without interruption.
