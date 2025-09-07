const restCountriesBase = 'https://restcountries.com/v3.1/name/';
const openWeatherBase = 'https://api.openweathermap.org/data/2.5/weather';

const dom = {
    countryInput: document.getElementById('countryInput'),
    searchBtn: document.getElementById('searchBtn'),
    geoBtn: document.getElementById('geoBtn'),
    cardContainer: document.getElementById('cardContainer'),
    loading: document.getElementById('loading'),
    darkToggle: document.getElementById('darkToggle'),
    result: document.getElementById('result'),
};

const getOpenWeatherKey = () => {
    // Two ways to provide key:
    // 1) Local: create config.js that sets window.__CONFIG__.OPENWEATHER_API_KEY
    // 2) Deployed: use a serverless function / proxy (see README)
    if (window.__CONFIG__ && window.__CONFIG__.OPENWEATHER_API_KEY) {
        return window.__CONFIG__.OPENWEATHER_API_KEY;
    }
    return null; // If you used Netlify function approach, set USE_PROXY = true and PROXY_URL below
};

async function fetchCountryByName(name) {
    const url = `${restCountriesBase}${encodeURIComponent(name)}?fullText=false`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Country not found (status ${res.status})`);
    }
    const data = await res.json();
    return data[0]; // REST Countries returns array; take first plausible match
}

async function fetchWeatherForCity(cityName) { // If Netlify functions are available, use them
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const key = getOpenWeatherKey(); // Local dev: use config.js
        if (!key) throw new Error('OpenWeather API key not found. Add config.js in local dev.');
        const url = `${openWeatherBase}?q=${encodeURIComponent(cityName)}&units=metric&appid=${key}`;
        const res = await fetch(url);
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Weather fetch failed: ${res.status} ${res.statusText} ${txt}`);
        }
        return await res.json();
    } else {
        // Production (Netlify): use serverless function
        const url = `/.netlify/functions/getWeather?city=${encodeURIComponent(cityName)}`;
        const res = await fetch(url);
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Weather fetch failed: ${res.status} ${res.statusText} ${txt}`);
        }
        return await res.json();
    }
}

function showLoading(show = true, text = 'Loading…') {
    dom.loading.textContent = text;
    dom.loading.classList.toggle('hidden', !show);
}

function clearCard() {
    dom.cardContainer.innerHTML = '';
}

function renderCard(country, weather) {
    clearCard();

    const capital = country.capital && country.capital.length ? country.capital[0] : '—';
    const population = country.population ? country.population.toLocaleString() : '—';
    const flagUrl = country.flags && country.flags.svg ? country.flags.svg : (country.flags && country.flags.png ? country.flags.png : '');

    const card = document.createElement('div');
    card.className = 'result-card';

    const flagWrap = document.createElement('div');
    flagWrap.className = 'flag';
    if (flagUrl) {
        const img = document.createElement('img');
        img.src = flagUrl;
        img.alt = `${country.name.common} flag`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        flagWrap.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'info';
    const nameH = document.createElement('h2');
    nameH.textContent = country.name.common;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<strong>Capital:</strong> ${capital} · <strong>Population:</strong> ${population}`;

    info.appendChild(nameH);
    info.appendChild(meta);

    const weatherDiv = document.createElement('div'); // Weather block
    weatherDiv.className = 'weather';

    if (weather) {
        const iconCode = weather.weather && weather.weather[0] && weather.weather[0].icon;
        const desc = weather.weather && weather.weather[0] && weather.weather[0].main ? weather.weather[0].main : (weather.weather && weather.weather[0] && weather.weather[0].description ? weather.weather[0].description : '');
        const temp = (typeof weather.main?.temp === 'number') ? Math.round(weather.main.temp) : '—';

        const icon = document.createElement('div');
        icon.className = 'icon';
        const img = document.createElement('img');
        if (iconCode) {
            img.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // OpenWeatherMap icon endpoint
            img.alt = desc;
            img.width = 56;
            img.height = 56;
        } else img.alt = 'weather icon';

        icon.appendChild(img);

        const txt = document.createElement('div');
        txt.innerHTML = `<div class="temp">${temp}°C</div><div class="weather-desc">${desc}</div>`;

        weatherDiv.appendChild(icon);
        weatherDiv.appendChild(txt);
    } else weatherDiv.textContent = 'Weather not available';

    info.appendChild(weatherDiv);

    card.appendChild(flagWrap);
    card.appendChild(info);

    dom.cardContainer.appendChild(card);
}

async function handleSearch(countryName) {
    if (!countryName || !countryName.trim()) {
        alert('Please enter a country name.');
        return;
    }
    clearCard();
    showLoading(true, 'Fetching country info…');

    try {
        const country = await fetchCountryByName(countryName.trim());
        showLoading(true, 'Fetching weather for capital…');
        const capital = country.capital && country.capital.length ? country.capital[0] : null;

        if (!capital) {
            renderCard(country, null);
            showLoading(false);
            return;
        }

        const weather = await fetchWeatherForCity(capital); // This is sequential; only fetches weather after country resolves
        renderCard(country, weather);
    } catch (err) {
        clearCard();
        const errBox = document.createElement('div');
        errBox.style.color = 'var(--muted)';
        errBox.textContent = `Error: ${err.message}`;
        dom.cardContainer.appendChild(errBox);
        console.error(err);
    } finally {
        showLoading(false);
    }
}

async function handleGeolocation() { // Geolocation => reverse lookup to get country name
    if (!navigator.geolocation) {
        alert('Geolocation not supported in this browser.');
        return;
    }
    clearCard();
    showLoading(true, 'Getting your location…');

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            // Use a free reverse-geocode service: OpenStreetMap Nominatim
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
            const res = await fetch(url);
            const data = await res.json();
            const countryName = data.address && (data.address.country || data.address.country_code) ? data.address.country : null;
            if (!countryName) {
                throw new Error('Could not determine country from coordinates.');
            }
            dom.countryInput.value = countryName;
            await handleSearch(countryName);
        } catch (err) {
            clearCard();
            dom.cardContainer.textContent = `Geolocation error: ${err.message}`;
        } finally {
            showLoading(false);
        }
    }, (err) => {
        clearCard();
        showLoading(false);
        dom.cardContainer.textContent = `Geolocation permission denied or unavailable: ${err.message}`;
    }, { timeout: 10000 });
}

function applyDarkFromPref() { // To toggle Dark mode 
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        dom.darkToggle.checked = true;
    } else if (saved === 'light') {
        document.body.classList.remove('dark');
        dom.darkToggle.checked = false;
    } else {
        // fallback to system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark');
            dom.darkToggle.checked = true;
        }
    }
}

function init() {
    applyDarkFromPref();

    dom.searchBtn.addEventListener('click', () => {
        handleSearch(dom.countryInput.value);
    });

    dom.countryInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch(dom.countryInput.value);
    });

    dom.geoBtn.addEventListener('click', handleGeolocation);

    dom.darkToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);