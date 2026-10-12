import {
  Document as DocxDocument,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import {
  extractPdfDocumentStructure,
  ExtractedPageStructure,
  ExtractedLayoutBlock,
  ExtractedTableBlock,
  ExtractedTableRow,
} from './pdfStructureExtractor';

export interface PdfToWordProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
  stage: string;
}

export interface PdfToWordResult {
  docxBlob: Blob;
  filename: string;
  pageCount: number;
  totalWords: number;
  textPreview: string;
  isScanned: boolean;
  ocrApplied: boolean;
  ocrPagesCount: number;
  hasTables: boolean;
  hasHeadings: boolean;
  failedPages?: number[];
}

/**
 * Validates PDF file header and structure
 */
function validatePdfBytes(buffer: ArrayBuffer): void {
  if (buffer.byteLength < 32) {
    throw new Error('The uploaded file is empty or too small to be a valid PDF.');
  }

  const headerBytes = new Uint8Array(buffer.slice(0, 1024));
  const headerString = new TextDecoder('ascii').decode(headerBytes);

  if (!headerString.includes('%PDF-')) {
    throw new Error('Invalid file format. The uploaded file does not contain a valid PDF header signature (%PDF-).');
  }
}

/**
 * Verifies that the produced Blob is a genuine, valid Office Open XML package
 */
async function validateDocxPackage(blob: Blob): Promise<void> {
  if (!blob || blob.size < 1000) {
    throw new Error('Failed to generate Word document: Output package is too small or empty.');
  }

  const sample = await blob.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(sample);

  // Office Open XML (.docx) files are ZIP archives starting with magic bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4B || bytes[2] !== 0x03 || bytes[3] !== 0x04) {
    throw new Error('Generated file validation failed: Corrupted Office Open XML archive structure.');
  }
}

/**
 * Builds an authentic, styled Microsoft Word Table element from tabular rows
 */
function buildDocxTable(rowsData: ExtractedTableRow[]): Table {
  const numCols = Math.max(...rowsData.map((r) => r.cells.length), 1);
  const colWidthPct = Math.max(1, Math.floor(100 / numCols));

  const tableRows: TableRow[] = rowsData.map((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    const cells: TableCell[] = [];

    for (let c = 0; c < numCols; c++) {
      const cellData = row.cells[c];
      const cellText = cellData ? cellData.text : '';
      const isCellBold = isHeader || (cellData?.isBold ?? false);

      cells.push(
        new TableCell({
          width: {
            size: colWidthPct,
            type: WidthType.PERCENTAGE,
          },
          shading: isHeader
            ? { fill: 'F1F5F9' } // Modern slate-100 header
            : rowIdx % 2 === 1
            ? { fill: 'F8FAFC' } // Subtle alternating row tint
            : undefined,
          margins: {
            top: 100, // ~5pt
            bottom: 100,
            left: 140, // ~7pt
            right: 140,
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: isCellBold,
                  size: isHeader ? 21 : 20, // 10.5pt header, 10pt body
                  color: isHeader ? '0F172A' : '334155',
                }),
              ],
              spacing: { after: 0, line: 240 },
            }),
          ],
        })
      );
    }

    return new TableRow({
      children: cells,
      tableHeader: isHeader,
    });
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: tableRows,
  });
}

/**
 * Synthesizes page blocks into DOCX Paragraphs and Tables
 */
function buildDocxSectionContent(
  page: ExtractedPageStructure,
  isFirstPage: boolean
): { elements: (Paragraph | Table)[]; tablesCount: number } {
  const elements: (Paragraph | Table)[] = [];
  let tablesCount = 0;

  // Add clean page break before subsequent pages
  if (!isFirstPage) {
    elements.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  if (page.blocks.length === 0 || page.isScannedOrEmpty) {
    elements.push(
      new Paragraph({
        text: '',
        spacing: { after: 120 },
      })
    );
    return { elements, tablesCount: 0 };
  }

  for (const block of page.blocks) {
    if (block.type === 'table') {
      elements.push(buildDocxTable(block.rows));
      elements.push(new Paragraph({ text: '', spacing: { after: 140 } }));
      tablesCount++;
      continue;
    }

    if (block.type === 'heading') {
      const headingLevel =
        block.headingLevel === 1
          ? HeadingLevel.HEADING_1
          : block.headingLevel === 2
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;

      elements.push(
        new Paragraph({
          text: block.text,
          heading: headingLevel,
          spacing: {
            before: block.headingLevel === 1 ? 320 : 200,
            after: 120,
          },
        })
      );
      continue;
    }

    if (block.type === 'list') {
      if (block.isBullet) {
        const cleanBulletText = block.text.replace(/^([•◦\-\*–—\u2022\u25cf]|\([•◦\-\*]\))\s*/, '');
        elements.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: cleanBulletText,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      } else {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.text,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
      continue;
    }

    // Standard paragraph: build runs from line items preserving mixed styles
    const paragraphRuns: TextRun[] = [];
    for (const line of block.lines) {
      for (let itemIdx = 0; itemIdx < line.items.length; itemIdx++) {
        const item = line.items[itemIdx];
        const prevItem = line.items[itemIdx - 1];
        let itemStr = item.text;

        if (prevItem) {
          const gap = item.x - (prevItem.x + prevItem.width);
          if (gap > 2 && !itemStr.startsWith(' ')) {
            itemStr = ' ' + itemStr;
          }
        } else if (paragraphRuns.length > 0 && !itemStr.startsWith(' ')) {
          itemStr = ' ' + itemStr;
        }

        paragraphRuns.push(
          new TextRun({
            text: itemStr,
            bold: item.isBold,
            italics: item.isItalic,
            size: Math.max(18, Math.min(30, Math.round(item.fontSize * 2))),
            color: '0F172A',
          })
        );
      }
    }

    if (paragraphRuns.length > 0) {
      elements.push(
        new Paragraph({
          children: paragraphRuns,
          spacing: { after: 140, line: 276 },
        })
      );
    }
  }

  return { elements, tablesCount };
}

/**
 * Genuine PDF to Word (.docx) Conversion Pipeline using pdfStructureExtractor
 */
export async function convertPdfToDocx(
  file: File,
  onProgress?: (progress: PdfToWordProgress) => void
): Promise<PdfToWordResult> {
  if (!file) {
    throw new Error('No PDF file provided for conversion.');
  }

  if (file.size > 100 * 1024 * 1024) {
    throw new Error('File exceeds maximum supported conversion size of 100MB.');
  }

  onProgress?.({
    currentPage: 0,
    totalPages: 0,
    percent: 10,
    stage: 'Validating PDF structure and reading document streams...',
  });

  const arrayBuffer = await file.arrayBuffer();
  validatePdfBytes(arrayBuffer);

  // Use pdfStructureExtractor getDocument utility
  const docStructure = await extractPdfDocumentStructure(new Uint8Array(arrayBuffer), {
    onProgress: (page, total, percent, stage) => {
      onProgress?.({
        currentPage: page,
        totalPages: total,
        percent: Math.round(10 + percent * 0.7),
        stage,
      });
    },
  });

  const numPages = docStructure.pageCount;
  if (numPages === 0) {
    throw new Error('PDF document contains zero pages.');
  }

  onProgress?.({
    currentPage: numPages,
    totalPages: numPages,
    percent: 82,
    stage: 'Assembling Office Open XML Word document (.docx)...',
  });

  const allDocxElements: (Paragraph | Table)[] = [];
  let totalTablesCount = 0;

  // Title header
  const title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  allDocxElements.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PDF by Swahivo Document Engine • ${numPages} page${numPages > 1 ? 's' : ''} processed`,
          italics: true,
          color: '64748B',
          size: 18,
        }),
      ],
      spacing: { after: 280 },
    })
  );

  // Validate that document has recoverable content
  if (docStructure.failedOcrPages && docStructure.failedOcrPages.length === numPages && docStructure.totalWords === 0) {
    throw new Error(`Optical Character Recognition failed on page(s) ${docStructure.failedOcrPages.join(', ')}. Please verify the scanned document image quality.`);
  }

  if (docStructure.totalWords === 0 && docStructure.totalCharacters === 0) {
    throw new Error('Conversion rejected: The document contains zero readable text or recognizable OCR characters.');
  }

  // Synthesize body page by page
  for (let i = 0; i < docStructure.pages.length; i++) {
    const { elements, tablesCount } = buildDocxSectionContent(docStructure.pages[i], i === 0 && !docStructure.isScanned);
    allDocxElements.push(...elements);
    totalTablesCount += tablesCount;
  }

  onProgress?.({
    currentPage: numPages,
    totalPages: numPages,
    percent: 92,
    stage: 'Packaging OpenXML ZIP container and verifying format integrity...',
  });

  const doc = new DocxDocument({
    creator: 'Swahivo Document Engine',
    title: file.name.replace(/\.[^/.]+$/, ''),
    description: 'Converted from PDF with preserved paragraphs, tables, and headings',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: allDocxElements,
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  await validateDocxPackage(docxBlob);

  onProgress?.({
    currentPage: numPages,
    totalPages: numPages,
    percent: 100,
    stage: 'Conversion complete! Word document verified and ready.',
  });

  const outBaseName = file.name.replace(/\.[^/.]+$/, '');
  const outFilename = `${outBaseName}.docx`;

  const previewSnippet = docStructure.fullText.slice(0, 800).trim();

  return {
    docxBlob,
    filename: outFilename,
    pageCount: numPages,
    totalWords: docStructure.totalWords,
    textPreview: previewSnippet || (docStructure.ocrApplied ? `[OCR Recognized Document: ${docStructure.totalWords} words]` : ''),
    isScanned: docStructure.isScanned,
    ocrApplied: docStructure.ocrApplied ?? false,
    ocrPagesCount: docStructure.ocrPagesCount ?? 0,
    hasTables: totalTablesCount > 0 || docStructure.hasTables,
    hasHeadings: docStructure.hasHeadings,
    failedPages: docStructure.failedOcrPages,
  };
}
