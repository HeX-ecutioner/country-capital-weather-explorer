export async function fetchCountryByName(name) {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`);
    if (!res.ok) throw new Error(`Country not found (status ${res.status})`);
    const data = await res.json();
    return data.find(c => c.name.common.toLowerCase() === name.trim().toLowerCase()) || data[0];
}

export async function fetchWeatherForCity(city) {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&units=metric`);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
}

export async function reverseGeocode(lat, lon) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Failed to get country info: ${res.status}`);
    return await res.json();
}

export async function fetchForecastForCity(city) {
    const res = await fetch(`/api/forecast?city=${encodeURIComponent(city)}&units=metric`);
    if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
}

export async function fetchAirPollution(lat, lon) {
    const res = await fetch(`/api/air_pollution?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Air pollution fetch failed: ${res.status}`);
    return await res.json();
}

export async function fetchUvi(lat, lon) {
    const res = await fetch(`/api/uvi?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`UVI fetch failed: ${res.status}`);
    return await res.json();
}