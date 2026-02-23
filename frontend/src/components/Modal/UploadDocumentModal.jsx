import { useState, useCallback, useRef } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import './UploadDocumentModal.css';

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function UploadDocumentModal({ isOpen, onClose, projectId, onSuccess }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const validateFile = (selectedFile) => {
    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Only PDF and DOCX files are allowed';
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      return 'Invalid file type. Please upload a PDF or DOCX file.';
    }

    if (selectedFile.size > MAX_SIZE) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFile = useCallback((selectedFile) => {
    setError('');
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setPreview({
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type: getFileType(selectedFile.type),
    });
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (mimeType) => {
    if (mimeType === 'application/pdf') return 'PDF Document';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Word Document';
    return 'Document';
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleInputClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    console.log('=== UPLOAD DOCUMENT DEBUG ===');
    console.log('projectId:', projectId);
    console.log('file.name:', file.name);
    console.log('file.size:', file.size);
    console.log('file.type:', file.type);
    console.log('=============================');

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);

      console.log('Sending FormData...');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await api.post(`/projects/${projectId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful');
      toast.success('Document uploaded successfully');
      onSuccess?.();
      handleClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload document';
      console.error('Upload error:', err.response?.data);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload Document</h2>
          <button className="modal-close" onClick={handleClose}>
            <span>✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-alert">
              <span className="error-icon">!</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleInputClick}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleChange}
              className="file-input"
              disabled={uploading}
            />

            {file ? (
              <div className="file-preview">
                <div className="file-icon-large">📄</div>
                <div className="file-info">
                  <span className="file-name">{preview?.name}</span>
                  <span className="file-meta">{preview?.size} • {preview?.type}</span>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                  }}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="dropzone-content">
                <div className="dropzone-icon">📎</div>
                <p className="dropzone-title">
                  Drag and drop your file here
                </p>
                <p className="dropzone-subtitle">
                  or <span className="browse-link">browse</span> to select a file
                </p>
                <div className="file-types">
                  <span className="type-badge">PDF</span>
                  <span className="type-badge">DOCX</span>
                  <span className="type-badge">Max 5MB</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-small"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <span>⬆️</span>
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDocumentModal;
