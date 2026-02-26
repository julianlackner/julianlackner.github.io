import { LOCATIONS, CONNECTIONS } from "./locations.js";
import { loadState, saveState } from "./state.js";

const state = loadState();

const mapEl = document.querySelector("#map");
const nodesLayer = document.querySelector("#nodesLayer");
const svg = document.querySelector("#connectionsSvg");

function pctToPx(xPct, yPct){
  const rect = mapEl.getBoundingClientRect();
  return {
    x: rect.width  * (xPct / 100),
    y: rect.height * (yPct / 100)
  };
}

function drawNodes(){
  nodesLayer.innerHTML = "";
  Object.values(LOCATIONS).forEach(loc => {
    const a = document.createElement("a");
    a.className = "node";
    a.href = `scene.html?id=${encodeURIComponent(loc.id)}`;
    a.style.left = `${loc.x}%`;
    a.style.top  = `${loc.y}%`;
    a.innerHTML = `<span class="label">${loc.icon} ${loc.name}</span>`;
    a.addEventListener("click", () => {
      state.currentLocation = loc.id;
      saveState(state);
    });
    nodesLayer.appendChild(a);
  });
}

function drawConnections(){
  // SVG neu zeichnen
  svg.innerHTML = `
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L10,3 L0,6 Z" fill="rgba(255,80,80,.9)"></path>
      </marker>
    </defs>
  `;

  CONNECTIONS.forEach(([fromId,toId]) => {
    const from = LOCATIONS[fromId];
    const to   = LOCATIONS[toId];
    if (!from || !to) return;

    const p1 = pctToPx(from.x, from.y);
    const p2 = pctToPx(to.x, to.y);

    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", "rgba(255,80,80,.85)");
    line.setAttribute("stroke-width", "4");
    line.setAttribute("marker-end", "url(#arrow)");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  });
}

function render(){
  drawNodes();
  drawConnections();
}

window.addEventListener("resize", () => drawConnections());
render();
