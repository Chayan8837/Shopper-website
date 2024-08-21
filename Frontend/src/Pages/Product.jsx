import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrums from '../Components/Breadcrums/Breadcrums';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DiscriptionBox from '../Components/DiscriptionBox/DiscriptionBox';
import RelatedProduct from '../Components/RelatedProduct/RelatedProduct';

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();

  const product = all_product.find((e) => e.id === Number(productId));

  return (
    <div>
      {product ? (
        <>
        <Breadcrums product={product} />
        <ProductDisplay product={product}/>
        <DiscriptionBox/>
        <RelatedProduct/>
        </>
      ) : (
        <p>Product not found</p>
      )}
    </div>
  );
};

export default Product;
