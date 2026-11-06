import React, { useState } from 'react';
import Table             from '../../components/ui/Table';
import Alert             from '../../components/ui/Alert';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import Button            from '../../components/ui/Button';
import useApi            from '../../hooks/useApi';
import { paymentService } from '../../services';
import './Portal.css';

const statusColor = { Verified: 'success', Pending: 'warning', Failed: 'error', Refunded: 'info' };

function AdminPayments() {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [alert,        setAlert]        = useState(null);
  const [verifying,    setVerifying]    = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => paymentService.getAll(),
    { initialData: { payments: [] } }
  );

  const payments = data?.payments || [];

  const filtered = payments.filter((p) => {
    const name = `${p.student?.firstName} ${p.student?.lastName}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const verified = payments.filter(p => p.status === 'Verified');
  const totalRevenue = verified.reduce((sum, p) => sum + p.amount, 0);
  const pending  = payments.filter(p => p.status === 'Pending').length;
  const failed   = payments.filter(p => p.status === 'Failed').length;

  const handleVerify = async (paymentId) => {
    setVerifying(paymentId);
    try {
      await paymentService.adminVerify(paymentId);
      setAlert({ type: 'success', msg: 'Payment verified and receipt generated.' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setVerifying(null);
    }
  };

  const columns = [
    { key: 'student',     label: 'Student',   render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'course',      label: 'Course',    render: (v) => v?.title || '—' },
    { key: 'amount',      label: 'Amount',    render: (v, r) => `${r.currency} ${v}` },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'createdAt',   label: 'Date',      render: (v) => new Date(v).toLocaleDateString() },
    { key: 'status',      label: 'Status',    render: (v) => <span className={`badge badge--${statusColor[v]}`}>{v}</span> },
    { key: 'actions',     label: 'Actions',   render: (_, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        {row.status === 'Pending' && (
          <Button size="sm" loading={verifying === row._id} onClick={() => handleVerify(row._id)}>
            Verify
          </Button>
        )}
        {row.status !== 'Pending' && <button className="btn btn--ghost btn--sm">View</button>}
      </div>
    )},
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Payments</h1>
        <p className="portal-page__subtitle">All payment transactions — server-verified only.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <DashboardStatCard title="Total Revenue"  value={`$${totalRevenue.toLocaleString()}`} icon="💰" color="success" />
        <DashboardStatCard title="Verified"       value={verified.length} icon="✅" color="primary" />
        <DashboardStatCard title="Pending"        value={pending}         icon="⏳" color="warning" />
        <DashboardStatCard title="Failed"         value={failed}          icon="❌" color="error"   />
      </div>

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search by student..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {['All','Verified','Pending','Failed'].map((s) => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading payments..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No payment records found." />
      )}
    </div>
  );
}

export default AdminPayments;
