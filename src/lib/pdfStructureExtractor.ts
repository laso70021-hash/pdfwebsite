import * as pdfjsLib from 'pdfjs-dist';
import { renderPdfPageToImage, runSwahivoOcrOnPage } from './ocrEngine';

// Polyfill Promise.try for environments that do not natively support it yet
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function <T>(fn: (...args: any[]) => T | PromiseLike<T>, ...args: any[]) {
    return new Promise<T>((resolve) => resolve(fn(...args)));
  };
}

// Safely configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} else {
  // In Node.js environments, load worker module directly
  import('pdfjs-dist/build/pdf.worker.mjs').catch(() => {});
}

/**
 * Detailed text item with font and spatial coordinates
 */
export interface ExtractedFontTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
  dir: string;
  transform: number[];
}

/**
 * Extracted line with detected structural characteristics
 */
export interface ExtractedLineStructure {
  items: ExtractedFontTextItem[];
  text: string;
  y: number;
  minX: number;
  maxX: number;
  width: number;
  avgFontSize: number;
  isBold: boolean;
  isHeading: boolean;
  headingLevel?: 1 | 2 | 3;
  isBullet: boolean;
  isNumberedList: boolean;
}

/**
 * Tabular cell structure
 */
export interface ExtractedTableCell {
  text: string;
  isBold: boolean;
  minX: number;
  maxX: number;
}

/**
 * Tabular row structure
 */
export interface ExtractedTableRow {
  cells: ExtractedTableCell[];
  y: number;
}

/**
 * Detected table block with column layout
 */
export interface ExtractedTableBlock {
  type: 'table';
  rows: ExtractedTableRow[];
  columnCount: number;
  columnBounds: number[];
}

/**
 * Detected paragraph block
 */
export interface ExtractedParagraphBlock {
  type: 'paragraph' | 'heading' | 'list';
  headingLevel?: 1 | 2 | 3;
  isBullet?: boolean;
  isNumberedList?: boolean;
  lines: ExtractedLineStructure[];
  text: string;
}

export type ExtractedLayoutBlock = ExtractedTableBlock | ExtractedParagraphBlock;

/**
 * Comprehensive page layout and structure info
 */
export interface ExtractedPageStructure {
  pageNumber: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  lines: ExtractedLineStructure[];
  blocks: ExtractedLayoutBlock[];
  rawText: string;
  medianFontSize: number;
  wordCount: number;
  characterCount: number;
  isScannedOrEmpty: boolean;
  ocrApplied?: boolean;
  ocrError?: string;
}

/**
 * Document-level extraction summary
 */
export interface ExtractedPdfDocument {
  pageCount: number;
  totalPages: number;
  pages: ExtractedPageStructure[];
  fullText: string;
  totalWords: number;
  totalCharacters: number;
  hasTables: boolean;
  hasHeadings: boolean;
  isScanned: boolean;
  ocrApplied?: boolean;
  ocrPagesCount?: number;
  failedOcrPages?: number[];
  metadata?: Record<string, any>;
}

export interface PdfExtractorOptions {
  onProgress?: (page: number, total: number, percent: number, stage: string) => void;
  password?: string;
  yTolerance?: number;
  columnGapThreshold?: number;
  enableOcr?: boolean;
}

/**
 * Extracts distinct column cells from a single line
 */
export function extractLineColumnCells(
  line: ExtractedLineStructure,
  columnGapThreshold = 15
): ExtractedTableCell[] {
  if (line.items.length === 0) return [];

  const cells: ExtractedTableCell[] = [];
  let currentCellText = '';
  let currentMinX = -1;
  let currentMaxX = 0;
  let currentBoldCount = 0;
  let currentItemCount = 0;
  let lastItemEndX = -1;

  for (const item of line.items) {
    const isWideWhitespace = item.text.trim() === '' && item.width >= columnGapThreshold;
    const isWideGap = lastItemEndX >= 0 && item.x - lastItemEndX >= columnGapThreshold;

    if ((isWideWhitespace || isWideGap) && currentCellText.trim().length > 0) {
      cells.push({
        text: currentCellText.trim(),
        isBold: currentBoldCount >= Math.ceil(currentItemCount / 2),
        minX: currentMinX >= 0 ? currentMinX : 0,
        maxX: currentMaxX,
      });
      currentCellText = '';
      currentMinX = -1;
      currentBoldCount = 0;
      currentItemCount = 0;
    }

    if (item.text.trim().length === 0) {
      if (!isWideWhitespace && currentCellText.length > 0 && !currentCellText.endsWith(' ')) {
        currentCellText += ' ';
      }
      lastItemEndX = item.x + item.width;
      continue;
    }

    if (currentMinX < 0) {
      currentMinX = item.x;
    }

    if (currentCellText.length > 0 && !currentCellText.endsWith(' ') && !item.text.startsWith(' ')) {
      const gap = lastItemEndX >= 0 ? item.x - lastItemEndX : 0;
      if (gap > 2) currentCellText += ' ';
    }

    currentCellText += item.text;
    currentMaxX = item.x + item.width;
    lastItemEndX = item.x + item.width;
    if (item.isBold) currentBoldCount++;
    currentItemCount++;
  }

  if (currentCellText.trim().length > 0) {
    cells.push({
      text: currentCellText.trim(),
      isBold: currentBoldCount >= Math.ceil(currentItemCount / 2),
      minX: currentMinX >= 0 ? currentMinX : 0,
      maxX: currentMaxX,
    });
  }

  return cells;
}

/**
 * Checks whether two rows share matching column boundaries
 */
export function areRowsAlignedInTable(
  rowA: ExtractedTableCell[],
  rowB: ExtractedTableCell[],
  xTolerance = 35
): boolean {
  if (rowA.length < 2 || rowB.length < 2) return false;
  if (Math.abs(rowA.length - rowB.length) > 1) return false;

  let matchCount = 0;
  for (const cA of rowA) {
    if (rowB.some((cB) => Math.abs(cA.minX - cB.minX) <= xTolerance)) {
      matchCount++;
    }
  }
  return matchCount >= Math.min(rowA.length, rowB.length) - 1 && matchCount >= 2;
}

/**
 * Parses a single PDFPageProxy into full layout & structural metrics
 */
export async function extractPdfPageStructure(
  pdfPage: any,
  pageIndex: number,
  options?: PdfExtractorOptions
): Promise<ExtractedPageStructure> {
  const viewport = pdfPage.getViewport({ scale: 1.0 });
  const textContent = await pdfPage.getTextContent({ normalizeWhitespace: true });

  const rawItems: ExtractedFontTextItem[] = [];

  for (const item of textContent.items) {
    if (!('str' in item) || !item.str) continue;
    const str = item.str;

    const transform = item.transform || [1, 0, 0, 1, 0, 0];
    const x = transform[4] ?? 0;
    const y = transform[5] ?? 0;
    const fontSize = Math.abs(transform[0]) || Math.abs(transform[3]) || item.height || 10;
    const fontName = (item.fontName || '').toLowerCase();

    const isBold =
      fontName.includes('bold') ||
      fontName.includes('black') ||
      fontName.includes('heavy') ||
      fontName.includes('700') ||
      fontName.includes('800');

    const isItalic = fontName.includes('italic') || fontName.includes('oblique');

    rawItems.push({
      text: str,
      x,
      y,
      width: item.width || 0,
      height: item.height || fontSize,
      fontSize,
      fontName: item.fontName || '',
      isBold,
      isItalic,
      dir: item.dir || 'ltr',
      transform,
    });
  }

  // Calculate median body font size
  const fontSizes = rawItems
    .map((i) => i.fontSize)
    .filter((s) => s > 0)
    .sort((a, b) => a - b);
  const medianFontSize = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 11;

  // Group items into lines by vertical proximity
  const lineBuckets: { y: number; items: ExtractedFontTextItem[] }[] = [];
  const yTolerance = options?.yTolerance ?? 3.5;

  for (const item of rawItems) {
    let bucket = lineBuckets.find((b) => Math.abs(b.y - item.y) <= yTolerance);
    if (!bucket) {
      bucket = { y: item.y, items: [] };
      lineBuckets.push(bucket);
    }
    bucket.items.push(item);
  }

  // Sort lines top-to-bottom (in PDF coordinate system, higher Y is top of page)
  lineBuckets.sort((a, b) => b.y - a.y);

  const lines: ExtractedLineStructure[] = [];
  const lineStrings: string[] = [];

  for (const bucket of lineBuckets) {
    bucket.items.sort((a, b) => a.x - b.x);

    let lineText = '';
    let lastX = -1;
    let totalFontSize = 0;
    let boldCount = 0;

    for (const item of bucket.items) {
      if (lastX >= 0) {
        const gap = item.x - lastX;
        if (gap > 2 && !lineText.endsWith(' ') && !item.text.startsWith(' ')) {
          lineText += ' ';
        }
      }
      lineText += item.text;
      lastX = item.x + item.width;
      totalFontSize += item.fontSize;
      if (item.isBold) boldCount++;
    }

    const trimmed = lineText.trim();
    if (!trimmed) continue;

    const avgFontSize = bucket.items.length > 0 ? totalFontSize / bucket.items.length : medianFontSize;
    const isLineBold = boldCount >= Math.ceil(bucket.items.length / 2);

    const isBullet = /^([•◦\-\*–—\u2022\u25cf]|\([•◦\-\*]\))\s+/.test(trimmed);
    const isNumberedList = /^(\d{1,3}[\.\)]|[a-zA-Z][\.\)]|\([0-9a-zA-Z]\))\s+/.test(trimmed);

    let isHeading = false;
    let headingLevel: 1 | 2 | 3 | undefined;

    if (!isBullet && !isNumberedList) {
      if (avgFontSize >= medianFontSize * 1.55 || (avgFontSize >= medianFontSize * 1.3 && isLineBold)) {
        isHeading = true;
        headingLevel = 1;
      } else if (
        avgFontSize >= medianFontSize * 1.25 ||
        (avgFontSize >= medianFontSize * 1.1 && isLineBold && trimmed.length < 90)
      ) {
        isHeading = true;
        headingLevel = 2;
      } else if (isLineBold && trimmed.length < 60 && !trimmed.endsWith('.')) {
        isHeading = true;
        headingLevel = 3;
      }
    }

    const minX = bucket.items[0]?.x ?? 0;
    const lastItem = bucket.items[bucket.items.length - 1];
    const maxX = lastItem ? lastItem.x + lastItem.width : minX;

    lines.push({
      items: bucket.items,
      text: trimmed,
      y: bucket.y,
      minX,
      maxX,
      width: maxX - minX,
      avgFontSize,
      isBold: isLineBold,
      isHeading,
      headingLevel,
      isBullet,
      isNumberedList,
    });

    lineStrings.push(trimmed);
  }

  // Group lines into high-level blocks (Tables, Headings, Lists, Paragraphs)
  const blocks: ExtractedLayoutBlock[] = [];
  const lineCellsList = lines.map((l) => extractLineColumnCells(l, options?.columnGapThreshold));

  let lineIdx = 0;
  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const cells = lineCellsList[lineIdx];

    // Check for table structure
    if (!line.isHeading && !line.isBullet && !line.isNumberedList && cells.length >= 2) {
      const tableRows: ExtractedTableRow[] = [{ cells, y: line.y }];
      let nextIdx = lineIdx + 1;

      while (nextIdx < lines.length) {
        const nextLine = lines[nextIdx];
        if (nextLine.isHeading || nextLine.isBullet || nextLine.isNumberedList) break;
        const nextCells = lineCellsList[nextIdx];
        if (areRowsAlignedInTable(tableRows[tableRows.length - 1].cells, nextCells)) {
          tableRows.push({ cells: nextCells, y: nextLine.y });
          nextIdx++;
        } else {
          break;
        }
      }

      if (tableRows.length >= 2) {
        const numCols = Math.max(...tableRows.map((r) => r.cells.length));
        blocks.push({
          type: 'table',
          rows: tableRows,
          columnCount: numCols,
          columnBounds: tableRows[0].cells.map((c) => c.minX),
        });
        lineIdx = nextIdx;
        continue;
      }
    }

    // Heading block
    if (line.isHeading) {
      blocks.push({
        type: 'heading',
        headingLevel: line.headingLevel || 1,
        lines: [line],
        text: line.text,
      });
      lineIdx++;
      continue;
    }

    // List item block
    if (line.isBullet || line.isNumberedList) {
      blocks.push({
        type: 'list',
        isBullet: line.isBullet,
        isNumberedList: line.isNumberedList,
        lines: [line],
        text: line.text,
      });
      lineIdx++;
      continue;
    }

    // Regular paragraph block (grouping continuous lines)
    const pLines: ExtractedLineStructure[] = [line];
    let nextIdx = lineIdx + 1;

    while (nextIdx < lines.length) {
      const nextLine = lines[nextIdx];
      if (nextLine.isHeading || nextLine.isBullet || nextLine.isNumberedList) break;
      const nextCells = lineCellsList[nextIdx];
      if (nextCells.length >= 2 && areRowsAlignedInTable(cells, nextCells)) break;

      const verticalGap = Math.abs(pLines[pLines.length - 1].y - nextLine.y);
      if (verticalGap > line.avgFontSize * 2.2) break;

      pLines.push(nextLine);
      if (nextLine.text.endsWith('.') || nextLine.text.endsWith(':') || nextLine.text.endsWith(';')) {
        nextIdx++;
        break;
      }
      nextIdx++;
    }

    blocks.push({
      type: 'paragraph',
      lines: pLines,
      text: pLines.map((l) => l.text).join(' '),
    });
    lineIdx = nextIdx;
  }

  const rawText = lineStrings.join('\n');
  const words = rawText.split(/\s+/).filter(Boolean);

  return {
    pageNumber: pageIndex + 1,
    width: viewport.width,
    height: viewport.height,
    orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
    lines,
    blocks,
    rawText,
    medianFontSize,
    wordCount: words.length,
    characterCount: rawText.length,
    isScannedOrEmpty: rawText.trim().length === 0,
  };
}

/**
 * Primary Utility Function:
 * Uses pdfjs-dist getDocument to reliably extract structured text, font data, and layout from every page.
 */
export async function extractPdfDocumentStructure(
  source: File | ArrayBuffer | Uint8Array,
  options?: PdfExtractorOptions
): Promise<ExtractedPdfDocument> {
  let uint8Array: Uint8Array;

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(source)) {
    uint8Array = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  } else if (source instanceof Uint8Array) {
    uint8Array = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  } else if (source instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(source);
  } else if (typeof (source as any).arrayBuffer === 'function') {
    const buf = await (source as File).arrayBuffer();
    uint8Array = new Uint8Array(buf);
  } else {
    throw new Error('Unsupported source format: Expected File, ArrayBuffer, or Uint8Array.');
  }

  if (uint8Array.byteLength < 32) {
    throw new Error('PDF source is empty or too small.');
  }

  options?.onProgress?.(0, 0, 10, 'Initializing PDF.js document loader...');

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    isEvalSupported: false,
    useWorkerFetch: false,
    password: options?.password,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  if (numPages === 0) {
    throw new Error('PDF document contains 0 pages.');
  }

  const pages: ExtractedPageStructure[] = [];
  let totalWords = 0;
  let totalCharacters = 0;
  let hasTables = false;
  let hasHeadings = false;
  let ocrPagesCount = 0;
  const failedOcrPages: number[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = Math.round(15 + (pageNum / numPages) * 70);
    options?.onProgress?.(
      pageNum,
      numPages,
      percent,
      `Inspecting text and layout on page ${pageNum} of ${numPages}...`
    );

    try {
      const pageProxy = await pdf.getPage(pageNum);
      const pageStructure = await extractPdfPageStructure(pageProxy, pageNum - 1, options);

      // Automatically invoke Swahivo OCR when page is scanned or lacks selectable text glyphs
      const isScannedPage = pageStructure.isScannedOrEmpty || pageStructure.characterCount < 30;

      if ((options?.enableOcr ?? true) && isScannedPage) {
        options?.onProgress?.(
          pageNum,
          numPages,
          percent,
          `Page ${pageNum} is a scanned image: Rendering high-resolution canvas for AI OCR...`
        );

        let imageBase64: string | undefined;
        let mimeType = 'image/jpeg';

        if (typeof document !== 'undefined') {
          try {
            const rendered = await renderPdfPageToImage(pageProxy, 2.0);
            imageBase64 = rendered.dataUrl;
            mimeType = rendered.mimeType;
          } catch (canvasErr) {
            console.warn(`Canvas render fallback on page ${pageNum}:`, canvasErr);
          }
        }

        // Base64 fallback if running in environments without DOM canvas
        let pdfBase64: string | undefined;
        if (!imageBase64) {
          if (typeof Buffer !== 'undefined') {
            pdfBase64 = Buffer.from(uint8Array).toString('base64');
          } else {
            let binary = '';
            const len = uint8Array.byteLength;
            for (let b = 0; b < len; b++) binary += String.fromCharCode(uint8Array[b]);
            pdfBase64 = btoa(binary);
          }
        }

        options?.onProgress?.(
          pageNum,
          numPages,
          percent,
          `Page ${pageNum}: Running Swahivo Optical Character Recognition...`
        );

        try {
          const ocrResult = await runSwahivoOcrOnPage({
            pageNumber: pageNum,
            imageBase64,
            mimeType,
            pdfBase64,
          });

          if (ocrResult.text && ocrResult.text.trim().length > 0) {
            pageStructure.blocks = ocrResult.blocks;
            pageStructure.rawText = ocrResult.text;
            pageStructure.wordCount = ocrResult.wordCount;
            pageStructure.characterCount = ocrResult.characterCount;
            pageStructure.isScannedOrEmpty = false;
            pageStructure.ocrApplied = true;
            ocrPagesCount++;
          } else {
            pageStructure.ocrError = 'OCR returned no readable text';
            failedOcrPages.push(pageNum);
          }
        } catch (ocrErr: any) {
          console.warn(`OCR error on page ${pageNum}:`, ocrErr);
          pageStructure.ocrError = ocrErr?.message || 'OCR processing failed';
          failedOcrPages.push(pageNum);
        }
      }

      pages.push(pageStructure);

      totalWords += pageStructure.wordCount;
      totalCharacters += pageStructure.characterCount;

      if (pageStructure.blocks.some((b) => b.type === 'table')) {
        hasTables = true;
      }
      if (pageStructure.blocks.some((b) => b.type === 'heading')) {
        hasHeadings = true;
      }
    } catch (err) {
      console.warn(`Warning: Failed to extract page ${pageNum}:`, err);
      pages.push({
        pageNumber: pageNum,
        width: 595,
        height: 842,
        orientation: 'portrait',
        lines: [],
        blocks: [],
        rawText: '',
        medianFontSize: 11,
        wordCount: 0,
        characterCount: 0,
        isScannedOrEmpty: true,
      });
      failedOcrPages.push(pageNum);
    }
  }

  const fullText = pages.map((p) => p.rawText).join('\n\n');
  const isScanned = ocrPagesCount > 0 || (totalCharacters < 30 && numPages > 0);
  const ocrApplied = ocrPagesCount > 0;

  options?.onProgress?.(numPages, numPages, 100, 'Extraction complete across all pages.');

  let metadata: Record<string, any> | undefined;
  try {
    const meta = await pdf.getMetadata();
    metadata = meta?.info as any;
  } catch {
    // optional metadata
  }

  return {
    pageCount: numPages,
    totalPages: numPages,
    pages,
    fullText,
    totalWords,
    totalCharacters,
    hasTables,
    hasHeadings,
    isScanned,
    ocrApplied,
    ocrPagesCount,
    failedOcrPages: failedOcrPages.length > 0 ? failedOcrPages : undefined,
    metadata,
  };
}
