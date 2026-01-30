const input = document.getElementById("itemInput");
const button = document.getElementById("addBtn");
const list = document.getElementById("list");

function createItem(text) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const buttons = document.createElement("div");
  buttons.className = "item-buttons";

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.className = "edit-btn";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.className = "delete-btn";

  // ✏️ EDIT
  editBtn.addEventListener("click", () => {
    const newText = prompt("Edit item:", span.textContent);
    if (newText !== null && newText.trim() !== "") {
      span.textContent = newText.trim();
    }
  });

  // ❌ DELETE
  deleteBtn.addEventListener("click", () => {
    li.remove();
  });

  buttons.appendChild(editBtn);
  buttons.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(buttons);

  list.prepend(li);
}

button.addEventListener("click", () => {
  if (!input.value.trim()) return;
  createItem(input.value.trim());
  input.value = "";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    button.click();
  }
});
