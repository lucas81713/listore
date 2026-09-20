const STORAGE_KEY = "listoreLists";

let lists = {};
let currentListId = null;
let scanner = null;
let scannerRunning = false;


/* =========================================================
   STORAGE
========================================================= */

function loadLists() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (saved) {

        try {

            lists = JSON.parse(saved);

        } catch {

            lists = {};

        }

    }


    if (!Object.keys(lists).length) {

        const oldData =
            localStorage.getItem("listoreData");

        let oldItems = [];

        if (oldData) {

            try {

                oldItems = JSON.parse(oldData);

            } catch {

                oldItems = [];

            }

        }


        lists = {

            myList: {

                name: "My List",

                items: oldItems

            }

        };

        saveLists();

    }

}


function saveLists() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lists)
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

const navButtons =
    document.querySelectorAll(".nav-button");

const pages =
    document.querySelectorAll(".page");


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const pageId =
            button.dataset.page;


        navButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        pages.forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


        button.classList.add("active");


        document
            .getElementById(pageId)
            .classList.add("active-page");


        if (pageId === "scanPage") {

            scannerStatus(
                "Camera is ready."
            );

        }

    });

});


/* =========================================================
   LIST COUNT
========================================================= */

function updateListCount() {

    const count =
        document.getElementById(
            "listCount"
        );

    if (!count) return;

    count.textContent =
        Object.keys(lists).length;

}


/* =========================================================
   RENDER LISTS
========================================================= */

function renderLists() {

    const container =
        document.getElementById(
            "listsContainer"
        );

    container.innerHTML = "";


    Object.entries(lists)
        .forEach(([id, list]) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "list-card";


            card.innerHTML = `

                <div class="list-card-top">

                    <div class="list-card-icon">
                        ☷
                    </div>

                    <div class="list-card-menu">

                        <button
                            class="rename-list"
                            data-id="${id}"
                            title="Rename">

                            ✎

                        </button>

                        <button
                            class="delete-list"
                            data-id="${id}"
                            title="Delete">

                            ×

                        </button>

                    </div>

                </div>


                <h3>
                    ${escapeHtml(list.name)}
                </h3>


                <p>
                    ${list.items.length}
                    ${list.items.length === 1
                        ? "item"
                        : "items"}
                </p>

            `;


            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".rename-list"
                        ) ||
                        event.target.closest(
                            ".delete-list"
                        )
                    ) {

                        return;

                    }


                    openList(id);

                }
            );


            container.appendChild(card);

        });


    document
        .querySelectorAll(".rename-list")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openRenameModal(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".delete-list")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    deleteList(
                        button.dataset.id
                    );

                }
            );

        });


    updateListCount();

}


/* =========================================================
   CREATE LIST
========================================================= */

document
    .getElementById("newListButton")
    .addEventListener(
        "click",
        () => {

            openModal(
                "newListModal"
            );


            setTimeout(() => {

                document
                    .getElementById(
                        "newListName"
                    )
                    .focus();

            }, 100);

        }
    );


document
    .getElementById(
        "createListConfirm"
    )
    .addEventListener(
        "click",
        createList
    );


document
    .getElementById(
        "newListName"
    )
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                createList();

            }

        }
    );


function createList() {

    const input =
        document.getElementById(
            "newListName"
        );


    const name =
        input.value.trim();


    if (!name) return;


    const id =
        "list_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 7);


    lists[id] = {

        name,

        items: []

    };


    saveLists();

    input.value = "";

    closeModal(
        "newListModal"
    );

    renderLists();

    openList(id);

}


/* =========================================================
   OPEN LIST
========================================================= */

function openList(id) {

    if (!lists[id]) return;


    currentListId = id;


    document
        .getElementById(
            "listsContainer"
        )
        .classList.add(
            "hidden"
        );


    document
        .querySelector(
            "#listorePage .page-heading"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "individualList"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "currentListName"
        )
        .textContent =
        lists[id].name;


    renderItems();

}


/* =========================================================
   BACK TO LISTS
========================================================= */

document
    .getElementById(
        "backToLists"
    )
    .addEventListener(
        "click",
        () => {

            currentListId = null;


            document
                .getElementById(
                    "individualList"
                )
                .classList.add(
                    "hidden"
                );


            document
                .getElementById(
                    "listsContainer"
                )
                .classList.remove(
                    "hidden"
                );


            document
                .querySelector(
                    "#listorePage .page-heading"
                )
                .classList.remove(
                    "hidden"
                );


            renderLists();

        }
    );


/* =========================================================
   RENAME
========================================================= */

document
    .getElementById(
        "renameListButton"
    )
    .addEventListener(
        "click",
        () => {

            if (!currentListId) return;

            openRenameModal(
                currentListId
            );

        }
    );


function openRenameModal(id) {

    const list =
        lists[id];


    if (!list) return;


    document
        .getElementById(
            "renameInput"
        )
        .value =
        list.name;


    document
        .getElementById(
            "renameConfirm"
        )
        .dataset.id =
        id;


    openModal(
        "renameModal"
    );


    setTimeout(() => {

        document
            .getElementById(
                "renameInput"
            )
            .focus();

    }, 100);

}


document
    .getElementById(
        "renameConfirm"
    )
    .addEventListener(
        "click",
        () => {

            const id =
                document
                    .getElementById(
                        "renameConfirm"
                    )
                    .dataset.id;


            const name =
                document
                    .getElementById(
                        "renameInput"
                    )
                    .value
                    .trim();


            if (
                !name ||
                !lists[id]
            ) {

                return;

            }


            lists[id].name =
                name;


            saveLists();

            closeModal(
                "renameModal"
            );

            renderLists();


            if (
                currentListId === id
            ) {

                document
                    .getElementById(
                        "currentListName"
                    )
                    .textContent =
                    name;

            }

        }
    );


/* =========================================================
   DELETE LIST
========================================================= */

function deleteList(id) {

    if (!lists[id]) return;


    const confirmed =
        confirm(
            `Delete "${lists[id].name}"?`
        );


    if (!confirmed) return;


    delete lists[id];


    if (
        !Object.keys(lists).length
    ) {

        const newId =
            "list_" +
            Date.now();


        lists[newId] = {

            name: "My List",

            items: []

        };

    }


    saveLists();

    renderLists();

}


/* =========================================================
   ITEMS
========================================================= */

document
    .getElementById(
        "itemForm"
    )
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!currentListId) return;


            const input =
                document
                    .getElementById(
                        "itemInput"
                    );


            const text =
                input.value.trim();


            if (!text) return;


            lists[currentListId]
                .items
                .unshift({

                    text,

                    done: false

                });


            saveLists();

            input.value = "";

            renderItems();

        }
    );


function renderItems() {

    const listElement =
        document.getElementById(
            "list"
        );


    listElement.innerHTML = "";


    if (!currentListId) return;


    const items =
        lists[currentListId].items;


    items.forEach(
        (item, index) => {

            const li =
                document.createElement(
                    "li"
                );


            li.className =
                "list-item" +
                (
                    item.done
                        ? " done"
                        : ""
                );


            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                item.text;


            span.addEventListener(
                "click",
                () => {

                    item.done =
                        !item.done;


                    saveLists();

                    renderItems();

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-item";


            deleteButton.textContent =
                "×";


            deleteButton.addEventListener(
                "click",
                () => {

                    lists[currentListId]
                        .items
                        .splice(
                            index,
                            1
                        );


                    saveLists();

                    renderItems();

                }
            );


            li.appendChild(span);

            li.appendChild(
                deleteButton
            );

            listElement.appendChild(
                li
            );

        }
    );

}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add(
            "show"
        );

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove(
            "show"
        );

}


document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closeModal(
                    button.dataset.close
                );

            }
        );

    });


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    });


/* =========================================================
   QR SHARING
========================================================= */

document
    .getElementById(
        "shareListButton"
    )
    .addEventListener(
        "click",
        () => {

            if (!currentListId) return;


            const list =
                lists[currentListId];


            const payload =
                encodeList(list);


            const shareUrl =
                window.location.href
                    .split("#")[0] +
                "#share=" +
                payload;


            document
                .getElementById(
                    "shareListTitle"
                )
                .textContent =
                list.name;


            const qrContainer =
                document.getElementById(
                    "qrCode"
                );


            qrContainer.innerHTML =
                "";


            new QRCode(
                qrContainer,
                {

                    text: shareUrl,

                    width: 180,

                    height: 180,

                    colorDark:
                        "#05080d",

                    colorLight:
                        "#ffffff",

                    correctLevel:
                        QRCode.CorrectLevel.M

                }
            );


            document
                .getElementById(
                    "copyShareLink"
                )
                .dataset.link =
                shareUrl;


            openModal(
                "shareModal"
            );

        }
    );


/* COPY SHARE LINK */

document
    .getElementById(
        "copyShareLink"
    )
    .addEventListener(
        "click",
        async () => {

            const link =
                document
                    .getElementById(
                        "copyShareLink"
                    )
                    .dataset.link;


            try {

                await navigator
                    .clipboard
                    .writeText(link);


                const button =
                    document
                        .getElementById(
                            "copyShareLink"
                        );


                const oldText =
                    button.textContent;


                button.textContent =
                    "✓ COPIED";


                setTimeout(
                    () => {

                        button.textContent =
                            oldText;

                    },
                    1500
                );


            } catch {

                alert(
                    "Unable to copy the link."
                );

            }

        }
    );


/* =========================================================
   QR ENCODE / DECODE
========================================================= */

function encodeList(list) {

    const json =
        JSON.stringify(list);


    return btoa(
        encodeURIComponent(json)
            .replace(
                /%([0-9A-F]{2})/g,
                (_, p1) =>
                    String.fromCharCode(
                        parseInt(
                            p1,
                            16
                        )
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
                char =>
                    "%" +
                    char
                        .charCodeAt(0)
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
            )
            .join("");


    return JSON.parse(
        decodeURIComponent(
            percentEncoded
        )
    );

}


/* =========================================================
   IMPORT SHARE LINK
========================================================= */

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
            hash.substring(7);


        const sharedList =
            decodeList(encoded);


        if (
            !sharedList ||
            typeof sharedList.name !==
                "string" ||
            !Array.isArray(
                sharedList.items
            )
        ) {

            throw new Error(
                "Invalid list"
            );

        }


        const id =
            "imported_" +
            Date.now();


        lists[id] = {

            name:
                sharedList.name +
                " (Imported)",

            items:
                sharedList.items

        };


        saveLists();


        window.history.replaceState(
            {},
            document.title,
            window.location.pathname +
            window.location.search
        );


        renderLists();


        alert(
            `"${sharedList.name}" was imported successfully!`
        );


    } catch {

        alert(
            "This QR code does not contain a valid Listore list."
        );

    }

}


/* =========================================================
   QR SCANNER
========================================================= */

function scannerStatus(message) {

    document
        .getElementById(
            "scannerStatus"
        )
        .textContent =
        message;

}


document
    .getElementById(
        "startScanner"
    )
    .addEventListener(
        "click",
        startScanner
    );


document
    .getElementById(
        "stopScanner"
    )
    .addEventListener(
        "click",
        stopScanner
    );


async function startScanner() {

    if (scannerRunning) return;


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        scannerStatus(
            "QR scanner library could not load."
        );

        return;

    }


    if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !==
            "127.0.0.1"
    ) {

        scannerStatus(
            "Camera scanning requires HTTPS or localhost."
        );

        return;

    }


    try {

        scanner =
            new Html5Qrcode(
                "qr-reader"
            );


        const cameras =
            await Html5Qrcode
                .getCameras();


        if (!cameras.length) {

            throw new Error(
                "No camera found."
            );

        }


        let cameraId =
            cameras[0].id;


        const preferredCamera =
            cameras.find(
                camera =>
                    /back|rear|environment/i
                        .test(
                            camera.label
                        )
            );


        if (preferredCamera) {

            cameraId =
                preferredCamera.id;

        }


        await scanner.start(

            cameraId,

            {

                fps: 10,

                qrbox: {

                    width: 230,

                    height: 230

                }

            },

            decodedText => {

                handleScannedQR(
                    decodedText
                );

            },

            () => {}

        );


        scannerRunning = true;


        scannerStatus(
            "Camera active. Point it at a Listore QR code."
        );


    } catch (error) {

        console.error(error);


        scannerStatus(
            "Unable to start the camera. Check camera permissions and HTTPS."
        );


        scanner = null;

        scannerRunning = false;

    }

}


async function stopScanner() {

    if (
        !scanner ||
        !scannerRunning
    ) {

        scannerStatus(
            "Camera is stopped."
        );

        return;

    }


    try {

        await scanner.stop();

        scanner.clear();

    } catch (error) {

        console.error(error);

    }


    scanner = null;

    scannerRunning = false;


    scannerStatus(
        "Camera stopped."
    );

}


/* HANDLE QR */

function handleScannedQR(text) {

    if (
        !text.startsWith(
            "#share="
        ) &&
        !text.includes(
            "#share="
        )
    ) {

        scannerStatus(
            "That QR code is not a Listore share code."
        );

        return;

    }


    let hash;


    if (
        text.includes(
            "#share="
        )
    ) {

        hash =
            text.substring(
                text.indexOf(
                    "#share="
                )
            );

    } else {

        hash = text;

    }


    try {

        const encoded =
            hash.substring(7);


        const sharedList =
            decodeList(encoded);


        if (
            !sharedList ||
            typeof sharedList.name !==
                "string" ||
            !Array.isArray(
                sharedList.items
            )
        ) {

            throw new Error();

        }


        const id =
            "scanned_" +
            Date.now();


        lists[id] = {

            name:
                sharedList.name +
                " (Imported)",

            items:
                sharedList.items

        };


        saveLists();

        renderLists();


        scannerStatus(
            `"${sharedList.name}" imported successfully!`
        );


        stopScanner();


        document
            .querySelector(
                '[data-page="listorePage"]'
            )
            .click();


    } catch {

        scannerStatus(
            "Invalid Listore QR code."
        );

    }

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            undefined,
            {

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit",

                hour12: false

            }
        );


    const date =
        now.toLocaleDateString(
            undefined,
            {

                weekday: "long",

                month: "long",

                day: "numeric",

                year: "numeric"

            }
        );


    document
        .getElementById(
            "clockTime"
        )
        .textContent =
        time;


    document
        .getElementById(
            "clockDate"
        )
        .textContent =
        date;

}


/* =========================================================
   WEATHER
========================================================= */

async function loadWeather() {

    const weatherText =
        document.getElementById(
            "weatherText"
        );


    const weatherTemp =
        document.getElementById(
            "weatherTemp"
        );


    const weatherIcon =
        document.getElementById(
            "weatherIcon"
        );


    if (
        !navigator.geolocation
    ) {

        weatherText.textContent =
            "Location unavailable";

        return;

    }


    navigator.geolocation.getCurrentPosition(

        async position => {

            try {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                const url =
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;


                const response =
                    await fetch(url);


                const data =
                    await response.json();


                const temperature =
                    Math.round(
                        data.current
                            .temperature_2m
                    );


                const code =
                    data.current
                        .weather_code;


                const condition =
                    getWeatherCondition(
                        code
                    );


                weatherText.textContent =
                    condition.text;


                weatherTemp.textContent =
                    `${temperature}°`;


                weatherIcon.textContent =
                    condition.icon;


            } catch {

                weatherText.textContent =
                    "Weather unavailable";

            }

        },


        () => {

            weatherText.textContent =
                "Location permission needed";

            weatherTemp.textContent =
                "--";

        }

    );

}


function getWeatherCondition(code) {

    if (code === 0) {

        return {
            text: "Clear skies",
            icon: "☀️"
        };

    }


    if (code <= 3) {

        return {
            text: "Partly cloudy",
            icon: "⛅"
        };

    }


    if (code <= 48) {

        return {
            text: "Cloudy",
            icon: "☁️"
        };

    }


    if (code <= 67) {

        return {
            text: "Rain",
            icon: "🌧️"
        };

    }


    if (code <= 77) {

        return {
            text: "Snow",
            icon: "❄️"
        };

    }


    if (code <= 82) {

        return {
            text: "Rain showers",
            icon: "🌦️"
        };

    }


    return {

        text: "Stormy",

        icon: "⛈️"

    };

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLists();

        renderLists();

        updateClock();

        setInterval(
            updateClock,
            250
        );

        loadWeather();

        importSharedListFromHash();

    }
);
