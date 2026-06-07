import { edgeStroke } from '/edge-color.mjs';

const CHIP_W = 140;
const CHIP_H = 28;
const CHIP_GAP = 8;
const BAND_PAD = 16;
const LEAF_W = 160;
const LABEL_H = 24;

function layerOf(path) {
  const m = path.match(/^src\/([^/]+)\//);
  return m ? m[1] : null;
}

function fileName(path) {
  return path.replace(/^src\/[^/]+\//, '');
}

function layoutModules(modules, render, leaf) {
  const byLayer = Object.fromEntries([...render, ...leaf].map((l) => [l, []]));
  for (const mod of modules) {
    const l = layerOf(mod.source);
    if (l && byLayer[l]) byLayer[l].push(mod.source);
  }
  for (const list of Object.values(byLayer)) list.sort();
  return byLayer;
}

function bandHeight(count) {
  return LABEL_H + BAND_PAD * 2 + Math.max(1, count) * (CHIP_H + CHIP_GAP) - CHIP_GAP;
}

function placeChips(layer, files, x0, y0) {
  const pos = new Map();
  files.forEach((f, i) => {
    pos.set(f, { x: x0, y: y0 + i * (CHIP_H + CHIP_GAP), layer });
  });
  return pos;
}

export async function loadAndRender() {
  const [graph, layers, marks] = await Promise.all([
    fetch('/graph.json').then((r) => r.json()),
    fetch('/strata.layers.json').then((r) => r.json()),
    fetch('/viz-marks.json').then((r) => r.json()),
  ]);

  const fanOutSet = new Set(marks.fanOut);
  const exportWarnSet = new Set(marks.exportWarn);

  const { render, leaf } = layers;
  const byLayer = layoutModules(graph.modules, render, leaf);

  let y = BAND_PAD;
  const positions = new Map();
  const renderX = LEAF_W + BAND_PAD * 2;

  for (const layer of render) {
    const files = byLayer[layer];
    const h = bandHeight(files.length);
    for (const [f, p] of placeChips(layer, files, renderX, y + LABEL_H + BAND_PAD)) {
      positions.set(f, { ...p, bandY: y, bandH: h });
    }
    y += h + BAND_PAD;
  }

  let leafY = BAND_PAD;
  for (const layer of leaf) {
    const files = byLayer[layer];
    const h = bandHeight(files.length);
    for (const [f, p] of placeChips(layer, files, BAND_PAD, leafY + LABEL_H + BAND_PAD)) {
      positions.set(f, { ...p, bandY: leafY, bandH: h, leaf: true });
    }
    leafY += h + BAND_PAD;
  }

  const totalH = Math.max(y, leafY) + BAND_PAD;
  const maxCols = Math.max(...render.map((l) => byLayer[l].length), 1);
  const totalW = renderX + maxCols * (CHIP_W + CHIP_GAP) + BAND_PAD;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(totalW));
  svg.setAttribute('height', String(totalH));

  const edgesG = document.createElementNS(ns, 'g');
  const nodesG = document.createElementNS(ns, 'g');
  const bandsG = document.createElementNS(ns, 'g');

  for (const mod of graph.modules) {
    const from = positions.get(mod.source);
    if (!from) continue;
    for (const dep of mod.dependencies || []) {
      const to = dep.resolved && positions.get(dep.resolved);
      if (!to) continue;
      const line = document.createElementNS(ns, 'path');
      const x1 = from.x + CHIP_W;
      const y1 = from.y + CHIP_H / 2;
      const x2 = to.x;
      const y2 = to.y + CHIP_H / 2;
      const mx = (x1 + x2) / 2;
      line.setAttribute('d', `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`);
      line.setAttribute('class', 'edge');
      line.setAttribute('stroke', edgeStroke(dep));
      edgesG.appendChild(line);
    }
  }

  let bandY = BAND_PAD;
  for (const layer of render) {
    const files = byLayer[layer];
    const h = bandHeight(files.length);
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', String(renderX - BAND_PAD / 2));
    rect.setAttribute('y', String(bandY));
    rect.setAttribute('width', String(totalW - renderX + BAND_PAD / 2));
    rect.setAttribute('height', String(h));
    rect.setAttribute('fill', '#161b22');
    rect.setAttribute('rx', '6');
    bandsG.appendChild(rect);
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', String(renderX));
    label.setAttribute('y', String(bandY + 16));
    label.setAttribute('class', 'layer-label');
    label.textContent = layer;
    bandsG.appendChild(label);
    bandY += h + BAND_PAD;
  }

  leafY = BAND_PAD;
  for (const layer of leaf) {
    const files = byLayer[layer];
    const h = bandHeight(files.length);
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', String(BAND_PAD / 2));
    rect.setAttribute('y', String(leafY));
    rect.setAttribute('width', String(LEAF_W));
    rect.setAttribute('height', String(h));
    rect.setAttribute('fill', '#161b22');
    rect.setAttribute('rx', '6');
    bandsG.appendChild(rect);
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', String(BAND_PAD));
    label.setAttribute('y', String(leafY + 16));
    label.setAttribute('class', 'layer-label');
    label.textContent = layer;
    bandsG.appendChild(label);
    leafY += h + BAND_PAD;
  }

  for (const [path, pos] of positions) {
    const g = document.createElementNS(ns, 'g');
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', String(pos.x));
    rect.setAttribute('y', String(pos.y));
    rect.setAttribute('width', String(CHIP_W));
    rect.setAttribute('height', String(CHIP_H));
    rect.setAttribute('rx', '4');
    rect.setAttribute('class', 'chip');
    if (fanOutSet.has(path)) {
      rect.setAttribute('stroke', '#d29922');
      rect.setAttribute('stroke-width', '2');
    } else if (exportWarnSet.has(path)) {
      rect.setAttribute('stroke', '#d29922');
      rect.setAttribute('stroke-dasharray', '4 2');
    }
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', String(pos.x + 6));
    text.setAttribute('y', String(pos.y + CHIP_H / 2 + 4));
    text.setAttribute('class', 'chip-label');
    text.textContent = fileName(path);
    g.appendChild(rect);
    g.appendChild(text);
    nodesG.appendChild(g);
  }

  svg.appendChild(bandsG);
  svg.appendChild(edgesG);
  svg.appendChild(nodesG);

  const host = document.getElementById('canvas');
  host.replaceChildren(svg);
}

loadAndRender().catch((e) => {
  document.getElementById('canvas').textContent = String(e);
});
