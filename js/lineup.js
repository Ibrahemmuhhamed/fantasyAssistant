let teams = [];
let teamPlayersData = [];
const teamId = 5510390;
let formation = {};
let currGw;
let fblplayersData;
let players;
const lineupDiv = document.querySelector(".lineup");
const gameWeekControler = document.querySelector(".curr--gw");
const gameWeeksLabels = gameWeekControler.querySelector(".options div");
const pointsExplainDiv = document.querySelector(".points--explain");
const overlay = document.querySelector(".overlay");
const livePoints = document.querySelector("#livePoints");
const loading = document.querySelector(".loading");

overlay.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) {
    overlay.classList.remove("active");
  }
});
const teamsObj = {
  1: "Arsenal",
  2: "Aston Villa",
  3: "Bournemouth",
  4: "Brentford",
  5: "Brighton",
  6: "Chelsea",
  7: "Crystal Palace",
  8: "Everton",
  9: "Fulham",
  10: "Ipswich",
  11: "Leicester",
  12: "Liverpool",
  13: "Man City",
  14: "Man Utd",
  15: "Newcastle",
  16: "Nott'm Forest",
  17: "Southampton",
  18: "Spurs",
  19: "West Ham",
  20: "Wolves",
};
const teamsCode = {
  1: 3,
  2: 7,
  3: 91,
  4: 94,
  5: 36,
  6: 8,
  7: 31,
  8: 11,
  9: 54,
  10: 40,
  11: 13,
  12: 14,
  13: 43,
  14: 1,
  15: 4,
  16: 17,
  17: 20,
  18: 6,
  19: 21,
  20: 39,
};
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
console.log(weekdays[new Date("2024-09-15T11:30:00Z").getDay()]);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currGwDiv = document.querySelector("#gw--num");
gameWeekControler.addEventListener("click", () => {
  gameWeekControler.classList.toggle("active");
});
console.log(teams);
async function getUserPicks(gw, userID) {
  try {
    const response = await fetch(
      "https://graphql-fpl-api-633a953946bc.herokuapp.com/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          query MyQuery($userID: Int!, $gw: Int!) {
            manager(id: $userID) {
              squad(gwId: $gw) {
                active_chip
                picks {
                  is_captain
                  is_vice_captain
                  multiplier
                  position
                  element {
                    id
                    web_name
                    event_points
                    upcoming_fixtures(gw: $gw) {
                      started
                        finished
                    }
                    team {
                      code
                    }
                       element_type {
            id
            plural_name_short
          }
                  }
                }
              }
            }
          }
        `,
          variables: {
            userID,
            gw,
          },
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}
async function getData() {
  const req = await fetch(
    "https://graphql-fpl-api-633a953946bc.herokuapp.com/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
         query MyQuery {
  gameweek(is_current: true) {
    id
    finished
  }
  manager(id: ${teamId}) {
    started_event
    name
    player_first_name
    player_last_name
    current_event
    history {
      current {
        overall_rank
        points
        event
        total_points
        rank
        value
      }
    }
  }
} `,
      }),
    }
  );
  const data = await req.json();
  currGw = data.data.gameweek.id;
  getFixture(currGw);
  console.log(data);
  displayLineUpDetails(data.data);
}
function displayLineUpDetails(data) {
  displayLineUp(currGw);

  currGwDiv.innerHTML = currGw;
  console.log(currGw);
  const managerStartgw = data.manager.started_event;

  const pastGws = data.manager.history.current;
  const managerName = document.querySelector("#managerName");
  managerName.innerHTML = data.manager.name;
  displayActiveGwData(pastGws, currGw - managerStartgw);
  createGwLabels(currGw - managerStartgw + 1, currGw, pastGws);
}
function displayActiveGwData(managerHistory, activeGw) {
  const livePointsVal = managerHistory[activeGw]["points"];
  livePoints.innerHTML = livePointsVal;

  const overallPoints = document.querySelector("#overallPoints");
  const overallPointsVal = managerHistory[activeGw]["total_points"];
  overallPoints.innerHTML = overallPointsVal;

  const gwRank = document.querySelector("#gwRank");
  const gwRankVal = managerHistory[activeGw]["rank"];
  gwRank.innerHTML = gwRankVal ? gwRankVal.toLocaleString() : "-";

  const value = document.querySelector("#value");
  const valueVal = managerHistory[activeGw]["value"];
  value.innerHTML = (valueVal / 10).toFixed(1);

  const overallRank = document.querySelector("#overallRank");
  const overallRankVal = managerHistory[activeGw]["overall_rank"];
  overallRank.innerHTML = overallRankVal
    ? overallRankVal.toLocaleString()
    : "-";

  if (activeGw != 0) {
    const lastLivePointsVal = managerHistory[activeGw - 1]["points"];
    const lastOverallPointsVal = managerHistory[activeGw - 1]["total_points"];
    const lastGwRankVal = managerHistory[activeGw - 1]["rank"];
    const lastValueVal = managerHistory[activeGw - 1]["value"];
    const lastOverallRankVal = managerHistory[activeGw - 1]["overall_rank"];
    // Check the status
    if (overallRankVal < lastOverallRankVal) {
      console.log(livePointsVal);
      overallRank.classList.add("up"); // Add a class to indicate an increase
      overallRank.classList.remove("down"); // Add a class to indicate an increase
    } else {
      overallRank.classList.remove("up"); // Add a class to indicate an increase
      overallRank.classList.add("down"); // Add a class to indicate a decrease
    }
    if (valueVal > lastValueVal) {
      value.classList.add("up"); // Add a class to indicate an increase
      value.classList.remove("down"); // Add a class to indicate an increase
    } else {
      value.classList.remove("up"); // Add a class to indicate an increase
      value.classList.add("down"); // Add a class to indicate a decrease
    }
  } else {
    const updivs = document.querySelectorAll(".gw--form .up");
    updivs.forEach((c) => {
      c.classList.remove("up");
    });
    const downdivs = document.querySelectorAll(".gw--form .down");
    console.log(downdivs);
    downdivs.forEach((d) => {
      d.classList.remove("down");
    });
  }
}
function createGwLabels(maxCurrGw, currGw, managerHistory) {
  console.log(currGw);
  for (let i = 0; i < maxCurrGw; i++) {
    const div = document.createElement("div");
    div.innerHTML = currGw - i;

    if (i == currGw) {
      gameWeekControler.classList.add("activeGw");
    }
    gameWeeksLabels.append(div);
    div.addEventListener("click", () => {
      const targetGw = maxCurrGw - i - 1;

      displayActiveGwData(managerHistory, targetGw);
      displayLineUp(targetGw + 1);
      currGwDiv.innerHTML = targetGw + 1;
    });
  }
}
async function getPlayersDateinGw(gw) {
  const req = await fetch(
    `https://fantasyassistant-production.up.railway.app/api/event/${gw}`
  );
  const data = await req.json();
  return data;
}
// fetchData();
async function displayLineUp(gw) {
  formation = {};
  const teamData = await getUserPicks(gw, teamId);
  const playersData = (await getPlayersDateinGw(gw))["elements"];
  console.log(playersData);
  const team = teamData["data"]["manager"]["squad"].picks;
  let lineupHTML = "";
  const subDiv = document.querySelector(".subs");
  subDiv.innerHTML = "";
  lineupDiv.innerHTML = "";
  let livePointsAdded = 0;
  for (let y = 0; y < team.length; y++) {
    const player = team[y];
    console.log(player);

    const isStarted = player.element.upcoming_fixtures[0]
      ? player.element.upcoming_fixtures[0].started
      : true;
    const isFinished = player.element.upcoming_fixtures[0]
      ? player.element.upcoming_fixtures[0].finished
      : "";
    const isLive = player.element.upcoming_fixtures[0]
      ? !isFinished && isStarted
      : false;
    console.log(player);

    const id = player.element.id;
    const playerposition = player.element.element_type;
    const position = player.position;
    const playerDiv = document.createElement("div");

    playerDiv.classList.add("player");
    const name = player["element"]["web_name"];
    const playerstats = playersData[id - 1].stats;
    const points = playerstats["total_points"];
    const playerPoints = points * player.multiplier;
    if (isLive) {
      playerDiv.classList.add("live");
      livePointsAdded += playerPoints;
    }
    playerDiv.innerHTML = `<img src="https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${
      position == 1 || position == 12
        ? team[y]["element"]["team"]["code"] + "_1"
        : team[y]["element"]["team"]["code"]
    }-110.webp" alt="" srcset="">
              <h2 class="player--name">${name}</h2>
              <h3 class="player--points">${
                isStarted ? playerPoints : "-"
              }</h3>`;

    playerDiv.style.gridArea = playerposition["plural_name_short"] + (y + 1);
    if (position <= 11) {
      if (formation[playerposition.plural_name_short]) {
        formation[playerposition["plural_name_short"]] += 1;
      } else {
        formation[playerposition["plural_name_short"]] = 1;
      }
    }

    if (position > 11) {
      subDiv.appendChild(playerDiv);
      continue;
    }
    lineupDiv.appendChild(playerDiv);

    playerDiv.addEventListener("click", () => {
      const explain = playersData[id - 1].explain;
      const playerMatchStats = explain[0].stats;
      overlay.classList.add("active");
      pointsExplainDiv.classList.add("active--child");
      pointsExplainDiv.innerHTML = `   <h2 class="name">${name}</h2>
           <ul class="head">
              <li>Statistic</li>
              <li>Value</li>
              <li>Points</li>
            </ul>`;
      playerMatchStats.forEach((stats) => {
        console.log(stats);
        const ul = document.createElement("ul");
        ul.classList.add("pl-stats");
        ul.innerHTML = `
              <li>${stats.identifier}</li>
              <li>${stats.value}</li>
              <li>${stats.points}</li>
            `;
        pointsExplainDiv.appendChild(ul);
      });
      console.log(playerMatchStats);
      console.log(explain);
    });
  }

  console.log((lineupDiv.style.gridTemplateAreas = createGridArea(formation)));

  livePointsAdded !== 0
    ? (livePoints.innerHTML += `<span>+${livePointsAdded}</span>`)
    : "";
}
async function dd() {
  const req = await fetch("./js/s.json");
  const data = await req.json();
}
dd();
function createGridArea(formation) {
  const array = [
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
  ];
  // const playesDiv = document
  const formationArray = Object.values(formation);
  let x = 0;
  let ss = 1;
  for (const [pos, val] of Object.entries(formation)) {
    for (let y = 0; y < val; y++) {
      array[x][5 - val + y * 2] = pos + ss;
      array[x][5 - val + 1 + y * 2] = pos + ss;
      ss++;
    }
    array[x] = array[x].join(" ");
    x++;
  }
  array;
  console.log();
  // 1 ==> 4
  // 2 ==> 3
  // 3 ==> 2
  // 4 ==> 1
  // 5 ==> 0
  return '"' + array.join(`" "`) + '"';
}
async function getFixture() {
  console.log(currGw);
  const req = await fetch(
    `https://fantasyassistant-production.up.railway.app/getFixtures/${currGw}`
  );
  const data = await req.json();
  console.log(data);
  // console.log(data);
  displayFixture(data);
  // console.log(data);
}
function displayFixture(fixtures) {
  let lastMatchDate = new Date(fixtures[0].kickoff_time);
  let lastMatchDay = lastMatchDate.getDay();
  let dayMatchesList = document.createElement("ul");
  let dayFormat =
    weekdays[lastMatchDay] +
    " " +
    lastMatchDate.getDate() +
    " " +
    months[lastMatchDate.getMonth()] +
    " " +
    lastMatchDate.getFullYear();
  dayMatchesList.innerHTML = `<li class="data">${dayFormat}</li>`;
  const fixturesContainer = document.querySelector(".fixtures--container");
  fixturesContainer.appendChild(dayMatchesList);
  function displayMatch(match) {
    const kickoff_time = new Date(match.kickoff_time);
    const kickoff_day = new Date(match.kickoff_time).getDay();
    const matchHour = kickoff_time.getHours();
    const startedMinutes = kickoff_time.getMinutes();
    const formatedTime =
      matchHour + ":" + startedMinutes.toString().padEnd(2, "0");
    const li = document.createElement("li");
    if (match.started) {
      li.classList.add("started");
      li.addEventListener("click", () => {
        const activeli = document.querySelector("li.match.active");
        console.log(activeli);
        li.classList.toggle("active");

        if (activeli) {
          activeli.classList.remove("active");
        }

        console.log(li);
      });
    }
    li.innerHTML = `
   <div class="stats--container"> <div class="match--stats">${displayMatchStats(
     match.stats
   )}</div></div>
                
                <div class="home--team">
                  <img src="https://resources.premierleague.com/premierleague/badges/70/t${
                    teamsCode[match.team_h]
                  }.png" alt="" srcset="">
                  <h3>${teamsObj[match.team_h]}</h3>
                </div>
                <div class="result">${
                  match.started
                    ? `<span>${match.team_h_score}</span> <span>${match.team_a_score}</span>`
                    : formatedTime
                }</div>
                <div class="away--team">
                  <img src="https://resources.premierleague.com/premierleague/badges/70/t${
                    teamsCode[match.team_a]
                  }.png" alt="" srcset="">
                  <h3>${teamsObj[match.team_a]}</h3>
                </div>
              `;
    li.classList.add(
      `${match.started && !match.finished_provisional ? "current" : "notLive"}`
    );

    console.log(match.finished);

    if (kickoff_day !== lastMatchDay) {
      console.log("Day Changed from ", lastMatchDay + " to " + kickoff_day);
      dayMatchesList = document.createElement("ul");
      lastMatchDate = new Date(match.kickoff_time);
      let dayFormat =
        weekdays[lastMatchDate.getDay()] +
        " " +
        lastMatchDate.getDate() +
        " " +
        months[lastMatchDate.getMonth()] +
        " " +
        lastMatchDate.getFullYear();
      dayMatchesList.innerHTML = `<li class="data">${dayFormat} </li>`;
      fixturesContainer.appendChild(dayMatchesList);
      li.classList.add("match");
      dayMatchesList.appendChild(li);
      lastMatchDay = kickoff_day;
    } else {
      li.classList.add("match");
      dayMatchesList.appendChild(li);
    }
  }
  function displayMatchStats(stats) {
    console.log(stats);
    const div = document.createElement("div");
    for (let i = 0; i < stats.length; i++) {
      if (!stats[i].a.length && !stats[i].h.length) {
        continue;
      }
      const statsDiv = document.createElement("div");
      statsDiv.classList.add("stats--info");
      statsDiv.innerHTML = `<h2>${stats[i].identifier}</h2>
      <div><div class="h"></div><div class="a"></div></div>`;
      div.appendChild(statsDiv);

      for (let u = 0; u < stats[i].a.length; u++) {
        const statsContainer = statsDiv.querySelector(".a");
        const li = document.createElement("li");
        li.innerHTML = `${
          players[stats[i].a[u].element] + " (" + stats[i].a[u].value + ")"
        }`;
        statsContainer.appendChild(li);
      }
      for (let y = 0; y < stats[i].h.length; y++) {
        const statsContainer = statsDiv.querySelector(".h");
        const li = document.createElement("li");
        li.innerHTML = `${
          players[stats[i].h[y].element] + " (" + stats[i].h[y].value + ")"
        }`;
        statsContainer.appendChild(li);
      }
    }

    return div.innerHTML;
  }
  for (let i = 0; i < fixtures.length; i++) {
    const match = fixtures[i];
    console.log(match);
    displayMatch(match);
  }
}

getPlayersCode()
  .then(getData())
  .then()
  .then(() => {
    setTimeout(() => {
      loading.classList.remove("active");
    }, 1000);
  });
async function getStats() {
  const req = await fetch("js/stats.json");
  const data = await req.json();
  return data;
}
async function getPlayersCode() {
  const req = await fetch("js/players.json");
  players = await req.json();
}
