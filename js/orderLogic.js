// orderLogic.js - логика выбора блюд
document.addEventListener('DOMContentLoaded', function() {
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

    // Сохранение заказа в localStorage
    function saveOrderToStorage(order) {
        // Сохраняем только ключи блюд
        const orderToSave = {};
        Object.keys(order).forEach(category => {
            orderToSave[category] = order[category] ? order[category].keyword : null;
        });
        localStorage.setItem('foodOrder', JSON.stringify(orderToSave));
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

    // Инициализация
    const savedOrderKeys = loadOrderFromStorage();
    
    // Ждем загрузки блюд перед восстановлением
    function waitForDishesAndRestore() {
        return new Promise((resolve) => {
            if (window.dishes && window.dishes.length > 0) {
                window.selectedDishes = restoreDishesFromKeys(savedOrderKeys);
                resolve();
            } else {
                const checkDishes = setInterval(() => {
                    if (window.dishes && window.dishes.length > 0) {
                        clearInterval(checkDishes);
                        window.selectedDishes = restoreDishesFromKeys(savedOrderKeys);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    // Инициализируем при загрузке
    waitForDishesAndRestore().then(() => {
        updateOrderDisplay();
        updateOrderPanel();
        updateDishButtons();
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('dish-button')) {
            const dishItem = e.target.closest('.dish-item');
            const dishKeyword = dishItem.getAttribute('data-dish');
            
            if (typeof dishes !== 'undefined' && dishes.length > 0) {
                const dish = dishes.find(d => d.keyword === dishKeyword);
                if (dish) {
                    selectDish(dish);
                }
            } else {
                console.warn('Данные о блюдах не загружены');
            }
        }
    });
    
    function selectDish(dish) {
        window.selectedDishes[dish.category] = dish;
        saveOrderToStorage(window.selectedDishes);
        updateOrderDisplay();
        updateOrderPanel();
        updateDishButtons();
    }
    
    function updateOrderDisplay() {
        const orderContainer = document.getElementById('order-summary');
        if (!orderContainer) return;
        
        const selectedArray = Object.values(window.selectedDishes).filter(dish => dish !== null);
        
        if (selectedArray.length === 0) {
            orderContainer.innerHTML = `
                <div class="order-empty">
                    <h3>Ничего не выбрано</h3>
                </div>
            `;
            const totalElement = document.getElementById('order-total');
            if (totalElement) {
                totalElement.style.display = 'none';
            }
        } else {
            let orderHTML = '<h3>Ваш заказ</h3>';
            let totalPrice = 0;
            
            // Суп
            orderHTML += `<div class="order-category">
                <strong>Суп</strong><br>`;
            if (window.selectedDishes.soup) {
                orderHTML += `${window.selectedDishes.soup.name} ${window.selectedDishes.soup.price}Р`;
                totalPrice += window.selectedDishes.soup.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            // Главное блюдо
            orderHTML += `<div class="order-category">
                <strong>Главное блюдо</strong><br>`;
            if (window.selectedDishes.main) {
                orderHTML += `${window.selectedDishes.main.name} ${window.selectedDishes.main.price}Р`;
                totalPrice += window.selectedDishes.main.price;
            } else {
                orderHTML += 'Не выбрано';
            }
            orderHTML += `</div>`;
            
            // Салат/стартер
            orderHTML += `<div class="order-category">
                <strong>Салат/стартер</strong><br>`;
            if (window.selectedDishes.salad) {
                orderHTML += `${window.selectedDishes.salad.name} ${window.selectedDishes.salad.price}Р`;
                totalPrice += window.selectedDishes.salad.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            // Напиток
            orderHTML += `<div class="order-category">
                <strong>Напиток</strong><br>`;
            if (window.selectedDishes.drink) {
                orderHTML += `${window.selectedDishes.drink.name} ${window.selectedDishes.drink.price}Р`;
                totalPrice += window.selectedDishes.drink.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            // Десерт
            orderHTML += `<div class="order-category">
                <strong>Десерт</strong><br>`;
            if (window.selectedDishes.dessert) {
                orderHTML += `${window.selectedDishes.dessert.name} ${window.selectedDishes.dessert.price}Р`;
                totalPrice += window.selectedDishes.dessert.price;
            } else {
                orderHTML += 'Не выбран';
            }
            orderHTML += `</div>`;
            
            orderContainer.innerHTML = orderHTML;
            
            const totalElement = document.getElementById('order-total');
            if (totalElement) {
                totalElement.innerHTML = `<strong>Стоимость заказа</strong><br>${totalPrice}Р`;
                totalElement.style.display = 'block';
            }
            
            updateFormFields();
        }
    }
    
    function updateOrderPanel() {
        const panelSection = document.getElementById('order-panel-section');
        const totalAmount = document.getElementById('order-panel-total-amount');
        const checkoutLink = document.getElementById('checkout-link');
        
        if (!panelSection || !totalAmount || !checkoutLink) return;
        
        let total = 0;
        Object.values(window.selectedDishes).forEach(dish => {
            if (dish) total += dish.price;
        });
        
        if (total > 0) {
            panelSection.style.display = 'block';
            totalAmount.textContent = total;
        } else {
            panelSection.style.display = 'none';
            return;
        }
        
        // Проверка валидности комбо для активации ссылки
        if (isValidCombo()) {
            checkoutLink.classList.remove('disabled');
        } else {
            checkoutLink.classList.add('disabled');
        }
    }
    
    function updateFormFields() {
        const form = document.getElementById('order-form');
        if (!form) return;
        
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
    }

    // Функция проверки комбо
    function isValidCombo() {
        const hasSoup = !!window.selectedDishes.soup;
        const hasMain = !!window.selectedDishes.main;
        const hasSalad = !!window.selectedDishes.salad;
        const hasDrink = !!window.selectedDishes.drink;

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

    // Обновление состояния кнопок блюд
    function updateDishButtons() {
        if (!window.selectedDishes || !window.dishes) return;
        
        // Сбрасываем все кнопки
        document.querySelectorAll('.dish-button').forEach(button => {
            button.textContent = 'Добавить';
            button.style.backgroundColor = '';
            button.style.color = '';
            button.disabled = false;
        });
        
        // Устанавливаем состояние для выбранных блюд
        Object.entries(window.selectedDishes).forEach(([category, dish]) => {
            if (dish) {
                const dishElement = document.querySelector(`.dish-item[data-dish="${dish.keyword}"]`);
                if (dishElement) {
                    const button = dishElement.querySelector('.dish-button');
                    if (button) {
                        button.textContent = 'Добавлено';
                        button.style.backgroundColor = '#27ae60';
                        button.style.color = 'white';
                        button.disabled = true;
                    }
                }
            }
        });
    }
    
    window.updateOrderDisplay = updateOrderDisplay;
    window.updateOrderPanel = updateOrderPanel;
    window.updateDishButtons = updateDishButtons;
});
