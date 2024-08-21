import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import ListProduct from '../components/ListProduct/ListProduct';
import AddProduct from '../components/AddProduct/AddProduct';
import "./Admin.css"




const Admin = () => {
  return (
    <div className='admin'>
        <Sidebar/>
        <Routes>
            <Route path='addproduct' element={<AddProduct/>}/>
            <Route path='listproduct' element={<ListProduct/>}/>

        </Routes>
      </div>
    
  );
}

export default Admin;
