const CarouselText = require('../models/CarouselText');


exports.getAllTexts = async (req, res) => {
    try {
        const texts = await CarouselText.find();
        res.status(200).json(texts);
    } catch (error) {
        console.error('Error fetching texts:', error);
        res.status(500).json({ message: 'Error fetching texts' });
    }
};


exports.createText = async (req, res) => {
    const { role } = req.user;
    const { slideNumber, title, description } = req.body;

    
    if (role !== 'admin' && role !== 'editor') {
        return res.status(403).json({ message: 'Access Denied' });
    }

    try {
        
        const existingText = await CarouselText.findOne({ slideNumber });
        if (existingText && role !== 'admin') {
            return res.status(403).json({ message: 'Editors can only create new texts.' });
        }

        const newText = new CarouselText({ slideNumber, title, description });
        await newText.save();

        res.status(201).json({ message: 'Text created', newText });
    } catch (error) {
        console.error('Error creating text:', error);
        res.status(500).json({ message: 'Error creating text' });
    }
};


exports.updateText = async (req, res) => {
    const { role } = req.user;
    if (role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admins Only' });
    }

    const { slideNumber, title, description } = req.body;
    try {
        const updatedText = await CarouselText.findOneAndUpdate(
            { slideNumber },
            { title, description, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedText) {
            return res.status(404).json({ message: 'Text not found' });
        }

        res.status(200).json({ message: 'Text updated', updatedText });
    } catch (error) {
        console.error('Error updating text:', error);
        res.status(500).json({ message: 'Error updating text' });
    }
};


exports.deleteText = async (req, res) => {
    const { role } = req.user;
    if (role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admins Only' });
    }

    const { slideNumber } = req.params;
    try {
        const deletedText = await CarouselText.findOneAndDelete({ slideNumber });
        if (!deletedText) {
            return res.status(404).json({ message: 'Text not found' });
        }

        res.status(200).json({ message: 'Text deleted' });
    } catch (error) {
        console.error('Error deleting text:', error);
        res.status(500).json({ message: 'Error deleting text' });
    }
};

