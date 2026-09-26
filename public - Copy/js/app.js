/**
 * FarmConnect Main Application Controller
 */

// Global App State
const AppState = {
  currentUser: {
    _id: 'usr_farmer_1',
    name: 'Murugan Palanisamy',
    tamilName: 'முருகன் பழனிசாமி',
    phone: '9842112345',
    role: 'farmer',
    location: 'Thanjavur, Tamil Nadu',
    district: 'Thanjavur',
    landSizeAcres: 5.5,
    cropsGrown: ['Paddy', 'Banana', 'Black Gram'],
    trustScore: 4.9,
    verified: true
  },
  crops: [],
  buyers: [],
  alerts: [],
  activeTab: 'my-crops'
};

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize language
  window.setLanguage('en');

  // Listen for Firebase auth state changes (auto-restore session on reload)
  if (window.FirebaseAuth) {
    window.FirebaseAuth.onAuthChange(async (firebaseUser) => {
      if (firebaseUser && AppState.currentUser.name === 'Guest Farmer') {
        // User is signed in via Firebase but profile not loaded yet
        try {
          const res = await fetch('/api/auth/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await firebaseUser.getIdToken()}` }
          });
          const data = await res.json();
          if (data.user) {
            AppState.currentUser = data.user;
            updateNavAuthLabel();
            populateProfileTab();
            await loadFarmerProfile();
            await loadCropListings();
          }
        } catch (e) { /* ignore – demo mode */ }
      }
    });
  }

  // Load Initial Data
  await loadFarmerProfile();
  await loadCropListings();
  await loadNearbyBuyers();
  await loadPriceAlerts();

  // Setup event listeners
  setupNavigationTabs();
  setupModals();
  setupForms();
  setupAlertSimulator();

  // Populate profile tab with current session
  populateProfileTab();

  // Initial render of default AI prediction view
  if (window.loadAIPricePrediction) {
    window.loadAIPricePrediction('Tomato (Hybrid Red)', 15);
  }
});


/**
 * Tab Navigation Setup
 */
function setupNavigationTabs() {
  const navButtons = document.querySelectorAll('.nav-tab-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Update nav buttons
  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  // Update tab sections
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `tab-${tabId}`);
  });

  // Trigger tab-specific initializers
  if (tabId === 'price-predict' && window.loadAIPricePrediction) {
    const selector = document.getElementById('aiCropSelector');
    window.loadAIPricePrediction(selector ? selector.value : 'Tomato (Hybrid Red)', 15);
  } else if (tabId === 'topsis' && window.loadTOPSISRankings) {
    window.loadTOPSISRankings();
  } else if (tabId === 'salvage' && window.evaluateUnsoldCrop) {
    window.evaluateUnsoldCrop();
  }
}

/**
 * Load Farmer Profile & Update Top Stats Bar
 */
async function loadFarmerProfile() {
  try {
    const profileRes = await FarmConnectAPI.getProfile(AppState.currentUser._id);
    if (profileRes && profileRes.user) {
      AppState.currentUser = profileRes.user;
    }

    const isTa = window.getCurrentLang() === 'ta';
    const nameEl = document.getElementById('farmerProfileName');
    const locEl = document.getElementById('farmerProfileLocation');
    const landEl = document.getElementById('farmerProfileLand');
    const trustEl = document.getElementById('farmerProfileTrust');

    if (nameEl) nameEl.innerText = isTa ? (AppState.currentUser.tamilName || AppState.currentUser.name) : AppState.currentUser.name;
    if (locEl) locEl.innerText = AppState.currentUser.location;
    if (landEl) landEl.innerText = `${AppState.currentUser.landSizeAcres} ${isTa ? 'ஏக்கர்' : 'Acres'}`;
    if (trustEl) trustEl.innerText = `⭐ ${AppState.currentUser.trustScore || 4.9} / 5.0`;

  } catch (err) {
    console.error('Error loading farmer profile:', err);
  }
}

/**
 * Load & Render Crop Listings
 */
async function loadCropListings() {
  const container = document.getElementById('cropListingsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-spinner-box">
      <div class="spinner"></div>
      <p>Loading your farm harvest listings...</p>
    </div>
  `;

  try {
    const isTa = window.getCurrentLang() === 'ta';
    const res = await FarmConnectAPI.getCrops();
    AppState.crops = res.crops || [];

    // Calculate Summary Stats
    const totalQty = AppState.crops.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
    const estVal = AppState.crops.reduce((acc, c) => acc + ((Number(c.quantity) || 0) * (Number(c.basePrice) || 0)), 0);

    const statListingsEl = document.getElementById('statActiveListings');
    const statQtyEl = document.getElementById('statTotalQuantity');
    const statValEl = document.getElementById('statEstimatedValue');

    if (statListingsEl) statListingsEl.innerText = AppState.crops.length;
    if (statQtyEl) statQtyEl.innerText = `${totalQty} Quintals`;
    if (statValEl) statValEl.innerText = `₹${estVal.toLocaleString('en-IN')}`;

    if (AppState.crops.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">🌾</div>
          <h3>${isTa ? 'பயிர்கள் எதுவும் பட்டியலிடப்படவில்லை' : 'No Active Crop Listings Yet'}</h3>
          <p>${isTa ? 'புதிய அறுவடையை சேர்க்க "புதிய பயிர் சேர்க்க" பொத்தானை அழுத்தவும்.' : 'Click "+ Add New Crop" to list your harvest and get AI price forecasts.'}</p>
          <button class="btn btn-primary" onclick="openAddCropModal()">${isTa ? '+ புதிய பயிர் சேர்க்க' : '+ Add New Crop'}</button>
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.crops.map(crop => {
      const displayName = isTa ? (crop.cropNameTa || crop.cropName) : crop.cropName;
      const statusClass = crop.status === 'active' ? 'badge-success' : 'badge-secondary';
      const statusText = isTa ? (crop.status === 'active' ? 'விற்பனைக்கு உள்ளது' : 'முடிந்தது') : crop.status.toUpperCase();

      return `
        <div class="crop-card" id="crop-${crop._id}">
          <div class="crop-image-wrapper">
            <img src="${crop.image}" alt="${displayName}" class="crop-img" onerror="this.src='https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'" />
            <span class="crop-status-badge ${statusClass}">${statusText}</span>
            <span class="crop-grade-tag">${crop.qualityGrade}</span>
          </div>

          <div class="crop-card-body">
            <div class="crop-header-row">
              <h3>${displayName}</h3>
              <div class="crop-price-badge">₹${crop.basePrice} <small>/${crop.unit}</small></div>
            </div>

            <p class="crop-desc">${crop.description || ''}</p>

            <div class="crop-meta-grid">
              <div class="meta-item">
                <span class="meta-label">📦 ${isTa ? 'அளவு:' : 'Quantity:'}</span>
                <span class="meta-value">${crop.quantity} ${crop.unit}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">📅 ${isTa ? 'அறுவடை:' : 'Harvested:'}</span>
                <span class="meta-value">${crop.harvestDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">📍 ${isTa ? 'இடம்:' : 'Location:'}</span>
                <span class="meta-value">${crop.location}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">⭐ ${isTa ? 'தரம்:' : 'Quality:'}</span>
                <span class="meta-value">${crop.qualityGrade}</span>
              </div>
            </div>

            <div class="crop-card-footer">
              <button class="btn btn-outline-primary btn-sm" onclick="checkCropWithAI('${crop.cropName}')">
                ⚡ ${isTa ? 'AI விலை கணிப்பு' : 'AI Forecast'}
              </button>
              <button class="btn btn-outline-warning btn-sm" onclick="sendToTopsis('${crop.cropName}', ${crop.quantity})">
                🏆 ${isTa ? 'சிறந்த சந்தை' : 'Find Best Buyer'}
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="deleteCropListing('${crop._id}')">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading crop listings:', err);
    container.innerHTML = `<div class="alert alert-danger">Failed to load crops.</div>`;
  }
}

/**
 * Load Nearby Direct Buyers
 */
async function loadNearbyBuyers(district = '') {
  const container = document.getElementById('buyersListContainer');
  if (!container) return;

  try {
    const isTa = window.getCurrentLang() === 'ta';
    const res = await FarmConnectAPI.getBuyers({ district });
    AppState.buyers = res.buyers || [];

    const statBuyersEl = document.getElementById('statDirectBuyers');
    if (statBuyersEl) statBuyersEl.innerText = AppState.buyers.length;

    container.innerHTML = AppState.buyers.map(b => `
      <div class="buyer-card">
        <div class="buyer-card-top">
          <div>
            <h4>${isTa ? (b.tamilName || b.name) : b.name}</h4>
            <div class="buyer-type-badge">${b.buyerType}</div>
          </div>
          <div class="buyer-rating-badge">⭐ ${b.rating}</div>
        </div>

        <p class="buyer-address">📍 ${b.address || b.district + ' Mandi Hub'} (${b.distanceKm} km away)</p>

        <div class="buyer-crops-needed">
          <small>${isTa ? 'தேவைப்படும் பயிர்கள்:' : 'Procuring Crops:'}</small>
          <div class="crop-tags-wrap">
            ${(b.targetCrops || []).map(tc => `<span class="crop-tag">${tc}</span>`).join('')}
          </div>
        </div>

        <div class="buyer-pricing-row">
          <div>
            <span class="price-offered-label">${isTa ? 'சலுகை விலை:' : 'Offering Price:'}</span>
            <span class="price-offered-val">₹${b.buyingPricePerUnit}/qtl</span>
          </div>
          <div>
            <span class="price-offered-label">${isTa ? 'போக்குவரத்து வீதம்:' : 'Transport:'}</span>
            <span>₹${b.transportCostPerKm}/km</span>
          </div>
        </div>

        <div class="buyer-action-row">
          <a href="tel:${b.phone}" class="btn btn-primary-light btn-sm">
            📞 ${isTa ? 'அழைக்க' : 'Call'} (${b.phone})
          </a>
          <a href="https://wa.me/91${b.phone}?text=Hello%20${encodeURIComponent(b.name)},%20I%20am%20contacting%20you%20directly%20via%20FarmConnect." target="_blank" class="btn btn-whatsapp-sm">
            💬 WhatsApp
          </a>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading buyers:', err);
  }
}

/**
 * Load Price Alerts
 */
async function loadPriceAlerts() {
  const container = document.getElementById('alertsListContainer');
  if (!container) return;

  try {
    const isTa = window.getCurrentLang() === 'ta';
    const res = await FarmConnectAPI.getAlerts();
    AppState.alerts = res.alerts || [];

    // Update alert count badge in top header
    const alertCountBadge = document.getElementById('headerAlertCount');
    if (alertCountBadge) alertCountBadge.innerText = AppState.alerts.length;

    container.innerHTML = AppState.alerts.map(a => `
      <div class="alert-card-item">
        <div class="alert-bell-icon">🔔</div>
        <div class="alert-details">
          <h4>${isTa ? (a.cropNameTa || a.cropName) : a.cropName}</h4>
          <p>
            ${isTa ? 'மண்டி:' : 'Mandi:'} <strong>${a.mandiName}</strong> • 
            ${isTa ? 'இலக்கு விலை:' : 'Target Price:'} <strong>₹${a.targetPrice}</strong> (${a.condition === 'above' ? '▲ Higher than' : '▼ Lower than'})
          </p>
          <span class="alert-live-status">
            ${isTa ? 'தற்போதைய விலை:' : 'Current Live Price:'} ₹${a.currentPrice} • 
            <span class="text-success">Active Watchdog</span>
          </span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading alerts:', err);
  }
}

/**
 * Setup Modals & Event Listeners
 */
function setupModals() {
  // Add Crop Modal
  const openAddCropBtn = document.getElementById('openAddCropModalBtn');
  const closeAddCropBtn = document.getElementById('closeAddCropModalBtn');
  const addCropModal = document.getElementById('addCropModal');

  if (openAddCropBtn && addCropModal) {
    openAddCropBtn.addEventListener('click', () => {
      addCropModal.classList.add('show');
    });
  }

  if (closeAddCropBtn && addCropModal) {
    closeAddCropBtn.addEventListener('click', () => {
      addCropModal.classList.remove('show');
    });
  }

  // Set Alert Modal
  const openAlertModalBtn = document.getElementById('openSetAlertModalBtn');
  const closeAlertModalBtn = document.getElementById('closeAlertModalBtn');
  const alertModal = document.getElementById('setAlertModal');

  if (openAlertModalBtn && alertModal) {
    openAlertModalBtn.addEventListener('click', () => {
      alertModal.classList.add('show');
    });
  }

  if (closeAlertModalBtn && alertModal) {
    closeAlertModalBtn.addEventListener('click', () => {
      alertModal.classList.remove('show');
    });
  }

  // Close modals on background backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === addCropModal) addCropModal.classList.remove('show');
    if (e.target === alertModal) alertModal.classList.remove('show');
    const authModal = document.getElementById('authModal');
    if (e.target === authModal) authModal.classList.remove('show');
  });

  // Auth Modal Open / Close
  const openAuthBtn = document.getElementById('openAuthModalBtn');
  const closeAuthBtn = document.getElementById('closeAuthModalBtn');
  const authModal = document.getElementById('authModal');

  if (openAuthBtn && authModal) {
    openAuthBtn.addEventListener('click', () => {
      authModal.classList.add('show');
      switchAuthTab('signin');
    });
  }
  if (closeAuthBtn && authModal) {
    closeAuthBtn.addEventListener('click', () => authModal.classList.remove('show'));
  }

  // Language Switch Button
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = window.getCurrentLang() === 'en' ? 'ta' : 'en';
      window.setLanguage(nextLang);
      loadFarmerProfile();
      loadCropListings();
      loadNearbyBuyers();
      loadPriceAlerts();
      populateProfileTab();
    });
  }
}

/**
 * Setup Form Submissions
 */
/**
 * Setup Crop Image Upload, Camera / Gallery Pickers, and Live Preview
 */
let selectedCropImageFile = null;

function setupCropImageHandlers() {
  const fileInput = document.getElementById('formCropImageInput');
  const btnCamera = document.getElementById('btnCropCamera');
  const btnGallery = document.getElementById('btnCropGallery');
  const dropZone = document.getElementById('cropImageDropZone');
  const uploadPrompt = document.getElementById('cropUploadZonePrompt');
  const previewWrap = document.getElementById('cropImagePreviewWrap');
  const previewImg = document.getElementById('cropImagePreview');
  const fileNameEl = document.getElementById('cropImageFileName');
  const fileSizeEl = document.getElementById('cropImageFileSize');
  const btnRemove = document.getElementById('btnRemoveCropImage');

  if (!fileInput || !dropZone) return;

  // Handle Camera Button click (sets capture attribute for mobile camera)
  if (btnCamera) {
    btnCamera.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.setAttribute('capture', 'environment');
      fileInput.click();
    });
  }

  // Handle Gallery Button click (removes capture attribute for photo picker)
  if (btnGallery) {
    btnGallery.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.removeAttribute('capture');
      fileInput.click();
    });
  }

  // Dropzone click triggers file input
  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('#btnRemoveCropImage')) return;
    fileInput.click();
  });

  // Drag & drop handlers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      fileInput.files = files;
      handleFileSelected(files[0]);
    }
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  // Remove preview button
  if (btnRemove) {
    btnRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      resetImagePreview();
    });
  }

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    selectedCropImageFile = file;

    // Display image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      fileNameEl.innerText = file.name;
      fileSizeEl.innerText = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      uploadPrompt.style.display = 'none';
      previewWrap.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  function resetImagePreview() {
    selectedCropImageFile = null;
    fileInput.value = '';
    previewImg.src = '';
    uploadPrompt.style.display = 'flex';
    previewWrap.style.display = 'none';
  }

  window.resetCropImagePreview = resetImagePreview;
}

function setupForms() {
  // Initialize Crop Image & Camera Handlers
  setupCropImageHandlers();

  // Add Crop Form
  const addCropForm = document.getElementById('addCropForm');
  if (addCropForm) {
    addCropForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cropName = document.getElementById('formCropName').value;
      const quantity = document.getElementById('formQuantity').value;
      const unit = document.getElementById('formUnit').value;
      const qualityGrade = document.getElementById('formQuality').value;
      const basePrice = document.getElementById('formPrice').value;
      const location = document.getElementById('formLocation').value;
      const harvestDate = document.getElementById('formHarvestDate').value;
      const description = document.getElementById('formDescription').value;

      const submitBtn = addCropForm.querySelector('[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Publish Crop Listing 🚜';
      if (submitBtn) submitBtn.disabled = true;

      try {
        let imageUrl = null;
        if (selectedCropImageFile && window.FirebaseAuth && window.FirebaseAuth.uploadCropImage) {
          if (submitBtn) submitBtn.innerHTML = '⏳ Uploading Image to Firebase Storage...';
          imageUrl = await window.FirebaseAuth.uploadCropImage(selectedCropImageFile);
        }

        if (submitBtn) submitBtn.innerHTML = 'Publishing Crop Listing... 🚜';

        const res = await FarmConnectAPI.createCrop({
          farmerId: AppState.currentUser._id,
          farmerName: AppState.currentUser.name,
          farmerPhone: AppState.currentUser.phone,
          cropName,
          quantity,
          unit,
          qualityGrade,
          basePrice,
          location,
          harvestDate,
          image: imageUrl,
          description
        });

        if (res.success) {
          showNotificationToast(`✅ ${cropName} listed successfully on FarmConnect!`);
          document.getElementById('addCropModal').classList.remove('show');
          addCropForm.reset();
          if (window.resetCropImagePreview) window.resetCropImagePreview();
          await loadCropListings();
        }
      } catch (err) {
        alert('Failed to publish crop: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // Set Alert Form
  const alertForm = document.getElementById('setAlertForm');
  if (alertForm) {
    alertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cropName = document.getElementById('alertCropSelect').value;
      const mandiName = document.getElementById('alertMandiInput').value;
      const targetPrice = document.getElementById('alertTargetPriceInput').value;
      const condition = document.getElementById('alertConditionSelect').value;

      try {
        const res = await FarmConnectAPI.createAlert({
          userId: AppState.currentUser._id,
          cropName,
          mandiName,
          targetPrice,
          condition
        });

        if (res.success) {
          showNotificationToast(`🔔 Price alert active for ${cropName} in ${mandiName}!`);
          document.getElementById('setAlertModal').classList.remove('show');
          alertForm.reset();
          await loadPriceAlerts();
        }
      } catch (err) {
        alert('Failed to set alert: ' + err.message);
      }
    });
  }

  // Filter buyers by district select
  const districtFilter = document.getElementById('buyerDistrictFilter');
  if (districtFilter) {
    districtFilter.addEventListener('change', (e) => {
      loadNearbyBuyers(e.target.value);
    });
  }

  // Sign In Form
  const signInForm = document.getElementById('signInForm');
  if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Support both email and phone as identifier
      const identifier = (document.getElementById('signInEmail') || document.getElementById('signInPhone')).value.trim();
      const password = document.getElementById('signInPassword').value;
      const submitBtn = signInForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
      try {
        const res = await FarmConnectAPI.login(identifier, password);
        if (res && res.user) {
          AppState.currentUser = res.user;
          document.getElementById('authModal').classList.remove('show');
          updateNavAuthLabel();
          populateProfileTab();
          await loadFarmerProfile();
          await loadCropListings();
          const lang = window.getCurrentLang();
          const name = lang === 'ta' ? (res.user.tamilName || res.user.name) : res.user.name;
          showNotificationToast(`🌾 Welcome back, ${name}! FarmConnect is ready.`);
        } else if (res && res.error) {
          showNotificationToast('⚠️ ' + res.error);
        }
      } catch (err) {
        showNotificationToast('Login failed: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = window.getTranslation('enterSignInBtn') || 'Sign In to FarmConnect 🚜';
      }
    });
  }

  // Sign Up Form
  const signUpForm = document.getElementById('signUpForm');
  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signUpName').value.trim();
      const email = (document.getElementById('signUpEmail') || {}).value?.trim() || '';
      const phone = document.getElementById('signUpPhone').value.trim();
      const password = document.getElementById('signUpPassword').value;
      const location = document.getElementById('signUpLocation').value.trim();
      const landSizeAcres = document.getElementById('signUpLandSize').value || 2.0;
      const cropsGrownRaw = document.getElementById('signUpCrops').value;
      const cropsGrown = cropsGrownRaw.split(',').map(c => c.trim()).filter(Boolean);
      const role = document.querySelector('input[name="signupRole"]:checked')?.value || 'farmer';

      const submitBtn = signUpForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
      try {
        const res = await FarmConnectAPI.register({
          name, email, phone, password, role,
          location: location || 'Tamil Nadu',
          district: location.split(',')[0].trim() || 'Thanjavur',
          landSizeAcres: parseFloat(landSizeAcres),
          cropsGrown: cropsGrown.length ? cropsGrown : ['Paddy']
        });
        if (res && res.user) {
          AppState.currentUser = res.user;
          document.getElementById('authModal').classList.remove('show');
          updateNavAuthLabel();
          populateProfileTab();
          await loadFarmerProfile();
          await loadCropListings();
          showNotificationToast(`🌾 Welcome to FarmConnect, ${name}! Your account has been created.`);
        } else if (res && res.error) {
          showNotificationToast('⚠️ ' + res.error);
        }
      } catch (err) {
        showNotificationToast('Registration error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = window.getTranslation('enterSignUpBtn') || 'Register & Create Account 🌾';
      }
    });
  }

  // Edit Profile Form
  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updates = {
        name: document.getElementById('profFormName').value,
        phone: document.getElementById('profFormPhone').value,
        email: document.getElementById('profFormEmail').value,
        location: document.getElementById('profFormLocation').value,
        landSizeAcres: parseFloat(document.getElementById('profFormLandSize').value) || AppState.currentUser.landSizeAcres,
        cropsGrown: document.getElementById('profFormCropsGrown').value.split(',').map(c => c.trim()).filter(Boolean)
      };
      try {
        const res = await FarmConnectAPI.updateProfile(AppState.currentUser._id, updates);
        if (res && res.user) {
          AppState.currentUser = { ...AppState.currentUser, ...res.user };
          updateNavAuthLabel();
          await loadFarmerProfile();
          showNotificationToast('Profile updated successfully!');
        }
      } catch(err) {
        showNotificationToast('Profile update failed: ' + err.message);
      }
    });
  }
}

/**
 * Toast Notification Utility
 */
function showNotificationToast(msg) {
  let toastContainer = document.getElementById('toastNotificationArea');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastNotificationArea';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-bubble';
  toast.innerHTML = msg;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/**
 * Simulated Live Price Alert Watchdog
 */
function setupAlertSimulator() {
  // Periodically trigger a realistic mandi price alert to wow the user
  setTimeout(() => {
    showNotificationToast(`🔔 <strong>Mandi Alert:</strong> Tomato prices in Oddanchatram jumped +₹250/qtl due to festival demand surge!`);
  }, 12000);
}

/**
 * Quick Action Helpers
 */
window.checkCropWithAI = function(cropName) {
  switchTab('price-predict');
  const selector = document.getElementById('aiCropSelector');
  if (selector) {
    selector.value = cropName;
    if (window.loadAIPricePrediction) window.loadAIPricePrediction(cropName, 15);
  }
};

window.sendToTopsis = function(cropName, quantity) {
  switchTab('topsis');
  const cropSelect = document.getElementById('topsisCropSelect');
  const qtyInput = document.getElementById('topsisQuantityInput');
  if (cropSelect) cropSelect.value = cropName;
  if (qtyInput) qtyInput.value = quantity;
  if (window.loadTOPSISRankings) window.loadTOPSISRankings();
};

window.deleteCropListing = async function(id) {
  if (confirm('Are you sure you want to remove this crop listing?')) {
    await FarmConnectAPI.deleteCrop(id);
    showNotificationToast('Crop listing removed.');
    loadCropListings();
  }
};

window.openAddCropModal = function() {
  const modal = document.getElementById('addCropModal');
  if (modal) modal.classList.add('show');
};

/**
 * Auth Modal Helpers
 */
window.openAuthModal = function(tab = 'signin') {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('show');
    switchAuthTab(tab);
  }
};

window.switchAuthTab = function(tab) {
  const signInPanel = document.getElementById('authSignInPanel');
  const signUpPanel = document.getElementById('authSignUpPanel');
  const signInBtn = document.getElementById('authTabSignInBtn');
  const signUpBtn = document.getElementById('authTabSignUpBtn');
  if (!signInPanel) return;

  if (tab === 'signup') {
    signInPanel.style.display = 'none';
    signUpPanel.style.display = 'block';
    signInBtn.classList.remove('active');
    signUpBtn.classList.add('active');
  } else {
    signInPanel.style.display = 'block';
    signUpPanel.style.display = 'none';
    signInBtn.classList.add('active');
    signUpBtn.classList.remove('active');
  }
};

window.toggleRoleFields = function(role) {
  const groupLand = document.getElementById('groupLandSize');
  const groupCompany = document.getElementById('groupCompany');
  const labelFarmer = document.getElementById('roleLabelFarmer');
  const labelBuyer = document.getElementById('roleLabelBuyer');
  if (role === 'buyer') {
    if (groupLand) groupLand.style.display = 'none';
    if (groupCompany) groupCompany.style.display = 'block';
    if (labelFarmer) labelFarmer.classList.remove('active');
    if (labelBuyer) labelBuyer.classList.add('active');
  } else {
    if (groupLand) groupLand.style.display = 'block';
    if (groupCompany) groupCompany.style.display = 'none';
    if (labelFarmer) labelFarmer.classList.add('active');
    if (labelBuyer) labelBuyer.classList.remove('active');
  }
};

window.quickLoginDemo = async function(profileKey) {
  const demoProfiles = {
    farmer1: { _id: 'usr_farmer_1', name: 'Murugan Palanisamy', tamilName: 'முருகன் பழனிசாமி', phone: '9842112345', role: 'farmer', location: 'Thanjavur, Tamil Nadu', district: 'Thanjavur', landSizeAcres: 5.5, cropsGrown: ['Paddy', 'Banana', 'Black Gram'], trustScore: 4.9 },
    farmer2: { _id: 'usr_farmer_2', name: 'Selvi Ramasamy', tamilName: 'செல்வி ராமசாமி', phone: '9443298765', role: 'farmer', location: 'Dindigul, Tamil Nadu', district: 'Dindigul', landSizeAcres: 3.2, cropsGrown: ['Tomato', 'Small Onion', 'Chilli'], trustScore: 4.8 },
    buyer1: { _id: 'usr_buyer_1', name: 'Annamalai Agro Traders', tamilName: 'அண்ணாமலை அக்ரோ டிரேடர்ஸ்', phone: '9876543210', role: 'buyer', location: 'Chennai, Tamil Nadu', district: 'Chennai', trustScore: 4.9 }
  };
  const profile = demoProfiles[profileKey];
  if (!profile) return;
  AppState.currentUser = profile;
  document.getElementById('authModal').classList.remove('show');
  updateNavAuthLabel();
  populateProfileTab();
  await loadFarmerProfile();
  await loadCropListings();
  const lang = window.getCurrentLang();
  const displayName = lang === 'ta' ? (profile.tamilName || profile.name) : profile.name;
  showNotificationToast(`🌾 Logged in as <strong>${displayName}</strong>. Welcome to FarmConnect!`);
};

window.logoutUser = async function() {
  if (!confirm('Are you sure you want to sign out?')) return;
  // Sign out from Firebase Auth (clears token)
  if (window.FirebaseAuth) {
    try { await window.FirebaseAuth.signOut(); } catch (e) { /* ignore */ }
  }
  AppState.currentUser = {
    _id: 'usr_farmer_1', name: 'Guest Farmer', phone: '', role: 'farmer',
    location: 'Tamil Nadu', landSizeAcres: 0, cropsGrown: [], trustScore: 0
  };
  updateNavAuthLabel();
  populateProfileTab();
  loadFarmerProfile();
  showNotificationToast('You have been signed out. Visit again soon!');
  // Show auth modal after short delay
  setTimeout(() => openAuthModal('signin'), 800);
};

function updateNavAuthLabel() {
  const label = document.getElementById('navAuthLabel');
  if (!label) return;
  const u = AppState.currentUser;
  if (u && u.name && u.name !== 'Guest Farmer') {
    const lang = window.getCurrentLang();
    const displayName = lang === 'ta' ? (u.tamilName || u.name) : u.name;
    label.textContent = `👤 ${displayName.split(' ')[0]}`;
  } else {
    label.setAttribute('data-i18n', 'signInBtn');
    label.textContent = window.getTranslation('signInBtn') || 'Sign In / Register';
  }
}

function populateProfileTab() {
  const u = AppState.currentUser;
  if (!u) return;
  const lang = window.getCurrentLang();
  const displayName = lang === 'ta' ? (u.tamilName || u.name) : u.name;

  // Profile identity card
  const cardName = document.getElementById('profileCardFullName');
  const cardRole = document.getElementById('profileCardRole');
  const cardLoc = document.getElementById('profileCardLocation');
  const cardTrust = document.getElementById('profileCardTrustScore');
  const cardAvatar = document.getElementById('profileBigAvatar');

  if (cardName) cardName.textContent = displayName || 'Farmer';
  if (cardRole) cardRole.textContent = u.role === 'buyer' ? (lang === 'ta' ? 'மொத்த வியாபாரி' : 'Verified Buyer / Trader') : (lang === 'ta' ? 'சரிபார்க்கப்பட்ட விவசாயி' : 'Verified Delta Farmer');
  if (cardLoc) cardLoc.textContent = `📍 ${u.location || 'Tamil Nadu'}`;
  if (cardTrust) cardTrust.textContent = `⭐ ${u.trustScore || 4.8} / 5.0`;
  if (cardAvatar) cardAvatar.textContent = u.role === 'buyer' ? '🏢' : '🌾';

  // Editable profile form
  const profName = document.getElementById('profFormName');
  const profPhone = document.getElementById('profFormPhone');
  const profEmail = document.getElementById('profFormEmail');
  const profLoc = document.getElementById('profFormLocation');
  const profLand = document.getElementById('profFormLandSize');
  const profCrops = document.getElementById('profFormCropsGrown');

  if (profName) profName.value = u.name || '';
  if (profPhone) profPhone.value = u.phone || '';
  if (profEmail) profEmail.value = u.email || '';
  if (profLoc) profLoc.value = u.location || '';
  if (profLand) profLand.value = u.landSizeAcres || '';
  if (profCrops) profCrops.value = (u.cropsGrown || []).join(', ');
}

window.AppState = AppState;
window.switchTab = switchTab;
window.showNotificationToast = showNotificationToast;
