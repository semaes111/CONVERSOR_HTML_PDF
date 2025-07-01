import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ConversionOptions, UploadedFile } from '../types';

export const convertToPDF = async (
  file: UploadedFile,
  options: ConversionOptions,
  onProgress: (progress: number) => void
): Promise<Blob> => {
  onProgress(10);

  // Create a temporary container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width in pixels at 96 DPI
  container.style.padding = '40px';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';

  if (file.type === 'text/html') {
    container.innerHTML = file.content;
  } else {
    // For TXT files, preserve formatting
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordWrap = 'break-word';
    pre.style.fontFamily = 'monospace';
    pre.textContent = file.content;
    container.appendChild(pre);
  }

  document.body.appendChild(container);
  onProgress(30);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 794,
      height: container.scrollHeight
    });

    onProgress(60);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20); // Account for margins

    // Add additional pages if needed
    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight + 10;
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    onProgress(90);

    const pdfBlob = pdf.output('blob');
    onProgress(100);

    return pdfBlob;
  } finally {
    document.body.removeChild(container);
  }
};

import * as mammoth from 'mammoth';

export const convertToDOCX = async (
  file: UploadedFile,
  options: ConversionOptions,
  onProgress: (progress: number) => void
): Promise<Blob> => {
  onProgress(10);

  try {
    onProgress(30);

    let htmlContent = file.content;
    // If the file is not HTML, wrap it in a <pre> tag to preserve formatting.
    if (file.type !== 'text/html') {
      htmlContent = `<pre>${file.content}</pre>`;
    }

    // mammoth.js is designed for .docx to HTML, not HTML to .docx.
    // The existing XML-based approach is a fallback.
    // For robust HTML to DOCX, a library like html-to-docx is needed,
    // but it might be too heavy or have other implications.
    // For now, we'll stick to the existing simple XML generation.
    // This means complex HTML structures won't be perfectly preserved.

    // Extract text content if HTML, otherwise use content as is
    let textContent = file.content;
    if (file.type === 'text/html') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = file.content; // Sanitize or process HTML as needed
      textContent = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    // Split into paragraphs more robustly
    const paragraphs = textContent.split(/\n{2,}|<br\s*\/?>/i) // Split by double newlines or <br>
      .map(p => p.replace(/\n/g, ' ').trim()) // Replace single newlines with spaces within paragraphs
      .filter(line => line !== '');

    // Generate paragraph XML
    const paragraphsXml = paragraphs.map(paragraph => {
      const escapedText = paragraph
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `
        <w:p>
          <w:pPr>
            <w:spacing w:after="120"/> {/* Default spacing after paragraph */}
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
              <w:sz w:val="22"/> {/* Default font size 11pt (22 half-points) */}
            </w:rPr>
            <w:t>${escapedText}</w:t>
          </w:r>
        </w:p>`;
    }).join('');

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
      ${paragraphsXml}
      <w:sectPr>
        <w:pgSz w:w="12240" w:h="15840"/> {/* A4 size */}
        <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/> {/* 1 inch margins */}
      </w:sectPr>
    </w:body>
  </w:document>`;

    onProgress(60);

    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default; // Ensure JSZip is imported
    const zip = new JSZip();

    // Add required files for DOCX format
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  </Types>`);

    zip.folder('_rels')?.file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  </Relationships>`);

    const wordFolder = zip.folder('word');
    wordFolder?.file('document.xml', documentXml);

    wordFolder?.folder('_rels')?.file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  </Relationships>`);

    // Generate the zip file
    const docxBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    onProgress(100);

    return docxBlob;
  } catch (error) {
    console.error('Error in convertToDOCX:', error);
    throw new Error(`DOCX conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};