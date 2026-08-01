import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Proxy for Weather Forecast and Air Quality
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, timezone } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const zone = timezone || 'auto';

        // Fetch forecast
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,wind_speed_10m,visibility,uv_index,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=${encodeURIComponent(zone)}`;

        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error("Forecast API failed to respond");
        const forecastData = await forecastRes.json();

        // Fetch air quality
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone`;
        let aqiData = null;
        try {
            const aqiRes = await fetch(aqiUrl);
            if (aqiRes.ok) {
                const rawAqi = await aqiRes.json();
                if (rawAqi && rawAqi.current) {
                    aqiData = {
                        aqi: rawAqi.current.us_aqi,
                        pm25: rawAqi.current.pm2_5,
                        pm10: rawAqi.current.pm10,
                        co: rawAqi.current.carbon_monoxide,
                        no2: rawAqi.current.nitrogen_dioxide,
                        o3: rawAqi.current.ozone
                    };
                }
            }
        } catch (e) {
            console.warn("Failed to retrieve air quality data in backend proxy:", e);
        }

        res.json({
            forecast: forecastData,
            aqi: aqiData
        });
    } catch (err) {
        console.error('Weather API Proxy Error:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch weather data' });
    }
});

// Proxy for Geocoding (Search)
app.get('/api/search', async (req, res) => {
    try {
        const { name, lang } = req.query;
        if (!name) {
            return res.status(400).json({ error: 'Search name query is required' });
        }
        const language = lang === 'hi' ? 'hi' : 'en';

        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=${language}&format=json`;

        const geocodeRes = await fetch(geocodeUrl);
        if (!geocodeRes.ok) throw new Error("Geocoding API failed");

        const data = await geocodeRes.json();
        res.json(data);
    } catch (err) {
        console.error('Geocoding API Proxy Error:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch geocoding data' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
