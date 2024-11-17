const express = require('express');
const axios = require('axios');
const router = express.Router();

const F_API_KEY = process.env.F_API_KEY; // Добавьте ключ API в .env файл

// Маршрут для получения данных о конкретной акции
router.get('/api/stock/:symbol', async (req, res) => {
    const symbol = req.params.symbol;

    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
            params: {
                symbol: symbol,
                token: F_API_KEY,
            },
        });

        res.json(response.data); // Возвращаем данные
    } catch (error) {
        console.error('Error fetching stock data from Finnhub:', error.message);
        res.status(500).json({ message: 'Error fetching stock data' });
    }
});

module.exports = router;

