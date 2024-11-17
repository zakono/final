const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { authenticateToken, isAdmin, isEditor } = require('../middlewares/auth');


router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Portfolio.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching portfolio items' });
  }
});


router.post('/create', authenticateToken, isEditor, async (req, res) => {
  const { title, description, images } = req.body;

  if (images.length !== 3) {
    return res.status(400).json({ message: 'Please provide exactly 3 images' });
  }

  try {
    const newItem = new Portfolio({ title, description, images });
    await newItem.save();
    res.status(201).json({ message: 'Item created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating item' });
  }
});


router.put('/update/:id', authenticateToken, isAdmin, async (req, res) => {
  const { title, description, images } = req.body;
  const { id } = req.params;

  try {
    const updatedItem = await Portfolio.findByIdAndUpdate(
      id,
      { title, description, images, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ message: 'Item updated successfully', item: updatedItem });
  } catch (err) {
    res.status(500).json({ message: 'Error updating item' });
  }
});


router.delete('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await Portfolio.findByIdAndDelete(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting item' });
  }
});

module.exports = router;
