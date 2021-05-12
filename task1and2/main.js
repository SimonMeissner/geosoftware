//author: Simon Meißner (using the solution from Jan Seemann from assignment1)

"use strict"

//variables


let pointsInOrOutsideArray = [] // [boolean] Array stores if a point lies inside or outside the polygon
let intersectionIndexArray = [] // [integer] Array stores the indices, where the route intersects the polygon
let distancesPointToPoint = [] // [float] Array stores all distances between consecutive points
let distancesSubsequences = [] // [float] Array stores the distances of the subsequences formed by the polygon
let resultTable = [] // array stores information about the route section, the length of the section, the start- and end points and if the section lies inside or outside the given polygon

let arrayfromjson = [] // array which stores the points of the input geojson
let routeAsGeojson //variable to store the route as geojson
let polygonAsGeojson //variable to store the polygon as geojson
let routeAsString //variable to store the route as a string
let polygonAsString //variable to store the polygon as a string


//the coordinates corners of the polygon are constants because the polygon remains unchanged for all points
const leftBottomCorner = polygon[0]; //left Bottom corner of the polygon
const rightTopCorner = polygon[2]; //right Top corner of the polygon



//functions

/**
 * This function converts coordinates in degrees into coordinates in radians.
 * @param {float} deg coordinates (deg)
 * @returns converted coordinates (rad)
 */
function degToRad(deg) {
  return deg * (Math.PI / 180); //conversion formula
}


/**
 * This function calculates the shortest distance in m between two points using the haversine formula.
 * Link: http://www.movable-type.co.uk/scripts/latlong.html
 * @param {[float,float]} point1 coordinates [lng/lat]
 * @param {[float,float]} point2 coordinates [lng/lat]
 * @returns shortest distance between the two points in meters.
 */
function distanceInMeter(point1, point2) {
  var earthRadius = 6371; // Radius of the earth in km
  var distanceLongitude = degToRad(point2[0] - point1[0]); // Distance on the longitude in rad
  var distanceLatitude = degToRad(point2[1] - point1[1]); //Distance on the latitude in rad

  var a =
    Math.sin(distanceLatitude / 2) * Math.sin(distanceLatitude / 2) +
    Math.cos(degToRad(point1[1])) * Math.cos(degToRad(point2[1])) *
    Math.sin(distanceLongitude / 2) * Math.sin(distanceLongitude / 2); //a is the square of half the chord length between the points

  var distanceRad = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Distance in rad

  var distanceKM = earthRadius * distanceRad; // Distance in km

  return distanceKM * 1000; //factor 1000 to convert the unit of the result into meter
}


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
    (coordinates[1] >= leftBottomCorner[1]) && (coordinates[1] <= rightTopCorner[1]); //the latitude of a point in the rectangle lies between the latitude of the left bottom and the right top corner
}

/**
 * This function fills the PointsInOrOutsideArray
 */
function fillingPointsInOrOutside(r) {
  for (let index_route = 0; index_route < r.length; index_route++) { //iterating over each point in the route
    pointsInOrOutsideArray[index_route] = isPointInPolygon(r[index_route]);
  }
}

/**
 * The goal of the function is to find the indices where the route enters or leaves the polygon and to store the result in the IntersectionIndexArray.
 */
function fillingIntersectionIndexArray() {
  for (let index = 0; index < pointsInOrOutsideArray.length; index++) {
    if (index == 0 || index == pointsInOrOutsideArray.length - 1 // setting the start and the end point of the route as part of the array
      ||
      (!pointsInOrOutsideArray[index] && (pointsInOrOutsideArray[index + 1] || pointsInOrOutsideArray[index - 1]))) { //The route intersects the polygon when the boolean pointsInOrOutsideArray[index] is false and the next or previous is true
      intersectionIndexArray.push(index);
    }

  }

}




/**
 * This function calculates all distances in meter between consecutive points and saves them in the distancesPointToPoint Array.
 * The functions uses the distanceInMeter function.
 */
function pointToPointDistances(r) {
  for (let index_route = 0; index_route < r.length - 1; index_route++) {
    distancesPointToPoint[index_route] = distanceInMeter(r[index_route], r[index_route + 1]);
  }
}

/**
 * This function calculates the distances of the subsequences in meter that were formed by the polygon.
 * It saves the distances in the distancesSubsequences-Array.
 */
function subsequenceDistances() {
  for (let index = 0; index < intersectionIndexArray.length - 1; index++) { //iterating over the subsequences
    var distanceSum = 0 //intialising the distance sum for a subsequence
    for (let i = intersectionIndexArray[index]; i < intersectionIndexArray[index + 1]; i++) { //iterating over the points in the subsequence
      distanceSum += distancesPointToPoint[i]; //adding up the distances
    }
    distancesSubsequences.push(distanceSum);
  }

}

/**
 * This function calculates the total length of the route in meter rounded down to three decimals.
 * @returns total distance of the route in meter
 */
function totalDistance() {
  var distanceSum = 0;
  for (let index = 0; index < distancesPointToPoint.length; index++) { //iterationg over the distances
    distanceSum += distancesPointToPoint[index]; //add the distance
  }
  distanceSum = Math.round(distanceSum * 1000) / 1000;
  return distanceSum;
}

/**
 * This function fills the resultTable with all attributes that shall be displayed.
 * The array stores date about the route section, the length of the route section, the start- and end-points and if the route section lies in- or outside the given polygon
 */
function fillingResultTable() {
  for (let index = 0; index < distancesSubsequences.length; index++) { //iterating over the subsequences
    var tableRow = [];
    tableRow[0] = index + 1; //index
    tableRow[1] = distancesSubsequences[index]; //length of the subsquence
    tableRow[2] = pointsInOrOutsideArray[intersectionIndexArray[index] + 1] // position to polygon
    tableRow[3] = route[intersectionIndexArray[index]]; // start-point
    tableRow[4] = route[intersectionIndexArray[index + 1]]; //end-point

    resultTable.push(tableRow);
  }
}

/**
 * This function converts the values in the result table.
 * The function rounds the lengths to three decimal places.
 * The Function converts the boolean true to "Inside" and the boolean false to "Outside".
 * The function brackets the coordinates of the start- and end-points.
 * @param {Array[][]} arrayToConvert two-dimensional Array
 */
function convertArrayValues(arrayToConvert) {
  for (var row = 0; row < arrayToConvert.length; row++) {

    arrayToConvert[row][1] = Math.round(arrayToConvert[row][1] * 1000) / 1000; //round lengths to two decimal places

    if (arrayToConvert[row][2] == true) {
      arrayToConvert[row][2] = "Inside"; // convert true to "Inside"
    } else if (arrayToConvert[row][2] == false) {
      arrayToConvert[row][2] = "Outside"; //convert false to "Outside"
    }

    arrayToConvert[row][3] = "(" + arrayToConvert[row][3] + ")"; //bracket start-pointcoordinates
    arrayToConvert[row][4] = "(" + arrayToConvert[row][4] + ")"; //bracket end-point coordinates


  }
}

/**
 * This function creates html-code to display a table out of a two-dimensional JavaScript array.
 * @param {Array[][]} convertedArray two-dimensional array
 * @returns HTML-code to display the table
 */
function createTableHTML(convertedArray) {
  var result = "<table border=1>";
  for (var i = 0; i < convertedArray.length; i++) {
    result += "<tr>";
    for (var j = 0; j < convertedArray[i].length; j++) {
      result += "<td>" + convertedArray[i][j] + "</td>";
    }
    result += "</tr>";
  }
  result += "</table>";

  return result;
}


/**
 * parseStringToGeojson - converts an given geojson in string format to geojson format
 *
 * @param {string} string given geojson as a string
 *
 * @return {geojson} geojson in geojson format
 */
function parseStringToGeojson(string) {
  let json = JSON.parse(string)
  return json
}


/**
 * routeToGeojsonLinestring - takes a route as an array and converts it to geojson format
 *
 * @param {array[][]} r input route
 *
 * @return {geojson} output route in geojson
 */
function routeToGeojsonLinestring(r) {

  let geojsonlinestring = {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": []
      }
    }]
  }
  for (let index = 0; index < r.length; index++) {
    geojsonlinestring.features[0].geometry.coordinates.push(r[index])
  }
  return geojsonlinestring
}


/**
 * polygonToGeojsonPolygon - takes a polygon as an array and converts it to geojson format
 *
 * @param {array[][]} p input polygon
 *
 * @return {geojson} output polygon in geojson
 */
function polygonToGeojsonPolygon(p) {

  let geojsonpolygon = {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          []
        ]
      }
    }]
  }

  for (let index = 0; index < p.length; index++) {
    geojsonpolygon.features[0].geometry.coordinates[0].push(p[index])
  }
  return geojsonpolygon
}


/**
 * geojsonToString - converts an geojosn to string format
 *
 * @param {geojson} geojson given geojson
 *
 * @return {string} geojson as a string
 */
function geojsonToString(geojson) {
  let string = JSON.stringify(geojson)
  return string
}

/**
 * appendStringToHTML - appends an string to an html paragraph with id= "container"
 *
 * @param {string} string given string with shall be appended
 */
function appendStringToHTML(string) {
  let container = document.getElementById('container')
  let newElement = document.createElement('p')
  newElement.innerText = string
  container.appendChild(newElement)
}
