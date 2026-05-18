const API_KEY = "596b7c93ed15d91491d662b4f21f2d21";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

/* =========================================================
   DOM ELEMENTS
========================================================= */

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const themeToggle = document.getElementById("theme-toggle");
const locationBtn = document.getElementById("location-btn");

const weatherContent = document.getElementById("weather-content");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const welcomeMessage = document.getElementById("welcome-message");

const recentSearchesContainer =
    document.getElementById("recent-searches");

const forecastContainer =
    document.getElementById("forecast-container");

/* WEATHER DISPLAY ELEMENTS */

const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const weatherIcon = document.getElementById("weather-icon");
const currentTemp = document.getElementById("current-temp");
const weatherDesc = document.getElementById("weather-desc");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const pressure = document.getElementById("pressure");

/* OPTIONAL EXTRA ELEMENTS */

const visibility = document.getElementById("visibility");
const uvIndex = document.getElementById("uv-index");
const rainChance = document.getElementById("rain-chance");
const dewPoint = document.getElementById("dew-point");

/* =========================================================
   APP INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initTheme();

    loadRecentSearches();

    animateWelcome();

});

/* =========================================================
   THEME LOGIC
========================================================= */

function initTheme() {

    const savedTheme =
        localStorage.getItem("theme") || "light";

    document.body.className =
        savedTheme + "-mode";

    updateThemeIcon(savedTheme);

}

/* TOGGLE THEME */

themeToggle.addEventListener("click", () => {

    const isDark =
        document.body.classList.contains("dark-mode");

    const newTheme = isDark ? "light" : "dark";

    document.body.className =
        newTheme + "-mode";

    localStorage.setItem("theme", newTheme);

    updateThemeIcon(newTheme);

});

/* UPDATE ICON */

function updateThemeIcon(theme) {

    const icon =
        themeToggle.querySelector("i");

    icon.className =
        theme === "dark"
            ? "fas fa-sun"
            : "fas fa-moon";

}

/* =========================================================
   SEARCH EVENTS
========================================================= */

/* SEARCH BUTTON */

searchBtn.addEventListener("click", () => {

    const city =
        cityInput.value.trim();

    if (city !== "") {

        fetchWeatherData(city);

        saveRecentSearch(city);

    }

});

/* ENTER KEY SEARCH */

cityInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        const city =
            cityInput.value.trim();

        if (city !== "") {

            fetchWeatherData(city);

            saveRecentSearch(city);

        }

    }

});

/* =========================================================
   GEOLOCATION
========================================================= */

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;

    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            fetchWeatherByCoords(lat, lon);

        },

        () => {

            hideLoading();

            showError(
                "Location access denied."
            );

        }

    );

});

/* =========================================================
   FETCH WEATHER BY CITY
========================================================= */
async function fetchWeatherData(city) {

    showLoading();

    try {

        /* REMOVE EXTRA SPACES */
        city = city.trim();

        /* API REQUEST */
        const response = await fetch(
            `${BASE_URL}weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        /* CONVERT RESPONSE */
        const data = await response.json();

        console.log(data);

        /* HANDLE API ERRORS */

        if (data.cod != 200) {

            throw new Error(
                data.message || "City not found"
            );

        }

        /* DISPLAY WEATHER */

        displayCurrentWeather(data);

        /* FETCH FORECAST */

        fetchForecast(
            data.coord.lat,
            data.coord.lon
        );

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message || "Failed to fetch weather"
        );

    }

    finally {

        hideLoading();

    }

}
/* =========================================================
   FETCH WEATHER BY COORDINATES
========================================================= */

async function fetchWeatherByCoords(lat, lon) {

    showLoading();

    try {

        const response = await fetch(
            `${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {

            throw new Error(
                "Unable to fetch location weather."
            );

        }

        const data =
            await response.json();

        displayCurrentWeather(data);

        fetchForecast(lat, lon);

    }

    catch (error) {

        showError(
            "Failed to fetch weather data."
        );

    }

    finally {

        hideLoading();

    }

}

/* =========================================================
   FETCH 5 DAY FORECAST
========================================================= */

async function fetchForecast(lat, lon) {

    try {

        const response = await fetch(
            `${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        const data =
            await response.json();

        displayForecast(data);

    }

    catch (error) {

        console.error(
            "Forecast Error:",
            error
        );

    }

}

/* =========================================================
   DISPLAY CURRENT WEATHER
========================================================= */

function displayCurrentWeather(data) {

    /* SHOW WEATHER SECTION */

    weatherContent.classList.remove("hidden");

    welcomeMessage.classList.add("hidden");

    errorMessage.classList.add("hidden");

    /* CITY */

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    /* DATE */

    currentDate.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    /* ICON */

    const iconCode =
        data.weather[0].icon;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    /* WEATHER DETAILS */

    currentTemp.textContent =
        `${Math.round(data.main.temp)}°C`;

    weatherDesc.textContent =
        data.weather[0].description;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} km/h`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    /* OPTIONAL DATA */

    if (visibility) {

        visibility.textContent =
            `${(data.visibility / 1000).toFixed(1)} km`;

    }

    /* UPDATE DYNAMIC BACKGROUND */

    updateBackground(
        data.weather[0].main.toLowerCase()
    );

    /* PLAY ANIMATION */

    animateWeatherCard();

}

/* =========================================================
   DISPLAY FORECAST
========================================================= */

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const dailyData =
        data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );

    dailyData.forEach(day => {

        const date =
            new Date(day.dt * 1000);

        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        const card =
            document.createElement("div");

        card.className =
            "forecast-card glass";

        card.innerHTML = `

            <span class="day">
                ${dayName}
            </span>

            <img
                src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
                alt="Forecast Icon"
            >

            <div class="temp">
                ${Math.round(day.main.temp)}°C
            </div>

            <p class="desc">
                ${day.weather[0].description}
            </p>

        `;

        forecastContainer.appendChild(card);

    });

}

/* =========================================================
   DYNAMIC BACKGROUND CHANGER
========================================================= */

function updateBackground(condition) {

    const overlay =
        document.querySelector(".background-overlay");

    let background = "";

    /* CLEAR */

    if (condition.includes("clear")) {

        background =
            "linear-gradient(135deg, #f6d365 0%, #fda085 100%)";

    }

    /* CLOUDY */

    else if (condition.includes("cloud")) {

        background =
            "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)";

    }

    /* RAIN */

    else if (
        condition.includes("rain") ||
        condition.includes("drizzle")
    ) {

        background =
            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";

    }

    /* THUNDER */

    else if (
        condition.includes("thunderstorm")
    ) {

        background =
            "linear-gradient(135deg, #141e30 0%, #243b55 100%)";

    }

    /* SNOW */

    else if (
        condition.includes("snow")
    ) {

        background =
            "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)";

    }

    /* MIST */

    else if (
        condition.includes("mist") ||
        condition.includes("fog")
    ) {

        background =
            "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)";

    }

    else {

        background =
            document.body.classList.contains("dark-mode")
                ? "var(--bg-dark)"
                : "var(--bg-light)";

    }

    overlay.style.background =
        background;

}

/* =========================================================
   ANIMATION EFFECTS
========================================================= */

function animateWeatherCard() {

    const card =
        document.querySelector(
            ".current-weather-card"
        );

    card.style.animation =
        "none";

    setTimeout(() => {

        card.style.animation =
            "containerFade 0.8s ease";

    }, 10);

}

/* WELCOME EFFECT */

function animateWelcome() {

    const welcome =
        document.querySelector(
            ".welcome-container"
        );

    welcome.style.animation =
        "containerFade 1.2s ease";

}

/* =========================================================
   LOADING / ERROR STATES
========================================================= */

function showLoading() {

    loading.classList.remove("hidden");

    weatherContent.classList.add("hidden");

    errorMessage.classList.add("hidden");

    welcomeMessage.classList.add("hidden");

}

function hideLoading() {

    loading.classList.add("hidden");

}

function showError(message) {

    errorMessage.classList.remove("hidden");

    weatherContent.classList.add("hidden");

    welcomeMessage.classList.add("hidden");

    errorMessage.querySelector("p")
        .textContent = message;

}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveRecentSearch(city) {

    let searches =
        JSON.parse(
            localStorage.getItem(
                "recentSearches"
            )
        ) || [];

    /* REMOVE DUPLICATES */

    searches =
        searches.filter(
            item =>
                item.toLowerCase() !==
                city.toLowerCase()
        );

    searches.unshift(city);

    searches =
        searches.slice(0, 6);

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(searches)
    );

    loadRecentSearches();

}

/* LOAD SEARCHES */

function loadRecentSearches() {

    const searches =
        JSON.parse(
            localStorage.getItem(
                "recentSearches"
            )
        ) || [];

    recentSearchesContainer.innerHTML = "";

    searches.forEach(city => {

        const tag =
            document.createElement("span");

        tag.className =
            "recent-tag";

        tag.textContent = city;

        tag.addEventListener("click", () => {

            cityInput.value = city;

            fetchWeatherData(city);

        });

        recentSearchesContainer
            .appendChild(tag);

    });

}

/* =========================================================
   AUTO LOAD DEFAULT CITY
========================================================= */

window.addEventListener("load", () => {

    fetchWeatherData("London");

});

/* =========================================================
   INPUT FOCUS EFFECT
========================================================= */

cityInput.addEventListener("focus", () => {

    cityInput.parentElement.style.transform =
        "scale(1.02)";

});

cityInput.addEventListener("blur", () => {

    cityInput.parentElement.style.transform =
        "scale(1)";

});

/* =========================================================
   BUTTON RIPPLE EFFECT
========================================================= */

document.querySelectorAll("button")
.forEach(button => {

    button.addEventListener("click", function (e) {

        const ripple =
            document.createElement("span");

        ripple.classList.add("ripple");

        this.appendChild(ripple);

        const x =
            e.clientX -
            this.getBoundingClientRect().left;

        const y =
            e.clientY -
            this.getBoundingClientRect().top;

        ripple.style.left = `${x}px`;

        ripple.style.top = `${y}px`;

        setTimeout(() => {

            ripple.remove();

        }, 600);

    });

});