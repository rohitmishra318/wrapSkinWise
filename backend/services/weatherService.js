const axios = require('axios');
const redis = require('../config/redis');

const getWeather = async (city) => {
  if (!city) return null;
  const cacheKey = `cache:weather:${city.toLowerCase().replace(/\s/g, '_')}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const res = await axios.get(url);
    const lat = res.data.coord.lat;
    const lon = res.data.coord.lon;
    const humidity = res.data.main.humidity;
    const temperature = res.data.main.temp;

    let aqi = null;
    try {
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
      const aqiRes = await axios.get(aqiUrl);
      aqi = aqiRes.data.list[0].main.aqi;
    } catch (e) {
      console.log('Failed to fetch AQI', e.message);
    }

    const uvIndex = 5;

    const result = { humidity, temperature, uvIndex, aqi, city, fetchedAt: new Date() };
    await redis.setex(cacheKey, 3600, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error(`Failed to fetch weather for city ${city}:`, error.message);
    return null;
  }
};

module.exports = { getWeather };
