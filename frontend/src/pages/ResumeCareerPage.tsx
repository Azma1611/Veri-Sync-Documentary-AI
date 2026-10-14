import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  Target,
  Building,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { UploadZone } from '../components/common/UploadZone';
import { FileList } from '../components/common/FileList';
import { CareerDomainSelector } from '../components/common/DomainSelector';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { LoadingState } from '../components/common/LoadingState';
import { FitScoreGauge } from '../components/resume/FitScoreGauge';
import { ResumeSkillsView } from '../components/resume/ResumeSkillsView';
import { JobMatchCard } from '../components/resume/JobMatchCard';
import { analyzeResume } from '../services/api';
import type {
  CareerDomain,
  UploadedFileItem,
  ResumeAnalysisResult,
} from '../types';
import { mockResumeAnalysis } from '../data/mockData';

export const ResumeCareerPage: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<CareerDomain>('software-engineering');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState(
    'Seeking a Senior Full Stack Engineer experienced in React, TypeScript, Node.js, and relational databases. Experience with cloud architecture, microservices, and automated testing preferred.'
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setUploadedFiles([
      {
        id: `resume-${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        uploadedAt: new Date(),
      },
    ]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true);
    try {
      const response = await analyzeResume({
        file: uploadedFiles[0].file,
        careerDomain: selectedDomain,
        targetRole: targetRole.trim() || undefined,
        targetCompany: targetCompany.trim() || undefined,
        jobDescription: jobDescriptionText.trim() || undefined,
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult(mockResumeAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    const sampleFile = new File(['sample resume content'], 'Alex_Morgan_Senior_Engineer_Resume.pdf', {
      type: 'application/pdf',
    });
    setUploadedFiles([
      {
        id: 'sample-resume-alex',
        file: sampleFile,
        name: 'Alex_Morgan_Senior_Engineer_Resume.pdf',
        size: 1468006,
        type: 'application/pdf',
        uploadedAt: new Date(),
      },
    ]);
    setTargetRole('Senior Full Stack Engineer');
    setSelectedDomain('software-engineering');
    setAnalysisResult(mockResumeAnalysis);
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Employment & HR Domain — Resume & Career Fit: Evaluates candidate credentials against job specifications. Suggested roles and match scores are demonstration benchmarks only." />

      {/* Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1.5 font-medium">
            <Link to="/verify" className="hover:text-[#62D8FF] transition-colors">
              Domains
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            <Link to="/verify/employment" className="hover:text-[#62D8FF] transition-colors">
              Employment & HR
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="font-bold text-white">Resume & Career Fit</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume & Career Fit Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 max-w-2xl leading-relaxed">
            Extract competencies, identify matched vs missing skills, and benchmark candidate qualifications against specific job descriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          {!analysisResult && (
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-bold border border-violet-400/30 transition-all shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Load Sample Resume</span>
            </button>
          )}

          {analysisResult && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 hover:bg-white/10 text-xs font-bold text-white shadow-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Reset Analysis</span>
            </button>
          )}
        </div>

        <div className="absolute -right-16 -top-16 w-52 h-52 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input panel */}
        <div className="lg:col-span-5 glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Panel header */}
          <div className="px-6 py-4.5 border-b border-white/10 bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80">
            <h2 className="text-sm font-extrabold text-white tracking-tight">
              Candidate Profile & Role Specifications
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Target role description and candidate resume document
            </p>
          </div>

          <div className="p-6 space-y-4.5">
            {/* Domain Selector */}
            <CareerDomainSelector
              selected={selectedDomain}
              onChange={(domain) => setSelectedDomain(domain)}
            />

            {/* Target Role */}
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Target Role / Job Title
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full pl-10 pr-3 py-2.5 glass-input rounded-xl text-xs text-white font-medium placeholder-[#64748B] focus:outline-none focus:border-[#438AFF] shadow-inner"
                />
              </div>
            </div>

            {/* Target Job Description */}
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Provided Job Description / Requirements
              </label>
              <textarea
                rows={3}
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste key requirements, required skills, and qualification expectations..."
                className="w-full p-3 glass-input rounded-xl text-xs text-white font-normal placeholder-[#64748B] focus:outline-none focus:border-[#438AFF] shadow-inner leading-relaxed"
              />
            </div>

            {/* Preferred Company */}
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Target Organization <span className="text-[#94A3B8] font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. NovaCloud, Stripe"
                  className="w-full pl-10 pr-3 py-2.5 glass-input rounded-xl text-xs text-white font-medium placeholder-[#64748B] focus:outline-none focus:border-[#438AFF] shadow-inner"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Candidate Resume Document
              </label>
              <UploadZone
                onFilesSelected={handleFilesSelected}
                multiple={false}
                maxSizeMB={10}
                acceptedFormats={['.pdf', '.docx', '.doc']}
                helperText="Upload candidate resume (PDF or DOCX up to 10MB)"
                compact={true}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <FileList
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                domain="employment-hr"
              />
            )}

            {/* Analyze button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={uploadedFiles.length === 0 || isLoading}
                onClick={handleAnalyze}
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-extrabold text-xs transition-all ${
                  uploadedFiles.length > 0 && !isLoading
                    ? 'btn-primary text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02]'
                    : 'bg-white/5 text-[#94A3B8] border border-white/10 cursor-not-allowed opacity-50'
                }`}
              >
                <span>Run Resume & Career Fit Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results or Instructions placeholder */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading && (
            <LoadingState
              title="Benchmarking Candidate Resume"
              description="Extracting technical skills, parsing work history, and computing qualification alignment score..."
              currentStepIndex={1}
            />
          )}

          {analysisResult && !isLoading && (
            <>
              {/* Overall Fit Score Gauge */}
              <FitScoreGauge
                score={analysisResult.overallFitScore}
                label={`Fit Score: ${targetRole || 'Target Role'}`}
              />

              {/* Skills and Experience Analysis */}
              <ResumeSkillsView analysis={analysisResult} />

              {/* Benchmark Career Roles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      Benchmark Role Listings
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Sample role requirements aligned with extracted competencies
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#62D8FF] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                    Fictional References
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysisResult.jobMatches.map((job) => (
                    <JobMatchCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            </>
          )}

          {!analysisResult && !isLoading && (
            <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl space-y-5 text-center backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4338CA]/30 to-[#8B5CF6]/30 border border-violet-400/30 flex items-center justify-center mx-auto text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Candidate Evaluation Workspace
              </h3>
              <p className="text-xs text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                Upload a candidate resume on the left or click <strong>"Load Sample Resume"</strong> above to benchmark technical skills, calculate role alignment scores, and discover identified competency gaps.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#62D8FF]">
                  ✓ Deterministic Extraction
                </span>
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#62D8FF]">
                  ✓ Transparent Score Breakdown
                </span>
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#62D8FF]">
                  ✓ Skill Gap Audit
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
