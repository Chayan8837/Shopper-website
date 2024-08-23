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

const app = express();

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountBase64) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, 'base64').toString('utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'shopper-29d9c.appspot.com'
});

const bucket = admin.storage().bucket();

app.use(express.json());
app.use(cors({
    origin: [
      'http://localhost:5174',
      'http://localhost:5173',
      'https://shopperweb.vercel.app',
      'https://shopperadmin.vercel.app'
      
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uri = 'mongodb+srv://daschayan8837:svd74food@shopper.zvng5.mongodb.net/';

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
        process.exit(1); // Exit the process on MongoDB connection error
    });

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

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    cartData: { type: [Number], default: Array(300).fill(0) }, // Initialize cart array with 300 elements
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
    res.send("hiii");
});

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

app.get("/allproducts", async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

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

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Authentication token is missing" });
    }
    try {
        const data = jwt.verify(token,"secret_ecom");
        req.user = data.user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).send({ errors: "Invalid authentication token" });
    }
};







app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        const token = jwt.sign({ user: { id: savedUser._id } }, 'secret_ecom');

        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ success: false, errors: 'Error during signup' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, errors: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, errors: 'Invalid credentials' });
        }

        const token = jwt.sign({ user: { id: user._id } }, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, errors: 'Error during login' });
    }
});















// Endpoint to fetch cart data
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json(user.cartData);
    } catch (error) {
        console.error('Error fetching cart data:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart data' });
    }
});

// Endpoint to add item to cart
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (itemId >= 0 && itemId < 300) {
            user.cartData[itemId] = (user.cartData[itemId] || 0) + quantity;
            await user.save();
            res.status(200).json({ success: true, message: 'Item added to cart successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid item ID' });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ success: false, message: 'Error adding item to cart' });
    }
});

// Endpoint to remove item from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (itemId >= 0 && itemId < 300) {
            if (user.cartData[itemId] > 0) {
                user.cartData[itemId] = Math.max(user.cartData[itemId] - quantity, 0);
                await user.save();
                res.status(200).json({ success: true, message: 'Item removed from cart successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Item not found in cart' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Invalid item ID' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ success: false, message: 'Error removing item from cart' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
