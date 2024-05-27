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

// Variables para almacenar las coordenadas del clic
let clickX = 0;
let clickY = 0;

class Ovni {
  constructor(x, y, width, height, speed) {
    this.posX = x;
    this.posY = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.clicked = false; // Inicialmente no ha sido clickeado

    this.dx = Math.random() < 0.5 ? 1 * this.speed : -1 * this.speed; // Dirección aleatoria (izquierda o derecha)
    this.dy = 1 * this.speed; // Siempre hacia abajo
    this.image = new Image();
    this.image.src = "img/ovni.png"; // Ruta de la imagen del ovni
  }

  draw(context) {
    context.drawImage(this.image, this.posX, this.posY, this.width, this.height);
  }

  update(context) {
    this.draw(context);

    // Mantener la dirección hacia abajo
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

  // Método para marcar el ovni como clickeado
  markClicked() {
    this.clicked = true;
  }
}

let ovnis = [];

function createOvni(speed) {
  const width = 100; // Ancho del ovni
  const height = 50; // Alto del ovni
  const x = Math.random() * (window_width - width);
  const y = -height; // Iniciar desde arriba

  ovnis.push(new Ovni(x, y, width, height, speed)); // Usar la velocidad pasada como parámetro
  ovnisGenerated++;
  updateLevelDisplay(); // Actualizar el display cada vez que se genere un ovni
}

function updateOvnis() {
  requestAnimationFrame(updateOvnis);
  ctx.clearRect(0, 0, window_width, window_height);
  ovnis.forEach((ovni) => ovni.update(ctx));
  checkCollisions();
  checkOvniCollisions();
  updateScoreDisplay();
}

function checkCollisions() {
  ovnis.forEach((ovni, index) => {
    if (ovni.clicked) {
      ovnis.splice(index, 1); // Elimina el ovni
      ovnisDestroyed++; // Incrementa el conteo de ovnis destruidos
      score += 10; // Incrementa la puntuación
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore); // Almacena la nueva puntuación más alta en localStorage
      }
      updateLevelDisplay(); // Actualiza el contador de ovnis destruidos
    }
  });
}

function checkOvniCollisions() {
  for (let i = 0; i < ovnis.length; i++) {
    for (let j = i + 1; j < ovnis.length; j++) {
      let ovni1 = ovnis[i];
      let ovni2 = ovnis[j];

      if (isColliding(ovni1, ovni2)) {
        // Invertir las direcciones de movimiento
        ovni1.dx = -ovni1.dx;
        ovni2.dx = -ovni2.dx;
        // Mantener la dirección hacia abajo
        ovni1.dy = Math.abs(ovni1.dy);
        ovni2.dy = Math.abs(ovni2.dy);
      }
    }
  }
}
function checkOvniCollisions() {
    for (let i = 0; i < ovnis.length; i++) {
      for (let j = i + 1; j < ovnis.length; j++) {
        let ovni1 = ovnis[i];
        let ovni2 = ovnis[j];
  
        if (isColliding(ovni1, ovni2)) {
          // Invertir las direcciones de movimiento
          ovni1.dx = -ovni1.dx;
          ovni2.dx = -ovni2.dx;
          // Mantener la dirección hacia abajo
          ovni1.dy = Math.abs(ovni1.dy);
          ovni2.dy = Math.abs(ovni2.dy);
  
          // Ajuste para separar los ovnis
          ovni1.posY -= 10; // Mueve ovni1 hacia arriba
          ovni2.posY += 10; // Mueve ovni2 hacia abajo
        }
      }
    }
  }
  

function isColliding(ovni1, ovni2) {
  return (
    ovni1.posX < ovni2.posX + ovni2.width &&
    ovni1.posX + ovni1.width > ovni2.posX &&
    ovni1.posY < ovni2.posY + ovni2.height &&
    ovni1.posY + ovni1.height > ovni2.posY
  );
}

// Manejador de eventos para detectar el clic del mouse
canvas.addEventListener("mousedown", function (evt) {
  clickX = evt.clientX - canvas.getBoundingClientRect().left;
  clickY = evt.clientY - canvas.getBoundingClientRect().top;

  // Verificar si se ha clickeado algún ovni
  ovnis.forEach(ovni => {
    if (ovni.isPointInside(clickX, clickY)) {
      ovni.markClicked(); // Marcar el ovni como clickeado
   
    }
});
});

function updateScoreDisplay() {
scoreDisplay.textContent = `Puntuación: ${score} | Puntuación Más Alta: ${highScore}`;
}

function updateLevelDisplay() {
  let percentageDestroyed = 0; // Por defecto, establece el porcentaje como cero
  
  // Verifica si hay ovnis generados antes de calcular el porcentaje
  if (ovnisGenerated > 0) {
    percentageDestroyed = (ovnisDestroyed / ovnisGenerated) * 100;
  }
  
  levelDisplay.textContent = `Nivel: ${level} | Ovnis Generados: ${ovnisGenerated} | Ovnis Destruidos: ${ovnisDestroyed} | ${percentageDestroyed.toFixed(2)}%`;
}

function updateTimerDisplay() {
timerDisplay.textContent = `Tiempo restante: ${timeRemaining}s`;
}

function showLevelStats() {
  let percentageDestroyed = 0; // Por defecto, establece el porcentaje como cero
  
  // Verifica si hay ovnis generados antes de calcular el porcentaje
  if (ovnisGenerated > 0) {
    percentageDestroyed = (ovnisDestroyed / ovnisGenerated) * 100;
  }

  const statsMessage = `Nivel ${level} completado.\nGenerados: ${ovnisGenerated}\nDestruidos: ${ovnisDestroyed}\nPorcentaje destruidos: ${percentageDestroyed.toFixed(2)}%`;

ctx.clearRect(0, 0, window_width, window_height);
ctx.font = "24px serif";
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.fillText(statsMessage, window_width / 2, window_height / 2 - 50);

const button = document.createElement('button');
button.textContent = 'Siguiente Nivel';
button.style.position = 'absolute';
button.style.left = '50%';
button.style.top = '80%';
button.style.transform = 'translate(-50%, -50%)'; // Centra el botón
button.addEventListener('click', () => {
  document.body.removeChild(button);
  startLevel();
});
document.body.appendChild(button);
}

function showGameOver() {
ctx.clearRect(0, 0, window_width, window_height);
ctx.font = "24px serif";
ctx.fillStyle = "red";
ctx.textAlign = "center";
ctx.fillText("¡Te han invadido!", window_width / 2, window_height / 2 - 50);

const button = document.createElement('button');
button.style.position = 'absolute';
button.style.left = '50%';
button.style.top = '80%'; // Ajuste para que el botón esté debajo del mensaje
button.style.transform = 'translate(-50%, -50%)'; // Centra el botón
document.body.appendChild(button);

const invadeText = document.createTextNode('¡Te han invadido! ');
button.appendChild(invadeText);

const newGameText = document.createElement('span');
newGameText.textContent = 'Nuevo Juego';
newGameText.style.display = 'block';
button.appendChild(newGameText);

button.addEventListener('click', () => {
  document.body.removeChild(button);
  resetGame(); // Aquí se llama a la función resetGame() cuando se hace clic en el botón
});

document.body.appendChild(button);
}

function startLevel() {
ovnis = [];
ovnisGenerated = 0;
ovnisDestroyed = 0;
timeRemaining = 60;

// Ajustar la velocidad de los ovnis según el nivel
const ovniSpeed = level * 0.5 + 1; // Aumenta la velocidad en 0.5 en cada nivel

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
      showGameOver(); // Mostrar mensaje de fin del juego en lugar de alert
    }
  }
}, 1000);



const ovniGenerationInterval = setInterval(() => {
  if (timeRemaining > 0) {
    createOvni(ovniSpeed); // Pasar la velocidad del ovni como parámetro
  } else {
    clearInterval(ovniGenerationInterval);
  }
}, 700); // Crea un nuevo ovni cada segundo
}

function resetGame() {
level = 1;
score = 0;
updateLevelDisplay();
updateScoreDisplay();
startLevel();
}

updateOvnis();



// Botón para iniciar el juego
const startButton = document.createElement('button');
startButton.textContent = 'Iniciar Juego';
startButton.style.backgroundColor = 'green';
startButton.style.color = 'white';
startButton.style.position = 'absolute';
startButton.style.left = '50%';
startButton.style.top = '80%';
startButton.style.transform = 'translate(-50%, -50%)'; // Centra el botón
startButton.addEventListener('click', () => {
document.body.removeChild(startButton);
startLevel();
});
document.body.appendChild(startButton);
