import { useState, useCallback } from 'react';
import { UploadedFile, ConversionOptions } from '../types';
import { convertToPDF, convertToDOCX } from '../utils/conversionUtils';
import { downloadFile } from '../utils/fileUtils';

export const useFileConversion = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = useCallback((newFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const updateFileProgress = useCallback((fileId: string, progress: number, status?: UploadedFile['status']) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, progress, ...(status && { status }) }
        : f
    ));
  }, []);

  const convertFile = useCallback(async (fileId: string, format: 'pdf' | 'docx') => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const options: ConversionOptions = {
      format,
      preserveStyles: true,
      includeImages: true
    };

    updateFileProgress(fileId, 0, 'converting');

    try {
      let blob: Blob;
      
      if (format === 'pdf') {
        blob = await convertToPDF(file, options, (progress) => {
          updateFileProgress(fileId, progress);
        });
      } else {
        blob = await convertToDOCX(file, options, (progress) => {
          updateFileProgress(fileId, progress);
        });
      }

      const url = URL.createObjectURL(blob);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'completed',
              progress: 100,
              downloadUrl: url
            }
          : f
      ));
    } catch (error) {
      console.error('Conversion error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Conversion failed'
            }
          : f
      ));
    }
  }, [files, updateFileProgress]);

  const downloadConvertedFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !file.downloadUrl) return;

    const extension = file.downloadUrl.includes('pdf') ? 'pdf' : 'docx';
    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + extension;
    
    const a = document.createElement('a');
    a.href = file.downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [files]);

  const convertAllFiles = useCallback(async (format: 'pdf' | 'docx') => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await convertFile(file.id, format);
    }
  }, [files, convertFile]);

  const downloadAllCompleted = useCallback(() => {
    const completedFiles = files.filter(f => f.status === 'completed');
    completedFiles.forEach(file => {
      downloadConvertedFile(file.id);
    });
  }, [files, downloadConvertedFile]);

  const clearAllFiles = useCallback(() => {
    // Clean up object URLs
    files.forEach(file => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
  }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    convertFile,
    downloadConvertedFile,
    convertAllFiles,
    downloadAllCompleted,
    clearAllFiles
  };
};