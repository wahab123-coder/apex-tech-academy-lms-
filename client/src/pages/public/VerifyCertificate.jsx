import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { certificateService } from '../../services';
import './VerifyCertificate.css';

function VerifyCertificate() {
  const { certId: paramId } = useParams();
  const navigate            = useNavigate();
  const [inputId, setInputId] = useState(paramId || '');
  const [searchId, setSearchId] = useState(paramId || '');

  const { data, loading, error, refetch } = useApi(
    () => searchId ? certificateService.verify(searchId) : Promise.resolve({ data: null }),
    { initialData: null, deps: [searchId] }
  );

  const cert  = data?.certificate || null;
  const valid = data?.valid        || false;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputId.trim()) return;
    setSearchId(inputId.trim());
    navigate(`/verify/${inputId.trim()}`, { replace: true });
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="verify-page">
      {/* ── Hero ── */}
      <section className="verify-hero">
        <div className="verify-hero__bg" />
        <div className="container verify-hero__inner">
          <div className="verify-hero__badge">
            <Icon name="certificate" size={18} color="var(--color-primary)" />
            Certificate Verification
          </div>
          <h1 className="verify-hero__title">Verify a Certificate</h1>
          <p className="verify-hero__subtitle">
            Enter a certificate ID below to verify the authenticity of an Apex Tech Academy
            certificate of completion.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="verify-form">
            <input
              type="text"
              className="verify-form__input"
              placeholder="e.g. CERT-ATA-ABC12345"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              aria-label="Certificate ID"
            />
            <Button type="submit" size="lg" loading={loading}>
              Verify
            </Button>
          </form>
        </div>
      </section>

      {/* ── Result ── */}
      <section className="section">
        <div className="container verify-result-container">

          {/* Loading */}
          {loading && (
            <div className="verify-state">
              <div className="verify-spinner" />
              <p>Verifying certificate...</p>
            </div>
          )}

          {/* Error / Not found */}
          {!loading && error && searchId && (
            <div className="verify-state verify-state--invalid">
              <div className="verify-state__icon verify-state__icon--invalid">
                <Icon name="close" size={32} color="#ef4444" />
              </div>
              <h2 className="verify-state__title">Certificate Not Found</h2>
              <p className="verify-state__desc">
                No valid certificate was found with ID <strong>{searchId}</strong>.
                Please check the ID and try again.
              </p>
              <ul className="verify-state__tips">
                <li>Make sure you copied the full certificate ID</li>
                <li>Certificate IDs are case-sensitive</li>
                <li>Only issued certificates can be verified</li>
              </ul>
            </div>
          )}

          {/* Valid certificate */}
          {!loading && valid && cert && (
            <div className="verify-state verify-state--valid">
              {/* Valid badge */}
              <div className="verify-valid-badge">
                <Icon name="check" size={28} color="#fff" />
              </div>
              <h2 className="verify-state__title verify-state__title--valid">
                Certificate Verified
              </h2>
              <p className="verify-state__desc" style={{ color: 'var(--color-success)' }}>
                This is a genuine Apex Tech Academy certificate.
              </p>

              {/* Certificate card */}
              <div className="verify-cert-card">
                {/* Header */}
                <div className="verify-cert-card__header">
                  <div className="verify-cert-card__header-left">
                    <div className="verify-cert-card__logo">A</div>
                    <div>
                      <p className="verify-cert-card__academy">APEX TECH ACADEMY</p>
                      <p className="verify-cert-card__tagline">Learn Today. Build Tomorrow.</p>
                    </div>
                  </div>
                  <span className="verify-cert-card__status">
                    <Icon name="check" size={14} color="var(--color-success)" />
                    Verified
                  </span>
                </div>

                {/* Details */}
                <div className="verify-cert-card__body">
                  <p className="verify-cert-card__label">Certificate of Completion</p>
                  <h3 className="verify-cert-card__name">
                    {cert.student?.firstName} {cert.student?.lastName}
                  </h3>
                  <p className="verify-cert-card__course">{cert.course?.title}</p>

                  <div className="verify-cert-card__details">
                    {[
                      { label: 'Certificate ID', value: cert.certificateId },
                      { label: 'Issue Date',     value: formatDate(cert.issuedAt) },
                      { label: 'Grade',          value: cert.grade || 'N/A' },
                      { label: 'Issued By',      value: 'Apex Tech Academy' },
                    ].map((row) => (
                      <div key={row.label} className="verify-cert-card__row">
                        <span className="verify-cert-card__row-label">{row.label}</span>
                        <span className="verify-cert-card__row-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="verify-contact">
                Questions about this certificate?{' '}
                <a href="/contact" style={{ color: 'var(--color-primary)' }}>Contact us</a>
              </p>
            </div>
          )}

          {/* Empty state — no search yet */}
          {!loading && !searchId && (
            <div className="verify-state">
              <div className="verify-state__icon">
                <Icon name="certificate" size={40} color="var(--color-primary)" />
              </div>
              <h2 className="verify-state__title">How It Works</h2>
              <p className="verify-state__desc">
                Every certificate issued by Apex Tech Academy has a unique ID.
                Enter the ID above to instantly verify if a certificate is authentic.
              </p>
              <ul className="verify-steps">
                <li>
                  <span className="verify-steps__num">1</span>
                  Find the Certificate ID on the certificate document
                </li>
                <li>
                  <span className="verify-steps__num">2</span>
                  Enter the ID in the search box above
                </li>
                <li>
                  <span className="verify-steps__num">3</span>
                  View the verified certificate details
                </li>
              </ul>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

export default VerifyCertificate;
