// Initialize the map
const map = L.map('map').setView([0, 0], 2);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

// Function to fetch news data and update the map
async function updateNewsMap() {
    try {
        // Replace this URL with the actual API endpoint that provides news data
        const response = await fetch('https://your-api-url.com/news');
        const newsData = await response.json();

        // Clear existing markers
        if (window.markers) {
            window.markers.forEach(marker => marker.remove());
        }
        window.markers = [];

        // Add new markers for each news item
        newsData.forEach(item => {
            const marker = L.marker([item.latitude, item.longitude]).addTo(map);
            marker.bindPopup(item.title).openPopup();
            window.markers.push(marker);
        });
    } catch (error) {
        console.error('Error fetching news data:', error);
    }
}

// Update the map initially
updateNewsMap();

// Set up an interval to update the map every hour (3600000 milliseconds)
setInterval(updateNewsMap, 3600000);
