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

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/jf2yzTcVb/";

const EMOJI = { '강아지': '🐶', '고양이': '🐱' };
const DESC = {
  '강아지': '사랑스럽고 친근한 매력이 넘치는 강아지상이에요. 웃을 때 더 매력적인 타입!',
  '고양이': '시크하고 도도한 매력이 있는 고양이상이에요. 눈매가 매력 포인트!'
};

let modelPromise = null;
function loadModel(){
  if(!modelPromise){
    modelPromise = tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
  }
  return modelPromise;
}

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadPrompt = document.getElementById('uploadPrompt');
const previewImg = document.getElementById('previewImg');
const actionRow = document.getElementById('actionRow');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const retryBtn = document.getElementById('retryBtn');
const resultPanel = document.getElementById('resultPanel');
const verdictEmoji = document.getElementById('verdictEmoji');
const verdictType = document.getElementById('verdictType');
const verdictDesc = document.getElementById('verdictDesc');
const barsContainer = document.getElementById('barsContainer');

function showPreview(file){
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.onload = () => URL.revokeObjectURL(url);
  previewImg.classList.remove('hidden');
  uploadPrompt.classList.add('hidden');
  actionRow.classList.remove('hidden');
  resultPanel.classList.add('hidden');
}

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if(file && file.type.startsWith('image/')) showPreview(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if(file) showPreview(file);
});

resetBtn.addEventListener('click', () => {
  fileInput.value = '';
  previewImg.classList.add('hidden');
  uploadPrompt.classList.remove('hidden');
  actionRow.classList.add('hidden');
  resultPanel.classList.add('hidden');
});

retryBtn.addEventListener('click', () => resetBtn.click());

function renderBars(predictions){
  barsContainer.innerHTML = '';
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  sorted.forEach((p, i) => {
    const pct = Math.round(p.probability * 100);
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-label">${EMOJI[p.className] || ''} ${p.className}상</div>
      <div class="bar-track"><div class="bar-fill" style="--c: var(${i === 0 ? '--ball-1' : '--ball-2'})"></div></div>
      <div class="bar-value">${pct}%</div>
    `;
    barsContainer.appendChild(row);
    requestAnimationFrame(() => {
      row.querySelector('.bar-fill').style.width = pct + '%';
    });
  });
  return sorted;
}

analyzeBtn.addEventListener('click', async () => {
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = '분석 중…';
  try{
    const model = await loadModel();
    const predictions = await model.predict(previewImg);
    const sorted = renderBars(predictions);
    const top = sorted[0];
    const pct = Math.round(top.probability * 100);

    verdictEmoji.textContent = EMOJI[top.className] || '🐾';
    verdictType.textContent = `${top.className}상 (${pct}%)`;
    verdictDesc.textContent = DESC[top.className] || '';

    resultPanel.classList.remove('hidden');
  } catch(err){
    verdictEmoji.textContent = '⚠️';
    verdictType.textContent = '분석에 실패했어요';
    verdictDesc.textContent = '잠시 후 다시 시도해 주세요.';
    barsContainer.innerHTML = '';
    resultPanel.classList.remove('hidden');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '동물상 분석하기';
  }
});
