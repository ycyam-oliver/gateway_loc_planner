"use strict";

const SVG_NS = "http://www.w3.org/2000/svg";
const MAP_WIDTH = 1148;
const MAP_HEIGHT = 850;
const GATEWAY_HEIGHT_DELTA_M = 3.8;
const DEFAULT_WALL_LOSS = 10;

const ROOM_COLOURS = {
  Gestation: [47, 155, 95],
  Insemination: [119, 91, 193],
  Farrowing: [79, 120, 142],
  Gilts: [231, 119, 53],
};

const LAAGVEEN_REGIONS = [
  { id: "gestation-a", name: "Upper gestation A", semantic: "Gestation", x0: 278, x1: 427, y0: 13, y1: 241, widthM: 20.1, heightM: 40.0, clutter: 1 },
  { id: "gestation-b", name: "Upper gestation B", semantic: "Gestation", x0: 349, x1: 425, y0: 254, y1: 483, widthM: 11.2, heightM: 40.0, clutter: 1 },
  { id: "gestation-c", name: "Lower gestation", semantic: "Gestation", x0: 147, x1: 335, y0: 530, y1: 781, widthM: 22.6, heightM: 33.5, clutter: 1 },
  { id: "insemination", name: "Insemination", semantic: "Insemination", x0: 347, x1: 445, y0: 530, y1: 781, widthM: 11.6, heightM: 33.5, clutter: 2 },
  { id: "farrowing", name: "Farrowing", semantic: "Farrowing", x0: 623, x1: 858, y0: 530, y1: 781, widthM: 28.2, heightM: 33.5, clutter: 4 },
  { id: "gilts", name: "Gilts", semantic: "Gilts", x0: 984, x1: 1120, y0: 530, y1: 781, widthM: 16.3, heightM: 33.5, clutter: 2 },
];

const LAAGVEEN_WALLS = [
  [[278, 13], [1143, 13]], [[278, 13], [278, 530]], [[1143, 13], [1143, 483]],
  [[278, 254], [349, 254]], [[349, 254], [349, 483]], [[278, 483], [1143, 483]],
  [[365, 483], [365, 530]], [[393, 483], [393, 530]], [[707, 483], [707, 530]],
  [[725, 483], [725, 530]], [[789, 483], [789, 530]], [[147, 530], [1120, 530]],
  [[147, 530], [147, 781]], [[1120, 530], [1120, 781]], [[147, 781], [1120, 781]],
  [[190, 781], [190, 835]], [[1080, 781], [1080, 835]], [[190, 835], [1080, 835]],
];

const VAN_DUINHOVEN_REGIONS = [
  { id: "gestation-654", name: "Gestation A", semantic: "Gestation", sowCount: 654, x0: 69, x1: 824, y0: 40, y1: 241, widthM: 96.3, heightM: 21.6, clutter: 1,
    points: [[69, 40], [824, 40], [824, 221], [690, 221], [690, 241], [69, 241]] },
  { id: "insemination-88", name: "Insemination", semantic: "Insemination", sowCount: 88, x0: 705, x1: 960, y0: 241, y1: 318, widthM: 31.9, heightM: 9.3, clutter: 2 },
  { id: "farrowing-130", name: "Farrowing A", semantic: "Farrowing", sowCount: 130, x0: 705, x1: 1052, y0: 318, y1: 488, widthM: 44.5, heightM: 18.6, clutter: 4 },
  { id: "farrowing-150", name: "Farrowing B", semantic: "Farrowing", sowCount: 150, x0: 811, x1: 1074, y0: 502, y1: 782, widthM: 36.0, heightM: 41.3, clutter: 4,
    points: [[811, 502], [1074, 502], [1074, 700], [1022, 700], [1022, 782], [811, 782]] },
  { id: "gestation-90", name: "Gestation B", semantic: "Gestation", sowCount: 90, x0: 407, x1: 690, y0: 715, y1: 823, widthM: 30.5, heightM: 11.7, clutter: 1 },
];

const VAN_DUINHOVEN_WALLS = [
  [[69, 40], [960, 40]], [[69, 40], [69, 261]], [[69, 241], [690, 241]], [[690, 241], [690, 221]],
  [[690, 221], [824, 221]], [[824, 221], [824, 40]], [[69, 261], [690, 261]],
  [[960, 40], [960, 318]], [[705, 241], [993, 241]], [[690, 261], [690, 318]], [[705, 241], [705, 318]],
  [[993, 241], [993, 318]], [[315, 318], [690, 318]], [[705, 318], [1092, 318]], [[315, 318], [315, 675]],
  [[690, 318], [690, 488]], [[705, 318], [705, 488]], [[690, 502], [690, 675]], [[690, 675], [690, 715]], [[690, 715], [690, 823]], [[1092, 318], [1092, 488]],
  [[315, 488], [690, 488]], [[315, 502], [690, 502]], [[705, 488], [1092, 488]],
  [[1092, 488], [1092, 502]], [[705, 502], [1092, 502]], [[315, 675], [690, 675]], [[705, 502], [705, 782]],
  [[811, 502], [811, 782]], [[1074, 502], [1074, 700]], [[1092, 502], [1092, 700]], [[1022, 700], [1092, 700]], [[1022, 700], [1022, 782]], [[690, 782], [705, 782]], [[705, 782], [1022, 782]],
  [[407, 715], [690, 715]], [[407, 715], [407, 823]], [[407, 823], [690, 823]],
];

const FARMS = {
  laagveen: {
    id: "laagveen", name: "Laagveen", data: window.OPTIMIZED_LAYOUT_DATA,
    minGateways: 6, maxGateways: 25, pixelToMetre: 0.12,
    regions: LAAGVEEN_REGIONS, walls: LAAGVEEN_WALLS,
    semantics: ["Gestation", "Insemination", "Farrowing", "Gilts"],
    coverageRects: [
      { x: 278, y: 13, width: 865, height: 228 },
      { x: 349, y: 254, width: 794, height: 229 },
      { x: 147, y: 530, width: 973, height: 305 },
    ],
    badges: [
      { regionId: "gestation-a", x: 288, y: 27, width: 129, label: "GESTATION A" },
      { regionId: "gestation-b", x: 393, y: 423, width: 154, label: "GESTATION B", rotate: -90 },
      { regionId: "gestation-c", x: 158, y: 544, width: 166, label: "GESTATION C" },
      { regionId: "insemination", x: 413, y: 753, width: 195, label: "INSEMINATION", rotate: -90 },
      { regionId: "farrowing", x: 642, y: 544, width: 197, label: "FARROWING" },
      { regionId: "gilts", x: 994, y: 544, width: 116, label: "GILTS" },
    ],
    dynamicBase: false,
    receptionHelp: "Tagged areas expected to receive a usable signal from at least one gateway.",
  },
  "van-duinhoven-oss": {
    id: "van-duinhoven-oss", name: "van Duinhoven Oss", data: window.VAN_DUINHOVEN_LAYOUT_DATA,
    minGateways: window.VAN_DUINHOVEN_LAYOUT_DATA?.minGatewayCount ?? 5,
    maxGateways: window.VAN_DUINHOVEN_LAYOUT_DATA?.maxGatewayCount ?? 23,
    pixelToMetre: 0.12, regions: VAN_DUINHOVEN_REGIONS, walls: VAN_DUINHOVEN_WALLS,
    coverageInterestOnly: true,
    semantics: ["Gestation", "Insemination", "Farrowing"],
    coverageRects: [
      { x: 69, y: 40, width: 891, height: 221 },
      { x: 705, y: 241, width: 288, height: 77 },
      { x: 315, y: 318, width: 777, height: 170 },
      { x: 315, y: 502, width: 707, height: 321 },
      { x: 1022, y: 502, width: 70, height: 198 },
      { x: 407, y: 715, width: 285, height: 108 },
    ],
    badges: [
      { regionId: "gestation-654", x: 86, y: 55, width: 145, label: "GESTATION A" },
      { regionId: "insemination-88", x: 720, y: 246, width: 155, label: "INSEMINATION" },
      { regionId: "farrowing-130", x: 720, y: 332, width: 155, label: "FARROWING A" },
      { regionId: "farrowing-150", x: 828, y: 516, width: 155, label: "FARROWING B" },
      { regionId: "gestation-90", x: 423, y: 727, width: 145, label: "GESTATION B" },
    ],
    dynamicBase: true,
    shells: [
      { x: 69, y: 40, width: 755, height: 201, pattern: "pen-grid" },
      { x: 824, y: 40, width: 136, height: 201, service: true },
      { points: [[69, 241], [690, 241], [690, 221], [824, 221], [824, 241], [705, 241], [705, 261], [69, 261]], corridor: true, pattern: "corridor-hatch" },
      { x: 690, y: 261, width: 15, height: 57, corridor: true, pattern: "corridor-hatch" },
      { x: 705, y: 241, width: 255, height: 77, pattern: "pen-grid" },
      { x: 960, y: 241, width: 33, height: 77, corridor: true },
      { x: 315, y: 318, width: 125, height: 170, service: true },
      { x: 440, y: 318, width: 250, height: 170, pattern: "pen-grid" },
      { x: 690, y: 318, width: 15, height: 170, corridor: true, pattern: "corridor-hatch" },
      { x: 705, y: 318, width: 347, height: 170, pattern: "farrowing-grid" },
      { x: 1052, y: 318, width: 40, height: 170, corridor: true },
      { x: 315, y: 502, width: 375, height: 173, pattern: "pen-grid" },
      { x: 690, y: 502, width: 15, height: 280, corridor: true, pattern: "corridor-hatch" },
      { x: 705, y: 502, width: 106, height: 280, pattern: "pen-grid" },
      { points: [[811, 502], [1074, 502], [1074, 700], [1022, 700], [1022, 782], [811, 782]], pattern: "farrowing-grid" },
      { x: 1074, y: 502, width: 18, height: 198, corridor: true, pattern: "corridor-hatch" },
      { x: 407, y: 715, width: 283, height: 108, pattern: "gestation-grid" },
    ],
    aisles: [
      { x: 69, y: 146, width: 755, height: 16 },
      { x: 705, y: 274, width: 255, height: 12 },
      { x: 315, y: 488, width: 777, height: 14, corridor: true, pattern: "corridor-hatch" },
      { x: 315, y: 548, width: 375, height: 15 },
      { x: 705, y: 606, width: 317, height: 15 },
    ],
    detailGrids: [
      { x: 69, y: 40, width: 755, height: 201, columns: 12, rows: 2 },
      { x: 705, y: 241, width: 255, height: 77, columns: 18, rows: 2 },
      { x: 440, y: 318, width: 250, height: 170, columns: 6, rows: 2 },
      { x: 705, y: 318, width: 347, height: 170, columns: 7, rows: 2 },
      { x: 315, y: 502, width: 375, height: 173, columns: 7, rows: 3 },
      { x: 705, y: 502, width: 106, height: 280, columns: 2, rows: 4 },
      { x: 811, y: 502, width: 211, height: 280, columns: 6, rows: 4 },
      { x: 1022, y: 502, width: 52, height: 198, columns: 2, rows: 3 },
      { x: 407, y: 715, width: 283, height: 108, columns: 6, rows: 2 },
    ],
    constructionLines: [
      [[69, 40], [960, 40]], [[69, 40], [69, 261]], [[69, 241], [690, 241]], [[690, 241], [690, 221]],
      [[690, 221], [824, 221]], [[824, 221], [824, 40]], [[69, 261], [690, 261]], [[690, 261], [705, 261]],
      [[690, 261], [690, 318]], [[705, 241], [705, 261]], [[824, 221], [824, 241]],
      [[960, 40], [960, 318]], [[705, 241], [993, 241]], [[705, 241], [705, 318]],
      [[993, 241], [993, 318]], [[315, 318], [690, 318]], [[705, 318], [1092, 318]],
      [[315, 318], [315, 675]], [[690, 318], [690, 488]], [[690, 502], [690, 675]], [[690, 675], [690, 715]], [[690, 715], [690, 823]],
      [[705, 318], [705, 488]], [[1052, 318], [1052, 488]], [[1092, 318], [1092, 488]],
      [[315, 488], [690, 488]], [[705, 488], [1092, 488]], [[1092, 488], [1092, 502]], [[315, 502], [690, 502]],
      [[705, 502], [1092, 502]], [[315, 675], [690, 675]], [[705, 502], [705, 782]],
      [[811, 502], [811, 782]], [[1074, 502], [1074, 700]], [[1092, 502], [1092, 700]], [[1022, 700], [1092, 700]], [[1022, 700], [1022, 782]], [[690, 782], [705, 782]], [[705, 782], [1022, 782]],
      [[407, 715], [690, 715]], [[407, 715], [407, 823]], [[407, 823], [690, 823]],
    ],
    serviceDetails: [
      { type: "circle", cx: 268, cy: 348, r: 16 },
      { type: "circle", cx: 287, cy: 373, r: 16 },
      { type: "circle", cx: 266, cy: 399, r: 16 },
      { type: "circle", cx: 287, cy: 424, r: 16 },
      { type: "rect", x: 266, y: 506, width: 48, height: 66 },
      { type: "line", x1: 266, y1: 518, x2: 314, y2: 518 },
      { type: "line", x1: 266, y1: 530, x2: 314, y2: 530 },
      { type: "line", x1: 266, y1: 542, x2: 314, y2: 542 },
      { type: "line", x1: 266, y1: 554, x2: 314, y2: 554 },
      { type: "rect", x: 842, y: 58, width: 22, height: 15 },
      { type: "rect", x: 905, y: 58, width: 18, height: 15 },
      { type: "rect", x: 872, y: 112, width: 42, height: 27 },
      { type: "line", x1: 960, y1: 266, x2: 993, y2: 266 },
      { type: "line", x1: 960, y1: 293, x2: 993, y2: 293 },
      { type: "line", x1: 1052, y1: 348, x2: 1092, y2: 348 },
      { type: "line", x1: 1074, y1: 348, x2: 1074, y2: 434 },
      { type: "line", x1: 1052, y1: 434, x2: 1092, y2: 434 },
    ],
    planLabels: [
      { x: 848, y: 132, text: "SERVICE / TECHNICAL" },
      { x: 964, y: 278, text: "SERVICE", vertical: true },
      { x: 248, y: 451, text: "TANKS / ACCESS" },
      { x: 327, y: 336, text: "WORK / STORAGE" },
      { x: 492, y: 404, text: "UNTAGGED STABLE" },
      { x: 465, y: 595, text: "UNTAGGED STABLE" },
      { x: 718, y: 662, text: "UNTAGGED" },
      { x: 1064, y: 404, text: "SERVICE", vertical: true },
      { x: 826, y: 499, text: "CENTRAL GANG", small: true },
    ],
    dimensions: [
      { x: 405, y: 32, text: "96.3 m" },
      { x: 54, y: 138, text: "23.8 m", vertical: true },
      { x: 510, y: 844, text: "30.5 m" },
      { x: 1110, y: 618, text: "41.3 m", vertical: true },
    ],
    receptionHelp: "Tagged-room locations expected to receive a usable signal from at least one gateway.",
  },
};

if (!FARMS.laagveen.data || !FARMS["van-duinhoven-oss"].data) throw new Error("Precomputed farm layouts are unavailable.");

const elements = {
  base: document.getElementById("mapBase"), dynamicBase: document.getElementById("dynamicFarmBase"),
  overlaySvg: document.getElementById("mapOverlay"), canvas: document.getElementById("coverageCanvas"),
  planTitle: document.getElementById("plan-title"), farmSelect: document.getElementById("farmSelect"),
  gatewayRangeText: document.getElementById("gatewayRangeText"), receptionMetricHelp: document.getElementById("receptionMetricHelp"),
  gatewayLayer: document.getElementById("gatewayLayer"), distanceLayer: document.getElementById("gatewayDistanceLayer"),
  distanceLabelLayer: document.getElementById("gatewayDistanceLabelLayer"), focusLayer: document.getElementById("focusDimLayer"),
  overlay: document.querySelector(".map-overlay"), gatewayList: document.getElementById("gatewayList"),
  gatewayCount: document.getElementById("gatewayCount"), decrease: document.getElementById("decreaseGateway"),
  increase: document.getElementById("increaseGateway"), wallLoss: document.getElementById("wallLoss"),
  wallLossValue: document.getElementById("wallLossValue"), wallSummary: document.getElementById("wallSummary"),
  showAllDistances: document.getElementById("showAllDistances"), showCoverage: document.getElementById("showCoverage"),
  showWalls: document.getElementById("showWalls"), showRooms: document.getElementById("showRooms"),
  walls: document.getElementById("mainWalls"), roomBoundaries: document.getElementById("roomBoundaryLayer"),
  reset: document.getElementById("resetButton"), activeGatewayCount: document.getElementById("activeGatewayCount"),
  recommendationCard: document.getElementById("recommendationCard"), currentGatewayTitle: document.getElementById("currentGatewayTitle"),
  recommendationTitle: document.getElementById("recommendationTitle"), recommendationText: document.getElementById("recommendationText"),
  oneAnchorValue: document.getElementById("oneAnchorValue"), outageValue: document.getElementById("outageValue"),
  roomTypeValue: document.getElementById("roomTypeValue"), oneAnchorBest: document.getElementById("oneAnchorBest"),
  outageBest: document.getElementById("outageBest"), roomTypeBest: document.getElementById("roomTypeBest"),
  oneAnchorComparison: document.getElementById("oneAnchorComparison"), outageComparison: document.getElementById("outageComparison"),
  roomTypeComparison: document.getElementById("roomTypeComparison"),
};

elements.gatewayLayer.before(elements.roomBoundaries, elements.walls, elements.focusLayer, elements.distanceLayer);
elements.gatewayLayer.after(elements.distanceLabelLayer);

let hoveredGatewayId = null;
let renderFrame = null;

function farm() { return FARMS[elements.farmSelect.value] || FARMS.laagveen; }
function farmData() { return farm().data; }
function gatewayRange() { return { min: farm().minGateways, max: farm().maxGateways }; }
function recommendedCount() { return farmData().recommendedGatewayCount; }

function clampGatewayCount(value) {
  const parsed = Number.parseInt(value, 10);
  const { min, max } = gatewayRange();
  if (!Number.isFinite(parsed)) return recommendedCount();
  return Math.min(max, Math.max(min, parsed));
}

function currentLayout() { return farmData().layouts[String(clampGatewayCount(elements.gatewayCount.value))]; }
function activeGateways() { return currentLayout().gateways; }
function regionById(id) { return farm().regions.find((region) => region.id === id); }
function pointInPolygon(x, y, points) {
  let inside = false;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
    const [x1, y1] = points[index], [x2, y2] = points[previous];
    const crosses = ((y1 > y) !== (y2 > y)) && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1;
    if (crosses) inside = !inside;
  }
  return inside;
}
function regionContains(region, x, y) {
  return region.points ? pointInPolygon(x, y, region.points) : x >= region.x0 && x <= region.x1 && y >= region.y0 && y <= region.y1;
}
function regionAt(x, y) { return farm().regions.find((region) => regionContains(region, x, y)) || null; }
function insideBuilding(x, y) { return farm().coverageRects.some((rect) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height); }

function createSvgElement(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) if (value !== undefined) node.setAttribute(key, String(value));
  return node;
}

function shapeElement(item, attributes = {}) {
  if (item.points) return createSvgElement("polygon", { ...attributes, points: item.points.map((point) => point.join(",")).join(" ") });
  return createSvgElement("rect", { ...attributes, x: item.x ?? item.x0, y: item.y ?? item.y0,
    width: item.width ?? item.x1 - item.x0, height: item.height ?? item.y1 - item.y0 });
}

function renderDynamicBase() {
  const current = farm();
  elements.dynamicBase.replaceChildren();
  elements.base.classList.toggle("dynamic-farm", current.dynamicBase);
  if (!current.dynamicBase) return;
  elements.dynamicBase.appendChild(createSvgElement("rect", { width: MAP_WIDTH, height: MAP_HEIGHT, fill: "#f7f9f9" }));
  for (const shell of current.shells) {
    const shellClass = shell.corridor ? "corridor-strip" : shell.service ? "service-strip" : "building-shell";
    elements.dynamicBase.appendChild(shapeElement(shell, { class: shellClass,
      style: shell.pattern ? `fill:url(#${shell.pattern})` : undefined }));
  }
  for (const aisle of current.aisles) elements.dynamicBase.appendChild(createSvgElement("rect", { class: aisle.corridor ? "corridor-strip" : "aisle",
    x: aisle.x, y: aisle.y, width: aisle.width, height: aisle.height,
    style: aisle.pattern ? `fill:url(#${aisle.pattern})` : undefined }));
  const gridDetails = createSvgElement("g", { class: "plan-grid-details", "aria-hidden": "true" });
  for (const grid of current.detailGrids || []) {
    for (let column = 1; column < grid.columns; column += 1) {
      const x = grid.x + grid.width * column / grid.columns;
      gridDetails.appendChild(createSvgElement("line", { x1: x, y1: grid.y, x2: x, y2: grid.y + grid.height }));
    }
    for (let row = 1; row < grid.rows; row += 1) {
      const y = grid.y + grid.height * row / grid.rows;
      gridDetails.appendChild(createSvgElement("line", { x1: grid.x, y1: y, x2: grid.x + grid.width, y2: y }));
    }
  }
  elements.dynamicBase.appendChild(gridDetails);
  for (const region of current.regions) {
    const fill = region.semantic === "Gestation" ? "url(#gestation-grid)" : region.semantic === "Farrowing" ? "url(#farrowing-grid)" : undefined;
    elements.dynamicBase.appendChild(shapeElement(region, { class: `target-area ${region.semantic.toLowerCase()}`, fill }));
  }
  const construction = createSvgElement("g", { class: "construction-lines", "aria-hidden": "true" });
  for (const [start, end] of current.constructionLines || []) {
    construction.appendChild(createSvgElement("line", { x1: start[0], y1: start[1], x2: end[0], y2: end[1] }));
  }
  elements.dynamicBase.appendChild(construction);
  const serviceDetails = createSvgElement("g", { class: "service-details", "aria-hidden": "true" });
  for (const item of current.serviceDetails || []) {
    serviceDetails.appendChild(createSvgElement(item.type, Object.fromEntries(Object.entries(item).filter(([key]) => key !== "type"))));
  }
  elements.dynamicBase.appendChild(serviceDetails);
  const labels = createSvgElement("g", { class: "floor-labels", "aria-hidden": "true" });
  for (const item of current.planLabels || []) {
    const label = createSvgElement("text", { class: `context-label${item.vertical ? " vertical" : ""}${item.small ? " small" : ""}`, x: item.x, y: item.y });
    label.textContent = item.text;
    labels.appendChild(label);
  }
  for (const item of current.dimensions) {
    const label = createSvgElement("text", { class: `dimension${item.vertical ? " vertical" : ""}`, x: item.x, y: item.y });
    label.textContent = item.text;
    labels.appendChild(label);
  }
  elements.dynamicBase.appendChild(labels);
}

function renderRoomBoundaries() {
  elements.roomBoundaries.replaceChildren();
  const halos = createSvgElement("g", { class: "room-boundary-halos", "aria-hidden": "true" });
  const lines = createSvgElement("g", { class: "room-boundary-lines", "aria-hidden": "true" });
  for (const region of farm().regions) {
    halos.appendChild(shapeElement(region));
    lines.appendChild(shapeElement(region));
  }
  elements.roomBoundaries.append(halos, lines);
  const badges = createSvgElement("g", { class: "room-badges", "aria-hidden": "true" });
  for (const item of farm().badges) {
    const region = regionById(item.regionId);
    const transform = `translate(${item.x} ${item.y})${item.rotate ? ` rotate(${item.rotate})` : ""}`;
    const group = createSvgElement("g", { class: `room-badge ${region.semantic.toLowerCase()}`, transform });
    group.appendChild(createSvgElement("rect", { class: "badge-bg", width: item.width, height: 31, rx: 7 }));
    group.appendChild(createSvgElement("rect", { class: "badge-accent", width: 8, height: 31, rx: 4 }));
    const label = createSvgElement("text", { x: 19, y: 21 });
    label.textContent = item.label;
    group.appendChild(label);
    badges.appendChild(group);
  }
  elements.roomBoundaries.appendChild(badges);
}

function renderWalls() {
  elements.walls.replaceChildren();
  for (const [start, end] of farm().walls) {
    elements.walls.appendChild(createSvgElement("line", { x1: start[0], y1: start[1], x2: end[0], y2: end[1] }));
  }
}

function renderFarmPlan() {
  elements.planTitle.textContent = `${farm().name} floor plan`;
  elements.base.setAttribute("aria-label", `Redrawn floor plan of the ${farm().name} farm`);
  elements.overlaySvg.setAttribute("aria-label", `Main walls and gateway positions for ${farm().name}`);
  renderDynamicBase();
  renderRoomBoundaries();
  renderWalls();
  document.querySelectorAll(".room-signal-key[data-semantic]").forEach((key) => { key.hidden = !farm().semantics.includes(key.dataset.semantic); });
}

function segmentIntersection(a, b, c, d) {
  const rX = b[0] - a[0], rY = b[1] - a[1], sX = d[0] - c[0], sY = d[1] - c[1];
  const denominator = rX * sY - rY * sX;
  if (Math.abs(denominator) < 1e-8) return false;
  const cax = c[0] - a[0], cay = c[1] - a[1];
  const t = (cax * sY - cay * sX) / denominator, u = (cax * rY - cay * rX) / denominator;
  return t > 0.002 && t < 0.998 && u >= 0 && u <= 1;
}

function countWallCrossings(x1, y1, x2, y2) {
  return farm().walls.reduce((count, [start, end]) => count + (segmentIntersection([x1, y1], [x2, y2], start, end) ? 1 : 0), 0);
}

function signalDbm(x, y, gateway, wallLossDb) {
  const dx = (x - gateway.x) * farm().pixelToMetre, dy = (y - gateway.y) * farm().pixelToMetre;
  const distanceM = Math.sqrt(dx * dx + dy * dy + GATEWAY_HEIGHT_DELTA_M ** 2);
  const localRegion = regionAt(x, y);
  return -36.5 - 22 * Math.log10(Math.max(distanceM, 1))
    - countWallCrossings(x, y, gateway.x, gateway.y) * wallLossDb - (localRegion ? localRegion.clutter : 1.5);
}

function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }

function dominantRoomSignal(x, y, gateways, wallLossDb) {
  const strongest = Object.fromEntries(farm().semantics.map((semantic) => [semantic, -120]));
  for (const gateway of gateways) strongest[gateway.semantic] = Math.max(strongest[gateway.semantic], signalDbm(x, y, gateway, wallLossDb));
  const ranked = Object.entries(strongest).sort((left, right) => right[1] - left[1]);
  return { room: ranked[0][0], rssi: ranked[0][1], margin: ranked[0][1] - ranked[1][1] };
}

function dominantRoomColour(room, rssi, margin) {
  const base = ROOM_COLOURS[room];
  const strength = clamp((rssi + 94) / 36, 0, 1), ambiguity = 1 - clamp(margin / 6, 0, 1);
  const whiteMix = 0.78 - strength * 0.64;
  let colour = base.map((channel) => Math.round(channel * (1 - whiteMix) + 250 * whiteMix));
  const neutral = [133, 145, 141], neutralMix = ambiguity * 0.35;
  colour = colour.map((channel, index) => Math.round(channel * (1 - neutralMix) + neutral[index] * neutralMix));
  return [...colour, 0.38 + strength * 0.30];
}

function drawCoverage() {
  const context = elements.canvas.getContext("2d", { alpha: true });
  context.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  if (!elements.showCoverage.checked) { elements.canvas.style.opacity = "0"; return; }
  elements.canvas.style.opacity = "1";
  const gateways = activeGateways(), wallLossDb = Number(elements.wallLoss.value), cell = 9;
  for (let y = 0; y < MAP_HEIGHT; y += cell) {
    for (let x = 0; x < MAP_WIDTH; x += cell) {
      const centreX = x + cell / 2, centreY = y + cell / 2;
      if (!insideBuilding(centreX, centreY) || (farm().coverageInterestOnly && !regionAt(centreX, centreY))) continue;
      const dominant = dominantRoomSignal(centreX, centreY, gateways, wallLossDb);
      const [red, green, blue, alpha] = dominantRoomColour(dominant.room, dominant.rssi, dominant.margin);
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      context.fillRect(x, y, cell + 1, cell + 1);
    }
  }
}

function gatewayNumber(gateway) { return Number.parseInt(gateway.id.replace(/\D/g, ""), 10) || 0; }

function polygonAxisBounds(region, gateway, axis) {
  if (!region.points) return axis === "horizontal" ? [region.x0, region.x1] : [region.y0, region.y1];
  const constant = axis === "horizontal" ? gateway.y : gateway.x, intersections = [];
  for (let index = 0; index < region.points.length; index += 1) {
    const start = region.points[index], end = region.points[(index + 1) % region.points.length];
    const first = axis === "horizontal" ? start[1] : start[0], second = axis === "horizontal" ? end[1] : end[0];
    if ((first <= constant && constant < second) || (second <= constant && constant < first)) {
      const ratio = (constant - first) / (second - first);
      intersections.push((axis === "horizontal" ? start[0] : start[1])
        + ratio * ((axis === "horizontal" ? end[0] : end[1]) - (axis === "horizontal" ? start[0] : start[1])));
    }
  }
  return intersections.length >= 2 ? [Math.min(...intersections), Math.max(...intersections)]
    : axis === "horizontal" ? [region.x0, region.x1] : [region.y0, region.y1];
}

function measurementFor(gateway, axis) {
  const region = regionById(gateway.regionId), order = gatewayNumber(gateway);
  if (axis === "horizontal") {
    const [minimum, maximum] = polygonAxisBounds(region, gateway, axis);
    const first = gateway.x - minimum, second = maximum - gateway.x;
    const end = (Math.abs(first - second) < 0.5 ? order % 2 === 1 : first < second) ? minimum : maximum;
    return { x1: gateway.x, y1: gateway.y, x2: end, y2: gateway.y,
      distanceM: Math.abs(end - gateway.x) * region.widthM / (region.x1 - region.x0),
      labelX: (gateway.x + end) / 2, labelY: gateway.y + (order % 2 === 0 ? 13 : -8), axis: "horizontal", textAnchor: "middle" };
  }
  const [minimum, maximum] = polygonAxisBounds(region, gateway, axis);
  const first = gateway.y - minimum, second = maximum - gateway.y;
  const end = (Math.abs(first - second) < 0.5 ? order % 2 === 1 : first < second) ? minimum : maximum;
  const left = gateway.x > (region.x0 + region.x1) / 2;
  return { x1: gateway.x, y1: gateway.y, x2: gateway.x, y2: end,
    distanceM: Math.abs(end - gateway.y) * region.heightM / (region.y1 - region.y0),
    labelX: gateway.x + (left ? -12 : 12), labelY: (gateway.y + end) / 2,
    axis: "vertical", textAnchor: left ? "end" : "start" };
}

function appendMeasurement(lineGroup, labelGroup, measurement) {
  const lineAttributes = { x1: measurement.x1, y1: measurement.y1, x2: measurement.x2, y2: measurement.y2 };
  lineGroup.appendChild(createSvgElement("line", { ...lineAttributes, class: "distance-halo" }));
  lineGroup.appendChild(createSvgElement("line", { ...lineAttributes, class: "distance-line" }));
  const cap = measurement.axis === "horizontal"
    ? { x1: measurement.x2, y1: measurement.y2 - 5, x2: measurement.x2, y2: measurement.y2 + 5 }
    : { x1: measurement.x2 - 5, y1: measurement.y2, x2: measurement.x2 + 5, y2: measurement.y2 };
  lineGroup.appendChild(createSvgElement("line", { ...cap, class: "distance-cap" }));
  const label = createSvgElement("text", { class: "distance-label", x: measurement.labelX, y: measurement.labelY, "text-anchor": measurement.textAnchor });
  label.textContent = `${measurement.distanceM.toFixed(1)} m`;
  labelGroup.appendChild(label);
}

function appendDistanceGuide(gateway) {
  const attributes = { class: `distance-guide room-${gateway.semantic.toLowerCase()} hover-mode`, "data-gateway-id": gateway.id };
  const lines = createSvgElement("g", attributes), labels = createSvgElement("g", attributes);
  appendMeasurement(lines, labels, measurementFor(gateway, "horizontal"));
  appendMeasurement(lines, labels, measurementFor(gateway, "vertical"));
  elements.distanceLayer.appendChild(lines); elements.distanceLabelLayer.appendChild(labels);
}

function appendAllDistanceMeasurement(lineGroup, labelGroup, gateway, measurement, indexInRegion) {
  const lane = (indexInRegion % 3 - 1) * 6;
  let points, cap, labelX, labelY, textAnchor;
  if (measurement.axis === "horizontal") {
    const lineY = gateway.y + lane;
    points = `${gateway.x},${gateway.y} ${gateway.x},${lineY} ${measurement.x2},${lineY}`;
    cap = { x1: measurement.x2, y1: lineY - 5, x2: measurement.x2, y2: lineY + 5 };
    labelX = (gateway.x + measurement.x2) / 2; labelY = lineY + (lane >= 0 ? 14 : -8); textAnchor = "middle";
  } else {
    const lineX = gateway.x + lane;
    points = `${gateway.x},${gateway.y} ${lineX},${gateway.y} ${lineX},${measurement.y2}`;
    cap = { x1: lineX - 5, y1: measurement.y2, x2: lineX + 5, y2: measurement.y2 };
    labelX = lineX + (lane > 0 ? 9 : -9); labelY = (gateway.y + measurement.y2) / 2; textAnchor = lane > 0 ? "start" : "end";
  }
  lineGroup.appendChild(createSvgElement("polyline", { points, class: "all-distance-halo" }));
  lineGroup.appendChild(createSvgElement("polyline", { points, class: "all-distance-line" }));
  lineGroup.appendChild(createSvgElement("line", { ...cap, class: "all-distance-cap" }));
  const label = createSvgElement("text", { class: "all-distance-label", x: labelX, y: labelY, "text-anchor": textAnchor,
    "data-axis": measurement.axis,
    "data-shift-direction": measurement.axis === "horizontal" ? (labelY < gateway.y + lane ? -1 : 1) : (textAnchor === "start" ? 1 : -1) });
  label.textContent = `${measurement.distanceM.toFixed(1)} m`; labelGroup.appendChild(label);
}

function appendAllDistanceSummary(gateway, indexInRegion) {
  const attributes = { class: `distance-guide room-${gateway.semantic.toLowerCase()} all-distance-summary`, "data-gateway-id": gateway.id };
  const lines = createSvgElement("g", attributes), labels = createSvgElement("g", attributes);
  appendAllDistanceMeasurement(lines, labels, gateway, measurementFor(gateway, "horizontal"), indexInRegion);
  appendAllDistanceMeasurement(lines, labels, gateway, measurementFor(gateway, "vertical"), indexInRegion);
  elements.distanceLayer.appendChild(lines); elements.distanceLabelLayer.appendChild(labels);
}

function boxesOverlap(a, b, padding = 3) {
  return a.x < b.x + b.width + padding && a.x + a.width + padding > b.x && a.y < b.y + b.height + padding && a.y + a.height + padding > b.y;
}

function badgeBounds() {
  return farm().badges.map((item) => ({ x: item.rotate ? item.x - 31 : item.x, y: item.rotate ? item.y - item.width : item.y,
    width: item.rotate ? 31 : item.width, height: item.rotate ? item.width : 31 }));
}

function resolveAllDistanceLabelCollisions() {
  const placed = [...badgeBounds(), ...activeGateways().map((gateway) => ({ x: gateway.x - 19, y: gateway.y - 19, width: 38, height: 38 }))];
  elements.distanceLabelLayer.querySelectorAll(".all-distance-label").forEach((label) => {
    const axis = label.dataset.axis, direction = Number(label.dataset.shiftDirection) || 1;
    const baseX = Number(label.getAttribute("x")), baseY = Number(label.getAttribute("y"));
    const primaryOffsets = [0, direction, -direction, 2 * direction, -2 * direction, 3 * direction, -3 * direction, 4 * direction, -4 * direction, 5 * direction, -5 * direction, 6 * direction, -6 * direction];
    const secondaryOffsets = [0, -1, 1, -2, 2];
    let bounds = label.getBBox(), resolved = false;
    for (const primary of primaryOffsets) {
      for (const secondary of secondaryOffsets) {
        const x = axis === "horizontal" ? baseX + secondary * 16 : baseX + primary * 14;
        const y = axis === "horizontal" ? baseY + primary * 12 : baseY + secondary * 12;
        label.setAttribute("x", String(x)); label.setAttribute("y", String(y)); bounds = label.getBBox();
        const inside = bounds.x >= 4 && bounds.y >= 4 && bounds.x + bounds.width <= MAP_WIDTH - 4 && bounds.y + bounds.height <= MAP_HEIGHT - 4;
        if (inside && !placed.some((other) => boxesOverlap(bounds, other))) { resolved = true; break; }
      }
      if (resolved) break;
    }
    placed.push(bounds);
  });
}

function addAllDistanceLabelBackgrounds() {
  elements.distanceLabelLayer.querySelectorAll(".all-distance-label").forEach((label) => {
    const bounds = label.getBBox();
    label.parentNode.insertBefore(createSvgElement("rect", { class: "all-distance-label-bg", x: bounds.x - 3, y: bounds.y - 2,
      width: bounds.width + 6, height: bounds.height + 4, rx: 3 }), label);
  });
}

function renderFocusState(gateway) {
  elements.focusLayer.replaceChildren(); elements.overlay.classList.toggle("has-gateway-focus", Boolean(gateway));
  elements.gatewayLayer.querySelectorAll(".gateway-marker").forEach((marker) => {
    marker.classList.toggle("is-focus-target", Boolean(gateway) && marker.dataset.gatewayId === gateway.id);
    marker.classList.toggle("is-room-peer", Boolean(gateway) && marker.dataset.regionId === gateway.regionId && marker.dataset.gatewayId !== gateway.id);
  });
  if (!gateway) return;
  const region = regionById(gateway.regionId), padding = 4;
  if (region.points) {
    elements.focusLayer.appendChild(shapeElement(region, { class: "focus-dim" }));
  } else {
    elements.focusLayer.appendChild(createSvgElement("rect", { class: "focus-dim", x: region.x0 - padding, y: region.y0 - padding,
      width: region.x1 - region.x0 + padding * 2, height: region.y1 - region.y0 + padding * 2 }));
  }
}

function renderDistanceGuides() {
  elements.distanceLayer.replaceChildren(); elements.distanceLabelLayer.replaceChildren();
  const gateways = activeGateways();
  if (elements.showAllDistances.checked) {
    renderFocusState(null); elements.gatewayLayer.after(elements.distanceLayer);
    const regionCounts = new Map();
    gateways.forEach((gateway) => { const index = regionCounts.get(gateway.regionId) || 0; appendAllDistanceSummary(gateway, index); regionCounts.set(gateway.regionId, index + 1); });
    resolveAllDistanceLabelCollisions(); addAllDistanceLabelBackgrounds(); return;
  }
  const hovered = gateways.find((gateway) => gateway.id === hoveredGatewayId);
  renderFocusState(hovered || null); elements.gatewayLayer.before(elements.distanceLayer); if (hovered) appendDistanceGuide(hovered);
}

function setHoveredGateway(id) { if (!elements.showAllDistances.checked) { hoveredGatewayId = id; renderDistanceGuides(); } }
function clearHoveredGateway(id) { if (!elements.showAllDistances.checked && hoveredGatewayId === id) { hoveredGatewayId = null; renderDistanceGuides(); } }

function renderGatewayMarkers() {
  elements.gatewayLayer.replaceChildren();
  for (const gateway of activeGateways()) {
    const displayRegion = regionById(gateway.regionId)?.name || gateway.region;
    const group = createSvgElement("g", { class: `gateway-marker room-${gateway.semantic.toLowerCase()}`,
      transform: `translate(${gateway.x} ${gateway.y})`, tabindex: "0", role: "img",
      "aria-label": `${gateway.id}, ${displayRegion}. Focus or hover to show distances to the nearest room boundaries.`,
      "data-gateway-id": gateway.id, "data-region-id": gateway.regionId });
    group.appendChild(createSvgElement("circle", { class: "halo", r: 16 }));
    group.appendChild(createSvgElement("circle", { class: "core", r: 11 }));
    const text = createSvgElement("text", { x: 0, y: 0 }); text.textContent = gateway.id; group.appendChild(text);
    group.addEventListener("mouseenter", () => setHoveredGateway(gateway.id)); group.addEventListener("mouseleave", () => clearHoveredGateway(gateway.id));
    group.addEventListener("focus", () => setHoveredGateway(gateway.id)); group.addEventListener("blur", () => clearHoveredGateway(gateway.id));
    elements.gatewayLayer.appendChild(group);
  }
}

function renderGatewayList() {
  elements.gatewayList.replaceChildren();
  for (const gateway of activeGateways()) {
    const region = regionById(gateway.regionId);
    const displayRegion = region?.name || gateway.region;
    const row = document.createElement("div"); row.className = "gateway-item"; row.dataset.gatewayId = gateway.id;
    row.innerHTML = `<span class="gateway-id room-${gateway.semantic.toLowerCase()}">${gateway.id}</span>
      <span class="gateway-copy"><strong>${displayRegion}</strong><span>Room grid: ${gateway.xM} m × ${gateway.yM} m${region?.sowCount ? ` · ${region.sowCount} sows` : ""}</span></span>
      <span class="gateway-antenna">${gateway.antenna}</span>`;
    elements.gatewayList.appendChild(row);
  }
}

function bestMetrics() {
  return Object.values(farmData().layouts).reduce((best, layout) => ({ one: Math.max(best.one, layout.metrics.one),
    outage: Math.max(best.outage, layout.metrics.outage), room: Math.max(best.room, layout.metrics.roomOverall) }), { one: 0, outage: 0, room: 0 });
}

function updateRecommendation(count) {
  const card = elements.recommendationCard, best = recommendedCount();
  card.classList.remove("optimal", "under", "over"); elements.recommendationTitle.textContent = `${best} gateways`;
  elements.currentGatewayTitle.textContent = `${count} gateways`;
  if (farm().geometryPending) {
    card.classList.add("under"); elements.recommendationTitle.textContent = "Recalculation pending";
    elements.recommendationText.textContent = "Floor plan corrected; gateway results remain provisional until the geometry is approved.";
    return;
  }
  if (count < best) {
    const difference = best - count; card.classList.add("under");
    elements.recommendationText.textContent = `Current selection is ${difference} gateway${difference === 1 ? "" : "s"} below the best balance.`;
  } else if (count === best) {
    card.classList.add("optimal"); elements.recommendationText.textContent = `${best} is the fewest count at the best modeled performance plateau.`;
  } else {
    const difference = count - best; card.classList.add("over");
    elements.recommendationText.textContent = `Current selection is ${difference} gateway${difference === 1 ? "" : "s"} above the best balance; the primary modeled metrics are already at their plateau.`;
  }
}

function setMetric(valueElement, bestElement, comparisonElement, value, best, digits = 0) {
  valueElement.textContent = `${Number(value).toFixed(digits)}%`; bestElement.textContent = `${Number(best).toFixed(digits)}%`;
  comparisonElement.textContent = value < best ? "<" : value > best ? ">" : "=";
}

function updateDecision() {
  const score = currentLayout().metrics, best = bestMetrics();
  setMetric(elements.oneAnchorValue, elements.oneAnchorBest, elements.oneAnchorComparison, score.one, best.one);
  setMetric(elements.outageValue, elements.outageBest, elements.outageComparison, score.outage, best.outage);
  setMetric(elements.roomTypeValue, elements.roomTypeBest, elements.roomTypeComparison, score.roomOverall, best.room, 1);
}

function updateOverlayControls() {
  const loss = Number(elements.wallLoss.value); elements.wallLossValue.textContent = `${loss} dB`;
  elements.wallSummary.textContent = loss === 0 ? "Main-wall attenuation disabled" : `Main walls: assume ${loss} dB loss per crossing`;
  elements.walls.style.opacity = elements.showWalls.checked ? "1" : "0"; elements.roomBoundaries.style.opacity = elements.showRooms.checked ? "1" : "0";
}

function updateAll() {
  const count = clampGatewayCount(elements.gatewayCount.value); elements.gatewayCount.value = String(count);
  elements.activeGatewayCount.textContent = String(count); hoveredGatewayId = null; updateRecommendation(count); updateDecision();
  updateOverlayControls(); renderGatewayMarkers(); renderGatewayList(); renderDistanceGuides(); drawCoverage();
}

function activateFarm() {
  const { min, max } = gatewayRange(); elements.gatewayCount.min = String(min); elements.gatewayCount.max = String(max);
  elements.gatewayCount.value = String(recommendedCount()); elements.gatewayRangeText.textContent = `Choose ${min}–${max}`;
  elements.receptionMetricHelp.textContent = farm().receptionHelp; renderFarmPlan(); updateAll();
}

function scheduleUpdate() {
  if (renderFrame) cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => { renderFrame = null; updateAll(); });
}

elements.decrease.addEventListener("click", () => { elements.gatewayCount.value = String(clampGatewayCount(Number(elements.gatewayCount.value) - 1)); scheduleUpdate(); });
elements.increase.addEventListener("click", () => { elements.gatewayCount.value = String(clampGatewayCount(Number(elements.gatewayCount.value) + 1)); scheduleUpdate(); });
elements.gatewayCount.addEventListener("input", scheduleUpdate); elements.gatewayCount.addEventListener("change", scheduleUpdate);
elements.farmSelect.addEventListener("change", activateFarm); elements.wallLoss.addEventListener("input", scheduleUpdate);
elements.showAllDistances.addEventListener("change", () => { hoveredGatewayId = null; renderDistanceGuides(); });
elements.showCoverage.addEventListener("change", drawCoverage); elements.showWalls.addEventListener("change", updateOverlayControls);
elements.showRooms.addEventListener("change", updateOverlayControls);
elements.reset.addEventListener("click", () => {
  elements.gatewayCount.value = String(recommendedCount()); elements.wallLoss.value = String(DEFAULT_WALL_LOSS);
  elements.showAllDistances.checked = false; elements.showCoverage.checked = true; elements.showWalls.checked = true; elements.showRooms.checked = true;
  hoveredGatewayId = null; scheduleUpdate();
});

activateFarm();
