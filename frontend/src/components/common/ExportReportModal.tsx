import React, { useState } from 'react';
import { Download, Copy, Check, AlertTriangle, Printer } from 'lucide-react';
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
**Verification Status:** ${result.status}
**Total Documents Inspected:** ${result.totalDocuments}
**Documents:**
${result.documentsReviewed.map((d) => `- ${d}`).join('\n')}

---

## Executive Summary
${result.summaryNote}

> **Audit Disclaimer:** Automated checks flag potential variances and missing clauses for human auditor review. This platform does NOT assert fraud, criminal intent, or legally certify instrument validity.

---

## Inconsistency Findings (${result.findings.length} Items Flagged)

${result.findings
  .map(
    (f, idx) => `### Finding #${idx + 1}: ${f.title}
- **Category:** ${f.category}
- **Severity / Review Priority:** ${f.severity.toUpperCase()}
- **Current Status:** ${f.status}
- **Document A Citation (${f.sourceA.documentName}, ${f.sourceA.section}, Page ${f.sourceA.page}):**
  > "${f.sourceA.extractedValue}"
- **Document B Citation (${f.sourceB.documentName}, ${f.sourceB.section}, Page ${f.sourceB.page}):**
  > "${f.sourceB.extractedValue}"
- **Auditor Guidance:** ${f.recommendedAction}
`
  )
  .join('\n')}

---

## Document Completeness & Missing Fields (${result.missingFields.length} Items)
${result.missingFields
  .map(
    (m) => `- **${m.fieldName}** [${m.severity.toUpperCase()}]: Expected in "${m.expectedIn}". ${m.detail}`
  )
  .join('\n')}

---
*Report generated via VeriSync AI — Multi-Domain Document Verification Platform*
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
    const filename = `verisync-audit-report-${Date.now()}.${exportFormat === 'markdown' ? 'md' : 'json'}`;
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Verification Audit Report"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed">
            This evidence-linked summary records potential discrepancies for internal auditor review and compliance archiving. Always obtain formal confirmation before contractual or billing finalization.
          </p>
        </div>

        {/* Format Selector & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#94A3B8]">Format:</span>
            <div className="inline-flex rounded-xl border border-white/10 p-1 bg-black/40">
              <button
                type="button"
                onClick={() => setExportFormat('markdown')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  exportFormat === 'markdown'
                    ? 'bg-[#438AFF]/30 text-[#62D8FF] border border-[#62D8FF]/40 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  exportFormat === 'json'
                    ? 'bg-[#438AFF]/30 text-[#62D8FF] border border-[#62D8FF]/40 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Audit JSON
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              title="Print report"
            >
              <Printer className="w-3.5 h-3.5 text-[#62D8FF]" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-primary text-white text-xs font-bold shadow-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Dark crystal code preview box */}
        <div className="bg-[#070B1C] text-[#CBD5E1] rounded-2xl p-4 font-mono text-xs max-h-80 overflow-y-auto leading-relaxed border border-white/10 shadow-inner">
          <pre className="whitespace-pre-wrap selection:bg-[#438AFF]/30 selection:text-white">
            {exportFormat === 'markdown' ? generateMarkdownReport() : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
