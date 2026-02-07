/**
 * Менеджер экспорта результатов
 * Поддерживает экспорт в PDF и JSON
 */

class ExportManager {
    constructor() {
        this.userData = null;
    }

    setUserData(data) {
        this.userData = data;
        console.log('Данные для экспорта установлены:', data);
    }

    /**
     * Экспорт в PDF
     */
    async exportToPDF() {
        if (!this.userData) {
            alert('Сначала рассчитайте матрицу!');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            let y = 20;
            const pageHeight = 280;
            const lineHeight = 7;

            // Функция для добавления новой страницы
            const checkPage = () => {
                if (y > pageHeight) {
                    doc.addPage();
                    y = 20;
                }
            };

            // Заголовок
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text('Нумерологический анализ', 105, y, { align: 'center' });
            y += 15;

            // Линия
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, y, 190, y);
            y += 10;

            // Личные данные
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(`Дата рождения: ${this.userData.birthDate}`, 20, y);
            y += lineHeight;
            doc.text(`Пол: ${this.userData.gender}`, 20, y);
            y += lineHeight + 5;

            // Матрица Пифагора
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text('Квадрат Пифагора', 20, y);
            y += 10;

            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            
            if (this.userData.matrix) {
                for (let i = 1; i <= 9; i++) {
                    checkPage();
                    const value = this.userData.matrix[i] || '—';
                    doc.text(`Ячейка ${i}: ${value}`, 20, y);
                    y += lineHeight;
                }
            }

            y += 5;

            // Дополнительные числа
            if (this.userData.additionalNumbers) {
                checkPage();
                doc.setFontSize(16);
                doc.setTextColor(40, 40, 40);
                doc.text('Дополнительные числа', 20, y);
                y += 10;

                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                
                const nums = this.userData.additionalNumbers;
                doc.text(`Первое доп. число: ${nums.first || '—'}`, 20, y); y += lineHeight;
                doc.text(`Второе доп. число: ${nums.second || '—'}`, 20, y); y += lineHeight;
                doc.text(`Третье доп. число: ${nums.third || '—'}`, 20, y); y += lineHeight;
                doc.text(`Четвертое доп. число: ${nums.fourth || '—'}`, 20, y); y += lineHeight;
                y += 5;
            }

            // Интерпретации
            if (this.userData.interpretations) {
                checkPage();
                doc.setFontSize(16);
                doc.setTextColor(40, 40, 40);
                doc.text('Интерпретации', 20, y);
                y += 10;

                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);

                // Ограничиваем длину текста
                const maxTextLength = 1000;
                let interpretText = JSON.stringify(this.userData.interpretations);
                if (interpretText.length > maxTextLength) {
                    interpretText = interpretText.substring(0, maxTextLength) + '...';
                }

                const lines = doc.splitTextToSize(interpretText, 170);
                lines.forEach(line => {
                    checkPage();
                    doc.text(line, 20, y);
                    y += 5;
                });
            }

            // Родовые программы
            if (this.userData.ancestral && this.userData.ancestral.programs) {
                doc.addPage();
                y = 20;
                
                doc.setFontSize(16);
                doc.setTextColor(40, 40, 40);
                doc.text('Родовые программы', 20, y);
                y += 10;

                doc.setFontSize(10);
                this.userData.ancestral.programs.forEach(program => {
                    checkPage();
                    doc.setTextColor(100, 40, 40);
                    doc.text(program.title || 'Программа', 20, y);
                    y += lineHeight;
                    
                    doc.setTextColor(80, 80, 80);
                    const descLines = doc.splitTextToSize(program.description || '', 170);
                    descLines.forEach(line => {
                        checkPage();
                        doc.text(line, 25, y);
                        y += 5;
                    });
                    y += 3;
                });
            }

            // Практики
            if (this.userData.practices && this.userData.practices.length > 0) {
                doc.addPage();
                y = 20;
                
                doc.setFontSize(16);
                doc.setTextColor(40, 40, 40);
                doc.text('Рекомендованные практики', 20, y);
                y += 10;

                doc.setFontSize(9);
                this.userData.practices.slice(0, 10).forEach(practice => {
                    checkPage();
                    doc.setTextColor(40, 100, 40);
                    doc.text(practice.name || practice.title || 'Практика', 20, y);
                    y += lineHeight;
                    
                    if (practice.description) {
                        doc.setTextColor(80, 80, 80);
                        const practiceLines = doc.splitTextToSize(practice.description, 170);
                        practiceLines.slice(0, 3).forEach(line => {
                            checkPage();
                            doc.text(line, 25, y);
                            y += 5;
                        });
                    }
                    y += 3;
                });
            }

            // Футер
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Страница ${i} из ${pageCount}`, 105, 290, { align: 'center' });
                doc.text('MysticNUM Complete © 2025', 20, 290);
            }

            // Сохранение
            const filename = `numerology_${this.userData.birthDate.replace(/\./g, '_')}.pdf`;
            doc.save(filename);
            
            alert('PDF успешно сохранен!');
        } catch (error) {
            console.error('Ошибка при создании PDF:', error);
            alert('Ошибка при создании PDF. Проверьте консоль.');
        }
    }

    /**
     * Экспорт в JSON
     */
    exportToJSON() {
        if (!this.userData) {
            alert('Сначала рассчитайте матрицу!');
            return;
        }

        try {
            const json = JSON.stringify(this.userData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `numerology_${this.userData.birthDate.replace(/\./g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('JSON успешно сохранен!');
        } catch (error) {
            console.error('Ошибка при экспорте JSON:', error);
            alert('Ошибка при экспорте JSON');
        }
    }
}

// Создание глобального экземпляра
const exportManager = new ExportManager();
