import { Input } from './input.js';
import { emit } from './io.js';
import './io.js';
const input = new Input();

const map = [
    1, 1, 0, 0, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0,
    1, 0, 0, 1, 1, 1, 1, 1,
    1, 1, 0, 0, 1, 1, 1, 1,
    1, 1, 0, 0, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
];
const gravity = 20;
const platformHeight = 12;
const mapDim = { width: 8, height: 6 };
const scale = 100;
const pDim = { width: 20, height: 50 };
const otherPlayers = {};
const canvas = document.getElementById('platformer-canvas');
const ctx = canvas.getContext('2d');
const fps = 50;
const xSpeed = 400;
const ySpeed = 1;
const ySpeedClamp = 500;
const jumpSpeed = 500;
let interval = null;
let renders = 0;
let started = false;
const player = {
    pos: { x: 30, y: platformHeight },
    vy: 0,
    from: Math.random().toString(36),
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
};

const mapPreRender = (() => {
    var m_canvas = document.createElement('canvas');
    m_canvas.width = canvas.width;
    m_canvas.height = canvas.height;
    var prectx = m_canvas.getContext('2d');
    prectx.fillStyle = '#333';
    // map
    for (let i = 0; i < map.length; i++) {
        const x = i % mapDim.width;
        const y = Math.floor(i / mapDim.width);
        if (map[i]) prectx.fillRect(x * scale, y * scale + scale - platformHeight, scale, platformHeight);
    }
    return m_canvas;
})();

export const getPlayer = () => player;

export const start = () => {
    if (interval) clearInterval(interval);
    player.pos = { x: 30, y: platformHeight };
    player.vy = 0;
    interval = setInterval(() => {
        update();
    }, 1000 / fps);
    render();
    emit(player);
}

export const stop = () => {
    if (interval) clearInterval(interval);
}

export const sync = otherPlayer => {
    otherPlayers[otherPlayer.from] = otherPlayer;
}

let grounded = false;
let prevGrounded1 = false;
let prevGrounded2 = false;
let lastX = player.pos.x;
let lastY = player.pos.y;
let x, y, xRight;
const update = () => {

    if (input.keys['a'] || input.keys['ArrowLeft']) {
        player.pos.x -= xSpeed / fps;
    }
    if (input.keys['d'] || input.keys['ArrowRight']) {
        player.pos.x += xSpeed / fps;
    }
    let isGrounded = false;

    // move player forces
    player.vy -= gravity;
    player.pos.y += ySpeed / fps * player.vy;

    // edge detection
   x = (player.pos.x / scale) >> 0;
   xRight = ((player.pos.x + pDim.width) / scale) >> 0;
   y = mapDim.height - ((player.pos.y / scale) >> 0) - 1;

    // bottom detection
    if ((map[y * mapDim.width + x] || map[y * mapDim.width + xRight]) && player.pos.y % scale < platformHeight) {
        isGrounded = true;
        if (player.vy < 0) {
            player.vy = 0;
            player.pos.y = ((player.pos.y / scale) >> 0) * scale + platformHeight;
        } else {
            player.vy = -Math.abs(player.vy);
            player.pos.y = ((player.pos.y / scale) >> 0) * scale + scale - pDim.height;
        }
    }
    // top detection
    else if ((map[(y - 1) * mapDim.width + x] || map[(y - 1) * mapDim.width + xRight]) && player.pos.y % scale > scale - pDim.height) {
        // side detection right
        if (!map[(y - 1) * mapDim.width + x] && map[(y - 1) * mapDim.width + xRight]) {
            player.pos.x = x * scale + scale - pDim.width - .000001;
        }
        // side detection left
        else if (map[(y - 1) * mapDim.width + x] && !map[(y - 1) * mapDim.width + xRight]) {
            player.pos.x = x * scale + scale;
        } else {
            if (player.vy < 0) {
                player.vy = 0;
                player.pos.y = ((player.pos.y / scale) >> 0) * scale + platformHeight;
            } else {
                player.vy = -Math.abs(player.vy);
                player.pos.y = ((player.pos.y / scale) >> 0) * scale + scale - pDim.height;
            }
        }
    }
    // jump
    if (input.keys[' '] && (isGrounded || prevGrounded1 || prevGrounded2)) {
        player.vy += jumpSpeed;
    }
    player.vy = Math.min(ySpeedClamp, Math.max(-ySpeedClamp, player.vy));
    player.pos.x = Math.min(mapDim.width * scale - pDim.width, Math.max(0, player.pos.x));
    if (player.pos.y + pDim.height > mapDim.height * scale) player.vy = -Math.abs(player.vy);

    prevGrounded1 = isGrounded;
    prevGrounded2 = prevGrounded1;

    if (player.pos.x !== lastX || player.pos.y !== lastY) {
        started = true;
        emit(player);
    }

    lastX = player.pos.x;
    lastY = player.pos.y;
}

const render = () => {
    ctx.clearRect(0, 0, mapDim.width * scale, mapDim.height * scale);

    if (renders < 1000) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            player.pos.x + pDim.width * .5,
            mapDim.height * scale - player.pos.y - pDim.height * .5,
            renders + 100, 0, 2 * Math.PI, false);
        ctx.clip();
    }

    ctx.drawImage(mapPreRender, 0, 0);

    // other players
    for (const from in otherPlayers) {
        const otherPlayer = otherPlayers[from];
        ctx.fillStyle = otherPlayer.color;
        ctx.fillRect(otherPlayer.pos.x, mapDim.height * scale - otherPlayer.pos.y - pDim.height, pDim.width, pDim.height);
    }
    // player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.pos.x, mapDim.height * scale - player.pos.y - pDim.height, pDim.width, pDim.height);

    if (renders < 1000) {
        if (started) renders += 5;
        ctx.restore();
        if (!started) {
            ctx.font = "bold 60px Verdana";
            ctx.fillText("Use the keyboard", 50, 250);
            ctx.fillText("to play the game", 60, 330);
        }
    }
    if (interval) requestAnimationFrame(render);
}



