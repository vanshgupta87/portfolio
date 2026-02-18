/* --- INITIALIZE EMAILJS --- */
(function() {
    // Replace with your actual Public Key from EmailJS Account Tab
    emailjs.init("jE9TOzYMM9AtvyrPm"); 
})();
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
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.z = Math.random() * w;
        }
        update() {
            this.z -= 0.6;
            if (this.z <= 0) this.z = w;
            let px = (this.x - w / 2) * (w / this.z) + w / 2;
            let py = (this.y - h / 2) * (w / this.z) + h / 2;
            let s = (1 - this.z / w) * 3;
            let dx = mouse.x - px;
            let dy = mouse.y - py;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                px -= dx * 0.04;
                py -= dy * 0.04;
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
    for(let i=0; i<350; i++) stars.push(new Star());
    window.addEventListener('resize', resize);
    loop();
})();
const form = document.getElementById('portfolioForm');
const successBox = document.getElementById('successMessage');
const displayUserName = document.getElementById('displayUserName');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = document.querySelector('.send-btn');
    const name = document.getElementById('userName').value;
    
    btn.innerHTML = "Beaming Message...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    // Configuration
    const serviceID = 'service_bi7i4bv';
    const templateID = 'template_42f33rt'; // Replace this with your actual template ID!

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            form.style.display = 'none';
            successBox.style.display = 'block';
            displayUserName.innerText = name;
        }, (err) => {
            btn.disabled = false;
            btn.innerHTML = "Mission Failed. Try Again?";
            btn.style.opacity = "1";
            alert("Transmission error: " + JSON.stringify(err));
        });
});
window.onload = () => {
    document.getElementById('contactSection').classList.add('reveal');
}