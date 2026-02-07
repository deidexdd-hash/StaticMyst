/**
 * Калькулятор матрицы судьбы на JavaScript
 * Полностью клиентская версия - работает без сервера!
 */

class MatrixCalculator {
    
    /**
     * Полный расчет матрицы
     */
    calculateFullMatrix(dateStr, gender = "женский") {
        try {
            // Парсинг даты
            const parts = dateStr.split('.');
            if (parts.length !== 3) return null;
            
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            
            // Валидация
            if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
                return null;
            }
            
            // Разбиваем дату на цифры
            const nums = dateStr.replace(/\./g, '').split('').map(d => parseInt(d));
            
            // === БАЗОВЫЕ РАСЧЕТЫ (как в App.tsx) ===
            
            // Первое число - сумма всех цифр даты
            const first = nums.reduce((sum, n) => sum + n, 0);
            
            // Второе число - сумма цифр первого числа
            const second = this.sumDigits(first);
            
            // Третье число зависит от года рождения
            let third, additional;
            if (year >= 2000) {
                third = first + 19;
                additional = [first, second, 19, third];
            } else {
                // Для людей до 2000 года
                const firstDigit = nums.find(d => d !== 0);
                third = first - (firstDigit * 2);
                additional = [first, second, third];
            }
            
            // Четвертое число - сумма цифр третьего числа
            const fourth = this.sumDigits(third);
            additional.push(fourth);
            
            // === ПОЛНЫЙ МАССИВ ===
            let fullArray = [...nums];
            
            // Добавляем дополнительные числа (разбитые на цифры)
            additional.forEach(num => {
                const digits = Math.abs(num).toString().split('').map(d => parseInt(d));
                fullArray = fullArray.concat(digits);
            });
            
            // Особый случай: для рожденных >= 2020, добавляем дополнительную 9
            if (year >= 2020) {
                fullArray.push(9);
            }
            
            // === ЗАПОЛНЕНИЕ МАТРИЦЫ 1-9 ===
            const matrix = {};
            const matrixCounts = {};
            
            for (let i = 1; i <= 9; i++) {
                const count = fullArray.filter(n => n === i).length;
                matrixCounts[i] = count;
                
                if (count > 0) {
                    matrix[i] = Array(count).fill(i).join(' ');
                } else {
                    matrix[i] = "—";
                }
            }
            
            // === ДОПОЛНИТЕЛЬНЫЕ РАСЧЕТЫ ===
            const birthNumber = day <= 9 ? day : this.sumDigits(day);
            const lifePath = this.sumDigits(day + month + year);
            
            // === ИНТЕРПРЕТАЦИИ ===
            const interpretations = this.getInterpretations(matrixCounts, additional, gender, year);
            
            // === РОДОВЫЕ ПРОГРАММЫ ===
            const ancestralPrograms = this.analyzeAncestralPrograms(matrixCounts);
            
            // === ПРЕДУПРЕЖДЕНИЯ ===
            const warnings = this.getWarnings(matrixCounts, year);
            
            return {
                date: dateStr,
                year: year,
                gender: gender,
                numbers: additional,
                full_array: fullArray,
                matrix: matrix,
                matrix_counts: matrixCounts,
                birth_number: birthNumber,
                life_path: lifePath,
                personal_task: second,
                ancestral_task: fourth,
                interpretations: interpretations,
                ancestral_programs: ancestralPrograms,
                warnings: warnings
            };
            
        } catch (error) {
            console.error('Ошибка расчета:', error);
            return null;
        }
    }
    
    /**
     * Сумма цифр числа
     */
    sumDigits(num) {
        return Math.abs(num).toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    
    /**
     * Получение интерпретаций
     */
    getInterpretations(counts, additional, gender, year) {
        const result = {
            personal_task: "",
            ancestral_task: "",
            matrix_values: {}
        };
        
        // Личная задача души (второе число)
        const second = additional[1].toString();
        result.personal_task = TASKS_DATA[second] || "Нет данных";
        
        // Родовая задача (четвертое число)
        const fourth = additional[3].toString();
        result.ancestral_task = TASKS_DATA[fourth] || "Нет данных";
        
        // Интерпретации для каждой цифры 1-9
        for (let num = 1; num <= 9; num++) {
            const count = counts[num] || 0;
            
            let key;
            if (count === 0) {
                key = num + "0";
            } else if (count > 5) {
                key = num.toString().repeat(5);
            } else {
                key = num.toString().repeat(count);
            }
            
            let interpretation = MATRIX_DATA[key];
            
            // Если интерпретация зависит от пола
            if (interpretation && typeof interpretation === 'object') {
                interpretation = gender === "женский" 
                    ? interpretation.women 
                    : interpretation.men;
            }
            
            if (interpretation) {
                result.matrix_values[num] = {
                    count: count,
                    value: count > 0 ? num.toString().repeat(count) : "—",
                    interpretation: interpretation
                };
            }
        }
        
        return result;
    }
    
    /**
     * Анализ родовых программ
     */
    analyzeAncestralPrograms(counts) {
        const programs = [];
        
        // Анализ по цифре 8 (связь с родом)
        const eights = counts[8] || 0;
        if (eights === 0) {
            programs.push({
                type: "warning",
                title: "Нарушение связи с родом",
                description: "Свободолюбие, но ослабленная связь с родовой системой. Важно восстановить контакт с родом."
            });
        } else if (eights >= 3) {
            programs.push({
                type: "power",
                title: "Сильная родовая программа служения",
                description: "Задача наставничества и обучения других людей. Код учителя активирован."
            });
        }
        
        // Анализ по цифре 7 (канал удачи)
        const sevens = counts[7] || 0;
        if (sevens === 0) {
            programs.push({
                type: "critical",
                title: "⚠️ Нарушенный канал родовой удачи",
                description: "КРИТИЧЕСКИ ВАЖНО! Необходима практика благодарения (90 дней) для восстановления канала удачи. Включения программы 'вляпался' в 26, 33 и 36-41 лет."
            });
        } else if (sevens >= 4) {
            programs.push({
                type: "power",
                title: "✨ Опека высших сил",
                description: "Сильное везение и защита. Но важно быть порядочным и не нарушать морально-этических принципов."
            });
        }
        
        // Эзотерические способности
        const ones = counts[1] || 0;
        const nines = counts[9] || 0;
        
        if (sevens >= 1 || (ones >= 3 && nines >= 2)) {
            programs.push({
                type: "talent",
                title: "🔮 Эзотерические способности",
                description: "Потенциал в области магии, энергетики, целительства. Рекомендуется развитие духовных практик."
            });
        }
        
        // Финансовый канал
        if (eights >= 2) {
            programs.push({
                type: "power",
                title: "💰 Сильный финансовый канал",
                description: "Способность приносить большие деньги в род. Важно не гнобить родственников, иначе канал закроется."
            });
        }
        
        return programs;
    }
    
    /**
     * Предупреждения и рекомендации
     */
    getWarnings(counts, year) {
        const warnings = [];
        
        // Предупреждение для рожденных после 2020
        if (year >= 2020) {
            warnings.push({
                type: "info",
                text: "ℹ️ Для людей, рожденных после 2020 года, в матрицу автоматически добавлена цифра 9"
            });
        }
        
        // Предупреждение об отсутствии удачи
        if ((counts[7] || 0) === 0) {
            warnings.push({
                type: "critical",
                text: "🚨 КРИТИЧЕСКИ ВАЖНО! Необходима практика благодарения: 90 дней по 10-15 благодарений в день для восстановления канала удачи. Первые 3 дня - фанатично благодарить за ВСЁ!"
            });
        }
        
        // Предупреждение о сильном долге
        if ((counts[8] || 0) >= 4) {
            warnings.push({
                type: "warning",
                text: "⚠️ С детства необходимо прививать духовность. Высокий риск ухода в зависимости (алкоголь) без духовного развития. Важен выбор духовного пути."
            });
        }
        
        // Слабое здоровье
        if ((counts[4] || 0) === 0) {
            warnings.push({
                type: "warning",
                text: "⚠️ Слабое здоровье от рождения. Необходим здоровый образ жизни, профилактика, регулярные check-up."
            });
        }
        
        // Энергетический вампиризм
        if ((counts[2] || 0) === 0) {
            warnings.push({
                type: "info",
                text: "ℹ️ Энергетический вампиризм (без злого умысла). Рекомендуются практики для генерации собственной энергии: спорт, йога, цигун."
            });
        }
        
        return warnings;
    }
    
    /**
     * Форматирование матрицы для отображения
     */
    formatMatrixDisplay(matrixData) {
        const m = matrixData.matrix;
        
        const header = "┏━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━┓";
        const row1   = `┃${this.pad(m[1])}┃${this.pad(m[4])}┃${this.pad(m[7])}┃`;
        const sep    = "┣━━━━━━━━━╋━━━━━━━━━╋━━━━━━━━━┫";
        const row2   = `┃${this.pad(m[2])}┃${this.pad(m[5])}┃${this.pad(m[8])}┃`;
        const row3   = `┃${this.pad(m[3])}┃${this.pad(m[6])}┃${this.pad(m[9])}┃`;
        const footer = "┗━━━━━━━━━┻━━━━━━━━━┻━━━━━━━━━┛";
        
        return `${header}\n${row1}\n${sep}\n${row2}\n${sep}\n${row3}\n${footer}`;
    }
    
    pad(str) {
        const len = 9;
        const padding = len - str.length;
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return ' '.repeat(left) + str + ' '.repeat(right);
    }
}

// Создаем глобальный экземпляр калькулятора
const calculator = new MatrixCalculator();
