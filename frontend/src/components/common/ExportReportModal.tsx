import React, { useState } from 'react';
import { Download, Copy, Check, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import type { VerificationResult } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown');

  const generateMarkdownReport = () => {
    return `# VeriSync AI — Verification Audit Summary
**Domain:** ${result.domain}
**Reviewed At:** ${result.reviewedAt}
**Status:** Potential Inconsistencies Requiring Review
**Documents Inspected:**
${result.documentsReviewed.map((d) => `- ${d}`).join('\n')}

---

## Executive Summary
${result.summaryNote}

> **Disclaimer:** Findings represent potential discrepancies between supplied document clauses requiring human reviewer confirmation. This audit does NOT assert fraudulent intent or authenticate legal instruments.

---

## Findings Matrix (${result.findings.length} Items Flagged)

${result.findings
  .map(
    (f, idx) => `### ${idx + 1}. ${f.title}
- **Category:** ${f.category}
- **Severity:** ${f.severity.toUpperCase()}
- **Review Status:** ${f.status}
- **Document A (${f.sourceA.documentName}, ${f.sourceA.section}, Page ${f.sourceA.page}):**
  > "${f.sourceA.extractedValue}"
- **Document B (${f.sourceB.documentName}, ${f.sourceB.section}, Page ${f.sourceB.page}):**
  > "${f.sourceB.extractedValue}"
- **Recommended Auditor Action:** ${f.recommendedAction}
`
  )
  .join('\n')}

---

## Completeness & Missing Fields (${result.missingFields.length} Items)
${result.missingFields
  .map(
    (m) => `- **${m.fieldName}** (${m.severity.toUpperCase()}): Expected in ${m.expectedIn}. Detail: ${m.detail}`
  )
  .join('\n')}

---
*Report generated via VeriSync AI Multi-Domain Document Verification Platform*
`;
  };

  const handleCopy = () => {
    const text = exportFormat === 'markdown' ? generateMarkdownReport() : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = exportFormat === 'markdown' ? generateMarkdownReport() : JSON.stringify(result, null, 2);
    const filename = `verisync-verification-report-${Date.now()}.${exportFormat === 'markdown' ? 'md' : 'json'}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Verification Audit Report"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Notice */}
        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#4338CA] shrink-0 mt-0.5" />
          <p className="text-xs text-[#172554] leading-relaxed">
            This evidence-linked summary documents potential inconsistencies for internal auditor reconciliation. Always obtain formal confirmation before taking contractual action.
          </p>
        </div>

        {/* Format Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">Format:</span>
            <div className="inline-flex rounded-lg border border-[#E4E8F2] p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setExportFormat('markdown')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  exportFormat === 'markdown'
                    ? 'bg-white text-[#4338CA] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  exportFormat === 'json'
                    ? 'bg-white text-[#4338CA] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Structured JSON
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E8F2] hover:bg-slate-50 text-xs font-semibold text-[#172033] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-primary text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Preview box */}
        <div className="bg-[#172033] text-slate-200 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto leading-relaxed border border-slate-700">
          <pre className="whitespace-pre-wrap">
            {exportFormat === 'markdown' ? generateMarkdownReport() : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
