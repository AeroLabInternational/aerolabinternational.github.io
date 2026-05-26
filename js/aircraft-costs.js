// ══════════════════════════════════════════════════════════════════════════════
// AIRCRAFT COSTS — single source of truth for all aircraft cost data.
//
// To update costs for any aircraft, edit the values in this file only.
// Each aircraft page reads its data via applyAircraftCosts(AIRCRAFT_ID).
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
//   runway.takeoff     — minimum takeoff distance in metres
//   runway.landingP91  — minimum landing distance (PART 91) in metres
//   runway.landingP135 — minimum landing distance (PART 135) in metres
// ══════════════════════════════════════════════════════════════════════════════

window.AircraftCosts = {

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

    // ── Gulfstream G650 ───────────────────────────────────────────────────────
    // 'G650': {
    //     fuelLitersPerHour: 1900,
    //     hourly: {
    //         airframe: 2000,
    //         engine:   1650,
    //         misc:     650
    //     },
    //     annual: {
    //         crew:       550000,
    //         training:   120000,
    //         hangar:     170000,
    //         management: 110000,
    //         insurance:  120000,
    //         misc:       55000
    //     },
    //     runway: {
    //         takeoff:      6000,
    //         landingP91:   2900,
    //         landingP135:  4800
    //     }
    // },

};

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
    var data = window.AircraftCosts[id];
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
