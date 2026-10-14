const AUTH_KEY = 'cybertrainer_users';
const SESSION_KEY = 'cybertrainer_session';

function getUsers() { return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]'); }
function saveUsers(users) { localStorage.setItem(AUTH_KEY, JSON.stringify(users)); }

function register(name, email, password, role, classGrade, groupCode) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { success: false, message: 'Пользователь уже существует' };
  
  let groupId = null;
  if (role === 'student' && groupCode) {
    const groups = JSON.parse(localStorage.getItem('cybertrainer_groups') || '[]');
    const group = groups.find(g => g.code === groupCode.toUpperCase());
    if (!group) return { success: false, message: 'Группа с таким кодом не найдена' };
    if (group.classGrade !== classGrade) return { success: false, message: 'Эта группа не для ' + classGrade + ' класса' };
    groupId = group.id;
  }
  
  const user = {
    id: Date.now(), name, email, password, role,
    classGrade: classGrade || null, groupId,
    progress: {}, xp: 0, balance: 0,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  return { success: true, user };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Неверный email или пароль' };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

function getCurrentUser() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

function updateCurrentUser(updates) {
  const user = getCurrentUser();
  if (!user) return null;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
  return users[idx];
}

function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  if (role && user.role !== role) {
    window.location.href = user.role === 'teacher' ? 'teacher.html' : 'student.html';
    return null;
  }
  return user;
}

function renderHeader() {
  const user = getCurrentUser();
  if (!user) return;
  const header = document.getElementById('dynamic-header');
  if (!header) return;
  const roleLabel = user.role === 'teacher' ? '👨‍🏫 Учитель' : `🎓 Ученик, ${user.classGrade} класс`;
  header.innerHTML = `
    <a href="${user.role === 'teacher' ? 'teacher.html' : 'student.html'}" class="logo">Кибер<span>Тренер</span></a>
    <div class="user-info">
      <span class="user-badge">${roleLabel} · ${user.name}</span>
      <button class="btn-logout" onclick="logout()">Выйти</button>
    </div>
  `;
}