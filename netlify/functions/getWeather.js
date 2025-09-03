const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { city } = event.queryStringParameters || {};
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
        return { statusCode: 500, body: 'Missing OpenWeather API key on server.' };
    }
    if (!city) {
        return { statusCode: 400, body: 'Missing city query parameter.' };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return {
            statusCode: res.status,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
    }
};