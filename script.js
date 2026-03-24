/**
 * 개인용 할 일 관리 앱 (Todo List App)
 * 기능: 할 일 추가/수정/삭제, 완료 체크, 카테고리 분류, 진행률 바, 데이터 지속성(LocalStorage), 다크 모드
 */

// 1. 데이터 초기화
let todos = JSON.parse(localStorage.getItem('my-todo-list')) || [
    { id: 1, text: "프로젝트 제안서 작성", category: "work", completed: true },
    { id: 2, text: "장보러 가기 (우유, 계란)", category: "personal", completed: false },
    { id: 3, text: "자바스크립트 기본 문법 복습", category: "study", completed: false }
];

// 2. DOM 요소 선택
const todoInput = document.getElementById('todo-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const currentDateEl = document.getElementById('current-date');
const themeToggle = document.querySelector('.theme-switch input[type="checkbox"]');
const filterTabs = document.querySelectorAll('.filter-tab');
const clearCompletedBtn = document.getElementById('clear-completed');

// 3. 상태 변수
let currentFilter = 'all';

/**
 * 테마(다크/라이트) 설정 및 저장 함수
 */
function initTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

/**
 * 필터 변경 함수
 */
function setFilter(filter) {
    currentFilter = filter;
    
    // 탭 스타일 업데이트
    filterTabs.forEach(tab => {
        if (tab.getAttribute('data-filter') === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    render();
}

/**
 * 완료된 항목만 삭제하는 함수
 */
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (confirm(`완료된 ${completedCount}개의 항목을 모두 삭제하시겠습니까?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        render();
    }
}

/**
 * 데이터를 로컬 스토리지에 저장하는 함수
 */
function saveTodos() {
    localStorage.setItem('my-todo-list', JSON.stringify(todos));
}

/**
 * 상단 날짜 표시 함수
 */
function displayDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDateEl.textContent = now.toLocaleDateString('ko-KR', options);
}

/**
 * 할 일 추가 함수
 */
function addTodo() {
    const text = todoInput.value.trim();
    const category = categorySelect.value;

    if (text === "") {
        alert("할 일을 입력해 주세요!");
        todoInput.focus();
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        category: category,
        completed: false
    };

    todos.push(newTodo);
    todoInput.value = "";
    
    saveTodos();
    render();
}

/**
 * 할 일 삭제 함수
 */
function deleteTodo(id) {
    if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        render();
    }
}

/**
 * 할 일 완료 상태 토글 함수
 */
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    render();
}

/**
 * 할 일 내용 수정 함수
 */
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    const newText = prompt("할 일을 수정하세요:", todo.text);
    
    if (newText !== null && newText.trim() !== "") {
        todos = todos.map(t => 
            t.id === id ? { ...t, text: newText.trim() } : t
        );
        saveTodos();
        render();
    }
}

/**
 * 실시간 진행률 업데이트 함수
 */
function updateProgress() {
    const total = todos.length;
    const completedCount = todos.filter(todo => todo.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    progressBar.style.width = `${percentage}%`;
    
    // 진행률에 따른 동적 색상 변경 (Hue: 0(빨강) -> 120(초록))
    const hue = percentage * 1.2; 
    progressBar.style.background = `linear-gradient(90deg, hsl(${hue}, 70%, 50%) 0%, hsl(${hue + 20}, 80%, 60%) 100%)`;
    progressBar.style.boxShadow = `0 0 10px hsla(${hue}, 70%, 50%, 0.3)`;

    progressText.textContent = `전체 ${total}개 중 ${completedCount}개 완료`;
}

/**
 * 화면 렌더링 함수
 */
function render() {
    todoList.innerHTML = "";

    // 필터링 적용
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'all') return true;
        return todo.category === currentFilter;
    });

    if (filteredTodos.length === 0) {
        let emptyMsg = "할 일이 없습니다.";
        if (currentFilter !== 'all') {
            const catMap = { work: '업무', personal: '개인', study: '공부' };
            emptyMsg = `${catMap[currentFilter]} 카테고리에 할 일이 없습니다.`;
        }
        todoList.innerHTML = `<li class="todo-item" style="justify-content: center; color: var(--secondary-text);">${emptyMsg}</li>`;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.category}`;

        const categoryNames = {
            work: '업무',
            personal: '개인',
            study: '공부'
        };

        li.innerHTML = `
            <div class="item-left">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id})">
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            </div>
            <div class="item-right-container">
                <span class="category-tag ${todo.category}-tag">${categoryNames[todo.category]}</span>
                <button class="action-btn edit-btn" onclick="editTodo(${todo.id})" title="수정">편집</button>
                <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})" title="삭제">삭제</button>
            </div>
        `;

        todoList.appendChild(li);
    });

    updateProgress();
}

// 9. 이벤트 리스너 등록 및 초기화
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 필터 탭 이벤트 리스너
filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        setFilter(tab.getAttribute('data-filter'));
    });
});

// 완료 삭제 버튼 이벤트 리스너
clearCompletedBtn.addEventListener('click', clearCompleted);

initTheme();
displayDate();
render();

