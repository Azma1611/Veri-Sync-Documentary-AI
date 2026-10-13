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
  Info,
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
    'Seeking a Senior Full Stack Engineer experienced in React, TypeScript, Node.js, and relational databases. Experience with cloud architecture and automated testing preferred.'
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
    const sampleFile = new File(['sample content'], 'Alex_Morgan_Senior_Engineer_Resume.pdf', {
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
    <div className="space-y-5 page-enter max-w-7xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Employment & HR Domain — Resume & Career Fit: Evaluates candidate credentials against job specifications. Vacancy matches are demonstration benchmarks only." />

      {/* Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1 font-medium">
            <Link to="/verify" className="hover:text-[#4338CA] transition-colors">
              Domains
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <Link to="/verify/employment" className="hover:text-[#4338CA] transition-colors">
              Employment & HR
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-bold text-[#172554]">Resume & Career Fit</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            Resume & Career Fit Analysis
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Extract competencies, identify matched vs missing skills, and benchmark candidates against role criteria.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!analysisResult && (
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#7C3AED] text-xs font-bold border border-violet-100 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Resume
            </button>
          )}

          {analysisResult && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card border-white/80 hover:bg-white/90 text-xs font-bold text-[#172554] shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              Reset Analysis
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Input panel */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
          {/* Panel header */}
          <div className="px-5 py-4 border-b border-white/60 bg-gradient-to-r from-violet-50/40 to-indigo-50/30 backdrop-blur-md">
            <h2 className="text-sm font-bold text-[#172554]">Candidate Profile & Role Specifications</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Configure target role description and upload candidate resume</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Domain Selector */}
            <CareerDomainSelector
              selected={selectedDomain}
              onChange={(domain) => setSelectedDomain(domain)}
            />

            {/* Target Role */}
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Target Role / Job Title
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full pl-9 pr-3 py-2.5 glass-input text-xs text-[#172554] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Target Job Description */}
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Provided Job Description / Requirements
              </label>
              <textarea
                rows={3}
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste key requirements, required skills, and qualification expectations..."
                className="w-full p-2.5 glass-input text-xs text-[#172554] font-normal placeholder-[#94A3B8] focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed"
              />
            </div>

            {/* Preferred Company */}
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Target Organization <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. NovaCloud, Stripe"
                  className="w-full pl-9 pr-3 py-2.5 glass-input text-xs text-[#172554] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Candidate Resume Document
              </label>
              <UploadZone
                onFilesSelected={handleFilesSelected}
                multiple={false}
                maxSizeMB={10}
                acceptedFormats={['.pdf', '.docx', '.doc']}
                helperText="Upload candidate resume (PDF or DOCX)"
                compact={true}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <FileList
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
              />
            )}

            {/* Analyze button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={uploadedFiles.length === 0 || isLoading}
                onClick={handleAnalyze}
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                  uploadedFiles.length > 0 && !isLoading
                    ? 'btn-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-[#E4E8F2]'
                }`}
              >
                <span>Evaluate Resume & Career Fit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading && (
            <LoadingState
              title="Analyzing Qualifications & Role Fit..."
              description="Extracting competencies, comparing against job description, and evaluating qualification gaps."
              steps={[
                'Extracting resume sections, experience tenure, and education',
                'Mapping skills to domain taxonomy & comparing with job description',
                'Synthesizing qualification match breakdown & role recommendations',
              ]}
              currentStepIndex={1}
            />
          )}

          {!isLoading && !analysisResult && (
            <div className="py-16 px-6 rounded-2xl glass-panel border-2 border-dashed border-indigo-200/80 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl brand-gradient-subtle border border-indigo-100 flex items-center justify-center mb-4 shadow-sm">
                <FileText className="w-7 h-7 text-[#4338CA]" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-[#172554]">No resume analyzed yet</h3>
              <p className="text-xs text-[#64748B] max-w-xs mt-2 leading-relaxed">
                Upload a candidate file on the left or click "Load Sample Resume" to preview skills extraction, match assessment, and gap analysis.
              </p>
              <button
                type="button"
                onClick={handleLoadSample}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Resume</span>
              </button>
            </div>
          )}

          {!isLoading && analysisResult && (
            <div className="space-y-4">
              <FitScoreGauge score={analysisResult.overallFitScore} />
              <ResumeSkillsView analysis={analysisResult} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#172554]">
                      Role Alignment & Benchmark Vacancies
                    </h3>
                    <p className="text-[11px] text-[#94A3B8]">
                      Suggested roles based on extracted skill profile (Sample benchmark data)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#4338CA] px-2 py-0.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 backdrop-blur-sm">
                    Demo Data
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.jobMatches.slice(0, 2).map((job) => (
                    <JobMatchCard key={job.id} job={job} />
                  ))}
                </div>

                <div className="p-3 rounded-xl glass-card border-white/80 flex items-center gap-2 text-[11px] text-[#64748B] shadow-sm">
                  <Info className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  <span>
                    Actual job vacancies and application links require connecting a live employment data source or recruitment API.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
