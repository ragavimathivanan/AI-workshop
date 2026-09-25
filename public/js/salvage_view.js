/**
 * Decision Tree & Rule-Based Matcher for Unsold / Surplus Crops View
 */

async function evaluateUnsoldCrop() {
  const resultContainer = document.getElementById('salvageResultContainer');
  if (!resultContainer) return;

  const cropName = document.getElementById('salvageCropSelect') ? document.getElementById('salvageCropSelect').value : 'Tomato (Hybrid Red)';
  const quantity = document.getElementById('salvageQuantityInput') ? document.getElementById('salvageQuantityInput').value : 15;
  const grade = document.getElementById('salvageGradeSelect') ? document.getElementById('salvageGradeSelect').value : 'Grade B';
  const daysSinceHarvest = document.getElementById('salvageDaysInput') ? document.getElementById('salvageDaysInput').value : 4;
  const damagePercent = document.getElementById('salvageDamageInput') ? document.getElementById('salvageDamageInput').value : 22;
  const perishability = document.getElementById('salvagePerishabilitySelect') ? document.getElementById('salvagePerishabilitySelect').value : 'High';

  resultContainer.innerHTML = `
    <div class="loading-spinner-box">
      <div class="spinner"></div>
      <p>Traversing Decision Tree nodes and matching rule sets...</p>
    </div>
  `;

  try {
    const isTa = window.getCurrentLang() === 'ta';
    const data = await FarmConnectAPI.matchSalvage({
      cropName,
      quantity,
      grade,
      daysSinceHarvest,
      damagePercent,
      perishability
    });

    if (!data.success) {
      resultContainer.innerHTML = `<div class="alert alert-danger">Evaluation failed.</div>`;
      return;
    }

    const primary = data.primaryRoute;
    const secondary = data.secondaryRoute;

    resultContainer.innerHTML = `
      <!-- Traversal Breadcrumb -->
      <div class="decision-tree-path-card">
        <h5>🌳 ${isTa ? 'ஆராயப்பட்ட முடிவு மரத்தின் படிநிலைகள் (Decision Tree Path):' : 'Traversed Decision Tree Path:'}</h5>
        <div class="tree-nodes-flow">
          ${data.decisionTreePath.map((step, idx) => `
            <div class="tree-node-item">
              <span class="node-badge">Node ${idx + 1}</span>
              <span class="node-text">${step}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Primary Match Card -->
      <div class="salvage-primary-card ${primary.badgeClass}">
        <div class="salvage-hero-header">
          <div class="salvage-icon">${primary.icon}</div>
          <div class="salvage-hero-info">
            <span class="badge ${primary.badgeClass}">${isTa ? 'முதன்மை பரிந்துரை' : 'OPTIMAL AI MATCH'}</span>
            <h2>${isTa ? primary.titleTa : primary.title}</h2>
            <p class="salvage-hero-desc">${isTa ? primary.descriptionTa : primary.description}</p>
          </div>
          <div class="salvage-hero-recovery">
            <span class="recovery-label">${isTa ? 'எதிர்பார்க்கப்படும் மீட்பு' : 'Expected Recovery'}</span>
            <span class="recovery-val">${isTa ? primary.payoutRecoveryTa : primary.payoutRecovery}</span>
            <strong class="total-salvage-cash">Est. Value: ₹${data.estimatedEconomics.totalSalvageValue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div class="salvage-reasoning-quote">
          <strong>💡 ${isTa ? 'காரணம்:' : 'AI Decision Rule Rationale:'}</strong>
          ${isTa ? data.ruleExplanationTa : data.ruleExplanation}
        </div>
      </div>

      <!-- Secondary Route -->
      ${secondary ? `
        <div class="salvage-secondary-card">
          <div class="secondary-info">
            <span class="secondary-icon">${secondary.icon}</span>
            <div>
              <h5>${isTa ? 'இரண்டாம் நிலை மாற்று வழி:' : 'Secondary Fallback Route:'} ${isTa ? secondary.titleTa : secondary.title}</h5>
              <p>${isTa ? secondary.descriptionTa : secondary.description}</p>
            </div>
          </div>
          <div class="secondary-rate">
            <span>${isTa ? secondary.payoutRecoveryTa : secondary.payoutRecovery}</span>
          </div>
        </div>
      ` : ''}

      <!-- Verified Partners List -->
      <div class="salvage-partners-section">
        <h3>🏢 ${isTa ? 'தமிழ்நாட்டின் அங்கீகரிக்கப்பட்ட மறுபயன்பாட்டு மையங்கள்' : 'Matching Verified Off-Takers & Centers in Tamil Nadu'}</h3>
        <p class="section-sub">${isTa ? 'இடைத்தரகர் இன்றி உடனடியாக விற்க நேரடி தொடர்பு கொள்ளவும்:' : 'Direct connect with verified facilities for instant off-take and logistics pickup:'}</p>

        <div class="salvage-partners-grid">
          ${(data.matchingPartners || []).map(p => `
            <div class="partner-card">
              <div class="partner-header">
                <h4>${isTa ? p.tamilName : p.name}</h4>
                <span class="badge badge-outline">${isTa ? p.categoryLabelTa : p.categoryLabel}</span>
              </div>
              <p class="partner-loc">📍 ${p.location}, ${p.district} District</p>
              <div class="partner-meta">
                <span>💰 Payout: ${p.payoutRatePercent ? p.payoutRatePercent + '% of market' : p.rateFixed || 'CSR Exemption'}</span>
                <span>🚚 ${p.urgentPickupAvailable ? '✓ Urgent Farm Pickup Available' : 'Mandi Delivery'}</span>
              </div>
              <div class="partner-actions">
                <a href="tel:${p.phone}" class="btn btn-outline-success">
                  📞 Call Facility (${p.phone})
                </a>
                <a href="https://wa.me/91${p.phone}?text=Hello%20${encodeURIComponent(p.name)},%20I%20have%20${quantity}%20quintals%20of%20unsold%20${encodeURIComponent(cropName)}%20via%20FarmConnect." target="_blank" class="btn btn-whatsapp-sm">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Error in unsold crop salvage evaluation:', err);
    resultContainer.innerHTML = `<div class="alert alert-danger">Failed to evaluate decision tree.</div>`;
  }
}

// Re-evaluate on language switch
window.addEventListener('languageChanged', () => {
  const resultContainer = document.getElementById('salvageResultContainer');
  if (resultContainer && resultContainer.children.length > 0) {
    evaluateUnsoldCrop();
  }
});

window.evaluateUnsoldCrop = evaluateUnsoldCrop;
