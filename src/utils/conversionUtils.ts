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

// Simple DOCX generator using XML structure
const createDocxXml = (content: string): string => {
  // Extract text content if HTML
  let textContent = content;
  if (content.includes('<') && content.includes('>')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    textContent = tempDiv.textContent || tempDiv.innerText || '';
  }

  // Split into paragraphs
  const paragraphs = textContent.split('\n').filter(line => line.trim() !== '');
  
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
          <w:spacing w:after="120"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:sz w:val="22"/>
          </w:rPr>
          <w:t>${escapedText}</w:t>
        </w:r>
      </w:p>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphsXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
};

// Create minimal DOCX structure
const createDocxZip = async (documentXml: string): Promise<Blob> => {
  // Import JSZip dynamically
  const JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
  
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
  const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  return content;
};

export const convertToDOCX = async (
  file: UploadedFile,
  options: ConversionOptions,
  onProgress: (progress: number) => void
): Promise<Blob> => {
  onProgress(10);

  try {
    onProgress(30);

    // Create the document XML
    const documentXml = createDocxXml(file.content);
    
    onProgress(60);

    // Create the DOCX zip structure
    const docxBlob = await createDocxZip(documentXml);
    
    onProgress(100);

    return docxBlob;
  } catch (error) {
    console.error('Error in convertToDOCX:', error);
    throw new Error(`DOCX conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};