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
 * Expected Backend Endpoint:
 *   POST /resumes/analyze
 *   Content-Type: multipart/form-data
 *   Form fields: file, domain, target_role, target_company
 */
export async function analyzeResume(
  params: ResumeAnalysisParams
): Promise<ApiResponse<ResumeAnalysisResult>> {
  if (isBackendConfigured()) {
    // Contractual placeholder for future backend implementation:
    // const formData = new FormData();
    // formData.append('file', params.file);
    // formData.append('domain', params.careerDomain);
    // if (params.targetRole) formData.append('target_role', params.targetRole);
    // if (params.targetCompany) formData.append('target_company', params.targetCompany);
    // const response = await fetch(`${API_BASE_URL}/resumes/analyze`, {
    //   method: 'POST',
    //   body: formData,
    // });
    // if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    // return { data: await response.json(), isSimulated: false, backendConnected: true };
    console.info('[VeriSync API] Backend URL configured, but endpoint is under active integration.');
  }

  // Simulated Demo Processing
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
 * Expected Backend Endpoint:
 *   POST /documents/verify
 *   Content-Type: multipart/form-data
 *   Form fields: files[] (array of documents), domain
 */
export async function verifyEmploymentDocuments(
  params: VerificationParams
): Promise<ApiResponse<VerificationResult>> {
  if (isBackendConfigured()) {
    console.info('[VeriSync API] Document verification endpoint will be called once backend is live.');
  }

  // Simulated analysis step delay
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const fileNames = params.files.map((f) => f.file.name);

  const customizedResult: VerificationResult = {
    ...mockVerificationResult,
    totalDocuments: params.files.length,
    documentsReviewed: fileNames.length > 0 ? fileNames : mockVerificationResult.documentsReviewed,
  };

  return {
    data: customizedResult,
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
    console.info('[VeriSync API] History endpoint will sync with database when connected.');
  }

  await new Promise((resolve) => setTimeout(resolve, 400));

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
    message: 'Demonstration history log',
  };
}
