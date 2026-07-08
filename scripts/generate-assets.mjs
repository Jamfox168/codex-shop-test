import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([len, name, data, crc]);
}

function createImage(width, height, painter) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  const ctx = {
    width,
    height,
    set(x, y, color) {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const i = (y * width + x) * 4;
      const a = color[3] ?? 255;
      const inv = 255 - a;
      pixels[i] = (color[0] * a + pixels[i] * inv) / 255;
      pixels[i + 1] = (color[1] * a + pixels[i + 1] * inv) / 255;
      pixels[i + 2] = (color[2] * a + pixels[i + 2] * inv) / 255;
      pixels[i + 3] = Math.min(255, a + pixels[i + 3] * inv / 255);
    },
    rect(x, y, w, h, color) {
      for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(height, y + h); yy++) {
        for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(width, x + w); xx++) this.set(xx, yy, color);
      }
    },
    circle(cx, cy, r, color, rx = r) {
      const x0 = Math.max(0, Math.floor(cx - rx));
      const x1 = Math.min(width - 1, Math.ceil(cx + rx));
      const y0 = Math.max(0, Math.floor(cy - r));
      const y1 = Math.min(height - 1, Math.ceil(cy + r));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / r;
          if (dx * dx + dy * dy <= 1) this.set(x, y, color);
        }
      }
    },
    line(x0, y0, x1, y1, color, thickness = 2) {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        this.circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, thickness, color);
      }
    },
  };
  painter(ctx);

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    Buffer.from(pixels.buffer, y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawHero(ctx) {
  const { width, height } = ctx;
  for (let y = 0; y < height; y++) {
    const t = y / height;
    for (let x = 0; x < width; x++) {
      const glow = Math.max(0, 1 - Math.hypot((x - width * 0.68) / width, (y - height * 0.32) / height) * 1.8);
      ctx.set(x, y, [
        35 + t * 35 + glow * 56,
        42 + t * 26 + glow * 32,
        38 + t * 18 + glow * 20,
        255,
      ]);
    }
  }
  ctx.rect(0, height * 0.62, width, height * 0.38, [80, 47, 32, 255]);
  for (let y = height * 0.62; y < height; y += 42) ctx.line(0, y, width, y - 26, [118, 75, 49, 80], 2);

  for (let i = 0; i < 7; i++) {
    const x = 130 + i * 185;
    ctx.line(x, 0, x + 16, 180, [51, 37, 30, 120], 2);
    ctx.circle(x + 18, 198, 58, [234, 157, 82, 55]);
    ctx.circle(x + 18, 195, 20, [249, 207, 124, 200]);
  }

  ctx.circle(720, 645, 258, [242, 234, 218, 255], 338);
  ctx.circle(720, 645, 222, [42, 92, 70, 255], 288);
  ctx.circle(720, 645, 176, [247, 232, 202, 255], 232);
  ctx.circle(720, 650, 136, [189, 69, 45, 255], 184);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const x = 720 + Math.cos(a) * (80 + (i % 4) * 16);
    const y = 650 + Math.sin(a) * (58 + (i % 5) * 10);
    ctx.circle(x, y, 18 + (i % 3) * 3, i % 2 ? [237, 186, 88, 230] : [58, 129, 72, 230], 28);
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    ctx.circle(720 + Math.cos(a) * 110, 650 + Math.sin(a) * 82, 11, [255, 244, 198, 235], 16);
  }

  ctx.line(275, 470, 330, 835, [213, 203, 183, 255], 7);
  ctx.line(322, 470, 360, 835, [213, 203, 183, 255], 7);
  ctx.line(1080, 475, 1010, 840, [213, 203, 183, 255], 7);
  ctx.line(1122, 475, 1054, 840, [213, 203, 183, 255], 7);
  ctx.circle(1068, 470, 50, [213, 203, 183, 255], 24);
  ctx.circle(285, 485, 16, [213, 203, 183, 255], 12);
  ctx.circle(323, 485, 16, [213, 203, 183, 255], 12);

  ctx.circle(505, 435, 92, [122, 31, 28, 240], 120);
  ctx.circle(506, 428, 66, [246, 219, 151, 255], 88);
  ctx.circle(924, 435, 92, [122, 31, 28, 240], 120);
  ctx.circle(925, 428, 66, [240, 220, 184, 255], 88);
  for (let i = 0; i < 12; i++) {
    ctx.circle(470 + i * 7, 410 + Math.sin(i) * 18, 10, [70, 127, 69, 230], 16);
    ctx.circle(890 + i * 7, 414 + Math.cos(i) * 14, 9, [207, 92, 48, 230], 15);
  }
}

function drawMenu(ctx) {
  const dishes = [
    { x: 210, y: 220, base: [190, 69, 46], accent: [248, 198, 99] },
    { x: 500, y: 220, base: [49, 126, 82], accent: [236, 218, 162] },
    { x: 790, y: 220, base: [210, 119, 55], accent: [75, 61, 48] },
  ];
  for (let y = 0; y < ctx.height; y++) {
    for (let x = 0; x < ctx.width; x++) ctx.set(x, y, [246 - y * 0.03, 239 - y * 0.025, 225 - y * 0.02, 255]);
  }

  const drawLeaf = (x, y, angle, color = [54, 126, 73, 235]) => {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    ctx.circle(x, y, 13, color, 27);
    ctx.line(x - dx * 18, y - dy * 18, x + dx * 18, y + dy * 18, [236, 218, 162, 150], 1);
  };

  const drawTomato = (x, y, r) => {
    ctx.circle(x, y, r, [196, 65, 43, 245], r * 1.08);
    ctx.circle(x - r * 0.28, y - r * 0.25, r * 0.18, [244, 138, 88, 210], r * 0.24);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.line(x, y - r * 0.72, x + Math.cos(a) * r * 0.5, y - r * 0.16 + Math.sin(a) * r * 0.18, [52, 108, 66, 220], 2);
    }
  };

  const drawCitrus = (x, y, r) => {
    ctx.circle(x, y, r, [241, 187, 72, 245], r * 1.1);
    ctx.circle(x, y, r * 0.72, [255, 238, 151, 245], r * 0.78);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.line(x, y, x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72, [210, 126, 46, 130], 1);
    }
  };

  for (const [index, dish] of dishes.entries()) {
    ctx.circle(dish.x, dish.y, 118, [255, 252, 242, 255], 142);
    ctx.circle(dish.x, dish.y, 88, dish.base.concat(255), 106);
    for (let i = 0; i < 18; i++) {
      const a = i * 0.9;
      ctx.circle(dish.x + Math.cos(a) * (20 + i * 3), dish.y + Math.sin(a) * (16 + i * 2), 13, dish.accent.concat(230), 19);
    }
    if (index === 0) {
      drawTomato(dish.x - 34, dish.y - 28, 17);
      drawTomato(dish.x + 34, dish.y + 22, 14);
      drawLeaf(dish.x + 16, dish.y - 42, -0.8, [62, 126, 74, 225]);
      drawLeaf(dish.x - 8, dish.y + 46, 0.4, [62, 126, 74, 225]);
    }
    if (index === 1) {
      drawCitrus(dish.x - 38, dish.y + 26, 16);
      drawCitrus(dish.x + 34, dish.y - 22, 13);
      drawLeaf(dish.x - 2, dish.y - 44, 0.7, [65, 142, 83, 230]);
      drawLeaf(dish.x + 28, dish.y + 42, -0.35, [65, 142, 83, 230]);
    }
    if (index === 2) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        ctx.circle(dish.x + Math.cos(a) * 44, dish.y + Math.sin(a) * 31, 8, [222, 185, 118, 235], 13);
      }
      ctx.circle(dish.x - 24, dish.y + 18, 10, [95, 75, 56, 230], 16);
      ctx.circle(dish.x + 24, dish.y - 16, 10, [95, 75, 56, 230], 16);
    }
    ctx.line(dish.x - 102, dish.y + 132, dish.x + 104, dish.y + 132, [78, 63, 51, 180], 4);
  }
}

writeFileSync("assets/hero-restaurant.png", createImage(1440, 900, drawHero));
writeFileSync("assets/signature-dishes.png", createImage(1000, 420, drawMenu));
