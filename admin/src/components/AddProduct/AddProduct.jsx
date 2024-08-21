import React, { useState } from 'react';
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";

const AddProduct = () => {
  const [image, setImage] = useState(null); // State to hold the image file
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "", // URL of the image to be stored after upload
    category: "women",
    new_price: "",
    old_price: ""
  });

  // Handle image file input
  const imageHandler = (e) => {
    const file = e.target.files[0];
    setImage(file); // Set the file object to state
  };

  // Handle text input changes
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // Add product function
  const add_product = async () => {
    try {
      if (!image) {
        alert('Please upload an image.');
        return;
      }

      // Create a FormData object to hold the image
      let formData = new FormData();
      formData.append('product', image);

      // Upload image to the server
      const uploadResponse = await fetch("https://shopper-website.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      console.log('Image upload response:', uploadData);

      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Failed to get image URL');
      }

      // Update productDetails with the image URL
      const updatedProduct = { ...productDetails, image: uploadData.image_url };
      console.log('Updated Product Details:', updatedProduct);

      // Add product to the server
      const addProductResponse = await fetch("https://shopper-website.onrender.com/addproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      const addProductResult = await addProductResponse.json();

      if (addProductResult.success) {
        alert('Product added successfully');
        
        // Clear form fields
        setProductDetails({
          name: "",
          image: "",
          category: "women",
          new_price: "",
          old_price: ""
        });
        setImage(null);
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error occurred while adding product: ' + error.message);
    }
  };

  return (
    <div className='addproduct'>
      <h2>Add Product</h2>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name='name'
          placeholder='Type here'
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name='old_price'
            placeholder='Type here'
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name='new_price'
            placeholder='Type here'
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className='add-product-selector'
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            alt="Upload area"
            className='addproduct-thumnail-img'
          />
        </label>
        <input
          type="file"
          onChange={imageHandler}
          name="image"
          id="file-input"
          hidden
        />
      </div>

      <button
        onClick={add_product}
        type="button" // Changed from "submit" to "button"
        className='addproduct-btn'
      >
        Add Product
      </button>
    </div>
  );
};

export default AddProduct;
