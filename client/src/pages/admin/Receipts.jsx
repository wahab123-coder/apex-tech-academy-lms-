import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { receiptService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'receiptNumber', label: 'Receipt No.' },
  { key: 'student',  label: 'Student',  render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'course',   label: 'Course',   render: (v) => v?.title || '—' },
  { key: 'amount',   label: 'Amount',   render: (v, r) => `${r.currency} ${v}` },
  { key: 'issuedAt', label: 'Date',     render: (v) => new Date(v).toLocaleDateString() },
  { key: 'actions',  label: 'Actions',  render: () => (
    <button className="btn btn--outline btn--sm">Download PDF</button>
  )},
];

function AdminReceipts() {
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi(
    () => receiptService.getAll(),
    { initialData: { receipts: [] } }
  );

  const receipts = data?.receipts || [];
  const filtered = receipts.filter((r) =>
    `${r.student?.firstName} ${r.student?.lastName} ${r.receiptNumber}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Receipts</h1>
        <p className="portal-page__subtitle">Payment receipts issued to students.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search receipts..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading receipts..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No receipts found." />
      )}
    </div>
  );
}

export default AdminReceipts;
