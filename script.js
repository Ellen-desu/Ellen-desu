// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// --- Hero Typing Effect ---
const typingTarget = document.querySelector("[data-typing]");
if (typingTarget) {
  const phrases = [
    "Systems Programmer",
    "Networking",
    "HTTP Learner",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeSpeed = 110;
  const deleteSpeed = 65;
  const pauseAfterType = 1300;
  const pauseAfterDelete = 350;

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex = Math.max(0, charIndex - 1);
    } else {
      charIndex = Math.min(currentPhrase.length, charIndex + 1);
    }

    typingTarget.textContent = currentPhrase.slice(0, charIndex);

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      delay = pauseAfterType;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = pauseAfterDelete;
    }

    window.setTimeout(tick, delay);
  }

  tick();
}

// --- Particle Background (Cosmic Stars) ---
const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];

// Particle configuration
const particleCount = 150;
const connectionDistance = 120;
const mouseDistance = 150;

let mouse = {
  x: null,
  y: null,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
});

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  resize();
  initParticles();
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;

    // Random velocity
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  draw() {
    ctx.fillStyle = "rgba(226, 232, 240, 0.8)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    // Move particles automatically
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > width) this.vx = -this.vx;
    if (this.y < 0 || this.y > height) this.vy = -this.vy;

    // Mouse interaction (repulsion)
    if (mouse.x != null && mouse.y != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouseDistance) {
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouseDistance;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        this.x -= directionX;
        this.y -= directionY;
      }
    }
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance) {
        let opacity = 1 - distance / connectionDistance;
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  connectParticles();
  requestAnimationFrame(animateParticles);
}

// Initialize canvas
resize();
initParticles();
animateParticles();

// --- Scroll Animations (Intersection Observer) ---
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // Stop observing once it's visible
    }
  });
}, observerOptions);

document.querySelectorAll(".slide-up").forEach((element) => {
  observer.observe(element);
});

// --- GitHub Repo Stats (Real-time Fetching) ---
async function fetchGitHubStats() {
  const projectCards = document.querySelectorAll(".project-card");

  for (const card of projectCards) {
    const repoUrl = card.getAttribute("href");
    if (!repoUrl || !repoUrl.includes("github.com")) continue;

    // Extract owner and repo name from URL (e.g., https://github.com/owner/repo)
    const path = repoUrl.replace("https://github.com/", "");
    const parts = path.split("/").filter((part) => part.length > 0);
    if (parts.length < 2) continue;

    const owner = parts[0];
    const repo = parts[1];

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );
      if (!response.ok) continue;

      const data = await response.json();

      // Update description if it exists in GitHub
      if (data.description) {
        const descElement = card.querySelector("p");
        if (descElement) descElement.textContent = data.description;
      }

      // Update star count
      const starsElement = card.querySelector(".stars");
      if (starsElement) {
        starsElement.textContent = `⭐ ${data.stargazers_count}`;
      }
    } catch (error) {
      console.error(`Failed to fetch stats for ${repo}:`, error);
    }
  }
}

// Fetch stats on load
fetchGitHubStats();
