async function getStanding() {
  const req = await fetch(
    "https://fantasyassistant-production.up.railway.app/footballApi/competitions-PL-standings?season=2024&matchday=7"
  );
  console.log(req);
  const data = await req.json();
  displayTable(data.standings[0].table);
  console.log(data);
}
const table = document.querySelector(".standing--section .container");
getStanding();
function displayTable(standings) {
  standings.forEach((team) => {
    const ul = document.createElement("ul");
    const form = team.form.split(",");
    const div = document.createElement("div");
    form.forEach((g) => {
      const span = document.createElement("span");
      span.classList.add(g);
      span.innerHTML = g;
      div.appendChild(span);
    });

    ul.innerHTML = `
            <li>${team.position}</li>
            <li>
              <img src="${team.team.crest}" alt="">${team.team.shortName}
            </li>
            <li>${team.playedGames}</li>
            <li>${team.won}</li>
            <li>${team.draw}</li>
            <li>${team.lost}</li>
            <li>${team.goalsFor}</li>
            <li>${team.goalsAgainst}</li>
            <li>${team.goalDifference}</li>
            <div class="form">
           ${div.innerHTML}
            </div>
            <li>${team.points}</li>
          `;
    table.appendChild(ul);
  });
}
