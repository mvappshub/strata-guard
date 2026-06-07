// zdroj pravdy: scripts/check-fanout.mjs
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

export const FANOUT_LAYERS = ['ui', 'api', 'service', 'repository'];
export const FANOUT_WARN_AT = 3;
export const EXPORTS_WARN_AT = 5;

const layerOf = (p) => (p.match(/^src\/([^/]+)\//) || [])[1] || null;

function countExports(file, root) {
  const abs = join(root, file);
  const sf = ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true);
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

/** Značky fan-out/export WARN — stejná logika jako check-fanout.mjs, ne vlastní verdikt. */
export function marksFromGraph(graph, root) {
  const fanOut = [];
  const exportWarn = [];

  for (const mod of graph.modules) {
    const from = layerOf(mod.source);
    if (from && FANOUT_LAYERS.includes(from)) {
      const hit = new Set();
      for (const dep of mod.dependencies || []) {
        const to = layerOf(dep.resolved || '');
        if (to && FANOUT_LAYERS.includes(to) && to !== from) hit.add(to);
      }
      if (hit.size >= FANOUT_WARN_AT) fanOut.push(mod.source);
    }

    const f = mod.source;
    if (!/^src\/.+\.(ts|tsx)$/.test(f)) continue;
    if (/(^|\/)index\.ts$/.test(f) || /\.test\.tsx?$/.test(f)) continue;
    if (countExports(f, root) > EXPORTS_WARN_AT) exportWarn.push(f);
  }

  return { fanOut, exportWarn };
}
