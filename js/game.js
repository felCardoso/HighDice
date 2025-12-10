// ===== Constants ===== //

const gameVersion = "1.0A";
const gameName = "High Dice";

const HAND_SCORE = {
  K5: [30, 14],
  ST: [25, 10],
  K4: [25, 8],
  FH: [20, 6],
  K3: [15, 4],
  P2: [10, 3],
  K2: [5, 2],
  HD: [0, 1],
};

const HAND_NAMES = {
  K5: "Five of a Kind",
  ST: "Straight",
  K4: "Four of a Kind",
  FH: "Full House",
  K3: "Three of a Kind",
  P2: "Two Pair",
  K2: "Pair",
  HD: "High Dice",
};

const HAND_ORDER = Object.keys(HAND_SCORE).sort(); // Sort hand score order

// ===== UI Utility ===== //

const $ = (sel) => document.querySelector(sel);

const log = (msg) => {
  const el = $("#msg-log");
  const time = new Date().toLocaleTimeString();
  el.innerHTML = `<strong>[${time}]</strong> ${msg}<br>` + el.innerHTML;
  el.scrollTop = 0; // mantém no topo (última mensagem primeiro)
};

const clearLog = () => {
  const el = document.querySelector("#msg-log");
  el.textContent = ""; // Remove todo o texto do log
};

function pad2(n) {
  return n < 10 ? `0${n}` : String(n);
}

// ===== Classes ===== //

class Dice {
  static i = 0;

  constructor(sides = 6) {
    this.id = Dice.i++;
    this.sides = sides;
    this.side = null;
    this.selected = false;
    this.roll();
  }

  roll() {
    this.side = Math.floor(Math.random() * this.sides) + 1;
    this.selected = false;
  }

  select() {
    this.selected = true;
  }

  unselect() {
    this.selected = false;
  }

  toggle() {
    this.selected = !this.selected;
  }
}

class GameHand {
  constructor() {
    this.diceSet = Array.from({ length: 5 }, () => new Dice());
    this.handLevel = {
      K5: 1,
      ST: 1,
      K4: 1,
      FH: 1,
      K3: 1,
      P2: 1,
      K2: 1,
      HD: 1,
    };
  }

  roll() {
    this.diceSet.forEach((d) => d.roll());
  }

  reroll() {
    // Roll selected dice. If no selected, roll all
    let unselected = 0;
    for (const d of this.diceSet) {
      if (d.selected) d.roll();
      else unselected++;
    }
    if (unselected === 5) this.diceSet.forEach((d) => d.roll());
  }

  getValues() {
    // Return a dictionary with the count of each dice value
    const count = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const d of this.diceSet) count[d.side] += 1;
    return count;
  }

  checkHand() {
    // Check what is the hand type
    const maxDice = Math.max(...this.diceSet.map((d) => d.side));
    const minDice = Math.min(...this.diceSet.map((d) => d.side));
    const count = this.getValues();

    const checkK5 = () => {
      // Check if Five of a Kind
      for (let i = 1; i <= 6; i++) if (count[i] === 5) return ["K5", i];
      return false;
    };

    const checkK4 = () => {
      // Check if Four of a Kind
      for (let i = 1; i <= 6; i++) if (count[i] === 4) return ["K4", i];
      return false;
    };

    const checkK3 = () => {
      // Check if Three of a Kind
      for (let i = 1; i <= 6; i++) if (count[i] === 3) return ["K3", i];
      return false;
    };

    const checkK2 = () => {
      // Check if Pair
      let has2 = 0;
      const i2 = [];
      for (let i = 1; i <= 6; i++)
        if (count[i] === 2) {
          has2++;
          i2.push(i);
        }
      return has2 === 1 ? ["K2", i2[0]] : false;
    };

    const check2P = () => {
      // Check if Two Pair
      let has2 = 0;
      const i2 = [];
      for (let i = 1; i <= 6; i++)
        if (count[i] === 2) {
          has2++;
          i2.push(i);
        }
      return has2 === 2 ? ["P2", i2[0], i2[1]] : false;
    };

    const checkFH = () => {
      // Check if Full House
      const i3 = checkK3();
      const i2 = checkK2();
      return i3 && i2 ? ["FH", i3[1], i2[1]] : false;
    };

    const checkST = () => {
      // Check if Straight
      if (checkK5()) return false;
      if (maxDice - minDice >= 5) return false; // mesma regra do Python
      const straightList = [...this.diceSet.map((d) => String(d.side))].sort();
      const straightStr = straightList.join("");
      if (straightStr === "12345") return ["ST", 5];
      if (straightStr === "23456") return ["ST", 6];
      return false;
    };

    return (
      // Check order
      checkK5() ||
      checkK4() ||
      checkFH() ||
      checkST() ||
      checkK3() ||
      checkK2() ||
      check2P() || ["HD", maxDice]
    );
  }

  checkScore() {
    // Check Score
    // const diceScore = this.diceSet.reduce((acc, d) => acc + d.side, 0);
    let diceScore = 0;
    for (let i = 0; i < this.diceSet.length; i++) {
      diceScore = diceScore + this.diceSet[i].side;
    }
    const handArr = this.checkHand();
    const hand = handArr[0];
    const handScore = HAND_SCORE[hand];
    const level = this.handLevel[hand];
    const result =
      (handScore[0] + 5 * (level - 1) + diceScore) *
      (handScore[1] + (level - 1));

    return {
      result: result,
      hand: hand,
      ds: diceScore,
      hs: handScore,
      hl: level,
    };
  }

  computeUpgradeOptions() {
    // Upgrade UI
    const idx1 = Math.floor(Math.random() * HAND_ORDER.length);
    let idx2 = Math.floor(Math.random() * HAND_ORDER.length);
    let idx3 = Math.floor(Math.random() * HAND_ORDER.length);
    let idx4 = Math.floor(Math.random() * HAND_ORDER.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * HAND_ORDER.length);
    while (idx3 === idx1 || idx3 === idx2)
      idx3 = Math.floor(Math.random() * HAND_ORDER.length);
    while (idx4 === idx1 || idx4 === idx2 || idx4 === idx3)
      idx4 = Math.floor(Math.random() * HAND_ORDER.length);

    const excluded = new Set([idx1, idx2, idx3, idx4]);
    return HAND_ORDER.filter((_, idx) => !excluded.has(idx));
  }
}

class GameCycle {
  // Game management class
  constructor() {
    this.level = 1;
    this.strLevel = pad2(this.level);
    this.maxLevel = 20;
    this.stakeMax = 0;
    this.stake = 0;
    this.reroll = 0;
    this.upgrade = 0;
    this.rerollMax = 3;
    this.play = 0;
    this.playMax = 3;
    this.shards = [];
    this.updateStake(false);
  }

  deductStake(value) {
    // Decrease stake points
    player.score += value;
    if (this.stake - value <= 0) {
      this.stake = 0;
      this.upgrade++;
      this.updateStake(true);
      openUpgradeModal();
      return true; // Return true to confirm it's "dead" (levelup)
    } else {
      this.stake -= value;
      return false;
    }
  }

  updateStake(levelup = false) {
    // Update all stake status
    if (levelup) {
      if (this.level === this.maxLevel) {
        alert("NICE YOU WON! 🎉");
        return;
      }
      this.level += 1;
      if (this.level % 5 === 0) {
        this.rerollMax += 1;
        this.playMax += 1;
      }
    }
    this.stakeMax = this.level * 100 + 50 * (this.level - 1);
    this.stake = this.stakeMax;
    this.play = this.playMax;
    this.reroll = this.rerollMax;
    this.strLevel = pad2(this.level);
  }
}

class Player {
  constructor(username, abreviation) {
    this.username = username;
    this.abreviation = abreviation;
    this.score = 0;
    this.hs = 0;
  }

  checkHS() {
    if (this.score > this.hs) this.hs = this.score;
  }

  formatScore() {
    return this.score.toLocaleString();
  }

  formatHS() {
    return this.hs.toLocaleString();
  }
}

// ===== Game State ===== //

const player = new Player("Annonymous", "ANON");
const hand = new GameHand();
const run = new GameCycle();

// ===== Render ===== //

function renderHUD() {
  $("#game-name").textContent = gameName;
  $("#player-abbr").textContent = player.abreviation;
  $("#hud-level").textContent = run.strLevel + " / " + run.maxLevel;
  $("#hud-stake").textContent = run.stake;
  $("#plays").textContent = run.play;
  $("#rerolls").textContent = run.reroll;
  // $("#upgrades").textContent = run.upgrade;
  // $("#hud-hs").textContent = player.hs;
}

function renderDice() {
  const area = $("#dice-area");
  area.innerHTML = "";
  for (const d of hand.diceSet) {
    const card = document.createElement("div");
    card.className = `dice ${d.selected ? "selected" : ""}`;
    card.dataset.id = d.id;
    card.innerHTML = `
      <div class="face">${d.side}</div>
      <div class="id">${d.id + 1}</div>
      <div class="hint">${d.selected ? "" : ""}</div>
    `;

    card.addEventListener("click", () => {
      d.toggle();
      renderDice();
    });
    area.appendChild(card);
  }
}

// ===== Actions ===== //

function rerollSelected() {
  if (run.reroll <= 0) {
    log("Out of rerolls");
    return;
  }
  hand.reroll();
  run.reroll -= 1;
  renderHUD();
  renderDice();
  log("Reroll selected dice.");
}

function playOnce() {
  if (run.play <= 0) {
    log("Game Over!");
    log(`HS: ${player.formatHS()} / Score: ${player.formatScore()}`);
    player.checkHS();
    openGameOverModal();
    renderHUD();
    return;
  }
  const check = hand.checkScore();
  run.play -= 1;

  const leveledUp = run.deductStake(check.result);
  player.hs = Math.max(player.hs, check.result);
  if (run.play === 0 && !leveledUp) {
    log("Game Over!");
    log(`HS: ${player.formatHS()} / Score: ${player.formatScore()}`);
    player.checkHS();
    openGameOverModal();
    renderHUD();
    return;
  }
  hand.roll();

  renderHUD();
  renderDice();

  if (check.hl === 1) {
    log(
      `${HAND_NAMES[check.hand]} | (${check.hs[0]} + ${check.ds}) * ${
        check.hs[1]
      } = ${check.result}`
    );
  } else {
    log(
      `${HAND_NAMES[check.hand]} | (${check.hs[0]} + ${check.ds} (+${
        (check.hl - 1) * 5
      })) * (${check.hs[1]} + ${check.hl - 1}) = ${check.result}`
    );
  }

  if (leveledUp) {
    log(`Level ${run.level}`);
    log(`Resetted Reroll/Play`);
    hand.roll();
    renderDice();
  }
}

function openUpgradeModal() {
  const options = hand.computeUpgradeOptions();
  const box = $("#upgrade-options");
  box.innerHTML = "";
  options.forEach((handx, idx) => {
    const el = document.createElement("div");
    el.className = "option";
    el.innerHTML = `
      <div class="title">${HAND_NAMES[handx]}</div>
      <div class="lvl">lv. ${hand.handLevel[handx]}</div>
      <button class="btn warning upgrade">Upgrade</button>
    `;
    el.querySelector("button").addEventListener("click", () => {
      if (run.upgrade <= 0) {
        log("No upgrades available");
        return;
      }
      hand.handLevel[handx] = hand.handLevel[handx] + 1;
      run.upgrade--;
      log(`${HAND_NAMES[handx]} Upgrade: lv. ${hand.handLevel[handx]}`);
      renderHUD();
      $("#upgrade-modal").classList.add("hidden");
    });
    box.appendChild(el);
  });
  $("#upgrade-modal").classList.remove("hidden");
}

function resetGame() {
  Object.assign(hand.handLevel, {
    K5: 1,
    ST: 1,
    K4: 1,
    FH: 1,
    K3: 1,
    P2: 1,
    K2: 1,
    HD: 1,
  });
  hand.roll();
  run.level = 1;
  run.rerollMax = 3;
  run.playMax = 3;
  run.updateStake(false);
  player.score = 0;
  renderHUD();
  renderDice();
  clearLog();
  log("Game reset!");
  setTimeout(() => {
    clearLog();
    log(`<strong>${gameName}</strong> v${gameVersion}`);
  }, 500);
}

function openGameOverModal() {
  document.getElementById("gameover-modal").classList.remove("hidden");
  document
    .getElementById("gameover-modal")
    .querySelector(".game-over-description").innerHTML = `Lost at level ${
    run.level
  }! <br> Run Score: ${player.formatScore()}<br>High Score: ${player.formatHS()}`;
}

function hideGameOverModal() {
  document.getElementById("gameover-modal").classList.add("hidden");
  resetGame();
}

// ===== Button Wiring ===== //

$("#btn-reroll").addEventListener("click", rerollSelected);
$("#btn-play").addEventListener("click", playOnce);
// $("#btn-upgrade").addEventListener("click", openUpgradeModal);
$("#close-upgrade").addEventListener("click", () =>
  $("#upgrade-modal").classList.add("hidden")
);
$("#btn-reset").addEventListener("click", resetGame);
$("#btn-gameover-restart").addEventListener("click", () => {
  hideGameOverModal();
});
// ===== Game Start (Initial Phase) ===== //

hand.roll();
renderHUD();
renderDice();
log(`<strong>${gameName}</strong> v${gameVersion}`);
