/* --- STAR BACKGROUND --- */
(function(){
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, dpi = window.devicePixelRatio || 1;
    let stars = [];
    let mouse = { x: -1000, y: -1000 };

    function resize(){
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpi;
        canvas.height = h * dpi;
        ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
        stars = [];
        for(let i=0; i<400; i++) stars.push(new Star());
    }

    class Star {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.z = Math.random() * w;
        }
        update() {
            this.z -= 0.8;
            if (this.z <= 0) this.z = w;
            let px = (this.x - w / 2) * (w / this.z) + w / 2;
            let py = (this.y - h / 2) * (w / this.z) + h / 2;
            let s = (1 - this.z / w) * 3;
            let dx = mouse.x - px;
            let dy = mouse.y - py;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 200) {
                px -= dx * 0.05;
                py -= dy * 0.05;
            }
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.z / w})`;
            ctx.beginPath();
            ctx.arc(px, py, s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function loop(){
        ctx.fillStyle = "#020204";
        ctx.fillRect(0,0,w,h);
        stars.forEach(s => s.update());
        requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX; mouse.y = e.clientY;
    });

    window.addEventListener('resize', resize);
    resize();
    loop();
})();

/* --- TYPEWRITER EFFECT --- */
const textEl = document.getElementById('typewriter');
const phrases = ["Full-Stack Developer", "Hybrid AI Engineer", "Passionate Developer"];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;

function typeEffect() {
    const currentPhrase = phrases[phraseIdx];
    if (isDeleting) {
        textEl.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
    } else {
        textEl.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
    }

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIdx === currentPhrase.length) {
        speed = 2000; // Pause at the end of phrase
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 500;
    }
    setTimeout(typeEffect, speed);
}
typeEffect();

/* --- INNER CARD MOVEMENT --- */
const card = document.getElementById('tiltCard');
const inner = document.getElementById('innerCard');

card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate shift (adjust the denominator to change sensitivity)
    const moveX = (x - rect.width / 2) / 12;
    const moveY = (y - rect.height / 2) / 12;

    inner.style.transition = 'none'; // Disable transition for real-time tracking
    inner.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
});

// Reset when cursor leaves the card boundary
card.addEventListener('mouseleave', () => {
    inner.style.transition = 'transform 0.4s ease-out'; // Smooth reset
    inner.style.transform = `translateX(0px) translateY(0px)`;
});