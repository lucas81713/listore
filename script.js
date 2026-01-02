const input = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

let items = JSON.parse(localStorage.getItem("shoppingList")) || [];

// Save to localStorage
function saveList() {
  localStorage.setItem("shoppingList", JSON.stringify(items));
}

// Render list
function renderList() {
  list.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    if (item.done) li.classList.add("done");

    const span = document.createElement("span");
    span.textContent = item.text;

    span.addEventListener("click", () => {
      items[index].done = !items[index].done;
      saveList();
      renderList();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", () => {
      items.splice(index, 1);
      saveList();
      renderList();
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Add item
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  items.push({ text, done: false });
  input.value = "";
  saveList();
  renderList();
});

// Enter key support
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

// Initial render
renderList();
