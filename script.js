const input = document.getElementById("itemInput");
const button = document.getElementById("addBtn");
const list = document.getElementById("list");

/* ---------- SAVE LIST ---------- */
function saveList() {
  const items = [];
  document.querySelectorAll("#list li").forEach(li => {
    items.push({
      text: li.querySelector("span").textContent,
      done: li.classList.contains("done")
    });
  });
  localStorage.setItem("shoppingList", JSON.stringify(items));
}

/* ---------- CREATE ITEM ---------- */
function createItem(text, done = false) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.className = "delete-btn";
  
    // Toggle done
  span.addEventListener("click", () => {
    li.classList.toggle("done");
    saveList();
  });

  // Delete item
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
    saveList();
  });

  li.appendChild(span);
  li.appendChild(delBtn);

  if (done) li.classList.add("done");

  list.prepend(li);
  saveList();
}

/* ---------- ADD ITEM ---------- */
function addItem() {
  const text = input.value.trim();
  if (!text) return;

  createItem(text);
  input.value = "";
  }

button.addEventListener("click", addItem);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItem();
});

/* ---------- LOAD SAVED ITEMS ---------- */
const saved = JSON.parse(localStorage.getItem("shoppingList")) || [];

saved.forEach(item => {
  createItem(item.text, item.done);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

