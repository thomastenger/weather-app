require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 5000;

// Configuration PostgreSQL
const pool = new Pool({
  user: "admin", // Remplace par ton utilisateur PostgreSQL
  host: "localhost",
  database: "weather_db",
  password: "Admin2025!!", // Remplace par ton mot de passe
  port: 5432,
});

app.use(cors());
app.use(express.json());

// 🔹 CREATE : Ajouter une recherche météo
app.post("/weather", async (req, res) => {
  const { city, temperature, description } = req.body;
  try {
    const newWeather = await pool.query(
      "INSERT INTO weather (city, temperature, description) VALUES ($1, $2, $3) RETURNING *",
      [city, temperature, description]
    );
    res.json(newWeather.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// 🔹 READ : Récupérer toutes les recherches
app.get("/weather", async (req, res) => {
  try {
    const allWeather = await pool.query("SELECT * FROM weather ORDER BY date DESC");
    res.json(allWeather.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// 🔹 UPDATE : Modifier une recherche
app.put("/weather/:id", async (req, res) => {
  const { id } = req.params;
  const { city, temperature, description } = req.body;
  try {
    await pool.query(
      "UPDATE weather SET city = $1, temperature = $2, description = $3 WHERE id = $4",
      [city, temperature, description, id]
    );
    res.send("Mise à jour réussie !");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// 🔹 DELETE : Supprimer une recherche
app.delete("/weather/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM weather WHERE id = $1", [id]);
    res.send("Suppression réussie !");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${port}`);
});
