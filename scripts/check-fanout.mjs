import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const LAYERS = ['ui', 'api', 'service', 'repository'];
const FANOUT_WARN_AT = 3;
const EXPORTS_WARN_AT = 5;

const layerOf = (p) => (p.match(/^src\/([^/]+)\//) || [])[1] || null;

const raw = execFileSync('pnpm', ['exec', 'depcruise', '--output-type', 'json', 'src'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const graph = JSON.parse(raw);
let warned = false;

for (const mod of graph.modules) {
  const from = layerOf(mod.source);
  if (!from || !LAYERS.includes(from)) continue;
  const hit = new Set();
  for (const dep of mod.dependencies || []) {
    const to = layerOf(dep.resolved || '');
    if (to && LAYERS.includes(to) && to !== from) hit.add(to);
  }
  if (hit.size >= FANOUT_WARN_AT) {
    warned = true;
    console.warn(`WARN fan-out: ${mod.source} importuje ze ${hit.size} vrstev (${[...hit].join(', ')})`);
  }
}

function countExports(file) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  let n = 0;
  sf.forEachChild((node) => {
    const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    if (mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      n += ts.isVariableStatement(node) ? node.declarationList.declarations.length : 1;
    }
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      n += node.exportClause.elements.length;
    }
  });
  return n;
}

for (const mod of graph.modules) {
  const f = mod.source;
  if (!/^src\/.+\.(ts|tsx)$/.test(f)) continue;
  if (/(^|\/)index\.ts$/.test(f) || /\.test\.tsx?$/.test(f)) continue;
  const c = countExports(f);
  if (c > EXPORTS_WARN_AT) {
    warned = true;
    console.warn(`WARN exporty: ${f} exportuje ${c} věcí`);
  }
}

if (warned) console.warn('\nfan-out / exporty: WARN — zvaž rozdělení dotčených souborů.');
process.exit(0);
