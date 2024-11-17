const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); 

const F_API_KEY = process.env.F_API_KEY;
const FM_API_URL = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${F_API_KEY}`;

router.get('/currency', async (req, res) => {
    try {
        if (!F_API_KEY) {
            throw new Error('API key is missing. Please check your .env file.');
        }

        const response = await axios.get(FM_API_URL);

        
        if (response.status !== 200) {
            throw new Error(`Failed to fetch data, status code: ${response.status}`);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching currency data:', error.message);
        res.status(500).json({ message: 'Error fetching currency data' });
    }
});

module.exports = router;


