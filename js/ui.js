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
    forecastChart: document.getElementById('forecastChart')
};

let chartInstance = null;

export function showLoading(show = true, text = 'Loading…') {
    dom.loading.textContent = text;
    dom.loading.classList.toggle('hidden', !show);
}

export function clearPanels() {
    dom.countryInfoDiv.innerHTML = '';
    dom.weatherInfoDiv.innerHTML = '';
    dom.resultPanels.classList.add('hidden');
    dom.hourlyPanel.classList.add('hidden');
    dom.chartPanel.classList.add('hidden');
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
        switch(aqi) {
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
        icon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
        icon.alt = w.description;
        icon.style.width = '80px';
        icon.style.marginTop = '1rem';
        container.appendChild(icon);
    }
}

export function renderExtendedForecast(forecastData, tempUnit) {
    if (!forecastData || !forecastData.list) return;

    dom.hourlyPanel.classList.remove('hidden');
    dom.chartPanel.classList.remove('hidden');

    const tempUnitSymbol = tempUnit === 'metric' ? '°C' : '°F';
    const isMetric = tempUnit === 'metric';

    // Parse data for the next 24 hours (8 periods of 3 hours)
    const next24 = forecastData.list.slice(0, 8);
    dom.hourlyCarousel.innerHTML = '';
    next24.forEach(item => {
        const t = isMetric ? Math.round(item.main.temp) : Math.round(item.main.temp * 9 / 5 + 32);
        const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const icon = item.weather[0].icon;

        const div = document.createElement('div');
        div.className = 'hourly-item';
        div.innerHTML = `
            <span class="time">${time}</span>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
            <span class="temp">${t}°</span>
        `;
        dom.hourlyCarousel.appendChild(div);
    });

    // Parse data for 5-day chart (group by day or just use 12:00 PM for each day)
    const labels = [];
    const temps = [];
    
    // Simple filter: take one reading per day around noon
    forecastData.list.forEach(item => {
        if (item.dt_txt.includes('12:00:00')) {
            const t = isMetric ? Math.round(item.main.temp) : Math.round(item.main.temp * 9 / 5 + 32);
            const dateStr = new Date(item.dt * 1000).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
            labels.push(dateStr);
            temps.push(t);
        }
    });

    if (labels.length === 0) {
        forecastData.list.filter((_, i) => i % 8 === 0).forEach(item => {
            const t = isMetric ? Math.round(item.main.temp) : Math.round(item.main.temp * 9 / 5 + 32);
            const dateStr = new Date(item.dt * 1000).toLocaleDateString([], {weekday: 'short'});
            labels.push(dateStr);
            temps.push(t);
        });
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

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