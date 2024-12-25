// import { getUserId } from "./main.js";

let userId;
import { promise } from "./main.js";

promise.then((userid) => {
  userId = userid;
  fixtures()
    .then(getFplData())
    .then(() => {
      getUserData(userId);
    })
    .then(() => {
      setTimeout(() => {
        loading.classList.remove("active");
      }, 200);
    });
});

const playerIds = [];
const playerPoints = {};
let nextGWDeadLine;
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
let teamTotalPoints = 0;
let currIsFinshed = false;
document.body.scrollTo(0, 0);
const loading = document.querySelector(".loading");
const mvpLoading = document.querySelector(".my--mvp .content--loading");
const queries = {
  getPlayerByid: function (id) {
    return ` query MyQuery {
  player(id: ${id}) {
    photo
    total_points
    goals_scored
    assists
    bonus
    minutes
    now_cost
    first_name
    second_name
    starts
    cost_change_start
  }
}
  `;
  },
  getUserPicks: function (userId, gw) {
    return `query MyQuery {
  manager(id: ${userId}) {
    squad(gwId: ${gw}) {
      picks {
        position
        multiplier
        element {
          id
          web_name
          team {
            code
          }
            element_type {
      id
    }
          photo
        }
      }
    }
    started_event
  }
}`;
  },
  getUserTeamInfo: function (userID) {
    return `query MyQuery {
    manager(id: ${userID}) {
    name
    history {
      current {
        total_points
        overall_rank
        points
      }
      chips {
        event
        name
      }
    }
  }}`;
  },
  getCurrGw: function () {
    return `query MyQuery {
  gameweek(is_current: true) {
    id
     finished
  }
}`;
  },
  getNextFixures: function (gw) {
    return `query MyQuery {
  
  fixtures(gw: ${gw} , finished: false) {
   finished_provisional
      team_h {
      code
      name
       short_name
    }
    team_a {
      code
      name
       short_name
    }
    kickoff_time
  }
}`;
  },
};
fetch(
  "https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&season=2024&next=50&round=Regular%20Season%20-%206",
  {
    method: "GET",
    headers: {
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
      "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
    },
  }
)
  .then(async (response) => {
    const data = await response.json();
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

let gwArr = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
];
let players = [];
let userMVP;
let currGW = 1;
let gameWeeks = [];
const positionPoints = [0, 0, 0, 0];
const stadiums = {
  18: "Tottenham Hotspur Stadium", // Spurs (TOT)
  12: "Anfield", // Liverpool (LIV)
  13: "Etihad Stadium", // Man City (MCI)
  1: "Emirates Stadium", // Arsenal (ARS)
  15: "St. James' Park", // Newcastle (NEW)
  14: "Old Trafford", // Man Utd (MNU)
  19: "London Stadium", // West Ham (WHU)
  6: "Stamford Bridge", // Chelsea (CHE)
  2: "Villa Park", // Aston Villa (AVL)
  11: "King Power Stadium", // Leicester (LEI)
  3: "Vitality Stadium", // Bournemouth (BOU)
  9: "Craven Cottage", // Fulham (FUL)
  5: "The American Express Community Stadium", // Brighton (BRN)
  7: "Selhurst Park", // Crystal Palace (CRY)
  20: "Molineux Stadium", // Wolves (WOL)
  8: "Goodison Park", // Everton (EVE)
  16: "City Ground", // Nott'm Forest (FOR)
  5: "The Amex Stadium", // Brighton (BHA)
  21: "The Hawthorns", // West Bromwich Albion (WBA)
  22: "Bramall Lane", // Sheffield United (SHU)
  23: "Turf Moor", // Burnley (BUR)
  24: "White Hart Lane", // Former Tottenham stadium (WHT)
  25: "Liberty Stadium", // Swansea City (SWA)
  26: "KC Stadium", // Hull City (HUL)
  27: "Riverside Stadium", // Middlesbrough (MID)
  17: "St. Mary's Stadium", // Southampton (SOU)
  28: "Carrow Road", // Norwich City (NOR)
  2: "Villa Park", // Aston Villa (AST)
};

async function getData(query) {
  try {
    // https://graphql-fpl-api-633a953946bc.herokuapp.com/graphql
    const response = await fetch(
      "https://graphql-fpl-api-633a953946bc.herokuapp.com/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
        }),
      }
    );

    const data = await response.json();
    // loading.classList.remove("active");

    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}
async function getFplData() {
  //
  const req = await fetch(
    "https://fantasyassistant-production.up.railway.app/api/bootstrap-static"
  );
  const data = await req.json();
  nextGWDeadLine = new Date(data.events[currGW].deadline_time);
  if (nextGWDeadLine) {
    calcWeekDeadline(nextGWDeadLine);
  }
  console.log(nextGWDeadLine);
  console.log(data);
  gameWeeks = data.events;
  userMVP = await calcUserMVP();
  displayMVPData(data["elements"]);
  calcPointsPyPostion(data["elements"], playerIds, playerPoints);
}
async function fixtures() {
  await getData(queries.getCurrGw())
    .then((data) => {
      const gameweek = data.data.gameweek;
      currGW = gameweek.id;
      currIsFinshed = gameweek.finished;
      console.log(gameweek);
      console.log(currIsFinshed);
    })
    .then(async () => {
      const matches = await getMatchesApi();
      console.log(matches);
      const gwId = currIsFinshed ? currGW + 1 : currGW;
      const matchDiv = document.querySelector(".matches");
      let html = "";
      console.log(matchDiv);
      console.log(gwId);

      const req = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&season=2024&next=50&round=Regular%20Season%20-%20${gwId}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
            "x-rapidapi-key":
              "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
          },
        }
      );
      const NextFixures = (await req.json()).response;
      console.log(NextFixures);

      let matchCounter = 0;
      let notFinishedMatches = 0;

      for (let x = 0; x < NextFixures.length; x++) {
        const match_2 = matches[x];
        const match = NextFixures[x];
        console.log(match);
        console.log(match_2);

        // if (match.fixture.status.short === "FT") {
        //   continue;
        // }

        matchCounter++;
        if (matchCounter > 5) {
          break;
        }

        const date = new Date(match.fixture.date);
        const stadium = match.fixture.venue.name;

        const matchDate =
          date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0");
        console.log(matchDate);

        const div = document.createElement("a");
        div.href = `./match.html?` + match.fixture.id;
        div.innerHTML = `<div class="teams">
                    <img src="${match.teams.home.logo}" alt="${match.teams.home.name}">
                    <span>V</span>
                    <img src="${match.teams.away.logo}" alt="${match.teams.away.name}">
                  </div>
                  <div class="time">
                    <p class="hour">${matchDate}</p>
                    <p class="stidum">${stadium}</p>
                  </div>`;

        div.addEventListener("click", () => {
          console.log(match);
        });

        matchDiv.appendChild(div);
      }
    });
}

async function getPlayersDateinGw(gw) {
  const req = await fetch(
    `https://fantasyassistant-production.up.railway.app/api/event/${gw}`
  );
  const data = await req.json();
  return data;
}

async function getUserData(id) {
  const data = (await getData(queries.getUserTeamInfo(id))).data.manager;
  const history = data.history;
  console.log(history);
  const name = data.name;
  displayUserTeamInfo(history, name);

  displayUserChart(history);
}
async function calcUserMVP() {
  let gw = currGW;
  while (gw > 0) {
    const picks = (await getData(queries.getUserPicks(userId, gw))).data.manager
      .squad.picks;

    const playersDataPerGw = (await getPlayersDateinGw(gw)).elements;
    for (const ele of picks) {
      const id = ele.element.id;
      const playerStats = playersDataPerGw[id - 1]?.stats;
      const points = playerStats?.total_points ?? 0;
      const multiplier = ele.multiplier;
      const pos = ele.element.element_type.id - 1;
      positionPoints[pos] += points * multiplier;
      if (playerPoints[id]) {
        playerPoints[id] += points * multiplier;
      } else {
        playerPoints[id] = points * multiplier;
      }
    }

    gw--;
  }
  // const MVPPoints = Math.max(...Object.values(playerPoints));
  let maxPoints = 0;
  let mvpID = 0;

  for (const [keys, val] of Object.entries(playerPoints)) {
    if (maxPoints <= val) {
      maxPoints = val;
      mvpID = keys;
    }
  }
  return {
    id: mvpID,
    points: maxPoints,
  };
}
function displayUserTeamInfo(team, name) {
  const currStats = team.current[team.current.length - 1];

  console.log(name);
  const oldRank = team.current[team.current.length - 2]["overall_rank"];
  const chips = team.chips;
  chips.forEach((chip) => {
    if (chip.name == "3xc") chip.name = "tc";
    const chipDiv = document.querySelector(`#${chip.name}`);
    chipDiv.classList.add("active");
    const gw = chipDiv.querySelector(".gw");
    gw.innerHTML = "GW" + chip.event;
  });

  updateHeader(currStats, oldRank, name);
}
function updateHeader(team, old_rank, name) {
  console.log(name);
  const header = document.querySelector("header");
  const totalPoints = header.querySelector("#totalPoints");
  teamTotalPoints = team["total_points"];
  totalPoints ? (totalPoints.innerHTML = team["total_points"]) : "";
  const currRank = header.querySelector("#teamRank");
  currRank ? (currRank.innerHTML = team["overall_rank"].toLocaleString()) : "";
  const oldRank = header.querySelector("#old_rank");
  oldRank ? (oldRank.innerHTML = old_rank.toLocaleString()) : "";
  const nameDiv = header.querySelector("#teamName");
  if (team["overall_rank"] < old_rank) {
    currRank.classList.add("up");
  } else {
    currRank.classList.add("down");
  }
  nameDiv.innerHTML = name;
}

function displayUserChart(userGws) {
  const gameWeeks = userGws.current;
  const pointsData = [];
  const rankData = [];
  gameWeeks.forEach((gw) => {
    pointsData.push(gw.points);
    rankData.push(gw["overall_rank"]);
  });
  const ctx = document.getElementById("team--diagram");
  console.log(ctx);
  // ctx.height = "100%";

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: gwArr,
      datasets: [
        {
          label: "Points",
          data: pointsData,

          borderWidth: 2, // Thickness of the line
          borderColor: "#0bd888", // Custom green color for the line
          pointRadius: 5, // Size of the points
          pointBackgroundColor: "#1b1f24", // Color of the points
          fill: false, // Disable the fill under the line
        },
        {
          label: "Rank",
          data: rankData,
          borderWidth: 2, // Thickness of the line
          borderColor: "#0bd888", // Custom green color for the line
          pointRadius: 5, // Size of the points
          pointBackgroundColor: "#1b1f24", // Color of the points
          fill: false, // Disable the fill under the line
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "transparent", // Gridline color to match the dark theme
          },
          ticks: {
            color: "#ccc", // Y-axis label color
          },
        },
        x: {
          grid: {
            color: "transparent", // Gridline color for X-axis
          },
          ticks: {
            color: "#ccc", // X-axis label color
          },
        },
      },
      plugins: {
        customCanvasBackgroundColor: {
          color: "#1b1f24",
        },
        legend: {
          display: false,
          position: "top",
          align: "start",
          labels: {
            // boxWidth: 0,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "#333", // Tooltip background color
          titleColor: "#ffffff", // Tooltip title color
          bodyColor: "#ffffff", // Tooltip body text color
          displayColors: false, // Remove the point style indicator (triangle) in the tooltip
          callbacks: {
            title: function (context) {
              // Add "GW" before the x-axis label (which represents the game week)
              return "GW " + context[0].label;
            },
            label: function (tooltipItem) {
              // Show tooltip only for the "Points" dataset
              if (tooltipItem.dataset.label === "Points") {
                return tooltipItem.raw;
              }
              return tooltipItem.raw; // Return null for other datasets to hide tooltip
            },
          },
        },
      },
    },
    plugins: [],
  });

  myChart.data.datasets[1].hidden = true;
  const controllers = document.querySelectorAll(
    ".perform--graiph .controllers input"
  );
  const checkBar = document.querySelector(".controllers .check");

  controllers.forEach((input, i) => {
    input.addEventListener("click", () => {
      if (i == 0) {
        myChart.data.datasets[1].hidden = true;
        myChart.data.datasets[0].hidden = false;
        checkBar.style.left = "3px";
      } else {
        myChart.data.datasets[0].hidden = true;
        myChart.data.datasets[1].hidden = false;
        checkBar.style.left = "calc(50% - 3px)";
      }
      myChart.update();
    });
  });
}
async function displayMVPData(players) {
  const player = (await getData(queries.getPlayerByid(userMVP.id))).data.player;
  console.log(player);
  const playerImg = "p" + player.photo.replace(".jpg", ".png");
  const myMvp = document.querySelector(".my--mvp .content");
  myMvp.innerHTML = `
                    <div class="player--info">
                      <div class="player--img">
                        <img src="https://resources.premierleague.com/premierleague/photos/players/250x250/${playerImg}" alt="">
                      </div>
                      <div class="player--name">
                        <p class="fname">${player.first_name}</p>
                        <span class="lname">${player.second_name}</span>
                      </div>
                    </div>
                    <div class="mvp--stats">
                      <div>
                        <p>Games</p>
                        <span id="mvpGames">${player.starts}</span>
                      </div>
                      <div>
                        <p>Minutes</p>
                        <span id="mvpGames">${player.minutes}</span>
                        
                      </div>
                      <div>
                        <p>Goals</p>
                        <span id="mvpGames">${player.goals_scored}</span>
                      </div>
                      <div>
                        <p>Asists</p>
                        <span id="mvpGames">${player.assists}</span>
                      </div>
                      <div>
                        <p>Bonus</p>
                        <span id="mvpGames">${player.bonus}</span>
                      </div>
                    </div>
                    <div class="mvp--fstats">
                      <div>
                        <p>Total Points</p>
                        <span id="mvpGames">${userMVP.points}</span>
                      </div>
                      <div>
                        <p>Price</p>
                        <span id="mvpGames">${player.now_cost / 10}</span>
                      </div>
                      <div>
                        <p>GW1 Cost</p>
                        <span id="mvpGames">${
                          (player.now_cost - player.cost_change_start) / 10
                        }</span>
                      </div>
                    </div>
                 `;
  mvpLoading.style.display = "none";
}
function calcPointsPyPostion(playersData, teamPlayers, points) {
  const posPointsDiv = document.querySelectorAll(
    ".points--pos .pbp--chart > div"
  );
  // const totalPoints
  const maxPostion = positionPoints.indexOf(Math.max(...positionPoints));

  posPointsDiv.forEach((div, i) => {
    const bar = div.querySelector(".bar");
    bar.style.height = (positionPoints[i] / teamTotalPoints) * 100 + "%";
    bar.querySelector(".val").innerHTML = positionPoints[i];
    posPointsDiv[i].classList.remove("most");

    if (maxPostion == i) {
      posPointsDiv[i].classList.add("most");
    }
  });
  // console.log(posPointsDiv);
}
async function getMatchesApi() {
  const req = await fetch(
    `https://fantasyassistant-production.up.railway.app/getMatches/${
      currGW + 1
    }`
  );
  const data = await req.json();
  return data.matches;
}

function calcWeekDeadline(deadLine) {
  let today = new Date();
  let timeRemaining = deadLine - today;
  let intialDays = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  let intialHours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  let intialMinutes = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );
  let intialSeconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  const daysContainer = document.querySelector("#day");
  const hoursContainer = document.querySelector("#hours");
  const minutesContainer = document.querySelector("#minutes");
  const secContainer = document.querySelector("#sec");
  daysContainer.setAttribute("value", intialDays);
  hoursContainer.setAttribute("value", intialHours);
  minutesContainer.setAttribute("value", intialMinutes);
  secContainer.setAttribute("value", intialSeconds);
  const daysFigures = document.querySelectorAll(".deadline #day .figures");
  const hoursFigures = document.querySelectorAll(".deadline #hours .figures");
  const secFigures = document.querySelectorAll(".deadline #sec .figures");
  const minutesFigures = document.querySelectorAll(
    ".deadline #minutes .figures"
  );
  let nowDays = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  let nowHours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  let nowMinutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  let nowSeconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  daysFigures.forEach((ele, i) => {
    nowDays = nowDays.toString().padStart(2, "0");
    ele.style.transform = `translateY(${-100 * nowDays[i]}%)`;
  });
  hoursFigures.forEach((ele, i) => {
    nowHours = nowHours.toString().padStart(2, "0");
    ele.style.transform = `translateY(${-100 * nowHours[i]}%)`;
  });
  minutesFigures.forEach((ele, i) => {
    nowMinutes = nowMinutes.toString().padStart(2, "0");
    ele.style.transform = `translateY(${-100 * nowMinutes[i]}%)`;
  });
  secFigures.forEach((ele, i) => {
    nowSeconds = nowSeconds.toString().padStart(2, "0");
    ele.style.transform = `translateY(${-100 * nowSeconds[i]}%)`;
  });
  // console.log(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  function updateRemaining() {
    today = new Date();
    timeRemaining = deadLine - today;
    console.log(today);
    nowDays = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    nowHours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    nowMinutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    nowSeconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    checkChanges();
    function checkChanges() {
      if (intialDays !== nowDays) {
        handleUpdates(daysContainer, nowDays, intialDays, daysFigures);

        intialDays = nowDays;
      }
      if (intialSeconds !== nowSeconds) {
        handleUpdates(secContainer, nowSeconds, intialSeconds, secFigures);
        intialSeconds = nowSeconds;
      }
      if (intialMinutes !== nowMinutes) {
        handleUpdates(
          minutesContainer,
          nowMinutes,
          intialMinutes,
          minutesFigures
        );
        intialMinutes = nowMinutes;
      }
      if (intialHours !== nowHours) {
        console.log("Hours Changed");
        handleUpdates(hoursContainer, nowHours, intialHours, minutesHours);

        intialHours = nowHours;
      }
    }
  }
  function handleUpdates(element, newVal, oldVal, figures) {
    console.log(element);
    newVal = newVal.toString().padStart(2, "0");
    oldVal = oldVal.toString().padStart(2, "0");
    console.log(newVal);
    // const val = element.getAttribute("value");
    for (let i = 0; i < 2; i++) {
      if (oldVal[i] != newVal[i]) {
        figures[i].style.transform = `translateY(${-100 * newVal[i]}%)`;
        console.log(`Figure ${oldVal[i]} Changed to ${newVal[i]}`);
      }
    }

    // console.log(elements);
  }
  setInterval(updateRemaining, 1000);

  console.log(daysFigures);
}

// https://fantasy.premierleague.com/api/dream-team/1/ ==> التشكيلة الافضل لكل جولة
// https://fantasy.premierleague.com/api/team/set-piece-notes/ ==> الركلات الحرة والكرنيات
// https://fantasy.premierleague.com/api/stats/most-valuable-teams/ ==> اعلي الفرق قيمة
// https://fantasy.premierleague.com/api/entry/7338326/event/1/picks/ ==> تشكلية الجولة للاعب
// https://fantasy.premierleague.com/api/fixtures/?event=2 ==> المباريات للجولة
// https://fantasy.premierleague.com/api/entry/7338326/history/ ==> تاريخ الاعب الفانتاوي
// https://fantasy.premierleague.com/api/my-team/5510390/ ==> تشك
// https://fantasy.premierleague.com/api/entry/7338326/transfers/ ==> تاريخ  انتقالا الاعب الفانتاوي
// https://fantasy.premierleague.com/api/element-summary/328/ ==> المباريات القادمة للاعب
// https://fantasy.premierleague.com/api/leagues-classic/949369/standings/ ==> الدوريات
// https://fantasy.premierleague.com/api/event/{GW}/live/ ==> احصائيات كل الاعبين ف الجولة
// https://fantasy.premierleague.com/api/bootstrap-static/elements/ ==> كل الاعبين
// https://api.betting-api.com/1xbet/football/line/551972535 ==> الاحتمالات لكل مباراة
// https://api.sportradar.com/soccer/trial/v4/en/sport_events/sr%3Asport_event%3A50849991/lineups.json?api_key=CGy6lYEVU9aZdjt7TBx9312PBojz21s7GUljVVaj ==> تشكلية كل ماتش
// Form tracker رسمة لاداء الاعب اخر 5 مباريات
// https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_{team code}-110.webp ==> get line up shirt for a team
//https://fploptimized.com/sample/2024-25/2/top_managers.json ==> افضل الاعبين عل مدار التاريخ
// https://fploptimized.com/sample/2024-25/2/fpl_sampled.json ==> بيانات لاعبين
// async function getPlayerStaues(id) {
//   const req = await fetch(
//     "https://api.betting-api.com/1xbet/football/line/league/88637/matches",
//     {
//       headers: {
//         authorization:
//           "0063fe3599e24813a74ce900fb022b28b16c64e134da48c6909ed9ffc5bafc7f",
//       },
//     }
//   );
//   console.log(req);
//   const data = await req.json();
//   console.log(data);
// }
//  https://www.livefpl.net/static3/top10k.json?_=3 ==> اختيارات افضل 10 الاف لاعب
// https://www.livefpl.net/static3/types.json ==> مراكز الاعبين
// https://www.livefpl.net/static3/teams.json ==> فرق الاعبين
// https://www.livefpl.net/static3/players.json ==> اسماء الاعبين
// async function getUserdData(cookies) {
//   const url = "https://fantasy.premierleague.com/api/me/";

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: cookies, // Pass the cookies from login here
//       },
//       credentials: "include",
//     });

//     if (response.ok) {
//       const userData = await response.json();
//       return userData; // Contains the user's FPL data
//     } else {
//       throw new Error("Failed to fetch user data");
//     }
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//   }
// }
// 'https://api.sportradar.com/soccer/trial/v4/en/seasons/sr%3Aseason%3A118689/form_standings.json  ==> جدول الدوري
await fetch("./js/data.json").then(async (data) => {
  const d = await data.json();
  console.log(d);
  const obj = {};
  d.forEach((team) => {
    obj[team.team_name] = team.team_id;
  });
  console.log(obj);
});
const teamsId = {
  MCI: "80", // Manchester City
  LIV: "84", // Liverpool
  BHA: "3079", // Brighton & Hove Albion
  ARS: "141", // Arsenal
  NEW: "3100", // Newcastle United
  BRE: "3086", // Brentford
  AVL: "3088", // Aston Villa
  BOU: "3071", // Bournemouth
  FOR: "3089", // Nottingham Forest
  TOT: "164", // Tottenham Hotspur
  CHE: "88", // Chelsea
  FUL: "3085", // Fulham
  WHU: "3081", // West Ham United
  MNU: "102", // Manchester United
  LEI: "155", // Leicester City
  CRY: "3429", // Crystal Palace
  IPS: "3121", // Ipswich Town
  WOL: "3077", // Wolverhampton Wanderers
  SOU: "3072", // Southampton
  EVE: "3073", // Everton
};
