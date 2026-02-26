import { setRoute } from "./router.js";
import { loadSave } from "./storage.js";

export function renderIntro(app){
  const save = loadSave();
  const name = save?.player?.name || "Detektiv";

  app.innerHTML = `
    <div class="wrap">
      <div class="card">
        <h1>📩 Nachricht an ${name}</h1>
        <p>
          Es gibt einen wichtigen Detektiv-Fall!
          Nur wer den Fall löst, darf mit aufs Jungscharlager 2026 mitfahren.
        </p>
        <p class="small">
          Hinweis: Du kannst jetzt frei zwischen den Orten reisen. Die Quest starten wir als Nächstes.
        </p>
        <button id="go" class="btn primary">Fortfahren</button>
      </div>
    </div>
  `;

  app.querySelector("#go").addEventListener("click", () => setRoute("game"));
}
