// Common Chart.js configuration and utilities

// Default chart colors
const chartColors = {
    primary: 'rgb(0, 102, 204)',
    secondary: 'rgb(0, 73, 153)',
    accent: 'rgb(255, 107, 53)',
    success: 'rgb(75, 192, 192)',
    warning: 'rgb(255, 205, 86)',
    danger: 'rgb(255, 99, 132)',
    info: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)'
};

// XJ investment category color palette (matches investment.css)
// Indices: 0=all(gray), 1=results(blue), 2=timely(teal), 3=report(slate), 4=ir(steel), 5=info(ocean)
var xjPalette = {
    light: ['#64748b', '#4a6699', '#2d8fa8', '#4f5a8a', '#3d7fa8', '#2d6894', '#2a74c8'],
    dark:  ['#94a3b8', '#7caad6', '#5dc8e0', '#8090c2', '#6db0de', '#5d9ac4', '#5d9ee8']
};

// Current-theme XJ chart registry for live theme switching
var _xjCharts = {};

function _isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

function _hexToRgba(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function _xjColor(index, alpha) {
    var palette = _isDark() ? xjPalette.dark : xjPalette.light;
    var hex = palette[index % palette.length];
    return (typeof alpha === 'number') ? _hexToRgba(hex, alpha) : hex;
}

function _themeChartColor(alpha) {
    var base = _isDark() ? chartColors.secondary : chartColors.primary;
    if (typeof alpha === 'number') {
        return base.replace(/^rgb\(/, 'rgba(').replace(/\)$/, ',' + alpha + ')');
    }
    return base;
}

function _themeChartColors(count, alpha) {
    var color = _themeChartColor(alpha);
    return new Array(count).fill(color);
}

function _themeBluePalette(count, alpha) {
    var palette = _isDark() ? [
        'rgb(107, 156, 219)',
        'rgb(120, 171, 229)',
        'rgb(134, 185, 238)',
        'rgb(148, 199, 247)',
        'rgb(162, 211, 255)',
        'rgb(180, 225, 255)'
    ] : [
        'rgb(6, 54, 102)',
        'rgb(13, 78, 145)',
        'rgb(20, 103, 189)',
        'rgb(30, 124, 220)',
        'rgb(45, 141, 236)',
        'rgb(64, 160, 252)'
    ];
    var colors = [];
    for (var i = 0; i < count; i++) {
        var rgb = palette[i % palette.length];
        if (typeof alpha === 'number') {
            var rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (rgbMatch) {
                colors.push('rgba(' + rgbMatch[1] + ',' + rgbMatch[2] + ',' + rgbMatch[3] + ',' + alpha + ')');
            } else {
                colors.push(rgb);
            }
        } else {
            colors.push(rgb);
        }
    }
    return colors;
}

function _themeLabelColor() {
    return _isDark() ? '#fff' : '#2d2f4e';
}

function _updateXjChartColors() {
    // Runway chart — 3 bars using primary/secondary theme color with white outlines
    if (_xjCharts.runway) {
        var ds = _xjCharts.runway.data.datasets[0];
        var bg = _themeBluePalette(3, 0.8);
        ds.backgroundColor = bg;
        ds.borderColor = ['#fff', '#fff', '#fff'];
        ds.hoverBackgroundColor = bg;
        _xjCharts.runway.options.scales.x.title.color = _themeLabelColor();
        _xjCharts.runway.options.scales.x.ticks.color = _themeLabelColor();
        _xjCharts.runway.options.scales.x.grid.color = _isDark() ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
        _xjCharts.runway.options.scales.y.ticks.color = _themeLabelColor();
        _xjCharts.runway.update('none');
    }
    // Variable cost pie — theme color slice fill with white outlines
    if (_xjCharts.variableCost) {
        var ds2 = _xjCharts.variableCost.data.datasets[0];
        ds2.backgroundColor = _themeBluePalette(4, 0.8);
        ds2.borderColor = ['#fff', '#fff', '#fff', '#fff'];
        _xjCharts.variableCost.options.plugins.legend.labels.color = _themeLabelColor();
        _xjCharts.variableCost.update('none');
    }
    // Fixed cost pie — theme color slice fill with white outlines
    if (_xjCharts.fixedCost) {
        var ds3 = _xjCharts.fixedCost.data.datasets[0];
        ds3.backgroundColor = _themeBluePalette(6, 0.8);
        ds3.borderColor = ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'];
        _xjCharts.fixedCost.options.plugins.legend.labels.color = _themeLabelColor();
        _xjCharts.fixedCost.update('none');
    }
}

// Chart label sets keyed by language for live language switching
var _xjChartLabels = {
    runway: {
        ja: ['最短離陸距離', '最短着陸距離（PART 91）', '最短着陸距離（PART 135）'],
        en: ['Minimum Takeoff Distance', 'Minimum Landing Distance (PART 91)', 'Minimum Landing Distance (PART 135)']
    },
    variable: {
        ja: ['燃料', '機体整備', 'エンジン・APU整備', 'その他変動費'],
        en: ['Fuel', 'Airframe Maintenance', 'Engine/APU Maintenance', 'Other Variable Costs']
    },
    fixed: {
        ja: ['乗組員給与・福利厚生', '乗組員訓練', '格納庫', '保険', '管理', 'その他固定費'],
        en: ['Crew Salary & Benefits', 'Crew Training', 'Hangar', 'Insurance', 'Management', 'Miscellaneous Fixed']
    }
};

// Returns runway labels for the given language, splitting PART 91/135 onto a
// second line on mobile so the bar area isn't squished by long y-axis text.
function _runwayLabels(lang) {
    var l = (lang === 'en') ? 'en' : 'ja';
    if (typeof window !== 'undefined' && window.innerWidth <= 767) {
        var mobile = {
            ja: ['最短離陸距離', ['最短着陸距離', '（PART 91）'], ['最短着陸距離', '（PART 135）']],
            en: [['Minimum Takeoff', 'Distance'], ['Minimum Landing', 'Distance (PART 91)'], ['Minimum Landing', 'Distance (PART 135)']]
        };
        return mobile[l];
    }
    return _xjChartLabels.runway[l].slice();
}

// Update cost chart labels to the current language (called by language.js hook below)
function updateCostChartLanguage(lang) {
    var l = (lang === 'en') ? 'en' : 'ja';
    if (_xjCharts.runway) {
        _xjCharts.runway.data.labels = _runwayLabels(lang);
        _xjCharts.runway.options.scales.x.title.text = (l === 'en') ? 'Distance' : '距離';
        _xjCharts.runway.update('none');
    }
    if (_xjCharts.variableCost) {
        _xjCharts.variableCost.data.labels = _xjChartLabels.variable[l].slice();
        _xjCharts.variableCost.update('none');
    }
    if (_xjCharts.fixedCost) {
        _xjCharts.fixedCost.data.labels = _xjChartLabels.fixed[l].slice();
        _xjCharts.fixedCost.update('none');
    }
}

// Refresh runway labels when crossing the mobile breakpoint on resize
(function () {
    var _prevMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
    var _resizeTimer = null;
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', function () {
            if (_resizeTimer) { clearTimeout(_resizeTimer); }
            _resizeTimer = setTimeout(function () {
                var nowMobile = window.innerWidth <= 767;
                if (nowMobile !== _prevMobile) {
                    _prevMobile = nowMobile;
                    if (_xjCharts.runway) {
                        var lang = document.documentElement.getAttribute('lang') || 'ja';
                        _xjCharts.runway.data.labels = _runwayLabels(lang);
                        _xjCharts.runway.update('none');
                    }
                }
            }, 150);
        });
    }
}());

// Watch for lang attribute changes on <html> (set by language.js applyLanguage)
if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].attributeName === 'lang') {
                updateCostChartLanguage(document.documentElement.getAttribute('lang'));
                break;
            }
        }
    }).observe(document.documentElement, { attributes: true });
}

// Watch for light/dark theme toggles and update chart colors automatically
if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].attributeName === 'data-theme') {
                _updateXjChartColors();
                break;
            }
        }
    }).observe(document.documentElement, { attributes: true });
}

// Default chart options
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                font: {
                    family: 'Inter',
                    size: 12
                },
                padding: 15,
                color: '#2d2f4e'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(26, 26, 46, 0.9)',
            titleFont: {
                family: 'Inter',
                size: 14
            },
            bodyFont: {
                family: 'Inter',
                size: 13
            },
            padding: 12,
            cornerRadius: 6
        }
    }
};

// Function to create a comparison chart
function createComparisonChart(canvasId, aircraftData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Speed', 'Range', 'Capacity', 'Efficiency', 'Reliability', 'Comfort'],
            datasets: aircraftData.map((aircraft, index) => ({
                label: aircraft.name,
                data: aircraft.metrics,
                fill: true,
                backgroundColor: `${Object.values(chartColors)[index % 8]}33`,
                borderColor: Object.values(chartColors)[index % 8],
                pointBackgroundColor: Object.values(chartColors)[index % 8],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: Object.values(chartColors)[index % 8]
            }))
        },
        options: {
            ...defaultChartOptions,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}

// Function to create a performance trend chart
function createTrendChart(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: Object.values(chartColors)[index % 8],
                backgroundColor: `${Object.values(chartColors)[index % 8]}1A`,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }))
        },
        options: {
            ...defaultChartOptions,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Function to create a specifications bar chart
function createSpecsBarChart(canvasId, labels, data, label = 'Value') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: Object.values(chartColors).map(color => `${color}B3`),
                borderColor: Object.values(chartColors),
                borderWidth: 2
            }]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Animation utility
Chart.defaults.animation = false;

Chart.defaults.font.family = 'Inter';
Chart.defaults.color = '#2d2f4e';

function forceChartRedraw(chart, attempts) {
    if (!chart) {
        return;
    }

    const remaining = typeof attempts === 'number' ? attempts : 3;
    chart.resize();
    chart.update('none');

    if (remaining <= 1) {
        return;
    }

    if (chart.width === 0 || chart.height === 0) {
        setTimeout(function() {
            forceChartRedraw(chart, remaining - 1);
        }, 150);
    }
}

// ===========================
// AIRCRAFT-SPECIFIC CHARTS
// ===========================

// Interactive Range Map with Leaflet
let rangeMap;
let ferryCircle;
let passengerCircle;

function initRangeMap(defaultLat, defaultLng, ferryRangeNM, passengerRangeNM, aircraftName, defaultAirportLabel) {
    var NM_TO_M = 1852;
    var EARTH_R  = 6371008.8;
    var MAX_LAT  = 85.05112878;
    /* Draw rings and pins on 5 world copies so they appear on every repeated
       tile pane.  ±720° covers zoom 1 (≈3 full world widths visible). */
    var OFFSETS = [-720, -360, 0, 360, 720];

    /* Build a geodesic (great-circle) ring around a center point.
       Uses cLng directly so calling with cLng ± 360n shifts the whole ring
       by exactly one world copy — identical geometry, different tile pane. */
    function buildRing(cLat, cLng, radiusM, steps) {
        steps = steps || 360;
        var d    = radiusM / EARTH_R;
        var phi1 = cLat * Math.PI / 180;
        var lam1 = cLng * Math.PI / 180;
        var pts  = [];
        var prevLam = null;

        /* Determine geometrically which poles (if any) this ring encircles.
           Angular distance from north pole to centre = π/2 − phi1.
           Angular distance from south pole to centre = π/2 + phi1.
           The ring encircles a pole when d exceeds that angular distance. */
        var encirclesNorth = d > (Math.PI / 2 - phi1);
        var encirclesSouth = d > (Math.PI / 2 + phi1);

        for (var i = 0; i <= steps; i++) {
            var az   = (i / steps) * 2 * Math.PI;
            var sinP = Math.sin(phi1);
            var cosP = Math.cos(phi1);
            var sinD = Math.sin(d);
            var cosD = Math.cos(d);

            var phi2 = Math.asin(sinP * cosD + cosP * sinD * Math.cos(az));
            var dLam = Math.atan2(
                Math.sin(az) * sinD * cosP,
                cosD - sinP * Math.sin(phi2)
            );
            var latDeg = phi2 * 180 / Math.PI;
            var lonDeg = (lam1 + dLam) * 180 / Math.PI;

            /* Unwrap longitude — prevent consecutive points jumping > 180° */
            if (prevLam !== null) {
                var diff = lonDeg - prevLam;
                if (diff >  180) lonDeg -= 360;
                if (diff < -180) lonDeg += 360;
            }
            prevLam = lonDeg;

            /* Clamp to Mercator limits */
            if      (latDeg >  MAX_LAT) { latDeg =  MAX_LAT; }
            else if (latDeg < -MAX_LAT) { latDeg = -MAX_LAT; }

            pts.push([latDeg, lonDeg]);
        }

        /* Collect all ring longitudes once for polar-cap construction. */
        var lons = pts.map(function(p) { return p[1]; }).sort(function(a, b) { return a - b; });

        /* Prepend a row at +MAX_LAT only when the ring actually encircles the
           north pole — closes the filled polygon at the northern Mercator boundary. */
        if (encirclesNorth) {
            for (var j = lons.length - 1; j >= 0; j--) {
                pts.unshift([MAX_LAT, lons[j]]);
            }
        }

        /* Append a row at −MAX_LAT only when the ring actually encircles the
           south pole — closes the filled polygon at the southern Mercator boundary. */
        if (encirclesSouth) {
            for (var k = lons.length - 1; k >= 0; k--) {
                pts.push([-MAX_LAT, lons[k]]);
            }
        }

        return pts;
    }

    /* Convert fill-pts (which may include polar-cap or MAX_LAT-clamped points)
       into separate polyline segments so the outline border is never drawn
       through the clamped polar region — which would produce jarring vertical
       artifacts at those boundaries.  L.polyline([seg1, seg2, ...]) draws each
       segment as an independent open line with no auto-close connector. */
    function toOutlineSegments(pts) {
        var segs = [];
        var curr = [];
        for (var k = 0; k < pts.length; k++) {
            if (Math.abs(pts[k][0]) >= MAX_LAT - 0.001) {
                /* Clamped point — end current segment (don't include the clamped lat) */
                if (curr.length > 1) { segs.push(curr); }
                curr = [];
            } else {
                curr.push(pts[k]);
            }
        }
        if (curr.length > 1) { segs.push(curr); }
        return segs;
    }

    /* Local map/layer references */
    var _map     = null;
    var _rings   = [];   /* all ring polygon layers */
    var _markers = [];   /* all pin layers */

    function drawRings(lat, lng) {
        if (!_map) return;

        /* Remove all previous rings and pins */
        _rings.forEach(function(l) { try { _map.removeLayer(l); } catch(e) {} });
        _rings = [];
        _markers.forEach(function(m) { try { _map.removeLayer(m); } catch(e) {} });
        _markers = [];

        /* Pre-compute whether the ferry ring encircles BOTH poles (equatorial airports).
           When both poles are geometrically enclosed the cap-stitching in buildRing
           attaches both a MAX_LAT and a −MAX_LAT row to a ring that never actually
           reaches those latitudes, producing a corrupted fill shape.  For that case
           we instead use an inverted (exterior) fill — everything outside the ring. */
        var _dFerry   = (ferryRangeNM * NM_TO_M) / EARTH_R;
        var _phi1     = lat * Math.PI / 180;
        var _ferryEquatorial = (_dFerry > (Math.PI / 2 - _phi1)) &&
                               (_dFerry > (Math.PI / 2 + _phi1));

        /* Draw one set of rings + one pin per world copy */
        OFFSETS.forEach(function(offset) {
            var shiftedLng = lng + offset;

            /* Ferry ring — fill polygon (stroke: false) removes the auto-closing seam line;
               separate L.polyline draws the border without an auto-closing segment. */
            try {
                var ferryPts = buildRing(lat, shiftedLng, ferryRangeNM * NM_TO_M, 360);
                var ferryFill;
                if (_ferryEquatorial) {
                    /* Equatorial airport — use exterior (inverted) fill so everything
                       outside the ring is shaded blue (unreachable zone).
                       Strip any polar-cap points buildRing added (they don't reach
                       MAX_LAT for equatorial rings, but filter defensively). */
                    var rawRing = ferryPts.filter(function(p) {
                        return Math.abs(p[0]) < MAX_LAT - 0.001;
                    });
                    var worldBox = [
                        [ MAX_LAT, shiftedLng - 360], [ MAX_LAT, shiftedLng + 360],
                        [-MAX_LAT, shiftedLng + 360], [-MAX_LAT, shiftedLng - 360]
                    ];
                    ferryFill = L.polygon([worldBox, rawRing.slice().reverse()], {
                        stroke: false, fillColor: '#3690eb', fillOpacity: 0.15,
                        fillRule: 'evenodd'
                    }).addTo(_map);
                } else {
                    /* Normal polar-hemisphere ring — interior fill with buildRing caps */
                    ferryFill = L.polygon(ferryPts, {
                        stroke: false, fillColor: '#3690eb', fillOpacity: 0.15
                    }).addTo(_map);
                }
                ferryFill.bindPopup(
                    '<b>Ferry Flight Range</b><br>' +
                    ferryRangeNM.toLocaleString() + ' NM (' +
                    Math.round(ferryRangeNM * 1.852).toLocaleString() + ' km)<br>' +
                    '<small>0 passengers, pilots only</small>'
                );
                _rings.push(ferryFill);
                var ferryLine = L.polyline(toOutlineSegments(ferryPts), {
                    color: '#3690eb', weight: 2
                }).addTo(_map);
                _rings.push(ferryLine);
            } catch (e) { console.warn('Ferry ring error at offset ' + offset + ':', e); }

            /* Passenger ring — same pattern; drawn last so it sits on top */
            try {
                var passPts = buildRing(lat, shiftedLng, passengerRangeNM * NM_TO_M, 360);
                var passFill = L.polygon(passPts, {
                    stroke: false, fillColor: '#ff6384', fillOpacity: 0.15
                }).addTo(_map);
                passFill.bindPopup(
                    '<b>Full Seat Range</b><br>' +
                    passengerRangeNM.toLocaleString() + ' NM (' +
                    Math.round(passengerRangeNM * 1.852).toLocaleString() + ' km)<br>' +
                    '<small>With 18 passengers</small>'
                );
                _rings.push(passFill);
                var passLine = L.polyline(toOutlineSegments(passPts), {
                    color: '#ff6384', weight: 2
                }).addTo(_map);
                _rings.push(passLine);
                if (typeof passLine.bringToFront === 'function') passLine.bringToFront();
            } catch (e) { console.warn('Passenger ring error at offset ' + offset + ':', e); }

            /* Location pin — circleMarker requires no image assets */
            try {
                var pin = L.circleMarker([lat, shiftedLng], {
                    radius: 7,
                    color: '#ffffff',
                    fillColor: '#4a6699',
                    fillOpacity: 1,
                    weight: 2.5
                }).addTo(_map);
                _markers.push(pin);
            } catch (e) { console.warn('Marker error at offset ' + offset + ':', e); }
        });
    }

    var _tileLayer = null;

    var _CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/">CARTO</a>';

    var _TILES = {
        light: {
            url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
            opts: { attribution: _CARTO_ATTR }
        },
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
            opts: { attribution: _CARTO_ATTR }
        }
    };

    function _currentTileKey() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function _applyTiles() {
        if (!_map) return;
        var key = _currentTileKey();
        if (_tileLayer) { _map.removeLayer(_tileLayer); }
        var t = _TILES[key];
        _tileLayer = L.tileLayer(t.url, t.opts).addTo(_map);
    }

    function openAt(lat, lng, label) {
        if (!_map) {
            _map = L.map('rangeMap', { worldCopyJump: true });
            _applyTiles();
            var _initZoom = (typeof window !== 'undefined' && window.innerWidth > 1250) ? 2 : 1;
            _map.setView([0, lng], _initZoom, { animate: false });
        }
        drawRings(lat, lng);
        setTimeout(function() { if (_map) _map.invalidateSize(); }, 150);
        setTimeout(function() { if (_map) _map.invalidateSize(); }, 500);
    }

    /* Watch for theme changes and swap tiles live */
    new MutationObserver(function() {
        _applyTiles();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* Initialise automatically after a short delay so the DOM is stable */
    setTimeout(function() {
        openAt(defaultLat, defaultLng, defaultAirportLabel);
    }, 300);

    /* Return a handle that the airport-search callback can call */
    return function(lat, lng, label) {
        openAt(lat, lng, label);
    };
}

// Runway Length Horizontal Bar Chart
function initRunwayChart(takeoff, landingPart91, landingPart135, unit = 'm') {
    const runwayCtx = document.getElementById('runwayChart');
    if (!runwayCtx) {
        console.error('runwayChart canvas not found');
        return;
    }
    // allow pointer events on the canvas itself so it doesn't block
    // neighboring controls (runway unit toggle buttons).
    runwayCtx.style.pointerEvents = 'auto';

    const baseFeet = [takeoff, landingPart91, landingPart135];
    const chartUnit = unit === 'ft' ? 'ft' : 'm';
    const initialData = chartUnit === 'ft'
        ? baseFeet.map((value) => Math.round(value))
        : baseFeet.map((value) => Math.round(value * 0.3048));
    const chart = new Chart(runwayCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: _runwayLabels('ja'),
            datasets: [{
                label: 'Distance',
                data: initialData,
                backgroundColor: _themeBluePalette(3, 0.8),
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 2,
                barPercentage: 0.8,
                categoryPercentage: 0.9,
                /* highlight the bar when hovered similar to pie slices */
                hoverBackgroundColor: _themeBluePalette(3, 0.8),
                hoverBorderColor: '#fff',
                hoverBorderWidth: 3
            }]
        },
        options: {
            indexAxis: 'y', // This makes the bars horizontal
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    right: 20
                }
            },
            /* switch to nearest+intersect so only the hovered bar is highlighted */
            interaction: {
                mode: 'nearest',
                intersect: true
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 15,
                    cornerRadius: 6,
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    },
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const chartRef = context.chart || {};
                            const unitLabel = chartRef.$unit || 'm';
                            const value = context.parsed.x || 0;
                            const meters = unitLabel === 'ft'
                                ? Math.round(value * 0.3048)
                                : Math.round(value);
                            const feet = unitLabel === 'ft'
                                ? Math.round(value)
                                : Math.round(value / 0.3048);
                            if (unitLabel === 'ft') {
                                return feet.toLocaleString() + ' ft (' + meters.toLocaleString() + ' m)';
                            }
                            return meters.toLocaleString() + ' m (' + feet.toLocaleString() + ' ft)';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    position: 'bottom',
                    title: {
                        display: true,
                        text: '距離',
                        font: {
                            family: 'Inter',
                            size: 13,
                            weight: 'bold'
                        },
                        padding: { top: 10 },
                        color: _themeLabelColor()
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        color: _themeLabelColor()
                    },
                    grid: {
                        color: _isDark() ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        drawBorder: true
                    }
                },
                y: {
                    position: 'left',
                    grid: {
                        display: false,
                        drawBorder: true
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        padding: 10,
                        color: _themeLabelColor()
                    }
                }
            }
        }
    });

    chart.$baseFeet = baseFeet;
    chart.$unit = chartUnit;
    _xjCharts.runway = chart;
    updateRunwayChartUnit(chart, chartUnit);
    forceChartRedraw(chart, 4);
    return chart;
}

function updateRunwayChartUnit(chart, unit) {
    if (!chart || !chart.$baseFeet) {
        return;
    }

    const nextUnit = unit === 'ft' ? 'ft' : 'm';
    const updatedData = nextUnit === 'ft'
        ? chart.$baseFeet.map((value) => Math.round(value))
        : chart.$baseFeet.map((value) => Math.round(value * 0.3048));

    chart.$unit = nextUnit;
    chart.data.datasets[0].data = updatedData.slice();
    var _dl = (document.documentElement.getAttribute('lang') === 'en') ? 'Distance' : '距離';
    chart.options.scales.x.title.text = _dl;
    chart.options.scales.x.max = Math.max.apply(null, updatedData) * 1.1;
    chart.update('none');
    forceChartRedraw(chart, 2);
}

// Cost Breakdown Pie Charts
function getCurrencyConfig() {
    if (typeof window !== 'undefined' && window.currencyConfig) {
        return window.currencyConfig;
    }

    return {
        rate: 1,
        symbol: '$',
        format: (value) => '$' + Math.round(value).toLocaleString('en-US')
    };
}

function initCostCharts(variableCosts, fixedCosts) {
    // Variable Cost Breakdown Pie Chart
    const variableCostCtx = document.getElementById('variableCostChart');
    let variableChart;
    if (variableCostCtx) {
        variableCostCtx.style.pointerEvents = 'auto';
        variableChart = new Chart(variableCostCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: _xjChartLabels.variable.ja.slice(),
                datasets: [{
                    data: [variableCosts.fuel, variableCosts.airframe, variableCosts.engine, variableCosts.misc],
                    backgroundColor: _themeBluePalette(4, 0.8),
                    borderColor: ['#fff', '#fff', '#fff', '#fff'],
                    borderWidth: 2,
                    hoverOffset: 12,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
                interaction: {
                    mode: 'nearest',
                    intersect: true
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 10,
                            boxWidth: 15,
                            color: _themeLabelColor()
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        padding: 15,
                        cornerRadius: 6,
                        titleFont: {
                            family: 'Inter',
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Inter',
                            size: 13
                        },
                        bodySpacing: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                const currencyConfig = getCurrencyConfig();
                                return currencyConfig.format(value) + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // Fixed Cost Breakdown Pie Chart
    const fixedCostCtx = document.getElementById('fixedCostChart');
    let fixedChart;
    if (fixedCostCtx) {
        fixedCostCtx.style.pointerEvents = 'auto';
        fixedChart = new Chart(fixedCostCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: _xjChartLabels.fixed.ja.slice(),
                datasets: [{
                    data: [fixedCosts.crew, fixedCosts.training, fixedCosts.hangar, fixedCosts.insurance, fixedCosts.management, fixedCosts.misc],
                    backgroundColor: _themeBluePalette(6, 0.8),
                    borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
                    borderWidth: 2,
                    hoverOffset: 12,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
                interaction: {
                    mode: 'nearest',
                    intersect: true
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 10,
                            boxWidth: 15,
                            color: _themeLabelColor()
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        padding: 15,
                        cornerRadius: 6,
                        titleFont: {
                            family: 'Inter',
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Inter',
                            size: 13
                        },
                        bodySpacing: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                const currencyConfig = getCurrencyConfig();
                                return currencyConfig.format(value) + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    if (variableChart) {
        variableChart._baseData = variableChart.data.datasets[0].data.slice();
        forceChartRedraw(variableChart, 4);
    }
    if (fixedChart) {
        fixedChart._baseData = fixedChart.data.datasets[0].data.slice();
        forceChartRedraw(fixedChart, 4);
    }

    _xjCharts.variableCost = variableChart;
    _xjCharts.fixedCost = fixedChart;
    return { variableChart, fixedChart };
}

// Dynamic Cost Calculator
function initCostCalculator(initialHourlyVariableCost, annualFixedCost, defaultHours = 450) {
    let hourlyVariableCost = initialHourlyVariableCost;

    function updateCosts() {
        const hoursInput = document.getElementById('annualHours');
        if (!hoursInput) return;

        const hours = parseInt(hoursInput.value) || defaultHours;
        
        // Calculate costs
        const annualVariableCost = hours * hourlyVariableCost;
        const totalAnnualBudget = annualVariableCost + annualFixedCost;
        const costPerHour = totalAnnualBudget / hours;
        
        // Format numbers with commas
        const currencyConfig = getCurrencyConfig();
        const formatCurrency = (num) => currencyConfig.format(num * currencyConfig.rate);
        
        // Update display
        const annualVarElement = document.getElementById('annualVariableCost');
        const totalBudgetElement = document.getElementById('totalAnnualBudget');
        const totalMonthlyBudgetElement = document.getElementById('totalMonthlyBudget');
        const costPerHourElement = document.getElementById('costPerHour');

        if (annualVarElement) annualVarElement.textContent = formatCurrency(annualVariableCost);
        if (totalBudgetElement) totalBudgetElement.textContent = formatCurrency(totalAnnualBudget);
        if (totalMonthlyBudgetElement) totalMonthlyBudgetElement.textContent = formatCurrency(Math.round(totalAnnualBudget / 12));
        if (costPerHourElement) costPerHourElement.textContent = formatCurrency(Math.round(costPerHour));
    }

    function setHourlyCost(newCost) {
        if (typeof newCost === 'number' && newCost >= 0) {
            hourlyVariableCost = newCost;
            updateCosts();
        }
    }

    // Initialize with default values
    updateCosts();

    // Add event listener for hours change
    const hoursInput = document.getElementById('annualHours');
    if (hoursInput) {
        hoursInput.addEventListener('input', updateCosts);
    }

    return {
        update: updateCosts,
        setHourlyCost: setHourlyCost
    };
}
