const express = require('express');
const router = express.Router();
const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Маршрут для получения данных о ценах акций
router.get('/stock/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query`,
            {
                params: {
                    function: 'TIME_SERIES_DAILY',
                    symbol: ticker,
                    apikey: ALPHA_VANTAGE_API_KEY,
                },
            }
        );

        const rawData = response.data['Time Series (Daily)'];
        if (!rawData) {
            return res.status(404).json({ message: 'No data found for the specified stock.' });
        }

        // Обрабатываем данные для графика
        const stockData = Object.entries(rawData)
            .slice(0, 30) // Последние 30 дней
            .map(([date, values]) => ({
                date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
            }));

        res.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ message: 'Error fetching stock data.' });
    }
});

module.exports = router;
