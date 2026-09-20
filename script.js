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

const createListModal =
  document.getElementById("createListModal");

const closeCreateModal =
  document.getElementById("closeCreateModal");

const cancelCreate =
  document.getElementById("cancelCreate");

const confirmCreate =
  document.getElementById("confirmCreate");

const newListName =
  document.getElementById("newListName");

const renameListModal =
  document.getElementById("renameListModal");

const closeRenameModal =
  document.getElementById("closeRenameModal");

const cancelRename =
  document.getElementById("cancelRename");

const confirmRename =
  document.getElementById("confirmRename");

const renameListInput =
  document.getElementById("renameListInput");

const backToLists =
  document.getElementById("backToLists");

const currentListName =
  document.getElementById("currentListName");

const form =
  document.getElementById("listForm");

const input =
  document.getElementById("itemInput");

const list =
  document.getElementById("list");

const emptyItems =
  document.getElementById("emptyItems");

const shareListBtn =
  document.getElementById("shareListBtn");

const qrModal =
  document.getElementById("qrModal");

const closeQrModal =
  document.getElementById("closeQrModal");

const qrListName =
  document.getElementById("qrListName");

const qrCode =
  document.getElementById("qrcode");

const copyShareLink =
  document.getElementById("copyShareLink");

const minutePlanet =
  document.getElementById("minutePlanet");

const secondPlanet =
  document.getElementById("secondPlanet");

const qrReader =
  document.getElementById("qr-reader");

const scannerStatus =
  document.getElementById("scannerStatus");

const startScannerBtn =
  document.getElementById("startScannerBtn");

const stopScannerBtn =
  document.getElementById("stopScannerBtn");


/* ---------- DATA ---------- */

let lists = [];

let currentListId = null;

let renameTargetId = null;

let qrScanner = null;

let scannerRunning = false;

let scanLocked = false;

const LISTS_STORAGE_KEY = "listoreLists";

const OLD_STORAGE_KEY = "listoreData";


/* ---------- ID ---------- */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 8)
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
    localStorage.getItem(
      LISTS_STORAGE_KEY
    );


  if (savedLists) {

    try {

      lists =
        JSON.parse(savedLists);

    } catch {

      lists = [];

    }

  } else {

    const oldData =
      localStorage.getItem(
        OLD_STORAGE_KEY
      );


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


/* ---------- NAVIGATION ---------- */

function setActiveTab(tab) {

  homeTab.classList.remove(
    "active"
  );

  listoreTab.classList.remove(
    "active"
  );

  scanTab.classList.remove(
    "active"
  );

  tab.classList.add(
    "active"
  );

}


function hidePages() {

  homePage.classList.remove(
    "active-page"
  );

  listorePage.classList.remove(
    "active-page"
  );

  scanPage.classList.remove(
    "active-page"
  );

}


function showHome() {

  stopScanner();

  setActiveTab(homeTab);

  hidePages();

  homePage.classList.add(
    "active-page"
  );

}


function showListore() {

  stopScanner();

  setActiveTab(listoreTab);

  hidePages();

  listorePage.classList.add(
    "active-page"
  );

  showLists();

}


function showScanner() {

  setActiveTab(scanTab);

  hidePages();

  scanPage.classList.add(
    "active-page"
  );

  scannerStatus.textContent =
    "READY TO SCAN";

}


homeTab.addEventListener(
  "click",
  showHome
);

listoreTab.addEventListener(
  "click",
  showListore
);

scanTab.addEventListener(
  "click",
  showScanner
);


/* ---------- LISTS ---------- */

function showLists() {

  listsView.classList.remove(
    "hidden"
  );

  singleListView.classList.add(
    "hidden"
  );

  renderLists();

}


function renderLists() {

  listsContainer.innerHTML = "";


  emptyLists.classList.toggle(
    "hidden",
    lists.length !== 0
  );


  lists.forEach(
    currentList => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "list-card";


      const main =
        document.createElement(
          "div"
        );

      main.className =
        "list-card-main";


      const info =
        document.createElement(
          "div"
        );


      const name =
        document.createElement(
          "div"
        );

      name.className =
        "list-card-name";

      name.textContent =
        currentList.name;


      const count =
        document.createElement(
          "div"
        );

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
        document.createElement(
          "div"
        );

      actions.className =
        "list-card-actions";


      const renameButton =
        document.createElement(
          "button"
        );

      renameButton.className =
        "card-action";

      renameButton.textContent =
        "✎";


      renameButton.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          openRenameModal(
            currentList.id
          );

        }
      );


      const deleteButton =
        document.createElement(
          "button"
        );

      deleteButton.className =
        "card-action card-delete";

      deleteButton.textContent =
        "×";


      deleteButton.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          deleteList(
            currentList.id
          );

        }
      );


      actions.appendChild(
        renameButton
      );

      actions.appendChild(
        deleteButton
      );


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


      listsContainer.appendChild(
        card
      );

    }
  );

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

  openList(
    newList.id
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
  event => {

    if (event.key === "Enter") {

      createList();

    }

  }
);


/* ---------- DELETE ---------- */

function deleteList(id) {

  const target =
    lists.find(
      item => item.id === id
    );


  if (!target) {

    return;

  }


  if (
    !confirm(
      `Delete "${target.name}"? This cannot be undone.`
    )
  ) {

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
      item =>
        item.id === renameTargetId
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
  event => {

    if (event.key === "Enter") {

      renameList();

    }

  }
);


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


/* ---------- ITEMS ---------- */

function getCurrentList() {

  return lists.find(
    item =>
      item.id === currentListId
  );

}


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
    item =>
      createItemElement(item)
  );

}


function createItemElement(item) {

  const li =
    document.createElement(
      "li"
    );


  const span =
    document.createElement(
      "span"
    );


  span.textContent =
    item.text;


  if (item.done) {

    span.classList.add(
      "done"
    );

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
    document.createElement(
      "button"
    );


  del.textContent =
    "✕";

  del.className =
    "delete-btn";


  del.addEventListener(
    "click",
    event => {

      event.stopPropagation();


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


form.addEventListener(
  "submit",
  event => {

    event.preventDefault();


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


backToLists.addEventListener(
  "click",
  () => {

    currentListId = null;

    showLists();

  }
);


/* ---------- QR DATA ---------- */

function encodeList(listData) {

  const json =
    JSON.stringify(listData);


  return btoa(
    encodeURIComponent(json)
      .replace(
        /%([0-9A-F]{2})/g,
        (match, p1) =>
          String.fromCharCode(
            parseInt(p1, 16)
          )
      )
  );

}


function decodeList(encoded) {

  const binary =
    atob(encoded);


  const percentEncoded =
    Array.from(binary)
      .map(
        character =>
          "%" +
          character
            .charCodeAt(0)
            .toString(16)
            .padStart(2, "0")
      )
      .join("");


  return JSON.parse(
    decodeURIComponent(
      percentEncoded
    )
  );

}


function getShareLink(target) {

  const encoded =
    encodeList({

      name: target.name,

      items: target.items

    });


  return (
    window.location.origin +
    window.location.pathname +
    "#share=" +
    encodeURIComponent(encoded)
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


    const link =
      getShareLink(target);


    if (
      typeof QRCode ===
      "undefined"
    ) {

      alert(
        "QR code generator could not load. Please check your internet connection."
      );

      return;

    }


    new QRCode(
      qrCode,
      {

        text: link,

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


closeQrModal.addEventListener(
  "click",
  () => {

    qrModal.classList.add(
      "hidden"
    );

  }
);


/* ---------- COPY QR LINK ---------- */

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
        "Copy this link:",
        link
      );

    }

  }
);


/* ---------- IMPORT HASH ---------- */

function importSharedListFromHash() {

  const hash =
    window.location.hash;


  if (
    !hash.startsWith(
      "#share="
    )
  ) {

    return;

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

      throw new Error(
        "Invalid list"
      );

    }


    const importedList = {

      id: generateId(),

      name: sharedList.name,

      items: sharedList.items

    };


    lists.push(
      importedList
    );


    saveLists();


    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );


    showListore();

    openList(
      importedList.id
    );


    alert(
      `"${importedList.name}" has been imported!`
    );

  } catch (error) {

    console.error(
      "Import failed:",
      error
    );

  }

}


/* =========================================================
   QR SCANNER
   ========================================================= */


/* ---------- START SCANNER ---------- */

async function startScanner() {

  if (scannerRunning) {

    return;

  }


  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    scannerStatus.textContent =
      "SCANNER LIBRARY NOT LOADED";

    return;

  }


  if (
    !window.isSecureContext &&
    location.hostname !== "localhost" &&
    location.hostname !== "127.0.0.1"
  ) {

    scannerStatus.textContent =
      "CAMERA REQUIRES HTTPS";

    alert(
      "Camera scanning requires HTTPS. Host your Listore site on an HTTPS website such as GitHub Pages."
    );

    return;

  }


  scanLocked = false;


  qrReader.innerHTML = "";


  qrScanner =
    new Html5Qrcode(
      "qr-reader"
    );


  scannerStatus.textContent =
    "REQUESTING CAMERA...";


  try {

    const cameras =
      await Html5Qrcode.getCameras();


    if (
      !cameras ||
      cameras.length === 0
    ) {

      throw new Error(
        "No camera found"
      );

    }


    let cameraId =
      cameras[0].id;


    const backCamera =
      cameras.find(
        camera =>
          /back|rear|environment/i
            .test(camera.label)
      );


    if (backCamera) {

      cameraId =
        backCamera.id;

    }


    await qrScanner.start(

      cameraId,

      {

        fps: 10,

        qrbox: {
          width: 230,
          height: 230
        },

        aspectRatio: 1

      },

      decodedText => {

        handleScannedQRCode(
          decodedText
        );

      },

      () => {}

    );


    scannerRunning = true;


    startScannerBtn.classList.add(
      "hidden"
    );


    stopScannerBtn.classList.remove(
      "hidden"
    );


    scannerStatus.textContent =
      "SCANNING — POINT AT A LISTORE QR CODE";

  } catch (error) {

    console.error(
      "Camera startup error:",
      error
    );


    scannerStatus.textContent =
      "CAMERA COULD NOT START";


    if (
      error.name ===
      "NotAllowedError"
    ) {

      scannerStatus.textContent =
        "CAMERA PERMISSION DENIED";

    } else if (
      error.name ===
      "NotFoundError"
    ) {

      scannerStatus.textContent =
        "NO CAMERA FOUND";

    }

  }

}


/* ---------- STOP SCANNER ---------- */

async function stopScanner() {

  if (!qrScanner) {

    return;

  }


  try {

    if (scannerRunning) {

      await qrScanner.stop();

    }

  } catch (error) {

    console.error(
      "Scanner stop error:",
      error
    );

  }


  try {

    qrScanner.clear();

  } catch {}

  
  qrScanner = null;

  scannerRunning = false;

  scanLocked = false;


  startScannerBtn.classList.remove(
    "hidden"
  );


  stopScannerBtn.classList.add(
    "hidden"
  );


  if (
    scanPage.classList.contains(
      "active-page"
    )
  ) {

    scannerStatus.textContent =
      "READY TO SCAN";

  }

}


/* ---------- HANDLE SCAN ---------- */

function handleScannedQRCode(decodedText) {

  if (scanLocked) {

    return;

  }


  scanLocked = true;


  if (
    !decodedText.includes(
      "#share="
    )
  ) {

    scannerStatus.textContent =
      "NOT A LISTORE QR CODE";


    scanLocked = false;

    return;

  }


  try {

    let encoded;


    try {

      const url =
        new URL(decodedText);

      encoded =
        url.hash.substring(7);

    } catch {

      const hashIndex =
        decodedText.indexOf(
          "#share="
        );


      encoded =
        decodedText.substring(
          hashIndex + 7
        );

    }


    encoded =
      decodeURIComponent(
        encoded
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


    const importedList = {

      id: generateId(),

      name: sharedList.name,

      items:
        sharedList.items.map(
          item => ({

            text:
              String(
                item.text
              ),

            done:
              Boolean(
                item.done
              )

          })
        )

    };


    lists.push(
      importedList
    );


    saveLists();


    scannerStatus.textContent =
      "LIST IMPORTED";


    stopScanner();


    setTimeout(
      () => {

        showListore();

        openList(
          importedList.id
        );

      },
      500
    );

  } catch (error) {

    console.error(
      "QR processing error:",
      error
    );


    scannerStatus.textContent =
      "INVALID LISTORE QR";


    scanLocked = false;

  }

}


startScannerBtn.addEventListener(
  "click",
  startScanner
);


stopScannerBtn.addEventListener(
  "click",
  stopScanner
);


/* =========================================================
   CLOCK
   ========================================================= */


/* ---------- UPDATE PLANETS ---------- */

function updatePlanetPositions(now) {

  const minutes =
    now.getMinutes();

  const seconds =
    now.getSeconds();

  const milliseconds =
    now.getMilliseconds();


  /*
    Minute planet:
    60 minutes = 360 degrees.

    We include seconds and milliseconds so
    the movement is smooth and accurate.
  */

  const minuteValue =
    minutes +
    seconds / 60 +
    milliseconds / 60000;


  const minuteAngle =
    minuteValue * 6;


  /*
    Second planet:
    60 seconds = 360 degrees.
  */

  const secondValue =
    seconds +
    milliseconds / 1000;


  const secondAngle =
    secondValue * 6;


  minutePlanet.style.transform =
    `rotate(${minuteAngle}deg) translateX(102px)`;


  secondPlanet.style.transform =
    `rotate(${secondAngle}deg) translateX(135px)`;

}


/* ---------- UPDATE CLOCK ---------- */

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


  updatePlanetPositions(
    now
  );

}


setInterval(
  updateClock,
  250
);

updateClock();


/* =========================================================
   WEATHER
   ========================================================= */

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


    if (!response.ok) {

      throw new Error(
        "Weather request failed"
      );

    }


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


/* =========================================================
   START
   ========================================================= */

loadLists();

renderLists();

importSharedListFromHash();
