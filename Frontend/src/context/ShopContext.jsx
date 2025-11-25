import React, { createContext, useState } from "react";
import all_product from "../components/Assets/all_product";

export const ShopContext = createContext(null);

// Default cart: nested structure with sizes
const getDefaultCart = () => {
  let cart = {};
  for (let product of all_product) {
    cart[product.id] = {
      S: 0,
      M: 0,
      L: 0,
      XL: 0
    };
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());

  // Add to cart with size
  const addToCart = (itemId, size) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [size]: prev[itemId][size] + 1
      }
    }));
    console.log(`Added item ${itemId} (size: ${size})`);
  };

  //  Remove from cart
  const removeFromCart = (itemId, size) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [size]: Math.max(prev[itemId][size] - 1, 0)
      }
    }));
  };

  // Calculate total amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = all_product.find(
        (product) => product.id === Number(itemId)
      );
      if (itemInfo) {
        for (const size in cartItems[itemId]) {
          totalAmount += itemInfo.new_price * cartItems[itemId][size];
        }
      }
    }
    return totalAmount;
  };

  // Total item count (all sizes)
  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        totalItem += cartItems[itemId][size];
      }
    }
    return totalItem;
  };


  // Clear the cart (all items, all sizes)
  const clearCart = () => {
    setCartItems(getDefaultCart());
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    clearCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
