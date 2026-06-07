import { execFileSync } from 'node:child_process';
import { createReadStream, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marksFromGraph } from './fanout.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../..');
const PUBLIC = join(HERE, 'public');

function depcruiseGraph() {
  const raw = execFileSync('pnpm', ['exec', 'depcruise', '--output-type', 'json', 'src'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

function serveFile(res, path, contentType) {
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(path).pipe(res);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (url.pathname === '/graph.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(depcruiseGraph()));
    return;
  }

  if (url.pathname === '/viz-marks.json') {
    const marks = marksFromGraph(depcruiseGraph(), ROOT);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(marks));
    return;
  }

  if (url.pathname === '/strata.layers.json') {
    serveFile(res, join(ROOT, 'strata.layers.json'), 'application/json');
    return;
  }

  if (url.pathname === '/edge-color.mjs') {
    serveFile(res, join(HERE, 'edge-color.mjs'), 'text/javascript; charset=utf-8');
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    serveFile(res, join(PUBLIC, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (url.pathname === '/app.js') {
    serveFile(res, join(PUBLIC, 'app.js'), 'text/javascript; charset=utf-8');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  console.log(`strata viz: http://127.0.0.1:${port}/`);
});
