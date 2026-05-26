// Aircraft Search Functionality
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');

// Aircraft database for search
const aircraftDatabase = [
    // HondaJet
    { name: 'HondaJet HA-420',               type: 'Light Business Jet',          range: '1,437 NM', speed: '420 KTS', pax: '最大5名',  url: '#' },
    { name: 'HondaJet Elite',                 type: 'Light Business Jet',          range: '1,455 NM', speed: '420 KTS', pax: '最大5名',  url: '#' },
    { name: 'HondaJet Elite S',               type: 'Light Business Jet',          range: '1,520 NM', speed: '420 KTS', pax: '最大5名',  url: '#' },
    { name: 'HondaJet Elite II',              type: 'Light Business Jet',          range: '1,600 NM', speed: '420 KTS', pax: '最大5名',  url: '#' },
    // Cessna Citation
    { name: 'Cessna Citation Mustang',        type: 'Very Light Jet',              range: '1,200 NM', speed: '340 KTS', pax: '最大4名',  url: '#' },
    { name: 'Cessna Citation CJ1 Series',     type: 'Light Business Jet',          range: '1,300 NM', speed: '360 KTS', pax: '最大6名',  url: '#' },
    { name: 'Cessna Citation CJ2 Series',     type: 'Light Business Jet',          range: '1,500 NM', speed: '390 KTS', pax: '最大6名',  url: '#' },
    { name: 'Cessna Citation CJ3 Series',     type: 'Light Business Jet',          range: '2,040 NM', speed: '416 KTS', pax: '最大6名',  url: '#' },
    { name: 'Cessna Citation CJ4 Series',     type: 'Midsize Business Jet',        range: '2,200 NM', speed: '451 KTS', pax: '最大8名',  url: '#' },
    { name: 'Cessna Citation Sovereign',      type: 'Midsize Business Jet',        range: '3,000 NM', speed: '460 KTS', pax: '最大9名',  url: '#' },
    { name: 'Cessna Citation Latitude',       type: 'Midsize Business Jet',        range: '2,700 NM', speed: '446 KTS', pax: '最大9名',  url: '#' },
    { name: 'Cessna Citation X',              type: 'Super Midsize Business Jet',  range: '3,460 NM', speed: '527 KTS', pax: '最大12名', url: '#' },
    { name: 'Cessna Citation Longitude',      type: 'Super Midsize Business Jet',  range: '3,500 NM', speed: '483 KTS', pax: '最大12名', url: '#' },
    // Gulfstream
    { name: 'Gulfstream G150',               type: 'Midsize Business Jet',        range: '2,950 NM', speed: '515 KTS', pax: '最大8名',  url: '#' },
    { name: 'Gulfstream G200',               type: 'Super Midsize Business Jet',  range: '3,100 NM', speed: '504 KTS', pax: '最大9名',  url: '#' },
    { name: 'Gulfstream G280',               type: 'Super Midsize Business Jet',  range: '3,600 NM', speed: '543 KTS', pax: '最大10名', url: '#' },
    { name: 'Gulfstream G300',               type: 'Large Business Jet',          range: '3,600 NM', speed: '541 KTS', pax: '最大9名',  url: '#' },
    { name: 'Gulfstream G350',               type: 'Large Business Jet',          range: '4,000 NM', speed: '541 KTS', pax: '最大9名',  url: '#' },
    { name: 'Gulfstream G400',               type: 'Large Business Jet',          range: '4,200 NM', speed: '541 KTS', pax: '最大12名', url: '#' },
    { name: 'Gulfstream G450',               type: 'Large Business Jet',          range: '4,350 NM', speed: '516 KTS', pax: '最大14名', url: '#' },
    { name: 'Gulfstream G500',               type: 'Large Business Jet',          range: '5,200 NM', speed: '516 KTS', pax: '最大16名', url: '#' },
    { name: 'Gulfstream G550',               type: 'Large Business Jet',          range: '6,750 NM', speed: '516 KTS', pax: '最大19名', url: '/aircraftspecs/businessjet/gulfstream/G550/' },
    { name: 'Gulfstream G600',               type: 'Large Business Jet',          range: '6,500 NM', speed: '516 KTS', pax: '最大19名', url: '#' },
    { name: 'Gulfstream G650',               type: 'Ultra Long-Range Business Jet', range: '7,000 NM', speed: '530 KTS', pax: '最大19名', url: '#' },
    { name: 'Gulfstream G650ER',             type: 'Ultra Long-Range Business Jet', range: '7,500 NM', speed: '530 KTS', pax: '最大19名', url: '#' },
    { name: 'Gulfstream G700',               type: 'Ultra Long-Range Business Jet', range: '7,500 NM', speed: '516 KTS', pax: '最大19名', url: '#' },
    // Bombardier
    { name: 'Bombardier Challenger 350',     type: 'Super Midsize Business Jet',  range: '3,200 NM', speed: '470 KTS', pax: '最大10名', url: '#' },
    { name: 'Bombardier Global 5500',        type: 'Large Business Jet',          range: '5,700 NM', speed: '500 KTS', pax: '最大16名', url: '#' },
    { name: 'Bombardier Global 7500',        type: 'Ultra Long-Range Business Jet', range: '7,700 NM', speed: '488 KTS', pax: '最大19名', url: '#' },
    // Embraer
    { name: 'Embraer Phenom 100',            type: 'Very Light Jet',              range: '1,178 NM', speed: '390 KTS', pax: '最大4名',  url: '#' },
    { name: 'Embraer Phenom 300',            type: 'Light Business Jet',          range: '1,971 NM', speed: '453 KTS', pax: '最大9名',  url: '#' },
    // Learjet
    { name: 'Learjet 75 Liberty',            type: 'Midsize Business Jet',        range: '2,040 NM', speed: '465 KTS', pax: '最大9名',  url: '#' },
];

function formatPax(pax) {
    var lang = localStorage.getItem('preferredLang');
    if (lang === 'en') {
        return pax.replace(/最大(\d+)名/g, 'Max $1 Passengers');
    }
    return pax;
}

function performSearch(query) {
    if (!query || query.trim() === '') {
        searchResults.classList.remove('active');
        return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = aircraftDatabase.filter(aircraft => 
        aircraft.name.toLowerCase().includes(lowerQuery) ||
        aircraft.type.toLowerCase().includes(lowerQuery) ||
        aircraft.range.toLowerCase().includes(lowerQuery) ||
        aircraft.pax.includes(lowerQuery)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No aircraft found</div>';
        searchResults.classList.add('active');
        return;
    }

    searchResults.innerHTML = matches.map(aircraft => `
        <a href="${aircraft.url}" class="search-result-item">
            <div class="search-result-title">${aircraft.name}</div>
            <div class="search-result-type">${aircraft.range} · ${aircraft.speed} · ${formatPax(aircraft.pax)}</div>
        </a>
    `).join('');
    searchResults.classList.add('active');
}

if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        performSearch(e.target.value);
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim() !== '') {
            performSearch(this.value);
        }
    });
}

if (searchButton) {
    searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
    });
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (searchResults && !searchResults.contains(e.target) && 
        e.target !== searchInput && e.target !== searchButton) {
        searchResults.classList.remove('active');
    }
});

// Prevent input blur from closing the dropdown when clicking a result
if (searchResults) {
    searchResults.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            // Clear inline transform after scroll-in animation so CSS hover can work
            entry.target.addEventListener('transitionend', function onEnd(e) {
                if (e.propertyName === 'transform') {
                    entry.target.style.transform = '';
                    entry.target.style.transition = '';
                    entry.target.removeEventListener('transitionend', onEnd);
                }
            });
        }
    });
}, observerOptions);

// Observe all cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.aircraft-type-card, .aircraft-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});

// Active nav link highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
        if (current === '' && link.getAttribute('href') === 'Home.html') {
            link.classList.add('active');
        }
    });
});
