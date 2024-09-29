const sideMenu = document.querySelector("aside");
const profileBtn = document.querySelector("#profile-btn");
const themeToggler = document.querySelector(".theme-toggler");
const nextDay = document.getElementById('nextDay');
const prevDay = document.getElementById('prevDay');

profileBtn.onclick = function() {
    sideMenu.classList.toggle('active');
}
window.onscroll = () => {
    sideMenu.classList.remove('active');
    if(window.scrollY > 0){document.querySelector('header').classList.add('active');}
    else{document.querySelector('header').classList.remove('active');}
}

themeToggler.onclick = function() {
    document.body.classList.toggle('dark-theme');
    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active')
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active')
}

let setData = (day) =>{
    document.querySelector('table tbody').innerHTML = ' '; //To clear out previous table data;  
    let daylist = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    document.querySelector('.timetable div h2').innerHTML = daylist[day];
    switch(day){
        case(0): day = Sunday; break;
        case(1): day = Monday; break;
        case(2): day = Tuesday; break;
        case(3): day = Wednesday; break;
        case(4): day = Thursday; break;
        case(5): day = Friday; break;
        case(6): day = Saturday; break;
    }

    day.forEach(sub => {
        const tr = document.createElement('tr');
        const trContent = `
                            <td>${sub.time}</td>
                            <td>${sub.roomNumber}</td>
                            <td>${sub.subject}</td>
                            <td>${sub.type}</td>
                        `
        tr.innerHTML = trContent;
        document.querySelector('table tbody').appendChild(tr)                        
    });
}

let now = new Date();
let today = now.getDay(); // Will return the present day in numerical value; 
let day = today; //To prevent the today value from changing;

function timeTableAll(){
    document.getElementById('timetable').classList.toggle('active');
    setData(today);
    document.querySelector('.timetable div h2').innerHTML = "Today's Timetable";
}
nextDay.onclick = function() {
    day<=5 ? day++ : day=0;  // If else one liner
    setData(day);
}
prevDay.onclick = function() {
    day>=1 ? day-- : day=6;    
    setData(day);
}

setData(day); //To set the data in the table on loading window.
document.querySelector('.timetable div h2').innerHTML = "Today's Timetable"; //To prevent overwriting the heading on loading;
// script.js
// Initialize the map and set its view
// const map = L.map('map').setView([-20.0, 80.0], 13); // Example coordinates (London)

// // Add OpenStreetMap tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '© OpenStreetMap contributors'
// }).addTo(map);

// // Add a marker
// const marker1 = L.marker([-20.0, 80.0]).addTo(map);
// marker1.bindPopup('Starting Point').openPopup();/
// Initialize the map and set its view


// script.js
// Initialize the map and set its view
// const map = L.map('map').setView([-20.0, 80.0], 3); // Indian Ocean coordinates

// // Add OpenStreetMap tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '© OpenStreetMap contributors'
// }).addTo(map);

// // Add a starting marker
// const marker1 = L.marker([-20.0, 80.0]).addTo(map); // Starting Point
// marker1.bindPopup('Starting Point').openPopup();

// // Add a destination marker
// const marker2 = L.marker([-15.0, 85.0]).addTo(map); // Example destination coordinates
// marker2.bindPopup('Destination').openPopup();

// // Create a line between the two points
// const latlngs = [
//     [-20.0, 80.0], // Starting Point
//     [-15.0, 85.0]  // Destination
// ];
// const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);

// // Fit the map to show both markers
// map.fitBounds(polyline.getBounds());
// Initialize the map and set its view to show some land
// Initialize the map and set its view
const map = L.map('map').setView([-20.0, 80.0], 1); // Set zoom level to 4 for a broader view

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, // Set a reasonable maximum zoom level
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add a starting marker
const marker1 = L.marker([-20.0, 80.0]).addTo(map); // Starting Point
marker1.bindPopup('Starting Point').openPopup();

// Add a destination marker
const marker2 = L.marker([-10.0, 85.0]).addTo(map); // Example destination coordinates (adjust as needed)
marker2.bindPopup('Destination').openPopup();

// Create a line between the two points
const latlngs = [
    [-20.0, 80.0], // Starting Point
    [-10.0, 85.0]  // Destination
];
const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);

// Fit the map to show both markers
map.fitBounds(polyline.getBounds());