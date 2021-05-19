//Task4 GeosoftareI by Simon Meißner
"use strict"

//declaring variables


var myMap = L.map('mapid').setView([52, 10], 7)
var routeLayer = L.geoJSON().addTo(myMap)
var routeAsArray = route.features[0].geometry.coordinates[0]
var rectangle = []
var leftBottomCorner = []
var rightTopCorner = []

//variables from task1and2
let pointsInOrOutsideArray = [] // [boolean] Array stores if a point lies inside or outside the polygon
let intersectionIndexArray = [] // [integer] Array stores the indices, where the route intersects the polygon
let intersectionCoords = []


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
//declaring functions


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
       console.log(rectangle)


       leftBottomCorner.push(rectangle[0][0].lng)
       leftBottomCorner.push(rectangle[0][0].lat)

       rightTopCorner.push(rectangle[0][2].lng)
       rightTopCorner.push(rectangle[0][2].lat)

       console.log(leftBottomCorner, rightTopCorner)

       fillingPointsInOrOutside(routeAsArray)
       fillingIntersectionIndexArray()
       getIntersectionCoords()
       console.log(intersectionIndexArray)
       console.log(intersectionCoords)



   // Do whatever else you need to. (save to db; add to map etc)
   drawnItems.addLayer(layer)
   myMap.addLayer(layer)

})




/**
 * getIntersectionCoords - fills intersectionCoords array which contains the coordinates of the intersectionpoints
 *
 */
function getIntersectionCoords() {
  for(let i=0; i <= intersectionIndexArray.length -1; i++) {
    intersectionCoords.push(routeAsArray[intersectionIndexArray[i]])
  }
}


//functions from task1and2
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
    pointsInOrOutsideArray[index_route] = isPointInPolygon(r[index_route])
  }
}

/**
 * The goal of the function is to find the indices where the route enters or leaves the polygon and to store the result in the IntersectionIndexArray.
 */
function fillingIntersectionIndexArray() {
  for (let index = 0; index < pointsInOrOutsideArray.length; index++) {
    if (//index == 0 || index == pointsInOrOutsideArray.length - 1 // setting the start and the end point of the route as part of the array
      //||
      (!pointsInOrOutsideArray[index] && (pointsInOrOutsideArray[index + 1] || pointsInOrOutsideArray[index - 1]))) { //The route intersects the polygon when the boolean pointsInOrOutsideArray[index] is false and the next or previous is true
      intersectionIndexArray.push(index);
    }

  }

}
