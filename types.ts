export interface TextbookEntry {
  chapter: string;
  topic: string;
  content: string;
}

export interface ProcessingStatus {
  total: number;
  current: number;
  stage: 'idle' | 'extracting' | 'analyzing' | 'complete' | 'error';
  message?: string;
}

export enum PageBatchSize {
  SMALL = 5,
  MEDIUM = 10,
  LARGE = 20
}