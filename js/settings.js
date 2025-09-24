import { renderWeatherItems } from './ui.js';

export let tempUnit = localStorage.getItem('tempUnit') || 'metric';
let lastWeatherData = null;

const darkModeSwitch = document.getElementById('darkModeSwitch'), sliderIcon = darkModeSwitch.querySelector('.icon');

export function setDarkMode(enabled, remember = true) {
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

const tempUnitSwitch = document.getElementById('tempUnitSwitch'), tempSliderIcon = tempUnitSwitch.querySelector('.icon');

export function setTempUnit(unit, remember = true) {
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
    if (lastWeatherData) renderWeatherItems(lastWeatherData, lastWeatherData.weather?.[0] || {}, tempUnit);
}

tempUnitSwitch.addEventListener('click', () => {
    const newUnit = tempUnit === 'metric' ? 'imperial' : 'metric';
    setTempUnit(newUnit);
});

export function setLastWeatherData(data) {
    lastWeatherData = data;
}

setTempUnit(tempUnit, false); // Apply saved unit