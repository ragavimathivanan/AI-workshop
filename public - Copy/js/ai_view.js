/**
 * AI Price Prediction View (XGBoost & LSTM)
 */

let priceChartInstance = null;

async function loadAIPricePrediction(cropName = 'Tomato (Hybrid Red)', daysAhead = 15) {
  const container = document.getElementById('aiPredictionContent');
  if (!container) return;

  try {
    const isTa = window.getCurrentLang() === 'ta';
    const data = await FarmConnectAPI.predictPrice(cropName, null, daysAhead);

    if (!data.success) {
      container.innerHTML = `<div class="alert alert-danger">Failed to generate AI price model.</div>`;
      return;
    }

    // Top Summary Metric Cards
    const priceDiffClass = data.priceDiff >= 0 ? 'text-success' : 'text-danger';
    const priceDiffSign = data.priceDiff >= 0 ? '+' : '';

    let actionBadgeClass = 'badge-hold';
    if (data.actionType === 'sell_now') actionBadgeClass = 'badge-sell';
    else if (data.actionType === 'staggered_sale') actionBadgeClass = 'badge-stagger';

    const recommendationText = isTa ? data.recommendationTa : data.recommendation;

    // Render Metrics
    document.getElementById('metricCurrentPrice').innerText = `₹${data.currentPrice}`;
    document.getElementById('metricPredictedPrice').innerText = `₹${data.predicted7DayPrice}`;
    document.getElementById('metricPredictedChange').innerHTML = `<span class="${priceDiffClass}">${priceDiffSign}₹${data.priceDiff} (${priceDiffSign}${data.percentChange}%)</span>`;
    document.getElementById('metricMspPrice').innerText = `₹${data.mspPrice} / ${data.unit}`;
    document.getElementById('metricConfidence').innerText = `${data.modelConfidenceScore} (${data.mapeAccuracy})`;

    // Render Action Advice
    const adviceEl = document.getElementById('aiRecommendationBox');
    if (adviceEl) {
      adviceEl.className = `recommendation-card ${actionBadgeClass}`;
      adviceEl.innerHTML = `
        <div class="recommendation-header">
          <span class="badge ${actionBadgeClass}">${data.actionType.toUpperCase().replace('_', ' ')}</span>
          <h4>${isTa ? 'செயற்கை நுண்ணறிவு பரிந்துரை' : 'AI Strategic Trading Advisory'}</h4>
        </div>
        <p class="recommendation-body">${recommendationText}</p>
      `;
    }

    // Render XGBoost Feature Drivers
    const featureContainer = document.getElementById('xgboostFeaturesList');
    if (featureContainer && data.models.xgboost) {
      featureContainer.innerHTML = data.models.xgboost.featureImportance.map(f => `
        <div class="feature-bar-row">
          <div class="feature-label-group">
            <span class="feature-name">${isTa ? f.featureTa : f.feature}</span>
            <span class="feature-impact ${f.impact.startsWith('+') ? 'impact-pos' : 'impact-neg'}">${f.impact}</span>
          </div>
          <div class="feature-progress-track">
            <div class="feature-progress-fill" style="width: ${f.importancePercent}%;"></div>
          </div>
          <span class="feature-pct">${f.importancePercent}% weight</span>
        </div>
      `).join('');
    }

    // Render Chart.js Multi-line chart
    renderPredictionChart(data, isTa);

  } catch (err) {
    console.error('Error rendering AI prediction view:', err);
  }
}

function renderPredictionChart(data, isTa) {
  const canvas = document.getElementById('priceForecastChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (priceChartInstance) {
    priceChartInstance.destroy();
  }

  const hist = data.models.lstm.historicalTrajectory;
  const future = data.models.lstm.futureTrajectory;

  const labels = [
    ...hist.map(h => h.dateLabel),
    ...future.map(f => f.dateLabel)
  ];

  const historicalPrices = [
    ...hist.map(h => h.price),
    ...future.map(() => null)
  ];

  // Bridge connection point at Today
  const predictedPrices = [
    ...hist.slice(0, -1).map(() => null),
    hist[hist.length - 1].price,
    ...future.map(f => f.price)
  ];

  const upperBounds = [
    ...hist.slice(0, -1).map(() => null),
    hist[hist.length - 1].price,
    ...future.map(f => f.upperBound)
  ];

  const lowerBounds = [
    ...hist.slice(0, -1).map(() => null),
    hist[hist.length - 1].price,
    ...future.map(f => f.lowerBound)
  ];

  const mspLine = labels.map(() => data.mspPrice);

  priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: isTa ? 'வரலாற்று விலை (₹)' : 'Historical Observed Price (₹)',
          data: historicalPrices,
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 3
        },
        {
          label: isTa ? 'LSTM + XGBoost கணிக்கப்பட்ட விலை (₹)' : 'AI Forecast (LSTM + XGBoost) (₹)',
          data: predictedPrices,
          borderColor: '#e65100',
          borderDash: [5, 5],
          backgroundColor: 'rgba(230, 81, 0, 0.15)',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: isTa ? 'அரசு குறைந்தபட்ச ஆதரவு விலை (MSP)' : 'Govt. MSP Floor Price (₹)',
          data: mspLine,
          borderColor: '#9e9e9e',
          borderDash: [3, 3],
          borderWidth: 1.5,
          pointRadius: 0
        },
        {
          label: isTa ? 'உச்சபட்ச வரம்பு' : 'Upper Uncertainty Bound',
          data: upperBounds,
          borderColor: 'transparent',
          backgroundColor: 'rgba(230, 81, 0, 0.08)',
          fill: '+1',
          pointRadius: 0
        },
        {
          label: isTa ? 'குறைந்தபட்ச வரம்பு' : 'Lower Uncertainty Bound',
          data: lowerBounds,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            font: { family: "'Plus Jakarta Sans', 'Noto Sans Tamil', sans-serif" }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.parsed.y !== null) {
                return `${context.dataset.label}: ₹${context.parsed.y}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: isTa ? 'விலை (ரூபாய் / குவிண்டால்)' : 'Price (₹ / Quintal)'
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// Re-render chart on language switch
window.addEventListener('languageChanged', () => {
  const cropSelect = document.getElementById('aiCropSelector');
  if (cropSelect) {
    loadAIPricePrediction(cropSelect.value);
  }
});

window.loadAIPricePrediction = loadAIPricePrediction;
