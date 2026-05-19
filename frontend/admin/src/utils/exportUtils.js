import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, HeadingLevel, BorderStyle } from "docx";
import { saveAs } from "file-saver";

// ─── EXCEL ────────────────────────────────────────────────────────────────────
export const exportExcel = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const data = rows.map(row => headers.map(h => String(row[h] ?? "")));
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  worksheet["!cols"] = headers.map(() => ({ wch: 22 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, filename);
};

// ─── PDF ──────────────────────────────────────────────────────────────────────
export const exportPDF = (rows, title, filename) => {
  if (!rows.length) return;
  const doc = new jsPDF("l", "pt", "a4");
  doc.setFontSize(14);
  doc.text(title, 40, 36);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 52);
  autoTable(doc, {
    startY: 66,
    head: [Object.keys(rows[0])],
    body: rows.map(r => Object.values(r).map(v => String(v ?? ""))),
    styles: { fontSize: 7.5, cellPadding: 4 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
  });
  doc.save(filename);
};

// ─── DOCX ─────────────────────────────────────────────────────────────────────
export const exportDOCX = async (rows, title, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);

  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
        shading: { fill: "282828", color: "FFFFFF" },
        width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA },
      })
    ),
  });

  const dataRows = rows.map(row =>
    new TableRow({
      children: headers.map(h =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(row[h] ?? ""), size: 16 })] })],
          width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA },
        })
      ),
    })
  );

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, italics: true, size: 16 })] }),
        new Paragraph(""),
        new Table({ rows: [headerRow, ...dataRows], width: { size: 9000, type: WidthType.DXA } }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};

// ─── PRINT ────────────────────────────────────────────────────────────────────
export const printTable = (rows, title) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);

  const headerHtml = headers.map(h => `<th>${h}</th>`).join("");
  const bodyHtml = rows.map(row =>
    `<tr>${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`
  ).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
        h2 { font-size: 15px; margin-bottom: 4px; }
        p.meta { font-size: 10px; color: #666; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #282828; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; }
        td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; font-size: 10px; }
        tr:nth-child(even) td { background: #f8f8f8; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <h2>${title}</h2>
      <p class="meta">Generated: ${new Date().toLocaleString()}</p>
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
};
