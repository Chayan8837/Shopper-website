import React, { useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import star_icon from '../assets/star_icon.png';
import star_dull_icon from '../assets/star_dull_icon.png';
import './ProductDisplay.css';
import { ShopContext } from '../../context/ShopContext';

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);

  const handleAddToCart = () => {
    addToCart(product.id);
    toast.success("Item added to cart!");
  };

  return (
    <div className='ProductDisplay'>
      <div className="ProductDisplay-left">
        <div className="ProductDisplay-img-list">
          <img src={product.image} alt="product" />
          <img src={product.image} alt="product" />
          <img src={product.image} alt="product" />
          <img src={product.image} alt="product" />
        </div>
      </div>
      <div className="ProductDisplay-img">
        <img className="productdisplay-main-img" src={product.image} alt="product" />
      </div>
      <div className="ProductDisplay-right">
        <h1>{product.name}</h1>
        <div className="ProductDisplay-right-star">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="star" />
          <p>(129)</p>
        </div>
        <div className="ProductDisplay-right-prices">
          <div className="ProductDisplay-right-price-old">
            ${product.old_price}
          </div>
          <div className="ProductDisplay-right-price-new">
            ${product.new_price}
          </div>
        </div>
        <div className="ProductDisplay-right-description">
          Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket
        </div>
        <div className="ProductDisplay-right-size">
          <h1>Select Size</h1>
          <div className="ProductDisplay-right-size-options">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button onClick={handleAddToCart}>Add to Cart</button>
        <p className='ProductDisplay-right-category'>
          <span>Category: </span> Women, Tshirt, crop top
        </p>
        <p className='ProductDisplay-right-tags'>
          <span>Tags: </span> Women, Tshirt, crop top
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ProductDisplay;
