import React from 'react';
import './Hero.css';
import handicon from '../assets/hand_icon.png';
import arrowIcon from '../assets/arrow.png'; // Assuming there's an arrow icon
import heroImage from '../assets/hero_image.png'; // Assuming there's a hero image

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>NEW ARRIVALS ONLY</h2>
        <div>
          <div className="hero-hand-icon">
            <p>new</p>
            <img src={handicon} alt="hand-icon" />
          </div>
          <p>collection</p>
          <p>for Everyone</p>
        </div>
        <div className="hero-latest-button">
          <div>Latest Collection</div>
          <img src={arrowIcon} alt="Arrow" />
        </div>
      </div>
      <div className="hero-right">
        <img src={heroImage} alt="hero-img" />
      </div>
    </div>
  );
};

export default Hero;
