const express = require('express');
const router = express.Router();
const CarouselText = require('../models/CarouselText'); // Подключение модели
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { sendActionNotification } = require('../controllers/emailController');


// Получить все слайды
router.get('/', async (req, res) => {
    try {
        const slides = await CarouselText.find();
        res.json(slides);
    } catch (err) {
        console.error('Error fetching slides:', err);
        res.status(500).json({ message: 'Error fetching slides' });
    }
});

// Создать текст (для редакторов и админов)
router.post('/create', authenticateToken, async (req, res) => {
    const { slideNumber, title, description } = req.body;
    const { role, username, email } = req.user;

    if (role !== 'admin' && role !== 'editor') {
        return res.status(403).json({ message: 'Access Denied' });
    }

    try {
        const newText = new CarouselText({ slideNumber, title, description });
        await newText.save();

        // Уведомление
        await sendActionNotification(
            email,
            'Item Created',
            `User "${username}" created a new slide:\nSlide Number: ${slideNumber}\nTitle: ${title}`
        );

        res.json({ message: 'Text added successfully' });
    } catch (err) {
        console.error('Error adding text:', err);
        res.status(500).json({ message: 'Error adding text' });
    }
});

// Обновить текст (только для админа)
router.put('/update/:slideNumber', authenticateToken, isAdmin, async (req, res) => {
    const { title, description } = req.body;
    const { slideNumber } = req.params;
    const { username, email } = req.user;

    try {
        const updatedText = await CarouselText.findOneAndUpdate(
            { slideNumber },
            { title, description, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedText) {
            return res.status(404).json({ message: 'Slide not found' });
        }

        // Уведомление
        await sendActionNotification(
            email,
            'Item Updated',
            `User "${username}" updated a slide:\nSlide Number: ${slideNumber}\nNew Title: ${title}\nNew Description: ${description}`
        );

        res.json({ message: 'Text updated successfully', updatedText });
    } catch (err) {
        console.error('Error updating text:', err);
        res.status(500).json({ message: 'Error updating text' });
    }
});

// Удалить текст (только для админа)
router.delete('/delete/:slideNumber', authenticateToken, isAdmin, async (req, res) => {
    const { slideNumber } = req.params;
    const { username, email } = req.user;

    try {
        const deletedText = await CarouselText.findOneAndDelete({ slideNumber });

        if (!deletedText) {
            return res.status(404).json({ message: 'Slide not found' });
        }

        // Уведомление
        await sendActionNotification(
            email,
            'Item Deleted',
            `User "${username}" deleted a slide:\nSlide Number: ${slideNumber}`
        );

        res.json({ message: 'Text deleted successfully' });
    } catch (err) {
        console.error('Error deleting text:', err);
        res.status(500).json({ message: 'Error deleting text' });
    }
});


module.exports = router;
