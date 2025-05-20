document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  const user = getCurrentUser();
  const token = localStorage.getItem('token');
  if (!token) {

    window.location.href = 'login.html';
    return;
  }

  const listEl   = document.getElementById('orders-list');
  const tabs     = document.querySelectorAll('.order-tab');
  const tmpl     = document.getElementById('order-card-template');

  let allOrders = [];


  async function fetchOrders() {
    try {
      const url = user.role === 'admin'
        ? `/api/orders`
        : `/api/orders/mine`;
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Ошибка ' + res.status);
      allOrders = await res.json();
      render(currentStatus());
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<p>Не удалось загрузить заказы.</p>';
    }
  }

  function currentStatus() {
    return document.querySelector('.order-tab.active').dataset.status;
  }


  function render(status) {
    listEl.innerHTML = '';
    const filtered = allOrders.filter(o => o.status === status);
    if (filtered.length === 0) {
      listEl.innerHTML = '<p>Нет заказов</p>';
      return;
    }
    filtered.forEach(o => {
      const clone = tmpl.content.cloneNode(true);
      const card  = clone.querySelector('.order-card');
      const id    = o._id || o.id; 

      card.dataset.id = id;
      clone.querySelector('.order-id').textContent    = '№' + id;
      clone.querySelector('.order-from').textContent = o.from;
      clone.querySelector('.order-to').textContent   = o.to;
      clone.querySelector('.order-type').textContent = o.size === 'negabarit'
        ? `Негабарит, ${parseFloat(o.volume).toFixed(2)} м³`
        : `Габарит, ${o.section==='cold'?'холодный':'тёплый'}`;
      clone.querySelector('.order-weight').textContent = o.weight;
      clone.querySelector('.order-lwh').textContent   = `${o.length}×${o.width}×${o.height}`;
      clone.querySelector('.order-cost').textContent = parseFloat(o.cost).toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).replace(',', '.');

      clone.querySelector('.order-desc').textContent    = o.description;
      clone.querySelector('.order-qty').textContent     = o.quantity;
      clone.querySelector('.order-name').textContent    = o.recipientName;
      clone.querySelector('.order-phone').textContent   = o.recipientPhone;
      clone.querySelector('.order-address').textContent = o.address;


      if (user.role !== 'admin') {
        clone.querySelector('.status-btn').style.display = 'none';
      }

      listEl.appendChild(clone);
    });
    bindActions();
  }


  function bindActions() {

    listEl.querySelectorAll('.details-btn').forEach(btn => {
      btn.onclick = () => {
        btn.closest('.order-card').classList.toggle('active');
      };
    });


    listEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Удалить этот заказ?')) return;
        const id = btn.closest('.order-card').dataset.id;
        try {
          const res = await fetch(`/api/orders/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (!res.ok) throw new Error('Ошибка ' + res.status);
          await fetchOrders();
        } catch (err) {
          console.error(err);
          alert('Не удалось удалить заказ.');
        }
      };
    });


    listEl.querySelectorAll('.status-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.closest('.order-card').dataset.id;
        const newStatus = prompt(
          'Новый статус (created, in_transit, delivered, archived):',
          currentStatus()
        );
        if (!newStatus || !['created','in_transit','delivered','archived'].includes(newStatus)) {
          return alert('Неправильный статус.');
        }
        try {
          const res = await fetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) throw new Error('Ошибка ' + res.status);
          await fetchOrders();
        } catch (err) {
          console.error(err);
          alert('Не удалось обновить статус.');
        }
      };
    });
  }


  tabs.forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.status);
    };
  });


  fetchOrders();
});
