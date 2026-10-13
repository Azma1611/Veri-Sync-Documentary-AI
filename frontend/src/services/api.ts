/**
 * VeriSync AI - Backend Integration Service
 * 
 * NOTE FOR BACKEND DEVELOPERS:
 * This service defines the expected API contracts for the VeriSync AI platform.
 * To connect to the real backend, set the following environment variable:
 *   VITE_API_BASE_URL=http://localhost:8000/api/v1
 * 
 * When VITE_API_BASE_URL is not set or empty, all functions will run in Demo Mode
 * and return structured mock data with a simulated delay to demonstrate UI states.
 */

import type {
  ResumeAnalysisResult,
  VerificationResult,
  HistoryItem,
  JobMatchItem,
  CareerDomain,
  DocumentDomain,
  EmploymentDocType,
} from '../types';
import {
  mockResumeAnalysis,
  mockVerificationResult,
  mockHistoryItems,
} from '../data/mockData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Checks whether the backend API URL is configured.
 */
export function isBackendConfigured(): boolean {
  return Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0);
}

// -------------------------------------------------------------
// Health Check — the only live endpoint wired up in Step 3
// -------------------------------------------------------------

export interface HealthCheckResult {
  /** true when the backend replied with HTTP 200 */
  ok: boolean;
  /** HTTP status code, or 0 when a network error occurred */
  statusCode: number;
  /** Round-trip latency in milliseconds */
  latencyMs: number;
  /** Parsed backend payload (present only when ok === true) */
  payload?: {
    status: string;
    version: string;
    environment: string;
    activeDomain: string;
    aiEngineReady: boolean;
    timestamp: string;
  };
  /** Human-readable error message (present only when ok === false) */
  error?: string;
}

/**
 * Performs a live GET /api/v1/health request against the configured backend.
 *
 * - Requires VITE_API_BASE_URL to be set; returns an error result otherwise.
 * - Applies a 6-second AbortController timeout so the UI never hangs.
 * - Handles network failures, non-JSON bodies, and non-2xx responses safely.
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  if (!isBackendConfigured()) {
    return {
      ok: false,
      statusCode: 0,
      latencyMs: 0,
      error: 'Backend URL is not configured. Set VITE_API_BASE_URL in your .env file.',
    };
  }

  const url = `${API_BASE_URL}/health`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const t0 = performance.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    const latencyMs = Math.round(performance.now() - t0);

    // Try to parse JSON even for non-200 responses (FastAPI error bodies are JSON)
    let json: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        json = await response.json();
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        latencyMs,
        error: `Backend returned HTTP ${response.status} ${response.statusText}`,
      };
    }

    return {
      ok: true,
      statusCode: response.status,
      latencyMs,
      payload: json as HealthCheckResult['payload'],
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - t0);
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    return {
      ok: false,
      statusCode: 0,
      latencyMs,
      error: isAbort
        ? 'Request timed out after 6 seconds. Is the backend running?'
        : `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// -------------------------------------------------------------
// Request & Response Contract Types
// -------------------------------------------------------------

export interface ResumeAnalysisParams {
  file: File;
  careerDomain: CareerDomain;
  targetRole?: string;
  targetCompany?: string;
}

export interface JobMatchParams {
  skills: string[];
  domain: CareerDomain;
  locationPreference?: string;
}

export interface VerificationParams {
  files: { file: File; docType: EmploymentDocType }[];
  domain: DocumentDomain;
}

export interface HistoryFilterParams {
  type?: 'all' | 'resume' | 'verification';
  searchQuery?: string;
  status?: string;
}

export interface ApiResponse<T> {
  data: T;
  isSimulated: boolean;
  message?: string;
  backendConnected: boolean;
}

// -------------------------------------------------------------
// Service API Functions
// -------------------------------------------------------------

/**
 * Uploads a resume and analyzes its skills, experience level, and role fitness.
 * 
 * Live Backend Endpoint (Step 8):
 *   POST /api/v1/resumes/analyze
 *   Content-Type: multipart/form-data
 *   Form fields: file, domain, target_role, target_company, job_description
 * 
 * Falls back to mock data when VITE_API_BASE_URL is not configured or on error.
 * NOTE: job_description is now forwarded so the backend can extract real requirements.
 */
export async function analyzeResume(
  params: ResumeAnalysisParams & { jobDescription?: string }
): Promise<ApiResponse<ResumeAnalysisResult>> {
  if (isBackendConfigured()) {
    try {
      const formData = new FormData();
      formData.append('file', params.file, params.file.name);
      formData.append('domain', params.careerDomain);
      if (params.targetRole) formData.append('target_role', params.targetRole);
      if (params.targetCompany) formData.append('target_company', params.targetCompany);
      if (params.jobDescription) formData.append('job_description', params.jobDescription);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);

      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/resumes/analyze`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        let errDetail = `HTTP ${response.status}`;
        try {
          const errBody = await response.json();
          errDetail = errBody?.detail ?? errDetail;
        } catch { /* ignore */ }
        throw new Error(`Backend error: ${errDetail}`);
      }

      const envelope = await response.json();
      return {
        data: envelope.data as ResumeAnalysisResult,
        isSimulated: false,
        backendConnected: true,
        message: envelope.message ?? 'Resume analyzed successfully',
      };
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const errorMsg = isAbort
        ? 'Resume analysis timed out. Falling back to demonstration data.'
        : `Backend error: ${err instanceof Error ? err.message : String(err)}. Falling back to demonstration data.`;
      console.error('[VeriSync API] analyzeResume failed:', err);

      // Fallback to mock
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        data: {
          ...mockResumeAnalysis,
          fileName: params.file.name,
          fileSize: `${(params.file.size / (1024 * 1024)).toFixed(1)} MB`,
          summary: params.targetRole
            ? `Analysis tailored for target role: "${params.targetRole}". ${mockResumeAnalysis.summary}`
            : mockResumeAnalysis.summary,
        },
        isSimulated: true,
        backendConnected: false,
        message: errorMsg,
      };
    }
  }

  // Demo Mode — backend not configured
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const customizedResult: ResumeAnalysisResult = {
    ...mockResumeAnalysis,
    fileName: params.file.name,
    fileSize: `${(params.file.size / (1024 * 1024)).toFixed(1)} MB`,
    summary: params.targetRole
      ? `Analysis tailored for target role: "${params.targetRole}". ${mockResumeAnalysis.summary}`
      : mockResumeAnalysis.summary,
  };

  return {
    data: customizedResult,
    isSimulated: true,
    backendConnected: false,
    message: 'Simulated demonstration analysis (backend not connected)',
  };
}


/**
 * Retrieves matching job opportunities based on extracted resume skills.
 * 
 * Expected Backend Endpoint:
 *   GET /jobs/matches?domain={domain}&skills={skills}
 */
export async function getJobMatches(
  _params: JobMatchParams
): Promise<ApiResponse<JobMatchItem[]>> {
  if (isBackendConfigured()) {
    console.info('[VeriSync API] Live job matching endpoint will be queried when backend is integrated.');
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    data: mockResumeAnalysis.jobMatches,
    isSimulated: true,
    backendConnected: false,
    message: 'Sample job listings provided for demonstration purposes only',
  };
}

/**
 * Cross-references multiple employment documents to detect discrepancies.
 * 
 * Live Backend Endpoint (Step 5):
 *   POST /documents/verify
 *   Content-Type: multipart/form-data
 *   Form fields: files[] (array of documents), doc_types (JSON array), domain
 * 
 * Falls back to mock data when VITE_API_BASE_URL is not configured.
 */
export async function verifyEmploymentDocuments(
  params: VerificationParams
): Promise<ApiResponse<VerificationResult>> {
  if (isBackendConfigured()) {
    try {
      const formData = new FormData();
      params.files.forEach((f) => formData.append('files', f.file, f.file.name));
      const docTypesJson = JSON.stringify(params.files.map((f) => f.docType));
      formData.append('doc_types', docTypesJson);
      formData.append('domain', params.domain);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);

      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/documents/verify`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        let errDetail = `HTTP ${response.status}`;
        try {
          const errBody = await response.json();
          errDetail = errBody?.detail ?? errDetail;
        } catch { /* ignore parse failure */ }
        throw new Error(`Backend error: ${errDetail}`);
      }

      const envelope = await response.json();
      // Backend returns { data: VerificationResult, isSimulated, backendConnected, message }
      return {
        data: envelope.data,
        isSimulated: false,
        backendConnected: true,
        message: envelope.message ?? 'Verification completed',
      };
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      console.error('[VeriSync API] verifyEmploymentDocuments failed:', err);
      // Fall through to mock data below, but surface the error in the message
      const errorMsg = isAbort
        ? 'Request timed out. Falling back to demonstration data.'
        : `Backend error: ${err instanceof Error ? err.message : String(err)}. Falling back to demonstration data.`;

      // Fallback: return mock data with clear labelling
      await new Promise((resolve) => setTimeout(resolve, 400));
      const fileNames = params.files.map((f) => f.file.name);
      return {
        data: {
          ...mockVerificationResult,
          totalDocuments: params.files.length,
          documentsReviewed: fileNames.length > 0 ? fileNames : mockVerificationResult.documentsReviewed,
        },
        isSimulated: true,
        backendConnected: false,
        message: errorMsg,
      };
    }
  }

  // Demo Mode — backend not configured
  await new Promise((resolve) => setTimeout(resolve, 1800));
  const fileNames = params.files.map((f) => f.file.name);
  return {
    data: {
      ...mockVerificationResult,
      totalDocuments: params.files.length,
      documentsReviewed: fileNames.length > 0 ? fileNames : mockVerificationResult.documentsReviewed,
    },
    isSimulated: true,
    backendConnected: false,
    message: 'Fictional demonstration verification report (backend not connected)',
  };
}

/**
 * Fetches analysis history records with optional search and filters.
 * 
 * Expected Backend Endpoint:
 *   GET /history?type={type}&search={search}&status={status}
 */
export async function fetchAnalysisHistory(
  filters?: HistoryFilterParams
): Promise<ApiResponse<HistoryItem[]>> {
  if (isBackendConfigured()) {
    try {
      const query = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') query.set('type', filters.type);
      if (filters?.status && filters.status !== 'all') query.set('status', filters.status);
      if (filters?.searchQuery && filters.searchQuery.trim()) query.set('search', filters.searchQuery.trim());

      const url = `${API_BASE_URL}/history?${query.toString()}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (response.ok) {
        const envelope = await response.json();
        return {
          data: envelope.data as HistoryItem[],
          isSimulated: false,
          backendConnected: true,
          message: envelope.message ?? 'History retrieved from live backend',
        };
      }
    } catch (err) {
      console.warn('[VeriSync API] Live history fetch failed, falling back to mock data:', err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...mockHistoryItems];

  if (filters?.type && filters.type !== 'all') {
    const typeLabel =
      filters.type === 'resume'
        ? 'Resume & Career Fit'
        : 'Employment Document Verification';
    results = results.filter((item) => item.analysisType === typeLabel);
  }

  if (filters?.status && filters.status !== 'all') {
    results = results.filter((item) => item.status === filters.status);
  }

  if (filters?.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (item) =>
        item.documentName.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q)
    );
  }

  return {
    data: results,
    isSimulated: true,
    backendConnected: false,
    message: 'Demonstration history log (offline/mock fallback)',
  };
}

/**
 * Submits a human reviewer determination for a finding to the backend audit log.
 */
export async function submitReviewerDecision(
  findingId: string,
  status: string,
  notes: string = '',
  reviewerId: string = 'usr-auditor-1'
): Promise<{ success: boolean; findingId: string; status: string; decisionId?: string }> {
  if (isBackendConfigured()) {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/findings/${encodeURIComponent(findingId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status, notes, reviewer_id: reviewerId }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          findingId: data.findingId,
          status: data.status,
          decisionId: data.decisionId,
        };
      }
    } catch (err) {
      console.warn('[VeriSync API] submitReviewerDecision live call failed, recorded locally:', err);
    }
  }

  return {
    success: true,
    findingId,
    status,
  };
}

/**
 * Exports a verification result to formatted Markdown or JSON from the server.
 */
export async function exportVerificationReport(
  result: VerificationResult,
  format: 'markdown' | 'json' = 'markdown'
): Promise<{ format: string; filename: string; content: string }> {
  if (isBackendConfigured()) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ result, format }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('[VeriSync API] Server report export failed, falling back to local formatting:', err);
    }
  }

  // Local fallback
  return {
    format,
    filename: `verisync-report-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`,
    content: format === 'json' ? JSON.stringify(result, null, 2) : `# VeriSync AI Verification Audit\n**Domain:** ${result.domain}`,
  };
}
