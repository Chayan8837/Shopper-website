import React, { useContext, useState } from 'react'
import "./Navbar.css"
import { Link } from 'react-router-dom'
import carticon from"../assets/cart_icon.png"
import logo from "../assets/logo.png"
import { ShopContext } from '../../context/ShopContext'


const Navbar = () => {
  const [menu, setmenu] = useState("shop")
  const { cartItems } = useContext(ShopContext);

    
    const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item, 0);
  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </div>
      
      <ul className='nav-menu'>
        <li onClick={()=>{setmenu("shop")}} ><Link to={'./'} style={{textDecoration:'none', color:'black'}}>Shop</Link>  {menu==="shop"?<hr/>:null} </li> 
        <li onClick={()=>{setmenu("men")}}><Link to={'/men'} style={{textDecoration:'none', color:'black'}}>Men </Link>{menu==="men"?<hr/>:null} </li>
        <li onClick={()=>{setmenu("women")}}><Link to={'./women'} style={{textDecoration:'none', color:'black'}}>Women</Link> {menu==="women"?<hr/>:null} </li>
        <li onClick={()=>{setmenu("kid")}}><Link to={"./kid"} style={{textDecoration:'none', color:'black'}}>Kid </Link> {menu==="kid"?<hr/>:null}</li>
      </ul>
      <div className="nav-login-cart">
        {localStorage.getItem('auth-token')?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace("/")}}>Logout</button>:<Link to={"./login"} > <button>
          Login
        </button></Link>}
       
       <Link to={"./cart"} style={{textDecoration:'none', color:'black'}}><img src={carticon} alt="cart" /></Link> 
        <div className="nav-cart-count">
          {totalItems}
        </div>

      </div>


        
    </div>
  )
}

export default Navbar