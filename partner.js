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

const form = document.getElementById('partnerForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = '보내는 중…';
  formMsg.textContent = '';
  formMsg.className = 'form-msg';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if(response.ok){
      form.reset();
      formMsg.textContent = '문의가 접수되었습니다. 빠르게 답변드릴게요!';
      formMsg.classList.add('success');
      submitBtn.textContent = '문의 보내기';
    } else {
      throw new Error('submit failed');
    }
  } catch (err) {
    formMsg.textContent = '전송에 실패했어요. 잠시 후 다시 시도해 주세요.';
    formMsg.classList.add('error');
    submitBtn.textContent = '문의 보내기';
  } finally {
    submitBtn.disabled = false;
  }
});
