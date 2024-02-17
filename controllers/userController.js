const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const dotenv = require('dotenv').config();

exports.getSignup = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
}

exports.postSignup = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error hashing password' });
            }

            const userData = await User.create({ name, email, phone, password: hash });
            res.status(201).json({ newUserDetails: userData, message: 'User signup successful' });
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getLogin = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
}

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        bcrypt.compare(password, existingUser.password, (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Something went wrong' });
            }
            if (result === true) {
                res.status(200).json({ success: true, message: 'User logged in successfully', username: existingUser.name, token: generateAccessToken(existingUser.id, existingUser.name) });
            } else {
                res.status(401).json({ success: false, message: 'User not authorized' });
            }
        });
    } catch (err) {
        console.error('Error during user login:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

function generateAccessToken(id, name) {

    return jwt.sign({ userId: id, username: name }, secretKey);
}