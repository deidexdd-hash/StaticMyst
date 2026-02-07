/**
 * Менеджер хранилища (LocalStorage)
 * Сохраняет практики, историю расчетов и настройки
 */

class StorageManager {
    constructor() {
        this.storageKey = 'mysticnum_data';
        this.data = this.loadData();
    }

    /**
     * Загрузка данных из LocalStorage
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
        
        return {
            userId: this.generateUserId(),
            practicesHistory: [],
            activePractices: [],
            completedPractices: [],
            calculationHistory: [],
            settings: {
                theme: 'dark',
                notifications: true
            }
        };
    }

    /**
     * Сохранение данных в LocalStorage
     */
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            return false;
        }
    }

    /**
     * Генерация уникального ID пользователя
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Сохранение практики
     */
    savePractice(practice) {
        const practiceData = {
            ...practice,
            id: practice.id || `practice_${Date.now()}`,
            savedAt: new Date().toISOString(),
            status: 'active'
        };

        // Проверка на дубликаты
        const exists = this.data.activePractices.find(p => 
            p.title === practiceData.title || p.id === practiceData.id
        );

        if (!exists) {
            this.data.activePractices.push(practiceData);
            this.saveData();
            return true;
        }
        
        return false;
    }

    /**
     * Получение активных практик
     */
    getActivePractices() {
        return this.data.activePractices.filter(p => p.status === 'active');
    }

    /**
     * Завершение практики
     */
    completePractice(practiceId, notes = '') {
        const practiceIndex = this.data.activePractices.findIndex(p => p.id === practiceId);
        
        if (practiceIndex !== -1) {
            const practice = this.data.activePractices[practiceIndex];
            practice.status = 'completed';
            practice.completedAt = new Date().toISOString();
            practice.notes = notes;

            // Перемещаем в завершенные
            this.data.completedPractices.push(practice);
            this.data.activePractices.splice(practiceIndex, 1);

            // Добавляем в историю
            this.data.practicesHistory.push({
                practiceId: practice.id,
                title: practice.title,
                completedAt: practice.completedAt,
                notes: notes
            });

            this.saveData();
            return true;
        }
        
        return false;
    }

    /**
     * Удаление практики
     */
    deletePractice(practiceId) {
        this.data.activePractices = this.data.activePractices.filter(p => p.id !== practiceId);
        this.saveData();
    }

    /**
     * Сохранение результата расчета
     */
    saveCalculation(calculationData) {
        const calculation = {
            ...calculationData,
            id: `calc_${Date.now()}`,
            timestamp: new Date().toISOString()
        };

        this.data.calculationHistory.push(calculation);
        
        // Ограничиваем историю 50 записями
        if (this.data.calculationHistory.length > 50) {
            this.data.calculationHistory = this.data.calculationHistory.slice(-50);
        }

        this.saveData();
        return calculation.id;
    }

    /**
     * Получение истории расчетов
     */
    getCalculationHistory() {
        return this.data.calculationHistory.slice().reverse();
    }

    /**
     * Поиск расчета по дате рождения
     */
    findCalculationByDate(birthDate) {
        return this.data.calculationHistory.find(c => c.birthDate === birthDate);
    }

    /**
     * Очистка всех данных
     */
    clearAll() {
        if (confirm('Вы уверены что хотите удалить все сохраненные данные?')) {
            localStorage.removeItem(this.storageKey);
            this.data = this.loadData();
            return true;
        }
        return false;
    }

    /**
     * Экспорт всех данных
     */
    exportAllData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mysticnum_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Импорт данных
     */
    importData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                if (confirm('Импортировать данные? Текущие данные будут заменены.')) {
                    this.data = imported;
                    this.saveData();
                    alert('Данные успешно импортированы!');
                    location.reload();
                }
            } catch (error) {
                alert('Ошибка при импорте данных');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    }

    /**
     * Получение статистики
     */
    getStats() {
        return {
            totalPractices: this.data.activePractices.length,
            completedPractices: this.data.completedPractices.length,
            totalCalculations: this.data.calculationHistory.length,
            practicesThisMonth: this.data.practicesHistory.filter(p => {
                const date = new Date(p.completedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
            }).length
        };
    }
}

// Создание глобального экземпляра
const storageManager = new StorageManager();
