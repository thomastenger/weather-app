import { useState, useEffect} from "react";
import axios from "axios";
import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc} from "firebase/firestore";

function App() {
  const [city, setCity] = useState(""); 
  const [weather, setWeather] = useState(null); 
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]); 
  const [editId, setEditId] = useState(null);
  const [newTemp, setNewTemp] = useState("");


  const API_KEY = "abbb5213d282802cf3af589336d277a9"; // OpenWeather key API
  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;


  //Create 
  useEffect(() => {
    const fetchHistory = async () => {
      const querySnapshot = await getDocs(collection(db, "weather_history"));
      setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchHistory();
  }, []);
  
  //read
  const fetchWeather = async () => {
    try {
      const response = await axios.get(WEATHER_URL);
      setWeather(response.data);

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

  //Delete
  const deleteHistory = async (id) => {
    await deleteDoc(doc(db, "weather_history", id));
    setHistory(history.filter((item) => item.id !== id));
  };

  //Update
  const updateHistory = async (id) => {
    const docRef = doc(db, "weather_history", id);
    await updateDoc(docRef, { temp: parseFloat(newTemp) });

    setHistory(history.map(item => item.id === id ? { ...item, temp: newTemp } : item));
    setEditId(null);
    setNewTemp("");
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
      
      <div className="mt-4 bg-white p-4 rounded shadow w-96">
        <h2 className="text-xl font-bold">📜 Historique</h2>
        {history.length === 0 ? <p>Aucune recherche enregistrée.</p> : (
          history.map((item) => (
            <div key={item.id} className="border-t mt-2 pt-2 flex justify-between">
              <p>📍 {item.city} ({item.country}) - {item.temp}°C</p>
              {editId === item.id ? (
                <div className="flex">
                  <input
                    type="number"
                    placeholder="Nouvelle Température"
                    className="p-1 border rounded mr-2"
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                  />
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => updateHistory(item.id)}
                  >
                    ✅ Valider
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => setEditId(item.id)}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    onClick={() => deleteHistory(item.id)}
                  >
                    ❌ Supprimer
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
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