import { LOCATIONS } from "./locations.js";
import { saveSave as saveFn, loadSave } from "./storage.js";

export function openMapModal(onTravel){
  const modalRoot = document.querySelector("#modalRoot");
  const s = loadSave();
  const current = s?.location || "jungscharhaus";

  modalRoot.innerHTML = `
    <div class="modalBack show" id="mb">
      <div class="card modal">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
          <h2 style="margin:0;">🗺️ Karte</h2>
          <button class="btn" id="close">Schließen</button>
        </div>
        <div class="small" style="margin-top:8px;">Wähle einen Ort zum Reisen.</div>

        <div class="mapGrid" style="margin-top:12px;">
          ${Object.values(LOCATIONS).map(loc => `
            <div class="mapThumb" data-id="${loc.id}">
              <div>
                <div><b>${loc.name}</b> ${loc.id===current ? `<span class="small">(aktuell)</span>`:""}</div>
                <div class="small">${loc.id}</div>
              </div>
              <div>➡️</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  modalRoot.querySelector("#close").onclick = () => modalRoot.innerHTML = "";

  modalRoot.querySelectorAll(".mapThumb").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const save = loadSave();
      save.location = id;
      saveFn(save);
      modalRoot.innerHTML = "";
      onTravel(id);
    });
  });

  // click outside closes
  modalRoot.querySelector("#mb").addEventListener("click", (e) => {
    if (e.target.id === "mb") modalRoot.innerHTML = "";
  });
}
