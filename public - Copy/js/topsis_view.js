/**
 * TOPSIS MCDM Interactive Market & Buyer Optimizer
 */

async function loadTOPSISRankings() {
  const container = document.getElementById('topsisResultsContainer');
  if (!container) return;

  const cropName = document.getElementById('topsisCropSelect') ? document.getElementById('topsisCropSelect').value : 'Tomato (Hybrid Red)';
  const cropQuantity = document.getElementById('topsisQuantityInput') ? document.getElementById('topsisQuantityInput').value : 50;

  // Read slider weights
  const customWeights = {
    price: document.getElementById('weightPriceSlider') ? document.getElementById('weightPriceSlider').value : 0.40,
    demand: document.getElementById('weightDemandSlider') ? document.getElementById('weightDemandSlider').value : 0.25,
    distance: document.getElementById('weightDistanceSlider') ? document.getElementById('weightDistanceSlider').value : 0.20,
    transportCost: document.getElementById('weightTransportSlider') ? document.getElementById('weightTransportSlider').value : 0.15
  };

  container.innerHTML = `
    <div class="loading-spinner-box">
      <div class="spinner"></div>
      <p>Computing TOPSIS Euclidean distances and closeness vectors...</p>
    </div>
  `;

  try {
    const isTa = window.getCurrentLang() === 'ta';
    const result = await FarmConnectAPI.runTopsis(cropName, cropQuantity, customWeights);

    if (!result.success || !result.rankedBuyers) {
      container.innerHTML = `<div class="alert alert-danger">No buyer matrix available.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="topsis-summary-banner">
        <div>
          <h4>${isTa ? 'TOPSIS முடிவு பகுப்பாய்வு' : 'TOPSIS Optimization Matrix Result'}</h4>
          <p>${isTa ? `மதிப்பிடப்பட்ட வாங்குபவர்கள்: ${result.totalEvaluated} | பயிர் அளவு: ${cropQuantity} குவிண்டால்` : `Evaluated Buyers: ${result.totalEvaluated} | Quantity: ${cropQuantity} Quintals`}</p>
        </div>
        <div class="topsis-active-weights">
          <span>💰 ${isTa ? 'விலை' : 'Price'}: ${(result.weightsUsed.price * 100).toFixed(0)}%</span>
          <span>📈 ${isTa ? 'தேவை' : 'Demand'}: ${(result.weightsUsed.demand * 100).toFixed(0)}%</span>
          <span>📍 ${isTa ? 'தூரம்' : 'Dist'}: ${(result.weightsUsed.distance * 100).toFixed(0)}%</span>
          <span>🚚 ${isTa ? 'போக்குவரத்து' : 'Transport'}: ${(result.weightsUsed.transportCost * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div class="ranked-buyers-grid">
        ${result.rankedBuyers.map((b, idx) => `
          <div class="topsis-card ${idx === 0 ? 'top-rank-card' : ''}">
            <div class="topsis-card-header">
              <div class="rank-badge-pill ${idx === 0 ? 'badge-gold' : (idx === 1 ? 'badge-silver' : 'badge-bronze')}">
                ${isTa ? b.badgeTa : b.badge}
              </div>
              <div class="closeness-metric">
                <span class="closeness-num">${b.topsis.percentageScore}%</span>
                <span class="closeness-label">TOPSIS Score</span>
              </div>
            </div>

            <div class="buyer-profile-mini">
              <h3>${isTa ? b.buyerTamilName : b.buyerName}</h3>
              <div class="buyer-tags">
                <span class="tag-pill tag-type">${b.buyerType}</span>
                <span class="tag-pill tag-loc">📍 ${b.district} (${b.metrics.distance} km)</span>
                <span class="tag-pill tag-verified">✓ Verified</span>
              </div>
              <p class="topsis-summary-text">${isTa ? b.summaryTa : b.summary}</p>
            </div>

            <div class="topsis-criteria-table">
              <div class="crit-col">
                <span class="crit-label">${isTa ? 'விலை சலுகை' : 'Offered Price'}</span>
                <span class="crit-val text-success">₹${b.metrics.price}/qtl</span>
              </div>
              <div class="crit-col">
                <span class="crit-label">${isTa ? 'தேவை அளவு' : 'Demand Index'}</span>
                <span class="crit-val">${b.metrics.demand}/100</span>
              </div>
              <div class="crit-col">
                <span class="crit-label">${isTa ? 'தூரம்' : 'Distance'}</span>
                <span class="crit-val">${b.metrics.distance} km</span>
              </div>
              <div class="crit-col">
                <span class="crit-label">${isTa ? 'போக்குவரத்து வீதம்' : 'Transport Rate'}</span>
                <span class="crit-val">₹${b.metrics.transportRate}/km</span>
              </div>
            </div>

            <!-- Farmer Net Return Breakdown -->
            <div class="net-return-box">
              <div class="net-row">
                <span>${isTa ? 'மொத்த வருவாய்:' : 'Gross Payout:'}</span>
                <strong>₹${b.economics.grossRevenue.toLocaleString('en-IN')}</strong>
              </div>
              <div class="net-row">
                <span>${isTa ? 'போக்குவரத்து செலவு:' : 'Est. Logistics Cost:'}</span>
                <span class="text-danger">-₹${b.economics.transportCostTotal.toLocaleString('en-IN')}</span>
              </div>
              <div class="net-row net-total">
                <span>${isTa ? 'நிகர லாபம் (கையில் கிடைக்கும்):' : 'Net Take-Home Value:'}</span>
                <strong class="text-success">₹${b.economics.netTakeHome.toLocaleString('en-IN')} (₹${b.economics.netPerQuintal}/qtl)</strong>
              </div>
            </div>

            <div class="card-action-bar">
              <a href="tel:${b.phone}" class="btn btn-primary-light">
                📞 ${isTa ? 'அழைக்க' : 'Call Buyer'} (${b.phone})
              </a>
              <a href="https://wa.me/91${b.phone}?text=Hello%20${encodeURIComponent(b.buyerName)},%20I%20have%20${cropQuantity}%20quintals%20of%20${encodeURIComponent(cropName)}%20ready%20via%20FarmConnect." target="_blank" class="btn btn-whatsapp">
                💬 WhatsApp
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `;

  } catch (err) {
    console.error('Error loading TOPSIS rankings:', err);
    container.innerHTML = `<div class="alert alert-danger">Failed to compute TOPSIS algorithm.</div>`;
  }
}

// Re-render TOPSIS on language switch
window.addEventListener('languageChanged', () => {
  loadTOPSISRankings();
});

window.loadTOPSISRankings = loadTOPSISRankings;
