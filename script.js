const $ = (selector) => document.querySelector(selector);
const searchForm = $("#searchForm");
const cityInput = $("#cityInput");
const searchButton = $("#searchButton");
const statusMessage = $("#statusMessage");
const rainLayer = $("#rainLayer");

const weatherDescriptions = {
  0: ["Clear sky", "☀️", "sunny"],
  1: ["Mainly clear", "🌤️", "sunny"],
  2: ["Partly cloudy", "⛅", "cloudy"],
  3: ["Overcast", "☁️", "cloudy"],
  45: ["Fog", "🌫️", "cloudy"],
  48: ["Rime fog", "🌫️", "cloudy"],
  51: ["Light drizzle", "🌦️", "rain"],
  53: ["Drizzle", "🌦️", "rain"],
  55: ["Heavy drizzle", "🌧️", "rain"],
  56: ["Freezing drizzle", "🌧️", "rain"],
  57: ["Heavy freezing drizzle", "🌧️", "rain"],
  61: ["Light rain", "🌦️", "rain"],
  63: ["Rain", "🌧️", "rain"],
  65: ["Heavy rain", "🌧️", "rain"],
  66: ["Freezing rain", "🌧️", "rain"],
  67: ["Heavy freezing rain", "🌧️", "rain"],
  71: ["Light snow", "🌨️", "cloudy"],
  73: ["Snow", "❄️", "cloudy"],
  75: ["Heavy snow", "❄️", "cloudy"],
  77: ["Snow grains", "🌨️", "cloudy"],
  80: ["Rain showers", "🌦️", "rain"],
  81: ["Rain showers", "🌧️", "rain"],
  82: ["Heavy rain showers", "⛈️", "rain"],
  85: ["Snow showers", "🌨️", "cloudy"],
  86: ["Heavy snow showers", "❄️", "cloudy"],
  95: ["Thunderstorm", "⛈️", "rain"],
  96: ["Thunderstorm with hail", "⛈️", "rain"],
  99: ["Heavy thunderstorm", "⛈️", "rain"]
};

function weatherInfo(code) {
  return weatherDescriptions[code] || ["Variable conditions", "🌡️", "cloudy"];
}
function setStatus(message, type = "error") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}
function formatTime(value) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDay(value, index) {
  if (index === 0) return "Today";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}
function createRain() {
  rainLayer.innerHTML = "";
  for (let i = 0; i < 85; i++) {
    const drop = document.createElement("i");
    drop.className = "raindrop";
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.65 + Math.random() * 0.8}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    drop.style.opacity = `${0.25 + Math.random() * 0.55}`;
    rainLayer.appendChild(drop);
  }
}
function applyWeatherScene(kind) {
  document.body.classList.remove("weather-sunny", "weather-cloudy", "weather-rain", "weather-default");
  document.body.classList.add(`weather-${kind}`);
  if (kind === "rain") createRain();
  else rainLayer.innerHTML = "";
}
function makeWeatherNote(kind, description) {
  const notes = {
    sunny: ["A bright day ahead.", "Looks clear outside. Sunglasses and a water bottle might come in handy."],
    cloudy: ["A little grey, a little calm.", "Cloud cover is around. It may feel cooler, so take a light layer if you're heading out."],
    rain: ["Don't forget your umbrella.", "Wet weather is in the forecast. Consider bringing an umbrella before you head out."]
  };
  return notes[kind] || ["Stay weather-aware.", `Current conditions: ${description}.`];
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The weather service is temporarily unavailable. Please try again.");
  return response.json();
}

async function loadWeather(city) {
  if (!city.trim()) {
    setStatus("Please enter a city name.");
    cityInput.focus();
    return;
  }
  searchButton.disabled = true;
  searchButton.textContent = "Loading…";
  setStatus("Finding your city…", "success");
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`;
    const geo = await getJson(geoUrl);
    if (!geo.results || geo.results.length === 0) {
      throw new Error(`We couldn't find “${city.trim()}”. Check the spelling or try another city.`);
    }
    const place = geo.results[0];
    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
      timezone: "auto",
      forecast_days: "4"
    });
    const weather = await getJson(`https://api.open-meteo.com/v1/forecast?${params}`);
    renderWeather(place, weather);
    localStorage.setItem("atmos-last-city", place.name);
    setStatus(`Showing live weather for ${place.name}.`, "success");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.");
  } finally {
    searchButton.disabled = false;
    searchButton.innerHTML = 'Search <span>→</span>';
  }
}

function renderWeather(place, data) {
  const current = data.current;
  const daily = data.daily;
  const [description, icon, scene] = weatherInfo(current.weather_code);
  const country = place.country ? `, ${place.country}` : "";
  $("#locationName").textContent = `${place.name}${country}`;
  $("#currentDate").textContent = new Date(current.time).toLocaleString([], {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
  });
  $("#currentIcon").textContent = icon;
  $("#temperature").innerHTML = `${Math.round(current.temperature_2m)}<span>°</span>`;
  $("#condition").textContent = description;
  $("#feelsLike").textContent = `${Math.round(current.apparent_temperature)}°`;
  $("#humidity").textContent = `${current.relative_humidity_2m}%`;
  $("#windSpeed").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  $("#uvIndex").textContent = daily.uv_index_max?.[0] ?? "—";
  $("#sunrise").textContent = formatTime(daily.sunrise?.[0]);
  $("#sunset").textContent = formatTime(daily.sunset?.[0]);

  const [noteTitle, noteCopy] = makeWeatherNote(scene, description);
  $("#noteIcon").textContent = icon;
  $("#weatherNote").textContent = noteTitle;
  $("#weatherAdvice").textContent = noteCopy;
  applyWeatherScene(scene);

  $("#forecastGrid").innerHTML = daily.time.slice(1, 4).map((day, index) => {
    const i = index + 1;
    const [label, dayIcon] = weatherInfo(daily.weather_code[i]);
    return `<article class="forecast-card">
      <span>${formatDay(day, i)}</span><b aria-label="${label}">${dayIcon}</b>
      <strong>${Math.round(daily.temperature_2m_max[i])}° <small>/ ${Math.round(daily.temperature_2m_min[i])}°</small></strong>
      <small>${label}</small>
    </article>`;
  }).join("");
}

// Search form
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadWeather(cityInput.value);
});

// Initial city: saved choice, or Jakarta.
const initialCity = localStorage.getItem("atmos-last-city") || "Jakarta";
cityInput.value = initialCity;
loadWeather(initialCity);

// ---- Lightweight in-page visual editor ----
const editToggle = $("#editToggle");
const editPanel = $("#editPanel");
const editOverlay = $("#editOverlay");
const closeEditor = $("#closeEditor");
const selectedLabel = $("#selectedLabel");
let selectedElement = null;
let visualMode = false;

function openEditor() {
  editPanel.classList.add("open");
  editOverlay.classList.add("show");
  editPanel.setAttribute("aria-hidden", "false");
}
function closeEditPanel() {
  editPanel.classList.remove("open");
  editOverlay.classList.remove("show");
  editPanel.setAttribute("aria-hidden", "true");
}
function selectElement(element) {
  if (selectedElement) selectedElement.classList.remove("selected-for-edit");
  selectedElement = element;
  selectedElement.classList.add("selected-for-edit");
  const tag = element.tagName.toLowerCase();
  selectedLabel.textContent = `Selected: ${tag}${element.id ? `#${element.id}` : ""}`;
  $("#editText").value = element.children.length ? "" : element.textContent.trim();
  $("#editColor").value = rgbToHex(getComputedStyle(element).color);
  $("#editFontSize").value = parseInt(getComputedStyle(element).fontSize, 10) || 16;
  $("#editPadding").value = parseInt(getComputedStyle(element).paddingTop, 10) || 0;
  $("#editBackground").value = rgbToHex(getComputedStyle(element).backgroundColor, "#182438");
}
function rgbToHex(rgb, fallback = "#ffffff") {
  const values = rgb.match(/\d+/g);
  if (!values || values.length < 3) return fallback;
  return "#" + values.slice(0, 3).map(v => Number(v).toString(16).padStart(2, "0")).join("");
}
editToggle.addEventListener("click", () => {
  visualMode = !visualMode;
  document.body.classList.toggle("visual-editing", visualMode);
  editToggle.textContent = visualMode ? "✓ Editing on" : "✦ Visual edit";
  if (visualMode) {
    selectedLabel.textContent = "Click a heading, text, or card to select it.";
    openEditor();
  } else {
    if (selectedElement) selectedElement.classList.remove("selected-for-edit");
    selectedElement = null;
    closeEditPanel();
  }
});
document.addEventListener("click", (event) => {
  if (!visualMode || event.target.closest(".edit-panel, .edit-toggle, .search-form")) return;
  const target = event.target.closest("[data-editable], .panel, .forecast-card");
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(target);
  openEditor();
}, true);
$("#applyEdit").addEventListener("click", () => {
  if (!selectedElement) return;
  const newText = $("#editText").value;
  if (newText && !selectedElement.children.length) selectedElement.textContent = newText;
  selectedElement.style.color = $("#editColor").value;
  selectedElement.style.fontSize = `${Math.max(10, Math.min(72, Number($("#editFontSize").value) || 16))}px`;
  selectedElement.style.padding = `${Math.max(0, Math.min(80, Number($("#editPadding").value) || 0))}px`;
  selectedElement.style.backgroundColor = $("#editBackground").value;
  saveVisualEdit(selectedElement);
  selectedLabel.textContent = "Changes applied and saved in this browser.";
});
function saveVisualEdit(element) {
  const key = element.id || element.className.split(" ")[0] || element.tagName;
  const all = JSON.parse(localStorage.getItem("atmos-visual-edits") || "{}");
  all[key] = {
    color: element.style.color, fontSize: element.style.fontSize,
    padding: element.style.padding, backgroundColor: element.style.backgroundColor
  };
  localStorage.setItem("atmos-visual-edits", JSON.stringify(all));
}
function restoreVisualEdits() {
  const all = JSON.parse(localStorage.getItem("atmos-visual-edits") || "{}");
  document.querySelectorAll("[data-editable], .panel, .forecast-card").forEach(element => {
    const key = element.id || element.className.split(" ")[0] || element.tagName;
    if (all[key]) Object.assign(element.style, all[key]);
  });
}
$("#resetEdits").addEventListener("click", () => {
  localStorage.removeItem("atmos-visual-edits");
  document.querySelectorAll("[data-editable], .panel, .forecast-card").forEach(el => el.removeAttribute("style"));
  selectedLabel.textContent = "Visual edits reset. Reload to refresh weather cards.";
});
closeEditor.addEventListener("click", closeEditPanel);
editOverlay.addEventListener("click", closeEditPanel);
restoreVisualEdits();
