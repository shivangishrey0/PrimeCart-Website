import React, { useState, useRef, useContext } from "react";
import { ShopContext } from "../../context/ShopContext";
import { Link } from "react-router-dom";
import "./navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import nav_dropdown from "../Assets/nav_dropdown.png";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef(null);

  const dropdown_toggle = (e) => {
    if (!menuRef.current) return;
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <p>Shopper</p>
      </div>

      {/* Dropdown icon for mobile */}
      <img
        className="nav-dropdown"
        onClick={dropdown_toggle}
        src={nav_dropdown}
        alt="dropdown"
      />

      {/* Navigation menu */}
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Shop
          </Link>
          {menu === "shop" && <hr />}
        </li>
        <li onClick={() => setMenu("men")}>
          <Link to="/men" style={{ textDecoration: "none", color: "inherit" }}>
            Men
          </Link>
          {menu === "men" && <hr />}
        </li>
        <li onClick={() => setMenu("women")}>
          <Link to="/women" style={{ textDecoration: "none", color: "inherit" }}>
            Women
          </Link>
          {menu === "women" && <hr />}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link to="/kids" style={{ textDecoration: "none", color: "inherit" }}>
            Kids
          </Link>
          {menu === "kids" && <hr />}
        </li>
      </ul>

      {/* Login & Cart */}
      <div className="nav-login-cart">
        {localStorage.getItem("auth-token")?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Logout</button> 
        :<Link to="/login">
          <button>Login</button>
        </Link>}
        
        <Link to="/cart">
          <img src={cart_icon} alt="cart" />
        </Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
