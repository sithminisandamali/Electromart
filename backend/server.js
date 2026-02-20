require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. USER MODEL ---
const userSchema = new mongoose.Schema({
    fullName: String,
    contactNumber: String,
    address: String,
    gender: String,
    birthday: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// --- 2. REGISTER ROUTE (You already used this) ---
app.post('/api/user/register', async (req, res) => {
    console.log("📝 Registering:", req.body.email);
    try {
        const newUser = new User(req.body);
        await newUser.save();
        console.log("✅ User Saved Successfully!");
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// --- 3. LOGIN ROUTE (THIS IS NEW) ---
app.post('/api/user/login', async (req, res) => {
    console.log("🔑 Logging in:", req.body.email);
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check password (simple check)
        if (user.password !== password) {
             console.log("❌ Wrong password");
            return res.status(401).json({ message: "Invalid password" });
        }
        
        console.log("✅ Login Successful for:", email);
        res.status(200).json({ message: "Login Successful", user: user });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
// මෙතන අර Local link එක අයින් කළා. දැන් .env එක නැතුව වැඩ කරන්නේ නෑ. (ආරක්ෂිතයි)
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Vercel සඳහා විශේෂ සැකසුම
if (require.main === module) {
    // අපි Local run කරනකොට මේක වැඩ කරනවා
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}

// Vercel එකට app එක export කරනවා
module.exports = app;