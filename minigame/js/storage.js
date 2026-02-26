const KEY = "jslager26_save_v1";

const DEFAULT_SAVE = {
  player: { name: "Spieler", avatarId: "01" },
  location: "jungscharhaus",
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);

    const data = JSON.parse(raw);

    // Defaults "drüberlegen", falls Felder fehlen
    return {
      ...structuredClone(DEFAULT_SAVE),
      ...data,
      player: {
        ...structuredClone(DEFAULT_SAVE.player),
        ...(data.player || {}),
      },
    };
  } catch (e) {
    console.warn("Save defekt, setze zurück:", e);
    localStorage.removeItem(KEY);
    return structuredClone(DEFAULT_SAVE);
  }
}

export function saveSave(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetSave() {
  localStorage.removeItem(KEY);
}
