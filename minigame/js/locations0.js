export const DEFAULT_LOCATION = "jungscharhaus";

/**
 * Location Schema (einheitlich):
 * {
 *   id: string,
 *   name: string,
 *   img: string,
 *   spawn: {x,y} | null,
 *   spawnFrom: Record<string, {x,y}>,
 *   hotspots: Array<{x,y,w,h,to}>,
 *   blocks: Array<{x,y,w,h}>,
 *   actions: Array<{
 *     id: string,
 *     x: number, y: number, w: number, h: number,
 *     trigger: "enter" | "click",
 *     slides: string[],
 *     once?: boolean,
 *     autoCloseOnMove?: boolean
 *   }>
 * }
 */

export const LOCATIONS = {
  // ===== OUTDOOR =====
  jungscharhaus: {
    id: "jungscharhaus",
    name: "Jungscharhaus",
    img: "assets/scenes/jungscharhaus.jpeg",

    spawn: null,
    spawnFrom: {},

    hotspots: [
      { x: 455, y: 290, w: 100, h: 155, to: "jungscharhaus_eingangsbereich" },
    ],

    blocks: [
      // block Himmel
      { x: 0, y: 0, w: 1200, h: 200 },
    ],

    actions: [],
  },

  zeltplatz: {
    id: "zeltplatz",
    name: "Zeltplatz",
    img: "assets/scenes/zeltplatz.png",

    spawn: null,
    spawnFrom: {},

    hotspots: [{ x: 680, y: 510, w: 210, h: 100, to: "essenszelt" }],

    blocks: [],
    actions: [],
  },

  essenszelt: {
    id: "essenszelt",
    name: "Essenszelt",
    img: "assets/scenes/essenszelt.png",

    spawn: { x: 652, y: 494 },
    spawnFrom: {
      lichtung: { x: 214, y: 441 },
      zeltplatz: { x: 973, y: 461 },
    },

    hotspots: [
      { x: 940, y: 260, w: 160, h: 220, to: "zeltplatz" },
      { x: 0, y: 380, w: 160, h: 280, to: "lichtung" },
    ],

    blocks: [
      // Blocks unterhalb Brücke
      { x: 190, y: 480, w: 185, h: 160 },
      { x: 375, y: 505, w: 70, h: 150 },
      { x: 440, y: 525, w: 20, h: 150 },
      { x: 460, y: 555, w: 20, h: 150 },
      { x: 480, y: 575, w: 20, h: 150 },
      { x: 500, y: 595, w: 20, h: 150 },
      { x: 520, y: 605, w: 20, h: 150 },

      // Blocks oberhalb Brücke
      { x: 0, y: 360, w: 280, h: 20 },
      { x: 255, y: 300, w: 15, h: 50 },
      { x: 270, y: 285, w: 15, h: 50 },
      { x: 285, y: 275, w: 15, h: 50 },
      { x: 300, y: 265, w: 15, h: 50 },
      { x: 315, y: 225, w: 800, h: 50 },
      { x: 230, y: 318, w: 25, h: 39 },
    ],

    actions: [
      {
        id: "infotafel_1",
        x: 534,
        y: 329,
        w: 120,
        h: 90,
        trigger: "enter",
        slides: [
          "assets/dialogs/essenszelt/info1.png",
          "assets/dialogs/essenszelt/info2.png",
          "assets/dialogs/essenszelt/info3.png",
        ],
        once: false,
        autoCloseOnMove: true,
      },
    ],
  },

  lichtung: {
    id: "lichtung",
    name: "Lichtung",
    img: "assets/scenes/lichtung.png",

    spawn: null,
    spawnFrom: {},

    hotspots: [
      { x: 740, y: 444, w: 360, h: 220, to: "essenszelt" },
      { x: 0, y: 444, w: 360, h: 220, to: "lagerfahnenplatz" },
      { x: 740, y: 84, w: 360, h: 220, to: "jungscharhaus" },
      { x: 0, y: 144, w: 360, h: 180, to: "tenne" },
    ],

    blocks: [
      // block Himmel
      { x: 0, y: 0, w: 1200, h: 170 },
    ],

    actions: [],
  },

  lagerfeuerplatz: {
    id: "lagerfeuerplatz",
    name: "Lagerfeuerplatz",
    img: "assets/scenes/lagerfeuerplatz.png",

    spawn: { x: 652, y: 494 },
    spawnFrom: {
      lichtung: { x: 214, y: 441 },
      zeltplatz: { x: 973, y: 461 },
    },

    hotspots: [{ x: 0, y: 333, w: 170, h: 180, to: "lagerfahnenplatz" }],

    blocks: [
      // block Himmel
      { x: 0, y: 0, w: 1200, h: 160 },
      { x: 442, y: 401, w: 314, h: 63 },
      { x: 522, y: 333, w: 109, h: 61 },
    ],

    actions: [],
  },

  lagerfahnenplatz: {
    id: "lagerfahnenplatz",
    name: "Fahnenplatz",
    img: "assets/scenes/lagerfahnenplatz.png",

    spawn: null,
    spawnFrom: {},

    hotspots: [
      { x: 745, y: 0, w: 170, h: 250, to: "lichtung" },
      { x: 945, y: 365, w: 170, h: 120, to: "lagerfeuerplatz" },
    ],

    blocks: [],
    actions: [],
  },

  tenne: {
    id: "tenne",
    name: "Tenne",
    img: "assets/scenes/tenne.png",

    spawn: null,
    spawnFrom: {},

    hotspots: [{
                x: 454, y: 114, w: 268, h: 152, to: "jungscharhaus" },

  ],


    blocks: [
      // block Himmel
      { x: 0, y: 0, w: 1200, h: 100 },
    ],

    actions: [],
  },

  // ===== HAUS INNEN =====
  jungscharhaus_eingangsbereich: {
    id: "jungscharhaus_eingangsbereich",
    name: "Eingangsbereich",
    img: "assets/scenes/jungscharhaus_eingangsbereich.jpeg",

    spawn: null,
    spawnFrom: {},

    hotspots: [
      { x: 500, y: 184, w: 100, h: 242, to: "jungscharhaus" },
      { x: 20, y: 164, w: 160, h: 442, to: "jungscharhaus_badezimmer" },
      { x: 900, y: 164, w: 160, h: 442, to: "jungscharhaus_kueche" },
{ x: 316, y: 130, w: 146, h: 241, to: "jungscharhaus_1og" },    ],

    blocks: [],
    actions: [],
  },

  jungscharhaus_kueche: {
    id: "jungscharhaus_kueche",
    name: "Küche",
    img: "assets/scenes/jungscharhaus_kueche.jpeg",

    spawn: { x: 499, y: 442 },
    spawnFrom: {

      jungscharhaus_eingangsbereich: { x: 296, y: 484 },
      jungscharhaus_geheimzimmer: { x: 987, y: 408 },


    },

    hotspots: [
      { x: 955, y: 211, w: 104, h: 170, to: "jungscharhaus_geheimzimmer" },
      { x: 6, y: 73, w: 270, h: 545, to: "jungscharhaus_eingangsbereich" },
    ],

    blocks: [],
    actions: [],
  },

  jungscharhaus_badezimmer: {
    id: "jungscharhaus_badezimmer",
    name: "Badezimmer",
    img: "assets/scenes/jungscharhaus_badezimmer.jpeg",

    spawn: { x: 571, y: 410 },
    spawnFrom: {

      jungscharhaus_eingangsbereich:{ x: 539, y: 413 },
    },

    hotspots: [
      { x: 37, y: 466, w: 1005, h: 138, to: "jungscharhaus_eingangsbereich" },
    ],

    blocks: [],
    actions: [],
  },

  jungscharhaus_kinderzimmer: {
    id: "jungscharhaus_kinderzimmer",
    name: "Kinderzimmer",
    img: "assets/scenes/jungscharhaus_kinderzimmer.jpeg",

    spawn: null,
    spawnFrom: {},

    hotspots: [{ x: 40, y: 260, w: 160, h: 240, to: "jungscharhaus_1og" }],

    blocks: [],
    actions: [],
  },

  jungscharhaus_1og: {
    id: "jungscharhaus_1og",
    name: "1. OG",

    // ⚠️ Empfehlung: Datei umbenennen -> jungscharhaus_1og.jpeg
    img: "assets/scenes/jungscharhaus_1.og.jpeg",

    spawn: { x: 530, y: 552 },
    spawnFrom: {
      jungscharhaus_eingangsbereich: { x: 530, y: 552 },
      jungscharhaus_kinderzimmer: { x: 247, y: 420 },
    },

    hotspots: [
      { x: 40, y: 260, w: 160, h: 240, to: "jungscharhaus_eingangsbereich" },
      { x: 248, y: 150, w: 114, h: 214, to: "jungscharhaus_kinderzimmer" },
      { x: 348, y: 373, w: 401, h: 143, to: "jungscharhaus_eingangsbereich" },
    ],

    blocks: [
{ x: 332, y: 345, w: 38, h: 164 },
{ x: 358, y: 286, w: 77, h: 56 },
{ x: 440, y: 277, w: 205, h: 32 },



    ],
    actions: [],
  },

  jungscharhaus_geheimzimmer: {
    id: "jungscharhaus_geheimzimmer",
    name: "Geheimzimmer",
    img: "assets/scenes/jungscharhaus_geheimzimmer.png",

    spawn: null,
    spawnFrom: {},

    hotspots: [{ x: 170, y: 37, w: 100, h: 263, to: "jungscharhaus_kueche" },
              { x: 458, y: 132, w: 115, h: 157, to: "jungscharhaus_gang_1" },

  ],
    blocks: [
      // Unten
      { x: 566, y: 536, w: 36, h: 78 },
      { x: 643, y: 577, w: 17, h: 13 },
      { x: 602, y: 530, w: 57, h: 80 },
      { x: 459, y: 541, w: 103, h: 76 },
      { x: 9, y: 309, w: 193, h: 62 },
      { x: 366, y: 532, w: 93, h: 81 },
      { x: 121, y: 387, w: 125, h: 150 },
      { x: 123, y: 523, w: 193, h: 93 },
      { x: 305, y: 532, w: 42, h: 76 },
      { x: 665, y: 470, w: 38, h: 58 },

      // Decke
      { x: 11, y: 66, w: 130, h: 223 },
      { x: 299, y: 95, w: 58, h: 240 },
      { x: 266, y: 8, w: 833, h: 98 },
      { x: 361, y: 114, w: 70, h: 215 },
      { x: 583, y: 112, w: 181, h: 112 },
      { x: 1014, y: 111, w: 79, h: 449 },
    ],

    actions: [
      {
        id: "infotafel_1",
        x: 773,
        y: 130,
        w: 250,
        h: 166,
        trigger: "enter",
        slides: [
          "assets/dialogs/essenszelt/info1.png",
          "assets/dialogs/essenszelt/info2.png",
          "assets/dialogs/essenszelt/info3.png",
        ],
        once: false,
        autoCloseOnMove: true,
      },
    ],

    // (falls du später brauchst)
    // spawn: null,
    // spawnFrom: {},
  },

  jungscharhaus_gang_1: {
    id: "jungscharhaus_gang_1",
    name: "jungscharhaus_gang_1",
    img: "assets/scenes/jungscharhaus_gang_1.png",

    spawn: null,
    spawnFrom: {},

    hotspots: [{ x: 40, y: 260, w: 160, h: 240, to: "jungscharhaus_geheimzimmer" },
                { x: 474, y: 145, w: 192, h: 208, to: "jungscharhaus_gang_2" },

  ],

    blocks: [],
    actions: [],
  },
  jungscharhaus_dachboden: {
    id: "jungscharhaus_dachboden",
    name: "Dachboden",
    img: "assets/scenes/jungscharhaus_dachboden.jpeg",

    spawn: null,
    spawnFrom: {
      jungscharhaus_eingangsbereich: { x: 296, y: 484 },
    },

    hotspots: [{ x: 40, y: 260, w: 160, h: 240, to: "jungscharhaus_1og" }],

    blocks: [],
    actions: [],
  },
  jungscharhaus_gang_2: {
    id: "jungscharhaus_gang_2",
    name: "Gang2",
    img: "assets/scenes/jungscharhaus_gang_2.png",

    spawn: null,
    spawnFrom: {
      jungscharhaus_eingangsbereich: { x: 296, y: 484 },
    },

    hotspots: [{ x: 40, y: 260, w: 160, h: 240, to: "jungscharhaus_1og" },
                { x: 693, y: 111, w: 236, h: 311, to: "jungscharhaus_heizraum" },
              ],
    blocks: [],
    actions: [],
  },

  jungscharhaus_heizraum: {
    id: "jungscharhaus_dachboden",
    name: "Heizraum",
    img: "assets/scenes/jungscharhaus_heizraum.png",

    spawn: null,
    spawnFrom: {
      jungscharhaus_eingangsbereich: { x: 296, y: 484 },
    },

    hotspots: [{ x: 40, y: 260, w: 160, h: 240, to: "tenne" }],

    blocks: [],
    actions: [],
  },
};
