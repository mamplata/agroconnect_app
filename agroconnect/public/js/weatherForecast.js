$(document).ready(function() {
  const apiKey = 'TrO3i54Ru1N0tgNmEUvMZeqWmzPG7KAK';
  const locationKey = '3409731';
  const storageKey = 'weatherForecast';
  const storageTimestampKey = 'weatherForecastTimestamp';
  const fetchInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  function fetchWeatherData() {
    const url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&details=true&metric=true`;
    
    $.getJSON(url)
      .done(function(data) {
        // Save data to your API endpoint
        $.ajax({
          url: 'api/weatherforecasts',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            weatherData: data,
            timestamp: new Date().getTime()
          }),
          success: function(response) {
            console.log('Data successfully saved to the server.');
            displayWeatherData(data);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error saving data to the server:', textStatus, errorThrown);
          }
        });
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error fetching forecast data:', textStatus, errorThrown);
      });
}

  function setWeatherBackground(weatherCondition) {
    const now = new Date();
    const currentHour = now.getHours();
    const sunriseHour = 6; // Example sunrise hour
    const sunsetHour = 18; // Example sunset hour

    let backgroundImage;

    // Function to get default background image based on day or night
    function getDefaultBackground() {
      if (currentHour >= sunriseHour && currentHour < sunsetHour) {
        // Day time
        return 'url("day.jpeg")'; // Default day image
      } else {
        // Night time
        return 'url("night.jpeg")'; // Default night image
      }
    }

    // Check weather condition
    switch (true) {
      case weatherCondition && weatherCondition.includes('Sunny'):
        backgroundImage = 'url("day.jpeg")'; // Daytime background image for sunny weather
        break;
      case weatherCondition && weatherCondition.includes('Cloudy'):
        backgroundImage = 'url("cloudy.jpeg")'; // Daytime or nighttime background image for cloudy weather
        break;
      case weatherCondition && weatherCondition.includes('Rain'):
      case weatherCondition && weatherCondition.includes('Drizzle'):
      case weatherCondition && weatherCondition.includes('Shower'):
        backgroundImage = 'url("rain.jpeg")'; // Daytime or nighttime background image for rainy weather
        break;
      case weatherCondition && weatherCondition.includes('Storm'):
      case weatherCondition && weatherCondition.includes('Thunderstorm'):
        backgroundImage = 'url("storm.jpeg")'; // Nighttime background image for stormy weather
        break;
      default:
        backgroundImage = getDefaultBackground(); // Default to day or night image based on time
    }

    // Apply the background image to the parent card
    $('.container-fluid').css({
      'background-image': backgroundImage,
      'background-size': 'cover',
      'background-position': 'center'
    });
  }

  function displayWeatherData(data) {
    const now = new Date();
    const currentHour = now.getHours();

    // Process today's forecast data
    const todayForecast = data.DailyForecasts[0];
    const todayDate = new Date(todayForecast.Date);
    const todayDayIcon = `https://developer.accuweather.com/sites/default/files/${("0" + todayForecast.Day.Icon).slice(-2)}-s.png`;
    const todayNightIcon = `https://developer.accuweather.com/sites/default/files/${("0" + todayForecast.Night.Icon).slice(-2)}-s.png`;
    const todayDayPhrase = todayForecast.Day.IconPhrase;
    const todayNightPhrase = todayForecast.Night.IconPhrase;
    const todayDayTemperature = todayForecast.Temperature.Maximum.Value;
    const todayNightTemperature = todayForecast.Temperature.Minimum.Value;
    const todayDayHumidity = todayForecast.Day.RelativeHumidity.Maximum || 0;
    const todayNightHumidity = todayForecast.Night.RelativeHumidity.Maximum || 0;
    const todayDayPrecipitation = todayForecast.Day.PrecipitationIntensity || 'None';
    const todayNightPrecipitation = todayForecast.Night.PrecipitationIntensity || 'None';
    const todayDayRainfallProbability = todayForecast.Day.PrecipitationProbability || 0;
    const todayNightRainfallProbability = todayForecast.Night.PrecipitationProbability || 0;

    // Determine if it's day or night
    const sunriseHour = 6; // Example sunrise hour
    const sunsetHour = 18; // Example sunset hour
    let weatherCondition;
    
    if (currentHour >= sunriseHour && currentHour < sunsetHour) {
      // Day time
      weatherCondition = todayDayPhrase;
      $('#today').html(`
        <h4>${todayDayPhrase}</h4>
        <img src="${todayDayIcon}" alt="${todayDayPhrase}" class="weather-icon">
        <p>Temperature: ${todayDayTemperature}°C</p>
        <p>Humidity: ${todayDayHumidity}%</p>
        <p>Precipitation: ${todayDayPrecipitation}</p>
        <p>Rainfall Probability: ${todayDayRainfallProbability}%</p>
      `);
    } else {
      // Night time
      weatherCondition = todayNightPhrase;
      $('#today').html(`
        <h4>${todayNightPhrase}</h4>
        <img src="${todayNightIcon}" alt="${todayNightPhrase}" class="weather-icon">
        <p>Temperature: ${todayNightTemperature}°C</p>
        <p>Humidity: ${todayNightHumidity}%</p>
        <p>Precipitation: ${todayNightPrecipitation}</p>
        <p>Rainfall Probability: ${todayNightRainfallProbability}%</p>
      `);
    }

    // Update background based on weather condition
    setWeatherBackground(weatherCondition);

    // Process the 5-day forecast data
    const forecast = data.DailyForecasts.slice(1);
    const forecastDiv = $('#forecast');

    forecastDiv.empty(); // Clear existing forecast items

    forecast.forEach(day => {
      const date = new Date(day.Date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayTemperature = day.Temperature.Maximum.Value;
      const nightTemperature = day.Temperature.Minimum.Value;
      const dayHumidity = day.Day.RelativeHumidity.Maximum || 0;
      const nightHumidity = day.Night.RelativeHumidity.Maximum || 0;
      const dayPrecipitation = day.Day.PrecipitationIntensity || 'None';
      const nightPrecipitation = day.Night.PrecipitationIntensity || 'None';
      const dayIconPhrase = day.Day.IconPhrase;
      const nightIconPhrase = day.Night.IconPhrase;
      const dayIcon = `https://developer.accuweather.com/sites/default/files/${("0" + day.Day.Icon).slice(-2)}-s.png`;
      const nightIcon = `https://developer.accuweather.com/sites/default/files/${("0" + day.Night.Icon).slice(-2)}-s.png`;
      const dayRainfallProbability = day.Day.PrecipitationProbability || 0;
      const nightRainfallProbability = day.Night.PrecipitationProbability || 0;

      let forecastItem;

      if (currentHour >= sunriseHour && currentHour < sunsetHour) {
        // Day time
        forecastItem = $(`
          <div class="col-md-3 mb-4 forecast-card">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${formattedDate} (${dayOfWeek})</h5>
                <h6 class="card-subtitle mb-2 text-white">Day</h6>
                <img src="${dayIcon}" alt="${dayIconPhrase}" class="weather-icon">
                <p class="card-text">Temperature: ${dayTemperature}°C</p>
                <p class="card-text">Humidity: ${dayHumidity}%</p>
                <p class="card-text">Precipitation: ${dayPrecipitation}</p>
                <p class="card-text">Rainfall Probability: ${dayRainfallProbability}%</p>
              </div>
            </div>
          </div>
        `);
      } else {
        // Night time
        forecastItem = $(`
          <div class="col-md-3 mb-4 forecast-card">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${formattedDate} (${dayOfWeek})</h5>
                <h6 class="card-subtitle mb-2 text-white">Night</h6>
                <img src="${nightIcon}" alt="${nightIconPhrase}" class="weather-icon">
                <p class="card-text">Temperature: ${nightTemperature}°C</p>
                <p class="card-text">Humidity: ${nightHumidity}%</p>
                <p class="card-text">Precipitation: ${nightPrecipitation} </p>
                <p class="card-text">Rainfall Probability: ${nightRainfallProbability}%</p>
              </div>
            </div>
          </div>
        `);
      }

      forecastDiv.append(forecastItem);
    });
  }

  function loadWeatherData() {
    const storedData = localStorage.getItem(storageKey);
    const storedTimestamp = localStorage.getItem(storageTimestampKey);
    const now = new Date().getTime();

    if (storedData && storedTimestamp) {
      const age = now - storedTimestamp;

      if (age < fetchInterval) {
        // Use stored data if it's recent enough
        const data = JSON.parse(storedData);
        displayWeatherData(data);
        return;
      }
    }

    // Fetch new data if no recent stored data
    fetchWeatherData();
  }

  loadWeatherData();
});
