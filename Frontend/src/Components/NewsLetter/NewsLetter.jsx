import React from 'react'
import "./NewsLetter.css"

const NewsLetter = () => {
  return (
    <div className='newsletter'>
        <h1>GET EXCLUSIVE OFFERS On Your Email</h1>
        <p>Subscribe to our newsletter and stay updated</p>
        <div>
        <input type="email" placeholder='your email id' />
        <button>subscribe</button>
        </div>
    </div>
  )
}

export default NewsLetter