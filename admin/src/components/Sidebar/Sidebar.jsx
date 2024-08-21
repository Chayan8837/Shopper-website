import React from 'react';
import "./Sidebar.css"
import { Link } from 'react-router-dom';
import list_product from "../../assets/Product_list_icon.svg";
import add_product from "../../assets/Product_Cart.svg"
const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to="/addproduct" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={add_product} alt="Add Product" />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to="/listproduct" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={list_product} alt="List Product" />
          <p>List Products</p>
        </div>
      </Link>
    </div>
  );
}

export default Sidebar;
