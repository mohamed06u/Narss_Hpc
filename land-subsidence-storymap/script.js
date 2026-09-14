// Scroll progress bar + topbar reveal
const progress = document.getElementById('progress');
const topbar = document.getElementById('topbar');
const hero = document.querySelector('.hero');

function onScroll(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + '%';

  if (h.scrollTop > hero.offsetHeight * 0.7){
    topbar.classList.add('visible');
  } else {
    topbar.classList.remove('visible');
  }
}
document.addEventListener('scroll', onScroll, { passive:true });
onScroll();

// Count-up for stat numbers, once, on first view
const statNums = document.querySelectorAll('.stat-num[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el){
  const target = parseInt(el.getAttribute('data-count'), 10);
  if (reduceMotion){ el.textContent = target; return; }
  const duration = 1200;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      animateCount(entry.target);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

statNums.forEach(el => io.observe(el));
