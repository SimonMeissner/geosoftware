//Task4 GeosoftareI by Simon Meißner
"use strict"

//declaring variables



var routeLayer = L.geoJSON()
var routeAsArray = route.features[0].geometry.coordinates[0] //saving the route as an 2D array with the points in lat-long format
var rectangle = [] //holds the coordinates of the drawn rectangle
var leftBottomCorner = [] //leftBottomCorner of the rectangle
var rightTopCorner = [] //rightTopCorner of the rectangle


//variables from task1and2
let pointsInOrOutsideArray = [] // [boolean] Array stores if a point lies inside or outside the polygon
let intersectionIndexArray = [] // [integer] Array stores the indices, where the route intersects the polygon
let intersectionCoords = [] //array which holds the corresponding


//drawcontrol variables
var drawnItems = new L.FeatureGroup()
var drawControl = new L.Control.Draw({
    draw: {
        polygon: false,
        marker: false,
        circle: false,
        polyline: false
    },
    edit: {
        featureGroup: drawnItems
    }
})



var myMap = L.map('mapid').setView([52, 10], 7)
//adding tileLayer from mapbox to the map
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoic2ltb25tZWlzc25lciIsImEiOiJja29sY3poeTgwaXd0Mm5vNjZidHpqZzRjIn0.ZCfQc7jH0S17bpTOAGedMA'
}).addTo(myMap)

//filling routeLayer with given Data
routeLayer.addData(route)
//adding layer to map
myMap.addLayer(routeLayer)

//adding drawControl
myMap.addLayer(drawnItems)
myMap.addControl(drawControl)


//ensuring to add the created rectangle as a layer to the map
myMap.on(L.Draw.Event.CREATED, function (e) {

   var type = e.layerType
   var layer = e.layer
   rectangle = layer.getLatLngs()

   leftBottomCorner.push(rectangle[0][0].lng)
   leftBottomCorner.push(rectangle[0][0].lat)

   rightTopCorner.push(rectangle[0][2].lng)
   rightTopCorner.push(rectangle[0][2].lat)

   fillingPointsInOrOutside(routeAsArray)
   fillingIntersectionIndexArray()
   getIntersectionCoords()

   for(let i = 0; i <= intersectionCoords.length-1; i++) {

     getWeatherData(intersectionCoords[i][1], intersectionCoords[i][0])
   }

   drawnItems.addLayer(layer)
   myMap.addLayer(layer)

})

//declaring functions


/**
 * getWeatherData - does an ajax request to the openweathermap api with the
 * given point and adds a marker to the map at the point with an popup which contains weather information
 *
 * @param {type} lat Latitude of the point
 * @param {type} lon Longitude of the point
 *
 */
function getWeatherData (lat, lon) {
  $(function () {
    $.ajax({
      type: 'GET',
      url:  `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${personalAPIkey}`,
      success:  function(data) {

        var marker = L.marker([lat,lon])


        var textform ="Standort: " + data.lat + ", " + data.lon +
                      "<br>Weather: " + data.current.weather[0].main +
                      "<br>Temperature: " + Math.round(data.current.temp - 273.15) + "°C" +
                      "<br>"

        marker.bindPopup(textform).openPopup().addTo(myMap)
      }
    })
  })
}



/**
 * getIntersectionCoords - fills intersectionCoords array which contains the coordinates of the intersectionpoints
 *
 */
function getIntersectionCoords() {
  for(let i=0; i <= intersectionIndexArray.length -1; i++) {
    intersectionCoords.push(routeAsArray[intersectionIndexArray[i]])
  }
}


//reusing functions from task1and2
/**
 * This function calculates if a point is in- or outside a given polygon.
 * It only works with rectangles are parellel to longitude and latitude.
 * the coordinates of point are checked against the left top corner and the right bottom corner of the polygon
 * @param {[float,float]} coordinates of one point [lng/lat]
 * @returns true if the point is inside the polygon or false if the point is outside the polygon
 * @todo execption handling for uneligble polygons (probably needs the other two corners as variables)
 */
function isPointInPolygon(coordinates) {
  return (coordinates[0] >= leftBottomCorner[0]) && (coordinates[0] <= rightTopCorner[0]) //the longitude of a point in the rectangle lies between the longitude of the left bottom and the right top corner
    &&
    (coordinates[1] >= leftBottomCorner[1]) && (coordinates[1] <= rightTopCorner[1]) //the latitude of a point in the rectangle lies between the latitude of the left bottom and the right top corner
}

/**
 * This function fills the PointsInOrOutsideArray
 * @param {[][]} 2D-array with the points of the route
 */
function fillingPointsInOrOutside(r) {
  for (let index_route = 0; index_route < r.length; index_route++) { //iterating over each point in the route
    pointsInOrOutsideArray[index_route] = isPointInPolygon(r[index_route])
  }
}

/**
 * The goal of the function is to find the indices where the route enters or leaves the polygon and to store the result in the IntersectionIndexArray.
 */
function fillingIntersectionIndexArray() {
  for (let index = 0; index < pointsInOrOutsideArray.length; index++) {
    if (!pointsInOrOutsideArray[index] && (pointsInOrOutsideArray[index + 1] || pointsInOrOutsideArray[index - 1])) { //The route intersects the polygon when the boolean pointsInOrOutsideArray[index] is false and the next or previous is true
      intersectionIndexArray.push(index)
    }

  }

}
