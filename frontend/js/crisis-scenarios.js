/**
 * NODE-X-LOGISTICS — DECADE CRISIS LAB & TRIANGULATION GRAPH INTEGRATION
 * Quantitative Macro-Disruption Simulator (2015-2025). Zero Emojis.
 */

(function () {
  const DECADE_CRISES = [
    {
      id: "hormuz_red_sea",
      year: "2023–2024",
      code: "CRISIS-01 // CHOKEPOINT",
      title: "Red Sea & Strait of Hormuz Conflict",
      severity: "CRITICAL",
      severityColor: "#ef4444",
      summary: "Commercial naval blockades and missile strikes forced 3,500nm vessel diversions around the Cape of Good Hope.",
      triangulationDistortion: {
        qualityScore: 92.0,
        timeScore: 40.0,
        costScore: 50.0,
        transitDays: 30.0,
        totalCost: 58200.0,
        carryingCost: 18400.0
      },
      optimalRoute: {
        name: "Trans-Eurasian Rail Intermodal (Middle Corridor)",
        transit: "14 Days",
        savings: "Avoids 16-day Cape detour and cuts capital carrying cost by -$9,800."
      }
    },
    {
      id: "covid_lockdown",
      year: "2020–2021",
      code: "CRISIS-02 // SYSTEMIC",
      title: "COVID-19 Global Port Dwell Gridlock",
      severity: "CRITICAL",
      severityColor: "#ef4444",
      summary: "Manufacturing pauses and dockworker labor shortages caused 45+ day vessel queues in primary maritime gateways.",
      triangulationDistortion: {
        qualityScore: 88.0,
        timeScore: 22.0,
        costScore: 35.0,
        transitDays: 45.0,
        totalCost: 78500.0,
        carryingCost: 32500.0
      },
      optimalRoute: {
        name: "Chartered Air Cargo + Secondary Feeders",
        transit: "6 Days",
        savings: "Compresses lead time by 39 days, freeing working capital and preventing write-downs."
      }
    },
    {
      id: "black_sea_airspace",
      year: "2022–2024",
      code: "CRISIS-03 // GEOPOLITICAL",
      title: "Eurasian Airspace & War Corridors",
      severity: "HIGH",
      severityColor: "#f59e0b",
      summary: "Siberian flyover bans and Black Sea navigation closures increased flight distances and war-risk insurance premiums.",
      triangulationDistortion: {
        qualityScore: 96.0,
        timeScore: 65.0,
        costScore: 68.0,
        transitDays: 16.0,
        totalCost: 44200.0,
        carryingCost: 8200.0
      },
      optimalRoute: {
        name: "Trans-Caspian International Transport Route (TITR)",
        transit: "16 Days",
        savings: "Direct overland rail via Central Asia with zero war-risk surcharges."
      }
    },
    {
      id: "panama_drought",
      year: "2023–2024",
      code: "CRISIS-04 // CLIMATE",
      title: "Panama Canal Gatun Lake Drought",
      severity: "HIGH",
      severityColor: "#f59e0b",
      summary: "Severe precipitation deficits lowered reservoir levels, reducing daily transit slots by 38% and driving auction premiums.",
      triangulationDistortion: {
        qualityScore: 98.0,
        timeScore: 50.0,
        costScore: 62.0,
        transitDays: 23.0,
        totalCost: 48000.0,
        carryingCost: 14200.0
      },
      optimalRoute: {
        name: "US West Coast Double-Stack Rail Land-Bridge",
        transit: "9 Days",
        savings: "Unloads at West Coast ports to intermodal rail, saving 14 days of anchor wait time."
      }
    },
    {
      id: "energy_bunker_spike",
      year: "2022",
      code: "CRISIS-05 // COMMODITY",
      title: "Global Bunker Fuel & Energy Surge",
      severity: "MODERATE",
      severityColor: "#38bdf8",
      summary: "VLSFO bunker fuel exceeded $1,100/ton, triggering 65% carrier fuel surcharges and industry-wide slow steaming.",
      triangulationDistortion: {
        qualityScore: 94.0,
        timeScore: 58.0,
        costScore: 72.0,
        transitDays: 22.0,
        totalCost: 36800.0,
        carryingCost: 7800.0
      },
      optimalRoute: {
        name: "Slow Steaming + Dynamic PO Hedging Line",
        transit: "22 Days",
        savings: "Saves $18,000 in fuel billing with only $3,200 additional carrying expense."
      }
    }
  ];

  function renderCrisisLab() {
    const container = document.getElementById("crisisCardsGrid");
    if (!container) return;

    container.innerHTML = DECADE_CRISES.map((c) => {
      const d = c.triangulationDistortion;
      return `
        <div class="crisis-card" id="crisisCard_${c.id}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <span class="sub-text" style="display: block; margin-bottom: 2px;">${c.code} // ${c.year}</span>
                <h4>${c.title}</h4>
              </div>
              <span class="sub-text" style="border: 1px solid #333333; padding: 2px 6px; border-radius: 2px;">
                ${c.severity}
              </span>
            </div>

            <p style="color: #a0a0a0; margin: 8px 0 12px; font-size: 12px; line-height: 1.5; font-family: var(--font-sans, sans-serif);">
              ${c.summary}
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #000000; border: 1px solid #222222; border-radius: 2px; padding: 8px 10px; margin-bottom: 10px;">
              <div>
                <span class="sub-text">QUALITY</span>
                <div class="metric-value">${d.qualityScore}%</div>
              </div>
              <div>
                <span class="sub-text">TRANSIT</span>
                <div class="metric-value">${d.transitDays} DAYS</div>
              </div>
              <div>
                <span class="sub-text">WORKING CAPITAL</span>
                <div class="metric-value">$${Math.round(d.totalCost).toLocaleString()}</div>
              </div>
            </div>

            <div style="background: #000000; border: 1px solid #222222; border-left: 2px solid #555555; border-radius: 2px; padding: 8px 10px;">
              <span class="sub-text" style="color: #ffffff !important; display: block; margin-bottom: 2px;">OPTIMAL STRATEGY: ${c.optimalRoute.name.toUpperCase()}</span>
              <div class="sub-text">${c.optimalRoute.savings}</div>
            </div>
          </div>

          <button class="button-secondary button-secondary-small" style="width: 100%; margin-top: 10px; padding: 8px;" onclick="window.CrisisLab.applyCrisisToTriangulation('${c.id}')">
            SIMULATE CRISIS ON TRIANGULATION GRAPH
          </button>
        </div>
      `;
    }).join("");
  }

  function applyCrisisToTriangulation(crisisId) {
    const crisis = DECADE_CRISES.find((c) => c.id === crisisId);
    if (!crisis) return;

    const d = crisis.triangulationDistortion;

    // Update active node in graph
    if (window.activeNodes && window.activeNodes.length > 0) {
      const transitNode = window.activeNodes.find((n) => n.type === "transit" || n.type === "TRANSIT") || window.activeNodes[0];
      transitNode.isBottleneck = true;
      transitNode.delayDays = d.transitDays - 10;
      transitNode.cost = d.totalCost - d.carryingCost;
      transitNode.qualityScore = d.qualityScore;
      transitNode.supplierReliabilityScore = d.qualityScore / 100.0;
    }

    // Update Triangulation Graph Radar & Topology
    if (window.graphInstance && typeof window.graphInstance.updateTriangulation === "function") {
      window.graphInstance.updateTriangulation({
        qualityScore: d.qualityScore,
        timeScore: d.timeScore,
        costScore: d.costScore,
        transitDays: d.transitDays,
        freightCost: d.totalCost - d.carryingCost,
        carryingCost: d.carryingCost,
        totalCost: d.totalCost,
        activeCrisis: crisis.title
      });
    }

    // Switch to Triangulation Graph View
    if (typeof window.switchStudioTab === "function") {
      window.switchStudioTab("topology");
    }

    if (typeof window.triggerVoiceAlert === "function") {
      window.triggerVoiceAlert(`Simulating ${crisis.title} on Triangulation Graph. Transit duration expanded to ${d.transitDays} days with landed cost of $${d.totalCost.toLocaleString()}. Optimal reroute: ${crisis.optimalRoute.name}.`);
    }
  }

  window.CrisisLab = {
    init: renderCrisisLab,
    applyCrisisToTriangulation: applyCrisisToTriangulation
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderCrisisLab();
  });
})();
