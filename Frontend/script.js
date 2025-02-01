// 1. Initialize the map and set the view to your desired coordinates and zoom level
const map = L.map('map').setView([37.31930349325796, -122.04499476044137], 17);  // Example: San Francisco

// 2. Add the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 3. Loop through tree data and add markers to the map
trees.forEach(tree => {
    const marker = L.circleMarker([tree.latitude, tree.longitude], 
    {radius: 6, color: '#228B22', fillColor: '#228B22', fillOpacity: 1}).addTo(map);
    marker.bindPopup(`<b>${tree.species}</b><br>Height: ${tree.height} m`);
});