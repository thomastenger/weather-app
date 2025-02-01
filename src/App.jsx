import { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState(""); 
  const [weather, setWeather] = useState(null); 
  const [forecast, setForecast] = useState([]);

  const API_KEY = "abbb5213d282802cf3af589336d277a9"; // OpenWeather API
  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  const fetchWeather = async () => {
    try {
      const response = await axios.get(WEATHER_URL);
      setWeather(response.data);
    } catch (error) {
      console.error("Error while retrieving weather data ( WEATHER_URL )", error);
    }
  };

  const fetchForecast = async () => {
    try {
      const response = await axios.get(FORECAST_URL);
      const dailyForecasts = response.data.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00") 
      );
      setForecast(dailyForecasts);
    } catch (error) {
      console.error("Error while retrieving weather data ( FORECAST_URL)" , error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-3xl font-bold mb-4">🌤️ Weather App</h1>

      <input
        type="text"
        placeholder="Enter a city..."
        className="p-2 border rounded mb-2"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      
      <div className="flex gap-2" >
        <button
            onClick={fetchWeather}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Get the weather
        </button>

        <div className="flex gap-2" >
        <button
            onClick={fetchForecast}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
           Forecast 5 days
        </button>

      </div>
      
      

      {weather && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold">{weather.name}</h2>
          <p>🌡️ Temperature : {weather.main.temp}°C</p>
          <p>💨 Wind : {weather.wind.speed} m/s</p>
          <p>🌍 Country : {weather.sys.country}</p>

          {weather.rain ? (
            <p>🌧️ Rain ( last hour ) : {weather.rain["1h"] || 0} mm</p>
          ) : (
            <p>🌞 No rain detected </p> 
          )}
        </div>
      )}
    </div>
    
    {forecast.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold">📅 Prévisions 5 jours</h2>
          {forecast.map((day, index) => (
            <div key={index} className="border-t mt-2 pt-2">
              <p>📅 {new Date(day.dt * 1000).toLocaleDateString()}</p>
              <p>🌡️ Temperature : {day.main.temp}°C</p>
              <p>☁️ {day.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;