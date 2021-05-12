// Uebung3 - Geosoftware I
"use strict"

//defining variables

var coordinates // coordinates holds the coordinates of the requested position

//defining functions

  /**
   * Function to get a JSON object with information on weather of the current position.
   * The data is provided by the API by openwaethermap.
   */
  function getWeatherData () {

    //success function when accessing position is accepted
    function success(position) {
      coordinates = position.coords;

      let xmlreq = new XMLHttpRequest();

      //XML-HTTP Request to get the weatherinformation from https://openweathermap.org/
      //parsing it to JSON and invoking displayWeatherAtPosition()
      xmlreq.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let weatherData = JSON.parse(this.responseText);
          displayWeatherAtPosition(weatherData);
        }
      }

      xmlreq.open("GET", `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.latitude}&lon=${coordinates.longitude}&exclude=minutely,hourly,daily&appid=${personalAPIkey}`);
      xmlreq.send();
    }

    // Error function when accessing position is denied
    function error(err) {
      console.warn(`Warn(${err.code}) : ${err.message}`);
    }
    // getting the position from the geolocation api
    navigator.geolocation.getCurrentPosition(success, error);
  }


  /**
   * Function to display weather at the current location in a comprehensible way.
   * @param {JSON} weatherData - weatherdata in json format
   */
  function displayWeatherAtPosition(weatherData) {
      //prints given location
      document.getElementById("location").textContent = "Your location: Lat:" + weatherData.lat + ", Lon:" + weatherData.lon;

      //prints given date
      const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
      let date = new Date(weatherData.current.dt * 1000).toLocaleDateString("EN-EN", options);
      document.getElementById("date").textContent = "Date: " + date;

      //prints weather
      document.getElementById("weather").innerHTML = "Weather: " + weatherData.current.weather[0].main + "<br>Description: " + weatherData.current.weather[0].description;

      //prints current temperature
      let temp = weatherData.current.temp;
      let tempK = Math.round(temp);
      let tempC = Math.round(temp - 273.15);
      document.getElementById("temperature").textContent = "Current temperature: " + tempK +"K/" + tempC + "°C";

      //prints felt air temperature
      let feelslike = weatherData.current.feels_like;
      let feelslikeK = Math.round(feelslike);
      let feelslikeC = Math.round(feelslike - 273.15);
      document.getElementById("feelslike").textContent = "Felt air temperature: " + feelslikeK + "K/" + feelslikeC + "°C";

      //prints windspeed
      document.getElementById("windspeed").textContent = "Windspeed: " + weatherData.current.wind_speed + "meter/sec";

      //prints humidity
      document.getElementById("humidity").textContent = "Humidity: " + weatherData.current.humidity + "%";
    
      //prints pressure
      document.getElementById("pressure").textContent = "Pressure at Sealevel: " + weatherData.current.pressure + " hPa";

      //prints sunrise and sunset
      const options2 = {hour: 'numeric', minute: 'numeric', second: 'numeric'};
      let sunrise = new Date(weatherData.current.sunrise * 1000).toLocaleTimeString("EN-EN", options2);
      let sunset = new Date(weatherData.current.sunset * 1000).toLocaleTimeString("EN-EN", options2);
      document.getElementById("sunriseandset").innerHTML = "Sunrise: " + sunrise + "<br>Sunset: " + sunset;


      console.log(weatherData); // testing
  }



  /**
   * Function to run the function getWeatherData().
   * It starts when the html button is clicked.
   */
  function start() {
    getWeatherData();
  }
