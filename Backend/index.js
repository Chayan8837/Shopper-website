const port = 4000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid'); // For unique filenames
const path = require('path'); // For handling file path

const app = express();

// Initialize Firebase Admin SDK with service account credentials
// const serviceAccount = require('./firebase-service-account.json'); // Ensure this file path is correct
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: 'shopper-29d9c.appspot.com'
// });
// const bucket = admin.storage().bucket();

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountBase64) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, 'base64').toString('utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'shopper-29d9c.appspot.com'
});

// Create a reference to the storage bucket
const bucket = admin.storage().bucket();










app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5174','http://localhost:5173','https://shopper-website-git-main-chayans-projects-b203bb5d.vercel.app'], // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
}));

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB connection URI
const uri = 'mongodb+srv://daschayan8837:svd74food@shopper.zvng5.mongodb.net/';

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
    });

// Product Schema and Model
const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
});

const Product = mongoose.model("Product", productSchema);

// User Schema and Model
const Users = mongoose.model("Users", {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
});

// Routes
app.get("/", (req, res) => {
    res.send("hiii");
});

app.post("/addproduct", async (req, res) => {
    try {
        const products = await Product.find({});
        
        let id;
        if (products.length > 0) {
            const lastProduct = products[products.length - 1];
            id = lastProduct.id + 1;
        } else {
            id = 1;
        }

        const newProduct = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        console.log(newProduct);

        await newProduct.save();
        console.log("Product saved");
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({
            success: false,
            message: "Error saving product"
        });
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
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ success: false, message: "Error uploading file" });
        });

        blobStream.on('finish', async () => {
            // Generate a signed URL
            const expiration = Date.now() + 15 * 60 * 1000; // 15 minutes
            const [signedUrl] = await blob.getSignedUrl({
                action: 'read',
                expires: expiration,
            });

            res.status(200).json({
                success: true,
                image_url: signedUrl
            });
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
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete the image file from Firebase Storage
        const fileName = path.basename(deletedProduct.image);
        const file = bucket.file(fileName);

        file.delete((err) => {
            if (err) {
                console.error("Error deleting image file:", err);
            } else {
                console.log("Image file deleted:", fileName);
            }
        });

        console.log("Product removed:", deletedProduct);
        res.json({
            success: true,
            name: deletedProduct.name
        });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({
            success: false,
            message: "Error removing product"
        });
    }
});

app.get("/allproducts", async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All products fetched");
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
        console.log("New collection fetched");
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
        console.log("Popular in women collection fetched");
        res.json(popularinwomen);
    } catch (error) {
        console.error("Error fetching popular in women collection:", error);
        res.status(500).json({ success: false, message: "Error fetching popular in women collection" });
    }
});

const fetchuser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Error authentication" });
    }
    try {
        const data = jwt.verify(token, "secret_ecom");
        req.user = data.user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).send({ errors: "Error authentication" });
    }
};

app.post("/addtocart", fetchuser, async (req, res) => {
    try {
        let userdata = await Users.findOne({ _id: req.user.id });
        userdata.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
        res.status(200).json({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ success: false, message: "Failed to add item to cart" });
    }
});

app.post("/removefromcart", fetchuser, async (req, res) => {
    try {
        let userdata = await Users.findOne({ _id: req.user.id });
        if (userdata.cartData[req.body.itemId] > 0) {
            userdata.cartData[req.body.itemId] -= 1;
        }
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userdata.cartData });
        res.status(200).json({ success: true, message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ success: false, message: "Failed to remove item from cart" });
    }
});

app.post("/getcart", fetchuser, async (req, res) => {
    try {
        let userdata = await Users.findOne({ _id: req.user.id });
        res.json(userdata.cartData);
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ success: false, message: "Failed to fetch cart data" });
    }
});

app.listen(port, (error) => {
    if (!error) {
        console.log(`Server is running on port ${port}`);
    } else {
        console.log("Error:", error);
    }
});
