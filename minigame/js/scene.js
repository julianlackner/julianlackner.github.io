import { LOCATIONS } from "./locations.js";
import { loadState, saveState } from "./state.js";

const params = new URLSearchParams(location.search);
const id = params.get("id") || "jungscharhaus";
const loc = LOCATIONS[id] || LOCATIONS["jungscharhaus"];

const state = loadState();
state.currentLocation = loc.id;
saveState(state);

// Elements
const titleEl = document.querySelector("#sceneTitle");
const imgEl = document.querySelector("#sceneImg");
const fallbackEl = document.querySelector("#sceneFallback");
const houseNav = document.querySelector("#houseNav");
const enterHouseBtn = document.querySelector("#enterHouseBtn");
const backOutside = document.querySelector("#backOutside");

// Render title + image
titleEl.textContent = `${loc.icon} ${loc.name}`;
imgEl.style.display = "block";
fallbackEl.style.display = "none";
imgEl.src = loc.img;

imgEl.onerror = () => {
  imgEl.style.display = "none";
  fallbackEl.style.display = "block";
};

// Helpers
const isHouseOutside = loc.id === "jungscharhaus";
const isHouseInside = loc.parent === "jungscharhaus";

// Build house navigation
function buildHouseNav() {
  // Alle Räume (parent=jungscharhaus) + Außen
  const rooms = Object.values(LOCATIONS)
    .filter(x => x.parent === "jungscharhaus")
    .map(x => ({ id: x.id, name: x.name, icon: x.icon }));

  // Reihenfolge fix (wie du’s willst)
  const order = [
    "jungscharhaus", // außen (special)
    "jungscharhaus_eingangsbereich",
    "jungscharhaus_kueche",
    "jungscharhaus_badezimmer",
    "jungscharhaus_kinderzimmer",
    "jungscharhaus_1og",
    "jungscharhaus_dachboden",
  ];

  const entries = order
    .map(oid => {
      if (oid === "jungscharhaus") return { id:"jungscharhaus", name:"Außen", icon:"🏠" };
      return rooms.find(r => r.id === oid);
    })
    .filter(Boolean);

  houseNav.innerHTML = entries.map(e => {
    const active = (e.id === loc.id) ? 'style="outline:2px solid rgba(42,92,255,.55)"' : "";
    return `<a class="btn" ${active} href="scene.html?id=${encodeURIComponent(e.id)}">${e.icon} ${e.name}</a>`;
  }).join("");
}

// Show/hide house UI
if (isHouseOutside || isHouseInside) {
  houseNav.style.display = "flex";
  buildHouseNav();

  // "Ins Haus" nur draußen
  if (isHouseOutside) {
    enterHouseBtn.style.display = "block";
    enterHouseBtn.onclick = () => location.href = "scene.html?id=jungscharhaus_eingangsbereich";
    backOutside.style.display = "none";
  } else {
    enterHouseBtn.style.display = "none";
    backOutside.style.display = "inline-flex";
    backOutside.href = "scene.html?id=jungscharhaus";
  }
} else {
  houseNav.style.display = "none";
  enterHouseBtn.style.display = "none";
  backOutside.style.display = "none";
}
