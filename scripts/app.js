/**
 * Главное приложение MysticNUM Complete
 * Интегрирует все модули в единую систему
 */

class MysticNUMApp {
    constructor() {
        this.currentMatrix = null;
        this.currentGender = 'женский';
        this.currentBirthDate = null;
        this.knowledgeBase = null;
        
        this.init();
    }

    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🚀 Инициализация MysticNUM Complete...');
        
        // Загрузка базы знаний
        await this.loadKnowledgeBase();
        
        // Инициализация UI
        this.initUI();
        
        // Инициализация модулей
        this.initModules();
        
        console.log('✅ Приложение инициализировано');
    }

    /**
     * Загрузка базы знаний
     */
    async loadKnowledgeBase() {
        try {
            // Используем глобальную функцию загрузки
            if (typeof loadKnowledgeBase === 'function') {
                this.knowledgeBase = await loadKnowledgeBase();
                console.log('📚 База знаний загружена:', Object.keys(this.knowledgeBase).length, 'категорий');
            } else {
                console.error('Функция loadKnowledgeBase не найдена');
                this.knowledgeBase = {};
            }
        } catch (error) {
            console.error('Ошибка загрузки базы знаний:', error);
            this.knowledgeBase = {};
        }
    }

    /**
     * Инициализация UI
     */
    initUI() {
        // Навигация по вкладкам
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Переключение пола
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectGender(btn));
        });

        // Форматирование даты
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput) {
            birthDateInput.addEventListener('input', this.formatDateInput);
        }

        // Поиск в библиотеке
        const librarySearch = document.getElementById('librarySearch');
        if (librarySearch) {
            librarySearch.addEventListener('input', (e) => this.searchLibrary(e.target.value));
        }
    }

    /**
     * Инициализация модулей
     */
    initModules() {
        // Инициализация практик
        if (typeof PracticesEnhanced !== 'undefined') {
            this.practicesModule = new PracticesEnhanced(this.knowledgeBase);
            console.log('✅ Модуль практик инициализирован');
        }

        // Инициализация анализа рода
        if (typeof AncestralEnhanced !== 'undefined') {
            this.ancestralModule = new AncestralEnhanced(this.knowledgeBase);
            console.log('✅ Модуль рода инициализирован');
        }

        // Инициализация прогнозов
        if (typeof ForecastEnhanced !== 'undefined') {
            this.forecastModule = new ForecastEnhanced(this.knowledgeBase);
            console.log('✅ Модуль прогнозов инициализирован');
        }
    }

    /**
     * Переключение вкладок
     */
    switchTab(tabName) {
        // Убираем active у всех табов
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Добавляем active нужным
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);

        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }

    /**
     * Выбор пола
     */
    selectGender(button) {
        document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        this.currentGender = button.dataset.gender;
    }

    /**
     * Форматирование ввода даты
     */
    formatDateInput(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '.' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '.' + value.substring(5, 9);
        }
        
        e.target.value = value;
    }

    /**
     * Главная функция расчета - вызывает все модули
     */
    async calculateAll() {
        const birthDate = document.getElementById('birthDate').value;
        
        if (!this.validateDate(birthDate)) {
            alert('Введите корректную дату в формате ДД.ММ.ГГГГ');
            return;
        }

        this.currentBirthDate = birthDate;

        // Показываем индикатор загрузки
        this.showLoading();

        try {
            // 1. Расчет матрицы
            await this.calculateMatrix(birthDate);

            // 2. Расчет практик
            if (this.practicesModule && this.currentMatrix) {
                this.calculatePractices();
            }

            // 3. Расчет родовой системы
            if (this.ancestralModule && this.currentMatrix) {
                this.calculateAncestral();
            }

            // 4. Расчет прогноза
            if (this.forecastModule && this.currentMatrix) {
                this.calculateForecast();
            }

            // Сохраняем результат
            this.saveCalculation();

            // Показываем кнопки экспорта
            this.showExportButtons();

            // Переключаемся на вкладку матрицы
            this.switchTab('matrix');

        } catch (error) {
            console.error('Ошибка расчета:', error);
            alert('Произошла ошибка при расчете');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Расчет матрицы Пифагора
     */
    async calculateMatrix(birthDate) {
        if (typeof MatrixCalculator !== 'undefined') {
            const calculator = new MatrixCalculator();
            this.currentMatrix = calculator.calculateFullMatrix(birthDate, this.currentGender);
            
            if (this.currentMatrix) {
                // Отображаем результаты
                this.displayMatrix(this.currentMatrix);
            } else {
                alert('Ошибка расчета матрицы. Проверьте дату.');
            }
        }
    }

    /**
     * Отображение матрицы
     */
    displayMatrix(matrix) {
        const resultsDiv = document.getElementById('matrixResults');
        const gridDiv = document.getElementById('matrixGrid');
        
        if (!resultsDiv || !gridDiv) return;

        // Показываем панель результатов
        resultsDiv.style.display = 'block';

        // Создаем сетку 3x3
        gridDiv.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.innerHTML = `
                <div class="cell-number">${i}</div>
                <div class="cell-value">${matrix[i] || '—'}</div>
            `;
            cell.onclick = () => this.showCellDetails(i, matrix[i]);
            gridDiv.appendChild(cell);
        }

        // Отображаем интерпретации
        this.displayInterpretations(matrix);
    }

    /**
     * Отображение интерпретаций
     */
    displayInterpretations(matrix) {
        const interpDiv = document.getElementById('matrixInterpretations');
        if (!interpDiv) return;

        let html = '<div class="interpretations-list">';
        
        // Базовые интерпретации для каждой ячейки
        for (let i = 1; i <= 9; i++) {
            const value = matrix[i];
            if (value) {
                html += `
                    <div class="interpretation-item">
                        <h4>Число ${i}: ${value}</h4>
                        <p>${this.getInterpretation(i, value)}</p>
                    </div>
                `;
            }
        }

        html += '</div>';
        interpDiv.innerHTML = html;
    }

    /**
     * Получение интерпретации числа
     */
    getInterpretation(position, value) {
        const interpretations = {
            1: 'Характер, воля, лидерские качества',
            2: 'Энергия, эмоции, чувствительность',
            3: 'Интересы, творчество, знания',
            4: 'Здоровье, физическая сила',
            5: 'Логика, интуиция, планирование',
            6: 'Труд, мастерство, материализм',
            7: 'Удача, везение',
            8: 'Долг, ответственность',
            9: 'Память, ум'
        };

        const base = interpretations[position] || 'Качество';
        const count = value ? value.toString().length : 0;

        if (count === 0) return `${base}: отсутствует, требует развития`;
        if (count === 1) return `${base}: слабо выражено`;
        if (count === 2) return `${base}: норма`;
        if (count === 3) return `${base}: хорошо развито`;
        if (count >= 4) return `${base}: очень сильно выражено, возможен перебор`;

        return base;
    }

    /**
     * Расчет практик
     */
    calculatePractices() {
        if (!this.practicesModule) return;

        this.practicesModule.setUserMatrix(this.currentMatrix, this.currentBirthDate);
        const practices = this.practicesModule.getPersonalizedPractices();

        this.displayPractices(practices);
    }

    /**
     * Отображение практик
     */
    displayPractices(practices) {
        const container = document.getElementById('practicesContent');
        if (!container) return;

        let html = '<div class="practices-sections">';

        // Срочные практики
        if (practices.urgent && practices.urgent.length > 0) {
            html += '<div class="practice-section urgent">';
            html += '<h2>🚨 Срочные практики</h2>';
            practices.urgent.forEach(group => {
                html += this.renderPracticeGroup(group);
            });
            html += '</div>';
        }

        // Рекомендованные практики
        if (practices.recommended && practices.recommended.length > 0) {
            html += '<div class="practice-section recommended">';
            html += '<h2>⭐ Рекомендованные практики</h2>';
            practices.recommended.forEach(group => {
                html += this.renderPracticeGroup(group);
            });
            html += '</div>';
        }

        // Поддерживающие практики
        if (practices.supportive && practices.supportive.length > 0) {
            html += '<div class="practice-section supportive">';
            html += '<h2>🌟 Поддерживающие практики</h2>';
            practices.supportive.forEach(group => {
                html += this.renderPracticeGroup(group);
            });
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Рендеринг группы практик
     */
    renderPracticeGroup(group) {
        let html = `<div class="practice-group">`;
        html += `<h3>${group.title}</h3>`;
        html += `<p class="group-description">${group.description}</p>`;
        
        if (group.practices) {
            group.practices.forEach((practice, index) => {
                const practiceId = `practice_${Date.now()}_${index}`;
                html += `
                    <div class="practice-card">
                        <h4>${practice.name}</h4>
                        <p>${practice.description}</p>
                        ${practice.duration ? `<div class="practice-duration">⏱️ ${practice.duration}</div>` : ''}
                        <button class="btn-save-practice" onclick="app.savePractice('${practiceId}', ${JSON.stringify(practice).replace(/"/g, '&quot;')})">
                            💾 Сохранить в мои практики
                        </button>
                    </div>
                `;
            });
        }

        html += '</div>';
        return html;
    }

    /**
     * Сохранение практики
     */
    savePractice(id, practice) {
        const practiceData = typeof practice === 'string' ? JSON.parse(practice) : practice;
        practiceData.id = id;
        
        if (storageManager.savePractice(practiceData)) {
            alert('✅ Практика сохранена!');
        } else {
            alert('⚠️ Эта практика уже сохранена');
        }
    }

    /**
     * Расчет родовой системы
     */
    calculateAncestral() {
        if (!this.ancestralModule) return;

        this.ancestralModule.setUserData(this.currentMatrix, this.currentBirthDate, this.currentGender);
        const analysis = this.ancestralModule.getFullAncestralAnalysis();

        this.displayAncestral(analysis);
    }

    /**
     * Отображение родового анализа
     */
    displayAncestral(analysis) {
        const container = document.getElementById('ancestralContent');
        if (!container || !analysis) return;

        let html = '<div class="ancestral-analysis">';

        // Тип рода
        if (analysis.overview && analysis.overview.ancestralType) {
            const type = analysis.overview.ancestralType;
            html += `
                <div class="ancestral-type glass-card">
                    <h2>👑 Ваш тип рода: ${type.type}</h2>
                    <p>${type.description}</p>
                    <div class="ancestral-gift">
                        <strong>🎁 Дар рода:</strong> ${type.gift}
                    </div>
                </div>
            `;
        }

        // Родовые программы
        if (analysis.programs && analysis.programs.length > 0) {
            html += '<div class="ancestral-programs"><h2>⚠️ Родовые программы</h2>';
            analysis.programs.forEach(program => {
                html += `
                    <div class="program-card ${program.severity}">
                        <h3>${program.title}</h3>
                        <p>${program.description}</p>
                        <div class="program-severity">Уровень: ${program.severity}</div>
                        ${program.healing ? `<div class="program-healing">💚 Исцеление: ${program.healing}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Расчет прогноза
     */
    calculateForecast() {
        if (!this.forecastModule) return;

        this.forecastModule.setUserData(this.currentMatrix, this.currentBirthDate);
        const forecast = this.forecastModule.getFullForecast();

        this.displayForecast(forecast);
    }

    /**
     * Отображение прогноза
     */
    displayForecast(forecast) {
        const container = document.getElementById('forecastContent');
        if (!container || !forecast) return;

        let html = '<div class="forecast-panels">';

        // Персональный год
        if (forecast.personalYear) {
            const year = forecast.personalYear;
            html += `
                <div class="forecast-year glass-card">
                    <h2>🔮 Персональный год: ${year.number}</h2>
                    <h3>${year.theme}</h3>
                    <p>${year.description}</p>
                    ${year.tasks ? `<div class="year-tasks"><strong>Задачи года:</strong><ul>${year.tasks.map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}
                </div>
            `;
        }

        // Персональный месяц
        if (forecast.personalMonth) {
            const month = forecast.personalMonth;
            html += `
                <div class="forecast-month glass-card">
                    <h2>📅 Персональный месяц: ${month.number}</h2>
                    <h3>${month.theme}</h3>
                    <p>${month.description}</p>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Калькуляторы
     */
    calculateCarNumber() {
        const number = document.getElementById('carNumber').value;
        // Реализация расчета
        document.getElementById('carResult').innerHTML = 
            `<p>Номер машины: ${number}<br>Энергия: анализ...</p>`;
    }

    calculateFlatNumber() {
        const number = document.getElementById('flatNumber').value;
        document.getElementById('flatResult').innerHTML = 
            `<p>Номер квартиры: ${number}<br>Энергия: анализ...</p>`;
    }

    calculateBusiness() {
        const date = document.getElementById('businessDate').value;
        document.getElementById('businessResult').innerHTML = 
            `<p>Дата основания: ${date}<br>Анализ: расчет...</p>`;
    }

    calculateCompatibility() {
        const date1 = document.getElementById('partner1Date').value;
        const date2 = document.getElementById('partner2Date').value;
        document.getElementById('compatibilityResult').innerHTML = 
            `<p>Совместимость: расчет...</p>`;
    }

    /**
     * Поиск в библиотеке знаний
     */
    searchLibrary(query) {
        const resultsDiv = document.getElementById('libraryResults');
        if (!resultsDiv || !this.knowledgeBase) return;

        if (query.length < 2) {
            resultsDiv.innerHTML = '<p>Введите минимум 2 символа для поиска</p>';
            return;
        }

        const results = Object.entries(this.knowledgeBase)
            .filter(([key, value]) => {
                const searchStr = (key + JSON.stringify(value)).toLowerCase();
                return searchStr.includes(query.toLowerCase());
            })
            .slice(0, 20);

        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>Ничего не найдено</p>';
            return;
        }

        let html = '<div class="knowledge-items">';
        results.forEach(([key, value]) => {
            html += `
                <div class="knowledge-item" onclick="app.showKnowledgeDetails('${key}')">
                    <h4>${key}</h4>
                    <p>${JSON.stringify(value).substring(0, 150)}...</p>
                </div>
            `;
        });
        html += '</div>';

        resultsDiv.innerHTML = html;
    }

    /**
     * Показать детали знания
     */
    showKnowledgeDetails(key) {
        const data = this.knowledgeBase[key];
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h2>${key}</h2>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;

        this.showModal();
    }

    /**
     * Модальное окно
     */
    showModal() {
        document.getElementById('modal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    /**
     * Детали ячейки матрицы
     */
    showCellDetails(cellNumber, value) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Ячейка ${cellNumber}</h2>
            <p><strong>Значение:</strong> ${value || 'отсутствует'}</p>
            <p>${this.getInterpretation(cellNumber, value)}</p>
        `;
        this.showModal();
    }

    /**
     * Валидация даты
     */
    validateDate(dateStr) {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        if (!regex.test(dateStr)) return false;

        const [, day, month, year] = dateStr.match(regex);
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100;
    }

    /**
     * Сохранение расчета
     */
    saveCalculation() {
        if (!this.currentMatrix) return;

        const data = {
            birthDate: this.currentBirthDate,
            gender: this.currentGender,
            matrix: this.currentMatrix,
            practices: this.practicesModule ? this.practicesModule.getPersonalizedPractices() : null,
            ancestral: this.ancestralModule ? this.ancestralModule.getFullAncestralAnalysis() : null,
            forecast: this.forecastModule ? this.forecastModule.getFullForecast() : null
        };

        storageManager.saveCalculation(data);
        
        // Обновляем данные для экспорта
        exportManager.setUserData(data);
    }

    /**
     * Показать кнопки экспорта
     */
    showExportButtons() {
        const exportButtons = document.getElementById('exportButtons');
        if (exportButtons) {
            exportButtons.style.display = 'flex';
        }
    }

    /**
     * Индикаторы загрузки
     */
    showLoading() {
        // Можно добавить спиннер
        console.log('Loading...');
    }

    hideLoading() {
        console.log('Loading complete');
    }
}

// Инициализация приложения при загрузке страницы
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new MysticNUMApp();
});
