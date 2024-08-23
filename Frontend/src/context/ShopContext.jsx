import React, { createContext, useState, useEffect } from 'react';

const getDefaultCart = () => {
    return Array(300).fill(0); // Initialize cart as an array with 300 zeros
};

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const [all_product, setAllProduct] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setError(null); // Reset error before starting a new request
                const response = await fetch("https://shopper-website.onrender.com/allproducts");
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const result = await response.json();
                setAllProduct(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to fetch products');
            }
        };

        const fetchCartData = async () => {
            const authToken = localStorage.getItem("auth-token");
            if (authToken) {
                try {
                    setError(null); // Reset error before starting a new request
                    const response = await fetch("https://shopper-website.onrender.com/getcart", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': authToken
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch cart data');
                    }

                    const result = await response.json();
                    setCartItems(result);
                } catch (error) {
                    console.error('Error fetching cart data:', error);
                    setError('Failed to fetch cart data');
                }
            } else {
                console.error('No auth token found');
                setError('No authentication token found');
            }
        };

        fetchAllProducts();
        fetchCartData();
    }, []);

    const addToCart = async (itemId) => {
        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            try {
                setError(null); // Reset error before starting a new request
                const response = await fetch("https://shopper-website.onrender.com/addtocart", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': authToken
                    },
                    body: JSON.stringify({ itemId, quantity: 1 }) // Ensure quantity is passed
                });

                if (!response.ok) {
                    throw new Error(`Failed to add item to cart (${response.status})`);
                }

                setCartItems(prev => {
                    const newCart = [...prev];
                    newCart[itemId] = (newCart[itemId] || 0) + 1;
                    return newCart;
                });
                console.log('Item added to cart successfully');
            } catch (error) {
                console.error('Error adding item to cart:', error);
                setError('Failed to add item to cart');
            }
        } else {
            console.error('No auth token found');
            setError('No authentication token found');
        }
    };

    const removeFromCart = async (itemId) => {
        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            try {
                setError(null); // Reset error before starting a new request
                const response = await fetch("https://shopper-website.onrender.com/removefromcart", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': authToken
                    },
                    body: JSON.stringify({ itemId, quantity: 1 }) // Ensure quantity is passed
                });

                if (!response.ok) {
                    throw new Error(`Failed to remove item from cart (${response.status})`);
                }

                setCartItems(prev => {
                    const newCart = [...prev];
                    newCart[itemId] = prev[itemId] > 0 ? prev[itemId] - 1 : 0;
                    return newCart;
                });
                console.log('Item removed from cart successfully');
            } catch (error) {
                console.error('Error removing item from cart:', error);
                setError('Failed to remove item from cart');
            }
        } else {
            console.error('No auth token found');
            setError('No authentication token found');
        }
    };

    const contextValue = {
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        error
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
