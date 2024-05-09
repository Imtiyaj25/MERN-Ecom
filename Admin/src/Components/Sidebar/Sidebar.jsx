import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import add_prod from "../../assets/Admin Panel Assets/Product_Cart.svg"
import list_prod from "../../assets/Admin Panel Assets/Product_list_icon.svg"

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Link to={'/addproduct'} style={{textDecoration:"none"}}>
            <div className="sidebar-item">
                <img src={add_prod} alt="" />
                <p>Add Product</p>
            </div>
        </Link>
        <Link to={'/listproduct'} style={{textDecoration:"none"}}>
            <div className="sidebar-item">
                <img src={list_prod} alt="" />
                <p>Product List</p>
            </div>
        </Link>
    </div>
  )
}

export default Sidebar