const maxLabelLength = 7;
let maxMatchesLength = 5;
let currScope = 0;
const daysList = document.querySelector(".days > div");
const nextWeakBtn = document.querySelector(".after--btn");
const prevWeakBtn = document.querySelector(".before--btn");
const matchesSection = document.querySelector(".matches .matches--container");
const loading = document.querySelector(".loading--matches");
const date = new Date();
let league = window.location.href.split("?")[1];
console.log(league);
date.setDate(date.getDate() - 1);
console.log(date);

console.log(daysList);
nextWeakBtn.addEventListener("click", () => {
  console.log(new Date(date.setDate(date.getDate() + 7)));
  daysList.innerHTML = "";
  console.log(date);
  CreateDateLabels(date);
});
prevWeakBtn.addEventListener("click", () => {
  console.log(new Date(date.setDate(date.getDate() - 7)));
  daysList.innerHTML = "";
  console.log(date);

  CreateDateLabels(date);
});
CreateDateLabels(date);
getFixuresAndHandle(new Date());
function getFixuresAndHandle(date) {
  loading.style.display = "flex";
  getFixureByDate(date.toISOString().slice(0, 10)).then((matches) => {
    updateMatchesHeader(date);
    displayMatches(matches);
    loading.style.display = "none";
  });
}
let activeDay = document.querySelector(".days .active");
function CreateDateLabels(date) {
  const monthName = date.toLocaleString("en-US", {
    month: "long",
  });

  document.querySelector("#monthID").innerHTML = monthName;
  console.log(date);

  for (let i = 0; i < maxLabelLength; i++) {
    const labelDay = new Date(date);
    const li = document.createElement("li");
    labelDay.setDate(date.getDate() + i);
    li.addEventListener("click", () => {
      !activeDay ? (activeDay = li) : "";
      if (activeDay) {
        activeDay.classList.remove("active");
        activeDay = li;
        li.classList.add("active");
      }
      matchesSection.innerHTML = "";
      // loading.style.display = "flex";
      loading.style.display = "flex";
      getFixuresAndHandle(labelDay);
    });
    // li.setAttribute("date", );
    console.log(labelDay);
    const weekDay = labelDay.toLocaleString("en-US", { weekday: "short" });
    li.innerHTML = `${labelDay.getDate()}  ${weekDay}`;
    daysList.appendChild(li);
    if (isToday(labelDay)) {
      li.innerHTML = "Today";
      li.classList.add("active");
    }
    console.log(isYesterday(labelDay));
    if (isYesterday(labelDay)) {
      li.innerHTML = "Yesterday";
    }
    if (isTomorrow(labelDay)) {
      li.innerHTML = "Tomorrow";
    }
  }
}
function isToday(date) {
  const todayDate = new Date();
  console.log(date, "===>", todayDate);
  return (
    todayDate.getFullYear() === date.getFullYear() &&
    todayDate.getMonth() === date.getMonth() &&
    todayDate.getDate() === date.getDate()
  );
}
function isYesterday(date) {
  const todayDate = new Date();
  todayDate.setDate(todayDate.getDate() - 1);

  return (
    todayDate.getFullYear() == date.getFullYear() &&
    todayDate.getMonth() == date.getMonth() &&
    todayDate.getDate() == date.getDate()
  );
}
function isTomorrow(date) {
  const todayDate = new Date();
  todayDate.setDate(todayDate.getDate() + 1);

  return (
    todayDate.getFullYear() == date.getFullYear() &&
    todayDate.getMonth() == date.getMonth() &&
    todayDate.getDate() == date.getDate()
  );
}
console.log(isToday(new Date("2025-10-16")));
// console.log(new Date("2024-10-16"));
async function getFixureByDate(date) {
  let url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${date}`;
  if (league) {
    url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${date}&league=${league}&season=2024`;
  }
  const req = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com/v3/fixtures",
      "x-rapidapi-key": "1ab2bab082msh5b64e63d6026573p1d51eajsnd9b0d6d800a3",
    },
  });
  const data = await req.json();
  console.log(data);
  const l = data.response.length;

  if (league) {
    maxMatchesLength = l;
  }

  return data.response;
}
function displayMatches(matches) {
  for (
    let i = currScope * maxMatchesLength;
    i < (currScope + 1) * maxMatchesLength;
    i++
  ) {
    displayMatch(matches[i]);
  }
}
function displayMatch(match) {
  console.log();

  const matchDiv = document.createElement("a");
  matchDiv.href = "./match.html?" + match.fixture.id;
  const matchDate = new Date(match.fixture.date);
  let dateText = "";
  if (isToday(matchDate)) {
    dateText = "Today";
  } else if (isTomorrow(matchDate)) {
    dateText = "Tomorrow";
  } else if (isYesterday(matchDate)) {
    dateText = "Yesterday";
  } else {
    dateText = matchDate.toISOString().slice(0, 10);
  }
  console.log(match.teams.home.name);
  matchDiv.classList.add("match");
  matchDiv.innerHTML = `
                <div class="teams">
                  <div class="home">
                    <div class="team">
                      <img src="${match.teams.home.logo}" alt="" srcset="">
                      <h3>${match.teams.home.name}</h3>
                    </div>
                    <p class="result">${match.goals.home ?? ""}</p>
                  </div>
                  <div class="away">
                    <div class="team">
                      <img src="${match.teams.away.logo}" alt="" srcset="">
                     <h3>${match.teams.away.name}</h3>
                    </div>
                    <p class="result">${match.goals.away ?? ""}</p>
                  </div>
                </div>

                <div class="info">
                  <p class="date">${dateText}</p>
                  <p class="stats">${
                    match.fixture.status.short == "FT"
                      ? "Full Match"
                      : match.fixture.status.elapsed ??
                        match.fixture.status.long
                  }'</p>
                </div>
             `;
  const tournament = match.league;
  let tournamentDiv = document.querySelector(`.id${tournament.id}`);
  if (tournamentDiv) {
    tournamentDiv.appendChild(matchDiv);
  } else {
    displayTournament(tournament);
    tournamentDiv = document.querySelector(`.id${tournament.id}`);
    console.log(`id${tournament.name}`);
    console.log(tournamentDiv);
    tournamentDiv.appendChild(matchDiv);
  }
}
function displayTournament(tournament) {
  const div = document.createElement("div");
  div.classList.add("id" + tournament.id);
  div.classList.add("tournament--matches");
  div.innerHTML = `
              <h1>
                <img src="${tournament.logo}" alt="" srcset=""> ${tournament.name}
              </h1>
              `;
  matchesSection.appendChild(div);
}
function updateMatchesHeader(date) {
  const h1 = document.querySelector(".matches--title h1");
  console.log(
    date.toLocaleString("en-GB", {
      weekday: "long", // Full weekday name (e.g., "Wednesday")
      day: "numeric", // Day of the month (e.g., "16")
      month: "long", // Full month name (e.g., "October")
      year: "numeric",
    })
  );
  const h3 = document.querySelector(".matches--title h3");
  h3.innerHTML =
    date.toLocaleString("en-GB", {
      weekday: "long", // Full weekday name (e.g., "Wednesday")
    }) +
    "," +
    date.toLocaleString("en-GB", {
      day: "numeric", // Day of the month (e.g., "16")
      month: "long", // Full month name (e.g., "October")
      year: "numeric",
    });
  if (isToday(date)) {
    h1.innerHTML = "Today's Matches";
    return;
  }
  if (isYesterday(date)) {
    h1.innerHTML = "Yesterday's Matches";
    return;
  }
  if (isTomorrow(date)) {
    h1.innerHTML = "Tomorrow's Matches";
    return;
  }
  h1.innerHTML = "Matches";
}
