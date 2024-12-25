let resolveFunction;

export const promise = new Promise((resolve, reject) => {
  resolveFunction = resolve;
  if (localStorage.getItem("teamId")) {
    resolve(localStorage.getItem("teamId"));
  } else {
    getTeamId();
  }
});

export function getTeamId() {
  const popoverId = "takeUserID";
  // Create the popover element
  const popoverTarget = document.createElement("div");
  popoverTarget.id = popoverId; // Set the ID for the popover target
  popoverTarget.setAttribute("popover", "manual"); // Enable manual control of the popover
  popoverTarget.innerHTML = `
  
  <div>
  <h1>Add Your Team Code  <i class="fa-solid fa-circle-info info-icon"><div class="info">
  <p>1. Log in to your Fantasy Premier League account.</p>
<p>2. Go to the "My Team" page.</p>
<p>3. In the URL, find the number after <strong>/entry/</strong>. It’s your team ID, e.g., <span>1234567</span>.</p></div>
</i> </h1>
  <input type="text" id="teamID" placeholder="123456" />
  <button id="addId"> Add </button>
  <div>
  `;
  document.body.insertAdjacentElement("beforeend", popoverTarget);
  let error;
  const teamIdInput = popoverTarget.querySelector("#teamID");
  const addIdBtn = popoverTarget.querySelector("#addId");
  popoverTarget.showPopover();
  addIdBtn.addEventListener("click", () => {
    const teamId = teamIdInput.value;
    if (Number.isNaN(+teamId) || teamId == "") {
      if (error) return;
      error = `<p class="error">Team Code Is Not Valid<p>`;
      teamIdInput.insertAdjacentHTML("afterend", error);
    } else {
      localStorage.setItem("teamId", +teamId);
      resolveFunction(teamId);
      popoverTarget.hidePopover();
      console.log("ok");
      return teamId;
    }
  });
  // throw new Error("No USer Code");
  return;
}
