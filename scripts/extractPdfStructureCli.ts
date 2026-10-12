#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { extractPdfDocumentStructure } from '../src/lib/pdfStructureExtractor';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Utility CLI Script to extract and display structured text, font data,
 * and layout information from a PDF.
 *
 * Usage:
 *   npx tsx scripts/extractPdfStructureCli.ts [path-to-pdf]
 */
async function main() {
  const targetPath = process.argv[2];
  let buffer: Buffer;

  if (targetPath && fs.existsSync(targetPath)) {
    console.log(`Analyzing document: ${targetPath}`);
    buffer = fs.readFileSync(targetPath);
  } else {
    console.log('No file path provided. Generating a demonstration multi-page PDF with headings, fonts, and tables...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Page 1: Executive Overview
    const p1 = pdfDoc.addPage([595, 842]);
    p1.drawText('ACME CORP - QUARTERLY PERFORMANCE', { x: 50, y: 790, size: 18, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
    p1.drawText('Section 1: General Business Highlights', { x: 50, y: 755, size: 13, font: boldFont });
    p1.drawText('This document illustrates automated font detection, table recognition, and line clustering.', { x: 50, y: 725, size: 11, font });
    p1.drawText('Notice the italicized confidentiality clause embedded below.', { x: 50, y: 705, size: 10, font: italicFont });
    p1.drawText('• Bullet point A: Revenue expanded by 34% YoY', { x: 50, y: 675, size: 10, font });
    p1.drawText('• Bullet point B: Serverless infrastructure reduced hosting costs by 45%', { x: 50, y: 655, size: 10, font });

    // Table on Page 1
    p1.drawText('Product Line', { x: 50, y: 615, size: 10, font: boldFont });
    p1.drawText('Q3 Target', { x: 230, y: 615, size: 10, font: boldFont });
    p1.drawText('Realized Revenue', { x: 410, y: 615, size: 10, font: boldFont });

    p1.drawText('PDF Cloud API', { x: 50, y: 590, size: 10, font });
    p1.drawText('$200,000.00', { x: 230, y: 590, size: 10, font });
    p1.drawText('$245,000.00', { x: 410, y: 590, size: 10, font });

    p1.drawText('AI Studio Toolkit', { x: 50, y: 565, size: 10, font });
    p1.drawText('$150,000.00', { x: 230, y: 565, size: 10, font });
    p1.drawText('$190,000.00', { x: 410, y: 565, size: 10, font });

    // Page 2: Detailed Methodology
    const p2 = pdfDoc.addPage([595, 842]);
    p2.drawText('Section 2: Technical Architecture & Layout Rules', { x: 50, y: 790, size: 14, font: boldFont });
    p2.drawText('Every page is parsed independently with full coordinate matrix decoding.', { x: 50, y: 760, size: 11, font });
    p2.drawText('1. Step 1: Text glyph and ToUnicode mapping', { x: 50, y: 730, size: 10, font });
    p2.drawText('2. Step 2: Line sorting by Y coordinates and X left-to-right alignment', { x: 50, y: 710, size: 10, font });
    p2.drawText('3. Step 3: Block classification for paragraphs, lists, and tables', { x: 50, y: 690, size: 10, font });

    const uint8 = await pdfDoc.save();
    buffer = Buffer.from(uint8);
  }

  console.log('\n--- EXTRACTING STRUCTURE WITH pdfjs-dist getDocument ---');
  const result = await extractPdfDocumentStructure(buffer, {
    onProgress: (page, total, pct, stage) => {
      if (pct % 25 === 0 || pct === 100) {
        console.log(`[Progress ${pct}%] ${stage}`);
      }
    },
  });

  console.log('\n=======================================================');
  console.log('DOCUMENT EXTRACTION SUMMARY');
  console.log('=======================================================');
  console.log(`Total Pages Processed : ${result.pageCount}`);
  console.log(`Total Words           : ${result.totalWords}`);
  console.log(`Total Characters      : ${result.totalCharacters}`);
  console.log(`Has Headings Detected : ${result.hasHeadings ? 'Yes' : 'No'}`);
  console.log(`Has Tables Detected   : ${result.hasTables ? 'Yes' : 'No'}`);
  console.log(`Is Scanned / Empty    : ${result.isScanned ? 'Yes' : 'No'}`);

  console.log('\n=======================================================');
  console.log('PAGE-BY-PAGE BREAKDOWN');
  console.log('=======================================================');

  for (const page of result.pages) {
    console.log(`\n--- Page ${page.pageNumber} (${page.width}x${page.height} pt, ${page.orientation}) ---`);
    console.log(`Lines: ${page.lines.length} | Layout Blocks: ${page.blocks.length} | Words: ${page.wordCount}`);
    console.log(`Median Body Font Size: ${page.medianFontSize.toFixed(1)} pt`);

    for (let i = 0; i < page.blocks.length; i++) {
      const block = page.blocks[i];
      if (block.type === 'heading') {
        console.log(`  [Block #${i + 1} - HEADING (H${block.headingLevel})]: "${block.text}"`);
      } else if (block.type === 'list') {
        console.log(`  [Block #${i + 1} - LIST ITEM]: "${block.text}"`);
      } else if (block.type === 'table') {
        console.log(`  [Block #${i + 1} - TABLE (${block.columnCount} columns, ${block.rows.length} rows)]:`);
        for (let r = 0; r < block.rows.length; r++) {
          const rowText = block.rows[r].cells.map((c) => `[${c.text}]`).join(' | ');
          console.log(`     Row ${r + 1}: ${rowText}`);
        }
      } else {
        const preview = block.text.length > 80 ? block.text.slice(0, 80) + '...' : block.text;
        console.log(`  [Block #${i + 1} - PARAGRAPH]: "${preview}"`);
      }
    }
  }

  console.log('\n✅ Extraction completed successfully.\n');
}

main().catch((err) => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
