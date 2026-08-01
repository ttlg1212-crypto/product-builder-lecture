const themeToggle = document.getElementById('themeToggle');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

applyTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'light' ? 'dark' : 'light');
});

const ballColor = (n) => {
  if(n <= 10) return 'var(--ball-1)';
  if(n <= 20) return 'var(--ball-2)';
  if(n <= 30) return 'var(--ball-3)';
  if(n <= 40) return 'var(--ball-4)';
  return 'var(--ball-5)';
};

const dateTag = document.getElementById('dateTag');
const today = new Date();
dateTag.textContent = today.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'short' });

const excluded = new Set();
const numGrid = document.getElementById('numGrid');
for(let i=1;i<=45;i++){
  const cell = document.createElement('div');
  cell.className = 'num-cell';
  cell.textContent = i;
  cell.addEventListener('click', () => {
    if(excluded.has(i)){ excluded.delete(i); cell.classList.remove('excluded'); }
    else {
      if(excluded.size >= 39){ excluded.clear(); document.querySelectorAll('.num-cell').forEach(c=>c.classList.remove('excluded')); return; }
      excluded.add(i); cell.classList.add('excluded');
    }
  });
  numGrid.appendChild(cell);
}

document.getElementById('optionsBtn').addEventListener('click', () => {
  const panel = document.getElementById('optionsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

function pickNumbers(){
  const pool = [];
  for(let i=1;i<=45;i++){ if(!excluded.has(i)) pool.push(i); }
  const picked = [];
  while(picked.length < 6 && pool.length > 0){
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx,1)[0]);
  }
  return picked.sort((a,b)=>a-b);
}

const ballsRow = document.getElementById('ballsRow');
const drawBtn = document.getElementById('drawBtn');
const historyList = document.getElementById('historyList');
let history = [];

function makeMiniBall(n){
  const b = document.createElement('div');
  b.className = 'mini-ball';
  b.style.background = `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.7), rgba(255,255,255,0) 42%), ${ballColor(n)}`;
  b.textContent = n;
  return b;
}

function renderHistory(){
  if(history.length === 0){
    historyList.innerHTML = '<div class="empty-history">아직 뽑은 번호가 없어요</div>';
    return;
  }
  historyList.innerHTML = '';
  history.slice(0,6).forEach(entry => {
    const row = document.createElement('div');
    row.className = 'history-row';

    const nums = document.createElement('div');
    nums.className = 'history-nums';
    entry.set.forEach(n => nums.appendChild(makeMiniBall(n)));

    const time = document.createElement('div');
    time.className = 'history-time';
    time.textContent = entry.time;

    row.appendChild(nums);
    row.appendChild(time);
    historyList.appendChild(row);
  });
}

document.getElementById('clearHistory').addEventListener('click', () => {
  history = [];
  renderHistory();
});

function draw(){
  drawBtn.disabled = true;
  drawBtn.textContent = '뽑는 중…';

  const finalSet = pickNumbers();

  ballsRow.innerHTML = '';
  const setBalls = document.createElement('div');
  setBalls.className = 'set-balls';
  setBalls.style.justifyContent = 'center';
  ballsRow.appendChild(setBalls);

  const allTempBalls = []; // [{ballEl, num}]
  finalSet.forEach(n => {
    const b = document.createElement('div');
    b.className = 'ball rolling';
    b.style.setProperty('--c', 'var(--ball-4)');
    b.textContent = '?';
    setBalls.appendChild(b);
    requestAnimationFrame(() => b.classList.add('show'));
    allTempBalls.push({ el: b, num: n });
  });

  let revealed = 0;
  const total = allTempBalls.length;
  const revealNext = () => {
    if(revealed >= total){
      drawBtn.disabled = false;
      drawBtn.textContent = '다시 뽑기';
      history.unshift({
        set: finalSet,
        time: new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' })
      });
      renderHistory();
      return;
    }
    const { el, num } = allTempBalls[revealed];
    el.classList.remove('rolling');
    el.style.setProperty('--c', ballColor(num));
    el.textContent = num;
    revealed++;
    setTimeout(revealNext, 90);
  };
  setTimeout(revealNext, 450);
}

drawBtn.addEventListener('click', draw);
