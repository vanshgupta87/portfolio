function showDetails(title, desc) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDescription').innerText = desc;
    document.getElementById('modalOverlay').style.display = 'flex';
}
function hideDetails() {
    document.getElementById('modalOverlay').style.display = 'none';
}
(function(){
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];
    let mouse = { x: -1000, y: -1000 };

    function resize(){
        w = window.innerWidth; h = window.innerHeight;
        canvas.width = w; canvas.height = h;
    }

    class Star {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.z = Math.random() * w;
        }
        update() {
            this.z -= 0.7;
            if (this.z <= 0) this.z = w;
            let px = (this.x - w / 2) * (w / this.z) + w / 2;
            let py = (this.y - h / 2) * (w / this.z) + h / 2;
            let s = (1 - this.z / w) * 3;
            
            let dx = mouse.x - px;
            let dy = mouse.y - py;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
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

    resize();
    for(let i=0; i<300; i++) stars.push(new Star());
    window.addEventListener('resize', resize);
    loop();
})();
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('reveal');
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card').forEach(card => observer.observe(card));