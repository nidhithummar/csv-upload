import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { uploadAPI } from '../services/api';
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,

} from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch upload history
  const { data: uploadsData, isLoading: uploadsLoading } = useQuery(
    'uploads',
    () => uploadAPI.getUploads(),
    {
      refetchInterval: 5000, // Refetch every 5 seconds to check processing status
    }
  );

  // File validation function
  const validateFile = (file) => {
    const errors = [];
    
    // Check file type
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must be a CSV file');
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    // Check if file is empty
    if (file.size === 0) {
      errors.push('File cannot be empty');
    }
    
    return errors;
  };

  // Upload mutation with progress tracking
  const uploadMutation = useMutation(uploadAPI.uploadCSV, {
    onSuccess: (response) => {
      console.log('Upload success:', response);
      setUploadProgress(100);
      setTimeout(() => {
        toast.success('CSV file uploaded successfully!');
        setSelectedFile(null);
        setUploadProgress(0);
        setValidationErrors([]);
        queryClient.invalidateQueries('uploads');
        queryClient.invalidateQueries('records');
        queryClient.invalidateQueries('stats');
      }, 500);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploadProgress(0);
      toast.error(error.response?.data?.error || 'Upload failed');
    },
    onMutate: () => {
      setUploadProgress(0);
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    },
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const errors = validateFile(file);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSelectedFile(file);
    } else {
      errors.forEach(error => toast.error(error));
    }
  };

  const handleUpload = () => {
    if (selectedFile && validationErrors.length === 0) {
      console.log('Uploading file:', selectedFile);
      uploadMutation.mutate(selectedFile);
    } else if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before uploading');
    } else {
      toast.error('Please select a file first');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Upload CSV File</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file to process and store the data. Maximum file size is 10MB.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card p-4 sm:p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!selectedFile) {
              fileInputRef.current?.click();
            }
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-3 sm:space-y-4">
              <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary-500" />
              <div>
                <p className="text-base sm:text-lg font-medium text-gray-900 break-words">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <div className="text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Upload Progress */}
              {uploadMutation.isLoading && (
                <div className="w-full">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploadMutation.isLoading || validationErrors.length > 0}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  {uploadMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setValidationErrors([]);
                    setUploadProgress(0);
                  }}
                  className="btn btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <UploadIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <div>
                <p className="text-base sm:text-lg font-medium text-gray-900">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV files up to 10MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary w-full sm:w-auto"
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Upload History</h2>
        </div>
        <div className="overflow-hidden">
          {uploadsLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : uploadsData?.data?.uploads?.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadsData.data.uploads.map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {upload.original_filename}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(upload.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(upload.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {upload.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {upload.record_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(upload.upload_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              
              {/* Mobile Card View */}
              <div className="sm:hidden">
                <div className="space-y-3 p-4">
                  {uploadsData?.data?.uploads?.map((upload) => (
                    <div key={upload.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                              {upload.original_filename}
                            </p>
                            <p className="text-xs text-gray-500">{formatFileSize(upload.file_size)}</p>
                          </div>
                        </div>
                        {getStatusIcon(upload.status)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{upload.record_count || 0} records</span>
                        <span>{new Date(upload.upload_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No uploads yet. Upload your first CSV file to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
