import { getRoute, setRoute } from "./router.js";
import { loadSave } from "./storage.js";
import { renderLogin } from "./ui_login.js";
import { renderIntro } from "./ui_intro.js";
import { startGame } from "./game_engine.js";
import { openMapModal } from "./ui_map.js";

const app = document.querySelector("#app");
const mapFab = document.querySelector("#mapFab");

function render(){
  const route = getRoute();
  const save = loadSave();

  // Guard: wenn kein Save, immer login
  if (!save && route !== "login") setRoute("login");

  // Map icon nur im Spiel
  mapFab.style.display = (route === "game") ? "block" : "none";

  if (route === "login") return renderLogin(app);
  if (route === "intro") return renderIntro(app);
  if (route === "game") return startGame(app);

  // fallback
  setRoute("login");
}

window.addEventListener("hashchange", render);
render();

// Map FAB opens modal and travels
mapFab.addEventListener("click", () => {
  openMapModal(() => {
    // neu rendern -> lädt neue scene
    render();
  });
});
