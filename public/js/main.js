import { fetchCountryByName, fetchWeatherForCity, reverseGeocode, fetchForecastForCity, fetchAirPollution, fetchUvi, fetchExchangeRates, fetchWikipediaSummary, fetchAllCountries } from './api.js';
import { dom, showLoading, clearPanels, renderCountryInfo, renderWeatherItems, renderExtendedForecast, renderTime, renderCurrency, renderWiki, renderTravelFacts, renderAutocomplete, updateWeatherBackground, renderDisasterInfo } from './ui.js';
import { tempUnit, setAllWeatherData } from './settings.js';

let lastCountry = null, lastCapital = null;
let countryNames = [];

async function loadCountryNames() {
    try {
        const countries = await fetchAllCountries();
        countryNames = countries.map(c => c.name.common).sort();
    } catch (e) {
        console.error("Failed to load country names", e);
    }
}

function handleInput(e) {
    const val = e.target.value.trim();
    if (val.length < 2) {
        dom.autocompleteList.classList.add('hidden');
        return;
    }
    const matches = countryNames.filter(name => name.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
    renderAutocomplete(matches, (name) => {
        dom.countryInput.value = name;
        dom.autocompleteList.classList.add('hidden');
        handleSearch(name);
    });
}

async function handleRandom() {
    if (!countryNames.length) await loadCountryNames();
    if (!countryNames.length) return;

    // Shuffle animation
    let count = 0;
    dom.randomBtn.disabled = true;
    const interval = setInterval(() => {
        const randomName = countryNames[Math.floor(Math.random() * countryNames.length)];
        dom.countryInput.value = randomName;
        count++;
        if (count > 12) {
            clearInterval(interval);
            dom.randomBtn.disabled = false;
            handleSearch(dom.countryInput.value);
        }
    }, 80);
}


async function renderWeatherInfo(city) {
    dom.weatherInfoDiv.innerHTML = '';
    showLoading(true, 'Fetching weather…');

    try {
        const weather = await fetchWeatherForCity(city);
        
        let aqiData = null;
        let uviData = null;
        let forecastData = null;

        const lat = weather.coord?.lat;
        const lon = weather.coord?.lon;

        try {
            const extraData = await Promise.allSettled([
                fetchForecastForCity(city),
                (lat && lon) ? fetchAirPollution(lat, lon) : Promise.resolve(null),
                (lat && lon) ? fetchUvi(lat, lon) : Promise.resolve(null)
            ]);
            
            if (extraData[0].status === 'fulfilled') forecastData = extraData[0].value;
            if (extraData[1].status === 'fulfilled') aqiData = extraData[1].value;
            if (extraData[2].status === 'fulfilled') uviData = extraData[2].value;
        } catch (e) {
            console.warn("Failed to fetch extended metrics", e);
        }

        setAllWeatherData(weather, forecastData, aqiData, uviData);
        
        const w = weather.weather?.[0] || {};
        renderWeatherItems(weather, w, tempUnit, aqiData, uviData);
        renderDisasterInfo(weather, uviData);
        updateWeatherBackground(w.main || '');
        if (weather.timezone !== undefined) {
            renderTime(weather.timezone);
        }
        if (forecastData) {
            renderExtendedForecast(forecastData, tempUnit);
        }
        dom.resultPanels.classList.remove('hidden');
        dom.centralCard.classList.add('expanded');
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
        renderTravelFacts(country);
        dom.centralCard.classList.add('expanded');
        
        let ratesData = null;
        let wikiData = null;
        
        try {
            const currencyCode = Object.keys(country.currencies || {})[0];
            const extraCountryData = await Promise.allSettled([
                currencyCode ? fetchExchangeRates('USD') : Promise.resolve(null),
                fetchWikipediaSummary(country.name.common)
            ]);
            if (extraCountryData[0].status === 'fulfilled') ratesData = extraCountryData[0].value;
            if (extraCountryData[1].status === 'fulfilled') wikiData = extraCountryData[1].value;
        } catch(e) {
            console.warn("Failed to fetch extra country data", e);
        }
        
        renderCurrency(country, ratesData);
        renderWiki(wikiData);

        if (lastCapital) {
            await renderWeatherInfo(lastCapital);
        }
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
    loadCountryNames();
    dom.searchBtn.addEventListener('click', () => {
        dom.autocompleteList.classList.add('hidden');
        handleSearch(dom.countryInput.value);
    });
    dom.countryInput.addEventListener('keyup', e => { 
        if (e.key === 'Enter') {
            dom.autocompleteList.classList.add('hidden');
            handleSearch(dom.countryInput.value);
        }
    });
    dom.countryInput.addEventListener('input', handleInput);
    dom.geoBtn.addEventListener('click', handleGeolocation);
    dom.randomBtn.addEventListener('click', handleRandom);

    document.addEventListener('click', (e) => {
        if (dom.inputWrapper && !dom.inputWrapper.contains(e.target)) {
            dom.autocompleteList.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);