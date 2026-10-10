const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const counter = document.getElementById("task-counter");
const message = document.getElementById("message");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = [];

try {
  const savedTasks = JSON.parse(localStorage.getItem("myTasks") || "[]");
  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function updateCounter() {
  const pending = tasks.filter(task => !task.completed).length;
  counter.textContent = `${pending} pending task${pending === 1 ? "" : "s"}`;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";
    if (task.completed) item.classList.add("completed");

    const text = document.createElement("span");
    text.textContent = task.text;

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "complete-btn";
    completeButton.textContent = task.completed ? "Undo" : "Complete";
    completeButton.setAttribute(
      "aria-label",
      `${task.completed ? "Mark pending" : "Complete"}: ${task.text}`
    );

    completeButton.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete: ${task.text}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(text, completeButton, deleteButton);
    taskList.appendChild(item);
  });

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? "No tasks yet. Add your first task!"
    : "No tasks match this filter.";

  updateCounter();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    message.textContent = "Please enter a task before adding it.";
    input.focus();
    return;
  }

  tasks.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false
  });

  saveTasks();
  input.value = "";
  message.textContent = "";
  renderTasks();
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => {
      const active = btn === button;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    renderTasks();
  });
});

renderTasks();