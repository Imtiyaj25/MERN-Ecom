import React from 'react'
import './Navbar.css';
import navLogo from '../../assets/Admin Panel Assets/nav-logo.svg'
import navProfile from '../../assets/Admin Panel Assets/nav-profile.svg'

const Navbar = () => {
  return (
    <div className='navbar'>
        <img src={navLogo} alt="" className="nav-logo" />
        <img src={navProfile} alt="" className="nav-profile" />
    </div>
  )
}

export default Navbar