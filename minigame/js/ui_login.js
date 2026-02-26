import { loadSave, saveSave } from "./storage.js";
import { setRoute } from "./router.js";

// Avatare als IDs (Ordnernamen in assets/avatars/<id>/sheet.png)
const AVATARS = ["01"]; // später z.B. ["01","02","03",...]

export function renderLogin(app){
  const existing = loadSave();
  const selected = existing?.player?.avatarId || AVATARS[0];

  app.innerHTML = `
    <div class="wrap">
      <div class="card">
        <h1>🕵️ Anmeldung</h1>
        <div class="small">Wähle deinen Avatar und gib deinen Detektiv-Namen ein.</div>

        <div style="margin-top:14px;" class="row">
          <div style="flex:1; min-width:280px;">
            <label class="small">Detektiv-Name</label>
            <input id="name" class="input" maxlength="20" placeholder="z.B. Detektiv Fuchs" value="${existing?.player?.name || ""}">
            <div style="margin-top:12px;">
              <button id="continue" class="btn primary">Weiter</button>
              ${existing ? `<button id="reset" class="btn">Reset</button>` : ""}
            </div>
          </div>

          <div style="flex:1; min-width:280px;">
            <label class="small">Avatar</label>
            <div class="grid" id="avatarGrid"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const grid = app.querySelector("#avatarGrid");
  let current = selected;

  function draw(){
    grid.innerHTML = AVATARS.map(id => `
      <div class="avatar ${id===current?"selected":""}" data-id="${id}">
        <div class="thumb" style="background-image:url('assets/avatars/${id}/sheet.png')"></div>
        <div class="small">Avatar ${id}</div>
      </div>
    `).join("");

    grid.querySelectorAll(".avatar").forEach(el => {
      el.addEventListener("click", () => { current = el.dataset.id; draw(); });
    });
  }
  draw();

  app.querySelector("#continue").addEventListener("click", () => {
    const name = app.querySelector("#name").value.trim();
    if (!name) { alert("Bitte einen Namen eingeben."); return; }

    const data = existing || {};
    data.player = { name, avatarId: current };
    data.location = data.location || "jungscharhaus";
    saveSave(data);

    setRoute("intro");
  });

  if (existing) {
    app.querySelector("#reset").addEventListener("click", () => {
      // Reset savegame
      localStorage.removeItem("jslager26_save_v1");
      location.reload();
    });
  }
}
