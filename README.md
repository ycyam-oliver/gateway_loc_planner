# Multi-farm gateway placement planner

This repository is a self-contained static website for comparing gateway-placement plans across farms. It does not load the source floor-plan images or PDFs at runtime. Farm geometry, tagged rooms, main walls, gateway markers and signal heatmaps are redrawn in HTML, SVG and Canvas.

Live website: <https://ycyam-oliver.github.io/gateway_loc_planner/>

## Run locally

```bash
cd /Users/oliver/Desktop/D-Care/farm_gateways/html
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173>.

## Included farms

- **Laagveen:** 6–25 gateways; the recommended performance–gateway balance is 19.
- **van Duinhoven Oss:** 9–23 gateways; the capacity-aware recommended performance–gateway balance is 16. The five tagged rooms are named Gestation A, Gestation B, Insemination, Farrowing A and Farrowing B, following the Laagveen convention. Their printed sow counts (1,112 total) remain model metadata rather than room names.

## van Duinhoven Oss geometry and optimization status

The redraw uses the underlying black construction lines as geometry. The translucent source colours are used only to assign a room type, and the revised red-wall PDF is used only to identify which black construction lines are main walls. Sow-occupied tagged areas are stored separately from circulation and service geometry. At the bottom of Gestation A, the long narrow gang rises around the top-left corner of Insemination and continues above that room as a stepped Z-shaped passage. Insemination begins at the same vertical level as the long gang. A separate narrow vertical passage—with main walls on both sides—continues downward immediately to the left of Insemination; the remaining white space below the long gang is not part of either passage. Beside Gestation B, the main wall continues vertically through the gap above its top-right corner and crosses the narrow passage at the adjoining stable's lower edge. That passage, the central gang—with its closed main-wall end on the right—and external/service strips remain visible for installation context but are excluded from tagged coverage. Farrowing B has an L-shaped sow-occupied polygon, followed by a separate narrow non-tagged hallway along its upper-right edge; the detached utility house and dimension line are not part of the room.

The van Duinhoven Oss layouts were recalculated for every selectable count from 9 through 23 with the engineer-provided capacity rule: a gateway has a theoretical 150-sow limit, normal planning aims for approximately 100 sows per gateway, and sows are assumed to be evenly distributed within each room. The first layout that also reaches the full modeled RF plateau occurs at 16 gateways: 100% reception, 100.0% overall room-type identification and 99% reception after the single worst gateway outage. The 16-gateway allocation is seven in Gestation A, two in Insemination, two in Farrowing A, three in Farrowing B and two in Gestation B. Its busiest normal gateway carries about 93 sows; after one room gateway fails, the worst surviving load is 130 sows per gateway.

Every selectable count is optimized independently on a two-dimensional ceiling/high-wall grid. A smaller layout is not created by taking a prefix of a larger layout. Selected gateways need not share a row, column, spacing pattern or alignment; the van Duinhoven Oss run applies no relative-position or minimum-spacing constraint beyond using distinct candidate points.

## Files

- `index.html` contains the accessible page structure.
- `styles.css` contains the responsive layout and visual design.
- `optimized_layouts.js` contains the generated Laagveen layouts.
- `van_duinhoven_oss_layouts.js` contains the generated van Duinhoven Oss layouts.
- `app.js` contains the farm switch, redrawn geometry, wall-aware heatmap, distance guides and decision logic.

The offline optimization scripts and private source drawings are intentionally not required by, or included in, this public website repository.

No external libraries, fonts, trackers or network requests are used.

## Model interpretation

- Signal strength uses distance, mounting-height difference, room clutter and an assumed loss for every reviewed main-wall crossing.
- Room-type identification uses repeated eight-scan gateway detection and RSSI histories. The displayed overall score includes the difficult 10% of locations instead of hiding them behind easier areas.
- van Duinhoven Oss also screens capacity using even room distribution, an approximately 100-sow normal target and a 150-sow theoretical ceiling under one local gateway outage.
- The heatmap shows the dominant room-type signal at each location. Hue identifies Gestation, Insemination, Farrowing or Gilts where present; saturation indicates strength and close contests are muted.
- The wall loss, gateway count and all display layers remain interactive for both farms.
- Results are screening estimates. Real antenna patterns, tag sensitivity, mounting height, animals, equipment and wall materials still require an on-farm calibration survey.

## GitHub Pages deployment

The website is served directly from the repository root with GitHub Pages. The `.nojekyll` marker keeps the static files unchanged.
