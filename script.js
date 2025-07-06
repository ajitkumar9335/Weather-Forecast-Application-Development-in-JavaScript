const apiKey = "59db71c6e8369685d00636fe3a6cf3eb";

// Handle city search form submit
document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  cityname();
});

// Handle current location button
document.getElementById("current-location-btn").addEventListener("click", citylocation);

// Get weather by city name
function cityname() {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    fetchWeather(city);
    saveRecentCity(city);
  }
}

// Get weather by current device location
function citylocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByLocation(lat, lon);
      },
      function () {
        alert("Unable to retrieve your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Fetch weather by city name
function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => updateUI(data));
}

// Fetch weather by coordinates
function fetchWeatherByLocation(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => updateUI(data));
}

// Update UI with weather data
function updateUI(data) {
  if (!data || !data.list) return alert("No data found for the specified location.");

  const current = data.list[0];
  const date = current.dt_txt.split(" ")[0];
  document.getElementById("citydate").textContent = `${data.city.name} (${date})`;
  document.getElementById("temperature").textContent = `Temperature: ${current.main.temp}℃`;
  document.getElementById("wind").textContent = `Wind: ${current.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `Humidity: ${current.main.humidity}%`;
  document.getElementById("description").textContent = `Description: ${current.weather[0].description}`;

  document.getElementById("current-info").classList.remove("hidden");
  document.getElementById("forecast-container").classList.remove("hidden");

  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  // Filter 5-day forecast (12 PM each day)
  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-gray-300 p-4 rounded text-center";
    card.innerHTML = `
      <p class="font-bold mb-1">${item.dt_txt.split(" ")[0]}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" class="mx-auto h-12" />
      <p>Temp: ${item.main.temp.toFixed(1)}℃</p>
      <p>Wind: ${item.wind.speed} M/S</p>
      <p>Humidity: ${item.main.humidity}%</p>
    `;
    forecastContainer.appendChild(card);
  });
}

// Save searched city in localStorage
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  renderDropdown();
}

// Render recent city dropdown
function renderDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  const container = document.getElementById("recent-container");
  const dropdown = document.getElementById("recent-dropdown");

  if (cities.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  dropdown.innerHTML = `<option disabled selected>Select a city</option>`;

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    dropdown.appendChild(option);
  });
}

// On change of dropdown, fetch weather for selected city
document.getElementById("recent-dropdown").addEventListener("change", function () {
  const city = this.value;
  fetchWeather(city);
});

// Initial call to populate dropdown if recent searches exist
renderDropdown();
