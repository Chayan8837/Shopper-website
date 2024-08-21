import React from 'react';
import nav_logo from "../../assets/nav-logo.svg";
import navprofile from "../../assets/nav-profile.svg";
import './Navbar.css'; // Make sure to create this CSS file for styling

const Navbar = () => {
  return (
    <div className='navbar'>
        <img src={nav_logo} alt="Logo" className="nav-logo" />
        <img src={navprofile} alt="Profile" className="nav-profile" />
    </div>
  );
}

export default Navbar;
