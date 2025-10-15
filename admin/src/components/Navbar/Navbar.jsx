import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className='navbar'>
      {/* Left side: Logo + Admin Panel text */}
      <div className='navbar-left'>
        <img className='logo' src={assets.logo} alt='Logo' />
        <span className='admin-text'>Admin Panel</span>
      </div>

      {/* Right side: Logout button */}
      <div className='navbar-right'>
        <button onClick={logout} className='logout-btn'>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
