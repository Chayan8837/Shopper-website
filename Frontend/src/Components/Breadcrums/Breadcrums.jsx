import React from 'react'
import "./Breadcrums.css"
import arrow from "../assets/breadcrum_arrow.png"
import { ShopContext } from '../../context/ShopContext'
const Breadcrums = ({product}) => {
   
  return (
    <div className='breadcrums'>
        HOME <img src={arrow} alt="" /> SHOP <img src={arrow} alt="" />{product.category} <img src={arrow} alt="" />
        {product.name}



    </div>
  )
}

export default Breadcrums