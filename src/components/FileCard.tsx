import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { UploadedFile, ConversionOptions } from '../types';
import { formatFileSize } from '../utils/fileUtils';

interface FileCardProps {
  file: UploadedFile;
  onRemove: (fileId: string) => void;
  onConvert: (fileId: string, format: 'pdf' | 'docx') => void;
  onDownload: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onRemove, onConvert, onDownload }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getStatusColor = () => {
    switch (file.status) {
      case 'pending': return 'text-gray-600';
      case 'converting': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'pending': return <FileText className="w-4 h-4" />;
      case 'converting': return <Loader className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFileTypeLabel = () => {
    return file.type === 'text/html' ? 'HTML' : 'TXT';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {getFileTypeLabel()}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onRemove(file.id)}
            disabled={file.status === 'converting'}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={getStatusColor()}>
            {getStatusIcon()}
          </span>
          <span className={`text-sm ${getStatusColor()}`}>
            {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
          </span>
          {file.status === 'error' && file.error && (
            <span className="text-xs text-red-600">- {file.error}</span>
          )}
        </div>

        {/* Progress Bar */}
        {file.status === 'converting' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Converting...</span>
              <span>{file.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Preview Toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
        </button>

        {/* Preview */}
        {showPreview && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border text-xs">
            <div className="font-medium text-gray-700 mb-2">Preview:</div>
            <div className="text-gray-600 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {file.preview}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {file.status === 'pending' && (
            <>
              <button
                onClick={() => onConvert(file.id, 'pdf')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
              >
                <span>Convert to PDF</span>
              </button>
              <button
                onClick={() => onConvert(file.id, 'docx')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
              >
                <span>Convert to DOCX</span>
              </button>
            </>
          )}
          
          {file.status === 'completed' && (
            <button
              onClick={() => onDownload(file.id)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};