const WEATHER_RAINY = 'rain';
const WEATHER_CLOUDY = 'cloud';
const WEATHER_CLEAR = 'clear';

function displayWeatherRecommendation(weather) {
    const recommendationContainer = document.getElementById('recommendation');
    let recommendationText = '';
    let activities = [];

    if (weather.includes(WEATHER_RAINY)) {
        recommendationText = 'It\'s raining. You may want to stay indoors or bring an umbrella if you go out.';
        activities = ['Read a book', 'Watch a movie', 'Bake cookies'];
    } else if (weather.includes(WEATHER_CLOUDY)) {
        recommendationText = 'It\'s cloudy. You can go for a walk or enjoy outdoor activities.';
        activities = ['Go for a walk', 'Visit a museum', 'Have a coffee at a café'];
    } else if (weather.includes(WEATHER_CLEAR)) {
        recommendationText = 'It\'s clear skies. It\'s a great time for outdoor activities like hiking or picnics.';
        activities = ['Go hiking', 'Have a picnic', 'Play outdoor sports'];
    } else {
        recommendationText = 'Weather conditions are unknown. You may want to check later or consult a weather forecast.';
        activities = ['Check the weather again later', 'Stay indoors just in case'];
    }

    recommendationContainer.innerText = recommendationText;
    displayActivitySuggestions(activities);
}

function displayActivitySuggestions(activities) {
    const activitySuggestionsContainer = document.getElementById('activitySuggestions');
    activitySuggestionsContainer.innerHTML = ''; // Clear previous activity suggestions

    activities.forEach(activity => {
        const activityRow = document.createElement('tr');
        activityRow.innerHTML = `<td>${activity}</td>`;
        activitySuggestionsContainer.appendChild(activityRow);
    });
}

async function displayHourlyForecast(hourlyData, latitude, longitude) {
    const forecastContainer = document.querySelector('.hourly-forecast-table tbody');
    forecastContainer.innerHTML = ''; // Clear previous forecast data

    // Fetch air quality data for the next 24 hours
    const airQualityData = await getAirQualityData(latitude, longitude);

    hourlyData.forEach((hourData, index) => {
        const date = new Date(hourData.dt * 1000);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const day = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        const temperature = hourData.main.temp;
        const weatherDescription = hourData.weather[0].description;
        const icon = `http://openweathermap.org/img/wn/${hourData.weather[0].icon}.png`;
        const airQuality = airQualityData[index] ? airQualityData[index].main.aqi : 'N/A';
        const windSpeed = hourData.wind.speed;

        const forecastRow = document.createElement('tr');
        forecastRow.innerHTML = `
            <td>${day}</td>
            <td>${time}</td>
            <td><img src="${icon}" alt="${weatherDescription}" title="${weatherDescription}"></td>
            <td>${temperature}°C</td>
            <td>${windSpeed} m/s</td>
            <td>${airQuality}</td>
        `;

        forecastContainer.appendChild(forecastRow);
    });
}

async function getAirQualityData(latitude, longitude) {
    const apiKey = '5aa00882c5b3ed64b1acdeda31782075'; // actual API key
    const url = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            return data.list; // Return the list of air quality data
        } else {
            console.error('Error response from Air Quality API:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        return [];
    }
}

async function getWeatherDataForCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            await getWeatherData(latitude, longitude);
            await getHourlyForecastData(latitude, longitude);
        }, error => {
            console.error('Error getting geolocation:', error);
            document.getElementById('weatherResult').innerHTML = `<p>Error getting geolocation</p>`;
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        document.getElementById('weatherResult').innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
    }
}

async function getWeatherData(latitude, longitude) {
    const apiKey = '5aa00882c5b3ed64b1acdeda31782075'; // Your actual API key
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const weather = data.weather[0].description.toLowerCase();
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const city = data.name;
            document.querySelector('.city-name').innerText = city;
            document.getElementById('temperature').innerText = temperature;
            document.getElementById('weatherDescription').innerText = weather;
            document.getElementById('humidity').innerText = humidity;
            document.getElementById('windSpeed').innerText = windSpeed;
            displayWeatherRecommendation(weather);
        } else {
            console.error('Error response from API:', data);
            document.getElementById('weatherResult').innerHTML = `<p>Could not retrieve weather data</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data</p>`;
    }
}

async function getHourlyForecastData(latitude, longitude) {
    const apiKey = '5aa00882c5b3ed64b1acdeda31782075'; // Your actual API key
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const hourlyData = data.list.slice(0, 24); // Get the next 24 hours of data
            displayHourlyForecast(hourlyData, latitude, longitude);
        } else {
            console.error('Error response from API:', data);
            document.getElementById('hourlyForecast').innerHTML = `<p>Could not retrieve hourly forecast data</p>`;
        }
    } catch (error) {
        console.error('Error fetching hourly forecast data:', error);
        document.getElementById('hourlyForecast').innerHTML = `<p>Error fetching hourly forecast data</p>`;
    }
}

// Get weather data for current location when the page loads
getWeatherDataForCurrentLocation();

// Function to get weather data by city name
async function getWeatherDataByCity(city) {
    const apiKey = '5aa00882c5b3ed64b1acdeda31782075'; // Your actual API key
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const weather = data.weather[0].description.toLowerCase();
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const city = data.name;
            const latitude = data.coord.lat;
            const longitude = data.coord.lon;
            document.querySelector('.city-name').innerText = city;
            document.getElementById('temperature').innerText = temperature;
            document.getElementById('weatherDescription').innerText = weather;
            document.getElementById('humidity').innerText = humidity;
            document.getElementById('windSpeed').innerText = windSpeed;
            displayWeatherRecommendation(weather);
            await getHourlyForecastData(latitude, longitude);
        } else {
            console.error('Error response from API:', data);
            document.getElementById('weatherResult').innerHTML = `<p>Could not retrieve weather data for ${city}</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data for ${city}</p>`;
    }
}

// Function to handle search by city
async function handleSearch() {
    const city = document.getElementById('city').value;
    if (city) {
        await getWeatherDataByCity(city);
    } else {
        alert('Please enter a city name.');
    }
}

// Event listener for search button
document.getElementById('searchButton').addEventListener('click', handleSearch);

// Event listener for Enter key
document.getElementById('city').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        handleSearch();
        // Prevent form submission
        event.preventDefault();
        // Blur the input to remove focus
        document.getElementById('city').blur();
        // Set focus back to the search button after a short delay
        setTimeout(() => {
            document.getElementById('searchButton').focus();
        }, 100);
    }
});

// Hide or show footer based on scroll direction
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const footer = document.querySelector('footer');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
        footer.classList.add('footer-hidden');
    } else {
        footer.classList.remove('footer-hidden');
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
});

// Event listener to handle hover effect on search button
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('mouseenter', () => {
    searchButton.classList.add('hover-effect');
});
searchButton.addEventListener('mouseleave', () => {
    searchButton.classList.remove('hover-effect');
});

