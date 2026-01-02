import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = ({ onContactAdded, editingContact, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: editingContact?.name || '',
    email: editingContact?.email || '',
    phone: editingContact?.phone || '',
    message: editingContact?.message || '',
    category: editingContact?.category || 'Other'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (editingContact) {
        await axios.put(`http://localhost:5000/api/contacts/${editingContact._id}`, formData);
        setSuccessMessage('Contact updated successfully!');
        onCancelEdit();
      } else {
        await axios.post('http://localhost:5000/api/contacts', formData);
        setFormData({ name: '', email: '', phone: '', message: '', category: 'Other' });
        setSuccessMessage('Contact added successfully!');
      }
      setErrors({});
      onContactAdded();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && /\S+@\S+\.\S+/.test(formData.email) && formData.phone;

  return (
    <div className="contact-form-container">
      <h2>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Family">Family</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
          />
        </div>
        <div className="form-buttons">
          <button type="submit" disabled={!isFormValid || isSubmitting} className="submit-btn">
            {isSubmitting ? 'Submitting...' : editingContact ? 'Update Contact' : 'Add Contact'}
          </button>
          {editingContact && (
            <button type="button" onClick={onCancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
