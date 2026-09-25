import { OCR_PAGES } from '../data/corpus';
import type { OcrPage } from '../types';

export const OCR_THRESHOLD = 0.85;

class OcrService {
  pages(): OcrPage[] { return OCR_PAGES; }
  belowThreshold(): OcrPage[] { return OCR_PAGES.filter((p) => p.confidence < OCR_THRESHOLD); }
  meanConfidence(): number {
    return OCR_PAGES.reduce((n, p) => n + p.confidence, 0) / OCR_PAGES.length;
  }
}

export const ocr = new OcrService();
