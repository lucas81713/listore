const homeTab = document.getElementById("homeTab");
const listoreTab = document.getElementById("listoreTab");
const scanTab = document.getElementById("scanTab");

const homePage = document.getElementById("homePage");
const listorePage = document.getElementById("listorePage");
const scanPage = document.getElementById("scanPage");

const listsView = document.getElementById("listsView");
const singleListView = document.getElementById("singleListView");

const listsContainer = document.getElementById("listsContainer");
const emptyLists = document.getElementById("emptyLists");

const newListBtn = document.getElementById("newListBtn");

const createListModal = document.getElementById("createListModal");
const closeCreateModal = document.getElementById("closeCreateModal");
const cancelCreate = document.getElementById("cancelCreate");
const confirmCreate = document.getElementById("confirmCreate");
const newListName = document.getElementById("newListName");

const renameListModal = document.getElementById("renameListModal");
const closeRenameModal = document.getElementById("closeRenameModal");
const cancelRename = document.getElementById("cancelRename");
const confirmRename = document.getElementById("confirmRename");
const renameListInput = document.getElementById("renameListInput");

const backToLists = document.getElementById("backToLists");
const currentListName = document.getElementById("currentListName");

const form = document.getElementById("listForm");
const input = document.getElementById("itemInput");
const list = document.getElementById("list");
const emptyItems = document.getElementById("emptyItems");

const shareListBtn = document.getElementById("shareListBtn");

const qrModal = document.getElementById("qrModal");
const closeQrModal = document.getElementById("closeQrModal");
const qrListName = document.getElementById("qrListName");
const qrCode = document.getElementById("qrcode");
const copyShareLink = document.getElementById("copyShareLink");

const qrReader = document.getElementById("qr-reader");
const scannerStatus = document.getElementById("scannerStatus");
const startScannerBtn = document.getElementById("startScannerBtn");
const stopScannerBtn = document.getElementById("stopScannerBtn");


/* ---------- DATA ---------- */

let lists = [];
let currentListId = null;
let renameTargetId = null;

let qrScanner = null;
let scannerRunning = false;

const LISTS_STORAGE_KEY = "listoreLists";
const OLD_STORAGE_KEY = "listoreData";


/* ---------- ID ---------- */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );

}


/* ---------- SAVE ---------- */

function saveLists() {

  localStorage.setItem(
    LISTS_STORAGE_KEY,
    JSON.stringify(lists)
  );

}


/* ---------- LOAD ---------- */

function loadLists() {

  const savedLists =
    localStorage.getItem(LISTS_STORAGE_KEY);

  if (savedLists) {

    try {

      lists = JSON.parse(savedLists);

    } catch {

      lists = [];

    }

  } else {

    const oldData =
      localStorage.getItem(OLD_STORAGE_KEY);

    if (oldData) {

      try {

        const oldItems =
          JSON.parse(oldData);

        lists = [
          {
            id: generateId(),
            name: "My List",
            items: oldItems
          }
        ];

      } catch {

        lists = [];

      }

    } else {

      lists = [];

    }

    saveLists();

  }

}


/* ---------- PAGE NAVIGATION ---------- */

function setActiveTab(tab) {

  homeTab.classList.remove("active");
  listoreTab.classList.remove("active");
  scanTab.classList.remove("active");

  tab.classList.add("active");

}

function hidePages() {

  homePage.classList.remove("active-page");
  listorePage.classList.remove("active-page");
  scanPage.classList.remove("active-page");

}

function showHome() {

  stopScanner();

  setActiveTab(homeTab);

  hidePages();

  homePage.classList.add("active-page");

}

function showListore() {

  stopScanner();

  setActiveTab(listoreTab);

  hidePages();

  listorePage.classList.add("active-page");

  showLists();

}

function showScanner() {

  setActiveTab(scanTab);

  hidePages();

  scanPage.classList.add("active-page");

}

homeTab.addEventListener("click", showHome);
listoreTab.addEventListener("click", showListore);
scanTab.addEventListener("click", showScanner);


/* ---------- LIST MANAGER ---------- */

function showLists() {

  listsView.classList.remove("hidden");

  singleListView.classList.add("hidden");

  renderLists();

}


function renderLists() {

  listsContainer.innerHTML = "";

  emptyLists.classList.toggle(
    "hidden",
    lists.length !== 0
  );

  lists.forEach(currentList => {

    const card =
      document.createElement("div");

    card.className = "list-card";


    const main =
      document.createElement("div");

    main.className = "list-card-main";


    const info =
      document.createElement("div");


    const name =
      document.createElement("div");

    name.className = "list-card-name";

    name.textContent =
      currentList.name;


    const count =
      document.createElement("div");

    count.className =
      "list-card-count";


    const total =
      currentList.items.length;

    const completed =
      currentList.items.filter(
        item => item.done
      ).length;


    count.textContent =
      `${total} ITEM${total === 1 ? "" : "S"} • ${completed} COMPLETE`;


    info.appendChild(name);
    info.appendChild(count);


    const actions =
      document.createElement("div");

    actions.className =
      "list-card-actions";


    const renameButton =
      document.createElement("button");

    renameButton.className =
      "card-action";

    renameButton.textContent =
      "✎";

    renameButton.title =
      "Rename";


    renameButton.addEventListener(
      "click",
      e => {

        e.stopPropagation();

        openRenameModal(
          currentList.id
        );

      }
    );


    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "card-action card-delete";

    deleteButton.textContent =
      "×";

    deleteButton.title =
      "Delete";


    deleteButton.addEventListener(
      "click",
      e => {

        e.stopPropagation();

        deleteList(
          currentList.id
        );

      }
    );


    actions.appendChild(renameButton);
    actions.appendChild(deleteButton);


    main.appendChild(info);
    main.appendChild(actions);


    card.appendChild(main);


    card.addEventListener(
      "click",
      () => {

        openList(
          currentList.id
        );

      }
    );


    listsContainer.appendChild(card);

  });

}


/* ---------- CREATE LIST ---------- */

function openCreateModal() {

  newListName.value = "";

  createListModal.classList.remove(
    "hidden"
  );

  setTimeout(
    () => newListName.focus(),
    50
  );

}


function closeCreateListModal() {

  createListModal.classList.add(
    "hidden"
  );

}


newListBtn.addEventListener(
  "click",
  openCreateModal
);

closeCreateModal.addEventListener(
  "click",
  closeCreateListModal
);

cancelCreate.addEventListener(
  "click",
  closeCreateListModal
);

confirmCreate.addEventListener(
  "click",
  createList
);


newListName.addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {

      createList();

    }

  }
);


function createList() {

  const name =
    newListName.value.trim();

  if (!name) {
    return;
  }


  const newList = {

    id: generateId(),

    name: name,

    items: []

  };


  lists.push(newList);

  saveLists();

  closeCreateListModal();

  renderLists();

  openList(newList.id);

}


/* ---------- DELETE LIST ---------- */

function deleteList(id) {

  const target =
    lists.find(
      item => item.id === id
    );

  if (!target) {
    return;
  }


  const confirmed =
    confirm(
      `Delete "${target.name}"? This cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  lists =
    lists.filter(
      item => item.id !== id
    );


  saveLists();

  renderLists();

}


/* ---------- RENAME ---------- */

function openRenameModal(id) {

  const target =
    lists.find(
      item => item.id === id
    );

  if (!target) {
    return;
  }


  renameTargetId = id;

  renameListInput.value =
    target.name;


  renameListModal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {

      renameListInput.focus();

      renameListInput.select();

    },
    50
  );

}


function closeRenameListModal() {

  renameListModal.classList.add(
    "hidden"
  );

  renameTargetId = null;

}


closeRenameModal.addEventListener(
  "click",
  closeRenameListModal
);

cancelRename.addEventListener(
  "click",
  closeRenameListModal
);

confirmRename.addEventListener(
  "click",
  renameList
);


renameListInput.addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {

      renameList();

    }

  }
);


function renameList() {

  if (!renameTargetId) {
    return;
  }


  const name =
    renameListInput.value.trim();

  if (!name) {
    return;
  }


  const target =
    lists.find(
      item => item.id === renameTargetId
    );

  if (!target) {
    return;
  }


  target.name = name;

  saveLists();

  closeRenameListModal();

  renderLists();


  if (
    currentListId === target.id
  ) {

    currentListName.textContent =
      target.name;

  }

}


/* ---------- OPEN LIST ---------- */

function openList(id) {

  const target =
    lists.find(
      item => item.id === id
    );

  if (!target) {
    return;
  }


  currentListId = id;


  listsView.classList.add(
    "hidden"
  );

  singleListView.classList.remove(
    "hidden"
  );


  currentListName.textContent =
    target.name;


  renderItems();

}


/* ---------- RENDER ITEMS ---------- */

function renderItems() {

  const target =
    getCurrentList();

  if (!target) {
    return;
  }


  list.innerHTML = "";


  emptyItems.classList.toggle(
    "hidden",
    target.items.length !== 0
  );


  target.items.forEach(
    item => createItemElement(item)
  );

}


/* ---------- ITEM ELEMENT ---------- */

function createItemElement(item) {

  const li =
    document.createElement("li");


  const span =
    document.createElement("span");

  span.textContent =
    item.text;


  if (item.done) {

    span.classList.add("done");

  }


  span.addEventListener(
    "click",
    () => {

      item.done =
        !item.done;

      span.classList.toggle(
        "done"
      );

      saveLists();

    }
  );


  const del =
    document.createElement("button");

  del.textContent =
    "✕";

  del.className =
    "delete-btn";


  del.addEventListener(
    "click",
    e => {

      e.stopPropagation();


      const target =
        getCurrentList();

      if (!target) {
        return;
      }


      target.items =
        target.items.filter(
          currentItem =>
            currentItem !== item
        );


      saveLists();

      renderItems();

    }
  );


  li.appendChild(span);

  li.appendChild(del);

  list.appendChild(li);

}


/* ---------- ADD ITEM ---------- */

form.addEventListener(
  "submit",
  e => {

    e.preventDefault();


    const text =
      input.value.trim();

    if (!text) {
      return;
    }


    const target =
      getCurrentList();

    if (!target) {
      return;
    }


    target.items.unshift({

      text: text,

      done: false

    });


    saveLists();


    input.value = "";

    renderItems();

    input.focus();

  }
);


/* ---------- BACK ---------- */

backToLists.addEventListener(
  "click",
  () => {

    currentListId = null;

    showLists();

  }
);


/* ---------- CURRENT LIST ---------- */

function getCurrentList() {

  return lists.find(
    currentList =>
      currentList.id === currentListId
  );

}


/* ---------- QR ENCODING ---------- */

function encodeList(listData) {

  const json =
    JSON.stringify(listData);


  const encoded =
    btoa(
      encodeURIComponent(json)
        .replace(
          /%([0-9A-F]{2})/g,
          (match, p1) =>
            String.fromCharCode(
              "0x" + p1
            )
        )
    );


  return encoded;

}


function decodeList(encoded) {

  const json =
    decodeURIComponent(

      Array.prototype.map.call(
        atob(encoded),

        c =>
          "%" +
          (
            "00" +
            c.charCodeAt(0)
              .toString(16)
          ).slice(-2)

      ).join("")

    );


  return JSON.parse(json);

}


/* ---------- SHARE LINK ---------- */

function getShareLink(target) {

  const encoded =
    encodeList({

      name: target.name,

      items: target.items

    });


  const baseUrl =
    window.location.origin +
    window.location.pathname;


  return (
    `${baseUrl}#share=${encodeURIComponent(encoded)}`
  );

}


/* ---------- SHOW QR ---------- */

shareListBtn.addEventListener(
  "click",
  () => {

    const target =
      getCurrentList();

    if (!target) {
      return;
    }


    qrListName.textContent =
      target.name;


    qrCode.innerHTML = "";


    const shareLink =
      getShareLink(target);


    new QRCode(
      qrCode,
      {

        text: shareLink,

        width: 200,

        height: 200,

        colorDark: "#000000",

        colorLight: "#ffffff",

        correctLevel:
          QRCode.CorrectLevel.M

      }
    );


    qrModal.classList.remove(
      "hidden"
    );

  }
);


/* ---------- CLOSE QR ---------- */

closeQrModal.addEventListener(
  "click",
  () => {

    qrModal.classList.add(
      "hidden"
    );

  }
);


/* ---------- COPY LINK ---------- */

copyShareLink.addEventListener(
  "click",
  async () => {

    const target =
      getCurrentList();

    if (!target) {
      return;
    }


    const link =
      getShareLink(target);


    try {

      await navigator.clipboard
        .writeText(link);


      copyShareLink.textContent =
        "COPIED!";


      setTimeout(
        () => {

          copyShareLink.textContent =
            "COPY SHARE LINK";

        },
        1500
      );


    } catch {

      prompt(
        "Copy this share link:",
        link
      );

    }

  }
);


/* ---------- IMPORT SHARED LIST ---------- */

function importSharedListFromHash() {

  const hash =
    window.location.hash;


  if (
    !hash.startsWith("#share=")
  ) {

    return false;

  }


  try {

    const encoded =
      decodeURIComponent(
        hash.substring(7)
      );


    const sharedList =
      decodeList(encoded);


    if (
      !sharedList ||
      typeof sharedList.name !== "string" ||
      !Array.isArray(sharedList.items)
    ) {

      return false;

    }


    const alreadyImported =
      lists.some(
        item =>
          item.name === sharedList.name &&
          JSON.stringify(item.items) ===
          JSON.stringify(sharedList.items)
      );


    if (alreadyImported) {

      alert(
        `"${sharedList.name}" is already in your Listore.`
      );

    } else {

      const importedList = {

        id: generateId(),

        name: sharedList.name,

        items: sharedList.items

      };


      lists.push(importedList);

      saveLists();


      showListore();

      openList(
        importedList.id
      );


      alert(
        `"${importedList.name}" has been imported into your Listore!`
      );

    }


    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );


    return true;


  } catch (error) {

    console.error(
      "Could not import shared list:",
      error
    );


    return false;

  }

}


/* ---------- QR SCANNER ---------- */

function startScanner() {

  if (scannerRunning) {
    return;
  }


  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    scannerStatus.textContent =
      "SCANNER LIBRARY FAILED TO LOAD";

    return;

  }


  qrScanner =
    new Html5Qrcode(
      "qr-reader"
    );


  scannerStatus.textContent =
    "REQUESTING CAMERA...";


  qrScanner.start(

    {
      facingMode: "environment"
    },

    {
      fps: 10,

      qrbox: {
        width: 230,
        height: 230
      }

    },

    decodedText => {

      handleScannedQRCode(
        decodedText
      );

    },

    errorMessage => {

    }

  )
  .then(() => {

    scannerRunning = true;

    startScannerBtn.classList.add(
      "hidden"
    );

    stopScannerBtn.classList.remove(
      "hidden"
    );

    scannerStatus.textContent =
      "SCANNING — POINT AT A LISTORE QR CODE";

  })
  .catch(error => {

    console.error(
      "Camera error:",
      error
    );


    scannerStatus.textContent =
      "CAMERA ACCESS FAILED";

  });

}


/* ---------- STOP SCANNER ---------- */

function stopScanner() {

  if (
    !qrScanner ||
    !scannerRunning
  ) {

    return;

  }


  qrScanner
    .stop()
    .then(() => {

      qrScanner.clear();

      scannerRunning = false;

      startScannerBtn.classList.remove(
        "hidden"
      );

      stopScannerBtn.classList.add(
        "hidden"
      );

      scannerStatus.textContent =
        "CAMERA READY";

    })
    .catch(error => {

      console.error(
        "Could not stop scanner:",
        error
      );

      scannerRunning = false;

    });

}


/* ---------- SCANNED QR ---------- */

function handleScannedQRCode(decodedText) {

  if (
    !decodedText.includes("#share=")
  ) {

    scannerStatus.textContent =
      "NOT A LISTORE QR CODE";

    return;

  }


  try {

    const url =
      new URL(decodedText);


    const hash =
      url.hash;


    if (
      !hash.startsWith("#share=")
    ) {

      throw new Error(
        "Invalid Listore QR"
      );

    }


    const encoded =
      decodeURIComponent(
        hash.substring(7)
      );


    const sharedList =
      decodeList(encoded);


    if (
      !sharedList ||
      typeof sharedList.name !== "string" ||
      !Array.isArray(sharedList.items)
    ) {

      throw new Error(
        "Invalid list"
      );

    }


    const alreadyImported =
      lists.some(
        item =>
          item.name === sharedList.name &&
          JSON.stringify(item.items) ===
          JSON.stringify(sharedList.items)
      );


    if (alreadyImported) {

      scannerStatus.textContent =
        "LIST ALREADY IMPORTED";

      stopScanner();

      setTimeout(
        () => showListore(),
        800
      );

      return;

    }


    const importedList = {

      id: generateId(),

      name: sharedList.name,

      items: sharedList.items

    };


    lists.push(importedList);

    saveLists();


    scannerStatus.textContent =
      `IMPORTED: ${importedList.name}`;


    stopScanner();


    setTimeout(
      () => {

        showListore();

        openList(
          importedList.id
        );

      },
      700
    );


  } catch (error) {

    console.error(
      "Invalid QR:",
      error
    );

    scannerStatus.textContent =
      "INVALID LISTORE QR CODE";

  }

}


/* ---------- SCANNER BUTTONS ---------- */

startScannerBtn.addEventListener(
  "click",
  startScanner
);

stopScannerBtn.addEventListener(
  "click",
  stopScanner
);


/* ---------- CLOCK ---------- */

function updateClock() {

  const now =
    new Date();


  let hours =
    now.getHours();


  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");


  const seconds =
    String(
      now.getSeconds()
    ).padStart(2, "0");


  const ampm =
    hours >= 12
      ? "PM"
      : "AM";


  hours =
    hours % 12;


  if (hours === 0) {
    hours = 12;
  }


  hours =
    String(hours)
      .padStart(2, "0");


  document.getElementById(
    "time"
  ).textContent =
    `${hours}:${minutes}:${seconds}`;


  document.getElementById(
    "ampm"
  ).textContent =
    ampm;


  document.getElementById(
    "date"
  ).textContent =
    now.toLocaleDateString(
      undefined,
      {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

      }
    );

}


setInterval(
  updateClock,
  1000
);

updateClock();


/* ---------- WEATHER ---------- */

async function loadWeather() {

  const weatherTemp =
    document.getElementById(
      "weatherTemp"
    );

  const weatherDescription =
    document.getElementById(
      "weatherDescription"
    );

  const weatherIcon =
    document.getElementById(
      "weatherIcon"
    );


  try {

    const response =
      await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=43.8561&longitude=-79.3370&current=temperature_2m,weather_code&temperature_unit=celsius"
      );


    const data =
      await response.json();


    const temperature =
      Math.round(
        data.current.temperature_2m
      );


    const code =
      data.current.weather_code;


    let description =
      "Clear";

    let icon =
      "☀";


    if (code === 0) {

      description =
        "Clear sky";

      icon =
        "☀";

    } else if (code <= 3) {

      description =
        "Partly cloudy";

      icon =
        "⛅";

    } else if (code <= 48) {

      description =
        "Foggy";

      icon =
        "🌫";

    } else if (code <= 67) {

      description =
        "Rain";

      icon =
        "🌧";

    } else if (code <= 77) {

      description =
        "Snow";

      icon =
        "❄";

    } else if (code <= 82) {

      description =
        "Rain showers";

      icon =
        "🌦";

    } else if (code <= 86) {

      description =
        "Snow showers";

      icon =
        "🌨";

    } else {

      description =
        "Thunderstorm";

      icon =
        "⛈";

    }


    weatherTemp.textContent =
      `${temperature}°C`;


    weatherDescription.textContent =
      description;


    weatherIcon.textContent =
      icon;


  } catch {

    weatherTemp.textContent =
      "--°";

    weatherDescription.textContent =
      "Weather unavailable";

    weatherIcon.textContent =
      "☁";

  }

}


loadWeather();


/* ---------- START ---------- */

loadLists();

renderLists();

importSharedListFromHash();
