import { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState(""); 
  const [weather, setWeather] = useState(null); 

  const API_KEY = "abbb5213d282802cf3af589336d277a9"; // OpenWeather API
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  const fetchWeather = async () => {
    try {
      const response = await axios.get(API_URL);
      setWeather(response.data);
    } catch (error) {
      console.error("Error while retrieving weather data", error);
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
      
      <button
        onClick={fetchWeather}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Get the weather
      </button>

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
  );
}

export default App;
