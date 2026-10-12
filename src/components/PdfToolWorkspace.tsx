import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { ALL_PDF_TOOLS } from '../data/toolsData';
import {
  mergePdfs,
  splitPdf,
  compressPdf,
  rotatePdf,
  addWatermark,
  numberPages,
  deletePages,
  imagesToPdf,
  signPdf,
  protectPdf,
  downloadPdf,
  inspectPdf,
  parsePageRange,
} from '../lib/pdfEngine';
import {
  wordToPdf,
  pdfToWord,
  excelToPdf,
  pdfToExcel,
  textToPdf,
} from '../lib/officeEngine';
import {
  UploadCloud,
  FileCheck,
  Download,
  RotateCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  PenTool,
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  Sparkles,
  Layers,
  FileText,
  Lock,
  Scissors,
  Minimize2,
  RefreshCw,
  Copy,
  ChevronDown,
  Shield,
  Zap,
} from 'lucide-react';

interface PdfToolWorkspaceProps {
  toolId: string;
  onBack: () => void;
  onOpenPricing: () => void;
}

interface InspectedFile {
  file: File;
  pageCount: number;
  size: number;
}

export const PdfToolWorkspace: React.FC<PdfToolWorkspaceProps> = ({
  toolId,
  onBack,
  onOpenPricing,
}) => {
  const { consumePdfQuota, canPerformPdf, setOpenUpgradeModal, user, entitlements } = useAuth();
  
  // Current active tool state (allows switching in workspace)
  const [activeToolId, setActiveToolId] = useState(toolId);
  const tool = ALL_PDF_TOOLS.find((t) => t.id === activeToolId) || ALL_PDF_TOOLS[0];

  useEffect(() => {
    setActiveToolId(toolId);
  }, [toolId]);

  // File states
  const [files, setFiles] = useState<File[]>([]);
  const [fileDetails, setFileDetails] = useState<InspectedFile[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successStats, setSuccessStats] = useState<any>(null);

  // Tool Specific Configurations
  // 1. Split
  const [splitMode, setSplitMode] = useState<'range' | 'odd-even' | 'visual'>('range');
  const [splitRange, setSplitRange] = useState('1');
  const [selectedPagesForSplit, setSelectedPagesForSplit] = useState<number[]>([1]);

  // 2. Compress
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');

  // 3. Watermark
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkSize, setWatermarkSize] = useState<number>(44);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(45);

  // 4. Rotate
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);
  const [rotateScope, setRotateScope] = useState<'all' | 'odd' | 'even'>('all');

  // 5. Number Pages
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left'>('bottom-center');
  const [pageNumberFormat, setPageNumberFormat] = useState<'standard' | 'simple'>('standard');

  // 6. Protect
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 7. Signature Pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [penColor, setPenColor] = useState('#1d4ed8'); // royal blue
  const [penWidth, setPenWidth] = useState(2.5);
  const [signaturePlacement, setSignaturePlacement] = useState<'last' | 'first'>('last');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement | null>(null);

  // Inspect files whenever files array changes
  useEffect(() => {
    let isCancelled = false;
    async function loadInspect() {
      if (files.length === 0) {
        setFileDetails([]);
        return;
      }
      setIsInspecting(true);
      try {
        const details: InspectedFile[] = [];
        for (const f of files) {
          if (f.type.includes('pdf') || f.name.toLowerCase().endsWith('.pdf')) {
            const meta = await inspectPdf(f);
            details.push({ file: f, pageCount: meta.pageCount, size: f.size });
          } else {
            details.push({ file: f, pageCount: 1, size: f.size });
          }
        }
        if (!isCancelled) {
          setFileDetails(details);
          // Auto initialize split range or visual selector based on primary file
          if (details.length > 0 && details[0].pageCount > 1) {
            setSplitRange(`1-${Math.min(3, details[0].pageCount)}`);
            const initialList = Array.from({ length: Math.min(3, details[0].pageCount) }, (_, i) => i + 1);
            setSelectedPagesForSplit(initialList);
          }
        }
      } catch (err) {
        console.error('Inspection error:', err);
      } finally {
        if (!isCancelled) setIsInspecting(false);
      }
    }
    loadInspect();
    return () => {
      isCancelled = true;
    };
  }, [files]);

  // Handle files selection
  const handleFilesChosen = (incomingFiles: FileList | File[]) => {
    const list = Array.from(incomingFiles);
    if (list.length === 0) return;

    setErrorMsg('');
    setResultBytes(null);
    setResultBlob(null);
    setSuccessStats(null);

    if (activeToolId === 'merge' || activeToolId === 'image-to-pdf') {
      setFiles((prev) => [...prev, ...list]);
    } else {
      setFiles([list[0]]);
    }
  };

  // Reordering helpers for Merge & Image to PDF
  const moveFileUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveFileDown = (index: number) => {
    if (index >= files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setResultBytes(null);
      setResultBlob(null);
      setSuccessStats(null);
    }
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // One-click generate realistic sample invoice PDF
  const handleUseSamplePdf = async () => {
    try {
      setErrorMsg('');
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      const helvetica = await doc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

      // Page 1: Invoice & Statement
      const p1 = doc.addPage([595.28, 841.89]);
      p1.drawText('SWAHIVO ENTERPRISE SOLUTIONS', { x: 50, y: 790, size: 18, font: helveticaBold, color: rgb(0.12, 0.38, 0.85) });
      p1.drawText('Tax Invoice & Service Agreement #SW-2026-904', { x: 50, y: 765, size: 12, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      p1.drawLine({ start: { x: 50, y: 750 }, end: { x: 545, y: 750 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });

      p1.drawText('Customer: Vodacom Tanzania PLC (Dar es Salaam)', { x: 50, y: 720, size: 11, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      p1.drawText('Billing Cycle: Annual Subscription - Team Tier (50 Seats)', { x: 50, y: 700, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
      p1.drawText('Amount Paid: USD 6,000.00 (M-Pesa Business Gateway)', { x: 50, y: 680, size: 10, font: helveticaBold, color: rgb(0.08, 0.55, 0.32) });

      p1.drawText('Itemized Breakdown:', { x: 50, y: 640, size: 11, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      p1.drawText('1. AI Document Parsing & High-Density OCR Engine', { x: 60, y: 615, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      p1.drawText('2. Zero-Retention Client WebAssembly Security Sandbox', { x: 60, y: 595, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      p1.drawText('3. 24/7 Dedicated Priority Technical Support SLA', { x: 60, y: 575, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });

      // Page 2: Service Level Agreement
      const p2 = doc.addPage([595.28, 841.89]);
      p2.drawText('Schedule B: Data Processing & Confidentiality SLA', { x: 50, y: 790, size: 16, font: helveticaBold, color: rgb(0.12, 0.38, 0.85) });
      p2.drawText('All files processed within Swahivo remain strictly confidential and client-side.', { x: 50, y: 755, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      p2.drawText('No unauthorized third parties possess decrypt rights or content storage.', { x: 50, y: 735, size: 10, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      p2.drawText('Section 4.1 - Retention Limits: Automatic cache invalidation occurs immediately upon session terminate.', { x: 50, y: 705, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

      // Page 3: Compliance & Signatures
      const p3 = doc.addPage([595.28, 841.89]);
      p3.drawText('Page 3: Corporate Sign-off & Audit Acknowledgement', { x: 50, y: 790, size: 16, font: helveticaBold, color: rgb(0.12, 0.38, 0.85) });
      p3.drawText('Authorized Officer: Chief Information Security Officer', { x: 50, y: 750, size: 11, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      p3.drawText('Status: Verified by Swahivo Trust Framework (TLS 1.3 / AES-256)', { x: 50, y: 725, size: 10, font: helvetica, color: rgb(0.2, 0.5, 0.2) });

      const pdfBytes = await doc.save();
      const sampleFile1 = new File([pdfBytes as any], 'Swahivo_Enterprise_Invoice.pdf', { type: 'application/pdf' });

      if (activeToolId === 'merge') {
        // Create second sample doc for merge demonstration
        const doc2 = await PDFDocument.create();
        const pExtra = doc2.addPage([595.28, 841.89]);
        const bFont = await doc2.embedFont(StandardFonts.HelveticaBold);
        pExtra.drawText('ATTACHMENT B: AUDIT LOGS & CERTIFICATES', { x: 50, y: 790, size: 16, font: bFont, color: rgb(0.8, 0.2, 0.2) });
        pExtra.drawText('Certificate of Cloud Security Compliance (ISO/IEC 27001)', { x: 50, y: 750, size: 11, color: rgb(0.3, 0.3, 0.3) });
        const bytes2 = await doc2.save();
        const sampleFile2 = new File([bytes2 as any], 'Swahivo_Audit_Attachment.pdf', { type: 'application/pdf' });
        setFiles([sampleFile1, sampleFile2]);
      } else {
        setFiles([sampleFile1]);
      }

      setResultBytes(null);
      setResultBlob(null);
      setSuccessStats(null);
    } catch (e: any) {
      console.error('Error generating sample:', e);
      setErrorMsg('Could not generate sample document: ' + e.message);
    }
  };

  // Primary execution handler
  const handleExecute = async () => {
    if (files.length === 0) {
      setErrorMsg('Please upload a document to proceed.');
      return;
    }

    if (activeToolId === 'merge' && files.length < 2) {
      setErrorMsg('Merge requires at least 2 PDF documents. Click "Add More PDFs" or select multiple files.');
      return;
    }

    if (!canPerformPdf()) {
      setOpenUpgradeModal(true);
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setProgressStage('Initializing processing engine...');
    setErrorMsg('');

    try {
      let outputBytes: Uint8Array | null = null;
      let outName = `swahivo_${activeToolId}_${Date.now()}.pdf`;
      let stats: any = {};

      // 1. MERGE PDF
      if (activeToolId === 'merge') {
        setProgress(35);
        setProgressStage('Reading and combining pages from multiple documents...');
        const res = await mergePdfs(files);
        outputBytes = res.pdfBytes;
        stats = {
          totalFiles: files.length,
          combinedPages: res.pageCount,
          combinedSize: outputBytes.length,
        };
        outName = `merged_${files[0].name.replace(/\.[^/.]+$/, '')}_unified.pdf`;
      }

      // 2. SPLIT PDF
      else if (activeToolId === 'split') {
        setProgress(35);
        setProgressStage('Extracting selected pages...');
        let targetRange = splitRange;
        if (splitMode === 'odd-even') {
          targetRange = 'odd';
        } else if (splitMode === 'visual') {
          targetRange = selectedPagesForSplit.sort((a, b) => a - b).join(', ');
        }
        const res = await splitPdf(files[0], targetRange);
        outputBytes = res.pdfBytes;
        stats = {
          extractedPages: res.pageCount,
          pageList: res.extractedPages.join(', '),
        };
        outName = `split_${files[0].name.replace(/\.[^/.]+$/, '')}_extracted.pdf`;
      }

      // 3. COMPRESS PDF
      else if (activeToolId === 'compress') {
        setProgress(35);
        setProgressStage(`Applying ${compressionLevel} compaction and stripping redundant object streams...`);
        const res = await compressPdf(files[0], compressionLevel);
        outputBytes = res.pdfBytes;
        stats = {
          originalSize: res.originalSize,
          compressedSize: res.compressedSize,
          savingsPct: res.savingsPct,
          level: compressionLevel,
        };
        outName = `compressed_${files[0].name}`;
      }

      // 4. ROTATE PDF
      else if (activeToolId === 'rotate') {
        setProgress(40);
        setProgressStage(`Rotating pages ${rotateAngle} degrees clockwise...`);
        const res = await rotatePdf(files[0], rotateAngle);
        outputBytes = res.pdfBytes;
        stats = { angle: rotateAngle, scope: rotateScope };
        outName = `rotated_${files[0].name}`;
      }

      // 5. WATERMARK
      else if (activeToolId === 'watermark') {
        if (!watermarkText.trim()) {
          throw new Error('Please enter watermark text.');
        }
        setProgress(40);
        setProgressStage('Stamping custom watermark across document pages...');
        const res = await addWatermark(files[0], watermarkText, {
          opacity: watermarkOpacity,
          size: watermarkSize,
        });
        outputBytes = res.pdfBytes;
        stats = { watermark: watermarkText, opacity: Math.round(watermarkOpacity * 100) };
        outName = `watermarked_${files[0].name}`;
      }

      // 6. NUMBER PAGES
      else if (activeToolId === 'number-pages') {
        setProgress(40);
        setProgressStage(`Applying page numbers to ${pageNumberPosition}...`);
        const res = await numberPages(files[0], pageNumberPosition);
        outputBytes = res.pdfBytes;
        stats = { position: pageNumberPosition };
        outName = `numbered_${files[0].name}`;
      }

      // 7. DELETE PAGES
      else if (activeToolId === 'delete-pages') {
        setProgress(40);
        setProgressStage('Removing specified pages...');
        const pagesToDelete = selectedPagesForSplit;
        if (pagesToDelete.length === 0) {
          throw new Error('Please select at least one page to delete.');
        }
        const res = await deletePages(files[0], pagesToDelete);
        outputBytes = res.pdfBytes;
        stats = { deletedCount: pagesToDelete.length };
        outName = `cleaned_${files[0].name}`;
      }

      // 8. SIGN PDF
      else if (activeToolId === 'sign') {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) {
          throw new Error('Please draw your signature on the pad before applying.');
        }
        setProgress(40);
        setProgressStage('Embedding signature image securely on document...');
        const sigDataUrl = canvas.toDataURL('image/png');
        const primaryMeta = fileDetails[0] || { pageCount: 1 };
        const targetPageIndex = signaturePlacement === 'last' ? Math.max(0, primaryMeta.pageCount - 1) : 0;
        const res = await signPdf(files[0], sigDataUrl, targetPageIndex, { xPct: 62, yPct: 12 });
        outputBytes = res.pdfBytes;
        stats = { pageSigned: targetPageIndex + 1 };
        outName = `signed_${files[0].name}`;
      }

      // 9. IMAGE TO PDF
      else if (activeToolId === 'image-to-pdf') {
        setProgress(40);
        setProgressStage('Converting and optimizing images into single PDF document...');
        const res = await imagesToPdf(files);
        outputBytes = res.pdfBytes;
        stats = { totalImages: files.length };
        outName = `images_converted_${Date.now()}.pdf`;
      }

      // 10. PROTECT PDF
      else if (activeToolId === 'protect') {
        if (!password) {
          throw new Error('Please enter a password to protect the document.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter.');
        }
        setProgress(40);
        setProgressStage('Encrypting PDF structure and sealing permissions...');
        const res = await protectPdf(files[0], password);
        outputBytes = res.pdfBytes;
        stats = { encrypted: true, algorithm: 'AES-256 standard' };
        outName = `protected_${files[0].name}`;
      }

      // 11. OFFICE CONVERSIONS
      else if (activeToolId === 'pdf-to-word') {
        setProgress(50);
        setProgressStage('Synthesizing docx structure...');
        const res = await pdfToWord(files[0]);
        setResultBlob(res.docxBlob);
        setResultFileName(res.filename);
        stats = { format: 'Microsoft Word Document (.docx)' };
        setSuccessStats(stats);
        await consumePdfQuota(tool.name, res.filename, res.docxBlob.size);
        triggerSuccessCelebration();
        setProgress(100);
        return;
      } else if (activeToolId === 'word-to-pdf') {
        setProgress(50);
        setProgressStage('Converting Word document to PDF...');
        const res = await wordToPdf(files[0]);
        outputBytes = res.pdfBytes;
        stats = { format: 'PDF Document' };
        outName = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
      } else if (activeToolId === 'pdf-to-excel') {
        setProgress(50);
        setProgressStage('Extracting spreadsheet tables...');
        const res = await pdfToExcel(files[0]);
        setResultBlob(res.xlsxBlob);
        setResultFileName(res.filename);
        stats = { format: 'Microsoft Excel Spreadsheet (.xlsx)' };
        setSuccessStats(stats);
        await consumePdfQuota(tool.name, res.filename, res.xlsxBlob.size);
        triggerSuccessCelebration();
        setProgress(100);
        return;
      } else if (activeToolId === 'excel-to-pdf') {
        setProgress(50);
        setProgressStage('Formatting spreadsheet sheets to PDF...');
        const res = await excelToPdf(files[0]);
        outputBytes = res.pdfBytes;
        stats = { format: 'PDF Document' };
        outName = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
      } else if (activeToolId === 'txt-to-pdf') {
        setProgress(50);
        setProgressStage('Converting plain text file to PDF...');
        const res = await textToPdf(files[0]);
        outputBytes = res.pdfBytes;
        stats = { format: 'PDF Document' };
        outName = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
      } else {
        // Fallback generic compressor
        setProgress(50);
        const res = await compressPdf(files[0]);
        outputBytes = res.pdfBytes;
        outName = `processed_${files[0].name}`;
      }

      setProgress(85);
      setProgressStage('Compacting object streams and finalizing download buffer...');

      if (outputBytes) {
        setResultBytes(outputBytes);
        setResultFileName(outName);
        setSuccessStats(stats);

        // Record in user history and consume quota
        await consumePdfQuota(tool.name, outName, outputBytes.length);

        triggerSuccessCelebration();
        setProgress(100);
      }
    } catch (err: any) {
      console.error('Operation failure:', err);
      setErrorMsg(err.message || 'An error occurred while processing the document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerSuccessCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadResult = () => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else if (resultBytes) {
      downloadPdf(resultBytes, resultFileName);
    }
  };

  const resetWorkspace = () => {
    setFiles([]);
    setFileDetails([]);
    setResultBytes(null);
    setResultBlob(null);
    setSuccessStats(null);
    setErrorMsg('');
    setProgress(0);
  };

  const isMultiFileTool = activeToolId === 'merge' || activeToolId === 'image-to-pdf';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tools</span>
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{tool.name}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {tool.category}
            </span>
          </div>
        </div>

        {/* Quota / Plan Status Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {entitlements.subscriptionStatus === 'free' ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-500 text-[11px]">Free Allowance:</span>
              <span className="font-bold text-slate-800">
                {Math.max(0, entitlements.pdfOperationsLimit - entitlements.pdfOperationsUsed)}/3 operations left
              </span>
              <button
                onClick={onOpenPricing}
                className="ml-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Upgrade
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unlimited Pro Processing Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tool Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tool Title Banner */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}
              >
                {tool.name.slice(0, 1)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight">
                  {tool.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Quick Switch Dropdown */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-400">Switch:</span>
              <select
                value={activeToolId}
                onChange={(e) => {
                  setActiveToolId(e.target.value);
                  resetWorkspace();
                }}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALL_PDF_TOOLS.filter((t) => !t.isAi).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-red-400 hover:text-red-700 text-sm font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* STEP 1: Upload or Selected Files */}
          {files.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) {
                  handleFilesChosen(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all group ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={isMultiFileTool}
                accept={
                  activeToolId === 'image-to-pdf'
                    ? 'image/png,image/jpeg,image/webp'
                    : activeToolId === 'word-to-pdf'
                    ? '.docx'
                    : activeToolId === 'excel-to-pdf'
                    ? '.xlsx,.xls'
                    : activeToolId === 'txt-to-pdf'
                    ? '.txt'
                    : '.pdf'
                }
                onChange={(e) => {
                  if (e.target.files) handleFilesChosen(e.target.files);
                }}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-900 font-display">
                {isMultiFileTool ? 'Choose PDF files or drag & drop' : 'Choose a file or drag & drop'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeToolId === 'image-to-pdf'
                  ? 'Supports PNG, JPG, and WebP (up to 50MB per file)'
                  : activeToolId === 'merge'
                  ? 'Select 2 or more PDF files to combine in sequence'
                  : 'Supports standard PDF files with client-side zero-storage isolation'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Select {isMultiFileTool ? 'Files' : 'File'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseSamplePdf();
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Use Sample PDF</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" /> 100% Client-Side Privacy
                </span>
                <span>•</span>
                <span>Encrypted Memory</span>
                <span>•</span>
                <span>Up to 50MB</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Files Header & List */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Uploaded {isMultiFileTool ? `Documents (${files.length})` : 'Document'}
                    </span>
                    {isInspecting && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> inspecting...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isMultiFileTool && (
                      <>
                        <input
                          ref={addMoreInputRef}
                          type="file"
                          multiple
                          accept={activeToolId === 'image-to-pdf' ? 'image/*' : '.pdf'}
                          onChange={(e) => {
                            if (e.target.files) handleFilesChosen(e.target.files);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => addMoreInputRef.current?.click()}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add More</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={resetWorkspace}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* File Cards */}
                <div className="space-y-2.5">
                  {files.map((file, idx) => {
                    const detail = fileDetails[idx];
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl text-xs hover:border-slate-300 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isMultiFileTool && (
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                          )}
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="font-semibold text-slate-900 truncate">{file.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{(file.size / 1024).toFixed(1)} KB</span>
                              {detail && detail.pageCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-600 font-medium">
                                    {detail.pageCount} page{detail.pageCount > 1 ? 's' : ''}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* File actions */}
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          {isMultiFileTool && (
                            <>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveFileUp(idx)}
                                title="Move up in merge sequence"
                                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md hover:bg-slate-100 transition-colors"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === files.length - 1}
                                onClick={() => moveFileDown(idx)}
                                title="Move down in merge sequence"
                                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md hover:bg-slate-100 transition-colors"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            title="Remove file"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isMultiFileTool && files.length > 1 && (
                  <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span>Sequence determines the order pages will appear in the output.</span>
                    <span className="font-semibold text-slate-700">
                      Total combined pages: {fileDetails.reduce((acc, f) => acc + (f?.pageCount || 1), 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* TOOL-SPECIFIC CONFIGURATION PANELS */}

              {/* 1. COMPRESS PDF PANEL */}
              {activeToolId === 'compress' && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Compression Level
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Choose your target balance between file size and graphic clarity.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'extreme',
                        title: 'Extreme Compression',
                        desc: 'Maximum reduction, compact object streams.',
                        badge: 'Smallest Size',
                        estPct: '~50-70% reduction',
                      },
                      {
                        id: 'recommended',
                        title: 'Recommended Compression',
                        desc: 'Optimal balance of high resolution and small size.',
                        badge: 'Most Popular',
                        estPct: '~30-50% reduction',
                      },
                      {
                        id: 'low',
                        title: 'Low Compression',
                        desc: 'High graphic fidelity with metadata stripped.',
                        badge: 'Best Quality',
                        estPct: '~15-30% reduction',
                      },
                    ].map((lvl) => (
                      <div
                        key={lvl.id}
                        onClick={() => setCompressionLevel(lvl.id as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          compressionLevel === lvl.id
                            ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              compressionLevel === lvl.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {lvl.badge}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{lvl.estPct}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{lvl.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{lvl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SPLIT PDF PANEL */}
              {activeToolId === 'split' && fileDetails[0] && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Split & Extraction Configuration
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Document contains {fileDetails[0].pageCount} total pages.
                      </p>
                    </div>

                    {/* Mode pills */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setSplitMode('range')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                          splitMode === 'range' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Range Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitMode('odd-even')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                          splitMode === 'odd-even' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Odd / Even
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitMode('visual')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                          splitMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Visual Selector
                      </button>
                    </div>
                  </div>

                  {splitMode === 'range' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Page Numbers or Range (e.g. 1-3, 5)
                      </label>
                      <input
                        type="text"
                        value={splitRange}
                        onChange={(e) => setSplitRange(e.target.value)}
                        placeholder={`e.g. 1-${Math.min(3, fileDetails[0].pageCount)}`}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-400">Quick ranges:</span>
                        <button
                          type="button"
                          onClick={() => setSplitRange(`1`)}
                          className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-50"
                        >
                          Page 1 only
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSplitRange(`1-${Math.ceil(fileDetails[0].pageCount / 2)}`)
                          }
                          className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-50"
                        >
                          First Half
                        </button>
                        <button
                          type="button"
                          onClick={() => setSplitRange(`2-${fileDetails[0].pageCount}`)}
                          className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-50"
                        >
                          Skip Cover (2-{fileDetails[0].pageCount})
                        </button>
                      </div>
                    </div>
                  )}

                  {splitMode === 'odd-even' && (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                      <p className="text-slate-600">
                        Extract alternate pages automatically for two-sided book scans or odd/even batch exports.
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSplitRange('odd')}
                          className={`px-4 py-2 rounded-xl font-semibold border ${
                            splitRange === 'odd'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          Odd Pages Only (1, 3, 5...)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSplitRange('even')}
                          className={`px-4 py-2 rounded-xl font-semibold border ${
                            splitRange === 'even'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          Even Pages Only (2, 4, 6...)
                        </button>
                      </div>
                    </div>
                  )}

                  {splitMode === 'visual' && (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          Click pages to include in the output document:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPagesForSplit(
                                Array.from({ length: fileDetails[0].pageCount }, (_, i) => i + 1)
                              )
                            }
                            className="text-blue-600 hover:underline text-[11px]"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPagesForSplit([])}
                            className="text-slate-500 hover:underline text-[11px]"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                        {Array.from({ length: fileDetails[0].pageCount }, (_, i) => i + 1).map((pageNum) => {
                          const isSelected = selectedPagesForSplit.includes(pageNum);
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => {
                                setSelectedPagesForSplit((prev) =>
                                  isSelected ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
                                );
                              }}
                              className={`w-12 h-14 rounded-lg flex flex-col items-center justify-center border text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs scale-105'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 mb-1 opacity-70" />
                              <span>{pageNum}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Selected: {selectedPagesForSplit.length} page(s) (
                        {selectedPagesForSplit.sort((a, b) => a - b).join(', ') || 'None'})
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. ROTATE PANEL */}
              {activeToolId === 'rotate' && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Rotation Angle & Orientation
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { deg: 90, label: '90° Clockwise' },
                      { deg: 180, label: '180° Half Turn' },
                      { deg: 270, label: '270° Counter-CW' },
                    ].map((item) => (
                      <button
                        key={item.deg}
                        type="button"
                        onClick={() => setRotateAngle(item.deg as any)}
                        className={`p-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                          rotateAngle === item.deg
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <RotateCw className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. WATERMARK PANEL */}
              {activeToolId === 'watermark' && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Watermark Stamp Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL / DRAFT / DO NOT COPY"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      {['CONFIDENTIAL', 'DRAFT', 'ORIGINAL', 'SAMPLE', 'TOP SECRET'].map((txt) => (
                        <button
                          key={txt}
                          type="button"
                          onClick={() => setWatermarkText(txt)}
                          className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100"
                        >
                          {txt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Opacity: {Math.round(watermarkOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Font Size</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[28, 42, 56, 72].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setWatermarkSize(sz)}
                            className={`py-1.5 rounded-lg border text-xs font-semibold ${
                              watermarkSize === sz
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            {sz}pt
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. NUMBER PAGES PANEL */}
              {activeToolId === 'number-pages' && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Page Number Placement
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bottom-center', label: 'Bottom Center' },
                      { id: 'bottom-right', label: 'Bottom Right' },
                      { id: 'top-right', label: 'Top Right' },
                      { id: 'bottom-left', label: 'Bottom Left' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPageNumberPosition(pos.id as any)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                          pageNumberPosition === pos.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. PROTECT PDF PANEL */}
              {activeToolId === 'protect' && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Document Password Protection
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Encrypt with high-grade security permissions to prevent unauthorized printing or tampering.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Set Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Show password</span>
                    </label>

                    {password && confirmPassword && (
                      <span
                        className={`text-xs font-semibold ${
                          password === confirmPassword ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {password === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 7. SIGN PDF PANEL */}
              {activeToolId === 'sign' && (
                <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Draw Digital Signature
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Draw using your mouse, trackpad, or finger.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        {[
                          { color: '#1d4ed8', label: 'Blue' },
                          { color: '#0f172a', label: 'Black' },
                          { color: '#dc2626', label: 'Red' },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setPenColor(c.color)}
                            style={{ backgroundColor: c.color }}
                            className={`w-4 h-4 rounded-full transition-transform ${
                              penColor === c.color ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-slate-100"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Interactive Drawing Canvas */}
                  <div className="border border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={180}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-44 cursor-crosshair touch-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Placement:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="sigpos"
                          checked={signaturePlacement === 'last'}
                          onChange={() => setSignaturePlacement('last')}
                          className="text-blue-600"
                        />
                        <span>Last Page (Signature Block)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="sigpos"
                          checked={signaturePlacement === 'first'}
                          onChange={() => setSignaturePlacement('first')}
                          className="text-blue-600"
                        />
                        <span>First Page</span>
                      </label>
                    </div>

                    {!hasSignature && (
                      <span className="text-amber-600 font-medium text-[11px]">
                        Please draw a signature above
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ACTION EXECUTE BUTTON */}
              {!resultBytes && !resultBlob && (
                <div className="pt-2">
                  <button
                    onClick={handleExecute}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {progressStage || 'Processing document...'} ({progress}%)
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-blue-200" />
                        <span>Execute {tool.name}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: RESULTS SCREEN */}
          {(resultBytes || resultBlob) && (
            <div className="p-6 sm:p-8 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
                  Document Processed Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Your output file <strong className="text-slate-900">{resultFileName}</strong> is compiled and ready for instant download.
                </p>
              </div>

              {/* Specific Result Metrics Cards */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {successStats?.savingsPct !== undefined && (
                  <div className="bg-white border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 shadow-2xs">
                    <span className="text-emerald-600 font-extrabold text-sm">
                      -{successStats.savingsPct}% Saved
                    </span>{' '}
                    ({(successStats.originalSize / 1024).toFixed(0)} KB →{' '}
                    {(successStats.compressedSize / 1024).toFixed(0)} KB)
                  </div>
                )}

                {successStats?.combinedPages !== undefined && (
                  <div className="bg-white border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 shadow-2xs">
                    Merged {successStats.totalFiles} documents into {successStats.combinedPages} pages
                  </div>
                )}

                {successStats?.extractedPages !== undefined && (
                  <div className="bg-white border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 shadow-2xs">
                    Extracted {successStats.extractedPages} page(s) ({successStats.pageList || 'Custom range'})
                  </div>
                )}

                {successStats?.format !== undefined && (
                  <div className="bg-white border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 shadow-2xs">
                    Format: {successStats.format}
                  </div>
                )}

                {successStats?.encrypted && (
                  <div className="bg-white border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 shadow-2xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Protected with AES-256 standard</span>
                  </div>
                )}
              </div>

              {/* Download & Secondary Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDownloadResult}
                  className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Processed File</span>
                </button>

                <button
                  onClick={resetWorkspace}
                  className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Process Another File</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Downloaded file saved automatically to your browser and logged in your Swahivo account history.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
