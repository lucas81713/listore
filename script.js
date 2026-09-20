const STORAGE_KEY = "listoreLists";

let lists = {};
let currentListId = null;
let renameListId = null;
let html5QrCode = null;
let scannerRunning = false;


/* =========================
   STORAGE
========================= */

function saveLists() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

function loadLists() {
    const savedLists = localStorage.getItem(STORAGE_KEY);

    if (savedLists) {
        try {
            lists = JSON.parse(savedLists);
        } catch {
            lists = {};
        }
    }

    /*
     * Migrate old Listore data if it exists.
     */
    if (Object.keys(lists).length === 0) {
        const oldData = localStorage.getItem("listoreData");

        if (oldData) {
            try {
                const oldItems = JSON.parse(oldData);

                lists = {
                    my_list: {
                        name: "My List",
                        items: Array.isArray(oldItems) ? oldItems : []
                    }
                };

                saveLists();
            } catch {
                lists = {};
            }
        }
    }
}


/* =========================
   NAVIGATION
========================= */

const homeTab = document.getElementById("homeTab");
const listoreTab = document.getElementById("listoreTab");
const scanTab = document.getElementById("scanTab");

const homePage = document.getElementById("homePage");
const listorePage = document.getElementById("listorePage");
const scanPage = document.getElementById("scanPage");

function showPage(pageName) {

    homePage.classList.remove("active");
    listorePage.classList.remove("active");
    scanPage.classList.remove("active");

    homeTab.classList.remove("active");
    listoreTab.classList.remove("active");
    scanTab.classList.remove("active");

    if (pageName === "home") {
        homePage.classList.add("active");
        homeTab.classList.add("active");
    }

    if (pageName === "listore") {
        listorePage.classList.add("active");
        listoreTab.classList.add("active");
        renderLists();
    }

    if (pageName === "scan") {
        scanPage.classList.add("active");
        scanTab.classList.add("active");
    }
}

homeTab.addEventListener("click", () => showPage("home"));
listoreTab.addEventListener("click", () => showPage("listore"));

scanTab.addEventListener("click", () => {
    showPage("scan");
});


/* =========================
   ANALOG CLOCK
========================= */

function updateClock() {

    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    /*
     * The minute hand moves continuously.
     *
     * Example:
     * 10:30:30
     * = 30.5 minutes
     */
    const minuteValue = minutes + seconds / 60;

    /*
     * The hour hand also moves continuously.
     *
     * Example:
     * 10:30
     * = halfway between 10 and 11
     */
    const hourValue = (hours % 12) + minutes / 60;

    const minuteAngle = minuteValue * 6;
    const hourAngle = hourValue * 30;

    const hourHand = document.getElementById("hourHand");
    const minuteHand = document.getElementById("minuteHand");

    hourHand.style.transform =
        `translateX(-50%) rotate(${hourAngle}deg)`;

    minuteHand.style.transform =
        `translateX(-50%) rotate(${minuteAngle}deg)`;


    /*
     * Digital clock
     */

    const hours12 = hours % 12 || 12;

    const formattedHours = String(hours12).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    document.getElementById("digitalTime").textContent =
        `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;


    /*
     * Date
     */

    const dateText = now.toLocaleDateString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.getElementById("todayDate").textContent =
        dateText.toUpperCase();
}

updateClock();
setInterval(updateClock, 250);


/* =========================
   WEATHER
========================= */

async function loadWeather() {

    const weatherIcon = document.getElementById("weatherIcon");
    const weatherTemp = document.getElementById("weatherTemp");
    const weatherDescription =
        document.getElementById("weatherDescription");

    /*
     * Existing configured weather location.
     * This does not request the user's device location.
     */
    const latitude = 43.8561;
    const longitude = -79.3370;

    try {

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        const temperature = Math.round(
            data.current.temperature_2m
        );

        const code = data.current.weather_code;

        let description = "CLEAR";
        let icon = "☀";

        if ([1, 2, 3].includes(code)) {
            description = "PARTLY CLOUDY";
            icon = "☁";
        }

        if ([45, 48].includes(code)) {
            description = "FOG";
            icon = "≋";
        }

        if ([51, 53, 55, 56, 57].includes(code)) {
            description = "DRIZZLE";
            icon = "☂";
        }

        if ([61, 63, 65, 66, 67].includes(code)) {
            description = "RAIN";
            icon = "☂";
        }

        if ([71, 73, 75, 77].includes(code)) {
            description = "SNOW";
            icon = "❄";
        }

        if ([80, 81, 82].includes(code)) {
            description = "RAIN SHOWERS";
            icon = "☂";
        }

        if ([85, 86].includes(code)) {
            description = "SNOW SHOWERS";
            icon = "❄";
        }

        if ([95, 96, 99].includes(code)) {
            description = "THUNDERSTORM";
            icon = "⚡";
        }

        weatherIcon.textContent = icon;
        weatherTemp.textContent = `${temperature}°`;
        weatherDescription.textContent = description;

    } catch (error) {

        weatherIcon.textContent = "--";
        weatherTemp.textContent = "--°";
        weatherDescription.textContent =
            "WEATHER UNAVAILABLE";
    }
}

loadWeather();


/* =========================
   LIST RENDERING
========================= */

function renderLists() {

    const container = document.getElementById("listsContainer");
    const emptyLists = document.getElementById("emptyLists");
    const listView = document.getElementById("listView");

    if (currentListId && lists[currentListId]) {
        container.style.display = "none";
        emptyLists.style.display = "none";
        listView.classList.remove("hidden");

        renderCurrentList();
        return;
    }

    listView.classList.add("hidden");
    container.style.display = "";
    container.innerHTML = "";

    const listIds = Object.keys(lists);

    if (listIds.length === 0) {
        emptyLists.style.display = "";
        return;
    }

    emptyLists.style.display = "none";

    listIds.forEach(id => {

        const list = lists[id];

        const card = document.createElement("div");
        card.className = "list-card";

        const main = document.createElement("div");
        main.className = "list-card-main";

        main.innerHTML = `
            <div class="list-card-title"></div>
            <div class="list-card-count"></div>
        `;

        main.querySelector(".list-card-title").textContent =
            list.name;

        main.querySelector(".list-card-count").textContent =
            `${list.items.length} ITEM${list.items.length === 1 ? "" : "S"}`;

        main.addEventListener("click", () => {
            openList(id);
        });


        const actions = document.createElement("div");
        actions.className = "list-card-actions";


        const renameButton = document.createElement("button");
        renameButton.className = "icon-button";
        renameButton.type = "button";
        renameButton.textContent = "✎";
        renameButton.title = "Rename list";

        renameButton.addEventListener("click", event => {
            event.stopPropagation();
            openRenameModal(id);
        });


        const deleteButton = document.createElement("button");
        deleteButton.className = "icon-button";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete list";

        deleteButton.addEventListener("click", event => {
            event.stopPropagation();
            deleteList(id);
        });


        actions.appendChild(renameButton);
        actions.appendChild(deleteButton);

        card.appendChild(main);
        card.appendChild(actions);

        container.appendChild(card);
    });
}


/* =========================
   OPEN LIST
========================= */

function openList(id) {

    if (!lists[id]) {
        return;
    }

    currentListId = id;
    renderLists();
}


/* =========================
   CURRENT LIST
========================= */

function renderCurrentList() {

    if (!currentListId || !lists[currentListId]) {
        return;
    }

    const currentList = lists[currentListId];

    document.getElementById("currentListTitle").textContent =
        currentList.name;

    const listElement = document.getElementById("list");
    const emptyItems = document.getElementById("emptyItems");

    listElement.innerHTML = "";

    if (currentList.items.length === 0) {
        emptyItems.style.display = "";
        return;
    }

    emptyItems.style.display = "none";

    currentList.items.forEach((item, index) => {

        const li = document.createElement("li");
        li.className = "list-item";

        if (item.done) {
            li.classList.add("done");
        }


        const text = document.createElement("span");
        text.className = "list-item-text";
        text.textContent = item.text;

        text.addEventListener("click", () => {
            toggleItem(index);
        });


        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-item";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete item";

        deleteButton.addEventListener("click", () => {
            deleteItem(index);
        });


        li.appendChild(text);
        li.appendChild(deleteButton);

        listElement.appendChild(li);
    });
}


/* =========================
   ADD ITEM
========================= */

document.getElementById("itemForm").addEventListener("submit", event => {

    event.preventDefault();

    if (!currentListId || !lists[currentListId]) {
        return;
    }

    const input = document.getElementById("itemInput");
    const text = input.value.trim();

    if (!text) {
        return;
    }

    lists[currentListId].items.unshift({
        text: text,
        done: false
    });

    saveLists();

    input.value = "";

    renderCurrentList();
});


/* =========================
   TOGGLE ITEM
========================= */

function toggleItem(index) {

    if (!currentListId || !lists[currentListId]) {
        return;
    }

    const item = lists[currentListId].items[index];

    if (!item) {
        return;
    }

    item.done = !item.done;

    saveLists();
    renderCurrentList();
}


/* =========================
   DELETE ITEM
========================= */

function deleteItem(index) {

    if (!currentListId || !lists[currentListId]) {
        return;
    }

    lists[currentListId].items.splice(index, 1);

    saveLists();
    renderCurrentList();
}


/* =========================
   BACK TO LISTS
========================= */

document.getElementById("backToLists").addEventListener("click", () => {

    currentListId = null;

    document.getElementById("itemInput").value = "";

    renderLists();
});


/* =========================
   CREATE LIST
========================= */

const newListModal = document.getElementById("newListModal");

document.getElementById("newListButton").addEventListener("click", () => {

    document.getElementById("newListName").value = "";

    newListModal.classList.remove("hidden");

    setTimeout(() => {
        document.getElementById("newListName").focus();
    }, 50);
});


document.getElementById("closeNewList").addEventListener("click", () => {
    newListModal.classList.add("hidden");
});


document.getElementById("newListForm").addEventListener("submit", event => {

    event.preventDefault();

    const input = document.getElementById("newListName");
    const name = input.value.trim();

    if (!name) {
        return;
    }

    let id = "list_" + Date.now();

    lists[id] = {
        name: name,
        items: []
    };

    saveLists();

    newListModal.classList.add("hidden");

    currentListId = id;

    renderLists();
});


/* =========================
   DELETE LIST
========================= */

function deleteList(id) {

    if (!lists[id]) {
        return;
    }

    const confirmed = confirm(
        `Delete "${lists[id].name}"?`
    );

    if (!confirmed) {
        return;
    }

    delete lists[id];

    saveLists();

    if (currentListId === id) {
        currentListId = null;
    }

    renderLists();
}


/* =========================
   RENAME LIST
========================= */

const renameListModal =
    document.getElementById("renameListModal");


function openRenameModal(id) {

    if (!lists[id]) {
        return;
    }

    renameListId = id;

    document.getElementById("renameListName").value =
        lists[id].name;

    renameListModal.classList.remove("hidden");

    setTimeout(() => {
        document.getElementById("renameListName").focus();
    }, 50);
}


document.getElementById("closeRenameList").addEventListener("click", () => {
    renameListModal.classList.add("hidden");
});


document.getElementById("renameListForm").addEventListener("submit", event => {

    event.preventDefault();

    if (!renameListId || !lists[renameListId]) {
        return;
    }

    const input = document.getElementById("renameListName");
    const name = input.value.trim();

    if (!name) {
        return;
    }

    lists[renameListId].name = name;

    saveLists();

    renameListModal.classList.add("hidden");

    renderLists();
});


/* =========================
   QR SHARING
========================= */

const shareModal =
    document.getElementById("shareModal");


function encodeList(id) {

    const data = {
        type: "listore-share",
        version: 1,
        list: lists[id]
    };

    const json = JSON.stringify(data);

    return btoa(
        encodeURIComponent(json).replace(
            /%([0-9A-F]{2})/g,
            function (match, p1) {
                return String.fromCharCode(
                    parseInt(p1, 16)
                );
            }
        )
    );
}


function decodeList(encoded) {

    try {

        const binary = atob(encoded);

        const percentEncoded = Array
            .from(binary)
            .map(char => {
                return "%" +
                    char.charCodeAt(0)
                        .toString(16)
                        .padStart(2, "0");
            })
            .join("");

        const json = decodeURIComponent(percentEncoded);

        return JSON.parse(json);

    } catch {
        return null;
    }
}


document.getElementById("shareListButton")
    .addEventListener("click", () => {

        if (!currentListId || !lists[currentListId]) {
            return;
        }

        const encoded = encodeList(currentListId);

        const shareUrl =
            `${window.location.origin}${window.location.pathname}#share=${encoded}`;

        const qrContainer =
            document.getElementById("qrcode");

        qrContainer.innerHTML = "";

        new QRCode(qrContainer, {
            text: shareUrl,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.M
        });

        document.getElementById("shareListName")
            .textContent = lists[currentListId].name;

        shareModal.classList.remove("hidden");
    });


document.getElementById("closeShareModal")
    .addEventListener("click", () => {

        shareModal.classList.add("hidden");
    });


/* =========================
   QR IMPORT FROM URL
========================= */

function importSharedListFromHash() {

    const hash = window.location.hash;

    if (!hash.startsWith("#share=")) {
        return;
    }

    const encoded = hash.substring(7);

    const decoded = decodeList(encoded);

    if (
        !decoded ||
        decoded.type !== "listore-share" ||
        !decoded.list
    ) {
        alert("Invalid Listore QR code.");
        return;
    }

    const originalName =
        decoded.list.name || "Imported List";

    let newName = originalName;

    const existingNames = Object.values(lists)
        .map(list => list.name);

    let counter = 2;

    while (existingNames.includes(newName)) {
        newName = `${originalName} (${counter})`;
        counter++;
    }

    const newId = "list_" + Date.now();

    lists[newId] = {
        name: newName,
        items: Array.isArray(decoded.list.items)
            ? decoded.list.items
            : []
    };

    saveLists();

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

    alert(`Imported "${newName}" successfully.`);

    currentListId = newId;

    showPage("listore");
}


/* =========================
   QR SCANNER
========================= */

const scannerStatus =
    document.getElementById("scannerStatus");

const startScannerButton =
    document.getElementById("startScannerButton");

const stopScannerButton =
    document.getElementById("stopScannerButton");


async function startScanner() {

    if (scannerRunning) {
        return;
    }

    if (typeof Html5Qrcode === "undefined") {

        scannerStatus.textContent =
            "SCANNER LIBRARY FAILED TO LOAD";

        return;
    }

    if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
    ) {

        scannerStatus.textContent =
            "CAMERA REQUIRES HTTPS OR LOCALHOST";

        return;
    }

    scannerStatus.textContent =
        "REQUESTING CAMERA...";

    try {

        const cameras =
            await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
            throw new Error("No camera found.");
        }

        let cameraId = cameras[0].id;

        const rearCamera = cameras.find(camera => {

            const label =
                (camera.label || "").toLowerCase();

            return (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            );
        });

        if (rearCamera) {
            cameraId = rearCamera.id;
        }

        html5QrCode = new Html5Qrcode("qr-reader");

        await html5QrCode.start(
            cameraId,
            {
                fps: 10,
                qrbox: {
                    width: 220,
                    height: 220
                }
            },
            decodedText => {

                handleScannedQRCode(decodedText);

            },
            () => {
                // Ignore normal scan failures.
            }
        );

        scannerRunning = true;

        scannerStatus.textContent =
            "CAMERA ACTIVE — SCAN A LISTORE QR CODE";

    } catch (error) {

        scannerRunning = false;

        scannerStatus.textContent =
            "CAMERA ERROR: " +
            (error.message || "Unable to start camera.");
    }
}


async function stopScanner() {

    if (!html5QrCode || !scannerRunning) {
        return;
    }

    try {

        await html5QrCode.stop();
        html5QrCode.clear();

    } catch {
        // Ignore cleanup errors.
    }

    html5QrCode = null;
    scannerRunning = false;

    scannerStatus.textContent =
        "CAMERA STOPPED";
}


function handleScannedQRCode(decodedText) {

    if (!decodedText) {
        return;
    }

    let encoded = null;

    try {

        const url = new URL(decodedText);

        const hash = url.hash;

        if (hash.startsWith("#share=")) {
            encoded = hash.substring(7);
        }

    } catch {

        if (decodedText.startsWith("#share=")) {
            encoded = decodedText.substring(7);
        }

        if (decodedText.startsWith("share=")) {
            encoded = decodedText.substring(6);
        }
    }

    if (!encoded) {

        scannerStatus.textContent =
            "NOT A VALID LISTORE QR CODE";

        return;
    }

    const decoded = decodeList(encoded);

    if (
        !decoded ||
        decoded.type !== "listore-share" ||
        !decoded.list
    ) {

        scannerStatus.textContent =
            "INVALID LISTORE QR CODE";

        return;
    }

    const originalName =
        decoded.list.name || "Imported List";

    let newName = originalName;

    const existingNames = Object.values(lists)
        .map(list => list.name);

    let counter = 2;

    while (existingNames.includes(newName)) {
        newName = `${originalName} (${counter})`;
        counter++;
    }

    const newId = "list_" + Date.now();

    lists[newId] = {
        name: newName,
        items: Array.isArray(decoded.list.items)
            ? decoded.list.items
            : []
    };

    saveLists();

    stopScanner();

    alert(`Imported "${newName}" successfully.`);

    currentListId = newId;

    showPage("listore");
}


startScannerButton.addEventListener(
    "click",
    startScanner
);

stopScannerButton.addEventListener(
    "click",
    stopScanner
);


/* =========================
   MODAL BACKDROP CLOSE
========================= */

[newListModal, renameListModal, shareModal]
    .forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                modal.classList.add("hidden");
            }

        });

    });


/* =========================
   INITIALIZE
========================= */

loadLists();

renderLists();

importSharedListFromHash();
