const canvas = document.getElementById("game-canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight * 0.75;
const window_width = window.innerWidth * 0.75;

canvas.height = window_height;
canvas.width = window_width;

// Variables para la puntuación
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // Obtiene la puntuación más alta almacenada en localStorage
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const timerDisplay = document.getElementById("timer");

let level = 1;
let timeRemaining = 60; // tiempo en segundos para cada nivel
let ovnisDestroyed = 0;
let ovnisGenerated = 0;

updateScoreDisplay();
updateLevelDisplay();
updateTimerDisplay();

// Variable para almacenar las coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Variable para almacenar la posición del clic
let clickX = 0;
let clickY = 0;

class Ovni {
  constructor(x, y, width, height, speed) {
    this.posX = x;
    this.posY = y;
    this.width = width;
    this.height = height;
    this.speed = speed;

    this.dx = 1 * this.speed;
    this.dy = 1 * this.speed; // Modificado a positivo para que vaya hacia abajo
    this.image = new Image();
    this.image.src = "img/ovni.png"; // Ruta de la imagen del ovni
  }

  draw(context) {
    context.drawImage(this.image, this.posX, this.posY, this.width, this.height);
  }

  update(context) {
    this.draw(context);

    if (this.posX + this.width > window_width || this.posX < 0) {
      this.dx = -this.dx;
    }

    if (this.posY + this.height > window_height) {
      // Eliminar el ovni si llega al límite inferior del canvas
      ovnis.splice(ovnis.indexOf(this), 1);
    }

    this.posX += this.dx;
    this.posY += this.dy;
  }

  // Método para verificar si un punto está dentro del ovni
  isPointInside(x, y) {
    return x >= this.posX && x <= this.posX + this.width && y >= this.posY && y <= this.posY + this.height;
  }
}

let ovnis = [];

function createOvni() {
  const width = 100; // Ancho del ovni
  const height = 50; // Alto del ovni
  const x = Math.random() * (window_width - width);
  const y = -height; // Iniciar desde arriba
  const speed = Math.random() * 2 + 1; // Velocidad del ovni

  ovnis.push(new Ovni(x, y, width, height, speed));
  ovnisGenerated++;
}

function updateOvnis() {
  requestAnimationFrame(updateOvnis);
  ctx.clearRect(0, 0, window_width, window_height);
  ovnis.forEach((ovni) => ovni.update(ctx));
  checkCollisions();
  updateScoreDisplay();
}

function checkCollisions() {
  ovnis.forEach((ovni, index) => {
    if (ovni.isPointInside(clickX, clickY)) {
      ovnis.splice(index, 1); // Elimina el ovni
      ovnisDestroyed++; // Incrementa el conteo de ovnis destruidos
      score += 10; // Incrementa la puntuación
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore); // Almacena la nueva puntuación más alta en localStorage
      }
    }
  });
}

// Función para obtener las coordenadas del mouse dentro del canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  mouseX = evt.clientX - rect.left;
  mouseY = evt.clientY - rect.top;
}

// Manejador de eventos para detectar el movimiento del mouse
canvas.addEventListener("mousemove", function (evt) {
  getMousePos(canvas, evt);
});

// Manejador de eventos para detectar el clic del mouse
canvas.addEventListener("mousedown", function (evt) {
  clickX = evt.clientX - canvas.getBoundingClientRect().left;
  clickY = evt.clientY - canvas.getBoundingClientRect().top;
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

function showLevelStats() {
  const percentageDestroyed = (ovnisDestroyed / ovnisGenerated) * 100;
  const statsMessage = `Nivel ${level} completado.\nGenerados: ${ovnisGenerated}\nDestruidos: ${ovnisDestroyed}\nPorcentaje destruidos: ${percentageDestroyed.toFixed(2)}%`;

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
  ovnis = [];
  ovnisGenerated = 0;
  ovnisDestroyed = 0;
  timeRemaining = 60;

  const levelInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(levelInterval);
      if (ovnisDestroyed >= ovnisGenerated * 0.6) {
        showLevelStats();
        level++;
        updateLevelDisplay();
      } else {
        alert('Fin del juego. No has destruido suficientes ovnis.');
        resetGame();
      }
    }
  }, 1000);

  setInterval(createOvni, 1000); // Crea un nuevo ovni cada segundo
}

function resetGame() {
  level = 1;
  score = 0;
  updateLevelDisplay();
  updateScoreDisplay();
  startLevel();
}

updateOvnis();
startLevel();
