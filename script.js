const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menu-screen');
const menuTitle = document.getElementById('menu-title');
const menuDesc = document.getElementById('menu-desc');
const startBtn = document.getElementById('start-btn');
const hud = document.getElementById('hud');
const hudLevel = document.getElementById('hud-level');
const hudDist = document.getElementById('hud-dist');

// Configuración de pantalla
let width, height;

// Parámetros de juego
let state = 'MENU'; // MENU, PLAYING, GAMEOVER, WIN
let cameraX = 0, cameraY = 0;
let currentLevelIndex = 0; // Control de nivel a través del índice del JSON

// Estructura física del jugador (Nave con Inercia Máxima y velocidad muy pausada)
const player = {
    x: 0,
    y: 0,
    vx: 0, // Velocidad en X
    vy: 0, // Velocidad en Y
    r: 10, // Radio colisión ajustado
    angle: -Math.PI / 2, // Ángulo actual de orientación
    targetAngle: -Math.PI / 2,
    accel: 0.08, // Aceleración suave, ideal para disfrutar de la deriva
    friction: 0.99, // Fricción ínfima (derrape muy prolongado y realista)
    maxSpeed: 3.2, // Velocidad máxima muy prudente para un control total
    color: '#00ff88',
    moving: false
};

// Joystick virtual optimizado
const joystick = {
    active: false,
    touchId: null,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
    maxRadius: 55,
    vectorX: 0,
    vectorY: 0
};

// Estructura del laberinto orbital dinámico
let rings = [];
let lines = [];      // Paredes construidas en tiempo real
let hazards = [];    // Minas construidas en tiempo real
let items = [];      // Items recolectables (powerups / regalos) construidos en tiempo real
let stars = [];      // Estrellas de fondo estáticas
let particles = [];  // Estelas de la nave

const WALL_THICKNESS = 7;
let escapeRadius = 1000; // Se calcula dinámicamente según el último anillo del nivel

// ------------------ CONFIGURACIÓN DE NIVELES EN JSON ------------------
// Rediseñado con velocidades muy bajas y diferenciadas por anillo
const LEVELS_DATA = [
    {
        level: 1,
        name: "Iniciación Orbital",
        rings: [
            {
                pos: 1,
                distance: 160,
                gate_start_angle: 80,
                gate_end_angle: 120,
                velocity: 0.12, // Velocidad muy baja (grados por frame)
                walls: [0, 180, 270], // Ángulos de paredes radiales
                objects: [
                    { bomb: 45, power: 150, gift: 220, enemy: 310 } // Objetos en los grados indicados
                ]
            },
            {
                pos: 2,
                distance: 310,
                gate_start_angle: 260,
                gate_end_angle: 300,
                velocity: -0.16, // Giro inverso muy lento
                walls: [60, 120, 200, 320],
                objects: [
                    { bomb: 15, bomb: 135, gift: 90, power: 180 }
                ]
            },
            {
                pos: 3,
                distance: 460,
                gate_start_angle: 0,
                gate_end_angle: 45,
                velocity: 0.10, // Rotación ultra relajada
                walls: [90, 180, 270],
                objects: [
                    { bomb: 120, bomb: 240, gift: 315 }
                ]
            }
        ]
    },
    {
        level: 2,
        name: "Anillos Cruzados",
        rings: [
            {
                pos: 1,
                distance: 160,
                gate_start_angle: 0,
                gate_end_angle: 40,
                velocity: 0.20,
                walls: [90, 270],
                objects: [{ bomb: 180, gift: 300 }]
            },
            {
                pos: 2,
                distance: 310,
                gate_start_angle: 180,
                gate_end_angle: 220,
                velocity: -0.15,
                walls: [30, 120, 240, 330],
                objects: [{ bomb: 60, bomb: 280, gift: 150 }]
            },
            {
                pos: 3,
                distance: 460,
                gate_start_angle: 90,
                gate_end_angle: 130,
                velocity: 0.22,
                walls: [45, 135, 225, 315],
                objects: [{ bomb: 0, bomb: 180, power: 270, gift: 330 }]
            },
            {
                pos: 4,
                distance: 610,
                gate_start_angle: 270,
                gate_end_angle: 310,
                velocity: -0.12,
                walls: [0, 60, 120, 180, 240],
                objects: [{ bomb: 45, bomb: 135, bomb: 225, gift: 90 }]
            }
        ]
    }
];

// Clase que interpreta la especificación de un anillo de nivel cargado desde el JSON
class ConfiguredRing {
    constructor(ringSpec) {
        this.pos = ringSpec.pos;
        this.radius = ringSpec.distance;
        this.angle = 0; // Ángulo actual de rotación acumulada (radianes)

        // Conversión de velocidad de grados/frame a radianes/frame
        this.rotSpeed = (ringSpec.velocity * Math.PI) / 180;

        // Límites de las puertas en radianes
        this.gateStart = (ringSpec.gate_start_angle * Math.PI) / 180;
        this.gateEnd = (ringSpec.gate_end_angle * Math.PI) / 180;

        // Asegurar que gateStart sea menor que gateEnd algebraicamente para cálculo
        if (this.gateStart > this.gateEnd) {
            let temp = this.gateStart;
            this.gateStart = this.gateEnd;
            this.gateEnd = temp;
        }

        // Lista de ángulos para las paredes radiales (convertidos a radianes)
        this.radials = (ringSpec.walls || []).map(w => (w * Math.PI) / 180);

        // Lista estructurada de objetos del JSON
        this.rawObjects = [];
        if (ringSpec.objects && ringSpec.objects.length > 0) {
            ringSpec.objects.forEach(objSet => {
                for (let key in objSet) {
                    this.rawObjects.push({
                        type: key, // 'bomb', 'power', 'gift', 'enemy'
                        relAngle: (objSet[key] * Math.PI) / 180
                    });
                }
            });
        }
    }

    update() {
        this.angle += this.rotSpeed; // Actualiza la rotación física lenta
    }
}

// Ajustar resolución de pantalla
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// ------------------ INICIALIZACIÓN ------------------

function initGame() {
    player.x = 0;
    player.y = 0;
    player.vx = 0;
    player.vy = 0;
    player.angle = -Math.PI / 2;
    player.targetAngle = -Math.PI / 2;
    player.moving = false;
    particles = [];
    joystick.active = false;

    generateStars();

    // Cargar datos de nivel activo del JSON
    const currentLevelData = LEVELS_DATA[currentLevelIndex];
    rings = [];

    currentLevelData.rings.forEach(ringSpec => {
        rings.push(new ConfiguredRing(ringSpec));
    });

    // Definir radio de escape (un poco más afuera del anillo más lejano del nivel actual)
    const maxRingRadius = Math.max(...currentLevelData.rings.map(r => r.distance));
    escapeRadius = maxRingRadius + 120;

    state = 'PLAYING';
    menuScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    hudLevel.innerText = `NIVEL: ${currentLevelData.level} - ${currentLevelData.name}`;

    requestAnimationFrame(gameLoop);
}

function generateStars() {
    stars = [];
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: (Math.random() - 0.5) * 3500,
            y: (Math.random() - 0.5) * 3500,
            r: Math.random() * 1.5 + 0.4,
            color: Math.random() > 0.85 ? '#ffd54f' : '#ffffff'
        });
    }
}

// Reconstruye elementos físicos a partir del ángulo y posición rotatoria de los anillos JSON en tiempo real
function rebuildWorldFromRings() {
    lines = [];
    hazards = [];
    items = [];

    for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];
        const r = ring.radius;
        const ringAngle = ring.angle;

        // 1. Construir arco continuo del anillo excepto la puerta definida (gate_start_angle a gate_end_angle)
        const resolution = Math.max(60, Math.floor(r / 3.0));
        let prevX = null, prevY = null;

        for (let step = 0; step <= resolution; step++) {
            let relAngle = (step / resolution) * Math.PI * 2;
            let absAngle = relAngle + ringAngle;

            // Ajustar relAngle al rango estándar de [0, 2PI] para comparar correctamente con la puerta
            let normalizedRel = relAngle % (Math.PI * 2);
            if (normalizedRel < 0) normalizedRel += Math.PI * 2;

            let inGate = false;
            // Comprobar si el ángulo cae dentro del rango de la puerta
            if (ring.gateStart <= ring.gateEnd) {
                if (normalizedRel >= ring.gateStart && normalizedRel <= ring.gateEnd) {
                    inGate = true;
                }
            } else { // Rango cruzando el origen
                if (normalizedRel >= ring.gateStart || normalizedRel <= ring.gateEnd) {
                    inGate = true;
                }
            }

            if (!inGate) {
                let x = Math.cos(absAngle) * r;
                let y = Math.sin(absAngle) * r;
                if (prevX !== null) {
                    lines.push({ x1: prevX, y1: prevY, x2: x, y2: y });
                }
                prevX = x; prevY = y;
            } else {
                prevX = null; prevY = null; // Romper trazo (apertura)
            }
        }

        // 2. Construir paredes radiales hacia el exterior (rotan sincronizadas con su anillo de origen)
        if (i < rings.length - 1) {
            const nextR = rings[i + 1].radius;
            for (let radAngle of ring.radials) {
                let absAngle = radAngle + ringAngle;
                lines.push({
                    x1: Math.cos(absAngle) * r,
                    y1: Math.sin(absAngle) * r,
                    x2: Math.cos(absAngle) * nextR,
                    y2: Math.sin(absAngle) * nextR
                });
            }
        }

        // 3. Posicionar objetos estructurados en los "huecos" (corredores concéntricos intermedios)
        // Se calcula la distancia interior de seguridad para posicionarse exactamente en la mitad del pasillo vacío
        const prevRadius = (i === 0) ? 0 : rings[i - 1].radius;
        const corridorRadius = (prevRadius + r) / 2; // Radio intermedio exacto ("hueco")

        ring.rawObjects.forEach(obj => {
            let absAngle = obj.relAngle + ringAngle;
            let ox = Math.cos(absAngle) * corridorRadius;
            let oy = Math.sin(absAngle) * corridorRadius;

            if (obj.type === 'bomb' || obj.type === 'enemy') {
                hazards.push({
                    x: ox,
                    y: oy,
                    r: 12,
                    type: obj.type
                });
            } else if (obj.type === 'gift' || obj.type === 'power') {
                items.push({
                    x: ox,
                    y: oy,
                    r: 10,
                    type: obj.type,
                    active: true
                });
            }
        });
    }
}

// ------------------ ENTRADAS Y CONTROLES ------------------

function handleInputStart(x, y, id) {
    if (state !== 'PLAYING') return;
    if (y > height / 2 && !joystick.active) {
        joystick.active = true;
        joystick.touchId = id;
        joystick.originX = x;
        joystick.originY = y;
        joystick.currentX = x;
        joystick.currentY = y;
        updateJoystickVector();
    }
}

function handleInputMove(x, y, id) {
    if (joystick.active && joystick.touchId === id) {
        let dx = x - joystick.originX;
        let dy = y - joystick.originY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > joystick.maxRadius) {
            let ratio = joystick.maxRadius / distance;
            joystick.currentX = joystick.originX + dx * ratio;
            joystick.currentY = joystick.originY + dy * ratio;
        } else {
            joystick.currentX = x;
            joystick.currentY = y;
        }
        updateJoystickVector();
    }
}

function handleInputEnd(id) {
    if (joystick.active && joystick.touchId === id) {
        joystick.active = false;
        joystick.touchId = null;
        joystick.vectorX = 0;
        joystick.vectorY = 0;
        player.moving = false;
    }
}

function updateJoystickVector() {
    let dx = joystick.currentX - joystick.originX;
    let dy = joystick.currentY - joystick.originY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        joystick.vectorX = dx / joystick.maxRadius;
        joystick.vectorY = dy / joystick.maxRadius;
        player.moving = true;
    } else {
        joystick.vectorX = 0;
        joystick.vectorY = 0;
        player.moving = false;
    }
}

// Listeners Táctiles (Móvil)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        let t = e.changedTouches[i];
        handleInputStart(t.clientX, t.clientY, t.identifier);
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        let t = e.changedTouches[i];
        handleInputMove(t.clientX, t.clientY, t.identifier);
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        handleInputEnd(e.changedTouches[i].identifier);
    }
}, { passive: false });

// Listeners Ratón (PC)
canvas.addEventListener('mousedown', (e) => {
    handleInputStart(e.clientX, e.clientY, 'mouse');
});
canvas.addEventListener('mousemove', (e) => {
    handleInputMove(e.clientX, e.clientY, 'mouse');
});
window.addEventListener('mouseup', (e) => {
    handleInputEnd('mouse');
});

// Botón UI
startBtn.addEventListener('click', () => {
    if (state === 'MENU' || state === 'GAMEOVER' || state === 'WIN') {
        initGame();
    }
});

// ------------------ FÍSICAS Y PARTÍCULAS ------------------

function createEngineParticle(x, y, shipAngle) {
    const spread = 0.4;
    const particleAngle = shipAngle + Math.PI + (Math.random() - 0.5) * spread;
    const speed = 1.0 + Math.random() * 2.5;

    const px = x - Math.cos(shipAngle) * 8;
    const py = y - Math.sin(shipAngle) * 8;

    particles.push({
        x: px,
        y: py,
        vx: Math.cos(particleAngle) * speed + player.vx * 0.4,
        vy: Math.sin(particleAngle) * speed + player.vy * 0.4,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? '#00f0ff' : '#00ff88'
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function resolveCollisions() {
    for (let iter = 0; iter < 3; iter++) {
        for (let line of lines) {
            let dx = line.x2 - line.x1;
            let dy = line.y2 - line.y1;
            let lenSq = dx * dx + dy * dy;
            if (lenSq === 0) continue;

            let px = player.x - line.x1;
            let py = player.y - line.y1;

            let t = Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));

            let closestX = line.x1 + t * dx;
            let closestY = line.y1 + t * dy;

            let distX = player.x - closestX;
            let distY = player.y - closestY;
            let distance = Math.sqrt(distX * distX + distY * distY);

            let minDistance = player.r + WALL_THICKNESS / 2;

            if (distance < minDistance && distance > 0) {
                let overlap = minDistance - distance;
                let nx = distX / distance;
                let ny = distY / distance;

                player.x += nx * overlap;
                player.y += ny * overlap;

                let dot = player.vx * nx + player.vy * ny;
                if (dot < 0) {
                    player.vx = (player.vx - 2 * dot * nx) * 0.55;
                    player.vy = (player.vy - 2 * dot * ny) * 0.55;
                }

                for (let k = 0; k < 3; k++) {
                    particles.push({
                        x: closestX,
                        y: closestY,
                        vx: (nx + (Math.random() - 0.5) * 1.5) * (1.2 + Math.random() * 1.5),
                        vy: (ny + (Math.random() - 0.5) * 1.5) * (1.2 + Math.random() * 1.5),
                        life: 1.0,
                        decay: 0.06,
                        color: '#ffffff'
                    });
                }
            }
        }
    }
}

// Evalúa colisiones con elementos peligrosos y recolectables
function checkInteractables() {
    // Colisiones con peligros (bombas/enemigos de color rojo) en los pasillos
    for (let h of hazards) {
        let dx = player.x - h.x;
        let dy = player.y - h.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.r + h.r * 0.8) {
            // Explosión de la nave por colisión
            for (let k = 0; k < 25; k++) {
                let angle = Math.random() * Math.PI * 2;
                let sp = 1 + Math.random() * 5;
                particles.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(angle) * sp,
                    vy: Math.sin(angle) * sp,
                    life: 1.0,
                    decay: 0.025,
                    color: '#ff2a4b'
                });
            }
            gameOver();
            return;
        }
    }

    // Colisiones con regalos o powerups
    for (let item of items) {
        if (!item.active) continue;
        let dx = player.x - item.x;
        let dy = player.y - item.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.r + item.r) {
            item.active = false;

            // Efecto visual al recoger el objeto
            let colorEffect = item.type === 'gift' ? '#ffd54f' : '#00f0ff';
            for (let k = 0; k < 12; k++) {
                let angle = Math.random() * Math.PI * 2;
                let sp = 1 + Math.random() * 2.5;
                particles.push({
                    x: item.x,
                    y: item.y,
                    vx: Math.cos(angle) * sp,
                    vy: Math.sin(angle) * sp,
                    life: 0.8,
                    decay: 0.04,
                    color: colorEffect
                });
            }

            // Dinámica simple de recolección
            if (item.type === 'power') {
                // Acelerar un poco la nave momentáneamente por impulso inercial
                player.vx *= 1.35;
                player.vy *= 1.35;
            }
        }
    }
}

function update() {
    if (state !== 'PLAYING') return;

    // Actualizar rotaciones basadas en las nuevas velocidades muy bajas del JSON
    rings.forEach(ring => ring.update());

    // Reconstruir mundos geométricos con sus colisiones y objetos en los pasillos
    rebuildWorldFromRings();

    // Lógica física con inercia muy marcada
    if (joystick.active) {
        player.vx += joystick.vectorX * player.accel;
        player.vy += joystick.vectorY * player.accel;

        let currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (currentSpeed > player.maxSpeed) {
            player.vx = (player.vx / currentSpeed) * player.maxSpeed;
            player.vy = (player.vy / currentSpeed) * player.maxSpeed;
        }

        createEngineParticle(player.x, player.y, player.angle);
    }

    // Aplicar fricción ambiental bajísima (desplazamiento suave y duradero sin frenar de golpe)
    player.vx *= player.friction;
    player.vy *= player.friction;

    player.x += player.vx;
    player.y += player.vy;

    let speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    if (speed > 0.15) {
        player.targetAngle = Math.atan2(player.vy, player.vx);

        let diff = player.targetAngle - player.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        player.angle += diff * 0.12;
    }

    updateParticles();
    resolveCollisions();
    checkInteractables();

    // HUD de distancia y escape
    let distFromCenter = Math.sqrt(player.x * player.x + player.y * player.y);
    let percentEscaped = Math.min(100, Math.floor((distFromCenter / escapeRadius) * 100));
    hudDist.innerText = `ESCAPE: ${percentEscaped}%`;

    // Condición de Victoria
    if (distFromCenter > escapeRadius) {
        winGame();
    }

    // Cámara elástica (Seguimiento cinematográfico)
    cameraX += (player.x - cameraX) * 0.08;
    cameraY += (player.y - cameraY) * 0.08;
}

function gameOver() {
    state = 'GAMEOVER';
    joystick.active = false;
    hud.classList.add('hidden');
    menuTitle.innerText = "SISTEMAS APAGADOS";
    menuTitle.style.color = "#ff2a4b";
    menuDesc.innerHTML = "Has colisionado con un peligro inestable en los pasillos espaciales.";
    startBtn.innerText = "REINTENTAR";
    startBtn.className = "";
    menuScreen.classList.remove('hidden');
}

function winGame() {
    state = 'WIN';
    joystick.active = false;
    hud.classList.add('hidden');

    if (currentLevelIndex < LEVELS_DATA.length - 1) {
        currentLevelIndex++;
        menuTitle.innerText = "¡ÓRBITA SUPERADA!";
        menuTitle.style.color = "#00ff88";
        menuDesc.innerHTML = `Has escapado usando la deriva e inercia espacial.<br>Siguiente Nivel: <b>${LEVELS_DATA[currentLevelIndex].name}</b>`;
        startBtn.innerText = "SIGUIENTE NIVEL";
        startBtn.className = "win-btn";
    } else {
        currentLevelIndex = 0; // Volver al inicio
        menuTitle.innerText = "¡SIMULACIÓN COMPLETADA!";
        menuTitle.style.color = "#00ff88";
        menuDesc.innerHTML = "Has cruzado todos los anillos del laberinto digital con maestría de deriva.";
        startBtn.innerText = "RECOMENZAR";
        startBtn.className = "win-btn";
    }
    menuScreen.classList.remove('hidden');
}

// ------------------ RENDERIZADO (DIBUJO) ------------------

function drawShip(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Escudo protector traslúcido
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Geometría triangular de la nave
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-8, 8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-8, -8);
    ctx.closePath();

    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
}

function drawHazard(ctx, x, y, r, type) {
    // Halo brillante parpadeante de advertencia
    let glow = r * (1.3 + Math.sin(Date.now() * 0.01) * 0.12);
    ctx.beginPath();
    ctx.arc(x, y, glow, 0, Math.PI * 2);
    ctx.fillStyle = type === 'enemy' ? 'rgba(255, 100, 0, 0.15)' : 'rgba(255, 42, 75, 0.15)';
    ctx.fill();

    // Cuerpo del obstáculo
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = type === 'enemy' ? '#ff6600' : '#ff2a4b';
    ctx.fill();

    // Núcleo blanco caliente
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

function drawItem(ctx, x, y, r, type) {
    ctx.save();
    let bounce = Math.sin(Date.now() * 0.007) * 3;
    ctx.translate(x, y + bounce);

    // Brillo cósmico amarillo o cian según el recolectable
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = type === 'gift' ? 'rgba(255, 213, 79, 0.15)' : 'rgba(0, 240, 255, 0.15)';
    ctx.fill();

    // Forma rómbica o estelar simple para items recolectables
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.7, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.7, 0);
    ctx.closePath();

    ctx.fillStyle = type === 'gift' ? '#ffd54f' : '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();

    ctx.restore();
}

function draw() {
    // Limpiar escena
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 - cameraX, height / 2 - cameraY);

    // 1. Dibujar estrellas
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
    });

    // 2. Dibujar partículas
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.color === '#ffffff' ? 1.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.color === '#ffffff' ? 0 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
    });

    // 3. Dibujar Zona de Escape Externa (Orbital Verde de Meta)
    ctx.beginPath();
    ctx.arc(0, 0, escapeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.12)';
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([25, 25]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Dibujar Paredes del Laberinto Neón Azul
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00a2ff';
    ctx.strokeStyle = '#0055ff';
    ctx.lineWidth = WALL_THICKNESS;

    ctx.beginPath();
    for (let line of lines) {
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
    }
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#bbf2ff';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // 5. Dibujar Objetos Interactivos en los pasillos ("huecos")
    for (let h of hazards) {
        drawHazard(ctx, h.x, h.y, h.r, h.type);
    }
    for (let item of items) {
        if (item.active) {
            drawItem(ctx, item.x, item.y, item.r, item.type);
        }
    }

    // 6. Dibujar Jugador
    if (state === 'PLAYING') {
        drawShip(ctx, player.x, player.y, player.angle);
    }

    ctx.restore();

    // ---------------- INTERFAZ DEL JOYSTICK VIRTUAL ----------------
    if (joystick.active && state === 'PLAYING') {
        ctx.save();

        ctx.beginPath();
        ctx.arc(joystick.originX, joystick.originY, joystick.maxRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(joystick.currentX, joystick.currentY, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        ctx.fill();

        ctx.restore();
    }
}

// Bucle Principal
function gameLoop() {
    update();
    draw();
    if (state === 'PLAYING') {
        requestAnimationFrame(gameLoop);
    } else {
        draw(); // Redibuja el frame final estático
    }
}

generateStars();
draw();