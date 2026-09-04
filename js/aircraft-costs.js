// ══════════════════════════════════════════════════════════════════════════════
// AIRCRAFT COSTS — single source of truth for all aircraft cost data.
//
// To update costs for any aircraft, edit the values in this file only.
// Each aircraft page reads its data via applyAircraftCosts(AIRCRAFT_ID).
// The catalog is snapshotted before legacy page-local overrides execute, so
// the values below remain authoritative across the completed aircraft pages.
//
// Cost fields:
//   fuelLitersPerHour  — used by fuelcost.js to compute dynamic fuel cost
//   hourly.airframe    — airframe maintenance cost per flight hour (USD)
//   hourly.engine      — engine/APU programme cost per flight hour (USD)
//   hourly.misc        — other variable costs per flight hour (USD)
//   annual.crew        — annual crew salary & benefits (USD)
//   annual.training    — annual crew training (USD)
//   annual.hangar      — annual hangar cost (USD)
//   annual.management  — annual management fees (USD)
//   annual.insurance   — annual hull & liability insurance (USD)
//   annual.misc        — other annual fixed costs (USD)
//   runway.takeoff     — minimum takeoff distance in feet
//   runway.landingP91  — minimum landing distance (PART 91) in feet
//   runway.landingP135 — minimum landing distance (PART 135) in feet
// ══════════════════════════════════════════════════════════════════════════════

window.AircraftCosts = {

    // ── Gulfstream G200 ───────────────────────────────────────────────────────
    'G200': {
        fuelLitersPerHour: 1052,          // 278 gal/hr × 3.78541 L/gal
        hourly: {
            airframe: 1721,
            engine:    909,
            misc:      656
        },
        annual: {
            crew:       562900,
            training:   60550,
            hangar:     43900,
            management: 75000,
            insurance:  32340,
            misc:       138787
        },
        runway: {
            takeoff:      6083,
            landingP91:   2590,
            landingP135:  3000
        }
    },

    // ── Gulfstream G280 ───────────────────────────────────────────────────────
    'G280': {
        fuelLitersPerHour: 1037,          // 274 gal/hr × 3.78541 L/gal
        hourly: {
            airframe: 1357,
            engine:    957,
            misc:      775
        },
        annual: {
            crew:       670670,
            training:   100000,
            hangar:     69300,
            management: 35000,
            insurance:  57388,
            misc:       50000
        },
        runway: {
            takeoff:      4750,
            landingP91:   2365,
            landingP135:  3200
        }
    },

    // ── Gulfstream G400 ───────────────────────────────────────────────────────
    'G400': {
        fuelLitersPerHour: 1938,
        hourly: {
            airframe: 1650,
            engine:   1450,
            misc:      759
        },
        annual: {
            crew:       480000,
            training:   110000,
            hangar:     120000,
            management: 60000,
            insurance:  100000,
            misc:       50000
        },
        runway: {
            takeoff:      5000,
            landingP91:   2670,
            landingP135:  3100
        }
    },

    // ── Gulfstream G450 ───────────────────────────────────────────────────────
    'G450': {
        fuelLitersPerHour: 1885,
        hourly: {
            airframe: 1489,
            engine:   1247,
            misc:     500
        },
        annual: {
            crew:       670670,
            training:   107200,
            hangar:     114400,
            management: 50000,
            insurance:  65993,
            misc:       33333
        },
        runway: {
            takeoff:      5600,
            landingP91:   2650,
            landingP135:  3313
        }
    },

    // ── Gulfstream G500 ───────────────────────────────────────────────────────
    'G500': {
        fuelLitersPerHour: 1325,
        hourly: {
            airframe: 1648,
            engine:   1424,
            misc:     1889
        },
        annual: {
            crew:       818740,
            training:   120000,
            hangar:     130000,
            management: 50000,
            insurance:  104175,
            misc:       50000
        },
        runway: {
            takeoff:      5300,
            landingP91:   2620,
            landingP135:  3100
        }
    },

    // ── Gulfstream G550 ───────────────────────────────────────────────────────
    'G550': {
        fuelLitersPerHour: 1631,          // 431 gal/hr × 3.78541 L/gal
        hourly: {
            airframe: 1800,
            engine:   1450,
            misc:     600
        },
        annual: {
            crew:       500000,
            training:   100000,
            hangar:     150000,
            management: 100000,
            insurance:  100000,
            misc:       50000
        },
        runway: {
            takeoff:      5910,
            landingP91:   2770,
            landingP135:  4617
        }
    },

    // ── Gulfstream G600 ───────────────────────────────────────────────────────
    'G600': {
        fuelLitersPerHour: 1753,
        hourly: {
            airframe: 2350,
            engine:   1650,
            misc:     400
        },
        annual: {
            crew:       820000,
            training:   120000,
            hangar:     180000,
            management: 60000,
            insurance:  210000,
            misc:       50000
        },
        runway: {
            takeoff:      5700,
            landingP91:   2365,
            landingP135:  3100
        }
    },

    // ── Gulfstream G650 ───────────────────────────────────────────────────────
    'G650': {
        fuelLitersPerHour: 1836,          // 485 gal/hr × 3.78541 L/gal
        hourly: {
            airframe: 2410,
            engine:   1560,
            misc:     500
        },
        annual: {
            crew:       818740,
            training:   120000,
            hangar:     163700,
            management: 50000,
            insurance:  116250,
            misc:       25000
        },
        runway: {
            // Source values are feet; the chart converts to metres for display.
            takeoff:      6000,
            landingP91:   3200,
            landingP135:  4167
        }
    },

    // ── Gulfstream G650ER ─────────────────────────────────────────────────────
    'G650ER': {
        fuelLitersPerHour: 1855,
        hourly: {
            airframe: 2440,
            engine:   1580,
            misc:     500
        },
        annual: {
            crew:       818740,
            training:   120000,
            hangar:     165000,
            management: 50000,
            insurance:  230000,
            misc:       50000
        },
        runway: {
            takeoff:      6299,
            landingP91:   3200,
            landingP135:  4167
        }
    }

};

// Keep a private snapshot so legacy page-local blocks cannot replace the
// centralized values after this file loads.
var _aircraftCostCatalog = JSON.parse(JSON.stringify(window.AircraftCosts));

// ── applyAircraftCosts(id) ────────────────────────────────────────────────────
// Stamps data-usd on every cost element and returns the cost object so the
// page script can pass values directly into initCostCharts / initRunwayChart
// without a second round of DOM reads.
//
// Usage (in each aircraft page, before chart init):
//   var AIRCRAFT_ID = 'G550';
//   var _costs = applyAircraftCosts(AIRCRAFT_ID);
// ─────────────────────────────────────────────────────────────────────────────
window.applyAircraftCosts = function (id) {
    var data = _aircraftCostCatalog[id];
    if (!data) {
        console.warn('applyAircraftCosts: no cost data found for aircraft id "' + id + '"');
        return null;
    }

    function set(elementId, value) {
        var el = document.getElementById(elementId);
        if (el) { el.dataset.usd = value; }
    }

    // Hourly variable costs
    set('costAirframe', data.hourly.airframe);
    set('costEngine',   data.hourly.engine);
    set('costMisc',     data.hourly.misc);

    // Annual fixed costs
    set('costCrew',       data.annual.crew);
    set('costTraining',   data.annual.training);
    set('costHangar',     data.annual.hangar);
    set('costMgmt',       data.annual.management);
    set('costInsurance',  data.annual.insurance);
    set('costFixedMisc',  data.annual.misc);

    // Note: fuelCostValue is intentionally left for fuelcost.js to set
    // dynamically based on FUEL_PRICE_PER_LITER × fuelLitersPerHour.

    return data;
};
