const API_KEY = 'ed5a64d631744bb693160fd70115c3b2';

const G8_COUNTRIES = {
    'us': { 
        name: 'United States', 
        coords: [37.0902, -95.7129],
        color: '#C8E6C9'
    },
    'gb': { 
        name: 'United Kingdom', 
        coords: [54.2361, -2.3398],
        color: '#B3E5FC'
    },
    'fr': { 
        name: 'France', 
        coords: [46.2276, 2.2137],
        color: '#FFE0B2'
    },
    'de': { 
        name: 'Germany', 
        coords: [51.1657, 10.4515],
        color: '#F8BBD0'
    },
    'it': { 
        name: 'Italy', 
        coords: [41.8719, 12.5674],
        color: '#E1BEE7'
    },
    'jp': { 
        name: 'Japan', 
        coords: [36.2048, 138.2529],
        color: '#FFCDD2'
    },
    'ca': { 
        name: 'Canada', 
        coords: [56.1304, -106.3468],
        color: '#B2DFDB'
    },
    'ru': { 
        name: 'Russia', 
        coords: [61.5240, 105.3188],
        color: '#D7CCC8'
    }
};

let popups = {};
let map;

async function fetchCountryNews(countryCode) {
    try {
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?` +
            `country=${countryCode}&` +
            `pageSize=1&` +
            `apiKey=${API_KEY}`
        );

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        return data.articles[0];
    } catch (error) {
        console.error(`Error fetching news for ${countryCode}:`, error);
        return null;
    }
}

function createNewsPopup(news, country, countryCode) {
    if (!news) return;

    if (popups[countryCode]) {
        popups[countryCode].remove();
    }

    const popup = $('<div/>', {
        class: 'news-popup',
        css: {
            position: 'absolute',
            left: '0',
            top: '0'
        }
    }).html(`
        <h4>${news.title}</h4>
        <div class="source">
            <span>${country.name}</span>
            <span>${news.source.name}</span>
        </div>
    `);

    const point = map.latLngToPoint(country.coords[0], country.coords[1]);
    popup.css({
        left: point.x + 'px',
        top: point.y + 'px'
    });

    $('#map').append(popup);
    popups[countryCode] = popup;
}

async function updateAllNews() {
    const now = new Date().toISOString().replace('T', ' ').substr(0, 19) + ' UTC';
    $('#last-update').text(now);

    for (const [code, country] of Object.entries(G8_COUNTRIES)) {
        const news = await fetchCountryNews(code);
        if (news) {
            createNewsPopup(news, country, code);
        }
    }
}

$(document).ready(function() {
    $('#map').vectorMap({
        map: 'world_mill',
        backgroundColor: '#ffffff',
        zoomOnScroll: true,
        regionStyle: {
            initial: {
                fill: '#e4e4e4',
                stroke: '#ffffff',
                "stroke-width": 1
            },
            hover: {
                fill: '#a0a0a0'
            }
        },
        series: {
            regions: [{
                values: Object.fromEntries(
                    Object.entries(G8_COUNTRIES).map(([code, data]) => 
                        [code.toUpperCase(), data.color]
                    )
                )
            }]
        },
        onRegionTipShow: function(e, tip, code) {
            if (G8_COUNTRIES[code.toLowerCase()]) {
                tip.html(G8_COUNTRIES[code.toLowerCase()].name);
            }
        }
    });

    map = $('#map').vectorMap('get', 'mapObject');

    updateAllNews();
    setInterval(updateAllNews, 5 * 60 * 1000);
});
