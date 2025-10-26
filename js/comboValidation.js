// comboValidation.js - проверка комбо и показ уведомлений
document.addEventListener('DOMContentLoaded', function() {
    console.log('comboValidation.js загружен');

    // Инициализация selectedDishes (если ещё не создано)
    if (!window.selectedDishes) {
        window.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }

    // Доступные комбинации (dessert опционален)
    const availableCombos = [
        { id: 1, soup: true,  main: true,  salad: true,  drink: true  },
        { id: 2, soup: true,  main: true,  salad: false, drink: true  },
        { id: 3, soup: true,  main: false, salad: true,  drink: true  },
        { id: 4, soup: false, main: true,  salad: true,  drink: true  },
        { id: 5, soup: false, main: true,  salad: false, drink: true  }
    ];

    // Проверка валидности комбо (игнорируем dessert)
    function isValidCombo() {
        const hasSoup = !!window.selectedDishes.soup;
        const hasMain = !!window.selectedDishes.main;
        const hasSalad = !!window.selectedDishes.salad;
        const hasDrink = !!window.selectedDishes.drink;

        return availableCombos.some(combo =>
            combo.soup === hasSoup &&
            combo.main === hasMain &&
            combo.salad === hasSalad &&
            combo.drink === hasDrink
        );
    }

    // Определение типа уведомления (на основе правил из задания)
    function getNotificationType() {
        const hasSoup = !!window.selectedDishes.soup;
        const hasMain = !!window.selectedDishes.main;
        const hasSalad = !!window.selectedDishes.salad;
        const hasDrink = !!window.selectedDishes.drink;
        const hasDessert = !!window.selectedDishes.dessert;

        const hasAnyDish = hasSoup || hasMain || hasSalad || hasDrink || hasDessert;

        if (!hasAnyDish) {
            return { type: 'nothing-selected', message: 'Ничего не выбрано. Выберите блюда для заказа', emoji: '🚫' };
        }

        // Правило 2: Выберите напиток — все необходимые, кроме напитка (в простейшем смысле: если есть комбинация, которая требует drink)
        // Но проще — если нет напитка, и есть хотя бы что-то — попросим выбрать напиток.
        if (!hasDrink) {
            return { type: 'select-drink', message: 'Выберите напиток', emoji: '🥤' };
        }

        // Правило 3: выбран суп, но не выбраны главное блюдо/салат/стартер
        if (hasSoup && !hasMain && !hasSalad) {
            return { type: 'select-main-or-salad', message: 'Выберите главное блюдо/салат/стартер', emoji: '🍽️' };
        }

        // Правило 4: выбран салат/стартер, но не выбраны суп/главное блюдо
        if (hasSalad && !hasSoup && !hasMain) {
            return { type: 'select-soup-or-main', message: 'Выберите суп или главное блюдо', emoji: '🍲' };
        }

        // Правило 5: выбран напиток/десерт, но нет главного блюда
        if ((hasDrink || hasDessert) && !hasMain && !hasSoup && !hasSalad) {
            return { type: 'select-main', message: 'Выберите главное блюдо', emoji: '🍛' };
        }

        // Если ни одно правило не подошло, значит комбинация не совпадает с availableCombos
        return { type: 'invalid-combo', message: 'Выбранные блюда не соответствуют доступным комбо', emoji: '❌' };
    }

    // Показ уведомления (единственное одновременно)
    function showNotification(notificationData) {
        // Если уже есть overlay — не добавляем второй
        if (document.querySelector('.notification-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification" role="dialog" aria-live="assertive" aria-modal="true">
                <div class="notification-image">
                    <span style="font-size: 3rem;">${notificationData.emoji}</span>
                </div>
                <p>${notificationData.message}</p>
                <button class="notification-ok-btn" type="button">Окей</button>
            </div>
        `;

        document.body.appendChild(overlay);
        // Блокируем прокрутку страницы пока уведомление открыто
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const okButton = overlay.querySelector('.notification-ok-btn');

        function closeNotification() {
            if (!overlay.parentNode) return;
            overlay.parentNode.removeChild(overlay);
            document.body.style.overflow = prevOverflow || '';
            document.removeEventListener('keydown', escapeHandler);
        }

        okButton.addEventListener('click', closeNotification);

        // hover эффекты inline (в дополнение к css) — для уверенности
        okButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e74c3c';
            this.style.color = 'white';
            this.style.borderColor = '#e74c3c';
        });
        okButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.color = '';
            this.style.borderColor = '';
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeNotification();
            }
        });

        function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeNotification();
            }
        }
        document.addEventListener('keydown', escapeHandler);
    }

    // Обработчик отправки формы
    function validateForm(event) {
        console.log('Проверка комбо перед отправкой формы');
        // Сначала обновим hidden-поля (если вдруг скрипты не сделали этого)
        try {
            const soupSelect = document.getElementById('soup-select');
            const mainSelect = document.getElementById('main-course-select');
            const saladSelect = document.getElementById('salad-select');
            const drinkSelect = document.getElementById('drink-select');
            const dessertSelect = document.getElementById('dessert-select');

            if (soupSelect) soupSelect.value = window.selectedDishes.soup ? window.selectedDishes.soup.keyword : '';
            if (mainSelect) mainSelect.value = window.selectedDishes.main ? window.selectedDishes.main.keyword : '';
            if (saladSelect) saladSelect.value = window.selectedDishes.salad ? window.selectedDishes.salad.keyword : '';
            if (drinkSelect) drinkSelect.value = window.selectedDishes.drink ? window.selectedDishes.drink.keyword : '';
            if (dessertSelect) dessertSelect.value = window.selectedDishes.dessert ? window.selectedDishes.dessert.keyword : '';
        } catch (err) {
            console.warn('Не удалось обновить hidden-поля', err);
        }

        if (!isValidCombo()) {
            event.preventDefault(); // предотвращаем отправку
            const notificationData = getNotificationType();
            showNotification(notificationData);
            // возвращаем false для совместимости
            return false;
        }

        // Если валидно — ничего не предотвращаем (форма отправится на action)
        console.log('Комбо валидно, форма отправится на сервер');
        return true;
    }

    // Инициализация
    function init() {
        console.log('Инициализация валидации комбо');

        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            // Подвешиваем submit в начале — он не перезапишется другим кодом
            orderForm.addEventListener('submit', validateForm, { passive: false });
        } else {
            console.warn('Форма заказа (#order-form) не найдена на странице');
        }

        // Доп. поддержка для кнопки сброса: если на странице есть элемент с классом .reset-btn
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                // Если resetOrder определена (в HTML у вас есть функция), вызовем её
                if (typeof resetOrder === 'function') {
                    resetOrder();
                } else {
                    // Вручную сбросим
                    window.selectedDishes = { soup: null, main: null, salad: null, drink: null, dessert: null };
                    if (typeof window.updateOrderDisplay === 'function') {
                        window.updateOrderDisplay();
                    }
                    const form = document.getElementById('order-form');
                    if (form) form.reset();
                    const cc = document.getElementById('char-count');
                    if (cc) cc.textContent = '0';
                }
            });
        }
    }

    init();
});
