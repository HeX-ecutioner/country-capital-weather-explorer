<p align="center">
  <img src="./assets/favicon.png" width="250" alt="TerraBrewer Logo">
</p>

# 🌍 TerraBrewer

A high-performance, secure **global intelligence dashboard** featuring an **Express.js backend** and a visually stunning **Vanilla JS + CSS frontend**. Explore real-time weather, disaster alerts, and comprehensive country metrics through a premium, glassmorphic interface.

## ✨ Features

- ⚡ **Express.js Backend** — Lightweight, high-performance proxy server that secures API keys and handles cross-origin requests seamlessly.
- 🎨 **Glorious UI** — Beautifully crafted, responsive interface featuring intense glassmorphism, fluid micro-animations, and a sleek Light/Dark mode slider toggle.
- ⛈️ **Real-time Weather** — Live updates and 5-day forecasts fetched via the **OpenWeatherMap API**.
- 🚨 **Disaster Intelligence** — Integrated real-time disaster alerts and event mapping powered by **GDACS**.
- 📍 **Safety Locators** — Dynamic lookup of nearby critical infrastructure like hospitals and police stations.
- 🌍 **Country Metrics** — Detailed geographic and geopolitical data (population, capitals, currencies) via the **REST Countries API**.
- 📊 **Interactive Analytics** — Visualized environmental trends using **Chart.js** for intuitive forecasting.

## 🧠 Intelligence Approach

TerraBrewer utilizes a **multi-source data fusion engine**:

- **Geographic Data (REST Countries)** → Provides the foundational context for every search.
- **Environmental Data (OpenWeather)** → Layers real-time atmospheric conditions and predictive trends.
- **Crisis Data (GDACS)** → Injects critical safety alerts based on the geographic proximity of the user's focus.
- **Local Context (Nominatim)** → Facilitates reverse-geocoding for precise "Use My Location" functionality.

The application intelligently merges these streams to provide a holistic view of any location on Earth.

## ⚙️ How It Works

1. **User Interaction**: The user enters a country name or triggers geolocation.
2. **Secure Proxying**: The frontend communicates with a local **Express.js** server.
3. **API Aggregation**: The backend fetches data from **OpenWeatherMap**, **REST Countries**, and **GDACS** using secure environment variables.
4. **Data Normalization**: The server cleans and formats the diverse API responses into a unified JSON structure.
5. **Dynamic Rendering**: The frontend parses the intelligence and dynamically builds:
    - 🌤️ Weather & Forecast panels
    - 🚩 Country Identity modules
    - 🚨 Real-time Disaster alerts
    - 🏥 Safety Infrastructure maps

## 🚀 Getting Started

### 🔧 Prerequisites

- **Node.js** (v14.x or higher)
- **OpenWeatherMap API Key** ([Get one here](https://openweathermap.org/api))

### 🛠️ Installation

1. Clone this repository:

```bash
git clone https://github.com/HeX-ecutioner/terrabrewer.git
cd terrabrewer
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file by duplicating `.env.example`:

```bash
cp .env.example .env
```

4. Add your API key inside `.env`:

```env
OPENWEATHER_API_KEY="YOUR_API_KEY_HERE"
```

### ▶️ Running the App Locally

Start the optimized development server:

```bash
npm run dev
```

Then, seamlessly open `http://localhost:3000` in your browser!

## ℹ️ Additional Information

### 📂 APIs Used

- **OpenWeatherMap** — Weather & Forecasts
- **REST Countries** — Global Country Data
- **GDACS** — Global Disaster Alerts
- **Nominatim (OSM)** — Geocoding & Search

### 📦 Dependencies

- **express** — Backend Framework
- **dotenv** — Environment Management
- **node-fetch** — Server-side API Requests
- **cors** — Cross-Origin Resource Sharing
- **Chart.js** — Frontend Data Visualization

### ⚖️ License

This app uses the [MIT License](LICENSE)