const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

app.use(express.json());
app.use(cors());

//  MongoDB Connection
mongoose.connect("mongodb+srv://shival:shivangi20@cluster20.tkkat9n.mongodb.net/e-commerce")
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(" MongoDB Connection Error:", err));

// Test API
app.get("/", (req, res) => {
  res.send("Express App is running successfully!");
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Serve uploaded images statically
app.use("/images", express.static(path.join(__dirname, "upload", "images")));

// Image Upload Endpoint
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: 0,
      message: "No file uploaded. Make sure the form field name is 'product'."
    });
  }

  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Product Schema
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  sizes: { type: [String], default: ["S", "M", "L", "XL"] },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});


// Add Product Endpoint
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

  try {
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price
    });

    await product.save();
    console.log("Product saved:", product.name);
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error(" Error saving product:", error);
    res.status(500).json({ success: false, message: "Error saving product" });
  }
});

// Delete Product Endpoint
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed product:", req.body.name);
  res.json({ success: true, name: req.body.name });
});

// Get All Products
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log("All products fetched");
  res.send(products);
});

//User Schema
const Users = mongoose.model('Users', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// User Signup
app.post('/signup', async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "User already exists" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token });
});

// User Login
app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (!user) return res.json({ success: false, errors: "Wrong Email Id" });

  const passCompare = req.body.password === user.password;
  if (!passCompare) return res.json({ success: false, errors: "Wrong Password" });

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token });
});

// New Collection
app.get('/newcollection', async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(-8);
  console.log('New Collection fetched');
  res.send(newcollection);
});

// Popular in Women
app.get('/popularinwomen', async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
});

//Middleware to fetch user data
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Invalid token" });
  }
};

// Add to Cart
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;
    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Remove from Cart
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findById(req.user.id);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    userData.cartData[req.body.itemId] = Math.max(0, (userData.cartData[req.body.itemId] || 0) - 1);
    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// creating endpoint to get cartData
app.post('/getcart',fetchUser,async(req,res)=>{
  console.log("GetCart");
  let userData = await Users.findOne({_id:req.user.id});
  res.json(userData.cartData);
  
})

// Start Server
app.listen(port, (error) => {
  if (!error) {
    console.log(`Server running on http://localhost:${port}`);
  } else {
    console.log("Error starting server:", error);
  }
});