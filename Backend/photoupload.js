





































const port = 4000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid'); // For unique filenames

const app = express();

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./firebase-service-account.json'); // Assuming you have a serviceAccountKey.json file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'shopper-29d9c.appspot.com'
});
const bucket = admin.storage().bucket();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5174', // Allow requests from this origin
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

// Routes
app.get("/", (req, res) => {
    res.send("hiii")
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

        const blob = bucket.file(`${uuidv4()}_${req.file.originalname}`);
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
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            res.status(200).json({
                success: true,
                image_url: publicUrl
            });
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
