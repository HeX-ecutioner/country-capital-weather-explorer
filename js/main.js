import { fetchCountryByName, fetchWeatherForCity, reverseGeocode } from './api.js';
import { dom, showLoading, clearPanels, renderCountryInfo, renderWeatherItems } from './ui.js';
import { tempUnit, setLastWeatherData } from './settings.js';

let lastCountry = null, lastCapital = null;

async function renderWeatherInfo(city) {
    dom.weatherInfoDiv.innerHTML = '';
    showLoading(true, 'Fetching weather…');

    try {
        const weather = await fetchWeatherForCity(city);
        setLastWeatherData(weather);
        const w = weather.weather?.[0] || {};
        renderWeatherItems(weather, w, tempUnit);
        dom.resultPanels.classList.remove('hidden');
    } catch (err) {
        dom.weatherInfoDiv.textContent = `Weather fetch error: ${err.message}`;
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
        lastCapital = country.capital?.[0] || null;

        renderCountryInfo(country);
        if (lastCapital) await renderWeatherInfo(lastCapital);
    } catch (err) {
        dom.countryInfoDiv.textContent = `Error: ${err.message}`;
        dom.weatherInfoDiv.textContent = '';
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
                const data = await reverseGeocode(latitude, longitude);
                const countryName = data.address?.country;
                if (!countryName) throw new Error('Could not determine country from coordinates.');

                dom.countryInput.value = countryName;
                await handleSearch(countryName);
            } catch (err) {
                dom.countryInfoDiv.textContent = `Geolocation error: ${err.message}`;
                dom.weatherInfoDiv.textContent = '';
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
            dom.countryInfoDiv.textContent = `Geolocation error: ${msg}`;
            dom.weatherInfoDiv.textContent = '';
            showLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function init() {
    dom.searchBtn.addEventListener('click', () => handleSearch(dom.countryInput.value));
    dom.countryInput.addEventListener('keyup', e => { if (e.key === 'Enter') handleSearch(dom.countryInput.value); });
    dom.geoBtn.addEventListener('click', handleGeolocation);
}

document.addEventListener('DOMContentLoaded', init);