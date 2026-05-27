// ========== ОСНОВНАЯ ЛОГИКА ПЛАТФОРМЫ (БАЗОВАЯ ВЕРСИЯ) ==========

// Данные курсов
const coursesData = [
    {
        id: 1,
        title: "Python для начинающих",
        lessons: [
            { id: 1, title: "Введение в Python", content: "<p>Python — это язык программирования.</p>", completed: false },
            { id: 2, title: "Переменные и типы данных", content: "<p>Изучите переменные.</p>", completed: false },
            { id: 3, title: "Условные операторы", content: "<p>if, elif, else.</p>", completed: false },
            { id: 4, title: "Циклы", content: "<p>for и while.</p>", completed: false },
            { id: 5, title: "Функции", content: "<p>Создание и вызов функций.</p>", completed: false }
        ]
    },
    {
        id: 2,
        title: "Веб-разработка HTML/CSS",
        lessons: [
            { id: 1, title: "Основы HTML", content: "<p>Теги и атрибуты.</p>", completed: false },
            { id: 2, title: "CSS селекторы", content: "<p>Стилизация элементов.</p>", completed: false },
            { id: 3, title: "Flexbox", content: "<p>Адаптивная вёрстка.</p>", completed: false }
        ]
    }
];

// Загрузка прогресса из localStorage
function loadProgress() {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        for (let i = 0; i < coursesData.length; i++) {
            for (let j = 0; j < coursesData[i].lessons.length; j++) {
                const key = `course_${coursesData[i].id}_lesson_${coursesData[i].lessons[j].id}`;
                if (progress[key]) {
                    coursesData[i].lessons[j].completed = true;
                }
            }
        }
    }
}

// Сохранение прогресса
function saveProgress() {
    const progress = {};
    for (const course of coursesData) {
        for (const lesson of course.lessons) {
            progress[`course_${course.id}_lesson_${lesson.id}`] = lesson.completed;
        }
    }
    localStorage.setItem('courseProgress', JSON.stringify(progress));
}

// Подсчёт пройденных уроков в курсе
function countCompletedLessonsInCourse(course) {
    return course.lessons.filter(l => l.completed).length;
}

// Отметить урок пройденным
function completeLesson(courseId, lessonId) {
    const course = coursesData.find(c => c.id === courseId);
    const lesson = course?.lessons.find(l => l.id === lessonId);
    
    if (lesson && !lesson.completed) {
        lesson.completed = true;
        saveProgress();
        alert(`✅ Урок "${lesson.title}" пройден!`);
        
        // Обновляем страницу, если находимся на course.html
        if (window.location.pathname.includes('course.html')) {
            renderCourse();
        }
        if (window.location.pathname.includes('profile.html')) {
            renderProfile();
        }
        return true;
    }
    return false;
}

// Главная страница: список курсов
function renderCourses() {
    const grid = document.getElementById("coursesGrid");
    if (!grid) return;
    
    grid.innerHTML = "";
    for (const course of coursesData) {
        const completedCount = countCompletedLessonsInCourse(course);
        const percent = Math.round((completedCount / course.lessons.length) * 100);
        
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
            <h3>${course.title}</h3>
            <p>📊 Прогресс: ${completedCount}/${course.lessons.length} (${percent}%)</p>
            <div class="progress-bar" style="height: 6px; margin: 0.5rem 0;">
                <div class="progress-fill" style="width: ${percent}%; height: 6px;"></div>
            </div>
            <button onclick="location.href='course.html?id=${course.id}'">Перейти к курсу →</button>
        `;
        grid.appendChild(card);
    }
}

// Страница курса: список уроков
function renderCourse() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = parseInt(urlParams.get("id"));
    const course = coursesData.find(c => c.id === courseId);
    
    if (!course) return;
    
    document.getElementById("courseTitle").textContent = course.title;
    
    const lessonsList = document.getElementById("lessonsList");
    lessonsList.innerHTML = "";
    
    for (const lesson of course.lessons) {
        const lessonDiv = document.createElement("div");
        lessonDiv.className = "lesson-item";
        
        lessonDiv.innerHTML = `
            <span>${lesson.completed ? '✅' : '📘'} ${lesson.title}</span>
            <button onclick="location.href='lesson.html?courseId=${course.id}&lessonId=${lesson.id}'">
                ${lesson.completed ? 'Повторить' : 'Начать'}
            </button>
        `;
        lessonsList.appendChild(lessonDiv);
    }
}

// Страница урока
function renderLesson() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = parseInt(urlParams.get("courseId"));
    const lessonId = parseInt(urlParams.get("lessonId"));
    
    const course = coursesData.find(c => c.id === courseId);
    const lesson = course?.lessons.find(l => l.id === lessonId);
    
    if (!course || !lesson) return;
    
    document.getElementById("lessonTitle").textContent = lesson.title;
    document.getElementById("lessonBody").innerHTML = lesson.content;
    
    const backLink = document.getElementById("backLink");
    if (backLink) {
        backLink.href = `course.html?id=${courseId}`;
    }
    
    const completeBtn = document.getElementById("completeLessonBtn");
    if (completeBtn) {
        if (lesson.completed) {
            completeBtn.textContent = "✅ Уже пройдено";
            completeBtn.disabled = true;
            completeBtn.style.opacity = "0.6";
        } else {
            completeBtn.onclick = () => {
                completeLesson(courseId, lessonId);
                renderLesson(); // обновляем страницу
            };
        }
    }
}

// Профиль: список курсов и прогресс
function renderProfile() {
    const myCoursesList = document.getElementById("myCoursesList");
    if (myCoursesList) {
        myCoursesList.innerHTML = "";
        for (const course of coursesData) {
            const completedCount = countCompletedLessonsInCourse(course);
            const li = document.createElement("li");
            li.innerHTML = `${course.title} — ${completedCount}/${course.lessons.length} уроков`;
            myCoursesList.appendChild(li);
        }
    }
    
    // Общий прогресс по всем курсам
    const totalLessons = coursesData.reduce((sum, c) => sum + c.lessons.length, 0);
    const totalCompleted = coursesData.reduce((sum, c) => sum + countCompletedLessonsInCourse(c), 0);
    const percent = totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0;
    const fillDiv = document.getElementById("globalProgressFill");
    if (fillDiv) {
        fillDiv.style.width = percent + "%";
        fillDiv.textContent = percent + "%";
    }
}

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
        renderCourses();
    }
    if (window.location.pathname.includes("course.html")) {
        renderCourse();
    }
    if (window.location.pathname.includes("lesson.html")) {
        renderLesson();
    }
    if (window.location.pathname.includes("profile.html")) {
        renderProfile();
    }
});