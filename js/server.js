const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 1234;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
(async () => {
  const fetch = await import("node-fetch");
  // Your logic goes here
  async function loginFPL(email, password) {
    const loginUrl = "https://users.premierleague.com/accounts/login/";

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          login: email,
          password: password,
          redirect_uri: "https://fantasy.premierleague.com/", // Redirect after login
          app: "plfpl-web",
        }),
        credentials: "include", // Important to include cookies
      });

      // Check if login was successful
      if (response.ok) {
        const cookies = response.headers.get("set-cookie");
        console.log("Login successful. Cookies:", cookies);

        // Use these cookies for authenticated requests
        return cookies;
      } else {
        throw new Error("Login failed. Check credentials or login status.");
      }
    } catch (error) {
      console.error("Error logging into FPL:", error);
      return null;
    }
  }
})();

app.get("/competitions/PL/matches", async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const url = `https://api.football-data.org/v4/competitions/PL/matches`;
    const response = await axios.get(url, {
      headers: { "X-Auth-Token": "05df0744425f406897f4c9ed949bb77f" },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Football Data API Error:", error.message);
    res.status(500).send(error.message);
  }
});
app.get("/api/:endpoint", async (req, res) => {
  try {
    const endpoint = req.params.endpoint.split("*").join("/");
    const response = await axios.get(
      `https://fantasy.premierleague.com/api/${endpoint}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/api/event/:endpoint", async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const response = await axios.get(
      `https://fantasy.premierleague.com/api/event/${endpoint}/live`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/apis/:endpoint", async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const response = await axios.get(
      `https://fantasy.premierleague.com/api/my-team/${endpoint}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/footballApi/:endpoint", async (req, res) => {
  try {
    let endpoint = req.params.endpoint.split("-").join("/");

    const response = await axios.get(
      `https://api.football-data.org/v4/${endpoint}?season=2024&matchday=7`,
      {
        headers: { "X-Auth-Token": "05df0744425f406897f4c9ed949bb77f" },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/headTohead/:endpoint", async (req, res) => {
  try {
    let endpoint = req.params.endpoint;

    const response = await axios.get(
      `https://api.football-data.org/v4/matches/${endpoint}/head2head?limit=5&competitions=PL`,
      {
        headers: { "X-Auth-Token": "05df0744425f406897f4c9ed949bb77f" },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/getMatches/:endpoint", async (req, res) => {
  try {
    let endpoint = req.params.endpoint;

    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/PL/matches?matchday=${endpoint}`,
      {
        headers: { "X-Auth-Token": "05df0744425f406897f4c9ed949bb77f" },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/odds", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.sportradar.com/soccer/trial/v4/en/seasons/sr%3Aseason%3A118689/schedules.json?api_key=CGy6lYEVU9aZdjt7TBx9312PBojz21s7GUljVVaj`,
      { headers: { accept: "application/json" } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send("ddd");
  }
});
app.get("/getFixtures/:endpoint", async (req, res) => {
  try {
    let endpoint = req.params.endpoint;

    const response = await axios.get(
      `https://fantasy.premierleague.com/api/fixtures/?event=${endpoint}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send("ddd");
  }
});

https: app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
