import React, { createContext, useState, useEffect } from 'react';

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300; index++) {
        cart[index] = 0;
    }
    return cart;
};

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const [all_product, setall_product] = useState([]);

    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch("https://shopper-website.onrender.com/allproducts");
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const result = await response.json();
                setall_product(result);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        const fetchcartdata = async () => {
            if (localStorage.getItem("auth-token")) {
                const authToken = localStorage.getItem("auth-token");
                console.log("authToken :", authToken);

                const responce = await fetch("https://shopper-website.onrender.com/getcart", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': authToken
                    },
                    body: ""
                })

                const result = await responce.json();
                setCartItems(result);
            }

        }



        fetchAllProducts();
        fetchcartdata()
    }, []);

    const addToCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] + 1
        }));

        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            console.log("authToken :", authToken);

            const payload = { itemId };

            fetch("https://shopper-website.onrender.com/addtocart", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to add item to cart (${response.status})`);
                    }
                    console.log('Item added to cart successfully');
                })
                .catch(error => {
                    console.error('Error adding item to cart:', error);
                    setCartItems((prev) => ({
                        ...prev,
                        [itemId]: prev[itemId] - 1
                    }));
                });
        } else {
            console.error('No auth token found');
        }
    };


    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : 0
        }));


        const authToken = localStorage.getItem("auth-token");
        if (authToken) {
            console.log("authToken :", authToken);

            const payload = { itemId };

            fetch("https://shopper-website.onrender.com/removefromcart", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to remove item to cart (${response.status})`);
                    }
                    console.log('Item remove from cart successfully');
                })
                .catch(error => {
                    console.error('Error adding item to cart:', error);
                    setCartItems((prev) => ({
                        ...prev,
                        [itemId]: prev[itemId] - 1
                    }));
                });
        } else {
            console.error('No auth token found');
        }





    };

    const contextValue = {
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
