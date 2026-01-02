import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactList = ({ onEditContact }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, categoryFilter]);

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      
      const response = await axios.get(`http://localhost:5000/api/contacts?${params}`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`http://localhost:5000/api/contacts/${id}`);
        setContacts(contacts.filter(contact => contact._id !== id));
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const toggleFavorite = async (contact) => {
    try {
      const updatedContact = { ...contact, isFavorite: !contact.isFavorite };
      await axios.put(`http://localhost:5000/api/contacts/${contact._id}`, updatedContact);
      setContacts(contacts.map(c => c._id === contact._id ? updatedContact : c));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Category', 'Message', 'Date Added'],
      ...contacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone,
        contact.category,
        contact.message || '',
        new Date(contact.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'email') return a.email.localeCompare(b.email);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'favorites') return b.isFavorite - a.isFavorite;
    return 0;
  });

  const getCategoryColor = (category) => {
    const colors = {
      Personal: '#3498db',
      Work: '#e74c3c',
      Family: '#2ecc71',
      Other: '#9b59b6'
    };
    return colors[category] || '#667eea';
  };

  if (loading) return <div className="loading">Loading contacts...</div>;

  return (
    <div className="contact-list-container">
      <div className="list-header">
        <h2>Contact List ({contacts.length})</h2>
        <button onClick={exportToCSV} className="export-btn">Export CSV</button>
      </div>
      
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Family">Family</option>
            <option value="Other">Other</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="category">Sort by Category</option>
            <option value="date">Sort by Date</option>
            <option value="favorites">Sort by Favorites</option>
          </select>
        </div>
      </div>

      {contacts.length === 0 ? (
        <p className="no-contacts">No contacts found. {searchTerm ? 'Try a different search term.' : 'Add one above!'}</p>
      ) : (
        <div className="contact-grid">
          {sortedContacts.map(contact => (
            <div key={contact._id} className="contact-card">
              <div className="card-header">
                <h3>{contact.name}</h3>
                <div className="card-actions">
                  <button 
                    onClick={() => toggleFavorite(contact)} 
                    className={`favorite-btn ${contact.isFavorite ? 'active' : ''}`}
                    title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    ★
                  </button>
                  <button onClick={() => onEditContact(contact)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(contact._id)} className="delete-btn">Delete</button>
                </div>
              </div>
              
              <div className="contact-info">
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Phone:</strong> {contact.phone}</p>
                <div className="category-badge" style={{ backgroundColor: getCategoryColor(contact.category) }}>
                  {contact.category}
                </div>
                {contact.message && <p><strong>Message:</strong> {contact.message}</p>}
                <p className="date-added">Added: {new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;
