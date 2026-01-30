const form = document.getElementById("itemForm");
const input = document.getElementById("itemInput");
const list = document.getElementById("list");

function addItem(text) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const del = document.createElement("button");
  del.textContent = "🗑️";
  del.className = "delete-btn";

  span.addEventListener("click", () => {
    span.classList.toggle("done");
  });

  del.addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(del);
  list.prepend(li);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addItem(text);
  input.value = "";
});
