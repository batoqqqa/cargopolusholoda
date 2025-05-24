const accessToken = localStorage.getItem('accessToken');

    function requireAdmin() {
      const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (!user || user.role !== 'admin') {
        alert('Доступ запрещён');
        window.location.href = 'login.html';
      }
    }
    window.requireAdmin = requireAdmin;

    document.addEventListener('DOMContentLoaded', () => {
        requireAdmin();

        const usersTbody    = document.getElementById('users-list');
        const userFilter    = document.getElementById('user-filter');
        const orderFilter   = document.getElementById('order-filter');
        const ordersTbody  = document.getElementById('orders-list-admin');

        const modal    = document.getElementById('edit-user-modal');
        const form     = document.getElementById('edit-user-form');
        const cancelBtn   = document.getElementById('edit-user-cancel');
        const idInput     = document.getElementById('edit-user-id');
        const nameInput   = document.getElementById('edit-user-name');
        const emailInput  = document.getElementById('edit-user-email');
        const roleSelect  = document.getElementById('edit-user-role');



        const orderModal       = document.getElementById('edit-order-modal');
        const orderForm        = document.getElementById('edit-order-form');
        const orderIdInput     = document.getElementById('edit-order-id');
        const fromInput        = document.getElementById('edit-order-from');
        const toInput          = document.getElementById('edit-order-to');
        const sizeInputs       = document.getElementsByName('size');
        const sectionInputs    = document.getElementsByName('section');
        const lengthInput      = document.getElementById('edit-order-length');
        const widthInput       = document.getElementById('edit-order-width');
        const heightInput      = document.getElementById('edit-order-height');
        const weightInput      = document.getElementById('edit-order-weight');
        const costInput        = document.getElementById('edit-order-cost');

        const statusSelect     = document.getElementById('edit-order-status');
        const descriptionInput = document.getElementById('edit-order-description');
        const quantityInput    = document.getElementById('edit-order-quantity');
        const recipientInput   = document.getElementById('edit-order-recipient-name');
        const phoneInput       = document.getElementById('edit-order-recipient-phone');
        const addressInput     = document.getElementById('edit-order-address');
        const cancelOrderBtn   = document.getElementById('edit-order-cancel');

        let ordersData = [];
        let usersData = [];

        ordersTbody.addEventListener('click', async e => {
            const btn = e.target.closest('.details-btn') 
                    || e.target.closest('.edit-order-btn');

            if (!btn || !btn.dataset.id) return;

            const orderId = btn.dataset.id;

            const resp = await fetch(`/api/orders/${orderId}`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
            });
            const order = await resp.json();

            orderIdInput.value     = order.id;
            fromInput.value        = order.from;
            toInput.value          = order.to;
            sizeInputs.forEach(i => i.checked = (i.value === order.size));
            sectionInputs.forEach(i => i.checked = (i.value === order.section));
            lengthInput.value      = order.length;
            widthInput.value       = order.width;
            heightInput.value      = order.height;
            weightInput.value      = order.weight;
            costInput.value        = order.cost;

            statusSelect.value     = order.status;
            descriptionInput.value = order.description;
            quantityInput.value    = order.quantity;
            recipientInput.value   = order.recipientName;
            phoneInput.value       = order.recipientPhone;
            addressInput.value     = order.address;

            orderModal.classList.remove('hidden');
        });

        cancelOrderBtn.addEventListener('click', () => {
            orderModal.classList.add('hidden');
        });

        orderForm.addEventListener('submit', async e => {
            e.preventDefault();
            const id = orderIdInput.value;

            const body = {
            from_:      fromInput.value,
            to_:        toInput.value,
            size:       [...sizeInputs].find(i=>i.checked).value,
            section:    [...sectionInputs].find(i=>i.checked).value,
            length:     Number(lengthInput.value) || 0,
            width:      Number(widthInput.value)  || 0,
            height:     Number(heightInput.value) || 0,
            weight:     Number(weightInput.value) || 0,
            cost:       Number(costInput.value),
            status:     statusSelect.value,
            description: descriptionInput.value.trim(),
            quantity:    Number(quantityInput.value) || 0,
            recipientName:  recipientInput.value.trim(),
            recipientPhone: phoneInput.value.trim(),
            address:        addressInput.value.trim()
            };

            const res = await fetch(`/api/orders/${id}`, {
            method:  'PUT',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
            alert('Не удалось сохранить: ' + data.message);
            return;
            }
            alert('Заказ обновлён');
            orderModal.classList.add('hidden');
            loadAdminOrders();
        });

        userFilter.addEventListener('input', () => {
            const q = userFilter.value.trim().toLowerCase();
            const filtered = usersData.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
            );
            renderUsers(filtered);
        });

        orderFilter.addEventListener('input', e => {
            const q = e.target.value.trim().toLowerCase();
            const filtered = ordersData.filter(o =>
            String(o.id).includes(q) ||
            o.userName.toLowerCase().includes(q) ||
            (`${o.from} ${o.to}`).toLowerCase().includes(q)
            );
            renderOrders(filtered);
        });


        function renderUsers(list) {
        usersTbody.innerHTML = list.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <button class="edit-user-btn" data-id="${u.id}">Редактировать</button>
          <button class="admin-btn delete-user" data-id="${u.id}">Удалить</button>
        </td>
      </tr>
        `).join('');

        usersTbody.addEventListener('click', async e => {
            const btn = e.target.closest('.edit-user-btn');
            if (!btn) return;                    
            const userId = btn.dataset.id;
            console.log('Редактировать пользователя', userId);

            const resp = await fetch(`/api/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
            });
            const  user  = await resp.json();
            idInput.value    = user.id;
            nameInput.value  = user.name;
            emailInput.value = user.email;
            roleSelect.value  = user.role;

            modal.classList.remove('hidden');
        });   

        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });


        form.addEventListener('submit', async e => {
            e.preventDefault();
            const id   = idInput.value;
            const body = {
            name:  nameInput.value.trim(),
            email: emailInput.value.trim(),
            role:  roleSelect.value
            };
            const res = await fetch(`/api/users/${id}`, {
            method:  'PUT',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) return alert('Ошибка: ' + data.message);
            alert('Пользователь обновлён');
            modal.classList.add('hidden');
            loadUsers(); 
        });

        usersTbody.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Удалить пользователя?')) return;
            const id = btn.dataset.id;
            await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + accessToken }
            });
            loadUsers();
        });
        });
       } 

        function renderOrders(list) {
            ordersTbody.innerHTML = '';
            list.forEach(o => {
            ordersTbody.insertAdjacentHTML('beforeend', `
                <tr class="order-row" data-id="${o.id}">
                <td>${o.id}</td>
                <td>${o.userName}</td>
                <td>${o.from}</td>
                <td>${o.to}</td>
                <td>${o.size==='negabarit'?'Негабарит':'Габарит'}, ${o.section==='cold'?'холодный':'тёплый'}</td>
                <td>${parseFloat(o.cost).toFixed(2)}</td>
                <td>${new Date(o.date).toLocaleString()}</td>
                <td>
                    <select class="status-select" data-id="${o.id}">
                    <option value="created"    ${o.status==='created'   ?'selected':''}>Создано</option>
                    <option value="in_transit" ${o.status==='in_transit'?'selected':''}>В пути</option>
                    <option value="delivered"  ${o.status==='delivered' ?'selected':''}>Полученные</option>
                    <option value="archived"   ${o.status==='archived'  ?'selected':''}>Архив</option>
                    </select>
                </td>
                <td>
                    <button class="edit-order-btn admin-btn" data-id="${o.id}">Редактировать</button>
                    <button class="admin-btn details-btn">Подробнее</button>
                    <button class="admin-btn delete-order" data-id="${o.id}">Удалить</button>
                </td>
                </tr>
                <tr class="details-row" data-id="${o.id}" style="display:none;">
                <td colspan="9">
                    <strong>Описание:</strong> ${o.description}<br>
                    <strong>Кол-во:</strong> ${o.quantity}<br>
                    <strong>Получатель:</strong> ${o.recipientName}, ${o.recipientPhone}<br>
                    <strong>Адрес:</strong> ${o.address}
                </td>
                </tr>
            `);
         });

        ordersTbody.querySelectorAll('.details-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.closest('.order-row').dataset.id;
            const row = ordersTbody.querySelector(`.details-row[data-id="${id}"]`);
            row.style.display = row.style.display==='none'?'table-row':'none';
          });
        });

        ordersTbody.querySelectorAll('.status-select').forEach(sel => {
          sel.addEventListener('change', async () => {
            await fetch(`/api/orders/${sel.dataset.id}/status`, {
              method:'PATCH',
              headers:{'Content-Type':'application/json','Authorization':'Bearer '+ accessToken},
              body: JSON.stringify({status: sel.value})
            });
          });
        });

        ordersTbody.querySelectorAll('.delete-order').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Удалить заказ?')) return;
            await fetch(`/api/orders/${btn.dataset.id}`, {method:'DELETE',headers:{'Authorization':'Bearer '+ accessToken}});
            loadAdminOrders();
          });
        });
      }


      async function loadAdminOrders() {
        try {
          const res = await fetch('/api/orders', { headers:{'Authorization':'Bearer '+ accessToken} });
          ordersData = await res.json();
          renderOrders(ordersData);
        } catch (err) {
          console.error(err);
          ordersTbody.innerHTML = '<tr><td colspan="9">Не удалось загрузить заказы.</td></tr>';
        }
      }

      async function loadUsers() {
        try {
            const res = await fetch('/api/users', { headers: { 'Authorization': 'Bearer ' + accessToken } });
            if (!res.ok) throw new Error('Ошибка ' + res.status);
            usersData = await res.json();
            renderUsers(usersData);
            } catch (err) {
            console.error(err);
        }
    }

        document.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.tab-link').forEach(a=>a.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(s=>s.style.display='none');
            link.classList.add('active');
            const target = link.getAttribute('href');
            document.querySelector(target).style.display='block';
            if(target==='#tab-users') loadUsers(); else loadAdminOrders();
            });
        });
      document.querySelector('.tab-link.active').click();
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


  function logout() {
    localStorage.removeItem('accessToken'); 
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('currentUser');
    window.location.href='login.html';
  }
