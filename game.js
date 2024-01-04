// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let backgroundMusic; // Declarar la variable fuera del bloque

const snakeSize = 20;
const canvasSize = 600;
let snake = [{ x: 100, y: 100 }];
let direction = "right";
let newSegments = 0;
let speed = 150;
let food = generateFood();
let gameInterval;
let score = 0;
let countdown = 3;
let time = 0;
let playerName = getStoredPlayerName(); // Intenta obtener el nombre almacenado

canvas.width = canvasSize;
canvas.height = canvasSize;

// Función para mostrar el menú de inicio
function showStartMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "40px Arial";
    ctx.fillText("La Cobra Gay", canvas.width / 2 - 120, canvas.height / 2 - 40);
    ctx.font = "20px Arial";
    ctx.fillText("Ingresa tu nombre:", canvas.width / 2 - 80, canvas.height / 2);

    // Reproduce la música de fondo después de la interacción del usuario
    document.addEventListener('click', startBackgroundMusic);
}

// Función para iniciar la música de fondo
function startBackgroundMusic() {
    // Elimina el evento de clic después de la primera interacción
    document.removeEventListener('click', startBackgroundMusic);

    // Reproduce la música de fondo
    backgroundMusic = new Audio('audio/audiofondo.mp3');
    backgroundMusic.loop = true;

    // Agrega el control de volumen
    const volumeControl = document.getElementById('volumeControl');
    backgroundMusic.volume = volumeControl.value;

    // Actualiza el volumen cuando cambia el control
    volumeControl.addEventListener('input', () => {
        backgroundMusic.volume = volumeControl.value;
    });

    backgroundMusic.play();
}



// Función para manejar el inicio del juego después de ingresar el nombre
function startGame() {
    // Reinicializa las variables
    snake = [{ x: 100, y: 100 }];
    direction = "right";
    newSegments = 0;
    speed = 150;
    food = generateFood();
    score = 0;
    countdown = 20;
    time = 0;

    // Comienza el juego
    gameInterval = setInterval(gameLoop, speed);
}

// Función para dibujar el juego
function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja el marco del mapa
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Dibuja la cabeza de la serpiente en negro
    ctx.fillStyle = "#000000";
    ctx.fillRect(snake[0].x, snake[0].y, snakeSize, snakeSize);

    // Dibuja el resto del cuerpo en color
    for (let i = 1; i < snake.length; i++) {
        ctx.fillStyle = "#009688";
        ctx.fillRect(snake[i].x, snake[i].y, snakeSize, snakeSize);
    }

    // Dibuja la comida
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(food.x, food.y, snakeSize, snakeSize);

    // Dibuja la puntuación
    ctx.fillStyle = "#000000";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Time: " + time + "s", canvas.width - 120, 30);

    // Dibuja el contador antes de comenzar el juego
    if (countdown > 0) {
        ctx.fillStyle = "#000000";
        ctx.font = "40px Arial";
        ctx.fillText(countdown, canvas.width / 2 - 10, canvas.height / 2);
        return;
    }
}

// Función para mover la serpiente y verificar colisiones
function moveSnake() {
    if (countdown > 0) {
        countdown--;
        return;
    }

    const head = { ...snake[0] };

    switch (direction) {
        case "up":
            head.y -= snakeSize;
            break;
        case "down":
            head.y += snakeSize;
            break;
        case "left":
            head.x -= snakeSize;
            break;
        case "right":
            head.x += snakeSize;
            break;
    }

    if (collisionWithSelf(head) || collisionWithBorder(head)) {
        gameOver();
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        increaseSnakeSize();
        increaseScore(100);
        food = generateFood();
    }

    snake.unshift(head);

    if (newSegments > 0) {
        snake.push({ ...head });
        newSegments--;
    } else {
        snake.pop();
    }
}

// Función para aumentar el tamaño de la serpiente
function increaseSnakeSize() {
    newSegments++;
    speed = Math.max(50, speed - 10);
}

// Función para aumentar la puntuación
function increaseScore(points) {
    score += points;

    // Verifica si hay un récord almacenado
    const storedRecord = getStoredRecord();
    if (score > storedRecord) {
        setStoredRecord(score); // Almacena el nuevo récord

        // Reproduce el sonido de récord superado
        const newRecordSound = new Audio('audio/record.mp3'); // Reemplaza 'audio/record.mp3' con la ruta correcta a tu archivo de sonido de nuevo récord
        newRecordSound.play();

        console.log("Sonido del récord reproducido");
    }

    // Reproduce el sonido de comer
    const eatSound = new Audio('audio/eat.mp3'); // Reemplaza 'audio/eat.mp3' con la ruta correcta a tu archivo de sonido de comer
    eatSound.play();
}



// Función para generar comida
function generateFood() {
    const x = Math.floor(Math.random() * ((canvas.width - 10) / snakeSize) + 1) * snakeSize;
    const y = Math.floor(Math.random() * ((canvas.height - 10) / snakeSize) + 1) * snakeSize;
    return { x, y };
}

// Función para verificar colisión con el cuerpo de la serpiente
function collisionWithSelf(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Función para verificar colisión con el borde del mapa
function collisionWithBorder(head) {
    return (
        head.x < 5 || head.x >= canvas.width - 5 ||
        head.y < 5 || head.y >= canvas.height - 5
    );
}

// Función para manejar el final del juego
function gameOver() {
    clearInterval(gameInterval);

    // Reproduce el sonido de game over
    const gameOverSound = new Audio('audio/gameover.mp3'); // Reemplaza 'audio/gameover.mp3' con la ruta correcta a tu archivo de sonido de game over
    gameOverSound.play();

    const storedRecord = getStoredRecord();
    alert(playerName + "'s Score: " + score + " | Record: " + storedRecord + " | Time: " + time + "s");

    // Mostrar el cartel del récord superado solo cuando la serpiente muera
    if (score > storedRecord) {
        alert("Record Superado!");
    }

    startGame(); // Reinicia el juego automáticamente después de mostrar el puntaje
}


// Función para reiniciar el juego
function resetGame() {
    showStartMenu();
}

// Función principal del bucle del juego
function gameLoop() {
    moveSnake();
    drawSnake();
    time++;
}

// Función para obtener el nombre almacenado en las cookies
function getStoredPlayerName() {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.startsWith("playerName=")) {
            return cookie.substring("playerName=".length);
        }
    }
    return null;
}

// Función para obtener el récord almacenado en las cookies
function getStoredRecord() {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.startsWith("record=")) {
            return parseInt(cookie.substring("record=".length)) || 0;
        }
    }
    return 0;
}

// Función para establecer el récord almacenado en las cookies
function setStoredRecord(record) {
    document.cookie = "record=" + record;
}

// Evento para manejar la entrada del nombre y comenzar el juego
document.addEventListener("keydown", (e) => {
    if (!playerName) {
        playerName = prompt("Enter your name:");
        if (playerName) {
            getStoredPlayerName(playerName);  // Almacena el nombre en las cookies
            startGame(); // Comienza el juego después de ingresar el nombre
        } else {
            playerName = getStoredPlayerName();
        }
    } else if (countdown === 0) {
        switch (e.key) {
            case "ArrowUp":
                if (direction !== "down") direction = "up";
                break;
            case "ArrowDown":
                if (direction !== "up") direction = "down";
                break;
            case "ArrowLeft":
                if (direction !== "right") direction = "left";
                break;
            case "ArrowRight":
                if (direction !== "left") direction = "right";
                break;
        }
    }
});

// Muestra el menú de inicio al cargar la página
showStartMenu();

// Función para iniciar el juego del T-Rex Dinosaurio
function startDinoGame() {
    // Redirecciona al juego del T-Rex Dinosaurio
    window.location.href = '../juego2/dino.html'; // Asegúrate de que la página del juego del dinosaurio tenga un nombre de archivo adecuado
}