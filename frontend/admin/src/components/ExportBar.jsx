import "./ExportBar.css";

/**
 * Reusable export/print toolbar.
 *
 * Props:
 *   onExcelClick  – () => void
 *   onPDFClick    – () => void
 *   onPrintClick  – () => void
 *   disabled      – bool (greys out all buttons when no data)
 */
function ExportBar({ onExcelClick, onPDFClick, onPrintClick, disabled = false }) {
  return (
    <div className="eb-bar">
      <button
        className="eb-btn eb-excel"
        onClick={onExcelClick}
        disabled={disabled}
        title="Export to Excel"
      >
        <span className="eb-icon">⬇</span>
        <span className="eb-label">Excel</span>
      </button>

      <button
        className="eb-btn eb-pdf"
        onClick={onPDFClick}
        disabled={disabled}
        title="Export to PDF"
      >
        <span className="eb-icon">⬇</span>
        <span className="eb-label">PDF</span>
      </button>

      <button
        className="eb-btn eb-print"
        onClick={onPrintClick}
        disabled={disabled}
        title="Print"
      >
        <span className="eb-icon">🖨</span>
        <span className="eb-label">Print</span>
      </button>
    </div>
  );
}

export default ExportBar;
