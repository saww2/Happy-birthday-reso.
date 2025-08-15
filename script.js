// Shared JS for music, navigation, carousel, lyrics sync, and confetti
(function(){
  const audio = document.getElementById('player');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  if (audio && playBtn && pauseBtn) {
    // Restore volume & play state
    const wanted = localStorage.getItem('hb_music') === 'on';
    const vol = localStorage.getItem('hb_volume');
    if (vol) audio.volume = parseFloat(vol);

    playBtn.addEventListener('click', async () => {
      try {
        await audio.play();
        localStorage.setItem('hb_music', 'on');
        playBtn.classList.add('active');
      } catch (e) {
        console.warn('Autoplay blocked until user interaction:', e);
      }
    });

    pauseBtn.addEventListener('click', () => {
      audio.pause();
      localStorage.setItem('hb_music', 'off');
      playBtn.classList.remove('active');
    });

    // Attempt resume if previously on
    if (wanted) {
      // Some browsers allow resume after a prior gesture on the site
      audio.play().catch(()=>{});
    }

    // Save volume changes
    audio.addEventListener('volumechange', () => {
      localStorage.setItem('hb_volume', audio.volume.toString());
    });
  }

  // Page-specific: index -> Enter button navigation
  const enter = document.getElementById('enterBtn');
  if (enter) {
    enter.addEventListener('click', () => {
      // Try start music first; if blocked, user can hit Play
      const a = document.getElementById('player');
      if (a) {
        a.play().then(()=>localStorage.setItem('hb_music','on')).catch(()=>{});
      }
      window.location.href = 'quotes.html';
    });
  }

  // Quotes carousel
  const carousel = document.getElementById('quoteCarousel');
  if (carousel) {
    const quotes = Array.from(carousel.querySelectorAll('blockquote'));
    const dots = document.getElementById('dots');
    let idx = 0;

    function show(i){
      quotes.forEach((q, n)=> q.classList.toggle('active', n===i));
      if (dots) {
        dots.querySelectorAll('button').forEach((d,n)=>d.classList.toggle('active', n===i));
      }
    }

    if (quotes.length) {
      quotes.forEach((_, i) => {
        const b = document.createElement('button');
        b.addEventListener('click', ()=>{ idx = i; show(idx); });
        dots.appendChild(b);
      });
      show(0);
      setInterval(()=>{ idx = (idx+1) % quotes.length; show(idx); }, 3500);
    }
  }

  // Lyrics sync on final page
  const lyrics = document.getElementById('lyrics');
  if (lyrics && audio) {
    const lines = Array.from(lyrics.querySelectorAll('span'));
    const timings = lines.map(el => parseFloat(el.dataset.t || '0'));

    function updateLyrics(){
      const t = audio.currentTime;
      let active = -1;
      for (let i=0; i<timings.length; i++) {
        if (t >= timings[i]) active = i;
      }
      lines.forEach((el, i) => el.classList.toggle('active', i === active));
      requestAnimationFrame(updateLyrics);
    }
    audio.addEventListener('play', ()=> requestAnimationFrame(updateLyrics));
  }

  // Confetti on message page
  const canvas = document.getElementById('confetti');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h; 
    function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
    window.addEventListener('resize', resize); resize();

    const pieces = Array.from({length: 160}, ()=> ({
      x: Math.random()*w,
      y: Math.random()*h - h,
      r: Math.random()*6 + 4,
      s: Math.random()*2 + 1,
      a: Math.random()*360
    }));

    function draw(){
      ctx.clearRect(0,0,w,h);
      pieces.forEach(p => {
        p.y += p.s;
        p.x += Math.sin((p.y + p.a) * 0.01);
        if (p.y > h+10) { p.y = -10; p.x = Math.random()*w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${(p.a + p.y)*0.3}, 80%, 70%)`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
})();