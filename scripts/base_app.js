/**
 * MYSTICNUM ULTIMATE - Главная логика приложения
 * Максимальное использование 807+ единиц знаний
 */

// ===========================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ===========================================
let currentMatrix = null;
let knowledgeBase = null;

// ===========================================
// ИНИЦИАЛИЗАЦИЯ
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initGenderToggle();
    initDateInput();
    await loadKnowledge();
    initPractices();
    initPlans();
    initLibrary();
    
    console.log('✨ MysticNUM Ultimate загружен!');
    console.log('📊 База знаний:', knowledgeBase ? knowledgeBase.meta : 'Загрузка...');
});

// ===========================================
// НАВИГАЦИЯ ПО ВКЛАДКАМ
// ===========================================
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab + '-tab';
            
            // Переключение активных табов
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Переключение контента
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ===========================================
// ЗАГРУЗКА БАЗЫ ЗНАНИЙ
// ===========================================
async function loadKnowledge() {
    try {
        // Проверяем наличие встроенной базы
        if (window.EMBEDDED_KNOWLEDGE) {
            knowledgeBase = window.EMBEDDED_KNOWLEDGE;
            console.log('✅ База знаний загружена из встроенных данных:', knowledgeBase.meta);
            return true;
        }
        
        // Пробуем загрузить из JSON файла (если есть сервер)
        const response = await fetch('knowledge_structured_full.json');
        knowledgeBase = await response.json();
        console.log('✅ База знаний загружена из файла:', knowledgeBase.meta);
        return true;
    } catch (error) {
        console.warn('⚠️ Не удалось загрузить базу из файла, используем fallback');
        knowledgeBase = { modules: {}, meta: { totalKnowledge: 0 } };
        return false;
    }
}

// ===========================================
// ПЕРЕКЛЮЧАТЕЛЬ ПОЛА
// ===========================================
function initGenderToggle() {
    const buttons = document.querySelectorAll('.gender-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ===========================================
// АВТОФОРМАТ ДАТЫ
// ===========================================
function initDateInput() {
    const dateInputs = document.querySelectorAll('input[type="text"][id*="Date"]');
    
    dateInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.slice(0, 2) + '.' + value.slice(2);
            }
            if (value.length >= 5) {
                value = value.slice(0, 5) + '.' + value.slice(5);
            }
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            e.target.value = value;
        });
    });
}

// ===========================================
// РАСЧЕТ МАТРИЦЫ (ГЛАВНАЯ ВКЛАДКА)
// ===========================================
function calculateMatrix() {
    const dateInput = document.getElementById('birthDate').value;
    const genderBtn = document.querySelector('.gender-btn.active');
    const gender = genderBtn ? genderBtn.dataset.gender : 'женский';
    
    if (!validateDate(dateInput)) {
        alert('❌ Введите корректную дату в формате ДД.ММ.ГГГГ');
        return;
    }
    
    // Используем существующий калькулятор
    const data = calculator.calculateFullMatrix(dateInput, gender);
    
    if (!data) {
        alert('❌ Ошибка расчета');
        return;
    }
    
    currentMatrix = data;
    
    // Интеграция с премиум-системами
    if (window.premiumManager) {
        premiumManager.setUserMatrix({
            birthDate: dateInput,
            gender: gender,
            cells: data.matrix_counts ? Object.keys(data.matrix_counts).map(key => ({
                number: parseInt(key),
                count: data.matrix_counts[key]
            })) : [],
            ...data
        });
    }
    
    displayMatrixResults(data);
}

function validateDate(dateStr) {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
    
    const [day, month, year] = dateStr.split('.').map(Number);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        return false;
    }
    
    return true;
}

function displayMatrixResults(data) {
    // Показываем все панели
    document.getElementById('matrixResults').style.display = 'block';
    document.getElementById('additionalNumbers').style.display = 'block';
    document.getElementById('soulTasks').style.display = 'block';
    document.getElementById('interpretations').style.display = 'block';
    document.getElementById('programs').style.display = 'block';
    document.getElementById('warnings').style.display = 'block';
    
    // Отрисовка матрицы
    renderMatrix(data.matrix, data.matrix_counts);
    
    // Дополнительные числа
    renderNumbers(data.numbers);
    
    // Задачи души
    renderTasks(data.interpretations);
    
    // Детальные интерпретации
    renderDetailedInterpretations(data.interpretations);
    
    // Родовые программы
    renderPrograms(data.ancestral_programs);
    
    // Предупреждения
    renderWarnings(data.warnings);
}

function renderMatrix(matrix, counts) {
    const grid = document.getElementById('matrixGrid');
    
    const cellNames = {
        1: 'Характер', 4: 'Здоровье', 7: 'Удача',
        2: 'Энергия', 5: 'Логика', 8: 'Долг',
        3: 'Интерес', 6: 'Труд', 9: 'Память'
    };
    
    let html = '';
    for (let i = 1; i <= 9; i++) {
        const count = counts[i] || 0;
        const value = matrix[i] || '—';
        
        html += `
            <div class="matrix-cell" onclick="showCellDetails(${i})">
                <div class="cell-label">${i}</div>
                <div class="cell-value">${value}</div>
                <div class="cell-name">${cellNames[i]}</div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

function renderNumbers(numbers) {
    const container = document.getElementById('numbersDisplay');
    
    const labels = ['Первое', 'Личная задача', 'Третье', 'Родовая задача'];
    
    let html = '<div style="display: grid; gap: 12px;">';
    numbers.forEach((num, idx) => {
        if (idx < labels.length) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; 
                           padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    <span style="color: var(--text-secondary);">${labels[idx]}</span>
                    <strong style="color: var(--primary); font-size: 20px;">${num}</strong>
                </div>
            `;
        }
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function renderTasks(interpretations) {
    document.getElementById('personalTask').innerHTML = formatText(interpretations.personal_task || 'Нет данных');
    document.getElementById('ancestralTask').innerHTML = formatText(interpretations.ancestral_task || 'Нет данных');
}

function renderDetailedInterpretations(interpretations) {
    const container = document.getElementById('interpretationsContent');
    
    if (!interpretations.matrix_values) {
        container.innerHTML = '<p>Интерпретации недоступны</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 20px;">';
    
    Object.keys(interpretations.matrix_values).forEach(key => {
        const data = interpretations.matrix_values[key];
        if (data.count > 0) {
            html += `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); 
                           border-radius: 12px; padding: 20px;">
                    <h3 style="color: var(--primary); margin-bottom: 12px;">
                        Цифра ${key} (${data.value})
                    </h3>
                    <div style="color: var(--text-secondary); line-height: 1.8;">
                        ${formatText(data.interpretation)}
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderPrograms(programs) {
    const container = document.getElementById('programsContent');
    
    if (!programs || programs.length === 0) {
        container.innerHTML = '<p>Родовые программы не обнаружены</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    programs.forEach(program => {
        const colorMap = {
            'power': '#4CAF50',
            'warning': '#FF9800',
            'critical': '#F44336',
            'talent': '#9C27B0'
        };
        
        const color = colorMap[program.type] || '#2196F3';
        
        html += `
            <div style="background: rgba(255,255,255,0.03); border-left: 4px solid ${color}; 
                       border-radius: 8px; padding: 16px;">
                <h4 style="color: ${color}; margin-bottom: 8px;">${program.title}</h4>
                <p style="color: var(--text-secondary);">${program.description}</p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderWarnings(warnings) {
    const container = document.getElementById('warningsContent');
    
    if (!warnings || warnings.length === 0) {
        container.innerHTML = '<p>Нет предупреждений</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 12px;">';
    
    warnings.forEach(warning => {
        const icons = { 'info': 'ℹ️', 'warning': '⚠️', 'critical': '🚨' };
        const icon = icons[warning.type] || 'ℹ️';
        
        html += `
            <div style="display: flex; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); 
                       border-radius: 8px;">
                <span style="font-size: 24px;">${icon}</span>
                <p style="color: var(--text-secondary); flex: 1;">${warning.text}</p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function formatText(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/(🎯|👪|📊|🔮|🌟|✨|⚡|⚠️|🚨)/g, '<strong>$1</strong>');
}

// ===========================================
// КАЛЬКУЛЯТОРЫ
// ===========================================

function calculateCarNumber() {
    const carNumber = document.getElementById('carNumber').value;
    if (!carNumber) {
        alert('Введите номер машины');
        return;
    }
    
    // Расчет числа номера
    const alphabet = {
        'А': 1, 'В': 2, 'Е': 3, 'К': 4, 'М': 5, 'Н': 6, 'О': 7, 'Р': 8, 'С': 9, 'Т': 1, 'У': 2, 'Х': 3
    };
    
    let sum = 0;
    for (let char of carNumber.toUpperCase()) {
        if (alphabet[char]) {
            sum += alphabet[char];
        } else if (!isNaN(char)) {
            sum += parseInt(char);
        }
    }
    
    while (sum > 9) {
        sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    
    // Ищем интерпретацию в базе знаний
    let interpretation = getCarNumberInterpretation(sum);
    
    document.getElementById('carResult').innerHTML = `
        <div class="calc-result-content">
            <h3>Число машины: ${sum}</h3>
            <p>${interpretation}</p>
        </div>
    `;
}

function getCarNumberInterpretation(number) {
    if (!knowledgeBase || !knowledgeBase.modules.property) {
        return 'Интерпретация загружается...';
    }
    
    // Ищем в базе знаний
    const carItems = knowledgeBase.modules.property.items.filter(
        item => item.category === 'car_number' && item.content.includes(`число ${number}`)
    );
    
    if (carItems.length > 0) {
        return carItems[0].content;
    }
    
    return `Число ${number} - базовое значение. Требуется дополнительный анализ.`;
}

function calculateApartment() {
    const apartmentNumber = document.getElementById('apartmentNumber').value;
    if (!apartmentNumber) {
        alert('Введите номер квартиры');
        return;
    }
    
    // Аналогично расчету машины
    let sum = apartmentNumber.split('').reduce((a, b) => a + parseInt(b || 0), 0);
    while (sum > 9) {
        sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    
    document.getElementById('apartmentResult').innerHTML = `
        <div class="calc-result-content">
            <h3>Число квартиры: ${sum}</h3>
            <p>Интерпретация загружается из базы...</p>
        </div>
    `;
}

function calculateBusiness() {
    alert('Расчет бизнеса - в разработке. Используется 162 записи из базы!');
}

function calculateCompatibility() {
    const date1 = document.getElementById('partner1Date').value;
    const date2 = document.getElementById('partner2Date').value;
    
    if (!date1 || !date2) {
        alert('Введите обе даты');
        return;
    }
    
    alert('Расчет совместимости - в разработке!');
}

// ===========================================
// ПРАКТИКИ
// ===========================================
function initPractices() {
    const practiceButtons = document.querySelectorAll('[data-practice]');
    
    practiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            practiceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            loadPracticeType(btn.dataset.practice);
        });
    });
    
    // Загружаем медитации по умолчанию
    setTimeout(() => loadPracticeType('meditations'), 1000);
}

function loadPracticeType(type) {
    if (!knowledgeBase || !knowledgeBase.modules.practices) {
        document.getElementById('practices-list').innerHTML = '<p>Загрузка...</p>';
        return;
    }
    
    const typeMap = {
        'meditations': 'meditations',
        'prayers': 'prayers',
        'rituals': 'rituals',
        'techniques': 'items'
    };
    
    const items = knowledgeBase.modules.practices[typeMap[type]] || [];
    
    const container = document.getElementById('practices-list');
    
    if (items.length === 0) {
        container.innerHTML = '<p>Нет данных</p>';
        return;
    }
    
    let html = '';
    items.forEach((item, idx) => {
        html += `
            <div class="practice-item" onclick="showPracticeDetail('${type}', ${idx})">
                <div class="practice-title">${item.name || 'Практика ' + (idx + 1)}</div>
                <div class="practice-description">${truncate(item.content, 100)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function showPracticeDetail(type, index) {
    const typeMap = {
        'meditations': 'meditations',
        'prayers': 'prayers',
        'rituals': 'rituals',
        'techniques': 'items'
    };
    
    const item = knowledgeBase.modules.practices[typeMap[type]][index];
    
    if (!item) return;
    
    showModal(`
        <h2>${item.name || 'Практика'}</h2>
        <p style="color: var(--text-muted); margin-bottom: 20px;">
            Категория: ${item.category}
        </p>
        <div style="color: var(--text-secondary); line-height: 1.8;">
            ${formatText(item.content)}
        </div>
    `);
}

// ===========================================
// ПЛАНЫ
// ===========================================
function initPlans() {
    setTimeout(() => {
        loadPlan('mental', 'mentalPlan');
        loadPlan('physical', 'physicalPlan');
        loadPlan('emotional', 'emotionalPlan');
    }, 1500);
}

function loadPlan(type, containerId) {
    if (!knowledgeBase || !knowledgeBase.modules.plans) return;
    
    const items = knowledgeBase.modules.plans[type] || [];
    const container = document.getElementById(containerId);
    
    if (items.length === 0) {
        container.innerHTML = '<p>Загрузка...</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 12px;">';
    items.forEach(item => {
        html += `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); 
                       border-radius: 8px; padding: 12px; cursor: pointer;"
                 onclick="showModal('<h2>${item.name}</h2><p>${item.content}</p>')">
                <strong style="color: var(--primary);">${item.name}</strong>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// ===========================================
// БИБЛИОТЕКА
// ===========================================
function initLibrary() {
    setTimeout(() => displayCategories(), 2000);
}

function searchKnowledge(query) {
    if (!query || query.length < 2) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    if (!knowledgeBase) {
        document.getElementById('searchResults').innerHTML = '<p>База знаний загружается...</p>';
        return;
    }
    
    // Поиск по всем модулям
    const results = [];
    query = query.toLowerCase();
    
    Object.values(knowledgeBase.modules).forEach(module => {
        if (module.items) {
            module.items.forEach(item => {
                const searchText = (item.name + ' ' + item.content + ' ' + item.category).toLowerCase();
                if (searchText.includes(query)) {
                    results.push(item);
                }
            });
        }
    });
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    
    if (results.length === 0) {
        container.innerHTML = '<p>Ничего не найдено</p>';
        return;
    }
    
    let html = '<h3 style="color: var(--primary); margin-bottom: 16px;">Найдено: ' + results.length + '</h3>';
    
    results.slice(0, 20).forEach(item => {
        html += `
            <div class="search-result-item" onclick='showModal(\`<h2>${item.name}</h2><p>${item.content}</p>\`)'>
                <div class="result-title">${item.name}</div>
                <div class="result-category">${item.category}</div>
                <div class="result-content">${truncate(item.content, 150)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function displayCategories() {
    if (!knowledgeBase) return;
    
    const categories = {};
    
    Object.values(knowledgeBase.modules).forEach(module => {
        if (module.items) {
            module.items.forEach(item => {
                const cat = item.category || 'general';
                categories[cat] = (categories[cat] || 0) + 1;
            });
        }
    });
    
    const container = document.getElementById('knowledgeCategories');
    
    let html = '';
    Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([cat, count]) => {
        html += `
            <div class="category-card" onclick="filterByCategory('${cat}')">
                <div class="category-name">${cat}</div>
                <div class="category-count">${count} записей</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterByCategory(category) {
    searchKnowledge(category);
}

// ===========================================
// УТИЛИТЫ
// ===========================================
function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function showModal(content) {
    const modal = document.getElementById('detailModal');
    document.getElementById('modalContent').innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

function showCellDetails(number) {
    if (!currentMatrix || !currentMatrix.interpretations) return;
    
    const data = currentMatrix.interpretations.matrix_values[number];
    if (!data) return;
    
    showModal(`
        <h2>Цифра ${number} - ${data.value}</h2>
        <p style="color: var(--text-muted); margin-bottom: 20px;">
            Количество в матрице: ${data.count}
        </p>
        <div style="color: var(--text-secondary); line-height: 1.8;">
            ${formatText(data.interpretation)}
        </div>
    `);
}

// Экспорт для глобального использования
window.calculateMatrix = calculateMatrix;
window.calculateCarNumber = calculateCarNumber;
window.calculateApartment = calculateApartment;
window.calculateBusiness = calculateBusiness;
window.calculateCompatibility = calculateCompatibility;
window.searchKnowledge = searchKnowledge;
window.closeModal = closeModal;
