const apiKey = '97c0bffa0a0ac88f973788d7407bde19';
const searchInput = document.getElementById('search-bar');
const weatherInfo = document.getElementById('weather-info');
const forecastGrid = document.getElementById('forecast-grid');
const locationButton = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');
const cityNameDisplay = document.getElementById('city-name');  // Element to display city name
let isCelsius = true;

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Function to fetch 5-day weather forecast data
async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.list.filter((_, index) => index % 8 === 0); // Extract 1 forecast per day
}

// Function to display current weather
function displayCurrentWeather(weather) {
    const { main, weather: conditions, wind, name } = weather;
    const icon = `http://openweathermap.org/img/wn/${conditions[0].icon}.png`;

    // Update city name in header
    cityNameDisplay.textContent = `Weather in ${name}`;  // Set city name dynamically

    weatherInfo.innerHTML = `
        <p><strong>Temperature:</strong> ${main.temp}°${isCelsius ? 'C' : 'F'}</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
        <p><strong>Condition:</strong> ${conditions[0].description}</p>
        <img src="${icon}" alt="${conditions[0].description}">
    `;
}

// Function to display 5-day weather forecast
function displayForecast(forecast) {
    forecastGrid.innerHTML = '';
    forecast.forEach(day => {
        const { main, weather } = day;
        const icon = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
            <p><strong>High:</strong> ${main.temp_max}°${isCelsius ? 'C' : 'F'}</p>
            <p><strong>Low:</strong> ${main.temp_min}°${isCelsius ? 'C' : 'F'}</p>
            <p><strong>Condition:</strong> ${weather[0].description}</p>
            <img src="${icon}" alt="${weather[0].description}">
        `;
        forecastGrid.appendChild(card);
    });
}


// Search for weather when the user enters a city name
searchInput.addEventListener('input', async () => {
    const city = searchInput.value;
    if (city) {
        const weather = await fetchWeather(city);
        displayCurrentWeather(weather);
        const forecast = await fetchForecast(city);
        displayForecast(forecast);
    }
});

// Use geolocation to get the weather for the user's current location
locationButton.addEventListener('click', async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
            const response = await fetch(url);
            const data = await response.json();
            displayCurrentWeather(data);
            const forecastData = await fetchForecast(data.name);
            displayForecast(forecastData);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Toggle temperature units between Celsius and Fahrenheit
unitToggle.addEventListener('click', () => {
    isCelsius = !isCelsius;
    unitToggle.textContent = isCelsius ? '°C' : '°F';
    const city = searchInput.value;
    if (city) {
        fetchWeather(city).then(displayCurrentWeather);
        fetchForecast(city).then(displayForecast);
    }
});
