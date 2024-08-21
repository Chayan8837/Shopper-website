import React, { useContext } from 'react';
import './CartItem.css';
import { ShopContext } from '../../context/ShopContext';
import all_product from '../../Components/assets/all_product';
import remove_icon from "../assets/cart_cross_icon.png";

const CartItem = () => {
    const { addToCart, removeFromCart, cartItems } = useContext(ShopContext);

    const cartIsEmpty = Object.values(cartItems).every(item => item === 0);

    const subtotal = Object.keys(cartItems).reduce((acc, itemId) => {
        const item = all_product.find(product => product.id === parseInt(itemId));
        if (item) {
            acc += item.new_price * cartItems[itemId];
        }
        return acc;
    }, 0);

    // Assuming no additional costs or discounts for simplicity
    const total = subtotal

    return (
        <div className='cartitems'>
            {cartIsEmpty ? (
                <p className="empty-cart-message">Your cart is empty</p>
            ) : (
                <>
                    <div className="cartitems-format-main">
                        <p>Products</p>
                        <p>Title</p>
                        <p>Price</p>
                        <p>Quantity</p>
                        <p>Total</p>
                        <p>Remove</p>
                    </div>
                    {all_product.map((product) => {
                        if (cartItems[product.id] > 0) {
                            return (
                                <div key={product.id} className="cartitem">
                                    <img src={product.image} alt={product.title} className="cartitem-image" />
                                    <p className="cartitem-title">{product.name}</p>
                                    <p>${product.new_price}</p>
                                    <div className="cartitem-quantity">
                                        <button onClick={() => removeFromCart(product.id)}>-</button>
                                        <span>{cartItems[product.id]}</span>
                                        <button onClick={() => addToCart(product.id)}>+</button>
                                    </div>
                                    <p>${(product.new_price * cartItems[product.id]).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(product.id)} className="cartitem-remove">
                                        <img src={remove_icon} alt="Remove" />
                                    </button>
                                </div>
                            );
                        }
                        return null;
                    })}
                    <div className="cart-summary">
                        <div className="cart-summary-row">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Total to Pay:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartItem;
