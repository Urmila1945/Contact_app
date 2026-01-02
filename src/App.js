import React, { useState } from 'react';
import ContactForm from './ContactForm';
import ContactList from './ContactList';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(0);
  const [editingContact, setEditingContact] = useState(null);

  const handleContactAdded = () => {
    setRefresh(prev => prev + 1);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Contact Management App</h1>
        <p>Manage your contacts with advanced features</p>
      </header>
      <main className="main-content">
        <ContactForm 
          onContactAdded={handleContactAdded} 
          editingContact={editingContact}
          onCancelEdit={handleCancelEdit}
        />
        <ContactList 
          key={refresh} 
          onEditContact={handleEditContact}
        />
      </main>
    </div>
  );
}

export default App;
