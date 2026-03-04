import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function exportToWord(text: string, title: string) {
  const lines = text.split("\n");
  const paragraphs = lines.map((line, i) => {
    const trimmed = line.trim();
    const isTitle = i === 0 && trimmed.length > 0;
    return new Paragraph({
      alignment: isTitle ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: line,
          size: isTitle ? 32 : 24,
          bold: isTitle,
          font: "SimSun",
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
}

export function exportToPDF(text: string, title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("弹窗被浏览器拦截，请允许弹窗后重试");
  }

  const safeTitle = escapeHtml(title);
  const safeText = escapeHtml(text);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${safeTitle}</title>
      <style>
        body {
          font-family: "SimSun", "宋体", serif;
          padding: 60px 80px;
          font-size: 14px;
          line-height: 1.8;
          color: #000;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: inherit; line-height: inherit;">${safeText}</pre>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
