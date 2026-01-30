const input = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

addBtn.addEventListener("click", addItem);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") addItem();
});

function addItem() {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement("li");
  li.textContent = text;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.className = "remove";

  removeBtn.onclick = () => li.remove();

  li.appendChild(removeBtn);
  list.appendChild(li);

  input.value = "";
}
