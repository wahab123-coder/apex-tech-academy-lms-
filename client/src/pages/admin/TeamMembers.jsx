import React, { useState } from 'react';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import teamService    from '../../services/teamService';
import './Portal.css';
import './TeamMembers.css';

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = 'Name is required.';
  if (!v.role.trim()) e.role = 'Role is required.';
  return e;
};

function AdminTeamMembers() {
  const [addOpen,   setAddOpen]   = useState(false);
  const [editMember,setEditMember]= useState(null); // member object when editing
  const [alert,     setAlert]     = useState(null);
  const [deleting,  setDeleting]  = useState(null); // id being deleted

  const { data, loading, error, refetch } = useApi(
    () => teamService.getAllAdmin(),
    { initialData: { members: [] } }
  );

  const members = data?.members || [];

  // ── Add form ──────────────────────────────────────────────
  const addForm = useForm({
    initialValues: { name: '', role: '', bio: '', order: '', photo: '' },
    validate,
    onSubmit: async (vals) => {
      await teamService.create({
        name:  vals.name,
        role:  vals.role,
        bio:   vals.bio,
        order: vals.order ? Number(vals.order) : 0,
        photo: vals.photo || null,
      });
      setAlert({ type: 'success', msg: `${vals.name} added to the team.` });
      setAddOpen(false);
      addForm.reset();
      refetch();
    },
  });

  // ── Edit form ─────────────────────────────────────────────
  const editForm = useForm({
    initialValues: { name: '', role: '', bio: '', order: '', photo: '' },
    validate,
    onSubmit: async (vals) => {
      await teamService.update(editMember._id, {
        name:  vals.name,
        role:  vals.role,
        bio:   vals.bio,
        order: vals.order ? Number(vals.order) : 0,
        photo: vals.photo || null,
      });
      setAlert({ type: 'success', msg: `${vals.name} updated successfully.` });
      setEditMember(null);
      refetch();
    },
  });

  const handleEdit = (member) => {
    editForm.setValues({
      name:  member.name,
      role:  member.role,
      bio:   member.bio   || '',
      order: String(member.order || 0),
      photo: member.photo || '',
    });
    setEditMember(member);
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete "${member.name}" from the team? This cannot be undone.`)) return;
    setDeleting(member._id);
    try {
      await teamService.remove(member._id);
      setAlert({ type: 'success', msg: `${member.name} has been removed.` });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleVisibility = async (member) => {
    try {
      await teamService.toggleVisibility(member._id);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Team Members</h1>
        <p className="portal-page__subtitle">
          Manage the team members shown on the public About page.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => { addForm.reset(); setAddOpen(true); }}>
            + Add Team Member
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading team members..." />
      ) : members.length === 0 ? (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>👥</div>
          <p className="portal-empty__title">No team members yet</p>
          <p className="portal-empty__text">Add your first team member to display on the About page.</p>
        </div>
      ) : (
        <div className="team-grid">
          {members.map((member) => (
            <div
              key={member._id}
              className={`team-admin-card ${!member.isVisible ? 'team-admin-card--hidden' : ''}`}
            >
              {/* Visibility badge */}
              <div className="team-admin-card__status">
                <span className={`badge badge--${member.isVisible ? 'success' : 'muted'}`}>
                  {member.isVisible ? 'Visible' : 'Hidden'}
                </span>
                {member.order > 0 && (
                  <span className="badge badge--info">#{member.order}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="team-admin-card__avatar">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} />
                ) : (
                  <span>{getInitials(member.name)}</span>
                )}
              </div>

              {/* Info */}
              <div className="team-admin-card__info">
                <h3 className="team-admin-card__name">{member.name}</h3>
                <p className="team-admin-card__role">{member.role}</p>
                {member.bio && (
                  <p className="team-admin-card__bio">
                    {member.bio.length > 90 ? member.bio.slice(0, 90) + '…' : member.bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="team-admin-card__actions">
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleEdit(member)}
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => handleToggleVisibility(member)}
                  title={member.isVisible ? 'Hide from public' : 'Show on public'}
                >
                  {member.isVisible ? 'Hide' : 'Show'}
                </button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleting === member._id}
                  onClick={() => handleDelete(member)}
                  title="Delete permanently"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Modal ── */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Team Member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={addForm.loading} onClick={addForm.handleSubmit}>Add Member</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {addForm.apiError && (
            <Alert type="error" onClose={() => addForm.setApiError('')}>{addForm.apiError}</Alert>
          )}
          <div className="form-card__row">
            <FormField
              label="Full Name *" name="name"
              value={addForm.values.name} onChange={addForm.handleChange}
              error={addForm.errors.name} required
              placeholder="e.g. Dr. Emmanuel Obi"
            />
            <FormField
              label="Role / Position *" name="role"
              value={addForm.values.role} onChange={addForm.handleChange}
              error={addForm.errors.role} required
              placeholder="e.g. Founder & CEO"
            />
          </div>
          <FormField
            label="Bio" name="bio" type="textarea" rows={3}
            value={addForm.values.bio} onChange={addForm.handleChange}
            placeholder="Short biography (optional)"
          />
          <div className="form-card__row">
            <FormField
              label="Photo URL (optional)" name="photo"
              value={addForm.values.photo} onChange={addForm.handleChange}
              placeholder="https://example.com/photo.jpg"
            />
            <FormField
              label="Display Order" name="order" type="number"
              value={addForm.values.order} onChange={addForm.handleChange}
              placeholder="1, 2, 3… (lower = first)"
            />
          </div>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={!!editMember}
        onClose={() => setEditMember(null)}
        title={`Edit — ${editMember?.name || ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button loading={editForm.loading} onClick={editForm.handleSubmit}>Save Changes</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {editForm.apiError && (
            <Alert type="error" onClose={() => editForm.setApiError('')}>{editForm.apiError}</Alert>
          )}
          <div className="form-card__row">
            <FormField
              label="Full Name *" name="name"
              value={editForm.values.name} onChange={editForm.handleChange}
              error={editForm.errors.name} required
            />
            <FormField
              label="Role / Position *" name="role"
              value={editForm.values.role} onChange={editForm.handleChange}
              error={editForm.errors.role} required
            />
          </div>
          <FormField
            label="Bio" name="bio" type="textarea" rows={3}
            value={editForm.values.bio} onChange={editForm.handleChange}
          />
          <div className="form-card__row">
            <FormField
              label="Photo URL" name="photo"
              value={editForm.values.photo} onChange={editForm.handleChange}
              placeholder="https://example.com/photo.jpg"
            />
            <FormField
              label="Display Order" name="order" type="number"
              value={editForm.values.order} onChange={editForm.handleChange}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminTeamMembers;
