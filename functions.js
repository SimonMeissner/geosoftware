/**
 * checkPointInPoly - Function which checks if a point is inside of the polygon boundaries
 *
 * @param  {array} point Point which is checked
 * @return {boolean}   Returns either true or false if the point is inside or outside of the polygon
 */
function checkPointInPoly(point) {

  //variables (grenzesüden, grenzenorden, grenzeosten, grenzewesten) declare the boundaries to every cardinal direction
  let grenzesüden = polygon[0][1];
  let grenzenorden = polygon[2][1];
  let grenzewesten = polygon[0][0];
  let grenzeosten = polygon[2][0];

  //seperates long and lat component of the point
  let long = point[0];
  let lat = point[1];

  //check if lat and long coordinates lay in all boundaries
  if(lat > grenzesüden && lat < grenzenorden && long > grenzewesten && long < grenzeosten) {
    return true;
  }
  else {
    return false;
  }
}

/**
 * haversine - represents the haversine formula to calculate the distance in meters between two latitude/longitude points
 *
 * @param  {array} p1 first Point
 * @param  {array} p2 second Point
 * @return {float}    returns the distance in meters
 */
function haversine(p1, p2) {

  const radius = 6371e3;
  const x1 = p1[1] * Math.PI/180;
  const x2 = p2[1] * Math.PI/180;
  const deltalat = (p2[1] - p1[1]) * Math.PI/180;
  const deltalon = (p2[0] - p1[0]) * Math.PI/180;

  const a = Math.sin(deltalat/2) * Math.sin(deltalat/2) + Math.cos(x1) * Math.cos(x2) * Math.sin(deltalon/2) * Math.sin(deltalon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = radius * c;

  return distance;

}

/**
 * teileUndBerrechneLaenge - Seperates a given array of points which form a route if the route
 * crosses the polygon boundaries. It returns the lengths of the seperated divisions in form of an array
 *
 * @param  {array} r Input array of points
 * @return {array}   Output array of lengths of seperated divisions
 */
function teileUndBerrechneLaenge(r) {

  let array = [] //array in which the lengths of the seperated divisions are written
  let gesamtlaenge = 0; //initializing gesamtlaenge

  let laenge = 0; //initializing laenge which holds the length of the current piece
  let arrayzaehler = 0; //initializing arrayzaehler which counts the divisions
  let i = 0 // Counter which iterates over the input array

  let status = checkPointInPoly(r[i]) // initializing status from the status of the first point in the input array


  //for-loop which iterates over the input array
  for(i; i < r.length; i++) {



    if(status == checkPointInPoly(r[i])) { //check if the current point lays like the previous point in- or outside of the polygon

      // calculating the distance between the current and the last point and add it to laenge
      if(i !== 0) { // at the first point there is no other point to calculate a distance from!
        laenge += haversine(r[i-1], r[i])
      }
    }
    else { // Case if the status of the current point does not match the status of the previous point! (crossing the polygon border)
      array[arrayzaehler] = laenge // laenge of the current division is written in the output array
      status = checkPointInPoly(r[i]) // status is set to the status of the current point
      gesamtlaenge += laenge // laenge is added to gesamtlaenge
      arrayzaehler ++ // beginn next division
      laenge = 0 // laenge is set back to 0
    }

  }
  array[arrayzaehler] = laenge // writes the length of the last division in the output array
  gesamtlaenge += laenge //adds the length of the last divions to gesamtlaenge
  document.getElementById("gesamtlaenge").innerHTML=gesamtlaenge //sends gesamtlaenge to the htmlpage
  return array
}

/**
 * CreateTable - creates a htmltable from an array with indices and content per row
 *
 * @param  {array} a input array
 * @return {table}   html table
 */
function erstelleTabelle(a) {


  var table = document.createElement("table") //creates html element table
  var row = table.insertRow() //variable to add rows

  //for-loop which iterates over the input array
  for (var i=0; i < a.length; i++) {
    var cell1 = row.insertCell()  //variable to create a cell
    var cell2 = row.insertCell()  //variable to create another cell
    cell1.innerHTML = i //puts index in first cell
    cell2.innerHTML = a[i] //puts index in second cell
     row = table.insertRow() //adds a row

  }
  document.getElementById("container").appendChild(table) //adds the table to the htmlpage
}

function SichereInput() {
  let geojson = document.getElementById("geojson").value
  console.log(geojson)
}
