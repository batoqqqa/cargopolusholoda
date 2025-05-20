document.addEventListener('DOMContentLoaded', () => {
  
  const route = ["Якутск","Токума","Борулах","Батагай","Верхоянск","Боронук","Арылах"];
  const fromSelect = document.getElementById('fromSelect');
  const toSelect   = document.getElementById('toSelect');

  fromSelect.addEventListener('change', updateDestinations);
  function updateDestinations() {
    const from = fromSelect.value;
    toSelect.innerHTML = '<option value="">Куда</option>';
    if (!from) return;
    if (from === 'Якутск') {
      route.slice(1).forEach(city => appendOption(city));
    } else {
      appendOption('Якутск');
    }
  }
  function appendOption(city) {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    toSelect.appendChild(opt);
  }

  let selectedSize = null;
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size; 
    });
  });

  let selectedSection = null;
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSection = btn.dataset.section; 
    });
  });

  const firstSize = document.querySelector('.size-btn');
  if (firstSize) firstSize.click();
  const firstSection = document.querySelector('.section-btn');
  if (firstSection) firstSection.click();

  const calculateBtn = document.getElementById('calculate-btn');
  const costOutput   = document.getElementById('calculated-cost');

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

    if (selectedSize === 'negabarit' && (len <= 0 || wid <= 0 || hei <= 0)) {
      costOutput.textContent = 'Ошибка';
      return;
    }
    if (selectedSize === 'gabarit' && weight <= 0) {
      costOutput.textContent = 'Ошибка';
      return;
    }

    let cost;
    if (selectedSize === 'negabarit') {
      const volume = (len/100) * (wid/100) * (hei/100);
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

  const orderForm = document.getElementById('order-form');
  orderForm.addEventListener('submit', async e => {
    e.preventDefault();

    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Пожалуйста, войдите в систему!');
      window.location.href = 'login.html';
      return;
    }

    const cost = parseFloat(costOutput.textContent.replace(/\s/g, '').replace(',', '.'));


    if (isNaN(cost)) {
      alert('Сначала рассчитайте стоимость!');
      return;
    }

    const len    = parseFloat(document.getElementById('length').value) || 0;
    const wid    = parseFloat(document.getElementById('width').value)  || 0;
    const hei    = parseFloat(document.getElementById('height').value) || 0;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const volume = selectedSize === 'negabarit'
      ? (len/100) * (wid/100) * (hei/100)
      : 0;
    const rate = cost / (selectedSize === 'negabarit' ? (volume || 1) : (weight || 1));

    const body = {
      from:            fromSelect.value,
      to:              toSelect.value,
      size:            selectedSize,
      section:         selectedSection,
      length:          len,
      width:           wid,
      height:          hei,
      weight:          weight,
      volume:          volume,
      rate:            rate,
      cost:            cost,
      description:     document.getElementById('description').value.trim(),
      quantity:        parseInt(document.getElementById('quantity').value, 10),
      recipientName:   document.getElementById('recipient-name').value.trim(),
      recipientPhone:  document.getElementById('recipient-phone').value.trim(),
      address:         document.getElementById('address').value.trim(),
    };

    

    try {
      const res = await fetch(`/api/orders`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || res.statusText);
      }

      const order = await res.json();
      alert(`Заказ №${order.id} создан успешно!`);

      orderForm.reset();
      costOutput.textContent = '—';

      if (typeof render === 'function') render('created');

      document.querySelector('.order-tab[data-status="created"]').click();
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании заказа: ' + err.message);
    }
  });
});
