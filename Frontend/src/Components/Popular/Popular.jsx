import React, { useEffect, useState } from 'react'
import "./Popular.css"
import Item from '../Item/Item'


const Popular = () => {
  const [data_product, setData_product] = useState([])

  useEffect(() => {
    const fetchNewCollections = async () => {
      try {
        const response = await fetch("https://shopper-website.onrender.com/popularinwomen"); 
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setData_product(data);
      } catch (error) {
        console.error('Error fetching new collections:', error);
      }
    };

    fetchNewCollections(); 
  }, []); 
  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        <div className="popular-item">
            {data_product.map((item,i)=>{
                return<Item key={i} 
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
                />


            })}

        </div>



    </div>
  )
}

export default Popular