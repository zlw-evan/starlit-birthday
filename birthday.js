"use strict";

const byId = (id) => document.getElementById(id);
const scene = byId("scene");
const artwork = byId("art");
const cake = byId("cake");
const sky = byId("starfield");
const starContext = sky.getContext("2d");
const cakeContext = cake.getContext("2d");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const recipient = Array.from(new URLSearchParams(location.search).get("to")?.trim() ?? "").slice(0, 14).join("");
const chapters = [...document.querySelectorAll("[data-go]")];
const music = byId("music");
const musicButton = byId("sound");

const steps = {
  welcome: ["今夜，星河", "为你亮起", recipient ? "送给 " + recipient + " 的生日惊喜。" : "有一颗爱心，装着给你的祝福。", "还有一块星河蛋糕，等你亲手点亮。", "♡", "打开生日惊喜"],
  heart: ["把祝福", "拼成一颗心", "点一张卡片，拆开一份生日祝福。", "", "✦", "去看星河蛋糕"],
  cake: ["在星河下", "许个愿吧", "点亮蜡烛，把愿望悄悄放在心里。", "", "✦", "点亮蜡烛"],
  lit: ["在星河下", "许个愿吧", "想好以后，点一下烛火把它吹熄。", "", "✦", "吹熄蜡烛"],
  done: ["生日快乐", "继续发光", recipient ? recipient + "，愿你的愿望来得刚刚好。" : "愿你的愿望，来得刚刚好。", "新的一岁，愿你平安、自由，也常常快乐。", "↻", "再看一次"],
};

const wishes = [
  ["生日快乐", "生日快乐，今天的星光都送给你。"],
  ["平安喜乐", "愿你平安喜乐，也有说走就走的勇气。"],
  ["心想事成", "愿认真期待的事，一件件实现。"],
  ["一路有光", "愿你走到哪里，都遇见一点好风景。"],
  ["好运相伴", "愿你在平凡日子里，撞上小小的好运。"],
  ["自在生活", "愿你有空发呆，有力气追喜欢的事。"],
  ["好好吃饭", "记得吃喜欢的饭，也记得对自己好一点。"],
  ["万事顺意", "愿那些让你烦恼的事，都有顺利的下文。"],
  ["甜梦常在", "愿你今晚睡个好觉，醒来还有好心情。"],
  ["天天开心", "愿你每天都有一件值得笑出声的小事。"],
  ["继续发光", "愿你喜欢现在的自己，也期待以后的自己。"],
  ["愿望成真", "愿藏在心里的愿望，终于在某天开花。"],
  ["自由热烈", "愿你自由、热烈，有勇气做想做的事。"],
  ["未来可期", "愿下一次回望，发现自己走了很远。"],
  ["常有惊喜", "愿生活偶尔为你准备一个漂亮的彩蛋。"],
  ["有人惦记", "愿你在每个普通的日子里，都被人温柔地想起。"],
  ["每天顺利", "愿你出门遇到好天气，归来还有好心情。"],
  ["温柔以待", "愿世界待你温柔，也愿你对自己温柔。"],
];
const paperColors = ["#ffd9ec", "#e4d8ff", "#d9eaff", "#ffe6ce", "#d9f6ee", "#ffecc3"];
let stage = "welcome";
let musicRequested = false;
let burstStarted = -Infinity;

function renderHeart() {
  const points = Array.from({ length: 360 }, (_, index) => {
    const angle = index * Math.PI / 180;
    return {
      x: -16 * Math.sin(angle) ** 3,
      y: -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)),
    };
  });
  let distance = 0;
  points.forEach((point, index) => {
    const previous = points[index - 1] ?? point;
    distance += Math.hypot(point.x - previous.x, point.y - previous.y);
    point.distance = distance;
  });
  const note = byId("heartNote");
  let selected;
  const cards = wishes.map(([short, long], index) => {
    const point = points.find((item) => item.distance >= distance * index / wishes.length);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "wish-paper";
    card.textContent = short;
    card.style.setProperty("--x", (50 + point.x * 2.55) + "%");
    card.style.setProperty("--y", (49 + (point.y - 2.5) * 2.55) + "%");
    card.style.setProperty("--tilt", ((index * 23 % 25) - 12) + "deg");
    card.style.setProperty("--delay", index * 58 + "ms");
    card.style.setProperty("--paper", paperColors[index % paperColors.length]);
    card.setAttribute("aria-pressed", "false");
    card.addEventListener("click", () => {
      selected?.setAttribute("aria-pressed", "false");
      selected = card;
      card.setAttribute("aria-pressed", "true");
      note.textContent = long;
      note.classList.add("has-wish");
    });
    return card;
  });
  byId("heartCards").replaceChildren(...cards);
  note.textContent = "生日快乐 ♡";
  note.classList.remove("has-wish");
}

function show(next, moveFocus = true) {
  stage = next;
  const [line, highlighted, message, second, icon, action] = steps[next];
  const chapterStep = next === "lit" || next === "done" ? "cake" : next;
  scene.dataset.stage = next;
  const title = byId("title");
  const emphasis = document.createElement("em");
  emphasis.textContent = highlighted;
  title.replaceChildren(line, document.createElement("br"), emphasis);
  const description = byId("description");
  description.textContent = message;
  if (second) description.append(document.createElement("br"), second);
  byId("actionIcon").textContent = icon;
  byId("actionText").textContent = action;
  byId("share").hidden = next !== "done";
  byId("share").textContent = "复制祝福链接";
  byId("candle").hidden = next !== "cake" && next !== "lit";
  byId("candleLabel").textContent = next === "lit" ? "吹熄蜡烛" : "点亮蜡烛";
  byId("heartScene").hidden = next !== "heart";
  cake.hidden = next === "heart";
  if (next === "heart") renderHeart();
  chapters.forEach((button) => {
    if (button.dataset.go === chapterStep) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  if (next === "done") burstStarted = performance.now();
  if (moveFocus) title.focus({ preventScroll: true });
  draw(performance.now());
}

function nextStep() {
  const path = { welcome: "heart", heart: "cake", cake: "lit", lit: "done", done: "welcome" };
  if (stage === "welcome" && !musicRequested) startMusic();
  show(path[stage], stage !== "cake");
}

function updateMusicButton() {
  const playing = !music.paused && !music.ended && !music.error;
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.title = playing ? "暂停音乐" : "播放音乐";
}

function startMusic() {
  musicRequested = true;
  music.play().catch((error) => {
    if (error.name === "AbortError") return;
    updateMusicButton();
    byId("status").textContent = "音乐暂时无法播放。";
  });
}

byId("primary").addEventListener("click", nextStep);
byId("candle").addEventListener("click", nextStep);
chapters.forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.go !== "welcome" && !musicRequested) startMusic();
  show(button.dataset.go);
}));
for (const event of ["play", "pause", "ended", "error"]) {
  music.addEventListener(event, updateMusicButton);
}
musicButton.addEventListener("click", () => {
  if (music.paused) startMusic();
  else music.pause();
});
byId("share").addEventListener("click", async () => {
  const shareUrl = new URL(location.href);
  shareUrl.hash = "";
  const text = shareUrl.href;
  try {
    await navigator.clipboard.writeText(text);
    byId("share").textContent = "链接已复制";
    byId("status").textContent = "生日祝福链接已复制。";
  } catch {
    byId("shareUrl").value = text;
    byId("shareDialog").showModal();
    byId("shareUrl").select();
  }
});

const colors = ["#fce3ff", "#c9b5ff", "#ff9dda", "#b6deff", "#ffdb98", "#fffbef"];
function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const random = seededRandom(90210);
const skyPoints = Array.from({ length: 123 }, () => ({
  x: random(), y: random(), size: .4 + random() ** 3 * 2,
  phase: random() * 6.28, color: colors[Math.floor(random() * colors.length)],
}));
const orbitPoints = Array.from({ length: 350 }, () => ({
  angle: random() * 2 * Math.PI, radius: 136 + random() ** 1.5 * 106,
  band: (random() - .5) * 22, size: .35 + random() ** 3 * 2.7,
  speed: .07 + random() * .18, color: colors[Math.floor(random() * colors.length)],
}));
const confetti = Array.from({ length: 164 }, () => ({
  angle: random() * 2 * Math.PI, speed: 50 + random() * 305,
  size: 1 + random() * 3.7, spin: random() * 12,
  color: colors[Math.floor(random() * colors.length)],
}));

function sizeCanvas(canvas, bounds) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(bounds.width * dpr));
  canvas.height = Math.max(1, Math.round(bounds.height * dpr));
}

function resize() {
  sizeCanvas(sky, scene.getBoundingClientRect());
  sizeCanvas(cake, artwork.getBoundingClientRect());
  draw(performance.now());
}

function ellipse(context, x, y, rx, ry, fill) {
  context.beginPath();
  context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
}

function sparkle(context, x, y, size, color) {
  context.beginPath();
  context.moveTo(x, y - size * 1.45);
  context.quadraticCurveTo(x + size * .16, y - size * .17, x + size, y);
  context.quadraticCurveTo(x + size * .15, y + size * .17, x, y + size * 1.45);
  context.quadraticCurveTo(x - size * .14, y + size * .16, x - size, y);
  context.quadraticCurveTo(x - size * .15, y - size * .17, x, y - size * 1.45);
  context.fillStyle = color;
  context.fill();
}

function glow(context, x, y, radius, color) {
  const light = context.createRadialGradient(x, y, 1, x, y, radius);
  light.addColorStop(0, color);
  light.addColorStop(1, "transparent");
  ellipse(context, x, y, radius, radius, light);
}

function cakeShape(context, x, y, radius, rise, height) {
  context.beginPath();
  context.moveTo(x - radius, y);
  context.ellipse(x, y, radius, rise, 0, Math.PI, Math.PI * 2);
  context.lineTo(x + radius, y + height);
  context.ellipse(x, y + height, radius, rise, 0, 0, Math.PI);
  context.closePath();
}

function gradient(context, x1, y1, x2, y2, stops) {
  const paint = context.createLinearGradient(x1, y1, x2, y2);
  stops.forEach(([position, color]) => paint.addColorStop(position, color));
  return paint;
}

function pearl(context, x, y, size, pale) {
  const paint = context.createRadialGradient(x - size * .23, y - size * .27, size * .06, x, y, size);
  paint.addColorStop(0, pale ? "#fff8ed" : "#fff2c7");
  paint.addColorStop(.38, pale ? "#f3c8ee" : "#f6d09c");
  paint.addColorStop(1, pale ? "#985cba" : "#a35b75");
  ellipse(context, x, y + size * .3, size * 1.03, size * .78, "#13081798");
  ellipse(context, x, y, size, size * .95, paint);
}

function rosette(context, x, y, size) {
  glow(context, x, y + 3, size * 1.4, "#2b1037da");
  for (let petal = 0; petal < 8; petal++) {
    const angle = petal * Math.PI / 4;
    pearl(context, x + Math.cos(angle) * size * .51, y + Math.sin(angle) * size * .37, size * .45, true);
  }
  for (let petal = 0; petal < 5; petal++) {
    const angle = petal * Math.PI * .4 + .31;
    pearl(context, x + Math.cos(angle) * size * .28, y + Math.sin(angle) * size * .21 - 1, size * .31, true);
  }
  pearl(context, x, y - 2, size * .22, false);
}

function drawTier(context, y, radius, rise, height, seed) {
  const sample = seededRandom(seed);
  const x = 260;
  const left = x - radius;
  const right = x + radius;
  const gold = gradient(context, left, y, right, y + 18, [[0, "#8d597b"], [.18, "#f3bd9d"], [.4, "#fff1c9"], [.59, "#b97b8a"], [.79, "#f8c9ac"], [1, "#805073"]]);
  const frosting = gradient(context, left, y, right, y + 15, [[0, "#291447"], [.18, "#9460ae"], [.36, "#603777"], [.58, "#322356"], [.8, "#413079"], [1, "#140c33"]]);
  const shade = gradient(context, x, y, x, y + height + rise, [[0, "#09041c13"], [.42, "#11051e00"], [1, "#0d061caa"]]);
  context.save();
  cakeShape(context, x, y, radius, rise, height);
  context.fillStyle = frosting;
  context.fill();
  context.clip();
  glow(context, left + radius * .53, y + height * .5, radius * .8, "#f192cf62");
  glow(context, right - radius * .48, y + height * .79, radius * .64, "#7476f885");
  context.fillStyle = shade;
  context.fillRect(left, y - rise, radius * 2, height + rise * 2);
  for (let strand = 0; strand < 17; strand++) {
    const line = y + height * .7 + (strand - 8) * 2.6;
    const glowColor = strand % 3 === 0 ? "#f9aada42" : "#8f8afa2d";
    context.beginPath();
    context.moveTo(left - 8, line + 8);
    context.bezierCurveTo(left + radius * .58, line + 52, right - radius * .72, line - 36, right + 8, line - 4);
    context.lineWidth = .45 + sample() * 1.1;
    context.strokeStyle = glowColor;
    context.stroke();
  }
  for (let index = 0; index < 320; index++) {
    const sx = left + sample() * radius * 2;
    const sy = y + sample() * (height + rise);
    const size = .21 + sample() ** 5 * 1.55;
    context.globalAlpha = .13 + sample() * .54;
    ellipse(context, sx, sy, size, size * .84, colors[index % colors.length]);
  }
  context.globalAlpha = 1;
  for (const gap of [4, 11]) {
    context.beginPath();
    context.ellipse(x, y + height - gap, radius - .6, rise, 0, 0, Math.PI);
    context.strokeStyle = gold;
    context.lineWidth = gap === 4 ? 2.3 : .7;
    context.stroke();
  }
  for (let index = 0; index < 8; index++) {
    const angle = Math.PI * (index + .5) / 8;
    const sx = x + (radius - 3) * Math.cos(angle);
    const sy = y + height * .68 + rise * Math.sin(angle);
    sparkle(context, sx, sy, 2.2 + Math.sin(angle) * 2.1, gold);
  }
  context.restore();

  const glaze = gradient(context, left, y - 10, right, y + 25, [[0, "#9468cc"], [.22, "#f8d5e8"], [.49, "#bc84d1"], [.79, "#8463b9"], [1, "#604285"]]);
  context.save();
  context.beginPath();
  context.moveTo(left, y);
  context.ellipse(x, y, radius, rise, 0, Math.PI, 2 * Math.PI);
  const drops = 36;
  for (let index = 1; index <= drops; index++) {
    const angle = index / drops * Math.PI;
    const px = x + radius * Math.cos(angle);
    const edge = y + rise * Math.sin(angle);
    const drip = index % 3 === 1 ? 4 + sample() * 15 * Math.sin(angle) : 0;
    const previousX = x + radius * Math.cos((index - 1) / drops * Math.PI);
    context.quadraticCurveTo((previousX + px) * .5, edge + drip * 1.8, px, edge + 2.8);
  }
  context.closePath();
  context.shadowColor = "#190c36bc";
  context.shadowBlur = 8;
  context.shadowOffsetY = 4;
  context.fillStyle = glaze;
  context.fill();
  context.restore();

  const top = gradient(context, left + 20, y - rise, right - 10, y + rise, [[0, "#bf8ee3"], [.2, "#945dba"], [.6, "#5c3c99"], [1, "#3b245b"]]);
  ellipse(context, x, y - .5, radius - 2, rise - 1, glaze);
  ellipse(context, x, y - .5, radius - 8, rise - 4, top);
  context.save();
  context.beginPath();
  context.ellipse(x, y, radius - 9, rise - 4, 0, 0, 2 * Math.PI);
  context.clip();
  glow(context, x - radius * .26, y - 10, radius * .76, "#ffcced75");
  for (let index = 0; index < 185; index++) {
    const angle = sample() * Math.PI * 2;
    const depth = Math.sqrt(sample());
    const size = .26 + sample() ** 3 * 1.19;
    ellipse(context, x + (radius - 10) * depth * Math.cos(angle), y + (rise - 5) * depth * Math.sin(angle), size, size * .62, colors[index % colors.length] + "98");
  }
  context.restore();
  for (let index = 0; index < 28; index++) {
    const angle = index * Math.PI / 14;
    const front = Math.sin(angle) > 0;
    pearl(context, x + (radius - 6) * Math.cos(angle), y + (rise - 2) * Math.sin(angle) - 1, front ? 2.8 : 1.9, index % 3 > 0);
  }
}

function makeCakeLayer() {
  const layer = document.createElement("canvas");
  layer.width = 1040;
  layer.height = 920;
  const context = layer.getContext("2d");
  if (!context) return layer;
  context.scale(2, 2);
  const rim = gradient(context, 77, 350, 441, 364, [[0, "#54375f"], [.18, "#ffd3ba"], [.35, "#eee1e3"], [.53, "#8d607f"], [.75, "#d9b6b5"], [1, "#492e54"]]);
  const ceramic = gradient(context, 74, 333, 440, 388, [[0, "#6a4686"], [.26, "#ac83b4"], [.51, "#3c2860"], [.74, "#653f7b"], [1, "#25173f"]]);
  ellipse(context, 260, 379, 178, 30, "#0905119e");
  ellipse(context, 260, 362, 177, 39, rim);
  ellipse(context, 260, 355, 178, 35, ceramic);
  ellipse(context, 260, 354, 173, 33, rim);
  ellipse(context, 260, 352, 168, 30, ceramic);
  ellipse(context, 260, 350, 159, 27, "#291937");
  drawTier(context, 274, 154, 37, 70, 4782);
  ellipse(context, 260, 271, 114, 21, "#2111337f");
  drawTier(context, 207, 105, 29, 63, 3812);
  rosette(context, 164, 224, 9);
  rosette(context, 183, 234, 10);
  rosette(context, 200, 239, 7);
  rosette(context, 357, 217, 8);
  rosette(context, 343, 225, 10);
  rosette(context, 326, 230, 6);
  rosette(context, 389, 289, 11);
  rosette(context, 405, 281, 9);
  rosette(context, 418, 271, 7);
  rosette(context, 131, 289, 10);
  rosette(context, 116, 279, 7);
  return layer;
}

function drawCandle(context, time) {
  const wax = gradient(context, 253, 0, 267, 0, [[0, "#745c93"], [.22, "#d9bde6"], [.47, "#fff0ee"], [.76, "#c685bb"], [1, "#86619e"]]);
  ellipse(context, 260, 207, 14, 4, "#4122488e");
  context.fillStyle = wax;
  context.fillRect(253, 112, 14, 92);
  ellipse(context, 260, 204, 7, 2.4, "#ba8bc7");
  ellipse(context, 260, 112, 7, 2.4, "#fff0ed");
  context.save();
  context.beginPath();
  context.rect(253, 114, 14, 90);
  context.clip();
  const foil = gradient(context, 253, 0, 267, 0, [[0, "#ad6a82"], [.48, "#ffe1a6"], [1, "#b47888"]]);
  for (let y = 118; y < 218; y += 13) {
    context.beginPath();
    context.moveTo(249, y + 9);
    context.lineTo(269, y - 1);
    context.strokeStyle = foil;
    context.lineWidth = 3.2;
    context.stroke();
  }
  context.restore();
  context.fillStyle = "#41304d";
  context.fillRect(259, 101, 2.2, 11);
  if (stage !== "welcome" && stage !== "lit") return;

  const sway = Math.sin(time * 4.7) * 2.5;
  const height = 30 + Math.sin(time * 7) * 2.5;
  glow(context, 260, 88, 79, "#ff8c6d75");
  glow(context, 260, 92, 33, "#ffcb80be");
  glow(context, 260, 206, 45, "#ffae844f");
  const fire = gradient(context, 260, 72, 260, 105, [[0, "#ffe4b7"], [.43, "#ffc279"], [.68, "#fff2b1"], [1, "#ff945b"]]);
  context.beginPath();
  context.moveTo(260 + sway, 101 - height);
  context.bezierCurveTo(257 + sway, 85, 246, 98, 255, 105);
  context.bezierCurveTo(267, 112, 274, 95, 260 + sway, 101 - height);
  context.fillStyle = fire;
  context.fill();
  ellipse(context, 260, 99, 3.8, 6.8, "#fffde7");
}

const cakeLayer = makeCakeLayer();

function drawOrbit(context, time, front) {
  const tilt = -.27;
  context.save();
  context.translate(260, 271);
  context.rotate(tilt);
  context.beginPath();
  context.ellipse(0, 0, 223, 65, 0, front ? 0 : Math.PI, front ? Math.PI : 2 * Math.PI);
  context.strokeStyle = front ? "#ffb6ff66" : "#f3b4ff39";
  context.lineWidth = 1.15;
  context.stroke();
  context.restore();
  for (const point of orbitPoints) {
    const angle = point.angle + time * point.speed;
    const sine = Math.sin(angle);
    if ((sine > 0) !== front) continue;
    const x = Math.cos(angle) * point.radius;
    const y = sine * point.radius * .30 + point.band;
    const px = 260 + x * Math.cos(tilt) - y * Math.sin(tilt);
    const py = 271 + x * Math.sin(tilt) + y * Math.cos(tilt);
    context.globalAlpha = front ? .5 + sine * .45 : .35;
    if (point.size > 2.55) sparkle(context, px, py, point.size * 1.8, point.color);
    else ellipse(context, px, py, point.size, point.size, point.color);
  }
  context.globalAlpha = 1;
}

function draw(now) {
  const still = reducedMotion.matches;
  const time = still ? 0 : now / 1000;
  if (starContext) {
    starContext.setTransform(sky.width, 0, 0, sky.height, 0, 0);
    starContext.clearRect(0, 0, 1, 1);
    starContext.setTransform(1, 0, 0, 1, 0, 0);
    for (const star of skyPoints) {
      starContext.globalAlpha = .30 + .30 * (1 + Math.sin(time * 1.35 + star.phase)) / 2;
      ellipse(starContext, star.x * sky.width, star.y * sky.height, star.size, star.size, star.color);
    }
    starContext.globalAlpha = 1;
  }
  if (!cakeContext || stage === "heart") return;
  const context = cakeContext;
  context.setTransform(cake.width / 520, 0, 0, cake.height / 460, 0, 0);
  context.clearRect(0, 0, 520, 460);
  glow(context, 265, 240, 215, "#ab50dc68");
  glow(context, 335, 172, 136, "#876bff49");
  drawOrbit(context, time, false);
  context.drawImage(cakeLayer, 0, 0, 520, 460);
  drawCandle(context, time);
  drawOrbit(context, time, true);

  sparkle(context, 75, 149, 9, "#ffceff");
  sparkle(context, 419, 124, 12, "#fff2fd");
  sparkle(context, 452, 310, 7, "#ffd5f4");
  sparkle(context, 118, 369, 8, "#e9d3fd");
  const age = still ? .45 : (now - burstStarted) / 1000;
  if (stage !== "done" || age > 2.65) return;
  for (const piece of confetti) {
    const x = 260 + Math.cos(piece.angle) * piece.speed * age;
    const y = 103 + Math.sin(piece.angle) * piece.speed * age + 53 * age * age;
    context.save();
    context.translate(x, y);
    context.rotate(piece.spin * age);
    context.globalAlpha = Math.max(0, 1 - age / 2.65);
    context.fillStyle = piece.color;
    context.fillRect(0, 0, piece.size, piece.size * .65);
    context.restore();
  }
}

let lastFrame = 0;
const compactScreen = matchMedia("(max-width: 720px)");
function animate(now) {
  if (!reducedMotion.matches && now - lastFrame >= (compactScreen.matches ? 27 : 15)) {
    draw(now);
    lastFrame = now;
  }
  requestAnimationFrame(animate);
}

new ResizeObserver(resize).observe(scene);
new ResizeObserver(resize).observe(artwork);
reducedMotion.addEventListener("change", () => draw(performance.now()));
resize();
show("welcome", false);
requestAnimationFrame(animate);
