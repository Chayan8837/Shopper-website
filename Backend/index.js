const port = 4000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Firebase Setup
const serviceAccount = JSON.parse(
    Buffer.from('serviceAccountBase64', 'base64').toString('utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'shopper-29d9c.appspot.com'
});

const bucket = admin.storage().bucket();

const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://shopper-website-git-main-chayans-projects-b203bb5d.vercel.app',
        'https://shopper-orcin.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB Connection
const uri = 'mongodb+srv://daschayan8837:svd74food@shopper.zvng5.mongodb.net/';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process on MongoDB connection error
    });

// Mongoose Models
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
});

const Product = mongoose.model("Product", productSchema);

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    cartData: { type: Map, of: Number },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['auth-token'];
    if (!authHeader) return res.sendStatus(401);

    jwt.verify(authHeader, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoints

app.get("/", (req, res) => {
    res.send("Hello World");
});

// User Registration
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ success: false, message: "Error registering user" });
    }
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ success: false, message: "Error logging in user" });
    }
});

// Add Product
app.post("/addproduct", async (req, res) => {
    try {
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const id = lastProduct ? lastProduct.id + 1 : 1;

        const newProduct = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await newProduct.save();
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ success: false, message: "Error saving product" });
    }
});

// Upload Image
app.post("/upload", upload.single('product'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const fileName = `${uuidv4()}_${req.file.originalname}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            metadata: { contentType: req.file.mimetype }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ success: false, message: "Error uploading file" });
        });

        blobStream.on('finish', async () => {
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            res.status(200).json({ success: true, image_url: publicUrl });
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Remove Product
app.post("/removeproduct", async (req, res) => {
    try {
        const productId = req.body.id;
        const deletedProduct = await Product.findOneAndDelete({ id: productId });

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const fileName = path.basename(deletedProduct.image);
        const file = bucket.file(fileName);

        file.delete()
            .then(() => {
                console.log("Image file deleted:", fileName);
            })
            .catch((err) => {
                console.error("Error deleting image file:", err);
            });

        res.json({ success: true, name: deletedProduct.name });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, message: "Error removing product" });
    }
});

// Fetch All Products
app.get("/allproducts", async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

// Fetch New Collection
app.get("/newcollection", async (req, res) => {
    try {
        let product = await Product.find({});
        let newcollection = product.slice(1).slice(-8);
        res.json(newcollection);
    } catch (error) {
        console.error("Error fetching new collection:", error);
        res.status(500).json({ success: false, message: "Error fetching new collection" });
    }
});

// Fetch Popular in Women
app.get("/popularinwomen", async (req, res) => {
    try {
        let product = await Product.find({ category: "women" });
        let popularinwomen = product.slice(0, 4);
        res.json(popularinwomen);
    } catch (error) {
        console.error("Error fetching popular in women collection:", error);
        res.status(500).json({ success: false, message: "Error fetching popular in women collection" });
    }
});

// Add to Cart
app.post("/addtocart", authenticateToken, async (req, res) => {
    try {
        let user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.cartData.set(req.body.itemId, (user.cartData.get(req.body.itemId) || 0) + 1);
        await user.save();
        res.status(200).json({ success: true, message: "Product added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Error adding to cart" });
    }
});

// View Cart
app.get("/viewcart", authenticateToken, async (req, res) => {
    try {
        let user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartItems = Array.from(user.cartData.entries());
        res.json(cartItems);
    } catch (error) {
        console.error("Error viewing cart:", error);
        res.status(500).json({ success: false, message: "Error viewing cart" });
    }
});

// Checkout
app.post("/checkout", authenticateToken, async (req, res) => {
    try {
        let user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Here you would implement checkout logic (e.g., process payment, clear cart)
        user.cartData.clear();
        await user.save();

        res.json({ success: true, message: "Checkout successful" });
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ success: false, message: "Error during checkout" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
