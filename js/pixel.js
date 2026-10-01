// Converte desenhos em texto (uma string por linha, um caractere por pixel) em retângulos.
// Pixels vizinhos da mesma cor viram uma faixa; faixas iguais em linhas seguidas viram um bloco.
export function spriteRects(rows, palette, ox = 0, oy = 0) {
  const rects = [];
  const open = new Map(); // faixa → retângulo que ainda pode crescer para baixo
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const fill = palette[ch];
      if (!fill) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === ch) w++;
      const key = `${x}:${w}:${fill}`;
      const above = open.get(key);
      if (above && above.y + above.h === oy + y) {
        above.h++;
      } else {
        const rect = { x: ox + x, y: oy + y, w, h: 1, fill };
        rects.push(rect);
        open.set(key, rect);
      }
      x += w;
    }
  });
  return rects;
}

export function rectsToSvg(rects) {
  return rects.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.fill}"/>`).join('');
}

// Mapa de blocos (um caractere por bloco, '.' = vazio) → faixas horizontais do mesmo bloco.
export function tileRuns(map, size) {
  const runs = [];
  map.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      const tile = row[c];
      let w = 1;
      while (row[c + w] === tile) w++;
      if (tile !== '.') runs.push({ x: c * size, y: r * size, w: w * size, h: size, tile });
      c += w;
    }
  });
  return runs;
}
