const STORAGE_KEYS = {
    books: "bookworm-books",
    theme: "bookworm-theme"
};

const THEMES = {
    light: "light",
    dark: "dark"
};

function getRequiredById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Элемент с id="${id}" не найден на странице`);
    }
    return element;
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error("localStorage недоступен:", error);
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error("Не удалось сохранить данные в localStorage:", error);
    }
}

function loadBooks() {
    const raw = readStorage(STORAGE_KEYS.books);
    if (raw === null) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error("ожидался массив книг");
        }
        return parsed.filter((book) => book && typeof book.title === "string");
    } catch (error) {
        console.error("Сохранённый список книг повреждён:", error);
        return null;
    }
}

function saveBooks(books) {
    writeStorage(STORAGE_KEYS.books, JSON.stringify(books));
}

function readBooksFromPage(container) {
    const cards = container.querySelectorAll(".book-card");
    const books = [];
    cards.forEach((card) => {
        const title = card.querySelector(".book-title");
        const author = card.querySelector(".book-author");
        const cover = card.querySelector("img.book-cover");
        const readButton = card.querySelector(".read-btn");
        if (!title || !author) {
            console.warn("Карточка книги пропущена: нет названия или автора", card);
            return;
        }
        books.push({
            title: title.textContent.trim(),
            author: author.textContent.trim(),
            cover: cover ? cover.getAttribute("src") : "",
            read: readButton ? readButton.classList.contains("is-read") : false
        });
    });
    return books;
}

function createCoverPlaceholder(title) {
    const placeholder = document.createElement("div");
    placeholder.className = "book-cover book-cover-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", `Обложка-заглушка книги ${title}`);
    placeholder.textContent = title.charAt(0).toUpperCase() || "?";
    return placeholder;
}

function updateReadButton(button, isRead) {
    button.classList.toggle("is-read", isRead);
    button.setAttribute("aria-pressed", String(isRead));
    button.textContent = isRead ? "Прочитано ✓" : "Прочитано";
}

function createBookCard(book, index) {
    const card = document.createElement("article");
    card.className = "book-card";
    card.dataset.index = String(index);

    let cover;
    if (book.cover) {
        cover = document.createElement("img");
        cover.className = "book-cover";
        cover.setAttribute("src", book.cover);
        cover.setAttribute("alt", `Обложка книги ${book.title}`);
        cover.addEventListener("error", () => {
            cover.replaceWith(createCoverPlaceholder(book.title));
        }, { once: true });
    } else {
        cover = createCoverPlaceholder(book.title);
    }

    const info = document.createElement("div");
    info.className = "book-info";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author;

    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.className = "read-btn";
    updateReadButton(readButton, Boolean(book.read));

    info.append(title, author, readButton);
    card.append(cover, info);
    return card;
}

function initBookShelf() {
    const container = getRequiredById("books-container");
    const form = getRequiredById("add-book-form");
    const titleInput = getRequiredById("book-title-input");
    const authorInput = getRequiredById("book-author-input");
    const removeButton = getRequiredById("remove-book-btn");
    const counter = getRequiredById("books-count");
    const message = getRequiredById("book-message");

    if (!container || !form || !titleInput || !authorInput || !removeButton || !counter || !message) {
        console.error("Полка книг не инициализирована: на странице не хватает элементов");
        return;
    }

    let books = loadBooks();
    if (books === null) {
        books = readBooksFromPage(container);
        saveBooks(books);
    }

    function showMessage(text, isError) {
        message.textContent = text;
        message.classList.toggle("is-error", isError);
    }

    function updateCounter() {
        counter.textContent = `Книг на полке: ${books.length}`;
        removeButton.disabled = books.length === 0;
    }

    function render() {
        container.innerHTML = "";
        if (books.length === 0) {
            const empty = document.createElement("p");
            empty.className = "books-empty";
            empty.textContent = "Полка пуста — добавьте первую книгу.";
            container.append(empty);
        } else {
            books.forEach((book, index) => {
                container.append(createBookCard(book, index));
            });
        }
        updateCounter();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();

        titleInput.classList.toggle("input-error", title === "");
        authorInput.classList.toggle("input-error", author === "");

        if (title === "" || author === "") {
            showMessage("Введите название и автора книги.", true);
            (title === "" ? titleInput : authorInput).focus();
            return;
        }

        const book = { title, author, cover: "", read: false };
        books.push(book);
        saveBooks(books);

        const empty = container.querySelector(".books-empty");
        if (empty) {
            empty.remove();
        }
        container.append(createBookCard(book, books.length - 1));
        updateCounter();

        form.reset();
        titleInput.focus();
        showMessage(`Книга «${title}» добавлена на полку.`, false);
    });

    removeButton.addEventListener("click", () => {
        const lastCard = container.querySelector(".book-card:last-of-type");
        if (books.length === 0 || !lastCard) {
            showMessage("На полке нет книг для удаления.", true);
            return;
        }

        const removed = books.pop();
        saveBooks(books);
        lastCard.remove();

        if (books.length === 0) {
            render();
        } else {
            updateCounter();
        }
        showMessage(`Книга «${removed.title}» удалена с полки.`, false);
    });

    container.addEventListener("click", (event) => {
        const button = event.target.closest(".read-btn");
        if (!button) {
            return;
        }
        const card = button.closest(".book-card");
        const index = card ? Number(card.dataset.index) : NaN;
        if (!books[index]) {
            console.error("Не удалось найти книгу для карточки", card);
            return;
        }
        books[index].read = !books[index].read;
        updateReadButton(button, books[index].read);
        saveBooks(books);
    });

    render();
}

function initThemeToggle() {
    const button = getRequiredById("theme-toggle");
    if (!button) {
        return;
    }

    function applyTheme(theme) {
        const isDark = theme === THEMES.dark;
        document.body.classList.toggle("theme-dark", isDark);
        button.setAttribute("aria-pressed", String(isDark));
        button.textContent = isDark ? "Светлая тема" : "Тёмная тема";
    }

    const savedTheme = readStorage(STORAGE_KEYS.theme);
    applyTheme(savedTheme === THEMES.dark ? THEMES.dark : THEMES.light);

    button.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("theme-dark") ? THEMES.light : THEMES.dark;
        applyTheme(nextTheme);
        writeStorage(STORAGE_KEYS.theme, nextTheme);
    });
}

function initSectionToggles() {
    const buttons = document.querySelectorAll("[data-toggle-target]");
    buttons.forEach((button) => {
        const target = document.getElementById(button.dataset.toggleTarget);
        if (!target) {
            console.error(`Блок для кнопки «${button.textContent}» не найден`);
            button.disabled = true;
            return;
        }

        const showText = button.textContent.replace("Скрыть", "Показать");
        const hideText = button.textContent;

        button.addEventListener("click", () => {
            const isHidden = target.classList.toggle("is-hidden");
            button.setAttribute("aria-expanded", String(!isHidden));
            button.textContent = isHidden ? showText : hideText;
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initBookShelf();
    initSectionToggles();
});
