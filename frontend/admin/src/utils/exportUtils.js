import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COMPANY_NAME = "GAMJ General Merchandise";
const COMPANY_TAGLINE = "Your Trusted General Merchandise Partner";

// Brand colors — GAMJ green palette
const COLOR_PRIMARY   = [47, 161, 76];   // GAMJ dark green  #2FA14C
const COLOR_ACCENT    = [67, 160, 71];   // GAMJ main green  #43A047
const COLOR_DARK      = [15, 23, 42];    // near-black       #0F172A
const COLOR_LIGHT_ROW = [240, 249, 240]; // light green tint #F0F9F0
const COLOR_WHITE     = [255, 255, 255];
const COLOR_MUTED     = [100, 116, 139]; // slate-500

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Sanitise a cell value: replace the ₱ symbol with "PHP " so jsPDF (latin-1)
 *  renders it correctly instead of showing a box/question mark. */
const sanitizeForPDF = (value) => {
  const str = String(value ?? "");
  // Replace peso sign with "PHP " prefix
  return str.replace(/₱/g, "PHP ");
};

/** Format the current date/time for headers */
const nowString = () =>
  new Date().toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** Auto-fit column widths for Excel based on content */
const autoColWidths = (headers, rows) =>
  headers.map((h) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 12), 50) };
  });

// ─── EXCEL ────────────────────────────────────────────────────────────────────
/**
 * Export rows to a styled Excel (.xlsx) file.
 * @param {Object[]} rows     - Array of flat objects (same keys)
 * @param {string}   filename - Output filename (e.g. "report.xlsx")
 * @param {string}   title    - Report title shown in the sheet header
 */
export const exportExcel = (rows, filename, title = "Report") => {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const exportDate = nowString();

  // ── Build AOA (array-of-arrays) ──────────────────────────────────────────
  const aoa = [
    [COMPANY_NAME],                          // row 1 – company name
    [COMPANY_TAGLINE],                       // row 2 – tagline
    [],                                      // row 3 – blank
    [title],                                 // row 4 – report title
    [`Date Exported: ${exportDate}`],        // row 5 – export date
    [],                                      // row 6 – blank
    headers,                                 // row 7 – column headers
    ...rows.map((row) => headers.map((h) => row[h] ?? "")), // data rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── Column widths ────────────────────────────────────────────────────────
  ws["!cols"] = autoColWidths(headers, rows);

  // ── Merge cells for company name, tagline, title, date ──────────────────
  const lastCol = headers.length - 1;
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }, // company name
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } }, // tagline
    { s: { r: 3, c: 0 }, e: { r: 3, c: lastCol } }, // title
    { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } }, // date
  ];

  // ── Cell styles (requires xlsx-style or SheetJS Pro; we set __style hints
  //    that some renderers pick up, and rely on conditional formatting for
  //    standard xlsx) ────────────────────────────────────────────────────────
  // Header row (row index 6, 0-based) – bold + background
  headers.forEach((_, ci) => {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c: ci });
    if (!ws[cellRef]) ws[cellRef] = { v: headers[ci], t: "s" };
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill: { fgColor: { rgb: "2FA14C" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        bottom: { style: "thin", color: { rgb: "43A047" } },
      },
    };
  });

  // Company name row – large bold
  const companyCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (ws[companyCell]) {
    ws[companyCell].s = {
      font: { bold: true, sz: 16, color: { rgb: "2FA14C" } },
      alignment: { horizontal: "left" },
    };
  }

  // Title row
  const titleCell = XLSX.utils.encode_cell({ r: 3, c: 0 });
  if (ws[titleCell]) {
    ws[titleCell].s = {
      font: { bold: true, sz: 13, color: { rgb: "0F172A" } },
      alignment: { horizontal: "left" },
    };
  }

  // Date row
  const dateCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
  if (ws[dateCell]) {
    ws[dateCell].s = {
      font: { italic: true, sz: 10, color: { rgb: "64748B" } },
      alignment: { horizontal: "left" },
    };
  }

  // Alternate row shading for data rows (starting at row index 7)
  rows.forEach((row, ri) => {
    headers.forEach((h, ci) => {
      const cellRef = XLSX.utils.encode_cell({ r: ri + 7, c: ci });
      if (!ws[cellRef]) ws[cellRef] = { v: row[h] ?? "", t: "s" };
      ws[cellRef].s = {
        fill: ri % 2 === 1 ? { fgColor: { rgb: "F1F5F9" } } : {},
        alignment: { vertical: "center", wrapText: false },
        border: {
          bottom: { style: "hair", color: { rgb: "E2E8F0" } },
        },
      };
    });
  });

  // ── Row heights ──────────────────────────────────────────────────────────
  ws["!rows"] = [
    { hpt: 28 }, // company name
    { hpt: 16 }, // tagline
    { hpt: 8  }, // blank
    { hpt: 22 }, // title
    { hpt: 14 }, // date
    { hpt: 8  }, // blank
    { hpt: 20 }, // header row
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
};

// ─── PDF ──────────────────────────────────────────────────────────────────────
/**
 * Export rows to a styled PDF file.
 * Peso signs (₱) are converted to "PHP " to avoid encoding issues in jsPDF.
 * @param {Object[]} rows     - Array of flat objects
 * @param {string}   title    - Report title
 * @param {string}   filename - Output filename (e.g. "report.pdf")
 */
export const exportPDF = (rows, title, filename) => {
  if (!rows || !rows.length) return;

  const doc = new jsPDF("l", "pt", "a4"); // landscape, points, A4
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const exportDate = nowString();
  const headers = Object.keys(rows[0]);
  const bodyData = rows.map((r) =>
    Object.values(r).map((v) => sanitizeForPDF(v))
  );
  // Also sanitize header labels
  const sanitizedHeaders = headers.map((h) => sanitizeForPDF(h));

  // ── Header band ──────────────────────────────────────────────────────────
  // Dark primary band across the top
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageW, 56, "F");

  // Accent stripe at the very top
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 0, pageW, 4, "F");

  // Company name (white, bold)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_WHITE);
  doc.text(COMPANY_NAME, 36, 26);

  // Tagline (lighter, smaller)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 200, 240);
  doc.text(COMPANY_TAGLINE, 36, 38);

  // Report title (right-aligned in the band)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_WHITE);
  doc.text(title, pageW - 36, 26, { align: "right" });

  // Date exported (right-aligned, below title)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 240);
  doc.text(`Date Exported: ${exportDate}`, pageW - 36, 38, { align: "right" });

  // ── Sub-header divider ───────────────────────────────────────────────────
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 56, pageW, 2, "F");

  // ── Table ────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: 68,
    head: [sanitizedHeaders],
    body: bodyData,
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
      font: "helvetica",
      textColor: COLOR_DARK,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: COLOR_DARK,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
    },
    alternateRowStyles: {
      fillColor: COLOR_LIGHT_ROW,
    },
    columnStyles: {
      // Give a bit more room to the first column
      0: { cellWidth: "auto" },
    },
    margin: { left: 36, right: 36, top: 68 },
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.3,

    // ── Page footer with page numbers ──────────────────────────────────────
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      // Footer line
      doc.setDrawColor(...COLOR_ACCENT);
      doc.setLineWidth(0.5);
      doc.line(36, pageH - 22, pageW - 36, pageH - 22);

      // Footer text – left: company name
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(COMPANY_NAME, 36, pageH - 10);

      // Footer text – center: report title
      doc.text(title, pageW / 2, pageH - 10, { align: "center" });

      // Footer text – right: page number
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageW - 36,
        pageH - 10,
        { align: "right" }
      );
    },
  });

  doc.save(filename);
};

// ─── PRINT ────────────────────────────────────────────────────────────────────
/**
 * Open a styled print-preview window and trigger the browser print dialog.
 * @param {Object[]} rows  - Array of flat objects
 * @param {string}   title - Report title
 */
export const printTable = (rows, title) => {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const printDate = nowString();

  const headerHtml = headers
    .map((h) => `<th>${h}</th>`)
    .join("");

  const bodyHtml = rows
    .map(
      (row, i) =>
        `<tr class="${i % 2 === 1 ? "alt" : ""}">${headers
          .map((h) => `<td>${row[h] ?? ""}</td>`)
          .join("")}</tr>`
    )
    .join("");

  const totalRows = rows.length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — ${COMPANY_NAME}</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Page setup ── */
    @page {
      size: A4 landscape;
      margin: 14mm 12mm 16mm 12mm;
    }

    body {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10px;
      color: #0f172a;
      background: #fff;
    }

    /* ── Header band ── */
    .report-header {
      background: linear-gradient(135deg, #2FA14C 0%, #43A047 60%, #66BB6A 100%);
      color: #fff;
      padding: 14px 20px 12px;
      border-radius: 6px 6px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0;
    }
    .report-header .left .company-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }
    .report-header .left .company-tagline {
      font-size: 8.5px;
      color: rgba(255,255,255,0.75);
      margin-top: 2px;
    }
    .report-header .right {
      text-align: right;
    }
    .report-header .right .report-title {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.2;
    }
    .report-header .right .report-date {
      font-size: 8px;
      color: rgba(255,255,255,0.75);
      margin-top: 3px;
    }

    /* ── Accent stripe ── */
    .accent-stripe {
      height: 3px;
      background: #43A047;
      margin-bottom: 12px;
    }

    /* ── Meta bar ── */
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 4px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 10px;
    }
    .meta-bar .meta-title {
      font-size: 12px;
      font-weight: 700;
      color: #2FA14C;
    }
    .meta-bar .meta-count {
      font-size: 9px;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    thead tr {
      background: #0f172a;
      color: #fff;
    }
    thead th {
      padding: 7px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 8.5px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      border-right: 1px solid rgba(255,255,255,0.08);
      white-space: nowrap;
    }
    thead th:last-child { border-right: none; }

    tbody tr td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
      color: #1e293b;
    }
    tbody tr.alt td {
      background: #f8fafc;
    }
    tbody tr:last-child td {
      border-bottom: 2px solid #cbd5e1;
    }

    /* ── Footer ── */
    .report-footer {
      margin-top: 14px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #94a3b8;
    }
    .report-footer .footer-company { font-weight: 600; color: #64748b; }

    /* ── Print-only tweaks ── */
    @media print {
      body { background: #fff; }
      .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody tr.alt td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .accent-stripe { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Header band -->
  <div class="report-header">
    <div class="left">
      <div class="company-name">${COMPANY_NAME}</div>
      <div class="company-tagline">${COMPANY_TAGLINE}</div>
    </div>
    <div class="right">
      <div class="report-title">${title}</div>
      <div class="report-date">Date Printed: ${printDate}</div>
    </div>
  </div>
  <div class="accent-stripe"></div>

  <!-- Meta bar -->
  <div class="meta-bar">
    <span class="meta-title">${title}</span>
    <span class="meta-count">${totalRows} record${totalRows !== 1 ? "s" : ""}</span>
  </div>

  <!-- Data table -->
  <table>
    <thead>
      <tr>${headerHtml}</tr>
    </thead>
    <tbody>${bodyHtml}</tbody>
  </table>

  <!-- Footer -->
  <div class="report-footer">
    <span class="footer-company">${COMPANY_NAME}</span>
    <span>This report was generated on ${printDate}</span>
    <span>Confidential — Internal Use Only</span>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=1100,height=750");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site to print reports.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the browser time to render before opening the print dialog
  setTimeout(() => {
    win.print();
    // Don't auto-close — let the user close after printing
  }, 600);
};
