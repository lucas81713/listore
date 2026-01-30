const input = document.getElementById("itemInput");
const button = document.getElementById("addBtn");
const list = document.getElementById("list");

function addItem() {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const del = document.createElement("button");
  del.textContent = "❌";
  del.className = "delete-btn";

  // Cross out item (only text)
  span.addEventListener("click", () => {
    span.classList.toggle("done");
  });

  // Delete item
  del.addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(del);

  list.prepend(li);
  input.value = "";
}

button.addEventListener("click", addItem);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});
