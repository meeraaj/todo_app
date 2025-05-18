// filepath: /home/rajesh/proj/todolist/frontend/src/components/Register.js
import React, { useState } from 'react';

function Register({ onRegister, onShowLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('mobile', mobile);
      if (profilePic) {
        formData.append('profile_pic', profilePic);
      }

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: formData // Remove Content-Type header to let browser set it with boundary
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onRegister();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        
        <div className="profile-pic-container">
          <div className="profile-pic-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" />
            ) : (
              <div className="profile-pic-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="profile-pic"
            className="profile-pic-input"
          />
          <label htmlFor="profile-pic" className="profile-pic-label">
            Choose Profile Picture
          </label>
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Register</button>
        <div className="auth-switch">
          Already have an account? 
          <button onClick={onShowLogin}>Login</button>
        </div>
      </form>
    </div>
  );
}

export default Register;