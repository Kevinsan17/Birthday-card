"use strict";

window.addEventListener("load", function () {
  // Crear y configurar el canvas
  const canv = document.createElement("canvas");
  document.body.appendChild(canv);
  const ctx = canv.getContext("2d");

  // Inicializar tamaño del canvas
  let maxx, maxy;

  function resizeCanvas() {
    maxx = window.innerWidth;
    maxy = window.innerHeight;
    canv.width = maxx;
    canv.height = maxy;
  }
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

  // Funciones de utilidad para aleatoriedad
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
  const randColor = () => `hsl(${randInt(0, 360)}, 100%, 50%)`;

  // Clase para las partículas de la explosión
  class Particle {
    constructor(x, y, color, speed, direction, gravity, friction, size) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = speed;
      this.direction = direction;
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
      this.gravity = gravity;
      this.friction = friction;
      this.alpha = 1;
      this.decay = rand(0.005, 0.02);
      this.size = size;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    isAlive() {
      return this.alpha > 0;
    }
  }

  // Clase para el cohete del fuego artificial
  class Firework {
    constructor(x, y, targetY, color, speed, size) {
      this.x = x;
      this.y = y;
      this.targetY = targetY;
      this.color = color;
      this.speed = speed;
      this.size = size;
      this.angle = -Math.PI / 2 + rand(-0.3, 0.3);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
      this.trailLength = randInt(10, 25);
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }

      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.02; // Gravedad que frena el ascenso

      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode();
        return false; // El cohete explotó
      }
      return true; // Sigue ascendiendo
    }

    explode() {
      const numParticles = randInt(80, 150);
      for (let i = 0; i < numParticles; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(2, 7);
        const particleSize = rand(1, 4);
        explosions.push(
          new Particle(this.x, this.y, this.color, speed, angle, 0.05, 0.98, particleSize)
        );
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      if (this.trail.length > 1) {
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let point of this.trail) {
          ctx.lineTo(point.x, point.y);
        }
      } else {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }
  }

  let fireworks = [];
  let explosions = [];

  // Lanza un nuevo fuego artificial a intervalos aleatorios
  function launchFirework() {
    const x = rand(maxx * 0.1, maxx * 0.9);
    const y = maxy;
    const targetY = rand(maxy * 0.1, maxy * 0.4);
    const color = randColor();
    const speed = rand(4, 8);
    const size = rand(2, 5);
    fireworks.push(new Firework(x, y, targetY, color, speed, size));
    setTimeout(launchFirework, rand(300, 800));
  }

  launchFirework();

  // Bucle de animación principal
  function animate() {
    // Dibuja un rectángulo semi-transparente para crear el efecto de estela
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, maxx, maxy);

    // --- DIBUJAR EL TEXTO DE FELICITACIÓN ---
    // Simplemente añade o quita líneas en este array para cambiar el texto
    const textLines = [
      "Happy birthday!", "my little baby", "🎂❤️"
    ];

    ctx.save();
    // Hacemos la fuente un poco más pequeña para que quepa bien el texto
    const fontSize = Math.min(60, window.innerWidth / 12);
    const lineHeight = fontSize * 1.1;
    ctx.font = `bold ${fontSize}px 'Amatic SC', cursive`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Añade un efecto de brillo al texto
    ctx.shadowColor = "rgba(255, 97, 97, 0.8)";
    ctx.shadowBlur = 15;

    // Calcula la posición inicial para centrar todo el bloque de texto
    const totalTextHeight = textLines.length * lineHeight;
    const startY = (maxy - totalTextHeight) / 2 + lineHeight / 2;

    // Dibuja cada línea de texto
    textLines.forEach((line, index) => {
      ctx.fillText(line, maxx / 2, startY + (index * lineHeight));
    });

    ctx.restore();
    // --- FIN DEL TEXTO ---


    // Actualiza y dibuja los cohetes
    for (let i = fireworks.length - 1; i >= 0; i--) {
      if (!fireworks[i].update()) {
        fireworks.splice(i, 1);
      } else {
        fireworks[i].draw(ctx);
      }
    }

    // Actualiza y dibuja las partículas de la explosión
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].update();
      if (explosions[i].isAlive()) {
        explosions[i].draw(ctx);
      } else {
        explosions.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Lanza un fuego artificial en la posición del clic
  window.addEventListener("click", function (event) {
    const x = event.clientX;
    const y = maxy;
    const targetY = event.clientY;
    const color = randColor();
    const speed = rand(4, 8);
    const size = rand(2, 5);
    fireworks.push(new Firework(x, y, targetY, color, speed, size));
  });
});