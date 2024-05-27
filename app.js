const canvas = document.getElementById("game-canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight * .75;
const window_width = window.innerWidth * .75;

canvas.height = window_height;
canvas.width = window_width;

// Variables para la puntuación
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Obtiene la puntuación más alta almacenada en localStorage
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const timerDisplay = document.getElementById('timer');

let level = 1;
let timeRemaining = 60; // tiempo en segundos para cada nivel
let circlesPopped = 0;
let circlesGenerated = 0;

updateScoreDisplay();
updateLevelDisplay();
updateTimerDisplay();

// Variable para almacenar las coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Variable para almacenar la posición del clic
let clickX = 0;
let clickY = 0;

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;

        this.dx = 1 * this.speed;
        this.dy = -1 * this.speed; // Cambiado a negativo para que vaya de abajo hacia arriba
    }

    draw(context) {
        context.beginPath();

        // Gradiente radial para simular la translucidez de una burbuja
        let gradient = context.createRadialGradient(this.posX, this.posY, 0, this.posX, this.posY, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);

        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        if ((this.posY - this.radius) < 0) {
            // Eliminar el círculo si toca el límite superior del canvas
            circles.splice(circles.indexOf(this), 1);
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }

    // Método para verificar si un punto está dentro del círculo
    isPointInside(x, y) {
        const distance = Math.sqrt((x - this.posX) ** 2 + (y - this.posY) ** 2);
        return distance < this.radius;
    }
}

function getDistance(posX1, posY1, posX2, posY2) {
    return Math.sqrt(Math.pow((posX2 - posX1), 2) + Math.pow((posY2 - posY1), 2));
}

let circles = [];

function createCircle() {
    const radius = Math.random() * 50 + 20;
    const x = Math.random() * (window_width - 2 * radius) + radius;
    const y = window_height + radius; // Iniciar desde abajo

    const color = "rgba(0, 0, 255, 0.5)"; // Color azul translúcido
    const text = circles.length + 1;
    const speed = (Math.random() * 2 + 1) * (1 + (level - 1) * 0.1); // Incrementa la velocidad en cada nivel

    circles.push(new Circle(x, y, radius, color, text, speed));
    circlesGenerated++;
}

function updateCircles() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);
    circles.forEach(circle => circle.update(ctx));
    checkCollisions();
    updateScoreDisplay();
}

function checkCollisions() {
    for (let i = 0; i < circles.length; i++) {
        circles[i].color = "rgba(0, 0, 255, 0.5)"; // Restablecer todos los círculos a azul translúcido antes de verificar las colisiones

        for (let j = 0; j < circles.length; j++) {
            if (i !== j) {
                if (getDistance(circles[i].posX, circles[i].posY, circles[j].posX, circles[j].posY) < (circles[i].radius + circles[j].radius)) {
                    circles[i].color = "rgba(255, 0, 0, 0.5)"; // Cambiar el color del círculo en colisión a rojo translúcido
                    circles[j].color = "rgba(255, 0, 0, 0.5)";

                    // Calcular la nueva dirección para el primer círculo
                    const dx = circles[i].posX - circles[j].posX;
                    const dy = circles[i].posY - circles[j].posY;
                    const angle = Math.atan2(dy, dx);

                    circles[i].dx = Math.cos(angle) * circles[i].speed;
                    circles[i].dy = Math.sin(angle) * circles[i].speed;

                    // Calcular la nueva dirección para el segundo círculo
                    circles[j].dx = -Math.cos(angle) * circles[j].speed;
                    circles[j].dy = -Math.sin(angle) * circles[j].speed;
                }
            }
        }
    }
}

// Función para obtener las coordenadas del mouse dentro del canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

// Manejador de eventos para detectar el movimiento del mouse
canvas.addEventListener('mousemove', function(evt) {
    getMousePos(canvas, evt);
});

// Manejador de eventos para detectar el clic del mouse
canvas.addEventListener('mousedown', function(evt) {
    clickX = evt.clientX - canvas.getBoundingClientRect().left;
    clickY = evt.clientY - canvas.getBoundingClientRect().top;

    // Verifica si el clic está dentro del círculo
    circles.forEach((circle, index) => {
        if (circle.isPointInside(clickX, clickY)) {
            circles.splice(index, 1); // Elimina el círculo
            circlesPopped++; // Incrementa el conteo de círculos reventados
            score += 10; // Incrementa la puntuación
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore); // Almacena la nueva puntuación más alta en localStorage
            }
        }
    });
});

function updateScoreDisplay() {
    scoreDisplay.textContent = `Puntuación: ${score} | Puntuación Más Alta: ${highScore}`;
}

function updateLevelDisplay() {
    levelDisplay.textContent = `Nivel: ${level}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = `Tiempo restante: ${timeRemaining}s`;
}

function showLevelMessage(level) {
    ctx.clearRect(0, 0, window_width, window_height);
    ctx.font = "48px serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Nivel ${level}`, window_width / 2, window_height / 2);

    setTimeout(() => {
        ctx.clearRect(0, 0, window_width, window_height);
    }, 2000);
}

function showLevelStats() {
    const percentagePopped = (circlesPopped / circlesGenerated) * 100;
    const statsMessage = `Nivel ${level} completado.\nGenerados: ${circlesGenerated}\nReventados: ${circlesPopped}\nPorcentaje reventados: ${percentagePopped.toFixed(2)}%`;

    ctx.clearRect(0, 0, window_width, window_height);
    ctx.font = "24px serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(statsMessage, window_width / 2, window_height / 2 - 50);

    const button = document.createElement('button');
    button.textContent = 'Siguiente Nivel';
    button.style.position = 'absolute';
    button.style.left = `${window_width / 2 - 50}px`;
    button.style.top = `${window_height / 2 + 50}px`;
    button.addEventListener('click', () => {
        document.body.removeChild(button);
        startLevel();
    });
    document.body.appendChild(button);
}

function startLevel() {
    circles = [];
    circlesGenerated = 0;
    circlesPopped = 0;
    timeRemaining = 60;

    showLevelMessage(level);

    const levelInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(levelInterval);
            if (circlesPopped >= circlesGenerated * 0.6) {
                showLevelStats();
                level++;
                updateLevelDisplay();
            } else {
                alert('Fin del juego. No has reventado suficientes círculos.');
                resetGame();
            }
        }
    }, 1000);

    setInterval(createCircle, 1000); // Crea un nuevo círculo cada segundo
}

function resetGame() {
    level = 1;
    score = 0;
    updateLevelDisplay();
    updateScoreDisplay();
    startLevel();
}

updateCircles();
startLevel();
