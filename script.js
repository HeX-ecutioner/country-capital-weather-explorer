const restCountriesBase = 'https://restcountries.com/v3.1/name/';
const openWeatherBase = 'https://api.openweathermap.org/data/2.5/weather';

const dom = {
    countryInput: document.getElementById('countryInput'),
    searchBtn: document.getElementById('searchBtn'),
    geoBtn: document.getElementById('geoBtn'),
    cardContainer: document.getElementById('cardContainer'),
    loading: document.getElementById('loading'),
    darkToggle: document.getElementById('darkToggle'),
};

const getOpenWeatherKey = () => window.__CONFIG__?.OPENWEATHER_API_KEY || null;

async function fetchCountryByName(name) {
    const res = await fetch(`${restCountriesBase}${encodeURIComponent(name)}?fullText=false`);
    if (!res.ok) throw new Error(`Country not found (status ${res.status})`);
    return (await res.json())[0];
}

async function fetchWeatherForCity(city) {
    const key = getOpenWeatherKey();
    if (!key && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        throw new Error('OpenWeather API key not found.');
    }

    const url = key
        ? `${openWeatherBase}?q=${encodeURIComponent(city)}&units=metric&appid=${key}`
        : `/.netlify/functions/getWeather?city=${encodeURIComponent(city)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
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

    const capital = country.capital?.[0] || '—';
    const population = country.population?.toLocaleString() || '—';
    const flagUrl = country.flags?.svg || country.flags?.png || '';

    const card = document.createElement('div');
    card.className = 'result-card';

    /* LEFT HALF */
    const left = document.createElement('div');
    left.className = 'left-half';

    const flagWrap = document.createElement('div');
    flagWrap.className = 'flag';
    if (flagUrl) {
        const img = document.createElement('img');
        img.src = flagUrl;
        img.alt = `${country.name.common} flag`;
        flagWrap.appendChild(img);
    }
    left.appendChild(flagWrap);

    const weatherDiv = document.createElement('div');
    weatherDiv.className = 'weather';

    if (weather) {
        const w = weather.weather?.[0] || {};
        const temp = weather.main?.temp ? Math.round(weather.main.temp) : '—';
        const iconCode = w.icon;
        const desc = w.main || w.description || '';

        const icon = document.createElement('div');
        icon.className = 'icon';
        if (iconCode) {
            const img = document.createElement('img');
            img.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            img.alt = desc;
            icon.appendChild(img);
        }

        const descDiv = document.createElement('div');
        descDiv.className = 'weather-desc';
        descDiv.textContent = desc;

        const tempDiv = document.createElement('div');
        tempDiv.className = 'temp';
        tempDiv.textContent = `🌡️ ${temp}°C`;

        weatherDiv.append(icon, descDiv, tempDiv);
    } else {
        weatherDiv.textContent = 'Weather not available';
    }

    left.appendChild(weatherDiv);

    /* RIGHT HALF */
    const right = document.createElement('div');
    right.className = 'right-half';

    const nameH = document.createElement('h2');
    nameH.textContent = country.name.common;
    right.appendChild(nameH);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'meta';

    const capitalDiv = document.createElement('div');
    capitalDiv.innerHTML = `<span class="label">Capital:</span><span class="value">${capital}</span>`;

    const popDiv = document.createElement('div');
    popDiv.innerHTML = `<span class="label">Population:</span><span class="value">${population}</span>`;

    metaDiv.append(capitalDiv, popDiv);
    right.appendChild(metaDiv);

    card.append(left, right);
    dom.cardContainer.appendChild(card);
}

async function handleSearch(countryName) {
    if (!countryName?.trim()) return alert('Please enter a country name.');
    clearCard();
    showLoading(true, 'Fetching country info…');

    try {
        const country = await fetchCountryByName(countryName.trim());
        const capital = country.capital?.[0] || null;
        const weather = capital ? await fetchWeatherForCity(capital) : null;
        renderCard(country, weather);
    } catch (err) {
        clearCard();
        dom.cardContainer.textContent = `Error: ${err.message}`;
        console.error(err);
    } finally {
        showLoading(false);
    }
}

async function handleGeolocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    clearCard();
    showLoading(true, 'Getting your location…');

    navigator.geolocation.getCurrentPosition(
        async pos => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                );
                const data = await res.json();
                const countryName = data.address?.country;
                if (!countryName) throw new Error('Could not determine country from coordinates.');
                dom.countryInput.value = countryName;
                await handleSearch(countryName);
            } catch (err) {
                dom.cardContainer.textContent = `Geolocation error: ${err.message}`;
            } finally {
                showLoading(false);
            }
        },
        err => {
            dom.cardContainer.textContent = `Geolocation permission denied or unavailable: ${err.message}`;
            showLoading(false);
        },
        { timeout: 10000 }
    );
}

const darkModeSwitch = document.getElementById('darkModeSwitch'),
    sliderIcon = darkModeSwitch.querySelector('.icon');

function setDarkMode(enabled, remember = true) {
    if (enabled) {
        document.body.classList.add('dark');
        sliderIcon.textContent = "☀️";
        darkModeSwitch.title = "Switch to Light Mode";
        if (remember) localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark');
        sliderIcon.textContent = "🌙";
        darkModeSwitch.title = "Switch to Dark Mode";
        if (remember) localStorage.setItem('darkMode', 'disabled');
    }
}

const savedPreference = localStorage.getItem('darkMode');
if (savedPreference) setDarkMode(savedPreference === 'enabled', false);
else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark, false);
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('darkMode')) setDarkMode(e.matches, false);
});
darkModeSwitch.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    setDarkMode(isDark);
});


function init() {
    dom.searchBtn.addEventListener('click', () => handleSearch(dom.countryInput.value));
    dom.countryInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') handleSearch(dom.countryInput.value);
    });
    dom.geoBtn.addEventListener('click', handleGeolocation);
}

document.addEventListener('DOMContentLoaded', init);