// orders.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '3926b07f-7ce7-4d7b-a716-3f472e11282f';
    const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
    
    const ordersList = document.getElementById('orders-list');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    
    let orders = [];
    let dishes = [];

    // Инициализация
    async function init() {
        await loadDishes();
        await loadOrders();
        renderOrders();
        setupEventListeners();
    }

    // Загрузка заказов
    async function loadOrders() {
        try {
            const response = await fetch(`${API_BASE}/orders?api_key=${apiKey}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки заказов');
            }
            orders = await response.json();
            // Сортируем по убыванию даты (новые сначала)
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            showError('Не удалось загрузить историю заказов');
        }
    }

    // Загрузка блюд для отображения названий
    async function loadDishes() {
        if (window.dishes && window.dishes.length > 0) {
            dishes = window.dishes;
        } else {
            try {
                const response = await fetch(`${API_BASE}/dishes?api_key=${apiKey}`);
                if (!response.ok) {
                    throw new Error('Ошибка загрузки блюд');
                }
                dishes = await response.json();
            } catch (error) {
                console.error('Ошибка загрузки блюд:', error);
            }
        }
    }

    // Отображение заказов
    
// В функции renderOrders заменим кнопки на прозрачные с цветными иконками
function renderOrders() {
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="no-orders">У вас пока нет заказов</div>';
        return;
    }

    let tableHTML = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Дата оформления</th>
                    <th>Состав заказа</th>
                    <th>Стоимость</th>
                    <th>Время доставки</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach((order, index) => {
        const orderDate = formatDate(order.created_at);
        const composition = getOrderComposition(order);
        const totalPrice = calculateOrderTotal(order);
        const deliveryTime = getDeliveryTimeDisplay(order);

        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${orderDate}</td>
                <td>${composition}</td>
                <td>${totalPrice}Р</td>
                <td>${deliveryTime}</td>
                <td>
                    <button class="action-btn details-btn" data-order-id="${order.id}" title="Подробнее">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3498db">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                    </button>
                    <button class="action-btn edit-btn" data-order-id="${order.id}" title="Редактировать">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f39c12">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" data-order-id="${order.id}" title="Удалить">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    ordersList.innerHTML = tableHTML;
}

    // Получение состава заказа
    function getOrderComposition(order) {
        const items = [];
        
        if (order.soup_id) {
            const dish = dishes.find(d => d.id === order.soup_id);
            if (dish) items.push(dish.name);
        }
        if (order.main_course_id) {
            const dish = dishes.find(d => d.id === order.main_course_id);
            if (dish) items.push(dish.name);
        }
        if (order.salad_id) {
            const dish = dishes.find(d => d.id === order.salad_id);
            if (dish) items.push(dish.name);
        }
        if (order.drink_id) {
            const dish = dishes.find(d => d.id === order.drink_id);
            if (dish) items.push(dish.name);
        }
        if (order.dessert_id) {
            const dish = dishes.find(d => d.id === order.dessert_id);
            if (dish) items.push(dish.name);
        }
        
        return items.join(', ');
    }

    // Расчет стоимости заказа
    function calculateOrderTotal(order) {
        let total = 0;
        
        if (order.soup_id) {
            const dish = dishes.find(d => d.id === order.soup_id);
            if (dish) total += dish.price;
        }
        if (order.main_course_id) {
            const dish = dishes.find(d => d.id === order.main_course_id);
            if (dish) total += dish.price;
        }
        if (order.salad_id) {
            const dish = dishes.find(d => d.id === order.salad_id);
            if (dish) total += dish.price;
        }
        if (order.drink_id) {
            const dish = dishes.find(d => d.id === order.drink_id);
            if (dish) total += dish.price;
        }
        if (order.dessert_id) {
            const dish = dishes.find(d => d.id === order.dessert_id);
            if (dish) total += dish.price;
        }
        
        return total;
    }

    // Форматирование времени доставки
function getDeliveryTimeDisplay(order) {
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        // Убираем секунды из времени
        const timeParts = order.delivery_time.split(':');
        if (timeParts.length >= 2) {
            return `${timeParts[0]}:${timeParts[1]}`; // Возвращаем только часы и минуты
        }
        return order.delivery_time;
    } else {
        return 'Как можно скорее (с 7:00 до 23:00)';
    }
}

    // Форматирование даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Закрытие модального окна
        closeBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Обработчики для кнопок действий
        ordersList.addEventListener('click', function(e) {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;

            const orderId = btn.getAttribute('data-order-id');
            if (!orderId) return;

            if (btn.classList.contains('details-btn')) {
                showOrderDetails(orderId);
            } else if (btn.classList.contains('edit-btn')) {
                showEditForm(orderId);
            } else if (btn.classList.contains('delete-btn')) {
                showDeleteConfirmation(orderId);
            }
        });
    }

    // Показать детали заказа
    function showOrderDetails(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        const soup = order.soup_id ? dishes.find(d => d.id === order.soup_id) : null;
        const main = order.main_course_id ? dishes.find(d => d.id === order.main_course_id) : null;
        const salad = order.salad_id ? dishes.find(d => d.id === order.salad_id) : null;
        const drink = order.drink_id ? dishes.find(d => d.id === order.drink_id) : null;
        const dessert = order.dessert_id ? dishes.find(d => d.id === order.dessert_id) : null;

        modalBody.innerHTML = `
            <h3 class="modal-title">Просмотр заказа</h3>
            <div class="modal-section">
                <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
            </div>
            
            <div class="modal-section">
                <h4>Доставка</h4>
                <p><strong>Имя получателя:</strong> ${order.full_name}</p>
                <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                <p><strong>Время доставки:</strong> ${getDeliveryTimeDisplay(order)}</p>
                <p><strong>Телефон:</strong> ${order.phone}</p>
                <p><strong>Email:</strong> ${order.email}</p>
            </div>
            
            ${order.comment ? `
            <div class="modal-section">
                <h4>Комментарий</h4>
                <p>${order.comment}</p>
            </div>
            ` : ''}
            
            <div class="modal-section">
                <h4>Состав заказа</h4>
                ${soup ? `<p><strong>Основное блюдо:</strong> ${soup.name} (${soup.price}Р)</p>` : ''}
                ${main ? `<p><strong>Основное блюдо:</strong> ${main.name} (${main.price}Р)</p>` : ''}
                ${salad ? `<p><strong>Салат:</strong> ${salad.name} (${salad.price}Р)</p>` : ''}
                ${drink ? `<p><strong>Напиток:</strong> ${drink.name} (${drink.price}Р)</p>` : ''}
                ${dessert ? `<p><strong>Десерт:</strong> ${dessert.name} (${dessert.price}Р)</p>` : ''}
            </div>
            
            <div class="modal-section">
                <h4>Стоимость: ${calculateOrderTotal(order)}Р</h4>
            </div>
            
            <div class="modal-actions">
                <button class="modal-btn confirm-btn" onclick="closeModal()">Ок</button>
            </div>
        `;

        showModal();
    }

    // Показать форму редактирования
    function showEditForm(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        const soup = order.soup_id ? dishes.find(d => d.id === order.soup_id) : null;
        const main = order.main_course_id ? dishes.find(d => d.id === order.main_course_id) : null;
        const salad = order.salad_id ? dishes.find(d => d.id === order.salad_id) : null;
        const drink = order.drink_id ? dishes.find(d => d.id === order.drink_id) : null;
        const dessert = order.dessert_id ? dishes.find(d => d.id === order.dessert_id) : null;

        modalBody.innerHTML = `
            <h3 class="modal-title">Редактирование заказа</h3>
            <form class="edit-form" id="edit-order-form">
                <input type="hidden" id="edit-order-id" value="${order.id}">
                
                <div class="modal-section">
                    <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
                </div>
                
                <div class="form-group">
                    <label for="edit-full-name">Имя получателя</label>
                    <input type="text" id="edit-full-name" value="${order.full_name}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" value="${order.email}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-phone">Телефон</label>
                    <input type="tel" id="edit-phone" value="${order.phone}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-address">Адрес доставки</label>
                    <input type="text" id="edit-address" value="${order.delivery_address}" required>
                </div>
                
                <div class="form-group">
                    <label>Время доставки:</label>
                    <div class="radio-group">
                        <input type="radio" id="edit-delivery-now" name="delivery_type" value="now" ${order.delivery_type === 'now' ? 'checked' : ''}>
                        <label for="edit-delivery-now">Как можно скорее</label>
                    </div>
                    <div class="radio-group">
                        <input type="radio" id="edit-delivery-by-time" name="delivery_type" value="by_time" ${order.delivery_type === 'by_time' ? 'checked' : ''}>
                        <label for="edit-delivery-by-time">Ко времени</label>
                    </div>
                </div>
                
                <div class="form-group" id="edit-delivery-time-group" style="${order.delivery_type === 'by_time' ? '' : 'display: none;'}">
                    <label for="edit-delivery-time">Укажите время доставки</label>
                    <input type="time" id="edit-delivery-time" value="${order.delivery_time || ''}" min="07:00" max="23:00" step="300">
                </div>
                
                <div class="form-group">
                    <label for="edit-comment">Комментарий</label>
                    <textarea id="edit-comment">${order.comment || ''}</textarea>
                </div>

                <div class="modal-section">
                    <h4>Состав заказа</h4>
                    <div class="order-composition">
                        ${soup ? `<div class="order-item"><span class="item-category">Основное блюдо</span><span class="item-name">${soup.name} (${soup.price}Р)</span></div>` : ''}
                        ${main ? `<div class="order-item"><span class="item-category">Основное блюдо</span><span class="item-name">${main.name} (${main.price}Р)</span></div>` : ''}
                        ${salad ? `<div class="order-item"><span class="item-category">Салат</span><span class="item-name">${salad.name} (${salad.price}Р)</span></div>` : ''}
                        ${drink ? `<div class="order-item"><span class="item-category">Напиток</span><span class="item-name">${drink.name} (${drink.price}Р)</span></div>` : ''}
                        ${dessert ? `<div class="order-item"><span class="item-category">Десерт</span><span class="item-name">${dessert.name} (${dessert.price}Р)</span></div>` : ''}
                    </div>
                    <div class="order-total">
                        <strong>Стоимость: ${calculateOrderTotal(order)}Р</strong>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="modal-btn cancel-btn" onclick="closeModal()">Отмена</button>
                    <button type="submit" class="modal-btn confirm-btn">Сохранить</button>
                </div>
            </form>
        `;

        // Обработчики для радиокнопок
        document.getElementById('edit-delivery-now').addEventListener('change', function() {
            document.getElementById('edit-delivery-time-group').style.display = 'none';
        });
        
        document.getElementById('edit-delivery-by-time').addEventListener('change', function() {
            document.getElementById('edit-delivery-time-group').style.display = 'block';
        });

        // Обработчик формы
        document.getElementById('edit-order-form').addEventListener('submit', function(e) {
            e.preventDefault();
            updateOrder(orderId);
        });

        showModal();
    }

    // Показать подтверждение удаления
    function showDeleteConfirmation(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        modalBody.innerHTML = `
            <div class="delete-confirmation">
                <h3 class="modal-title">Удаление заказа</h3>
                <p>Вы уверены, что хотите удалить заказ?</p>
                <div class="modal-actions">
                    <button class="modal-btn cancel-btn" onclick="closeModal()">Отмена</button>
                    <button class="modal-btn confirm-btn" onclick="deleteOrder(${orderId})">Да</button>
                </div>
            </div>
        `;

        showModal();
    }

    // Обновление заказа
    async function updateOrder(orderId) {
        const formData = {
            full_name: document.getElementById('edit-full-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            delivery_address: document.getElementById('edit-address').value,
            delivery_type: document.querySelector('input[name="delivery_type"]:checked').value,
            comment: document.getElementById('edit-comment').value
        };

        if (formData.delivery_type === 'by_time') {
            formData.delivery_time = document.getElementById('edit-delivery-time').value;
        }

        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}?api_key=${apiKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при обновлении заказа');
            }

            const updatedOrder = await response.json();
            
            // Обновляем локальный массив
            const index = orders.findIndex(o => o.id == orderId);
            if (index !== -1) {
                orders[index] = updatedOrder;
            }

            closeModal();
            renderOrders();
            showNotification('Заказ успешно изменён', 'success');
        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
            showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Удаление заказа
    async function deleteOrder(orderId) {
        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}?api_key=${apiKey}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при удалении заказа');
            }

            // Удаляем из локального массива
            orders = orders.filter(o => o.id != orderId);

            closeModal();
            renderOrders();
            showNotification('Заказ успешно удалён', 'success');
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Показать модальное окно
    function showModal() {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Закрыть модальное окно
    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Показать уведомление
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-overlay`;
        notification.innerHTML = `
            <div class="notification">
                <div class="notification-image">
                    <span style="font-size: 3rem;">${type === 'error' ? '❌' : '✅'}</span>
                </div>
                <p>${message}</p>
                <button class="notification-ok-btn">Ок</button>
            </div>
        `;

        document.body.appendChild(notification);

        const okButton = notification.querySelector('.notification-ok-btn');
        okButton.addEventListener('click', function() {
            document.body.removeChild(notification);
        });

        notification.addEventListener('click', function(e) {
            if (e.target === notification) {
                document.body.removeChild(notification);
            }
        });

        // Закрытие по Escape
        function escapeHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(notification);
                document.removeEventListener('keydown', escapeHandler);
            }
        }
        document.addEventListener('keydown', escapeHandler);
    }

    // Показать ошибку
    function showError(message) {
        showNotification(message, 'error');
    }

    // Сделаем функции глобальными для обработчиков onclick
    window.closeModal = closeModal;
    window.deleteOrder = deleteOrder;

    // Инициализация
    init();
});