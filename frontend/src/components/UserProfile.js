import React from 'react';

function UserProfile({ user, onClose, onLogout }) {
  return (
    <div className="user-profile-modal">
      <div className="user-profile-content">
        <div className="user-profile-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="user-profile-body">
          <div className="profile-pic-container">
            <img 
              src="/default-avatar.png"
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23718096" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'
              }}
            />
          </div>
          
          <div className="profile-info">
            <div className="profile-field">
              <label>Name:</label>
              <span>{user.name || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="profile-field">
              <label>Mobile:</label>
              <span>{user.mobile || 'Not provided'}</span>
            </div>
          </div>
          
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;