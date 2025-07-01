import React from 'react';
import { FileText, Settings, Shield, Zap } from 'lucide-react';
import { FileDropZone } from './components/FileDropZone';
import { FileCard } from './components/FileCard';
import { BatchControls } from './components/BatchControls';
import { useFileConversion } from './hooks/useFileConversion';

function App() {
  const {
    files,
    addFiles,
    removeFile,
    convertFile,
    downloadConvertedFile,
    convertAllFiles,
    downloadAllCompleted,
    clearAllFiles
  } = useFileConversion();

  const convertingFiles = files.filter(f => f.status === 'converting');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Converter</h1>
              <p className="text-sm text-gray-600">Convert HTML and TXT files to PDF and DOCX formats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Fast Conversion</h3>
            </div>
            <p className="text-sm text-gray-600">
              Convert your documents quickly with our optimized processing engine.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Secure Processing</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your files are processed locally in your browser for maximum privacy.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Format Preservation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Maintain original formatting, styles, and layout in converted documents.
            </p>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <FileDropZone 
            onFilesAdded={addFiles} 
            disabled={convertingFiles.length > 0}
          />
        </div>

        {/* Batch Controls */}
        {files.length > 0 && (
          <div className="mb-8">
            <BatchControls
              files={files}
              onConvertAll={convertAllFiles}
              onDownloadAll={downloadAllCompleted}
              onClearAll={clearAllFiles}
            />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Files ({files.length})
              </h2>
              <div className="text-sm text-gray-600">
                {convertingFiles.length > 0 && (
                  <span className="text-blue-600 font-medium">
                    {convertingFiles.length} file(s) converting...
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                  onConvert={convertFile}
                  onDownload={downloadConvertedFile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Drag and drop your HTML or TXT files above, or click to browse and select files to get started with conversion.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Supports HTML and TXT files up to 10MB • Converts to PDF and DOCX formats</p>
            <p className="mt-1">All processing happens locally in your browser for privacy and security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;