let lastCountry = null, lastCapital = null, lastWeatherData = null; // Global variables

const dom = {
    countryInput: document.getElementById('countryInput'),
    searchBtn: document.getElementById('searchBtn'),
    geoBtn: document.getElementById('geoBtn'),
    loading: document.getElementById('loading'),
};

const countryInfoDiv = document.getElementById('countryInfo'),
    weatherInfoDiv = document.getElementById('weatherInfo'),
    resultPanels = document.getElementById('resultPanels');

const getOpenWeatherKey = () => window.__CONFIG__?.OPENWEATHER_API_KEY || null;

function showLoading(show = true, text = 'Loading…') {
    dom.loading.textContent = text;
    dom.loading.classList.toggle('hidden', !show);
}

function clearPanels() {
    countryInfoDiv.innerHTML = '';
    weatherInfoDiv.innerHTML = '';
    resultPanels.classList.add('hidden');
}

async function fetchCountryByName(name) {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`);
    if (!res.ok) throw new Error(`Country not found (status ${res.status})`);
    const data = await res.json();
    return data.find(c => c.name.common.toLowerCase() === name.trim().toLowerCase()) || data[0];
}

async function fetchWeatherForCity(city) {
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

function renderCountryInfo(country) {
    countryInfoDiv.innerHTML = '';
    const capital = country.capital?.[0] || '—',
        population = country.population?.toLocaleString() || '—',
        area = country.area?.toLocaleString() + ' km²' || '—',
        flagUrl = country.flags?.svg || country.flags?.png || '';

    const title = document.createElement('h2');
    title.textContent = country.name.common;
    countryInfoDiv.appendChild(title);

    if (flagUrl) {
        const img = document.createElement('img');
        img.src = flagUrl;
        img.alt = `${country.name.common} flag`;
        img.style.width = '100%';
        img.style.borderRadius = '12px';
        img.style.marginBottom = '1rem';
        countryInfoDiv.appendChild(img);
    }

    const infoItems = [
        ['Official Name', country.name.official],
        ['Capital', capital],
        ['Population', population],
        ['Area', area],
        ['Region', country.region],
        ['Subregion', country.subregion]
    ];

    infoItems.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `<span class="label">${label}:</span><span class="value">${value}</span>`;
        countryInfoDiv.appendChild(div);
    });
}

function renderWeatherItems(weather, w) {
    const tempUnitSymbol = tempUnit === 'metric' ? '°C' : '°F',
        temp = tempUnit === 'metric' ? Math.round(weather.main.temp) : Math.round(weather.main.temp * 9 / 5 + 32),
        feels = tempUnit === 'metric' ? Math.round(weather.main.feels_like) : Math.round(weather.main.feels_like * 9 / 5 + 32);

    const weatherItems = [
        ['Temperature', `${temp}${tempUnitSymbol}`],
        ['Feels Like', `${feels}${tempUnitSymbol}`],
        ['Humidity', `${weather.main.humidity}%`],
        ['Pressure', `${weather.main.pressure} hPa`],
        ['Wind Speed', `${weather.wind.speed} mph`],
        ['Visibility', `${(weather.visibility / 1000).toFixed(1)} km`],
        ['Sunrise', new Date(weather.sys.sunrise * 1000).toLocaleTimeString()],
        ['Sunset', new Date(weather.sys.sunset * 1000).toLocaleTimeString()],
        ['Description', w.description ? w.description.charAt(0).toUpperCase() + w.description.slice(1) : '—']
    ];

    weatherInfoDiv.innerHTML = ''; // clear old info
    const title = document.createElement('h2');
    title.textContent = `Weather in ${weather.name || ''}`;
    weatherInfoDiv.appendChild(title);

    weatherItems.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `<span class="label">${label}:</span><span class="value">${value}</span>`;
        weatherInfoDiv.appendChild(div);
    });

    if (w.icon) {
        const icon = document.createElement('img');
        icon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
        icon.alt = w.description;
        icon.style.width = '80px';
        icon.style.marginTop = '1rem';
        weatherInfoDiv.appendChild(icon);
    }
}

async function renderWeatherInfo(city) {
    weatherInfoDiv.innerHTML = '';
    showLoading(true, 'Fetching weather…');

    try {
        const weather = await fetchWeatherForCity(city);
        lastWeatherData = weather;
        const w = weather.weather?.[0] || {};
        renderWeatherItems(weather, w);
        resultPanels.classList.remove('hidden');
    } catch (err) {
        weatherInfoDiv.textContent = `Weather fetch error: ${err.message}`;
        console.error(err);
    } finally {
        showLoading(false);
    }
}

async function handleSearch(countryName) {
    if (!countryName?.trim()) return alert('Please enter a country name.');
    clearPanels();
    showLoading(true, 'Fetching country info…');

    try {
        const country = await fetchCountryByName(countryName.trim());
        lastCountry = country;
        const capital = country.capital?.[0] || null;
        lastCapital = capital;

        renderCountryInfo(country);
        if (capital) await renderWeatherInfo(capital);
    } catch (err) {
        countryInfoDiv.textContent = `Error: ${err.message}`;
        weatherInfoDiv.textContent = '';
        console.error(err);
    } finally {
        showLoading(false);
    }
}

async function handleGeolocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    clearPanels();
    showLoading(true, 'Getting your location…');

    navigator.geolocation.getCurrentPosition(
        async position => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                if (!res.ok) throw new Error(`Failed to get country info: ${res.status}`);
                const data = await res.json();
                const countryName = data.address?.country;
                if (!countryName) throw new Error('Could not determine country from coordinates.');

                dom.countryInput.value = countryName;
                await handleSearch(countryName);
            } catch (err) {
                countryInfoDiv.textContent = `Geolocation error: ${err.message}`;
                weatherInfoDiv.textContent = '';
                console.error(err);
            } finally { showLoading(false); }
        },
        err => {
            let msg = '';
            switch (err.code) {
                case err.PERMISSION_DENIED: msg = 'Permission denied.'; break;
                case err.POSITION_UNAVAILABLE: msg = 'Position unavailable.'; break;
                case err.TIMEOUT: msg = 'Request timed out.'; break;
                default: msg = 'Unknown error.';
            }
            countryInfoDiv.textContent = `Geolocation error: ${msg}`;
            weatherInfoDiv.textContent = '';
            showLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

const darkModeSwitch = document.getElementById('darkModeSwitch'), sliderIcon = darkModeSwitch.querySelector('.icon');

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
else setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches, false);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('darkMode')) setDarkMode(e.matches, false);
});

darkModeSwitch.addEventListener('click', () => setDarkMode(!document.body.classList.contains('dark')));

let tempUnit = localStorage.getItem('tempUnit') || 'metric';
const tempUnitSwitch = document.getElementById('tempUnitSwitch'),
    tempSliderIcon = tempUnitSwitch.querySelector('.icon');

function setTempUnit(unit, remember = true) {
    tempUnit = unit;
    if (unit === 'metric') {
        tempUnitSwitch.classList.remove('active');
        tempSliderIcon.textContent = '°C';
        tempUnitSwitch.title = 'Switch to Fahrenheit';
    } else {
        tempUnitSwitch.classList.add('active');
        tempSliderIcon.textContent = '°F';
        tempUnitSwitch.title = 'Switch to Celsius';
    }
    if (remember) localStorage.setItem('tempUnit', unit);
    if (lastWeatherData) renderWeatherItems(lastWeatherData, lastWeatherData.weather?.[0] || {});
}

tempUnitSwitch.addEventListener('click', () => {
    const newUnit = tempUnit === 'metric' ? 'imperial' : 'metric';
    setTempUnit(newUnit);
});

function init() { // Initialize search and geolocation
    dom.searchBtn.addEventListener('click', () => handleSearch(dom.countryInput.value));
    dom.countryInput.addEventListener('keyup', e => { if (e.key === 'Enter') handleSearch(dom.countryInput.value); });
    dom.geoBtn.addEventListener('click', handleGeolocation);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    setTempUnit(tempUnit, false); // Apply saved unit
});