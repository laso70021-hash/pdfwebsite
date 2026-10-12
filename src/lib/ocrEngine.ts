import {
  ExtractedLayoutBlock,
  ExtractedTableBlock,
  ExtractedTableRow,
  ExtractedTableCell,
  ExtractedParagraphBlock,
  ExtractedLineStructure,
  ExtractedFontTextItem,
} from './pdfStructureExtractor';

export interface OcrPageResult {
  pageNumber: number;
  text: string;
  blocks: ExtractedLayoutBlock[];
  hasTables: boolean;
  hasHeadings: boolean;
  wordCount: number;
  characterCount: number;
  modelUsed?: string;
}

/**
 * Renders a PDF.js PDFPageProxy to a high-resolution image data URL (scale 2.0 = ~150-200 DPI)
 */
export async function renderPdfPageToImage(
  pageProxy: any,
  scale = 2.0
): Promise<{ dataUrl: string; mimeType: string; width: number; height: number }> {
  const viewport = pageProxy.getViewport({ scale });

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d', { alpha: false });

    if (ctx) {
      // Paint white background to prevent transparent artifacts in scans
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      await pageProxy.render(renderContext).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      return {
        dataUrl,
        mimeType: 'image/jpeg',
        width: canvas.width,
        height: canvas.height,
      };
    }
  }

  throw new Error('Canvas rendering is not supported in this environment');
}

/**
 * Creates dummy line structure for text runs
 */
function createSyntheticLine(
  text: string,
  options?: { isBold?: boolean; isItalic?: boolean; fontSize?: number; isHeading?: boolean; headingLevel?: 1 | 2 | 3; isBullet?: boolean }
): ExtractedLineStructure {
  const isBold = options?.isBold ?? false;
  const fontSize = options?.fontSize ?? 11;
  const item: ExtractedFontTextItem = {
    text,
    x: 50,
    y: 750,
    width: text.length * 6,
    height: fontSize,
    fontSize,
    fontName: isBold ? 'Helvetica-Bold' : 'Helvetica',
    isBold,
    isItalic: options?.isItalic ?? false,
    dir: 'ltr',
    transform: [1, 0, 0, 1, 50, 750],
  };

  return {
    items: [item],
    text,
    y: 750,
    minX: 50,
    maxX: 50 + text.length * 6,
    width: text.length * 6,
    avgFontSize: fontSize,
    isBold,
    isHeading: options?.isHeading ?? false,
    headingLevel: options?.headingLevel,
    isBullet: options?.isBullet ?? false,
    isNumberedList: false,
  };
}

/**
 * Parses markdown-formatted OCR text into structured document layout blocks (headings, tables, lists, paragraphs)
 */
export function parseOcrTextToBlocks(rawText: string): {
  blocks: ExtractedLayoutBlock[];
  hasTables: boolean;
  hasHeadings: boolean;
} {
  const blocks: ExtractedLayoutBlock[] = [];
  let hasTables = false;
  let hasHeadings = false;

  const lines = rawText.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Skip completely blank lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Detect Markdown Table
    // E.g. | Col 1 | Col 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|', 1)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const rows: ExtractedTableRow[] = [];
      let maxCols = 1;

      for (const tLine of tableLines) {
        // Skip separator row like | --- | --- |
        if (/^\|(\s*[-:]+[-|\s:]*)\|$/.test(tLine)) {
          continue;
        }

        // Split by pipe and remove empty boundary items
        const rawCells = tLine.split('|');
        if (rawCells.length >= 3) {
          const contentCells = rawCells.slice(1, -1).map((c) => c.trim());
          if (contentCells.length > 0) {
            maxCols = Math.max(maxCols, contentCells.length);
            const isHeaderRow = rows.length === 0;
            const cells: ExtractedTableCell[] = contentCells.map((c, colIdx) => ({
              text: c.replace(/\*\*/g, ''),
              isBold: isHeaderRow || c.startsWith('**'),
              minX: colIdx * 100,
              maxX: (colIdx + 1) * 100,
            }));

            rows.push({
              cells,
              y: 700 - rows.length * 20,
            });
          }
        }
      }

      if (rows.length > 0) {
        hasTables = true;
        const columnBounds = Array.from({ length: maxCols }, (_, idx) => idx * 100);
        blocks.push({
          type: 'table',
          rows,
          columnCount: maxCols,
          columnBounds,
        });
        continue;
      }
    }

    // 3. Detect Headings (# Heading 1, ## Heading 2, ### Heading 3)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      hasHeadings = true;
      const level = headingMatch[1].length as 1 | 2 | 3;
      const headingText = headingMatch[2].replace(/\*\*/g, '').trim();
      const syntheticLine = createSyntheticLine(headingText, {
        isBold: true,
        fontSize: level === 1 ? 16 : level === 2 ? 14 : 12,
        isHeading: true,
        headingLevel: level,
      });

      blocks.push({
        type: 'heading',
        headingLevel: level,
        text: headingText,
        lines: [syntheticLine],
      });
      i++;
      continue;
    }

    // 4. Detect Bullet Lists or Numbered Lists
    const bulletMatch = trimmed.match(/^([•◦\-\*]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      const isNumbered = /^\d+\./.test(bulletMatch[1]);
      const listText = bulletMatch[2].trim();
      const syntheticLine = createSyntheticLine(listText, {
        fontSize: 11,
        isBullet: !isNumbered,
      });

      blocks.push({
        type: 'list',
        isBullet: !isNumbered,
        isNumberedList: isNumbered,
        text: trimmed,
        lines: [syntheticLine],
      });
      i++;
      continue;
    }

    // 5. Regular Paragraph (accumulate multi-line paragraphs until blank line or special structure)
    const pLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (!cur) break;
      if (cur.startsWith('|') && cur.endsWith('|')) break;
      if (/^#{1,3}\s+/.test(cur)) break;
      if (/^([•◦\-\*]|\d+\.)\s+/.test(cur)) break;

      pLines.push(cur);
      i++;
    }

    if (pLines.length > 0) {
      const pText = pLines.join(' ');
      const syntheticLines = pLines.map((l) => createSyntheticLine(l, { fontSize: 11 }));

      blocks.push({
        type: 'paragraph',
        text: pText,
        lines: syntheticLines,
      });
    }
  }

  return { blocks, hasTables, hasHeadings };
}

/**
 * Invokes Swahivo OCR on a scanned page and returns structured layout blocks and text
 */
export async function runSwahivoOcrOnPage(
  input: {
    pageNumber: number;
    imageBase64?: string;
    mimeType?: string;
    pdfBase64?: string;
  }
): Promise<OcrPageResult> {
  const { pageNumber, imageBase64, mimeType = 'image/jpeg', pdfBase64 } = input;

  if (!imageBase64 && !pdfBase64) {
    throw new Error(`Page ${pageNumber}: Missing image or PDF payload for OCR.`);
  }

  const baseUrl = typeof window !== 'undefined' ? '' : (process.env.API_BASE_URL || 'http://localhost:3000');
  const response = await fetch(`${baseUrl}/api/ai/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      pdfBase64,
      pageNumber,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errJson: any;
    try {
      errJson = JSON.parse(errText);
    } catch {
      // ignore
    }
    throw new Error(errJson?.error || `OCR server error on page ${pageNumber} (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!data.success || typeof data.text !== 'string') {
    throw new Error(data.error || `OCR did not return recognized text for page ${pageNumber}.`);
  }

  const recognizedText = data.text.trim();
  const words = recognizedText.split(/\s+/).filter(Boolean);

  // Parse recognized text into structured layout blocks (preserving headings, tables, and lists)
  const { blocks, hasTables, hasHeadings } = parseOcrTextToBlocks(recognizedText);

  return {
    pageNumber,
    text: recognizedText,
    blocks,
    hasTables,
    hasHeadings,
    wordCount: words.length,
    characterCount: recognizedText.length,
    modelUsed: data.modelUsed,
  };
}
