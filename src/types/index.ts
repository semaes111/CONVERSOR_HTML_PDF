export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  content: string;
  preview: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  error?: string;
  downloadUrl?: string;
}

export interface ConversionOptions {
  format: 'pdf' | 'docx';
  preserveStyles: boolean;
  includeImages: boolean;
}

export interface ConversionProgress {
  fileId: string;
  progress: number;
  status: string;
}