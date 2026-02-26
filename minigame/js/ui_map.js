import { loadSave, saveSave as saveFn } from "./storage.js";

/**
 * Unsichtbare Hotspots in Prozent (left/top/width/height)
 * Du passt die Werte später an, bis es perfekt sitzt.
 */
 const MAP_HOTSPOTS = [
   { id: "jungscharhaus",    label: "Jungscharhaus",    x: 38, y: 28, w: 20, h: 22 },
   { id: "essenszelt",       label: "Essenszelt",       x: 57, y: 32, w: 20, h: 22 },
   { id: "lagerfahnenplatz", label: "Fahnenplatz",      x: 12, y: 52, w: 20, h: 22 },
   { id: "lagerfeuerplatz",  label: "Lagerfeuerplatz",  x: 48, y: 60, w: 22, h: 24 },
   { id: "zeltplatz",        label: "Zeltplatz",        x: 78, y: 26, w: 22, h: 24 },
   { id: "lichtung",         label: "Lichtung",         x: 38, y: 38, w: 20, h: 24 },
   { id: "tenne",            label: "Tenne",            x: 10, y: 22, w: 20, h: 24 },
 ];

export function openMapModal(onTravel){
  const modalRoot = document.querySelector("#modalRoot");

  modalRoot.innerHTML = `
    <div class="modalBack show" id="mb">
      <div class="card modal" style="padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
          <h2 style="margin:0;">🗺️ Karte</h2>
          <button class="btn" id="close">Schließen</button>
        </div>

        <div style="margin-top:12px; position:relative; border-radius:16px; overflow:hidden; border:1px solid #22305c;">
          <img src="assets/map/map.png" alt="Karte" style="width:100%; display:block;">

          <!-- Hotspots -->
          ${MAP_HOTSPOTS.map(h => `
            <button
              class="mapHotspot"
              data-id="${h.id}"
              title="${h.label}"
              style="
                position:absolute;
                left:${h.x}%;
                top:${h.y}%;
                width:${h.w}%;
                height:${h.h}%;
                background: rgba(0,0,0,0);
                border: none;
                cursor: pointer;
              ">
            </button>
          `).join("")}
        </div>

        <div class="small" style="margin-top:10px;">
          Tipp: Wenn du mit der Maus über einen Ort fährst, siehst du den Namen als Tooltip.
        </div>
      </div>
    </div>
  `;

  modalRoot.querySelector("#close").onclick = () => modalRoot.innerHTML = "";
  modalRoot.querySelector("#mb").addEventListener("click", (e) => {
    if (e.target.id === "mb") modalRoot.innerHTML = "";
  });

  modalRoot.querySelectorAll(".mapHotspot").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const s = loadSave();
      s.location = id;
      saveFn(s);
      modalRoot.innerHTML = "";
      onTravel(id);
    });
  });
}
