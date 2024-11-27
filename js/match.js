const fixtureId = window.location.href.split("?")[1];
const matchInfoDiv = document.querySelector(".match--info ");
const lastHomeDiv = document.querySelector(".h-team--form .matches");
const lastAwayDiv = document.querySelector(".a-team--form .matches");
const matchEventsDiv = document.querySelector(".match--events div");
const showAllEventsBtn = document.querySelector("#showEvents");
const lineUpBtn = document.querySelector(".lineupBtn");
let league;
lineUpBtn.addEventListener("click", () => {
  window.scrollTo(0, 0);
  if (lineUpBtn.classList.contains("disable")) return;
  lineUpBtn.classList.toggle("active");
});
const h2hObj = {};
let homeTeam, awayTeam;
const monthsAbbr = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const daysAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const loading = document.querySelector(".loading");
if (fixtureId) {
  getFixturebyId(fixtureId)
    .then(async (match) => {
      renderFixtureHeading(match);
      document.title =
        homeTeam.name +
        " v " +
        awayTeam.name +
        " | " +
        formatDate(new Date(match.fixture.date));
      league = await getLeague(match.league.id, match.league.season);
      if (match.fixture.status.short == "NS") {
        console.log(await getPreMatchOdd(fixtureId));
      }
      if (match.lineups.length !== 0) {
        displayLineUp(match.lineups);
      }
      if (league.seasons[0].coverage.standings) {
        console.log(match);
        console.log("dd");
        homeTeam["Standing"] = await getTablePostion(
          homeTeam.id,
          match.league.id
        );
        console.log(homeTeam);
        awayTeam["Standing"] = await getTablePostion(
          awayTeam.id,
          match.league.id
        );
      } else {
        document.querySelector(".live--table").style.display = "none";
      }
      return match;
    })
    .then((match) => {
      getLastH2hMatches();
      if (league.seasons[0].coverage.standings) {
        displayTable();
      }
    })
    .then(() => {
      setTimeout(() => {
        loading.classList.remove("active");
      }, 1000);
    });
}
async function getFixturebyId(id) {
  const req = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${id}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
        "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
      },
    }
  );
  const data = await req.json();
  console.log(data);
  return data.response[0];
}
async function getLastMatches(teamId, teamAbr, teamObj) {
  const req = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/fixtures?&season=2024&team=${teamId}&last=5`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
        "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
      },
    }
  );
  const data = await req.json();
  const matches = data.response;
  matches.forEach((match) => {
    displayFormMatch(match, teamAbr, teamObj);
  });
  console.log(data);
}
async function getPreMatchOdd(fixtureId) {
  const req = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/odds?fixture=${fixtureId}&bookmaker=11&bet=1`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
        "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
      },
    }
  );
  const data = await req.json();
  displayOdd(data.response[0].bookmakers[0].bets[0].values);
  return data.response[0].bookmakers[0].bets[0].values;
}
function displayOdd(odds) {
  const containerDiv = document.querySelector(".right");
  const oddsDiv = document.createElement("div");
  oddsDiv.classList.add("odds");
  oddsDiv.innerHTML = "<h2>Winning property</h2>";
  const oddsBarDiv = document.createElement("div");
  oddsBarDiv.classList.add("odds--bar");
  oddsDiv.appendChild(oddsBarDiv);
  for (let i = 0; i < odds.length; i++) {
    let { odd, value } = odds[i];
    odd = Math.floor((1 / odd) * 100) + "%";
    const div = document.createElement("div");
    div.classList.add(value);
    div.innerHTML = odd;
    div.style.width = odd;
    oddsBarDiv.appendChild(div);
  }
  containerDiv.appendChild(oddsDiv);
}
function renderFixtureHeading(match) {
  homeTeam = match.teams.home;
  console.log(homeTeam);
  awayTeam = match.teams.away;
  document.querySelector(".h-team--form .name").innerHTML = homeTeam.name;
  document.querySelector(".a-team--form .name").innerHTML = awayTeam.name;
  getLastMatches(homeTeam.id, "h", homeTeam);
  getLastMatches(awayTeam.id, "a", awayTeam);
  if (match.fixture.status.short == "NS") {
    matchEventsDiv.style.display = "none";
    showAllEventsBtn.style.display = "none";
    const date = new Date(match.fixture.date);
    const dateFormat = formatDate(date);
    const timeFormat =
      date.getHours().toString().padEnd(2, 0) +
      ":" +
      date.getMinutes().toString().padEnd(2, 0);
    console.log(match);
    matchInfoDiv.innerHTML = `
            <p class="league">
              <img src="${match.league.logo}" alt="">${match.league.name}
            </p>
            <div class="teams">
              <div class="h--team">
                <img src="${homeTeam.logo}" alt="">
                <p>${homeTeam.name}</p>
              </div>
              <div class="info">
                <p class="time">${dateFormat}</p>
                <p class="clock">${timeFormat}</p>
              </div>
              <div class="a--team">
                <img src="${awayTeam.logo}" alt="">
                <p>${awayTeam.name}</p>
              </div>
            </div>
          `;
  } else {
    displayEvents(match.events);
    matchInfoDiv.innerHTML = `
            <p class="league">
              <img src="${match.league.logo}" alt="">${match.league.name}
            </p>
            <div class="teams">
              <div class="h--team">
                <img src="${homeTeam.logo}" alt="">
                <p>${homeTeam.name}</p>
              </div>
              <div class="info">
                <p class="score"><span>${match.goals.home}</span> - <span>${
      match.goals.away
    }</span></p>
                <p class="clock">${
                  match.fixture.status.short !== "FT"
                    ? `<span class="live">Live</span> ${match.fixture.status.elapsed}'`
                    : "Full Time"
                }</p>
              </div>
              <div class="a--team">
                <img src="${awayTeam.logo}" alt="">
                <p>${awayTeam.name}</p>
              </div>
            </div>
          `;
  }
}
function displayFormMatch(match, team, teamObj) {
  console.log(match);
  const container = document.querySelector(`.${team}-team--form .matches`);
  const div = document.createElement("a");
  div.href = `./match.html?${match.fixture.id}`;
  div.classList.add("match");

  const teams = Object.values(match.teams);
  teams.forEach((team) => {
    if (teamObj.id == team.id) {
      if (team.winner == true) {
        div.classList.add("win");
      } else if (team.winner == false) {
        div.classList.add("lose");
      } else {
        div.classList.add("drow");
      }
    }
  });

  div.innerHTML = `
                        <div class="home--team">
                          <span class="score">${match.goals.home}</span>
                          <img src="${match.teams.home.logo}" alt="" srcset="">
                        </div>
                        <span>-</span>
                        <div class="away--team">
                          <span class="score">${match.goals.away}</span>
                          <img src="${match.teams.away.logo}" alt="" srcset="">
                        </div>
                      `;
  container.appendChild(div);
}
function displayEvents(events) {
  console.log(events);
  matchEventsDiv.style.setProperty("--x", events.length);
  showAllEventsBtn.addEventListener("click", () => {
    if (!matchEventsDiv.classList.contains("showen")) {
      matchEventsDiv.classList.add("showen");
      matchEventsDiv.style.setProperty("--length", events.length);
      showAllEventsBtn.innerHTML = "Show Less Events";
    } else {
      matchEventsDiv.classList.remove("showen");

      matchEventsDiv.style.setProperty("--length", 5);
      showAllEventsBtn.innerHTML = "Show All Events";
    }
  });
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    console.log(event);
    const teamEventId = event.team.id;
    const div = document.createElement("div");
    const p = document.createElement("p");
    p.classList.add("time");
    p.innerText = event.time.elapsed + "'";
    p.style.gridRow = i + 1;
    matchEventsDiv.appendChild(p);
    div.innerHTML = `
              <div>
                ${event.player.name ? `<p>${event.player.name}</p>` : ""}
                ${event.assist.name ? `<p>${event.assist.name}</p>` : ""}
              </div>
              <img src="./images/${
                event.type == "Card"
                  ? event.detail == "Red Card"
                    ? "Red Card"
                    : "Yellow Card"
                  : event.type
              }.svg" alt="" srcset="">
            `;
    div.classList.add("event");
    div.style.gridRow = i + 1;

    if (teamEventId == homeTeam.id) {
      div.classList.add("home");
    } else {
      div.classList.add("away");
    }
    matchEventsDiv.appendChild(div);
  }
}
async function getLastH2hMatches() {
  const req = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/fixtures/headtohead?h2h=${homeTeam.id}-${awayTeam.id}&last=5`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
        "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
      },
    }
  );
  const data = await req.json();
  h2hObj.draw = data.response.length;
  displayH2hMatches(data.response);
  console.log(data);
}
function formatDate(date) {
  return (
    daysAbbr[date.getDay()] +
    " " +
    date.getDate().toString().padStart(2, 0) +
    "," +
    monthsAbbr[date.getMonth()]
  );
}

function displayH2hMatches(matches) {
  const h2hMatchesContainer = document.querySelector(".h2h--matches");
  h2hMatchesContainer.innerHTML = "";
  matches.forEach((match) => {
    console.log(match);
    console.log();
    for (const [teamType, obj] of Object.entries(match.teams)) {
      if (obj.winner) {
        h2hObj.draw = h2hObj.draw - 1;
        if (h2hObj[obj.name]) {
          h2hObj[obj.name] = {
            type: teamType,
            win: h2hObj[obj.name]["win"] + 1,
          };
        } else {
          h2hObj[obj.name] = {
            type: teamType,
            win: 1,
          };
        }
        continue;
      }
    }

    const a = document.createElement("a");
    console.log(match.teams.away.winner);
    a.href = `./match.html?${match.fixture.id}`;
    a.classList.add("match");
    a.innerHTML = `
                      <p class="date">${formatDate(
                        new Date(match.fixture.date)
                      )}</p>
                      <div>
                        <p class="h--team ${
                          match.teams.home.winner ? "winner" : ""
                        }">${match.teams.home.name}</p>
                        <p class="result">
                          <span class="home--score">${
                            match.goals.home
                          }</span>-<span class="away--score ">${
      match.goals.away
    }</span>
                        </p>
                        <p class="a--team ${
                          match.teams.away.winner ? "winner" : ""
                        }">${match.teams.away.name}</p>
                      </div>
                   `;
    h2hMatchesContainer.appendChild(a);
  });
  console.log();

  const homeTeamDiv = document.querySelector(".h2h .teams .h--team");
  homeTeamDiv.innerHTML = `
                      <img src=${homeTeam.logo} alt="">
                      <p>${homeTeam.name}</p>
                    `;
  const awayTeamDiv = document.querySelector(".h2h .teams .a--team");
  awayTeamDiv.innerHTML = `
                      <img src=${awayTeam.logo} alt="">
                      <p>${awayTeam.name}</p>
                    `;

  // Add H2H Stats On the page
  h2hObj;
  console.log(h2hObj);
  document.querySelector(".home--win .num").innerHTML = h2hObj[homeTeam.name]
    ? h2hObj[homeTeam.name].win
    : 0;
  document.querySelector(".away--win .num").innerHTML = h2hObj[awayTeam.name]
    ? h2hObj[awayTeam.name].win
    : 0;
  document.querySelector(".drow .num").innerHTML = h2hObj.draw;
  // ----------------------------
}
async function getTablePostion(id, leagueId) {
  const req = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/standings?league=${leagueId}&season=2024&team=${id}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
        "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
      },
    }
  );
  const data = await req.json();
  return data.response[0].league.standings[0][0];
}
function displayLineUp(lineupsArr) {
  lineUpBtn.classList.remove("disable");
  const lineupTeamsDiv = document.querySelector(".lineup--teams");
  const lineupDiv = document.querySelector(".players");
  lineupDiv.innerHTML = "";
  lineupTeamsDiv.innerHTML = `   <p class="active">${homeTeam.name}</p>
              <p>${awayTeam.name}</p>`;
  const lineupTeamsArray = Array.from(lineupTeamsDiv.children);
  const lineUpBounding = lineupDiv.getBoundingClientRect();
  console.log(lineUpBounding);
  lineupTeamsArray.forEach((child, i) => {
    handleDisplay(lineupsArr[i], i);
    child.addEventListener("click", () => {
      console.log();
      const teamsLineUps = document.querySelectorAll(".players > div");
      teamsLineUps.forEach((ele, ind) => {
        if (ind == i) {
          ele.classList.add("active");
        } else {
          ele.classList.remove("active");
        }
      });
      lineupTeamsArray.forEach((p, x) => {
        if (i == x) {
          if (p.classList.contains("active")) return;
          lineUpBtn.classList.remove("active");
          lineUpBtn.classList.add("active");
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });
    });
  });
  const playersArray = document.querySelectorAll(".players .player");
  playersArray.forEach((player, i) => {
    const playerBounding = player.getBoundingClientRect();
    const xPos =
      i < 11 ? lineUpBounding.width / 4 : (lineUpBounding.width / 4) * 3;
    player.style.setProperty(
      "--x",
      -playerBounding.x + lineUpBounding.x + xPos + "px"
    );
    player.style.setProperty(
      "--y",
      -playerBounding.bottom +
        lineUpBounding.bottom +
        playerBounding.height +
        "px"
    );
  });

  function handleDisplay(lineUp, indx) {
    const lineUpTeam = document.createElement("div");
    lineUpTeam.classList.add(indx == 0 ? "homeTeam" : "awayTeam");
    let team;
    if (indx == 0) {
      team = homeTeam;
      lineUpTeam.classList.add("active");
    } else {
      team = awayTeam;
    }

    let formationArray = ("1-" + lineUp.formation).split("-");
    formationArray.length == 2 ? (formationArray = [1, 4, 4, 2]) : "";
    console.log(formationArray);
    let y = 0;
    for (let i = 0; i < formationArray.length; i++) {
      const div = document.createElement("div");
      const num = +formationArray[i];
      for (let x = 0; x < num; x++) {
        const player = document.createElement("div");
        player.style.setProperty("--x", y);

        player.classList.add("player");
        player.innerHTML = `<div rating = "${lineUp.startXI[y].player}">
                    <img src="${team.logo}" alt=""> </div>
                    <p class="name">${lineUp.startXI[y].player.name}</p>
                  `;
        y++;
        div.appendChild(player);

        lineUpTeam.appendChild(div);
      }
      lineupDiv.appendChild(lineUpTeam);
    }
  }

  // console.log(lineupGrid);
  console.log(lineupsArr);
}
function displayTable() {
  const table = document.querySelector(".live--table");
  const homeDiv = document.createElement("ul");
  homeDiv.classList.add("team");
  homeDiv.innerHTML = `
                  <li class="team--title">
                    <span class="rank--num">${homeTeam.Standing.rank}</span>
                    <img class="team--logo" src="${homeTeam.logo}" alt="">
                  </li>
                  <li>${homeTeam.Standing.all.played}</li>
                  <li>${homeTeam.Standing.all.win}</li>
                  <li>${homeTeam.Standing.all.draw}</li>
                  <li>${homeTeam.Standing.all.lose}</li>
                <li>${homeTeam.Standing.goalsDiff}</li>
                 <li>${homeTeam.Standing.points}</li>
                `;
  // -----------------------------
  const awayDiv = document.createElement("ul");
  awayDiv.classList.add("team");
  awayDiv.innerHTML = `
                  <li class="team--title">
                    <span class="rank--num">${awayTeam.Standing.rank}</span>
                    <img class="team--logo" src="${awayTeam.logo}" alt="">
                  </li>
                  <li>${awayTeam.Standing.all.played}</li>
                  <li>${awayTeam.Standing.all.win}</li>
                  <li>${awayTeam.Standing.all.draw}</li>
                  <li>${awayTeam.Standing.all.lose}</li>
                <li>${awayTeam.Standing.goalsDiff}</li>
                 <li>${awayTeam.Standing.points}</li>
                `;
  if (homeTeam.Standing.rank < awayTeam.Standing.rank) {
    table.appendChild(homeDiv);
    table.appendChild(awayDiv);
  } else {
    table.appendChild(awayDiv);
    table.appendChild(homeDiv);
  }
}
async function getLeague(id, season) {
  const req = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/leagues?id=${id}&season=${season}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
        "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
      },
    }
  );
  const data = await req.json();
  return data.response[0];
}
