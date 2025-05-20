function setSession(user, accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('currentUser') || 'null');
}

function requireAuth() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    window.location.href = 'login.html';
  }
}
window.requireAuth = requireAuth;


function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user) {

    alert('Пожалуйста, войдите под администратором');
    return window.location.href = 'login.html';
  }
  if (user.role !== 'admin') {

    alert('Доступ запрещён, недостаточно прав');
    return window.location.href = 'dashboard.html';
  }
}

window.requireAdmin = requireAdmin;


document.addEventListener('DOMContentLoaded', () => {

  
  const form    = document.getElementById('register-form');
  const input   = document.getElementById('password');
  const errEl   = document.getElementById('password-error');
  const regex   = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


  fetch('/api/auth/captcha', { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error('Не удалось загрузить капчу');
      return res.json();
    })
    .then(({ a, b }) => {
      const questionEl = document.getElementById('captcha-question');
      if (questionEl) {
        questionEl.textContent = `Сколько будет ${a} + ${b}?`;
      }
    })
    .catch(err => console.error('Ошибка загрузки капчи:', err)
  );

  
  const loginForm    = document.getElementById('login-form');
    if (loginForm){
      loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const email         = loginForm.email.value.trim();
        const password      = loginForm.password.value.trim();
        const captchaAnswer = loginForm.captchaAnswer.value.trim();

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, captchaAnswer })
          });
          const data = await res.json();
          if (!res.ok) {
            alert('Ошибка: ' + (data.message || 'Неверный логин или капча'));
            return;
          }

          setSession(data.user, data.accessToken, data.refreshToken);

          if (data.user.role === 'admin') 
          {
            window.location.href = 'admin.html';
          } 

          else 
          {
            window.location.href = 'dashboard.html';
          }

        } catch (err) {
          console.error('Ошибка при логине:', err);
          alert('Произошла ошибка при авторизации. Попробуйте позже.');
        }
        
      });
    }


  const registerForm = document.getElementById('register-form');

  if (registerForm) {


    const passwordInput = registerForm.password;
    const errEl = document.getElementById('password-error');
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    registerForm.addEventListener('submit', async e => {
      e.preventDefault();

      const pwd = passwordInput.value.trim();
      if (!regex.test(pwd)) {
        errEl.style.display = 'block';
        return;
      }
      errEl.style.display = 'none';

      const name     = registerForm.name.value.trim();
      const email    = registerForm.email.value.trim();
      const password = pwd;

      try {

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.message || res.statusText);
        }

        setSession(data.user, data.accessToken, data.refreshToken);
        alert('Успешно! Вы зарегистрированы, сейчас вы будете переадресованы на страницу авторизации.');
        window.location.href = 'login.html';
      } catch (err) {
        alert('Ошибка регистрации: ' + err.message);
      }
    });
  }
});
