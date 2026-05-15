# Country & Capital Weather Explorer ⛅

A single-page app using **HTML + CSS + vanilla JS** that:
- Lets users search for a country (REST Countries API)
- Shows country details (flag, name, official name, capital, population)
- Fetches current weather for the capital (via **Express.js backend + OpenWeatherMap**)
- Includes responsive design, loading states, geolocation, and dark mode

## How it Works

1. The user searches for a country.
2. The app calls the **REST Countries API** to get country info.
3. After receiving the country info, the app calls a **local Express.js backend**:
   - The backend retrieves weather from **OpenWeatherMap** using a secure API key (stored as an environment variable).
   - The frontend never exposes the API key.
4. The app displays:
   - Temperature (°C)
   - Weather description
   - Weather icon
5. The **Geolocation button** uses the browser’s geolocation, reverse-geocodes with **Nominatim (OpenStreetMap)**, then runs the same flow.

## Local Setup For Development

1. Clone the repo:
   ```bash
   git clone https://github.com/HeX-ecutioner/country-capital-weather-explorer.git
   cd YOUR_REPO
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your API key:
   - Copy `.env.example` to `.env`
   - Add your OpenWeather API key inside the `.env` file:
     ```env
     OPENWEATHER_API_KEY=your_api_key_here
     ```

4. Run the app locally:
   ```bash
   npm run dev
   ```
   This will start the Express server and you can access the app at `http://localhost:3000`.

## Features
- ✅ Country info (flag, name, capital, population)
- ✅ Weather info (temperature °C, description, icon)
- ✅ Responsive design
- ✅ Dark mode toggle
- ✅ Loading states
- ✅ Geolocation support
- ✅ Secure API key handling with a local backend