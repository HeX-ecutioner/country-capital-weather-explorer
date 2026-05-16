export const dom = {
    countryInput: document.getElementById('countryInput'),
    searchBtn: document.getElementById('searchBtn'),
    geoBtn: document.getElementById('geoBtn'),
    loading: document.getElementById('loading'),
    countryInfoDiv: document.getElementById('countryInfo'),
    weatherInfoDiv: document.getElementById('weatherInfo'),
    resultPanels: document.getElementById('resultPanels'),
    hourlyPanel: document.getElementById('hourlyPanel'),
    chartPanel: document.getElementById('chartPanel'),
    hourlyCarousel: document.getElementById('hourlyCarousel'),
    forecastChart: document.getElementById('forecastChart'),
    timePanel: document.getElementById('timePanel'),
    currencyPanel: document.getElementById('currencyPanel'),
    wikiPanel: document.getElementById('wikiPanel'),
    travelPanel: document.getElementById('travelPanel'),
    centralCard: document.querySelector('.central-card'),
    autocompleteList: document.getElementById('autocompleteList'),
    randomBtn: document.getElementById('randomBtn'),
    inputWrapper: document.querySelector('.input-wrapper'),
    weatherOverlay: document.getElementById('weatherOverlay'),
    disasterPanel: document.getElementById('disasterPanel')
};


let chartInstance = null;

export function showLoading(show = true, text = 'Loading…') {
    dom.loading.textContent = text;
    dom.loading.classList.toggle('hidden', !show);
}

export function clearPanels() {
    dom.countryInfoDiv.innerHTML = '';
    dom.weatherInfoDiv.innerHTML = '';
    dom.timePanel.innerHTML = '';
    dom.currencyPanel.innerHTML = '';
    dom.wikiPanel.innerHTML = '';
    dom.travelPanel.innerHTML = '';

    dom.resultPanels.classList.add('hidden');
    dom.hourlyPanel.classList.add('hidden');
    dom.chartPanel.classList.add('hidden');
    dom.timePanel.classList.add('hidden');
    dom.currencyPanel.classList.add('hidden');
    dom.wikiPanel.classList.add('hidden');
    dom.travelPanel.classList.add('hidden');
    dom.disasterPanel.classList.add('hidden');
    dom.centralCard.classList.remove('expanded');
    dom.autocompleteList.innerHTML = '';
    dom.autocompleteList.classList.add('hidden');

    dom.hourlyCarousel.innerHTML = '';
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
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

export function renderWeatherItems(weather, w, tempUnit, aqiData, uviData) {
    const container = dom.weatherInfoDiv;
    const tempUnitSymbol = tempUnit === 'metric' ? '°C' : '°F',
        temp = tempUnit === 'metric' ? Math.round(weather.main.temp) : Math.round(weather.main.temp * 9 / 5 + 32),
        feels = tempUnit === 'metric' ? Math.round(weather.main.feels_like) : Math.round(weather.main.feels_like * 9 / 5 + 32);

    const getAQIString = (aqi) => {
        switch (aqi) {
            case 1: return 'Good';
            case 2: return 'Fair';
            case 3: return 'Moderate';
            case 4: return 'Poor';
            case 5: return 'Very Poor';
            default: return 'Unknown';
        }
    };

    let aqiStr = aqiData?.list?.[0]?.main?.aqi ? `${aqiData.list[0].main.aqi} (${getAQIString(aqiData.list[0].main.aqi)})` : 'N/A';
    let uviStr = uviData?.value != null ? uviData.value : 'N/A';

    const getWindDir = (deg) => {
        if (deg === undefined) return '';
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return dirs[Math.round(deg / 45) % 8];
    };

    const weatherItems = [
        ['Temperature', `${temp}${tempUnitSymbol}`],
        ['Feels Like', `${feels}${tempUnitSymbol}`],
        ['Humidity', `${weather.main.humidity}%`],
        ['Pressure', `${weather.main.pressure} hPa`],
        ['Wind', `${weather.wind.speed} mph ${getWindDir(weather.wind.deg)}`],
        ['UV Index', uviStr],
        ['Air Quality', aqiStr],
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
        icon.src = `https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/openweathermap/${w.icon}.svg`;
        icon.alt = w.description;
        icon.style.width = '100%';
        icon.style.flex = '1';
        icon.style.objectFit = 'contain';
        icon.style.marginTop = '1rem';
        icon.style.minHeight = '120px';
        container.appendChild(icon);
    }
}

export function renderExtendedForecast(forecastData, tempUnit) {
    if (!forecastData || !forecastData.list) return;

    dom.hourlyPanel.classList.remove('hidden');
    dom.chartPanel.classList.remove('hidden');

    const tempUnitSymbol = tempUnit === 'metric' ? '°C' : '°F';
    const isMetric = tempUnit === 'metric';
    const next24 = forecastData.list.slice(0, 8); // Parse data for the next 24 hours (8 periods of 3 hours)
    dom.hourlyCarousel.innerHTML = '';
    next24.forEach(item => {
        const t = isMetric ? Math.round(item.main.temp) : Math.round(item.main.temp * 9 / 5 + 32);
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const icon = item.weather[0].icon;

        const div = document.createElement('div');
        div.className = 'hourly-item';
        div.innerHTML = `
            <span class="time">${time}</span>
            <img src="https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/openweathermap/${icon}.svg" alt="icon">
            <span class="temp">${t}°</span>
        `;
        dom.hourlyCarousel.appendChild(div);
    });

    const labels = [], temps = []; // Parse data for 5-day chart (group by day or just use 12:00 PM for each day)

    forecastData.list.forEach(item => { // Simple filter: take one reading per day around noon
        if (item.dt_txt.includes('12:00:00')) {
            const t = isMetric ? Math.round(item.main.temp) : Math.round(item.main.temp * 9 / 5 + 32);
            const dateStr = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            labels.push(dateStr);
            temps.push(t);
        }
    });

    if (labels.length === 0) {
        forecastData.list.filter((_, i) => i % 8 === 0).forEach(item => {
            const t = isMetric ? Math.round(item.main.temp) : Math.round(item.main.temp * 9 / 5 + 32);
            const dateStr = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' });
            labels.push(dateStr);
            temps.push(t);
        });
    }

    if (chartInstance) chartInstance.destroy();

    const ctx = dom.forecastChart.getContext('2d');
    const colorLine = document.body.classList.contains('dark') ? '#60a5fa' : '#3b82f6';
    const colorBg = document.body.classList.contains('dark') ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)';

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${tempUnitSymbol})`,
                data: temps,
                borderColor: colorLine,
                backgroundColor: colorBg,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: colorLine,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(150,150,150,0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

export function renderTime(weatherTimezoneOffset) {
    dom.timePanel.classList.remove('hidden');
    dom.timePanel.innerHTML = '';

    const title = document.createElement('h2');
    title.innerHTML = '🕒 Local Time';
    dom.timePanel.appendChild(title);

    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    timeDisplay.style.fontSize = '2.5rem';
    timeDisplay.style.fontWeight = '800';
    timeDisplay.style.textAlign = 'center';
    timeDisplay.style.margin = 'auto 0';
    dom.timePanel.appendChild(timeDisplay);

    const updateClock = () => {
        const now = new Date();
        const localTime = new Date(now.getTime() + weatherTimezoneOffset * 1000);
        timeDisplay.textContent = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' });
    };

    updateClock();
    if (window.clockInterval) clearInterval(window.clockInterval);
    window.clockInterval = setInterval(updateClock, 1000);
}

export function renderCurrency(country, rates) {
    if (!country.currencies) return;
    dom.currencyPanel.classList.remove('hidden');
    dom.currencyPanel.innerHTML = '';

    const title = document.createElement('h2');
    title.innerHTML = '💱 Currency';
    dom.currencyPanel.appendChild(title);

    const currencyCode = Object.keys(country.currencies)[0],
        currencyInfo = country.currencies[currencyCode];

    const currName = document.createElement('div');
    currName.innerHTML = `<strong>${currencyInfo.name}</strong> (${currencyInfo.symbol || currencyCode})`;
    currName.style.fontSize = '1.2rem';
    currName.style.marginBottom = '1rem';
    currName.style.textAlign = 'center';
    dom.currencyPanel.appendChild(currName);

    if (rates && rates.rates) {
        const rateToUSD = rates.rates[currencyCode];
        if (rateToUSD && currencyCode !== 'USD') {
            const val = document.createElement('div');
            val.className = 'info-item';
            val.innerHTML = `<span class="label">1 USD =</span><span class="value">${rateToUSD.toFixed(2)} ${currencyCode}</span>`;
            dom.currencyPanel.appendChild(val);
        }
        const rateToEUR = rates.rates['EUR'] ? (rates.rates[currencyCode] / rates.rates['EUR']) : null;
        if (rateToEUR && currencyCode !== 'EUR') {
            const val = document.createElement('div');
            val.className = 'info-item';
            val.innerHTML = `<span class="label">1 EUR =</span><span class="value">${rateToEUR.toFixed(2)} ${currencyCode}</span>`;
            dom.currencyPanel.appendChild(val);
        }
    }
}

export function renderWiki(summaryData) {
    if (!summaryData || !summaryData.extract) return;
    dom.wikiPanel.classList.remove('hidden');
    dom.wikiPanel.innerHTML = '';

    const title = document.createElement('h2');
    title.innerHTML = '📚 Wikipedia';
    dom.wikiPanel.appendChild(title);

    const extract = document.createElement('p');
    const sentences = summaryData.extract.match(/[^\.!\?]+[\.!\?]+/g) || [summaryData.extract];
    extract.textContent = sentences.slice(0, 2).join(' ');
    extract.style.lineHeight = '1.5';
    extract.style.color = 'var(--text-color)';
    dom.wikiPanel.appendChild(extract);

    if (summaryData.content_urls?.desktop?.page) {
        const link = document.createElement('a');
        link.href = summaryData.content_urls.desktop.page;
        link.target = '_blank';
        link.textContent = 'Read more';
        link.style.display = 'block';
        link.style.marginTop = '1rem';
        link.style.color = '#3b82f6';
        link.style.textDecoration = 'none';
        dom.wikiPanel.appendChild(link);
    }
}

export function renderTravelFacts(country) {
    dom.travelPanel.classList.remove('hidden');
    dom.travelPanel.innerHTML = '';

    const title = document.createElement('h2');
    title.innerHTML = '✈️ Travel Facts';
    dom.travelPanel.appendChild(title);

    const drivingSide = country.car?.side ? country.car.side.charAt(0).toUpperCase() + country.car.side.slice(1) : 'Unknown';
    const callingCode = country.idd?.root ? (country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')) : 'Unknown';
    const languages = country.languages ? Object.values(country.languages).join(', ') : 'Unknown';

    const facts = [
        ['🚗 Driving Side', drivingSide],
        ['📞 Calling Code', callingCode],
        ['🗣️ Languages', languages]
    ];

    facts.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `<span class="label">${label}:</span><span class="value" style="max-width: 60%; text-align: right;">${value}</span>`;
        dom.travelPanel.appendChild(div);
    });
}

export function updateWeatherBackground(condition) {
    const overlay = dom.weatherOverlay;
    overlay.innerHTML = '';
    let colors = { // Default / fallback colors
        b1: '#ffb6ff', b2: '#b6ffff', b3: '#ffd1b6'
    };

    const cond = condition.toLowerCase();
    if (cond.includes('clear')) {
        colors = { b1: '#fbbf24', b2: '#f59e0b', b3: '#fb923c' }; // Sunny/Clear: Vibrant oranges, yellows, and warm ambers
    } else if (cond.includes('cloud')) {
        colors = { b1: '#94a3b8', b2: '#64748b', b3: '#cbd5e1' }; // Cloudy: Muted grays and soft blues
    } else if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm') || cond.includes('squall')) {
        colors = { b1: '#1e3a8a', b2: '#334155', b3: '#1e40af' }; // Rainy/Stormy: Deep, moody blues and slate grays
        createParticles('rain');
    } else if (cond.includes('snow')) {
        colors = { b1: '#f8fafc', b2: '#bae6fd', b3: '#e0f2fe' }; // Snowy: Icy whites and crystal-clear blues
        createParticles('snow');
    } else if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('dust') || cond.includes('sand') || cond.includes('ash') || cond.includes('smoke')) {
        colors = { b1: '#e2e8f0', b2: '#94a3b8', b3: '#f1f5f9' }; // Misty/Foggy: Soft whites and hazy neutrals
    }

    document.documentElement.style.setProperty('--blob-1', colors.b1);
    document.documentElement.style.setProperty('--blob-2', colors.b2);
    document.documentElement.style.setProperty('--blob-3', colors.b3);

    function createParticles(type) {
        const count = type === 'rain' ? 80 : 50;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = type === 'rain' ? 'rain-drop' : 'snow-flake';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            p.style.animationDelay = Math.random() * 2 + 's';
            if (type === 'snow') {
                const size = Math.random() * 5 + 3 + 'px';
                p.style.width = size;
                p.style.height = size;
                p.style.animationDuration = (Math.random() * 3 + 2) + 's';
            }
            overlay.appendChild(p);
        }
    }
}

export function renderAutocomplete(list, onSelect) {
    dom.autocompleteList.innerHTML = '';
    if (!list.length) {
        dom.autocompleteList.classList.add('hidden');
        return;
    }

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.textContent = item;
        div.addEventListener('click', () => {
            onSelect(item);
            dom.autocompleteList.classList.add('hidden');
        });
        dom.autocompleteList.appendChild(div);
    });
    dom.autocompleteList.classList.remove('hidden');
}

export function renderDisasterInfo(weather, uvi) {
    dom.disasterPanel.classList.remove('hidden');
    dom.disasterPanel.innerHTML = '<h2>🚨 Disaster & Safety</h2>';

    const temp = weather.main.temp,
        condition = weather.weather[0].main,
        uviVal = uvi || 0;

    let riskLevel = 'Low Risk',
        riskClass = 'risk-low',
        prediction = '✅ No major disaster expected.',
        tips = 'Stay updated with local alerts.';

    if (condition.includes('Rain') || condition.includes('Thunderstorm')) {
        riskLevel = 'High Risk';
        riskClass = 'risk-high';
        prediction = '🌊 Flood risk possible. Avoid low areas.';
        tips = 'Seek higher ground and avoid travel near rivers.';
    } else if (temp > 40 || uviVal > 8) {
        riskLevel = 'High Risk';
        riskClass = 'risk-high';
        prediction = '🔥 Extreme heat/UV alert. Stay hydrated.';
        tips = 'Avoid direct sun exposure and wear high SPF.';
    } else if (temp > 35 || condition.includes('Cloud') || uviVal > 5) {
        riskLevel = 'Moderate Risk';
        riskClass = 'risk-moderate';
        prediction = '⚠️ Moderate conditions. Stay alert.';
        tips = 'Carry water and check local weather frequently.';
    }

    const badge = document.createElement('div');
    badge.className = `risk-badge ${riskClass}`;
    badge.textContent = riskLevel;
    dom.disasterPanel.appendChild(badge);

    const predDiv = document.createElement('div');
    predDiv.className = 'info-item';
    predDiv.style.fontWeight = '600';
    predDiv.style.marginBottom = '0.5rem';
    predDiv.textContent = prediction;
    dom.disasterPanel.appendChild(predDiv);

    const tipsDiv = document.createElement('div');
    tipsDiv.className = 'safety-tips';
    tipsDiv.innerHTML = `<strong>💡 Safety Tips:</strong><br>${tips}`;
    dom.disasterPanel.appendChild(tipsDiv);

    const mapBtn = document.createElement('button');
    mapBtn.className = 'safety-btn';
    mapBtn.style.marginTop = '1rem';
    mapBtn.style.width = '100%';
    mapBtn.innerHTML = '📍 Find Nearby Safety & Hospitals';
    mapBtn.addEventListener('click', () => {
        const query = encodeURIComponent(`hospitals and emergency services in ${weather.name}`);
        window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    });
    dom.disasterPanel.appendChild(mapBtn);
}