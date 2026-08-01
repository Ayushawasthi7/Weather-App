# AeroSky Weather App 🌤️

Welcome to the **AeroSky Weather App** repository! 
This project is an advanced, fully-responsive weather application built with React, Vite, and Node.js. It is designed to be highly interactive, aesthetically pleasing, and packed with features that go beyond simply checking the temperature. 

This repository provides an excellent learning resource for students looking to understand **Frontend/Backend Separation**, **API Proxying**, **Custom React Hooks**, and **Modern UI/UX Design**.

---

## 🚀 Key Features

- **Live Weather Tracking**: Accurate, real-time weather data including humidity, wind speed, pressure, and apparent temperature (Feels Like).
- **Air Quality Index (AQI)**: A beautiful circular gauge that breaks down pollutants (PM2.5, PM10, CO, NO2, O3) and provides immediate health warnings.
- **Smart Recommendations**: Dynamic advice tailored for:
  - 👕 **Clothing**: What to wear based on the current temperature and rain probability.
  - ✈️ **Travel**: Warnings about visibility, extreme heat, or heavy winds for drivers and flyers.
  - 🌱 **Agriculture**: Smart insights for farmers on when to irrigate or avoid pesticide spraying based on wind and evaporation rates.
- **Interactive Weather Map**: A fully integrated Leaflet map displaying your location, current temperatures, and weather conditions worldwide.
- **Voice Narration (Text-to-Speech)**: Push a button to have the app speak the current weather summary to you!
- **Multi-language Support**: Seamlessly toggle between English and Hindi.
- **Unit Conversions**: Instantly swap between Celsius/Fahrenheit, km/h / mph / m/s, and hPa / inHg.
- **Immersive Glassmorphism UI**: Beautiful, blurred glass panels, dynamic glowing backgrounds, and micro-animations that feel premium on both Mobile and Desktop.

---

## 🏗️ Project Architecture (How it works)

This project uses a separated **Frontend** and **Backend** architecture (a very common real-world pattern).

### 1. `backend/` (The API Proxy)
- Built with **Node.js** and **Express**.
- Instead of the React frontend calling external APIs directly (which exposes API keys in a real-world scenario and causes CORS issues), our backend does it.
- **Routes**:
  - `GET /api/weather?lat=...&lon=...`: Fetches forecast data and AQI data from Open-Meteo, bundles it into a single JSON object, and sends it to the frontend.
  - `GET /api/search?name=...`: Fetches city autocomplete search results.

### 2. `frontend/` (The User Interface)
- Built with **React** and **Vite** for blazing fast development.
- Uses **Tailwind CSS** for layout, styling, and animations.
- **`vite.config.js`**: Contains a proxy setting so that whenever the frontend requests `/api/...`, Vite forwards it to the local Express backend running on port `5000`.

---

## 💻 Installation & Setup Guide for Students

To run this project on your local machine, follow these steps exactly:

### Prerequisites
Make sure you have **Node.js** installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).

### Step 1: Clone the repository
```bash
git clone https://github.com/Ayushawasthi7/Weather-App.git
cd Weather-App
```

### Step 2: Start the Backend Server
You must start the backend server first so it can serve data to the frontend.
Open a terminal and run:
```bash
cd backend
npm install
npm start
```
*The backend will now be running on `http://localhost:5000`.*

### Step 3: Start the Frontend Application
Leave the backend terminal open running! Open a **new, second terminal** and run:
```bash
cd frontend
npm install
npm run dev
```
*Vite will give you a local URL (e.g., `http://localhost:5173`). Control-click it to open the app in your browser!*

---

## 🧠 Things to Learn from this Codebase

If you are a student reading this code, pay special attention to:
1. **`frontend/src/hooks/useWeather.js`**: See how a Custom React Hook is used to manage complex loading states, errors, and asynchronous `fetch` calls cleanly away from the UI components.
2. **`frontend/src/App.jsx`**: Notice how responsive design is achieved using Tailwind's layout grids (`grid-cols-1 lg:grid-cols-3`).
3. **`frontend/src/components/Recommendations.jsx`**: See how complex `if/else` logic is used to generate dynamic text based on raw numerical weather values (temp, wind, etc.).
4. **`frontend/vite.config.js`**: Look at the `server: { proxy: { ... } }` setup. This is a critical skill for full-stack developers to connect frontends with backends seamlessly during local development!

---

*Happy Coding! 💻 Let the weather guide your code.*
