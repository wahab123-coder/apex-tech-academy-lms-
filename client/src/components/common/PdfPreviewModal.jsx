import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import './PdfPreviewModal.css';

/**
 * PdfPreviewModal
 * Fetches a PDF from the API, creates an object URL,
 * and renders it in an iframe so admin can review before downloading.
 *
 * Props:
 *   isOpen      — bool
 *   onClose     — function
 *   title       — string  (modal heading)
 *   fetchPdf    — async function () => axios response with responseType:'blob'
 *   filename    — string  (downloaded filename)
 */
function PdfPreviewModal({ isOpen, onClose, title, fetchPdf, filename }) {
  const [objectUrl, setObjectUrl]   = useState(null);
  const [loading,   setLoading]     = useState(false);
  const [error,     setError]       = useState('');
  const [downloading, setDownloading] = useState(false);

  // Load PDF when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let url;
    setLoading(true);
    setError('');
    setObjectUrl(null);

    fetchPdf()
      .then((res) => {
        url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setObjectUrl(url);
      })
      .catch(() => setError('Failed to load PDF. Please try again.'))
      .finally(() => setLoading(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Cleanup object URL on close
  useEffect(() => {
    if (!isOpen && objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    if (!objectUrl) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href     = objectUrl;
      link.download = filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="pdf-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="pdf-modal">
        {/* Header */}
        <div className="pdf-modal__header">
          <div className="pdf-modal__header-left">
            <div className="pdf-modal__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h2 className="pdf-modal__title">{title}</h2>
              {filename && (
                <p className="pdf-modal__filename">{filename}</p>
              )}
            </div>
          </div>
          <button
            className="pdf-modal__close"
            onClick={onClose}
            aria-label="Close preview"
          >
            &times;
          </button>
        </div>

        {/* Preview area */}
        <div className="pdf-modal__body">
          {loading && (
            <div className="pdf-modal__state">
              <div className="pdf-modal__spinner" />
              <p>Loading PDF preview...</p>
            </div>
          )}

          {error && !loading && (
            <div className="pdf-modal__state pdf-modal__state--error">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={() => {
                setError('');
                setLoading(true);
                fetchPdf()
                  .then((res) => {
                    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                    setObjectUrl(url);
                  })
                  .catch(() => setError('Failed to load PDF. Please try again.'))
                  .finally(() => setLoading(false));
              }}>
                Try Again
              </Button>
            </div>
          )}

          {objectUrl && !loading && (
            <iframe
              src={objectUrl}
              className="pdf-modal__iframe"
              title={title}
              aria-label="PDF preview"
            />
          )}
        </div>

        {/* Footer actions */}
        <div className="pdf-modal__footer">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            loading={downloading}
            onClick={handleDownload}
            disabled={!objectUrl}
          >
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PdfPreviewModal;
