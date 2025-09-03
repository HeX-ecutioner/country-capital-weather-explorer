# Country & Capital Weather Explorer ⛅

A single-page app using **HTML + CSS + vanilla JS** that:
- Lets users search for a country (REST Countries API)
- Shows country details (flag, name, capital, population)
- Fetches current weather for the capital (via **Netlify serverless function + OpenWeatherMap**)
- Includes responsive design, loading states, geolocation, and dark mode

---

## How it Works

1. The user searches for a country.
2. The app calls the **REST Countries API** to get country info.
3. After receiving the country info, the app calls a **Netlify serverless function**:
   - The function retrieves weather from **OpenWeatherMap** using a secure API key (stored as an environment variable in Netlify).
   - The frontend never exposes the API key.
4. The app displays:
   - Temperature (°C)
   - Weather description
   - Weather icon
5. The **Geolocation button** uses the browser’s geolocation, reverse-geocodes with **Nominatim (OpenStreetMap)**, then runs the same flow.

---

## Local Setup For Development (uses Netlify)

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

2. Install Netlify CLI (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

3. Link your project to Netlify:
   ```bash
   netlify init
   ```

4. Add your OpenWeather API key as an environment variable in Netlify:
   ```bash
   netlify env:set OPENWEATHER_API_KEY your_api_key_here
   ```

5. Run the app locally with Netlify’s dev server:
   ```bash
   netlify dev
   ```
   This will proxy requests to your serverless function at  
   [http://localhost:8888/.netlify/functions/getWeather](http://localhost:8888/.netlify/functions/getWeather)

---

## Deployment (this project is deployed on Netlify to keep it secure)

1. Push your code to GitHub.
2. Deploy with Netlify (either via the GitHub integration or `netlify deploy`).
3. In the Netlify dashboard:
   - Go to **Site Settings → Environment Variables**
   - Add `OPENWEATHER_API_KEY` with your OpenWeatherMap API key.
4. Your site will be live with secure weather API calls handled server-side 🎉

---

## **Optional**: Local Testing with `config.js`

If you don’t want to set up Netlify locally, you can still test using a plain API key:

1. Copy `config.js.example` → `config.js`
2. Put your API key inside:
   ```js
   window.__CONFIG__ = {
     OPENWEATHER_API_KEY: 'YOUR_API_KEY'
   };
   ```
3. Open `index.html` directly in your browser.

⚠️ Note: This approach exposes your key and should **not** be used in production.

---

## Features
- ✅ Country info (flag, name, capital, population)
- ✅ Weather info (temperature °C, description, icon)
- ✅ Responsive design
- ✅ Dark mode toggle
- ✅ Loading states
- ✅ Geolocation support
- ✅ Secure API key handling with Netlify functions

---