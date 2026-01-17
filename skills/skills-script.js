(function(){
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, dpi = window.devicePixelRatio || 1;
    let stars = [];
    let mouse = { x: -1000, y: -1000 };

    function resize(){
        w = window.innerWidth; h = window.innerHeight;
        canvas.width = w * dpi; canvas.height = h * dpi;
        ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
    }

    class Star {
        constructor() {
            this.init();
        }
        init() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.z = Math.random() * w; // Depth
            this.vx = 0; this.vy = 0;
            this.size = 0.5;
        }
        update() {
            // Slow Motion Drift
            this.z -= 0.5; 
            if (this.z <= 0) this.z = w;

            // 3D Projection
            let px = (this.x - w / 2) * (w / this.z) + w / 2;
            let py = (this.y - h / 2) * (w / this.z) + h / 2;
            let s = (1 - this.z / w) * 3;

            // Mouse Magnetism
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
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,w,h);
        stars.forEach(s => s.update());
        requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX; mouse.y = e.clientY;
    });

    resize();
    for(let i=0; i<400; i++) stars.push(new Star());
    window.addEventListener('resize', resize);
    loop();
})();

// Scroll Reveal Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { 
        if(e.isIntersecting) e.target.classList.add('reveal'); 
    });
}, { threshold: 0.1 });

document.querySelectorAll('.category-node').forEach(n => observer.observe(n));