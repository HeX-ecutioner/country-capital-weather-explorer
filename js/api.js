const getOpenWeatherKey = () => window.__CONFIG__?.OPENWEATHER_API_KEY || null;

export async function fetchCountryByName(name) {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`);
    if (!res.ok) throw new Error(`Country not found (status ${res.status})`);
    const data = await res.json();
    return data.find(c => c.name.common.toLowerCase() === name.trim().toLowerCase()) || data[0];
}

export async function fetchWeatherForCity(city) {
    const key = getOpenWeatherKey();
    if (!key && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'))
        throw new Error('OpenWeather API key not found.');

    const url = key
        ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`
        : `/.netlify/functions/getWeather?city=${encodeURIComponent(city)}&units=metric`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
}

export async function reverseGeocode(lat, lon) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Failed to get country info: ${res.status}`);
    return await res.json();
}