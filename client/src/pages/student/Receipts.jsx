import React from 'react';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { receiptService } from '../../services';
import '../admin/Portal.css';

function StudentReceipts() {
  const { data, loading, error } = useApi(
    () => receiptService.getAll(),
    { initialData: { receipts: [] } }
  );

  const receipts = data?.receipts || [];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Receipts</h1>
        <p className="portal-page__subtitle">Download your payment receipts.</p>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {loading && <LoadingSpinner label="Loading receipts..." />}

      {!loading && receipts.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon">🧾</div>
          <p className="portal-empty__title">No receipts yet</p>
          <p className="portal-empty__text">Receipts are generated automatically after your payments are verified.</p>
        </div>
      )}

      {!loading && receipts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {receipts.map((r) => (
            <div key={r._id} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)', padding: 'var(--space-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 'var(--space-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>🧾</span>
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                    {r.receiptNumber}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {r.course?.title || 'Course Fee'} · {new Date(r.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-success)', fontSize: 'var(--font-size-md)' }}>
                  {r.currency} {r.amount}
                </span>
                <Button size="sm" variant="outline">Download PDF</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentReceipts;
