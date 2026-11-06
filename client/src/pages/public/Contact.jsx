import React, { useState } from 'react';
import PageHeader     from '../../components/ui/PageHeader';
import FormField      from '../../components/ui/FormField';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import Icon           from '../../components/common/Icons';
import useForm        from '../../hooks/useForm';
import { contactService } from '../../services';
import './Contact.css';

const contactInfo = [
  { icon: 'location', label: 'Address',      value: 'Off Gambari Road, Ilorin, Kwara State, Nigeria' },
  { icon: 'phone',    label: 'Phone',         value: '07064359797' },
  { icon: 'phone',    label: 'Phone',         value: '07081721079' },
  { icon: 'email',    label: 'Email',         value: 'info@apextechacademy.com' },
  { icon: 'clock',    label: 'Office Hours',  value: 'Mon – Fri: 8:00 AM – 6:00 PM' },
];

const socials = [
  { label: 'Twitter',   href: '#', text: 'X' },
  { label: 'LinkedIn',  href: '#', text: 'in' },
  { label: 'Instagram', href: '#', text: 'IG' },
  { label: 'YouTube',   href: '#', text: 'YT' },
];

const validate = (values) => {
  const e = {};
  if (!values.name.trim())    e.name    = 'Your name is required.';
  if (!values.email.trim())   e.email   = 'Your email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email address.';
  if (!values.subject.trim()) e.subject = 'Please enter a subject.';
  if (values.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
  return e;
};

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const { values, errors, loading, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { name: '', email: '', subject: '', message: '' },
    validate,
    onSubmit: async (vals) => {
      await contactService.send(vals);
      setSubmitted(true);
      reset();
    },
  });

  return (
    <div className="contact-page">
      <PageHeader
        dark
        title="Contact Us"
        subtitle="Have a question or want to enroll? We'd love to hear from you."
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">

            {/* Info panel */}
            <div className="contact-info">
              <h2 className="contact-info__heading">Get in Touch</h2>
              <p className="contact-info__intro">
                Whether you're ready to enroll, have questions about our programs, or want to
                partner with us — reach out and our team will respond within 24 hours.
              </p>

              <div className="contact-info__items">
                {contactInfo.map((item, i) => (
                  <div key={i} className="contact-info__item">
                    <div className="contact-info__icon-wrap">
                      <Icon name={item.icon} size={18} color="var(--color-primary)" />
                    </div>
                    <div>
                      <p className="contact-info__label">{item.label}</p>
                      <p className="contact-info__value">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label} className="contact-social__link">
                    {s.text}
                  </a>
                ))}
              </div>
            </div>

            {/* Form panel */}
            <div className="contact-form-wrapper">
              <h2 className="contact-form__heading">Send a Message</h2>

              {submitted && (
                <Alert type="success" onClose={() => setSubmitted(false)}>
                  Thank you! Your message has been sent. We will get back to you within 24 hours.
                </Alert>
              )}

              {apiError && (
                <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
              )}

              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="contact-form__row">
                  <FormField
                    label="Full Name" name="name" value={values.name}
                    onChange={handleChange} error={errors.name}
                    required placeholder="Your full name"
                  />
                  <FormField
                    label="Email Address" name="email" type="email" value={values.email}
                    onChange={handleChange} error={errors.email}
                    required placeholder="you@example.com"
                  />
                </div>
                <FormField
                  label="Subject" name="subject" value={values.subject}
                  onChange={handleChange} error={errors.subject}
                  required placeholder="What is this about?"
                />
                <FormField
                  label="Message" name="message" type="textarea" value={values.message}
                  onChange={handleChange} error={errors.message}
                  required rows={6} placeholder="Write your message here..."
                />
                <Button type="submit" loading={loading} fullWidth>
                  Send Message
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
