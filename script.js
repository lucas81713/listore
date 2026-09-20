const form = document.getElementById("listForm");
const input = document.getElementById("itemInput");
const list = document.getElementById("list");

const homeTab = document.getElementById("homeTab");
const listoreTab = document.getElementById("listoreTab");

const homePage = document.getElementById("homePage");
const listorePage = document.getElementById("listorePage");

const clockTime = document.getElementById("clockTime");
const clockPeriod = document.getElementById("clockPeriod");
const clockDate = document.getElementById("clockDate");

const minutePlanet = document.getElementById("minutePlanet");
const secondPlanet = document.getElementById("secondPlanet");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const highTemperature = document.getElementById("highTemperature");
const lowTemperature = document.getElementById("lowTemperature");
const rainChance = document.getElementById("rainChance");


/* ---------- PAGE SWITCHING ---------- */

function showHome() {
  homePage.classList.add("active");
  listorePage.classList.remove("active");

  homeTab.classList.add("active");
  listoreTab.classList.remove("active");
}

function showListore() {
  listorePage.classList.add("active");
  homePage.classList.remove("active");

  listoreTab.classList.add("active");
  homeTab.classList.remove("active");
}

homeTab.addEventListener("click", showHome);
listoreTab.addEventListener("click", showListore);


/* ---------- CLOCK ---------- */

function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  clockTime.textContent =
    `${hours}:${String(minutes).padStart(2, "0")}`;

  clockPeriod.textContent = period;


  const dateOptions = {
    weekday: "long",
    month: "long",
    day: "numeric"
  };

  clockDate.textContent =
    now
      .toLocaleDateString("en-US", dateOptions)
      .toUpperCase();


  updatePlanets(minutes, seconds);
}


/* ---------- ORBITING PLANETS ---------- */

function updatePlanets(minutes, seconds) {
  const system = document.querySelector(".orbit-system");

  if (!system) {
    return;
  }

  const size = system.getBoundingClientRect().width;

  const center = size / 2;


  /* ---------- MINUTE PLANET ---------- */

  const minuteRadius = size * 0.45;

  const minuteProgress =
    (minutes + seconds / 60) / 60;

  const minuteAngle =
    minuteProgress * Math.PI * 2 - Math.PI / 2;

  const minuteX =
    center + Math.cos(minuteAngle) * minuteRadius;

  const minuteY =
    center + Math.sin(minuteAngle) * minuteRadius;

  minutePlanet.style.left = `${minuteX}px`;
  minutePlanet.style.top = `${minuteY}px`;


  /* ---------- SECOND PLANET ---------- */

  const secondRadius = size * 0.335;

  const secondProgress =
    seconds / 60;

  const secondAngle =
    secondProgress * Math.PI * 2 - Math.PI / 2;

  const secondX =
    center + Math.cos(secondAngle) * secondRadius;

  const secondY =
    center + Math.sin(secondAngle) * secondRadius;

  secondPlanet.style.left = `${secondX}px`;
  secondPlanet.style.top = `${secondY}px`;
}


/* ---------- SAVE LIST ---------- */

function saveList() {
  const items = [];

  document.querySelectorAll("#list li").forEach(li => {

    items.push({
      text: li.querySelector("span").textContent,
      done: li.querySelector("span").classList.contains("done")
    });

  });

  localStorage.setItem(
    "listoreData",
    JSON.stringify(items)
  );
}


/* ---------- CREATE ITEM ---------- */

function createItem(text, done = false) {

  const li = document.createElement("li");

  const span = document.createElement("span");

  span.textContent = text;

  if (done) {
    span.classList.add("done");
  }


  span.addEventListener("click", () => {

    span.classList.toggle("done");

    saveList();

  });


  const del = document.createElement("button");

  del.textContent = "✕";

  del.className = "delete-btn";


  del.addEventListener("click", (e) => {

    e.stopPropagation();

    li.remove();

    saveList();

  });


  li.appendChild(span);

  li.appendChild(del);

  list.prepend(li);

  saveList();
}


/* ---------- FORM SUBMIT ---------- */

form.addEventListener("submit", (e) => {

  e.preventDefault();

  const text = input.value.trim();

  if (!text) {
    return;
  }

  createItem(text);

  input.value = "";
});


/* ---------- WEATHER ---------- */

const weatherCodes = {

  0: {
    description: "Clear Sky",
    icon: "☀"
  },

  1: {
    description: "Mainly Clear",
    icon: "🌤"
  },

  2: {
    description: "Partly Cloudy",
    icon: "⛅"
  },

  3: {
    description: "Overcast",
    icon: "☁"
  },

  45: {
    description: "Foggy",
    icon: "🌫"
  },

  48: {
    description: "Foggy",
    icon: "🌫"
  },

  51: {
    description: "Light Drizzle",
    icon: "🌦"
  },

  53: {
    description: "Drizzle",
    icon: "🌦"
  },

  55: {
    description: "Heavy Drizzle",
    icon: "🌧"
  },

  61: {
    description: "Light Rain",
    icon: "🌦"
  },

  63: {
    description: "Rain",
    icon: "🌧"
  },

  65: {
    description: "Heavy Rain",
    icon: "🌧"
  },

  71: {
    description: "Light Snow",
    icon: "🌨"
  },

  73: {
    description: "Snow",
    icon: "❄"
  },

  75: {
    description: "Heavy Snow",
    icon: "❄"
  },

  80: {
    description: "Rain Showers",
    icon: "🌦"
  },

  81: {
    description: "Rain Showers",
    icon: "🌧"
  },

  82: {
    description: "Heavy Showers",
    icon: "🌧"
  },

  95: {
    description: "Thunderstorm",
    icon: "⛈"
  },

  96: {
    description: "Thunderstorm",
    icon: "⛈"
  },

  99: {
    description: "Thunderstorm",
    icon: "⛈"
  }

};


/* ---------- LOAD WEATHER ---------- */

async function loadWeather() {

  try {

    const latitude = 43.8561;
    const longitude = -79.3370;

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&temperature_unit=celsius` +
      `&timezone=America%2FToronto`;


    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }


    const data = await response.json();

    const current = data.current;
    const daily = data.daily;


    const weather =
      weatherCodes[current.weather_code] || {
        description: "Unknown",
        icon: "🌡"
      };


    temperature.textContent =
      `${Math.round(current.temperature_2m)}°C`;


    weatherDescription.textContent =
      weather.description;


    weatherIcon.textContent =
      weather.icon;


    highTemperature.textContent =
      `${Math.round(daily.temperature_2m_max[0])}°`;


    lowTemperature.textContent =
      `${Math.round(daily.temperature_2m_min[0])}°`;


    rainChance.textContent =
      `${daily.precipitation_probability_max[0]}%`;

  } catch (error) {

    temperature.textContent = "--°C";

    weatherDescription.textContent =
      "Weather unavailable";

    highTemperature.textContent = "--°";

    lowTemperature.textContent = "--°";

    rainChance.textContent = "--%";
  }
}


/* ---------- LOAD SAVED ITEMS ---------- */

window.addEventListener("DOMContentLoaded", () => {

  const saved =
    JSON.parse(
      localStorage.getItem("listoreData")
    ) || [];


  saved.reverse().forEach(item => {

    createItem(
      item.text,
      item.done
    );

  });

});


/* ---------- START ---------- */

showHome();

updateClock();

setInterval(updateClock, 1000);

loadWeather();

setInterval(
  loadWeather,
  30 * 60 * 1000
);
