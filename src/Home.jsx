import { useState, useEffect} from "react";
import axios from "axios";
import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc} from "firebase/firestore";

function Home() {
  const [city, setCity] = useState(""); 
  const [weather, setWeather] = useState(null); 
  const [forecast, setForecast] = useState([]);
  const [coordinates, setCoordinates] = useState(null);



  const GOOGLE_API_KEY = "AIzaSyBnuNGtykrlIs9MpJExVzpzKG_3hQ7UfM4"; 
  const API_KEY = "abbb5213d282802cf3af589336d277a9"; // OpenWeather key API
  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  const fetchWeather = async () => {
    try {
      const response = await axios.get(WEATHER_URL);
      setWeather(response.data);

      await fetchCoordinates(response.data.name);
      await addDoc(collection(db, "weather_history"), {
        city: response.data.name,
        country: response.data.sys.country,
        temp: response.data.main.temp,
        timestamp: new Date(),
      });

      const querySnapshot = await getDocs(collection(db, "weather_history"));
      setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error while retrieving weather data ( WEATHER_URL )", error);
    }
  };

  const fetchCoordinates = async (city) => {
    const GEO_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`;
    
    try {
      const response = await axios.get(GEO_URL);
      const location = response.data.results[0].geometry.location;
      setCoordinates({ lat: location.lat, lng: location.lng });
    } catch (error) {
      console.error("Erreur lors de la récupération des coordonnées", error);
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
            className="px-4 py-2 bg-blue-500 text-white rounded mr-8"
          >
            Get the weather
        </button>

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
      src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${coordinates.lat},${coordinates.lng}`}>
    </iframe>
  </div>
)}

   
    
        {forecast.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold">📅 weather forecasts for next 5 days </h2>
            {forecast.map((day, index) => (
                <div key={index} className="border-t mt-2 pt-2">
                <p>📅 {new Date(day.dt * 1000).toLocaleDateString()}</p>
                <p>🌡️ Temperature : {day.main.temp}°C,☁️ {day.weather[0].description} </p>
                </div>
            ))}
            </div>
        )}
    </div>
  );
}

export default Home;