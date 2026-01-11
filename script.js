/* Simple, performant starfield with parallax and occasional shooting stars.
   - Include <canvas id="spaceCanvas" class="space-canvas"></canvas> in <body>
   - Add <script src="space.js" defer></script>
*/

(function(){
  // Respect reduced motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const canvas = document.getElementById('spaceCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpi = window.devicePixelRatio || 1;

  // Config
  const STAR_COUNT = 160;
  const STAR_COLOR = ['#ffffff','#ffe9c4','#d4fbff'];
  const SHOOT_PROB = 0.0025; // chance per frame
  const SHOOT_SPEED_MIN = 6;
  const SHOOT_SPEED_MAX = 12;

  let stars = [];
  let mouse = { x: null, y: null };

  function resize(){
    dpi = window.devicePixelRatio || 1;
    w = Math.max(document.documentElement.clientWidth || 300, window.innerWidth || 300);
    h = Math.max(document.documentElement.clientHeight || 200, window.innerHeight || 200);
    canvas.width  = Math.floor(w * dpi);
    canvas.height = Math.floor(h * dpi);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function createStar(i){
    const depth = Math.random(); // 0..1, closer = brighter/faster
    return {
      id: i,
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.pow(depth, 0.6) * rand(0.5, 1.8),
      alpha: rand(0.2, 0.98),
      depth: depth,
      twinkleSpeed: rand(0.002, 0.01),
      color: STAR_COLOR[Math.floor(Math.random() * STAR_COLOR.length)]
    };
  }

  function initStars(){
    stars = [];
    const count = Math.max(80, Math.min(STAR_COUNT, Math.floor((w*h) / 2500)));
    for(let i=0;i<count;i++) stars.push(createStar(i));
  }

  // Shooting stars store
  let shooting = [];

  function spawnShootingStar(){
    // from left/top-ish to right/bottom-ish
    const startX = rand(-0.3*w, 0.6*w);
    const startY = rand(-0.2*h, 0.4*h);
    const len = rand(150, 300);
    const speed = rand(SHOOT_SPEED_MIN, SHOOT_SPEED_MAX);
    shooting.push({
      x: startX,
      y: startY,
      vx: speed * rand(0.8, 1.2),
      vy: speed * rand(0.2, 0.7),
      len,
      life: 0,
      ttl: rand(40, 90),
      alpha: 0.9
    });
  }

  // Parallax factor based on mouse position
  function parallaxFactor(depth){
    if (mouse.x === null) return 0;
    const fx = (mouse.x / w - 0.5) * 2; // -1..1
    const fy = (mouse.y / h - 0.5) * 2;
    return { ox: -fx * (1 - depth) * 20, oy: -fy * (1 - depth) * 12 };
  }

  function update(){
    // twinkle and slight drift
    for (let s of stars){
      // twinkle
      s.alpha += Math.sin(Date.now() * s.twinkleSpeed + s.id) * 0.002;
      if (s.alpha > 1) s.alpha = 1;
      if (s.alpha < 0.05) s.alpha = 0.05;
      // subtle vertical drift by depth
      s.y += (0.02 + s.depth * 0.4) * 0.25;
      if (s.y > h + 10) s.y = -10;
      // slight horizontal drift
      s.x += Math.sin((Date.now() + s.id) * 0.0008) * 0.15;
      if (s.x > w + 10) s.x = -10;
      if (s.x < -10) s.x = w + 10;
    }

    // shooting stars
    for (let i = shooting.length - 1; i >= 0; i--){
      const sh = shooting[i];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life++;
      sh.alpha *= 0.995;
      if (sh.life > sh.ttl) shooting.splice(i,1);
    }

    // Random chance for a shooting star
    if (Math.random() < SHOOT_PROB) spawnShootingStar();
  }

  function draw(){
    // Clear with subtle vignette background to blend with canvas css background
    ctx.clearRect(0,0,w,h);

    // Stars
    for (let s of stars){
      const p = parallaxFactor(s.depth);
      const x = s.x + p.ox;
      const y = s.y + p.oy;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, s.size*8);
      grd.addColorStop(0, hexToRgba(s.color, s.alpha));
      grd.addColorStop(0.3, hexToRgba(s.color, s.alpha*0.7));
      grd.addColorStop(1, hexToRgba('#000000', 0));
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(x, y, s.size*2, 0, Math.PI*2);
      ctx.fill();
    }

    // Shooting stars
    for (let sh of shooting){
      const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx*1.6, sh.y - sh.vy*1.6);
      grad.addColorStop(0, `rgba(255,255,255,${sh.alpha})`);
      grad.addColorStop(0.8, `rgba(255,200,150,${Math.max(0, sh.alpha*0.6)})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx*1.6, sh.y - sh.vy*1.6);
      ctx.stroke();
      // head glow
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${sh.alpha})`;
      ctx.arc(sh.x, sh.y, 2.6, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function loop(){
    update();
    draw();
    raf = window.requestAnimationFrame(loop);
  }

  function hexToRgba(hex, alpha=1){
    // support #rgb, #rrggbb
    const h = hex.replace('#','');
    let r,g,b;
    if (h.length === 3){
      r = parseInt(h[0]+h[0],16);
      g = parseInt(h[1]+h[1],16);
      b = parseInt(h[2]+h[2],16);
    } else {
      r = parseInt(h.substr(0,2),16);
      g = parseInt(h.substr(2,2),16);
      b = parseInt(h.substr(4,2),16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // mouse parallax
  function onMove(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }
  function onLeave(){
    mouse.x = w/2;
    mouse.y = h/2;
  }

  let raf;
  function start(){
    resize();
    initStars();
    window.addEventListener('resize', () => {
      resize();
      initStars();
    }, {passive:true});
    window.addEventListener('mousemove', onMove, {passive:true});
    window.addEventListener('mouseleave', onLeave);
    onLeave();
    raf = window.requestAnimationFrame(loop);
  }

  // Initialize
  start();

  // Expose control (optional)
  window.__spacefield = {
    start: start,
    stop: function(){
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      window.removeEventListener('mousemove', onMove);
    }
  };
})();
