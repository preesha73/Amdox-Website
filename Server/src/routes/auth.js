const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role });

    // Issue token on registration
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update current user's profile
router.put('/api/me', authMiddleware, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.profileDetails) updates.profileDetails = req.body.profileDetails;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;