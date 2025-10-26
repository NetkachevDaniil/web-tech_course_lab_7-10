// orderLogic.js - логика выбора блюд
document.addEventListener('DOMContentLoaded', function() {
    if (!window.selectedDishes) {
        window.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }
    
    updateOrderDisplay();
    
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
        updateOrderDisplay();
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
            
            if (window.selectedDishes.soup) {
                orderHTML += `<div class="order-category">
                    <strong>Суп</strong><br>
                    ${window.selectedDishes.soup.name} ${window.selectedDishes.soup.price}Р
                </div>`;
                totalPrice += window.selectedDishes.soup.price;
            }
            
            if (window.selectedDishes.main) {
                orderHTML += `<div class="order-category">
                    <strong>Главное блюдо</strong><br>
                    ${window.selectedDishes.main.name} ${window.selectedDishes.main.price}Р
                </div>`;
                totalPrice += window.selectedDishes.main.price;
            }
            
            if (window.selectedDishes.salad) {
                orderHTML += `<div class="order-category">
                    <strong>Салат или стартер</strong><br>
                    ${window.selectedDishes.salad.name} ${window.selectedDishes.salad.price}Р
                </div>`;
                totalPrice += window.selectedDishes.salad.price;
            }
            
            if (window.selectedDishes.drink) {
                orderHTML += `<div class="order-category">
                    <strong>Напиток</strong><br>
                    ${window.selectedDishes.drink.name} ${window.selectedDishes.drink.price}Р
                </div>`;
                totalPrice += window.selectedDishes.drink.price;
            }
            
            if (window.selectedDishes.dessert) {
                orderHTML += `<div class="order-category">
                    <strong>Десерт</strong><br>
                    ${window.selectedDishes.dessert.name} ${window.selectedDishes.dessert.price}Р
                </div>`;
                totalPrice += window.selectedDishes.dessert.price;
            }
            
            orderContainer.innerHTML = orderHTML;
            
            const totalElement = document.getElementById('order-total');
            if (totalElement) {
                totalElement.innerHTML = `<strong>Стоимость заказа</strong><br>${totalPrice}Р`;
                totalElement.style.display = 'block';
            }
            
            updateFormFields();
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
    
    window.updateOrderDisplay = updateOrderDisplay;
});