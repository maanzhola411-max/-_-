let currentUser = null;

window.addEventListener('DOMContentLoaded', function() {
    currentUser = requireAuth('teacher');
    if (!currentUser) return;
    renderHeader();
    renderGroups();
    updateGroupFilter();
    
    // Показываем поля для типа "quiz" по умолчанию
    updateTaskForm();

    const taskForm = document.getElementById('create-task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const grade = document.getElementById('task-grade').value;
            const type = document.getElementById('task-type').value;
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const points = parseInt(document.getElementById('task-points').value) || 50;
            
            const task = { type, title, description, points };
            
            try {
                if (type === 'quiz') {
                    const optionsText = document.getElementById('task-options').value;
                    const options = optionsText.split('\n').filter(o => o.trim());
                    const correct = parseInt(document.getElementById('task-correct').value) - 1;
                    const explanation = document.getElementById('task-explanation').value;
                    
                    if (correct < 0 || correct >= options.length) { 
                        alert('Неверный номер правильного ответа!'); 
                        return; 
                    }
                    task.options = options;
                    task.correct = correct;
                    task.explanation = explanation;
                    
                } else if (type === 'terminal') {
                    const stepsText = document.getElementById('task-terminal-steps').value;
                    task.steps = stepsText.split('\n').filter(s => s.trim()).map(s => {
                        const parts = s.split('|').map(p => p.trim());
                        return {
                            prompt: 'user@cyber:~$',
                            expected: parts[0].toLowerCase(),
                            success: parts[1] || 'Успех',
                            fail: parts[2] || 'Ошибка'
                        };
                    });
                    if (task.steps.length === 0) throw new Error('Заполните шаги терминала');
                    
                } else if (type === 'boss') {
                    task.bossName = document.getElementById('boss-name').value || 'Босс';
                    task.bossAvatar = document.getElementById('boss-avatar').value || '👾';
                    task.bossHp = parseInt(document.getElementById('boss-hp').value) || 100;
                    
                    const phasesText = document.getElementById('task-boss-phases').value;
                    task.phases = phasesText.split('\n').filter(p => p.trim()).map(p => {
                        const parts = p.split('|').map(s => s.trim());
                        const options = parts[1].split(',').map(o => o.trim());
                        return {
                            q: parts[0],
                            options: options,
                            correct: parseInt(parts[2]),
                            damageToBoss: parseInt(parts[3]) || 30
                        };
                    });
                    if (task.phases.length === 0) throw new Error('Заполните фазы босса');
                }
                
                saveCustomTask(grade, task);
                alert('✅ Задание успешно создано и добавлено в банк!');
                taskForm.reset();
                updateTaskForm(); // Сброс видимости полей
                
            } catch (err) {
                alert('❌ Ошибка в формате данных: ' + err.message + '\nПроверьте, что вы правильно расставили разделители |');
            }
        });
    }
});

function switchTab(tabName) {
    document.querySelectorAll('.class-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('[id^="tab-"]').forEach(tab => tab.style.display = 'none');
    if (event && event.target) event.target.classList.add('active');
    const target = document.getElementById('tab-' + tabName);
    if (target) target.style.display = 'block';
    if (tabName === 'groups') renderGroups();
    if (tabName === 'students') { updateGroupFilter(); renderStudentsList(); }
}

function showCreateGroup() { document.getElementById('create-group-form').style.display = 'block'; }
function hideCreateGroup() { document.getElementById('create-group-form').style.display = 'none'; }

function submitCreateGroup() {
    const name = document.getElementById('group-name').value.trim();
    const grade = document.getElementById('group-grade').value;
    if (!name) { alert('Введите название группы'); return; }
    try {
        const group = createGroup(currentUser.id, name, grade);
        alert('✅ Группа создана! Код: ' + group.code);
        document.getElementById('group-name').value = '';
        hideCreateGroup();
        renderGroups();
        updateGroupFilter();
    } catch (e) { console.error(e); alert('Ошибка'); }
}

function renderGroups() {
    const groups = getTeacherGroups(currentUser.id);
    const container = document.getElementById('groups-list');
    if (!container) return;
    if (!groups || groups.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 30px;">Нет групп. Создайте первую!</p>';
        return;
    }
    let html = '<div class="grid">';
    groups.forEach(group => {
        const students = getGroupStudents(group.id);
        html += `<div class="card" style="text-align: center;"><h3 style="color: #0ea5e9;">${group.classGrade} класс</h3><p>${group.name}</p><p style="margin-top: 10px; font-size: 14px; color: #64748b;">Учеников: ${students.length}<br>Код: <strong style="color: #0284c7; user-select: all;">${group.code}</strong></p></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function updateGroupFilter() {
    const groups = getTeacherGroups(currentUser.id);
    const select = document.getElementById('group-filter');
    if (!select) return;
    select.innerHTML = '<option value="">Все группы</option>';
    groups.forEach(group => { select.innerHTML += `<option value="${group.id}">${group.name} (${group.classGrade} класс)</option>`; });
}

function renderStudentsList() {
    const selectedGroup = document.getElementById('group-filter').value;
    let students = selectedGroup ? getGroupStudents(parseInt(selectedGroup)) : [];
    if (!selectedGroup) {
        const groups = getTeacherGroups(currentUser.id);
        students = [];
        groups.forEach(g => students = students.concat(getGroupStudents(g.id)));
    }
    const container = document.getElementById('students-list');
    if (!container) return;
    if (!students || students.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 30px;">Нет учеников</p>';
        return;
    }
    let html = '<table><thead><tr><th>Имя</th><th>Email</th><th>Класс</th><th>Выполнено</th><th>XP</th></tr></thead><tbody>';
    students.forEach(s => {
        const progress = s.progress || {};
        const completed = Object.values(progress).filter(p => p.completed).length;
        const xp = s.xp || 0;
        html += `<tr><td>${s.name}</td><td>${s.email}</td><td>${s.classGrade}</td><td>${completed}</td><td><strong>${xp}</strong></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// === НОВАЯ ФУНКЦИЯ: Управление видимостью полей формы ===
function updateTaskForm() {
    const type = document.getElementById('task-type').value;
    
    // Скрываем все специфичные поля
    document.getElementById('fields-quiz').style.display = 'none';
    document.getElementById('fields-terminal').style.display = 'none';
    document.getElementById('fields-boss').style.display = 'none';
    
    // Показываем нужные
    if (type === 'quiz') {
        document.getElementById('fields-quiz').style.display = 'block';
    } else if (type === 'terminal') {
        document.getElementById('fields-terminal').style.display = 'block';
    } else if (type === 'boss') {
        document.getElementById('fields-boss').style.display = 'block';
    }
}