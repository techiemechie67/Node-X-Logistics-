/**
 * Node-X-Logistics — Core Application State & Mock API Controller (Bugatti Design System)
 * Problem Statement #6 (CSI ORIGINS 2026)
 * Uses MockEngine for 100% standalone in-browser execution with Bugatti Typography Trinity & Full-Page Vanta 3D Waves.
 */

let currentTemplateId = "apparel";
let activeNodes = [];
let activeDashboard = null;
let graphInstance = null;
let ledgerViewInstance = null;
let lastVoiceAlertText = "Awaiting physical simulation event. Underwriting parameters nominal.";

// Initialization on DOM load
function initApp() {
  initGraph();
  if (typeof initLedger === "function") initLedger();
  loadTemplateNetwork(currentTemplateId);
  if (typeof fetchLedgerState === "function") fetchLedgerState();
  if (window.PathwayOptimizer && typeof window.PathwayOptimizer.init === "function") {
    window.PathwayOptimizer.init();
  }
  if (window.CrisisLab && typeof window.CrisisLab.init === "function") {
    window.CrisisLab.init();
  }
}
window.initApp = initApp;

document.addEventListener("DOMContentLoaded", () => {
  initApp();

  if (window.location.hash === "#simulator") {
    showView("simulator");
  }
});

// Navigation View Switcher
function showView(viewName) {
  const homeView = document.getElementById("homeView");
  const simView = document.getElementById("simView");
  const navHomeBtn = document.getElementById("navHomeBtn");
  const navSimBtn = document.getElementById("navSimBtn");

  if (viewName === "home") {
    if (homeView) homeView.classList.add("active");
    if (simView) simView.classList.remove("active");
    if (navHomeBtn) navHomeBtn.classList.add("active");
    if (navSimBtn) navSimBtn.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    if (homeView) homeView.classList.remove("active");
    if (simView) simView.classList.add("active");
    if (navHomeBtn) navHomeBtn.classList.remove("active");
    if (navSimBtn) navSimBtn.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (graphInstance) graphInstance.render(activeNodes);
    }, 100);
  }
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

function switchStudioTab(tabKey) {
  const tabs = ["topology", "crises", "ai-advisor", "ledger"];
  tabs.forEach((key) => {
    const btn = document.getElementById(`studioTab_${key}`);
    const pane = document.getElementById(`studioPane_${key}`);
    if (btn) {
      if (key === tabKey) btn.classList.add("active");
      else btn.classList.remove("active");
    }
    if (pane) {
      if (key === tabKey) {
        pane.classList.add("active");
        pane.style.display = "block";
      } else {
        pane.classList.remove("active");
        pane.style.display = "none";
      }
    }
  });

  if (tabKey === "topology" && graphInstance) {
    setTimeout(() => {
      if (typeof graphInstance.render === "function") graphInstance.render(activeNodes);
    }, 50);
  }
}
window.switchStudioTab = switchStudioTab;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize Visualizers
function initGraph() {
  graphInstance = new SupplyChainTriangulationGraph("graphViewport", "radarSvg", onNodeSelected);
  window.graphInstance = graphInstance;
}

function initLedger() {
  ledgerViewInstance = new LedgerView("ledgerEntriesList", "activeLocksList", "ledgerCountBadge");
}

// Load Network Template (Standalone via MockEngine)
async function loadTemplateNetwork(templateId) {
  currentTemplateId = templateId;
  try {
    const data = await window.MockEngine.getNodes(templateId);
    activeNodes = data.nodes || [];
    activeDashboard = data.dashboard;

    if (graphInstance) graphInstance.setNodes(activeNodes);
    updateDashboardUI(activeDashboard);
    populateShockTargetDropdown(activeNodes);
    if (activeNodes.length > 0) {
      onNodeSelected(activeNodes[0]);
    }
  } catch (err) {
    console.error("Failed to load network template:", err);
  }
}

function onTemplateChange(newTemplateId) {
  loadTemplateNetwork(newTemplateId);
}

function populateShockTargetDropdown(nodes) {
  const select = document.getElementById("shockTargetNode");
  if (!select) return;

  select.innerHTML = nodes
    .map((n) => `<option value="${n.id}">${n.type.toUpperCase()}: ${n.name.toUpperCase()}</option>`)
    .join("");
}

function updateMagnitudeDisplay(val) {
  const span = document.getElementById("magnitudeVal");
  if (span) span.textContent = `${val} DAYS / %`;
}

let currentlyInspectedNode = null;
let lockedSelectedNode = null;

function onNodeSelected(node) {
  lockedSelectedNode = node;
  currentlyInspectedNode = node;
  
  const emptyBox = document.getElementById("inspectorEmpty");
  const contentBox = document.getElementById("inspectorContent");
  if (!node || !contentBox) return;

  if (emptyBox) emptyBox.classList.add("hidden");
  contentBox.classList.remove("hidden");

  const modeLabel = document.getElementById("inspectorModeLabel");
  if (modeLabel) {
    modeLabel.textContent = "INSPECTING";
    modeLabel.style.color = "#ffffff";
  }

  contentBox.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; font-family:var(--font-mono, monospace); font-size:11px;">
      <div style="border-bottom:1px solid #222222; padding-bottom:6px;">
        <div style="color:#ffffff; font-weight:600;">${node.name.toUpperCase()}</div>
        <div style="color:#666666; font-size:9px;">${(node.type || '').toUpperCase()} // TIER ${node.tier || 1}</div>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:#777777;">INSTRUMENT:</span>
        <span style="color:#ffffff;">${(node.financingInstrument || '').toUpperCase()}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:#777777;">APPROVED:</span>
        <span style="color:#ffffff;">$${(node.loanAmount || 0).toLocaleString()} (${Math.round((node.ltvRatio || 0.8) * 100)}% LTV)</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:#777777;">RATE:</span>
        <span style="color:#ffffff;">${node.interestRate}% APR ${node.delayDays > 0 ? `(+${node.delayDays}D)` : ''}</span>
      </div>
      <div style="margin-top:6px;">
        ${
          node.assetState === "unfinanced"
            ? `<button class="button-primary button-primary-small" style="width:100%;" onclick="financeSingleNode('${node.id}')">FINANCE</button>`
            : node.assetState === "financed"
            ? `<button class="button-secondary button-secondary-small" style="width:100%;" onclick="settleSingleNode('${node.id}')">SETTLE</button>`
            : `<span style="color:#666666; display:block; text-align:center;">SETTLED</span>`
        }
      </div>
    </div>
  `;
}

function renderNodeInspector(node, isPreview) {
  onNodeSelected(node);
  const modeLabel = document.getElementById("inspectorModeLabel");
  if (modeLabel) {
    modeLabel.textContent = isPreview ? "HOVER PREVIEW" : "INSPECTING";
    modeLabel.style.color = isPreview ? "#a0a0a0" : "#ffffff";
  }
}

function onNodePreview(node) {
  currentlyInspectedNode = node;
  renderNodeInspector(node, true);
}

function onNodePreviewEnd() {
  if (lockedSelectedNode) {
    currentlyInspectedNode = lockedSelectedNode;
    renderNodeInspector(lockedSelectedNode, false);
  }
}

window.onNodeSelected = onNodeSelected;
window.onNodePreview = onNodePreview;
window.onNodePreviewEnd = onNodePreviewEnd;
window.financeSingleNode = financeSingleNode;
window.settleSingleNode = settleSingleNode;

// Preset Shock Runner
function applyPresetShock(shockType, magnitude) {
  const shockSelect = document.getElementById("shockTypeSelect");
  const slider = document.getElementById("magnitudeSlider");
  if (shockSelect) shockSelect.value = shockType;
  if (slider) {
    slider.value = magnitude;
    updateMagnitudeDisplay(magnitude);
  }
  executeCustomSimulation();
}

// Custom Simulation Execution (Standalone via MockEngine)
async function executeCustomSimulation() {
  const targetNodeId = document.getElementById("shockTargetNode")?.value;
  const shockType = document.getElementById("shockTypeSelect")?.value || "port_blockade";
  const magnitude = parseFloat(document.getElementById("magnitudeSlider")?.value || 12);

  const payload = {
    nodeId: targetNodeId,
    shockType: shockType,
    magnitude: magnitude,
    template_id: currentTemplateId
  };

  try {
    const data = await window.MockEngine.simulate(payload);
    activeNodes = data.updatedNodes || [];
    activeDashboard = data.dashboard;

    // Update Graph
    if (graphInstance) graphInstance.setNodes(activeNodes);

    // Update Dashboard
    updateDashboardUI(activeDashboard);

    // Handle Double Financing or Refinancing
    if (data.ledgerCheck && data.ledgerCheck.blocked) {
      showDoubleFinancingAlertBanner(data.ledgerCheck.reason);
    } else {
      hideAlertBanner();
    }

    if (data.refinancingEvent && data.refinancingEvent.triggered) {
      addRefinancingFeedCard(data.refinancingEvent);
      triggerVoiceAlert(data.refinancingEvent.reason);
    }

    // Re-fetch Ledger
    fetchLedgerState();
  } catch (err) {
    console.error("Simulation error:", err);
  }
}

// Live Dashboard UI Updater
function updateDashboardUI(dash) {
  if (!dash) return;

  const elExposure = document.getElementById("dashTotalExposure");
  const elWacc = document.getElementById("dashWacc");
  const elRisk = document.getElementById("dashRiskScore");
  const elRiskBar = document.getElementById("dashRiskBar");
  const elCcc = document.getElementById("dashCcc");
  const elRunway = document.getElementById("dashRunway");
  const elRunwayBar = document.getElementById("dashRunwayBar");
  const elRunwayNote = document.getElementById("dashRunwayNote");
  const elRatio = document.getElementById("dashFinancedRatio");

  if (elExposure) elExposure.textContent = `$${(dash.totalExposure || 0).toLocaleString()}`;
  if (elWacc) elWacc.textContent = `${dash.wacc}%`;
  if (elRisk) elRisk.textContent = `${dash.avgRiskScore}`;
  if (elRiskBar) elRiskBar.style.width = `${Math.min(100, Math.round(dash.avgRiskScore * 100))}%`;
  if (elCcc) elCcc.textContent = `${dash.cashConversionCycleDays} D`;
  if (elRunway) elRunway.textContent = `${dash.liquidityRunwayDays} DAYS`;
  if (elRatio) elRatio.textContent = `${dash.financedCount} / ${dash.totalCost > 0 ? activeNodes.length : 7} FINANCED`;

  if (elRunwayBar) {
    const pct = Math.max(10, Math.min(100, (dash.liquidityRunwayDays / 45) * 100));
    elRunwayBar.style.width = `${pct}%`;
    if (dash.liquidityRunwayDays < 20) {
      elRunwayBar.style.background = "var(--critical)";
      if (elRunwayNote) elRunwayNote.textContent = "CRITICAL: RUNWAY COMPRESSED BELOW 20 DAYS.";
    } else {
      elRunwayBar.style.background = "#ffffff";
      if (elRunwayNote) elRunwayNote.textContent = "NOMINAL BUFFER";
    }
  }

  // Update Homepage Hero numbers too
  const heroExp = document.getElementById("heroExposure");
  const heroWacc = document.getElementById("heroWacc");
  const heroCcc = document.getElementById("heroCcc");
  if (heroExp) heroExp.textContent = `$${(dash.totalExposure || 1184500).toLocaleString()}`;
  if (heroWacc) heroWacc.textContent = `${dash.wacc}%`;
  if (heroCcc) heroCcc.textContent = `${dash.cashConversionCycleDays} DAYS`;
}

// Refinancing Feed
function addRefinancingFeedCard(evt) {
  const feed = document.getElementById("refinancingFeedList");
  if (!feed) return;

  const nowStr = new Date().toLocaleTimeString();
  const isCrit = evt.severity === "CRITICAL";

  const cardHtml = `
    <div class="feed-entry-card ${isCrit ? "critical" : ""}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="caption-uppercase ${isCrit ? "critical-text" : ""}" style="color: ${isCrit ? 'var(--critical)' : '#ffffff'};">${evt.severity}</span>
        <span class="caption-uppercase">${nowStr}</span>
      </div>
      <p class="body-md" style="margin: 4px 0;">${evt.reason}</p>
      <div class="caption-uppercase" style="display: flex; gap: 12px; color: var(--muted);">
        <span>RATE: ${evt.newInterestRate}%</span>
        <span>${evt.affectedNodeIds ? evt.affectedNodeIds.length : 1} NODES REPRICED</span>
      </div>
    </div>
  `;

  feed.insertAdjacentHTML("afterbegin", cardHtml);
}

function clearRefinancingFeed() {
  const feed = document.getElementById("refinancingFeedList");
  if (feed) {
    feed.innerHTML = `
      <div class="feed-entry-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="caption-uppercase" style="color: #ffffff;">BASELINE</span>
          <span class="caption-uppercase">RESET</span>
        </div>
        <p class="body-md" style="margin: 4px 0;">Feed cleared. Autonomous Agent ready for physical events.</p>
      </div>
    `;
  }
}

// Banner Helpers
function showDoubleFinancingAlertBanner(reason) {
  const banner = document.getElementById("graphAlertBanner");
  if (!banner) return;
  banner.classList.remove("hidden");
  banner.innerHTML = `
    <span class="caption-uppercase critical-text">⚠️ ${reason}</span>
    <button class="button-secondary button-secondary-small" onclick="hideAlertBanner()">DISMISS</button>
  `;
}

function hideAlertBanner() {
  const banner = document.getElementById("graphAlertBanner");
  if (banner) banner.classList.add("hidden");
}

// Anti-Double-Financing Ledger Client Operations (Standalone via MockEngine)
async function fetchLedgerState() {
  try {
    const data = await window.MockEngine.getLedgerState();
    if (ledgerViewInstance) {
      ledgerViewInstance.render(data.entries, data.activeLocks);
    }
  } catch (err) {
    console.error("Failed to fetch ledger state:", err);
  }
}

async function financeSingleNode(nodeId) {
  try {
    const data = await window.MockEngine.financeNode(nodeId);
    if (!data.success || data.blocked) {
      if (ledgerViewInstance) {
        ledgerViewInstance.showDoubleFinancingAlert(data);
      }
    } else {
      loadTemplateNetwork(currentTemplateId);
      fetchLedgerState();
      switchTab("ledger");
    }
  } catch (err) {
    console.error("Finance node error:", err);
  }
}

async function settleSingleNode(nodeId) {
  try {
    const res = await window.MockEngine.settleNode(nodeId);
    if (res.success) {
      loadTemplateNetwork(currentTemplateId);
      fetchLedgerState();
    }
  } catch (err) {
    console.error("Settle node error:", err);
  }
}

async function financeNextAvailableNode() {
  const unfinancedNode = activeNodes.find((n) => n.assetState === "unfinanced");
  if (unfinancedNode) {
    financeSingleNode(unfinancedNode.id);
  } else {
    alert("All nodes in the current network graph have already been financed or settled.");
  }
}

async function settleActiveBatch() {
  const financedNodes = activeNodes.filter((n) => n.assetState === "financed");
  if (financedNodes.length === 0) {
    alert("No active financed nodes to settle.");
    return;
  }

  for (const n of financedNodes) {
    await window.MockEngine.settleNode(n.id);
  }

  loadTemplateNetwork(currentTemplateId);
  fetchLedgerState();
  switchTab("ledger");
}

// Judge Demonstration: Trigger Double-Financing Attack Test
async function triggerDoubleFinancingAttackDemo() {
  const targetNode = activeNodes[0] || { id: "a1111111-1111-4111-8111-111111111111" };
  try {
    const data = await window.MockEngine.attemptDoubleFinance(targetNode.id, "BATCH-NX-2026-A1");
    if (ledgerViewInstance) {
      ledgerViewInstance.showDoubleFinancingAlert(data);
    }
    triggerVoiceAlert("Alert: Double-financing attempt detected on batch BATCH-NX-2026-A1. Facility issuance blocked by ledger invariant check.");
  } catch (err) {
    console.error("Attack test error:", err);
  }
}

function closeAttackModal() {
  if (ledgerViewInstance) {
    ledgerViewInstance.hideDoubleFinancingAlert();
  }
}

async function resetNetworkAndLedger() {
  try {
    await window.MockEngine.reset();
    loadTemplateNetwork(currentTemplateId);
    fetchLedgerState();
    clearRefinancingFeed();
    hideAlertBanner();
  } catch (err) {
    console.error("Reset error:", err);
  }
}

let voiceEnabled = true;
let voiceRunId = 0;

// Voice Underwriter Synthesizer (Chunked Web Speech Engine)
function onVoiceToggleChange(el) {
  voiceEnabled = Boolean(el && el.checked);
  voiceRunId++; // Invalidates any in-flight chunk loop

  if (!voiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  const audioMeta = document.getElementById("audioMetaTag");
  if (audioMeta) {
    audioMeta.textContent = voiceEnabled ? "READY" : "MUTED";
  }
}

function speakChunked(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const myRunId = ++voiceRunId;

  const words = (text || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  const chunks = [];
  for (let i = 0; i < words.length; i += 4) {
    chunks.push(words.slice(i, i + 4).join(" "));
  }

  function playChunk(index) {
    if (!voiceEnabled || myRunId !== voiceRunId || index >= chunks.length) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    utterance.onend = () => {
      if (voiceEnabled && myRunId === voiceRunId) {
        playChunk(index + 1);
      }
    };
    utterance.onerror = () => {
      if (voiceEnabled && myRunId === voiceRunId) {
        playChunk(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  playChunk(0);
}

async function triggerVoiceAlert(text) {
  lastVoiceAlertText = text;
  const audioText = document.getElementById("underwriterSpeechText");
  const audioMeta = document.getElementById("audioMetaTag");

  if (audioText) audioText.textContent = `"${text}"`;

  if (!voiceEnabled) {
    if (audioMeta) audioMeta.textContent = "MUTED";
    return;
  }

  if (audioMeta) audioMeta.textContent = "WEB SPEECH";
  speakChunked(text);
}

function replayLastVoiceAlert() {
  triggerVoiceAlert(lastVoiceAlertText);
}

// Attach all critical simulation functions to window for global access
window.triggerVoiceAlert = triggerVoiceAlert;
window.replayLastVoiceAlert = replayLastVoiceAlert;
window.onVoiceToggleChange = onVoiceToggleChange;
window.resetNetworkAndLedger = resetNetworkAndLedger;
window.triggerDoubleFinancingAttackDemo = triggerDoubleFinancingAttackDemo;
window.financeNextAvailableNode = financeNextAvailableNode;
window.settleActiveBatch = settleActiveBatch;
window.applyPresetShock = applyPresetShock;
window.executeCustomSimulation = executeCustomSimulation;
window.showView = showView;
window.scrollToSection = scrollToSection;
window.switchStudioTab = switchStudioTab;
window.onTemplateChange = onTemplateChange;
