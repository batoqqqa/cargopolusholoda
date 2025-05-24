
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

    costOutput.textContent = cost.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace(',', '.');

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

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function(e) {
    e.preventDefault();

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');

    const targetId = this.getAttribute('href');
    const targetPane = document.querySelector(targetId);
    if (targetPane) targetPane.style.display = '';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const firstTab = document.querySelector('.tab');
  if (firstTab) firstTab.click();
});

document.addEventListener('DOMContentLoaded', function() {

  document.querySelectorAll('.dashboard-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();

      document.querySelectorAll('.dashboard-menu-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');

      const paneId = this.getAttribute('href');
      const pane = document.querySelector(paneId);
      if (pane) pane.style.display = '';
    });
  });

  const firstItem = document.querySelector('.dashboard-menu-item');
  if (firstItem) firstItem.click();
});

document.getElementById('report-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const resp = await fetch(`/api/orders-report?startDate=${startDate}&endDate=${endDate}`);
  const data = await resp.json();
  showReportTable(data);
});

function showReportTable(data) {
  if (!data.length) {
    document.getElementById('report-table').innerHTML = '<p>Нет данных за выбранный период</p>';
    return;
  }
  let table = `<table border="1"><tr>
    <th>ID</th>
    <th>Откуда</th>
    <th>Куда</th>
    <th>Категория</th>
    <th>Секция</th>
    <th>Дата создания</th>
    <th>Размеры (Д×Ш×В, см)</th>
    <th>Вес, кг</th>
    <th>Объем, м³</th>
    <th>Ценность</th>
    <th>Стоимость</th>
    <th>Описание</th>
    <th>Количество</th>
    <th>Получатель</th>
    <th>Телефон</th>
    <th>Адрес</th>
    <th>Статус</th>
    <th>Пользователь</th>
    <th>Email</th>
    <th>Роль</th>
    </tr>`;
  data.forEach(r => {
    table += `<tr>
      <td>${r.id}</td>
      <td>${r.from_location}</td>
      <td>${r.to_location}</td>
      <td>${r.size_category}</td>
      <td>${r.section_type}</td>
      <td>${r.created_at}</td>
      <td>${r.length_cm}×${r.width_cm}×${r.height_cm}</td>
      <td>${r.weight_kg}</td>
      <td>${r.volume_m3}</td>
      <td>${r.value}</td>
      <td>${r.cost}</td>
      <td>${r.description || ''}</td>
      <td>${r.quantity}</td>
      <td>${r.recipient_name}</td>
      <td>${r.recipient_phone}</td>
      <td>${r.address}</td>
      <td>${r.status}</td>
      <td>${r.user_name}</td>
      <td>${r.user_email}</td>
      <td>${r.user_role}</td>
    </tr>`;
  });
  table += '</table>';
  document.getElementById('report-table').innerHTML = table;
}

function openLogin() {
  window.location.href = "login.html";
}



