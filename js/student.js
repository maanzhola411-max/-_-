let currentUser = null;
let currentTask = null;

window.addEventListener('DOMContentLoaded', function() {
    currentUser = requireAuth('student');
    if (!currentUser) return;
    
    console.log('👤 Текущий пользователь:', currentUser);
    console.log('📚 Класс ученика:', currentUser.classGrade, '(тип:', typeof currentUser.classGrade, ')');
    
    renderHeader();
    renderStudentDashboard();
});

function renderStudentDashboard() {
    const gradeDisplay = document.getElementById('grade-display');
    if (gradeDisplay) gradeDisplay.textContent = currentUser.classGrade + ' класс';
    
    const tasks = getTasksForGrade(currentUser.classGrade);
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';

    // Карточка статистики
    const xp = currentUser.xp || 0;
    const balance = currentUser.balance || 0;
    const completed = Object.values(currentUser.progress || {}).filter(p => p.completed).length;
    
    const statsCard = document.createElement('div');
    statsCard.className = 'card fade-in';
    statsCard.style.cssText = 'background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; margin-bottom: 25px;';
    statsCard.innerHTML = `
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;">
            <div style="text-align: center;">
                <div style="font-size: 36px; font-weight: 700;">${xp}</div>
                <div style="font-size: 14px; opacity: 0.9;">⭐ Опыт (XP)</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 36px; font-weight: 700;">${balance}</div>
                <div style="font-size: 14px; opacity: 0.9;">💰 Баллы</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 36px; font-weight: 700;">${completed}</div>
                <div style="font-size: 14px; opacity: 0.9;">✅ Выполнено</div>
            </div>
        </div>
    `;
    list.appendChild(statsCard);

    // Если заданий нет
    if (tasks.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'card fade-in';
        emptyCard.style.cssText = 'text-align: center; padding: 60px 20px;';
        emptyCard.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">📭</div>
            <h3 style="color: #64748b; margin-bottom: 10px;">Задания пока недоступны</h3>
            <p style="color: #94a3b8;">Твой класс: <strong>${currentUser.classGrade}</strong></p>
            <p style="color: #94a3b8; margin-top: 10px;">Попроси учителя создать задания или проверь позже!</p>
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 10px; color: #92400e; font-size: 14px;">
                💡 <strong>Диагностика:</strong> Открой консоль (F12) и посмотри, что написано в логах.
            </div>
        `;
        list.appendChild(emptyCard);
        return;
    }

    // Список заданий
    tasks.forEach((task, index) => {
        const progress = currentUser.progress?.[task.id] || {};
        const isDone = progress.completed;
        const el = document.createElement('div');
        el.className = 'task-item fade-in' + (isDone ? ' completed' : '');
        el.style.animationDelay = (index * 0.1) + 's';
        el.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: #0284c7; margin-bottom: 5px;">${task.title}</h3>
                    <p style="color: #64748b; font-size: 14px;">${task.description}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${isDone ? '#10b981' : '#f59e0b'};">${isDone ? '✓ Пройдено' : '○ Доступно'}</div>
                    <div style="font-size: 14px; color: #f59e0b;">${task.points} XP</div>
                </div>
            </div>
            <button class="btn" style="margin-top: 15px; width: 100%;" onclick="openTask('${task.id}')">${isDone ? ' Пройти снова' : '🚀 Начать миссию'}</button>
        `;
        list.appendChild(el);
    });
}

function openTask(taskId) {
    const tasks = getTasksForGrade(currentUser.classGrade);
    currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) {
        alert('Задание не найдено!');
        return;
    }
    const modal = document.getElementById('task-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;
    modal.classList.add('active');

    if (currentTask.type === 'hotspot') renderHotspotTask(content);
    else if (currentTask.type === 'terminal') renderTerminalTask(content);
    else if (currentTask.type === 'boss') renderBossTask(content);
    else renderDefaultQuiz(content);
}

function renderHotspotTask(content) {
    let found = 0;
    content.innerHTML = `
        <h2>${currentTask.title}</h2>
        <p style="color: #64748b; margin-bottom: 20px;">Найдено: <span id="hotspot-count" style="font-weight: bold; color: #0ea5e9;">0</span> / ${currentTask.correctCount}</p>
        <div style="position: relative;">${currentTask.imageHtml}</div>
        <div id="hotspot-feedback" style="margin-top: 20px;"></div>
        <button class="btn btn-secondary" style="margin-top: 20px; width: 100%;" onclick="closeModal()">Закрыть</button>
    `;
    
    // ИСПРАВЛЕНО: ищем .hotspot-target вместо .hotspot
    document.querySelectorAll('.hotspot-target').forEach(spot => {
        spot.onclick = function(e) {
            e.stopPropagation(); // Предотвращаем случайные клики
            if (this.classList.contains('found')) return;
            
            this.classList.add('found');
            found++;
            document.getElementById('hotspot-count').textContent = found;
            
            if (found === currentTask.correctCount) {
                document.getElementById('hotspot-feedback').innerHTML = `<div class="alert alert-success animate-pop">🎉 Миссия выполнена! ${currentTask.explanation}</div>`;
                saveProgress(true, currentTask.points);
                spawnConfetti();
            }
        };
    });
}

function renderTerminalTask(content) {
    let step = 0;
    content.innerHTML = `
        <h2>${currentTask.title}</h2>
        <p style="color: #64748b; margin-bottom: 15px;">Введи команды по порядку. Нажми Enter после каждой.</p>
        <div class="terminal-window" style="display: flex; flex-direction: column; justify-content: flex-end;">
            <div id="terminal-output"></div>
            <div class="terminal-line">
                <span class="terminal-prompt" id="term-prompt">${currentTask.steps[0].prompt} </span>
                <input type="text" class="terminal-input" id="term-input" autocomplete="off" autofocus>
            </div>
        </div>
        <button class="btn btn-secondary" style="margin-top: 20px; width: 100%;" onclick="closeModal()">Закрыть</button>
    `;
    const input = document.getElementById('term-input');
    input.focus();
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            const output = document.getElementById('terminal-output');
            const currentStepData = currentTask.steps[step];
            output.innerHTML += `<div class="terminal-line"><span class="terminal-prompt">${currentStepData.prompt} </span>${val}</div>`;
            
            if (val === currentStepData.expected) {
                output.innerHTML += `<div class="terminal-line" style="color: #00ff00;">✓ ${currentStepData.success}</div>`;
                step++;
                if (step >= currentTask.steps.length) {
                    output.innerHTML += `<div class="terminal-line" style="color: #fbbf24; margin-top: 10px; font-weight: bold;">[УСПЕХ] Система взломана. +${currentTask.points} XP</div>`;
                    input.disabled = true;
                    saveProgress(true, currentTask.points);
                    spawnConfetti();
                } else {
                    document.getElementById('term-prompt').textContent = currentTask.steps[step].prompt + ' ';
                }
            } else {
                output.innerHTML += `<div class="terminal-line" style="color: #ef4444;">✗ ${currentStepData.fail}</div>`;
                document.querySelector('.terminal-window').classList.add('animate-shake');
                setTimeout(() => document.querySelector('.terminal-window').classList.remove('animate-shake'), 500);
            }
            input.value = '';
            const win = document.querySelector('.terminal-window');
            win.scrollTop = win.scrollHeight;
        }
    });
}

function renderBossTask(content) {
    let phase = 0;
    let bossHp = currentTask.bossHp;
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 80px; display: inline-block;" id="boss-avatar" class="animate-glow">${currentTask.bossAvatar}</div>
            <h2 style="color: #ef4444; margin-top: 10px;">${currentTask.bossName}</h2>
            <div class="hp-bar-container">
                <div class="hp-bar-fill" id="boss-hp-bar" style="width: 100%;"></div>
                <div class="hp-bar-text" id="boss-hp-text">${bossHp} / ${currentTask.bossHp} HP</div>
            </div>
        </div>
        <div id="boss-question-area"></div>
    `;
    
    function showPhase() {
        if (phase >= currentTask.phases.length) {
            document.getElementById('boss-question-area').innerHTML = `
                <div class="alert alert-success animate-pop" style="text-align: center;"> БОСС ПОВЕРЖЕН! +${currentTask.points} XP</div>
                <button class="btn" style="width: 100%; margin-top: 15px;" onclick="closeModal()">Забрать награду</button>
            `;
            saveProgress(true, currentTask.points);
            spawnConfetti();
            return;
        }
        const p = currentTask.phases[phase];
        document.getElementById('boss-question-area').innerHTML = `
            <div class="card" style="background: #f8fafc; border: 2px solid #e2e8f0;">
                <p style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">${p.q}</p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${p.options.map((opt, i) => `<button class="option-btn" onclick="bossAttack(${i}, ${p.correct}, ${p.damageToBoss})">${opt}</button>`).join('')}
                </div>
            </div>
        `;
    }
    
    window.bossAttack = function(selected, correct, damage) {
        const btns = document.querySelectorAll('#boss-question-area .option-btn');
        btns.forEach(b => b.disabled = true);
        if (selected === correct) {
            btns[selected].classList.add('correct');
            bossHp -= damage;
            if (bossHp < 0) bossHp = 0;
            document.getElementById('boss-hp-bar').style.width = (bossHp / currentTask.bossHp * 100) + '%';
            document.getElementById('boss-hp-text').textContent = bossHp + ' / ' + currentTask.bossHp + ' HP';
            document.getElementById('boss-avatar').classList.add('animate-shake');
            setTimeout(() => document.getElementById('boss-avatar').classList.remove('animate-shake'), 500);
            setTimeout(() => { phase++; showPhase(); }, 1000);
        } else {
            btns[selected].classList.add('wrong');
            btns[correct].classList.add('correct');
            setTimeout(() => { alert('Мимо! Босс контратакует. Попробуй снова.'); showPhase(); }, 800);
        }
    };
    showPhase();
}

function renderDefaultQuiz(content) {
    content.innerHTML = `
        <h2>${currentTask.title}</h2>
        <p style="margin: 15px 0; font-size: 16px;">${currentTask.description}</p>
        <div id="quiz-options" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
            ${currentTask.options.map((opt, i) => `<button class="option-btn" onclick="checkQuiz(${i}, ${currentTask.correct})">${opt}</button>`).join('')}
        </div>
        <div id="quiz-feedback" style="margin-top: 20px;"></div>
        <button class="btn btn-secondary" style="margin-top: 20px; width: 100%;" onclick="closeModal()">Закрыть</button>
    `;
}

window.checkQuiz = function(selected, correct) {
    const btns = document.querySelectorAll('#quiz-options .option-btn');
    btns.forEach(b => b.disabled = true);
    if (selected === correct) {
        btns[selected].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = `<div class="alert alert-success animate-pop">✓ Верно! +${currentTask.points} XP<br><small>${currentTask.explanation || ''}</small></div>`;
        saveProgress(true, currentTask.points);
        spawnConfetti();
    } else {
        btns[selected].classList.add('wrong');
        btns[correct].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = `<div class="alert alert-error animate-shake">✗ Ошибка. Правильный ответ подсвечен.</div>`;
    }
};

function saveProgress(isCorrect, points) {
    currentUser.progress = currentUser.progress || {};
    currentUser.progress[currentTask.id] = { completed: true, correct: isCorrect, score: points };
    currentUser.xp = (currentUser.xp || 0) + points;
    currentUser.balance = (currentUser.balance || 0) + points;
    updateCurrentUser({ progress: currentUser.progress, xp: currentUser.xp, balance: currentUser.balance });
}

function closeModal() {
    document.getElementById('task-modal').classList.remove('active');
    renderStudentDashboard();
}

function spawnConfetti() {
    for (let i = 0; i < 50; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ea5e9', '#f59e0b'][Math.floor(Math.random() * 7)];
        conf.style.animationDuration = (Math.random() * 2 + 1) + 's';
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 3000);
    }
}