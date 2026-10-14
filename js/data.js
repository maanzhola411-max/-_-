// === СИСТЕМА ГРУПП ===
const GROUPS_KEY = 'cybertrainer_groups';

function createGroup(teacherId, groupName, classGrade) {
  const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
  const groupCode = 'GR' + Math.random().toString(36).substr(2, 6).toUpperCase();
  const group = { id: Date.now(), code: groupCode, name: groupName, classGrade: String(classGrade), teacherId, createdAt: new Date().toISOString() };
  groups.push(group);
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  return group;
}

function getTeacherGroups(teacherId) {
  return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]').filter(g => g.teacherId === teacherId);
}

function getGroupStudents(groupId) {
  return JSON.parse(localStorage.getItem('cybertrainer_users') || '[]').filter(u => u.role === 'student' && u.groupId === groupId);
}

function saveCustomTask(grade, task) {
  const saved = JSON.parse(localStorage.getItem('custom_tasks') || '{}');
  const key = String(grade);
  if (!saved[key]) saved[key] = [];
  task.id = 'custom_' + Date.now();
  saved[key].push(task);
  localStorage.setItem('custom_tasks', JSON.stringify(saved));
}

// === БАНК ЗАДАНИЙ ===
const DEFAULT_TASKS = {
  5: [
   {
      id: 't5_hotspot1', 
      type: 'hotspot', 
      title: '🔍 Найди 3 признака фишинга',
      description: 'Кликай на подозрительные места в письме (подсвеченные пунктиром)!', 
      points: 50,
      imageHtml: `
        <div class="phishing-mockup" style="padding: 20px; position: relative;">
          <div class="phishing-header">
            <div class="phishing-avatar">🏦</div>
            <div>
              <div style="font-weight: bold;">Служба безопасности <span class="hotspot-target" data-id="1" title="Подозрительный домен: настоящий Сбер использует sberbank.ru">Sber-Verify.ru</span></div>
              <div style="font-size: 12px; color: #64748b;">кому: вам</div>
            </div>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Здравствуйте! Ваша карта <b>заблокирована</b>.</p>
            <p>Срочно перейдите по ссылке: <span class="hotspot-target" data-id="2" title="Подозрительная ссылка: не нажимайте на неё!">http://sber-verify.ru/unblock</span></p>
            <p>Введите номер карты и <span class="hotspot-target" data-id="3" title="Запрос секретных данных: банк никогда не просит CVV в письмах!"><b>CVV-код</b></span> для разблокировки.</p>
            <button style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 10px; cursor: not-allowed; opacity: 0.7;">РАЗБЛОКИРОВАТЬ СЕЙЧАС</button>
          </div>
        </div>
      `,
      correctCount: 3,
      explanation: 'Отлично! Фишинг выдают: странный домен, запрос секретных данных и давление по времени.'
    },
    {
      id: 't5_quiz1', type: 'quiz', title: '🔐 Надежный пароль',
      description: 'Какой из этих паролей самый надежный?', points: 30,
      options: ['123456', 'qwerty', 'K0t_L3tit!2026', 'password'], correct: 2,
      explanation: 'Надежный пароль содержит буквы разного регистра, цифры и спецсимволы.'
    },
    {
      id: 't5_quiz2', type: 'quiz', title: ' Что такое фишинг?',
      description: 'Тебе пришло письмо: "Поздравляем! Вы выиграли iPhone. Перейдите по ссылке". Что это?', points: 30,
      options: ['Честное письмо', 'Фишинг (мошенничество)', 'Обычная реклама'], correct: 1,
      explanation: 'Это классический фишинг! Мошенники обещают халяву и просят перейти по подозрительной ссылке.'
    },
    {
      id: 't5_terminal1', type: 'terminal', title: '💻 Хакерский терминал: Базовый',
      description: 'Взломай систему, введя правильные команды по порядку.', points: 60,
      steps: [
        { prompt: 'user@cyber:~$', expected: 'scan', success: 'Сканирование... Найдена уязвимость порта 80.', fail: 'Команда не распознана. Попробуй: scan' },
        { prompt: 'user@cyber:~$', expected: 'exploit', success: 'Эксплойт применен! Доступ получен.', fail: 'Ошибка. Нужна команда: exploit' },
        { prompt: 'user@cyber:~$', expected: 'exit', success: 'Сеанс завершен. Миссия выполнена!', fail: 'Для выхода введи: exit' }
      ]
    },
    {
      id: 't5_quiz3', type: 'quiz', title: '🛡️ Безопасное поведение',
      description: 'Друг просит в соцсети прислать фото твоего паспорта "просто посмотреть". Что сделаешь?', points: 40,
      options: ['Пришлю, это же друг', 'Откажу и объясню, что это личные данные', 'Пришлю, но замажу номер'], correct: 1,
      explanation: 'Паспортные данные нельзя передавать никому, даже друзьям.'
    }
  ],
  6: [
    {
      id: 't6_terminal2', type: 'terminal', title: '💻 Хакерский терминал: Продвинутый',
      description: 'Взломай систему, введя правильные команды.', points: 70,
      steps: [
        { prompt: 'hacker@darknet:~$', expected: 'nmap', success: 'Запуск сканера портов... Обнаружены открытые порты: 22, 80, 443', fail: 'Нужна команда: nmap' },
        { prompt: 'hacker@darknet:~$', expected: 'sqlmap', success: 'SQL-инъекция найдена! Извлекаем данные...', fail: 'Ошибка. Команда: sqlmap' },
        { prompt: 'hacker@darknet:~$', expected: 'crack', success: 'Пароли взломаны! Доступ к базе данных получен.', fail: 'Введи: crack' },
        { prompt: 'hacker@darknet:~$', expected: 'logout', success: 'Соединение разорвано. Миссия выполнена!', fail: 'Для выхода: logout' }
      ]
    },
    {
      id: 't6_quiz1', type: 'quiz', title: '📶 Публичный Wi-Fi',
      description: 'Ты в кафе. Видишь две сети: "Cafe_Free" и "Cafe_Free_Official". Какую выбрать?', points: 40,
      options: ['Любую', 'Cafe_Free_Official, а лучше спросить пароль у официанта', 'Cafe_Free, она без пароля'], correct: 1,
      explanation: 'Мошенники часто создают сети с похожими названиями (Evil Twin).'
    },
    {
      id: 't6_quiz2', type: 'quiz', title: '🔒 Двухфакторная аутентификация',
      description: 'Зачем нужна двухфакторная аутентификация (2FA)?', points: 40,
      options: ['Чтобы быстрее входить', 'Чтобы защитить аккаунт, даже если пароль украден', 'Для красоты'], correct: 1,
      explanation: '2FA добавляет второй слой защиты (СМС или код из приложения).'
    },
    {
      id: 't6_hotspot1', type: 'hotspot', title: '🔍 Найди 4 признака фишинга',
      description: 'Найди все подозрительные элементы в этом письме!', points: 60,
      imageHtml: `
        <div class="phishing-mockup" style="padding: 20px;">
          <div class="phishing-header">
            <div class="phishing-avatar"></div>
            <div><div style="font-weight: bold;">Apple Support &lt;support@apple-verify.com&gt;</div><div style="font-size: 12px; color: #64748b;">Тема: Ваш Apple ID заблокирован</div></div>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Уважаемый пользователь!</p>
            <p>Ваш Apple ID был заблокирован из-за подозрительной активности.</p>
            <p>Для разблокировки перейдите: <span style="color: #0ea5e9; text-decoration: underline;">http://apple-id-unblock.ru/verify</span></p>
            <p>Введите ваш Apple ID и пароль в течение 24 часов.</p>
            <button style="background: #0071e3; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold;">Разблокировать Apple ID</button>
          </div>
          <div class="hotspot" style="top: 12%; left: 35%; width: 40%; height: 12%;" data-id="1" title="Подозрительный email"></div>
          <div class="hotspot" style="top: 22%; left: 10%; width: 50%; height: 12%;" data-id="2" title="Подозрительная тема"></div>
          <div class="hotspot" style="top: 45%; left: 10%; width: 70%; height: 12%;" data-id="3" title="Подозрительная ссылка"></div>
          <div class="hotspot" style="top: 70%; left: 10%; width: 40%; height: 12%;" data-id="4" title="Срочность"></div>
        </div>
      `,
      correctCount: 4,
      explanation: 'Отлично! Признаки: странный email, тема с угрозами, подозрительная ссылка, давление по времени.'
    },
    {
      id: 't6_quiz3', type: 'quiz', title: ' Кибербуллинг',
      description: 'Ты видишь, как в чате класса травят одноклассника. Что делать?', points: 50,
      options: ['Присоединиться', 'Игнорировать', 'Сообщить учителю и поддержать жертву', 'Удалить чат'], correct: 2,
      explanation: 'Бездействие — это согласие. Важно сообщить взрослым.'
    }
  ],
  7: [
    {
      id: 't7_boss1', type: 'boss', title: '👾 БОСС: Dr. Virus',
      description: 'Победи его, отвечая на вопросы!', points: 100,
      bossName: 'Dr. Virus', bossAvatar: '👾', bossHp: 100,
      phases: [
        { q: 'Он шлет письмо с вложением "Приз.exe". Твои действия?', options: ['Открыть', 'Удалить и заблокировать', 'Переслать другу'], correct: 1, damageToBoss: 40 },
        { q: 'Он требует пароль от соцсети "для проверки".', options: ['Дать пароль', 'Никогда не давать', 'Спросить зачем'], correct: 1, damageToBoss: 60 }
      ]
    },
    {
      id: 't7_quiz1', type: 'quiz', title: '👣 Цифровой след',
      description: 'Что из этого НЕ останется в твоем цифровом следе?', points: 50,
      options: ['Лайк под фотографией', 'Поисковый запрос', 'Сообщение в мессенджере со сквозным шифрованием', 'Комментарий в ВК'], correct: 2,
      explanation: 'Сообщения со сквозным шифрованием не хранятся на серверах.'
    },
    {
      id: 't7_quiz2', type: 'quiz', title: '🔐 Двухфакторная аутентификация',
      description: 'Какой способ 2FA самый надежный?', points: 50,
      options: ['СМС-код', 'Код из приложения (Google Authenticator)', 'Email', 'Контрольный вопрос'], correct: 1,
      explanation: 'Приложения-аутентификаторы надежнее СМС.'
    },
    {
      id: 't7_terminal1', type: 'terminal', title: '💻 Хакерский терминал: Эксперт',
      description: 'Взломай защищенную систему!', points: 80,
      steps: [
        { prompt: 'root@kali:~#', expected: 'nmap -sv 192.168.1.1', success: 'Сканирование целей... Обнаружены сервисы: SSH (22), HTTP (80)', fail: 'Команда: nmap -sv 192.168.1.1' },
        { prompt: 'root@kali:~#', expected: 'sqlmap', success: 'SQL-инъекция найдена! Извлекаем базу данных...', fail: 'Ошибка. Команда: sqlmap' },
        { prompt: 'root@kali:~#', expected: 'hydra', success: 'Брутфорс запущен... Пароль найден: admin123', fail: 'Введи: hydra' },
        { prompt: 'root@kali:~#', expected: 'exit', success: 'Сеанс завершен. Все данные извлечены!', fail: 'Для выхода: exit' }
      ]
    },
    {
      id: 't7_quiz3', type: 'quiz', title: ' Социальная инженерия',
      description: 'Что используют мошенники в социальной инженерии?', points: 60,
      options: ['Создание чувства срочности', 'Прямой технический взлом', 'Шифрование данных', 'Резервное копирование'], correct: 0,
      explanation: 'Социальная инженерия основана на манипуляции людьми.'
    }
  ],
  8: [
    {
      id: 't8_quiz1', type: 'quiz', title: '📞 Социальная инженерия',
      description: 'Звонит "сотрудник банка" и просит код из СМС. Твои действия?', points: 70,
      options: ['Назвать код', 'Сбросить и позвонить в банк по официальному номеру', 'Послать его'], correct: 1,
      explanation: 'Сотрудники банка НИКОГДА не просят коды из СМС.'
    },
    {
      id: 't8_quiz2', type: 'quiz', title: '🦠 Признаки взлома',
      description: 'Какие признаки указывают на взлом аккаунта?', points: 70,
      options: ['Незнакомые устройства в истории входов', 'Медленная работа интернета', 'Много рекламы', 'Обновление системы'], correct: 0,
      explanation: 'Признаки взлома: незнакомые устройства, изменения без твоего участия.'
    },
    {
      id: 't8_boss1', type: 'boss', title: ' ФИНАЛЬНЫЙ БОСС: Dr. Virus',
      description: 'Спаси мир от киберугроз!', points: 150,
      bossName: 'Dr. Virus', bossAvatar: '👾', bossHp: 150,
      phases: [
        { q: 'Он шлет фишинговое письмо! Твой ход:', options: ['Открыть', 'Удалить и заблокировать', 'Переслать другу'], correct: 1, damageToBoss: 50 },
        { q: 'Он пытается угадать твой пароль!', options: ['Использовать 123456', 'Включить 2FA и сложный пароль', 'Сдаться'], correct: 1, damageToBoss: 50 },
        { q: 'Финальная атака! Он шлет вирус через USB.', options: ['Вставить USB', 'Проверить антивирусом и удалить', 'Отдать другу'], correct: 1, damageToBoss: 50 }
      ]
    },
    {
      id: 't8_quiz3', type: 'quiz', title: ' Безопасные привычки',
      description: 'Какие привычки помогают поддерживать кибербезопасность?', points: 60,
      options: ['Регулярное обновление программ', 'Использование одного пароля везде', 'Отключение антивируса', 'Игнорирование обновлений'], correct: 0,
      explanation: 'Регулярные обновления — основа цифровой гигиены.'
    },
    {
      id: 't8_terminal1', type: 'terminal', title: '💻 Хакерский терминал: Мастер',
      description: 'Взломай корпоративную сеть!', points: 100,
      steps: [
        { prompt: 'pentester@corp:~$', expected: 'recon', success: 'Разведка завершена. Найдено 5 уязвимостей.', fail: 'Команда: recon' },
        { prompt: 'pentester@corp:~$', expected: 'phishing', success: 'Фишинговая кампания запущена.', fail: 'Ошибка. Команда: phishing' },
        { prompt: 'pentester@corp:~$', expected: 'lateral', success: 'Боковое перемещение выполнено.', fail: 'Введи: lateral' },
        { prompt: 'pentester@corp:~$', expected: 'exfil', success: 'Данные извлечены. Миссия выполнена!', fail: 'Команда: exfil' },
        { prompt: 'pentester@corp:~$', expected: 'cleanup', success: 'Следы удалены. Отчет сформирован.', fail: 'Для завершения: cleanup' }
      ]
    }
  ],
  9: [
    {
      id: 't9_quiz1', type: 'quiz', title: ' Утечки данных',
      description: 'На сайте haveibeenpwned.com ты узнал, что твой email был в утечке. Что делать?', points: 80,
      options: ['Удалить почту', 'Сменить пароль на этом сайте и везде, где он использовался', 'Написать в полицию'], correct: 1,
      explanation: 'Если пароль утек, его нужно срочно сменить!'
    },
    {
      id: 't9_quiz2', type: 'quiz', title: '🔐 Шифрование',
      description: 'Какой признак того, что соединение с сайтом зашифровано?', points: 80,
      options: ['Красивый дизайн', 'Замочек в адресной строке и протокол HTTPS', 'Наличие рекламы'], correct: 1,
      explanation: 'HTTPS и значок замка означают шифрование данных.'
    },
    {
      id: 't9_quiz3', type: 'quiz', title: '⛓️ Блокчейн',
      description: 'Что делает блокчейн безопасным?', points: 90,
      options: ['Централизованное управление', 'Распределенная сеть и криптография', 'Анонимность всех пользователей'], correct: 1,
      explanation: 'Блокчейн безопасен благодаря распределенной сети и криптографии.'
    },
    {
      id: 't9_boss1', type: 'boss', title: '🤖 УЛЬТРА-БОСС: AI Hacker',
      description: 'Победи искусственный интеллект-хакера!', points: 200,
      bossName: 'AI Hacker', bossAvatar: '🤖', bossHp: 200,
      phases: [
        { q: 'AI использует deepfake для фишинга. Как распознать?', options: ['Проверить источник', 'Доверять видео', 'Игнорировать'], correct: 0, damageToBoss: 70 },
        { q: 'AI генерирует уникальные вредоносные программы. Защита?', options: ['Старый антивирус', 'Поведенческий анализ + AI-защита', 'Ничего'], correct: 1, damageToBoss: 70 },
        { q: 'AI взламывает пароли за секунды. Решение?', options: ['Простые пароли', 'Биометрия + 2FA + длинные пароли', 'Сдаться'], correct: 1, damageToBoss: 60 }
      ]
    },
    {
      id: 't9_terminal1', type: 'terminal', title: '💻 Хакерский терминал: Легенда',
      description: 'Взломай защищенную корпоративную сеть с AI-защитой!', points: 150,
      steps: [
        { prompt: 'elite@blackhat:~#', expected: 'recon', success: 'AI-разведка запущена. Анализ паттернов защиты...', fail: 'Команда: recon' },
        { prompt: 'elite@blackhat:~#', expected: 'zero-day', success: 'Zero-day уязвимость найдена!', fail: 'Ошибка. Команда: zero-day' },
        { prompt: 'elite@blackhat:~#', expected: 'crack', success: 'Взлом шифрования... Ключи получены.', fail: 'Введи: crack' },
        { prompt: 'elite@blackhat:~#', expected: 'bypass', success: 'AI-защита обойдена.', fail: 'Команда: bypass' },
        { prompt: 'elite@blackhat:~#', expected: 'root', success: 'ROOT-доступ получен!', fail: 'Для финала: root' },
        { prompt: 'elite@blackhat:~#', expected: 'ghost', success: 'Режим "Призрак" активирован. Миссия выполнена!', fail: 'Завершение: ghost' }
      ]
    }
  ]
};

// === ГЛАВНАЯ ФУНКЦИЯ С ИСПРАВЛЕНИЕМ ТИПОВ ===
function getTasksForGrade(grade) {
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: приводим к числу
  const gradeNum = parseInt(grade);
  console.log(' Ищем задания для класса:', gradeNum, '(тип:', typeof gradeNum, ')');
  
  const saved = JSON.parse(localStorage.getItem('custom_tasks') || '{}');
  const defaultTasks = DEFAULT_TASKS[gradeNum] || [];
  const customTasks = saved[String(gradeNum)] || saved[gradeNum] || [];
  
  console.log('✅ Найдено заданий:', defaultTasks.length + customTasks.length);
  
  return [...defaultTasks, ...customTasks];
}