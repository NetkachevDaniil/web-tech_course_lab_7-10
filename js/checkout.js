// checkout.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '3926b07f-7ce7-4d7b-a716-3f472e11282f';
    const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';

    // Загрузка заказа из localStorage
    function loadOrderFromStorage() {
        const savedOrder = localStorage.getItem('foodOrder');
        if (savedOrder) {
            return JSON.parse(savedOrder);
        }
        return {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }

    // Восстановление полных объектов блюд из ключей
    function restoreDishesFromKeys(orderKeys) {
        if (!window.dishes || window.dishes.length === 0) {
            console.warn('Блюда еще не загружены, не могу восстановить заказ');
            return orderKeys;
        }

        const restoredOrder = {};
        Object.keys(orderKeys).forEach(category => {
            if (orderKeys[category]) {
                const dish = window.dishes.find(d => d.keyword === orderKeys[category]);
                restoredOrder[category] = dish || null;
            } else {
                restoredOrder[category] = null;
            }
        });
        return restoredOrder;
    }

    // Инициализация заказа
    const savedOrderKeys = loadOrderFromStorage();
    let currentOrder = {};

    // Ожидание загрузки блюд
    function waitForDishes() {
        return new Promise((resolve) => {
            if (window.dishes && window.dishes.length > 0) {
                currentOrder = restoreDishesFromKeys(savedOrderKeys);
                resolve();
            } else {
                const checkDishes = setInterval(() => {
                    if (window.dishes && window.dishes.length > 0) {
                        clearInterval(checkDishes);
                        currentOrder = restoreDishesFromKeys(savedOrderKeys);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    // Отображение состава заказа в виде карточек
    function renderOrderComposition() {
        const container = document.getElementById('order-composition-list');
        if (!container) return;

        // Проверяем, есть ли выбранные блюда
        const hasItems = Object.values(currentOrder).some(item => item !== null);
        
        if (!hasItems) {
            container.innerHTML = `
                <div class="order-empty">
                    <p>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу 
                    <a href="menu.html">Собрать ланч</a>.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ''; // Очищаем контейнер

        Object.entries(currentOrder).forEach(([category, dish]) => {
            if (dish) {
                const dishElement = createDishCard(dish, category);
                container.appendChild(dishElement);
            }
        });
    }

    // Создание карточки блюда для состава заказа (ИДЕНТИЧНО карточкам в меню)
    function createDishCard(dish, category) {
        const dishItem = document.createElement('div');
        dishItem.className = 'dish-item'; // Тот же класс что и в меню!
        dishItem.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" class="dish-image">
            <p class="dish-price">${dish.price}Р</p>
            <p class="dish-name">${dish.name}</p>
            <p class="dish-weight">${dish.count}</p>
            <button class="remove-btn" data-category="${category}">Удалить</button>
        `;
        
        return dishItem;
    }

    // Удаление блюда из заказа
    function removeDishFromOrder(category) {
        currentOrder[category] = null;
        // Сохраняем только ключи в localStorage
        const orderToSave = {};
        Object.keys(currentOrder).forEach(cat => {
            orderToSave[cat] = currentOrder[cat] ? currentOrder[cat].keyword : null;
        });
        localStorage.setItem('foodOrder', JSON.stringify(orderToSave));
        renderOrderComposition();
        updateOrderDisplay();
    }

    // Обновление отображения заказа в форме
    function updateOrderDisplay() {
        const orderContainer = document.getElementById('order-summary');
        const totalElement = document.getElementById('order-total');
        
        if (!orderContainer || !totalElement) return;

        const selectedArray = Object.values(currentOrder).filter(dish => dish !== null);
        
        if (selectedArray.length === 0) {
            orderContainer.innerHTML = `
                <div class="order-empty">
                    <h3>Ничего не выбрано</h3>
                </div>
            `;
            totalElement.style.display = 'none';
        } else {
            let orderHTML = '<h3>Ваш заказ</h3>';
            let totalPrice = 0;
            
            // Суп
            orderHTML += `<div class="order-category">
                <strong>Суп</strong><br>`;
            if (currentOrder.soup) {
                orderHTML += `${currentOrder.soup.name} ${currentOrder.soup.price}Р`;
                totalPrice += currentOrder.soup.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            // Главное блюдо
            orderHTML += `<div class="order-category">
                <strong>Главное блюдо</strong><br>`;
            if (currentOrder.main) {
                orderHTML += `${currentOrder.main.name} ${currentOrder.main.price}Р`;
                totalPrice += currentOrder.main.price;
            } else {
                orderHTML += 'Не выбрано';
            }
            orderHTML += `</div>`;
            
            // Салат/стартер
            orderHTML += `<div class="order-category">
                <strong>Салат/стартер</strong><br>`;
            if (currentOrder.salad) {
                orderHTML += `${currentOrder.salad.name} ${currentOrder.salad.price}Р`;
                totalPrice += currentOrder.salad.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            // Напиток
            orderHTML += `<div class="order-category">
                <strong>Напиток</strong><br>`;
            if (currentOrder.drink) {
                orderHTML += `${currentOrder.drink.name} ${currentOrder.drink.price}Р`;
                totalPrice += currentOrder.drink.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            // Десерт
            orderHTML += `<div class="order-category">
                <strong>Десерт</strong><br>`;
            if (currentOrder.dessert) {
                orderHTML += `${currentOrder.dessert.name} ${currentOrder.dessert.price}Р`;
                totalPrice += currentOrder.dessert.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            orderContainer.innerHTML = orderHTML;
            totalElement.innerHTML = `<strong>Стоимость заказа</strong><br>${totalPrice}Р`;
            totalElement.style.display = 'block';
            
            updateFormFields();
        }
    }

    // Обновление скрытых полей формы
    function updateFormFields() {
        const soupSelect = document.getElementById('soup-select');
        const mainSelect = document.getElementById('main-course-select');
        const saladSelect = document.getElementById('salad-select');
        const drinkSelect = document.getElementById('drink-select');
        const dessertSelect = document.getElementById('dessert-select');
        
        if (soupSelect) soupSelect.value = currentOrder.soup ? currentOrder.soup.keyword : '';
        if (mainSelect) mainSelect.value = currentOrder.main ? currentOrder.main.keyword : '';
        if (saladSelect) saladSelect.value = currentOrder.salad ? currentOrder.salad.keyword : '';
        if (drinkSelect) drinkSelect.value = currentOrder.drink ? currentOrder.drink.keyword : '';
        if (dessertSelect) dessertSelect.value = currentOrder.dessert ? currentOrder.dessert.keyword : '';
    }

    // Отправка заказа на сервер
    async function submitOrder(event) {
        event.preventDefault();
        
        // Проверка комбо
        if (!isValidCombo()) {
            const notificationData = getNotificationType();
            showNotification(notificationData);
            return;
        }

        const formData = new FormData(event.target);
        const orderData = {
            full_name: formData.get('name'),
            email: formData.get('email'),
            subscribe: formData.get('newsletter') ? 1 : 0,
            phone: formData.get('phone'),
            delivery_address: formData.get('address'),
            delivery_type: formData.get('delivery_time') === 'asap' ? 'now' : 'by_time',
            comment: formData.get('comments')
        };

        // Добавляем время доставки если нужно
        if (orderData.delivery_type === 'by_time') {
            orderData.delivery_time = formData.get('delivery_time_value');
        }

        // Добавляем ID блюд
        if (currentOrder.soup) {
            orderData.soup_id = currentOrder.soup.id;
        }
        if (currentOrder.main) {
            orderData.main_course_id = currentOrder.main.id;
        }
        if (currentOrder.salad) {
            orderData.salad_id = currentOrder.salad.id;
        }
        if (currentOrder.drink) {
            orderData.drink_id = currentOrder.drink.id;
        }
        if (currentOrder.dessert) {
            orderData.dessert_id = currentOrder.dessert.id;
        }

        try {
            const response = await fetch(`${API_BASE}/orders?api_key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при оформлении заказа');
            }

            const result = await response.json();
            
            // Успешное оформление - очищаем localStorage
            localStorage.removeItem('foodOrder');
            
            // Показываем уведомление об успехе в стиле комбо-уведомлений
            showSuccessNotification();
            
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
            showErrorNotification(`Ошибка при оформлении заказа: ${error.message}`);
        }
    }

    // Показ уведомления об успешном оформлении заказа
    function showSuccessNotification() {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification">
                <div class="notification-image">
                    <span style="font-size: 3rem;">✅</span>
                </div>
                <p>Заказ успешно оформлен! Ожидайте доставку.</p>
                <button class="notification-ok-btn">Отлично!</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const okButton = overlay.querySelector('.notification-ok-btn');
        okButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
            // Перенаправляем на главную страницу после закрытия уведомления
            window.location.href = 'index.html';
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                window.location.href = 'index.html';
            }
        });

        // Закрытие по Escape
        function escapeHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                window.location.href = 'index.html';
                document.removeEventListener('keydown', escapeHandler);
            }
        }
        document.addEventListener('keydown', escapeHandler);
    }

    // Показ уведомления об ошибке
    function showErrorNotification(message) {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification">
                <div class="notification-image">
                    <span style="font-size: 3rem;">❌</span>
                </div>
                <p>${message}</p>
                <button class="notification-ok-btn">Понятно</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const okButton = overlay.querySelector('.notification-ok-btn');
        okButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        // Закрытие по Escape
        function escapeHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        }
        document.addEventListener('keydown', escapeHandler);
    }

    // Проверка валидности комбо
    function isValidCombo() {
        const hasSoup = !!currentOrder.soup;
        const hasMain = !!currentOrder.main;
        const hasSalad = !!currentOrder.salad;
        const hasDrink = !!currentOrder.drink;

        const availableCombos = [
            { soup: true, main: true, salad: true, drink: true },
            { soup: true, main: true, salad: false, drink: true },
            { soup: true, main: false, salad: true, drink: true },
            { soup: false, main: true, salad: true, drink: true },
            { soup: false, main: true, salad: false, drink: true }
        ];

        return availableCombos.some(combo =>
            combo.soup === hasSoup &&
            combo.main === hasMain &&
            combo.salad === hasSalad &&
            combo.drink === hasDrink
        );
    }

    // Определение типа уведомления (для ошибок комбо)
    function getNotificationType() {
        const hasSoup = !!currentOrder.soup;
        const hasMain = !!currentOrder.main;
        const hasSalad = !!currentOrder.salad;
        const hasDrink = !!currentOrder.drink;
        const hasDessert = !!currentOrder.dessert;

        const hasAnyDish = hasSoup || hasMain || hasSalad || hasDrink || hasDessert;

        if (!hasAnyDish) {
            return { type: 'nothing-selected', message: 'Ничего не выбрано. Выберите блюда для заказа', emoji: '🚫' };
        }

        if (!hasDrink) {
            return { type: 'select-drink', message: 'Выберите напиток', emoji: '🥤' };
        }

        if (hasSoup && !hasMain && !hasSalad) {
            return { type: 'select-main-or-salad', message: 'Выберите главное блюдо/салат/стартер', emoji: '🍽️' };
        }

        if (hasSalad && !hasSoup && !hasMain) {
            return { type: 'select-soup-or-main', message: 'Выберите суп или главное блюдо', emoji: '🍲' };
        }

        if ((hasDrink || hasDessert) && !hasMain && !hasSoup && !hasSalad) {
            return { type: 'select-main', message: 'Выберите главное блюдо', emoji: '🍛' };
        }

        return { type: 'invalid-combo', message: 'Выбранные блюда не соответствуют доступным комбо', emoji: '❌' };
    }

    // Показ уведомления (для ошибок комбо)
    function showNotification(notificationData) {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification">
                <div class="notification-image">
                    <span style="font-size: 3rem;">${notificationData.emoji}</span>
                </div>
                <p>${notificationData.message}</p>
                <button class="notification-ok-btn">Окей</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const okButton = overlay.querySelector('.notification-ok-btn');
        okButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        // Закрытие по Escape
        function escapeHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        }
        document.addEventListener('keydown', escapeHandler);
    }

    // Инициализация
    waitForDishes().then(() => {
        renderOrderComposition();
        updateOrderDisplay();
        
        // Добавляем обработчики для кнопок удаления после рендеринга
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-btn')) {
                const category = e.target.getAttribute('data-category');
                removeDishFromOrder(category);
            }
        });
    });

    // Обработчики событий
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }

    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            currentOrder = {
                soup: null,
                main: null,
                salad: null,
                drink: null,
                dessert: null
            };
            localStorage.removeItem('foodOrder');
            renderOrderComposition();
            updateOrderDisplay();
            document.getElementById('order-form').reset();
        });
    }

    // Счетчик символов для комментариев
    const commentsTextarea = document.getElementById('comments');
    const charCount = document.getElementById('char-count');
    if (commentsTextarea && charCount) {
        commentsTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > 500) {
                this.value = this.value.substring(0, 500);
                charCount.textContent = 500;
            }
        });
    }
});
