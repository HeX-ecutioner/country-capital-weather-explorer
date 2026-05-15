const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('.')); // Serve static files from the root directory

app.get('/api/weather', async (req, res) => {
    const { city, units } = req.query;
    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
        return res.status(500).json({ message: 'Missing OpenWeather API key on server.' });
    }
    if (!city) {
        return res.status(400).json({ message: 'Missing city query parameter.' });
    }

    const chosenUnits = units === 'imperial' ? 'imperial' : 'metric';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${chosenUnits}&appid=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/forecast', async (req, res) => {
    const { city, units } = req.query;
    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
        return res.status(500).json({ message: 'Missing OpenWeather API key on server.' });
    }
    if (!city) {
        return res.status(400).json({ message: 'Missing city query parameter.' });
    }

    const chosenUnits = units === 'imperial' ? 'imperial' : 'metric';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${chosenUnits}&appid=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/air_pollution', async (req, res) => {
    const { lat, lon } = req.query;
    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
        return res.status(500).json({ message: 'Missing OpenWeather API key on server.' });
    }
    if (!lat || !lon) {
        return res.status(400).json({ message: 'Missing lat or lon query parameters.' });
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/uvi', async (req, res) => {
    const { lat, lon } = req.query;
    const key = process.env.OPENWEATHER_API_KEY;

    if (!key) {
        return res.status(500).json({ message: 'Missing OpenWeather API key on server.' });
    }
    if (!lat || !lon) {
        return res.status(400).json({ message: 'Missing lat or lon query parameters.' });
    }

    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
});
