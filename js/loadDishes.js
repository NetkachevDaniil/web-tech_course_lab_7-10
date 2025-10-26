// loadDishes.js - функция для загрузки данных с API (исправленная версия)
const apiKey = '3926b07f-7ce7-4d7b-a716-3f472e11282f';
const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
let dishes = [];

function getDishes() {
    return fetch(`${API_BASE}/dishes?api_key=${apiKey}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return res.json();
        })
        .then(data => {
            return data;
        }) 
        .catch(error => {
            console.error("Ошибка: ", error);
            return [];
        });
}

async function initDishes() {
    console.log('Начинаем загрузку блюд с API...');
    const dishesData = await getDishes();
    
    // Преобразуем данные API в формат, совместимый с вашим сайтом
    const transformedDishes = dishesData.map(dish => {
        // Преобразуем категории из API в ваши категории
        let category = dish.category;
        if (category === 'main-course') {
            category = 'main';
        }
        
        return {
            keyword: dish.keyword,
            name: dish.name,
            price: dish.price,
            category: category,
            count: dish.count,
            image: dish.image,
            kind: dish.kind
        };
    });
    
    dishes = transformedDishes.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    // Сохраняем в глобальную переменную
    window.dishes = dishes;
    
    console.log('Блюда загружены:', dishes.length, 'шт.');
    
    // Запускаем отображение блюд
    if (typeof window.displayDishes === 'function') {
        window.displayDishes();
    }
    
    // Обновляем отображение заказа если нужно
    if (typeof window.updateOrderDisplay === 'function') {
        window.updateOrderDisplay();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initDishes();
});