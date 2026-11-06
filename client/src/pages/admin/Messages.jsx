import React, { useState } from 'react';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { messageService } from '../../services';
import './Portal.css';
import './Messages.css';

function AdminMessages() {
  const [active,  setActive]  = useState(null);
  const [reply,   setReply]   = useState('');
  const [sending, setSending] = useState(false);
  const [alert,   setAlert]   = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => messageService.getAll(),
    { initialData: { messages: [] } }
  );

  const messages = data?.messages || [];

  const handleSelect = async (msg) => {
    setActive(msg);
    setReply('');
    if (!msg.isRead) {
      await messageService.markRead(msg._id).catch(() => {});
      refetch();
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !active) return;
    setSending(true);
    try {
      await messageService.send({ to: active.from._id, subject: `Re: ${active.subject}`, body: reply });
      setAlert({ type: 'success', msg: 'Reply sent.' });
      setReply('');
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Messages</h1>
        <p className="portal-page__subtitle">View and reply to messages from students and instructors.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      {loading ? <LoadingSpinner label="Loading messages..." /> : (
        <div className="messages-layout">
          {/* Thread list */}
          <div className="messages-list">
            {messages.length === 0 ? (
              <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No messages yet.
              </p>
            ) : messages.map((msg) => (
              <button
                key={msg._id}
                className={`message-thread ${active?._id === msg._id ? 'active' : ''} ${!msg.isRead ? 'unread' : ''}`}
                onClick={() => handleSelect(msg)}
              >
                <div className="message-thread__avatar">
                  {msg.from?.firstName?.[0]}{msg.from?.lastName?.[0]}
                </div>
                <div className="message-thread__body">
                  <div className="message-thread__top">
                    <span className="message-thread__from">
                      {msg.from?.firstName} {msg.from?.lastName}
                    </span>
                    <span className="message-thread__date">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="message-thread__subject">{msg.subject}</p>
                  <p className="message-thread__preview">{msg.body}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Message panel */}
          <div className="messages-panel">
            {active ? (
              <>
                <div className="messages-panel__header">
                  <h3>{active.subject}</h3>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    From: {active.from?.firstName} {active.from?.lastName} ({active.from?.email})
                  </span>
                </div>
                <div className="messages-panel__body">
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                    {active.body}
                  </p>
                </div>
                <div className="messages-panel__reply">
                  <textarea
                    className="form-field__input"
                    rows={4}
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={handleReply}
                      disabled={sending || !reply.trim()}
                    >
                      {sending ? 'Sending…' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="portal-empty">
                <div className="portal-empty__icon">💬</div>
                <p className="portal-empty__title">Select a message</p>
                <p className="portal-empty__text">Choose a thread from the list to read and reply.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
