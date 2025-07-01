import React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { UploadedFile } from '../types';

interface BatchControlsProps {
  files: UploadedFile[];
  onConvertAll: (format: 'pdf' | 'docx') => void;
  onDownloadAll: () => void;
  onClearAll: () => void;
}

export const BatchControls: React.FC<BatchControlsProps> = ({
  files,
  onConvertAll,
  onDownloadAll,
  onClearAll
}) => {
  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'completed');
  const convertingFiles = files.filter(f => f.status === 'converting');

  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Batch Operations</h3>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{files.length} total files</span>
          {convertingFiles.length > 0 && (
            <span className="text-blue-600">{convertingFiles.length} converting</span>
          )}
          {completedFiles.length > 0 && (
            <span className="text-green-600">{completedFiles.length} completed</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {pendingFiles.length > 0 && (
          <>
            <button
              onClick={() => onConvertAll('pdf')}
              disabled={convertingFiles.length > 0}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Convert All to PDF</span>
              <span className="bg-red-500 text-xs px-2 py-0.5 rounded">
                {pendingFiles.length}
              </span>
            </button>
            
            <button
              onClick={() => onConvertAll('docx')}
              disabled={convertingFiles.length > 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Convert All to DOCX</span>
              <span className="bg-blue-500 text-xs px-2 py-0.5 rounded">
                {pendingFiles.length}
              </span>
            </button>
          </>
        )}

        {completedFiles.length > 0 && (
          <button
            onClick={onDownloadAll}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download All</span>
            <span className="bg-green-500 text-xs px-2 py-0.5 rounded">
              {completedFiles.length}
            </span>
          </button>
        )}

        <button
          onClick={onClearAll}
          disabled={convertingFiles.length > 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};