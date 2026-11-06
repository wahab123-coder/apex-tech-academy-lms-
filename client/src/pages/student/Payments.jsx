import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import useApi         from '../../hooks/useApi';
import { paymentService, enrollmentService } from '../../services';
import api            from '../../services/api';
import '../admin/Portal.css';
import './StudentPayments.css';

const statusColor = {
  Verified: 'success', Pending: 'warning', Failed: 'error', Refunded: 'info',
};

function StudentPayments() {
  const [searchParams]              = useSearchParams();
  const [alert,        setAlert]    = useState(null);
  const [payModal,     setPayModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [initiating,   setInitiating] = useState(false);
  const [verifying,    setVerifying]  = useState(false);

  const { data, loading, error, refetch } = useApi(
    () => paymentService.getAll(),
    { initialData: { payments: [] } }
  );

  const { data: enrollData } = useApi(
    () => enrollmentService.getAll(),
    { initialData: { enrollments: [] } }
  );

  const payments    = data?.payments    || [];
  const enrollments = enrollData?.enrollments || [];
  const verified    = payments.filter((p) => p.status === 'Verified');
  const pending     = payments.filter((p) => p.status === 'Pending');
  const totalPaid   = verified.reduce((s, p) => s + (p.amount || 0), 0);

  // ── Handle redirect back from Paystack ────────────────
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;

    setVerifying(true);
    api.get(`/payments/verify/${reference}`)
      .then((res) => {
        setAlert({ type: 'success', msg: res.data.message || 'Payment verified successfully!' });
        refetch();
      })
      .catch((err) => {
        setAlert({ type: 'error', msg: err.message || 'Payment verification failed.' });
      })
      .finally(() => setVerifying(false));
  }, []);

  // ── Initiate Paystack payment ─────────────────────────
  const handleInitiatePayment = async () => {
    if (!selectedCourse) {
      setAlert({ type: 'error', msg: 'Please select a course.' });
      return;
    }

    const enrollment = enrollments.find((e) => e.course?._id === selectedCourse || e.course === selectedCourse);
    if (!enrollment) return;

    const courseAmount = enrollment.course?.price || 0;
    if (courseAmount === 0) {
      setAlert({ type: 'info', msg: 'This course is free — no payment required.' });
      setPayModal(false);
      return;
    }

    setInitiating(true);
    try {
      const res = await paymentService.initiate({
        courseId: selectedCourse,
        amount:   courseAmount,
        currency: 'NGN',
      });

      if (res.data.authorization_url) {
        // Redirect student to Paystack payment page
        window.location.href = res.data.authorization_url;
      } else {
        setAlert({ type: 'error', msg: 'Failed to get payment URL.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setInitiating(false);
    }
  };

  // Courses that haven't been fully paid yet
  const unpaidCourses = enrollments.filter((e) => {
    const courseId = e.course?._id || e.course;
    return !verified.some((p) => (p.course?._id || p.course)?.toString() === courseId?.toString());
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Payments</h1>
        <p className="portal-page__subtitle">
          Pay your course fees securely via Paystack.
        </p>
      </div>

      {verifying && (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <LoadingSpinner label="Verifying your payment..." />
        </div>
      )}

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      {/* Balance summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', maxWidth: 560, marginBottom: 'var(--space-xl)' }}>
        {[
          { label: 'Total Paid',    value: `₦${totalPaid.toLocaleString()}`, color: 'var(--color-success)' },
          { label: 'Pending',       value: pending.length,                    color: 'var(--color-warning)' },
          { label: 'Transactions',  value: payments.length,                   color: 'var(--color-primary)' },
        ].map((s) => (
          <div key={s.label} className="payment-stat">
            <p className="payment-stat__value" style={{ color: s.color }}>{s.value}</p>
            <p className="payment-stat__label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pay now button */}
      {unpaidCourses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Button onClick={() => setPayModal(true)}>
            Pay Course Fee
          </Button>
        </div>
      )}

      {/* Payment history */}
      {loading ? (
        <LoadingSpinner label="Loading payments..." />
      ) : payments.length === 0 ? (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>💳</div>
          <p className="portal-empty__title">No payments yet</p>
          <p className="portal-empty__text">Your payment history will appear here after your first transaction.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {payments.map((p) => (
            <div key={p._id} className="payment-row">
              <div>
                <p className="payment-row__title">{p.description || p.course?.title || 'Course Fee'}</p>
                <p className="payment-row__meta">
                  {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {p.paymentMethod && ` · ${p.paymentMethod}`}
                  {p.providerReference && ` · Ref: ${p.providerReference}`}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-success)', fontSize: 'var(--font-size-md)' }}>
                  ₦{(p.amount || 0).toLocaleString()}
                </span>
                <span className={`badge badge--${statusColor[p.status]}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        title="Pay Course Fee"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button loading={initiating} onClick={handleInitiatePayment}>
              Proceed to Paystack
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="paystack-info">
            <div className="paystack-info__icon">🔒</div>
            <div>
              <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                Secure Payment via Paystack
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                You will be redirected to Paystack to complete your payment safely.
              </p>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Select Course *</label>
            <select
              className="form-field__input"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Choose a course to pay for</option>
              {unpaidCourses.map((e) => {
                const course = e.course;
                const price  = course?.price || 0;
                return (
                  <option key={course?._id} value={course?._id}>
                    {course?.title} {price > 0 ? `— ₦${price.toLocaleString()}` : '(Free)'}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedCourse && (() => {
            const enrollment = unpaidCourses.find((e) => e.course?._id === selectedCourse);
            const price = enrollment?.course?.price || 0;
            return price > 0 ? (
              <div className="payment-summary">
                <div className="payment-summary__row">
                  <span>Course fee</span>
                  <span>₦{price.toLocaleString()}</span>
                </div>
                <div className="payment-summary__row payment-summary__row--total">
                  <span>Total</span>
                  <span>₦{price.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <Alert type="info">This course is free — no payment required.</Alert>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
}

export default StudentPayments;
