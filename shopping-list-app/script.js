const input = document.getElementById("itemInput");
const button = document.getElementById("addBtn");
const list = document.getElementById("list");
const toggle = document.getElementById("themeToggle");

/* Add item */
function addItem() {
  if (input.value.trim() === "") return;

  const li = document.createElement("li");
  li.textContent = input.value;

  li.onclick = () => {
    li.classList.toggle("done");
  };

  list.prepend(li); // newest on top
  input.value = "";
}

/* Button click */
button.onclick = addItem;

/* Enter key */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItem();
});

/* Dark mode toggle */
toggle.onclick = () => {
  document.body.classList.toggle("dark");
  toggle.textContent = document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";
};
