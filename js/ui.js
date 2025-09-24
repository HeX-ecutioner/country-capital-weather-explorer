export const dom = {
    countryInput: document.getElementById('countryInput'),
    searchBtn: document.getElementById('searchBtn'),
    geoBtn: document.getElementById('geoBtn'),
    loading: document.getElementById('loading'),
    countryInfoDiv: document.getElementById('countryInfo'),
    weatherInfoDiv: document.getElementById('weatherInfo'),
    resultPanels: document.getElementById('resultPanels')
};

export function showLoading(show = true, text = 'Loading…') {
    dom.loading.textContent = text;
    dom.loading.classList.toggle('hidden', !show);
}

export function clearPanels() {
    dom.countryInfoDiv.innerHTML = '';
    dom.weatherInfoDiv.innerHTML = '';
    dom.resultPanels.classList.add('hidden');
}

export function renderCountryInfo(country) {
    const container = dom.countryInfoDiv;
    container.innerHTML = '';

    const capital = country.capital?.[0] || '—',
        population = country.population?.toLocaleString() || '—',
        area = country.area?.toLocaleString() + ' km²' || '—',
        flagUrl = country.flags?.svg || country.flags?.png || '';

    const title = document.createElement('h2');
    title.textContent = country.name.common;
    container.appendChild(title);

    if (flagUrl) {
        const img = document.createElement('img');
        img.src = flagUrl;
        img.alt = `${country.name.common} flag`;
        img.style.width = '100%';
        img.style.borderRadius = '12px';
        img.style.marginBottom = '1rem';
        container.appendChild(img);
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
        container.appendChild(div);
    });
}

export function renderWeatherItems(weather, w, tempUnit) {
    const container = dom.weatherInfoDiv;
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

    container.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = `Weather in ${weather.name || ''}`;
    container.appendChild(title);

    weatherItems.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `<span class="label">${label}:</span><span class="value">${value}</span>`;
        container.appendChild(div);
    });

    if (w.icon) {
        const icon = document.createElement('img');
        icon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
        icon.alt = w.description;
        icon.style.width = '80px';
        icon.style.marginTop = '1rem';
        container.appendChild(icon);
    }
}