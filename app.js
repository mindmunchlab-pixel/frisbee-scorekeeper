let game = {};
let currentPoint = 1;
let direction = "right";

/* NAV */
function showSetup() {
  hideAll(); document.getElementById("setup").classList.remove("hidden");
}
function showHistory() {
  hideAll(); renderHistory();
}
function goHome() {
  hideAll(); document.getElementById("home").classList.remove("hidden");
}
function hideAll() {
  ["home","setup","flip","ratioFlip","game","summary","history"]
    .forEach(id => document.getElementById(id).classList.add("hidden"));
}

/* FLIP */
function startFlip() {
  game.teamA = teamA.value || "A";
  game.teamB = teamB.value || "B";
  game.mode = mode.value;

  hideAll();
  flip.classList.remove("hidden");

  const disc = document.getElementById("disc");
  disc.classList.add("spin");

  setTimeout(() => {
    const winner = Math.random() < 0.5 ? "A" : "B";
    game.flipWinner = winner;
    flipResult.innerText = `${winner === "A" ? game.teamA : game.teamB} wins`;
    disc.classList.remove("spin");
  }, 1000);
}

function chooseReceive() {
  game.receivingTeam = game.flipWinner;
  nextStep();
}
function choosePull() {
  game.receivingTeam = game.flipWinner === "A" ? "B" : "A";
  nextStep();
}

function nextStep() {
  flip.classList.add("hidden");
  if (game.mode === "mixed") ratioFlip.classList.remove("hidden");
  else startGame();
}

function setRatio(r) {
  game.startingRatio = r;
  ratioFlip.classList.add("hidden");
  startGame();
}

/* GAME */
function startGame() {
  game.points = [];
  game.score = { A:0, B:0 };
  currentPoint = 1;
  direction = "right";

  game.classList?.add?.("nope"); // noop safeguard

  hideAll();
  document.getElementById("game").classList.remove("hidden");
  updateUI();
}

/* MUFA LOGIC */
function getRatio(p) {
  if (game.mode !== "mixed") return "";

  if (p === 1) return game.startingRatio;

  const opp = game.startingRatio === "FMP" ? "MMP" : "FMP";
  const block = Math.floor((p - 2) / 2);
  return block % 2 === 0 ? opp : game.startingRatio;
}

/* GAME ACTIONS */
function scorePoint(team) {
  const offense = currentPoint === 1
    ? game.receivingTeam
    : game.points[game.points.length - 1].scoringTeam === "A" ? "B" : "A";

  const type = team === offense ? "hold" : "break";

  game.points.push({
    point: currentPoint,
    scoringTeam: team,
    type,
    ratio: getRatio(currentPoint)
  });

  game.score[team]++;
  currentPoint++;

  direction = direction === "right" ? "left" : "right";

  updateUI();
}

function undoPoint() {
  if (game.points.length === 0) return;

  const last = game.points.pop();
  game.score[last.scoringTeam]--;
  currentPoint--;

  direction = direction === "right" ? "left" : "right";

  updateUI();
}

function endGame() {
  saveGame();
  showSummary();
}

/* UI */
function updateUI() {
  score.innerText =
    `${game.teamA} ${game.score.A} - ${game.score.B} ${game.teamB}`;

  pointInfo.innerText =
    `Point ${currentPoint} ${getRatio(currentPoint)}`;

  renderField();
}

function renderField() {
  field.innerHTML = `
    <div class="endzone left"></div>
    <div class="endzone right"></div>
    <div class="arrow">${direction === "right" ? "→" : "←"}</div>
  `;
}

/* SUMMARY */
function showSummary() {
  hideAll();
  summary.classList.remove("hidden");

  let holds = game.points.filter(p => p.type === "hold").length;
  let breaks = game.points.filter(p => p.type === "break").length;

  summaryContent.innerHTML = `
    <p>${game.teamA} ${game.score.A} - ${game.score.B} ${game.teamB}</p>
    <p>Holds: ${holds}</p>
    <p>Breaks: ${breaks}</p>
  `;
}

/* HISTORY */
function saveGame() {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  game.date = new Date().toLocaleString();
  games.push(game);
  localStorage.setItem("games", JSON.stringify(games));
}

function renderHistory() {
  history.classList.remove("hidden");
  const list = historyList;
  list.innerHTML = "";

  let games = JSON.parse(localStorage.getItem("games")) || [];

  games.forEach(g => {
    const div = document.createElement("div");
    div.innerHTML =
      `${g.date} — ${g.teamA} ${g.score.A} - ${g.score.B} ${g.teamB}`;
    list.appendChild(div);
  });
}

/* SW */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
}
