import React, { useState } from 'react';
import Button            from '../../components/ui/Button';
import Alert             from '../../components/ui/Alert';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import useApi            from '../../hooks/useApi';
import { certificateService } from '../../services';
import { useAuth }       from '../../context/AuthContext';
import downloadPdf       from '../../utils/downloadPdf';
import '../admin/Portal.css';

function StudentCertificates() {
  const { user }                          = useAuth();
  const [downloading,  setDownloading]    = useState(null);
  const [alert,        setAlert]          = useState(null);

  const { data, loading, error } = useApi(
    () => certificateService.getAll(),
    { initialData: { certificates: [] } }
  );

  const certificates = data?.certificates || [];

  const handleDownload = async (cert) => {
    setDownloading(cert._id);
    try {
      const res = await certificateService.download(cert._id);
      downloadPdf(
        res.data,
        `Apex-Tech-Certificate-${cert.certificateId}.pdf`
      );
    } catch (err) {
      setAlert({ type: 'error', msg: 'Failed to download certificate. Please try again.' });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Certificates</h1>
        <p className="portal-page__subtitle">Your course completion certificates.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      {loading && <LoadingSpinner label="Loading certificates..." />}

      {!loading && certificates.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>🏆</div>
          <p className="portal-empty__title">No certificates yet</p>
          <p className="portal-empty__text">
            Complete a course to earn your certificate. Keep learning!
          </p>
        </div>
      )}

      {!loading && certificates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
          {certificates.map((cert) => (
            <div key={cert._id} style={{ maxWidth: 680 }}>

              {/* Certificate preview card — white with gold & navy */}
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-3xl)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #c5a028',
                boxShadow: '0 4px 24px rgba(197,160,40,0.15)',
              }}>
                {/* Inner navy border */}
                <div style={{
                  position: 'absolute',
                  inset: 10,
                  border: '1px solid #0a1a3e',
                  borderRadius: 'calc(var(--radius-2xl) - 4px)',
                  pointerEvents: 'none',
                }} />

                {/* Inner gold thin border */}
                <div style={{
                  position: 'absolute',
                  inset: 16,
                  border: '0.5px solid #e8d490',
                  borderRadius: 'calc(var(--radius-2xl) - 8px)',
                  pointerEvents: 'none',
                }} />

                {/* Top gold bar */}
                <div style={{
                  position: 'absolute',
                  top: 18, left: 18, right: 18,
                  height: 5,
                  background: '#c5a028',
                  borderRadius: 2,
                }} />

                {/* Bottom gold bar */}
                <div style={{
                  position: 'absolute',
                  bottom: 18, left: 18, right: 18,
                  height: 5,
                  background: '#c5a028',
                  borderRadius: 2,
                }} />

                {/* Academy name */}
                <p style={{
                  fontSize: 'var(--font-size-xs)',
                  color: '#0a1a3e',
                  fontWeight: 'var(--font-weight-bold)',
                  letterSpacing: '0.12em',
                  marginBottom: 'var(--space-xs)',
                  position: 'relative', zIndex: 1,
                }}>
                  APEX TECH ACADEMY
                </p>

                {/* Tagline */}
                <p style={{
                  fontSize: 'var(--font-size-xs)',
                  color: '#c5a028',
                  fontStyle: 'italic',
                  marginBottom: 'var(--space-md)',
                  position: 'relative', zIndex: 1,
                }}>
                  Learn Today. Build Tomorrow.
                </p>

                {/* Gold divider */}
                <div style={{
                  width: 120,
                  height: 1,
                  background: '#c5a028',
                  margin: '0 auto var(--space-lg)',
                  position: 'relative', zIndex: 1,
                }} />

                {/* Title */}
                <p style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  color: '#0a1a3e',
                  marginBottom: 'var(--space-xs)',
                  position: 'relative', zIndex: 1,
                }}>
                  Certificate
                </p>
                <p style={{
                  fontSize: 'var(--font-size-xs)',
                  color: '#8a8a9a',
                  letterSpacing: '0.3em',
                  marginBottom: 'var(--space-lg)',
                  position: 'relative', zIndex: 1,
                }}>
                  OF COMPLETION
                </p>

                {/* Star */}
                <div style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  background: 'rgba(197,160,40,0.08)',
                  border: '1px solid #e8d490',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-md)',
                  position: 'relative', zIndex: 1,
                }}>
                  <span style={{ fontSize: '2rem', color: '#c5a028' }}>&#9733;</span>
                </div>

                {/* Presented to */}
                <p style={{ color: '#8a8a9a', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)', position: 'relative', zIndex: 1 }}>
                  This is to certify that
                </p>

                {/* Student name */}
                <h2 style={{
                  color: '#0a1a3e',
                  fontWeight: 'var(--font-weight-extrabold)',
                  fontSize: 'var(--font-size-2xl)',
                  marginBottom: 'var(--space-xs)',
                  position: 'relative', zIndex: 1,
                }}>
                  {cert.student?.firstName || user?.firstName} {cert.student?.lastName || user?.lastName}
                </h2>

                {/* Gold underline */}
                <div style={{
                  width: 200,
                  height: 1,
                  background: '#c5a028',
                  margin: '0 auto var(--space-md)',
                  position: 'relative', zIndex: 1,
                }} />

                <p style={{ color: '#4a4a6a', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)', position: 'relative', zIndex: 1 }}>
                  has successfully completed
                </p>

                <h3 style={{
                  color: '#c5a028',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--font-size-xl)',
                  marginBottom: cert.grade ? 'var(--space-md)' : 'var(--space-lg)',
                  position: 'relative', zIndex: 1,
                }}>
                  {cert.course?.title}
                </h3>

                {/* Grade badge — navy with gold border */}
                {cert.grade && (
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 20px',
                    background: '#0a1a3e',
                    border: '1.5px solid #c5a028',
                    borderRadius: 'var(--radius-full)',
                    color: '#ffffff',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--space-lg)',
                    position: 'relative', zIndex: 1,
                  }}>
                    Grade: {cert.grade}
                  </div>
                )}

                {/* Issue details */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--space-xl)',
                  borderTop: '1px solid #e8d490',
                  paddingTop: 'var(--space-md)',
                  marginBottom: 'var(--space-sm)',
                  position: 'relative', zIndex: 1,
                }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#c5a028', fontWeight: 'var(--font-weight-bold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Certificate ID</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#0a1a3e', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'var(--font-family-mono)' }}>{cert.certificateId}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#c5a028', fontWeight: 'var(--font-weight-bold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Issued</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#0a1a3e', fontWeight: 'var(--font-weight-semibold)' }}>
                      {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>

                {/* Signature */}
                <div style={{
                  width: 140, height: 1,
                  background: '#0a1a3e',
                  margin: 'var(--space-sm) auto var(--space-xs)',
                  position: 'relative', zIndex: 1,
                }} />
                <p style={{ fontSize: 'var(--font-size-xs)', color: '#0a1a3e', fontWeight: 'var(--font-weight-semibold)', position: 'relative', zIndex: 1 }}>
                  Director, Apex Tech Academy
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: '#8a8a9a', fontStyle: 'italic', marginTop: 2, position: 'relative', zIndex: 1 }}>
                  Off Gambari Road, Ilorin, Kwara State
                </p>
              </div>

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-md)',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <Button
                  loading={downloading === cert._id}
                  onClick={() => handleDownload(cert)}
                >
                  Download Certificate (PDF)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/verify/${cert.certificateId}`;
                    navigator.clipboard?.writeText(url)
                      .then(() => setAlert({ type: 'success', msg: 'Verification link copied to clipboard!' }))
                      .catch(() => setAlert({ type: 'info', msg: `Verification link: ${url}` }));
                  }}
                >
                  Copy Verification Link
                </Button>
              </div>

              <p style={{
                textAlign: 'center',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-sm)',
              }}>
                Verify at:{' '}
                <a
                  href={`/verify/${cert.certificateId}`}
                  style={{ color: 'var(--color-primary)' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  apextechacademy.com/verify/{cert.certificateId}
                </a>
              </p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentCertificates;
