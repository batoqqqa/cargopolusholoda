
const route = ["Якутск","Токума","Борулах","Батагай","Верхоянск","Боронук","Арылах"];
const fromSelect = document.getElementById("fromSelect");
const toSelect   = document.getElementById("toSelect");

if (fromSelect && toSelect) {
    fromSelect.addEventListener("change", () => {
      toSelect.innerHTML = '<option value="">Куда</option>';
      const from = fromSelect.value;
      if (!from) return;
      if (from === "Якутск") {
        route.slice(1).forEach(city => appendOption(city));
      } else {
        appendOption("Якутск");
      }
    });
}

function appendOption(city) {
  const opt = document.createElement("option");
  opt.value = city;
  opt.textContent = city;
  toSelect.appendChild(opt);
}

let selectedSize = null;
document.querySelectorAll('.option-button.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedSize = btn.dataset.size; 
  });
});

let selectedSection = null;
document.querySelectorAll('.option-button.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.section-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedSection = btn.dataset.section;
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const firstSize    = document.querySelector('.size-btn');
  const firstSection = document.querySelector('.section-btn');
  if (firstSize)    firstSize.click();
  if (firstSection) firstSection.click();
});

const calculateBtn = document.getElementById('calculate-btn');
const costOutput   = document.getElementById('calculated-cost');

if (calculateBtn && costOutput) {
  calculateBtn.addEventListener('click', () => {
    const from   = fromSelect.value;
    const to     = toSelect.value;
    const len    = parseFloat(document.getElementById('length').value) || 0;
    const wid    = parseFloat(document.getElementById('width').value)  || 0;
    const hei    = parseFloat(document.getElementById('height').value) || 0;
    const weight = parseFloat(document.getElementById('weight').value) || 0;


    if (!from || !to || !selectedSize) {
      costOutput.textContent = '—';
      return;
    }


    if (selectedSize === 'negabarit') {
      if (len <= 0 || wid <= 0 || hei <= 0) {
        costOutput.textContent = 'Ошибка';
        return;
      }
    } else {
      if (weight <= 0) {
        costOutput.textContent = 'Ошибка';
        return;
      }
    }

    let cost;

    if (selectedSize === 'negabarit') {

      const volume = (len / 100) * (wid / 100) * (hei / 100);
      cost = (from === 'Якутск')
        ? volume * 23000
        : weight * 50;
    } else {

      let rate;
      if (from === 'Якутск' && to !== 'Якутск') {
        rate = (to === 'Арылах')
          ? (selectedSection === 'cold' ? 75 : 85)
          : (selectedSection === 'cold' ? 70 : 80);
      } else if (to === 'Якутск') {
        rate = 50;
      } else {
        costOutput.textContent = 'н/д';
        return;
      }
      cost = weight * rate;
    }

    costOutput.textContent = cost.toFixed(2);
  });
}

function toggleMenu() {
  let menu = document.querySelector('.mobile-nav');
  if (!menu) {
    menu = document.createElement('div');
    menu.className = 'mobile-nav';
    menu.innerHTML = `
      <a href="#about">О компании</a>
      <a href="#rules">Правила</a>
      <a href="#calculator">Калькулятор</a>
      <a href="#contacts">Контакты</a>
    `;
    document.body.appendChild(menu);
  }
  menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}
document.querySelectorAll('.burger').forEach(b => b.addEventListener('click', toggleMenu));

document.querySelectorAll('.faq-header').forEach(header => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('active');
  });
});

document.addEventListener('DOMContentLoaded', () => {

  const defaultSizeBtn = document.querySelector('.option-button[data-type="size"]');
  if (defaultSizeBtn) {
    defaultSizeBtn.classList.add('active');
    selectedSize = defaultSizeBtn.textContent.toLowerCase().includes('нега') ? 'negabarit' : 'gabarit';
  }
  const defaultSectionBtn = document.querySelector('.option-button[data-type="section"]');
  if (defaultSectionBtn) {
    defaultSectionBtn.classList.add('active');
    selectedSection = defaultSectionBtn.textContent.toLowerCase().includes('холод') ? 'cold' : 'warm';
  }
});


function openLogin() {
  window.location.href = "login.html";
}



