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
      'https://shopper-website-git-main-chayans-projects-b203bb5d.vercel.app',
      'https://shopper-orcin.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uri = process.env.MONGODB_URI || 'your-default-mongodb-uri-here';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
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

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    cartData: { type: Map, of: Number }, // Use a Map to store cart items
    date: { type: Date, default: Date.now }
});

const Users = mongoose.model("Users", userSchema);

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

const fetchuser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Error authentication" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || "secret_ecom");
        req.user = data.user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).send({ errors: "Error authentication" });
    }
};

app.post("/addtocart", fetchuser, async (req, res) => {
    try {
        let userdata = await Users.findById(req.user.id);
        userdata.cartData.set(req.body.itemId, (userdata.cartData.get(req.body.itemId) || 0) + 1);
        await userdata.save();
        res.status(200).json({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ success: false, message: "Error adding item to cart" });
    }
});

app.post("/removefromcart", fetchuser, async (req, res) => {
    try {
        let userdata = await Users.findById(req.user.id);
        if (userdata.cartData.has(req.body.itemId)) {
            let newCount = userdata.cartData.get(req.body.itemId) - 1;
            if (newCount <= 0) {
                userdata.cartData.delete(req.body.itemId);
            } else {
                userdata.cartData.set(req.body.itemId, newCount);
            }
            await userdata.save();
            res.status(200).json({ success: true, message: "Item removed from cart successfully" });
        } else {
            res.status(400).json({ success: false, message: "Item not in cart" });
        }
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ success: false, message: "Error removing item from cart" });
    }
});

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new Users({ name, email, password: hashedPassword });
        await user.save();

        const data = { user: { id: user.id } };
        const authToken = jwt.sign(data, process.env.JWT_SECRET || "secret_ecom", { expiresIn: '1h' });

        res.status(200).json({ success: true, message: "User created successfully", authToken });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ success: false, message: "Error creating user" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const data = { user: { id: user.id } };
        const authToken = jwt.sign(data, process.env.JWT_SECRET || "secret_ecom", { expiresIn: '1h' });

        res.status(200).json({ success: true, message: "Logged in successfully", authToken });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ success: false, message: "Error logging in" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
