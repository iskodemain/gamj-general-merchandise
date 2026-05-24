import "./ExportBar.css";

/**
 * Reusable export / print toolbar.
 *
 * Props:
 *   onExcelClick  – () => void
 *   onPDFClick    – () => void
 *   onPrintClick  – () => void
 *   disabled      – bool  (greys out all buttons when no data)
 */
function ExportBar({ onExcelClick, onPDFClick, onPrintClick, disabled = false }) {
  return (
    <div className="eb-bar" role="group" aria-label="Export options">

      {/* ── Excel ── */}
      <button
        className="eb-btn eb-excel"
        onClick={onExcelClick}
        disabled={disabled}
        title="Export to Excel (.xlsx)"
        aria-label="Export to Excel"
        type="button"
      >
        <svg className="eb-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="16" height="16" rx="2.5" fill="#16a34a" />
          <path d="M6 7l2.5 3L6 13h1.6l1.7-2.2L11 13h1.6L10 10l2.6-3H11l-1.7 2.1L7.6 7H6z" fill="#fff" />
        </svg>
        <span className="eb-label">Excel</span>
      </button>

      {/* ── PDF ── */}
      <button
        className="eb-btn eb-pdf"
        onClick={onPDFClick}
        disabled={disabled}
        title="Export to PDF"
        aria-label="Export to PDF"
        type="button"
      >
        <svg className="eb-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="16" height="16" rx="2.5" fill="#dc2626" />
          <text x="4" y="14" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Arial">PDF</text>
        </svg>
        <span className="eb-label">PDF</span>
      </button>

      {/* ── Print ── */}
      <button
        className="eb-btn eb-print"
        onClick={onPrintClick}
        disabled={disabled}
        title="Print report"
        aria-label="Print report"
        type="button"
      >
        <svg className="eb-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="4" y="7" width="12" height="8" rx="1.5" stroke="#374151" strokeWidth="1.4" />
          <rect x="6" y="2" width="8" height="5" rx="1" stroke="#374151" strokeWidth="1.4" />
          <rect x="6" y="12" width="8" height="5" rx="1" fill="#fff" stroke="#374151" strokeWidth="1.4" />
          <circle cx="14.5" cy="10" r="0.8" fill="#374151" />
        </svg>
        <span className="eb-label">Print</span>
      </button>

    </div>
  );
}

export default ExportBar;
