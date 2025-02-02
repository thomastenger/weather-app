import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const GOOGLE_API_KEY = "AIzaSyBnuNGtykrlIs9MpJExVzpzKG_3hQ7UfM4"; // Google Maps API Key
  const API_KEY = "abbb5213d282802cf3af589336d277a9"; // OpenWeather API key


  const fetchWeatherByCity = async () => {
    if (!city) return;
    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
      const response = await axios.get(WEATHER_URL);
      setWeather(response.data);
      fetchCoordinates(response.data.name);
      fetchForecast(response.data.name);
      saveToHistory(response.data);
    } catch (error) {
      setError("Error retrieving weather");
      console.error(error);
    }
  };

  // Function Weather geolocation user
  const fetchWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

          try {
            const response = await axios.get(WEATHER_URL);
            setWeather(response.data);
            fetchCoordinates(response.data.name);
            fetchForecast(response.data.name);
            saveToHistory(response.data);
          } catch (error) {
            setError("Error retrieving weather");
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setError("It is impossible to recover the location");
          setLoading(false);
          console.error(error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  // Function  5 day forecast
  const fetchForecast = async (cityName) => {
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;

    try {
      const response = await axios.get(FORECAST_URL);
      const dailyForecasts = response.data.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00") 
      );
      setForecast(dailyForecasts);
    } catch (error) {
      console.error("Error in retrieving weather forecas.", error);
    }
  };


  const fetchCoordinates = async (cityName) => {
    const GEO_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=${GOOGLE_API_KEY}`;
    try {
      const response = await axios.get(GEO_URL);
      const location = response.data.results[0].geometry.location;
      setCoordinates({ lat: location.lat, lng: location.lng });
    } catch (error) {
      console.error(" Error when retrieving coordinates.", error);
    }
  };

  // Function to store data in Firebase
  const saveToHistory = async (data) => {
    try {
      await addDoc(collection(db, "weather_history"), {
        city: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        timestamp: new Date(),
      });

      const querySnapshot = await getDocs(collection(db, "weather_history"));
      console.log("Historical up to date :", querySnapshot.docs.map(doc => doc.data()));
    } catch (error) {
      console.error("Error during registration in Firebase.", error);
    }
  };


  useEffect(() => {
    fetchWeatherByLocation();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-3xl font-bold mb-4">🌤️ Weather App - Thomas Stenger</h1>

     
      <input
        type="text"
        placeholder="Enter a city..."
        className="p-2 border rounded mb-2"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      
      <div className="flex gap-2">
        <button onClick={fetchWeatherByCity} className="px-4 py-2 bg-blue-500 text-white rounded">
          Search Weather 
        </button>
        <button onClick={fetchWeatherByLocation} className="px-4 py-2 bg-gray-500 text-white rounded">
          📍 Current Weather
        </button>
        <button onClick={() => fetchForecast(weather?.name)} className="px-4 py-2 bg-green-500 text-white rounded">
          📅 5 day Forecast
        </button>
      </div>

      
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {weather && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold">{weather.name}, {weather.sys.country}</h2>
          <p>🌡️ Temperature : {weather.main.temp}°C</p>
          <p>💨 Wind : {weather.wind.speed} m/s</p>
          <p>☁️ Condition : {weather.weather[0].description}</p>
        </div>
      )}

      
      {coordinates && (
        <div className="mt-4 w-full flex justify-center">
          <iframe
            title="Google Maps"
            width="600"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${coordinates.lat},${coordinates.lng}`}
          ></iframe>
        </div>
      )}

      
      {forecast.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold">📅 5 day Forecast</h2>
          {forecast.map((day, index) => (
            <div key={index} className="border-t mt-2 pt-2">
              <p>📅 {new Date(day.dt * 1000).toLocaleDateString()}</p>
              <p>🌡️ {day.main.temp}°C, ☁️ {day.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
