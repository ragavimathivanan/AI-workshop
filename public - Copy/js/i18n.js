/**
 * FarmConnect Bilingual Internationalization (English & தமிழ்)
 */

const translations = {
  en: {
    appName: 'FarmConnect',
    appTagline: 'Direct Farmer-to-Buyer Marketplace • Zero Middlemen',
    appSubBadge: 'Tamil Nadu Agri-Connect',
    langToggle: 'தமிழ்',
    
    // Nav Tabs
    tabMyCrops: 'My Crops & Listings',
    tabPricePredict: 'AI Price Forecast (XGBoost/LSTM)',
    tabTopsis: 'Best Market Finder (TOPSIS)',
    tabSalvage: 'Unsold Crop Salvage Engine',
    tabBuyers: 'Nearby Buyers',
    tabAlerts: 'Price Alerts',
    tabProfile: 'Farmer Profile & Account',

    // Top Bar & Farmer Profile
    farmerProfile: 'Farmer Profile',
    addCropBtn: '+ Add New Crop',
    verifiedFarmer: 'Verified Delta Farmer',
    locationLabel: 'Location',
    landSizeLabel: 'Land Size',
    activeCropsLabel: 'Active Crops',
    trustScoreLabel: 'Trust Rating',
    acres: 'Acres',
    signInBtn: 'Sign In / Register',
    signOutBtn: 'Sign Out',
    switchAccountBtn: 'Switch Account',
    editProfileBtn: 'Edit Profile Details',
    saveProfileBtn: 'Save Profile Changes',

    // Auth Modal
    authModalTitle: 'FarmConnect Portal 🚜',
    authModalSub: 'Direct farmer trading with AI price intelligence',
    tabSignIn: 'Sign In',
    tabSignUp: 'Create New Account (Sign Up)',
    fullName: 'Full Name',
    phoneLabel: 'Mobile Phone Number',
    passwordLabel: 'Password',
    roleLabel: 'I am registering as a...',
    farmerRole: 'Farmer / Producer (விவசாயி)',
    buyerRole: 'Wholesale Buyer / Trader / Processor (வாங்குபவர்)',
    districtLabel: 'District / Mandi Location',
    landSizeInputLabel: 'Farm Land Size (Acres)',
    companyNameLabel: 'Business / Company Name',
    cropsGrownLabel: 'Primary Crops Grown (comma separated)',
    enterSignInBtn: 'Sign In to FarmConnect 🚜',
    enterSignUpBtn: 'Register & Create Account 🌾',
    orQuickDemoLogin: 'Or 1-Click Instant Demo Login:',
    demoFarmer1: '🌾 Murugan Palanisamy (Thanjavur Farmer)',
    demoFarmer2: '🌾 Selvi Ramasamy (Dindigul Farmer)',
    demoBuyer1: '🏢 Annamalai Agro Traders (Wholesale Buyer)',
    noAccountPrompt: "Don't have an account yet? Register now",
    haveAccountPrompt: 'Already registered? Sign In here',

    // Stats Bar
    statActiveListings: 'Active Listings',
    statTotalQuantity: 'Produce in Stock',
    statEstimatedValue: 'Estimated Market Value',
    statDirectBuyers: 'Direct Buyers Nearby',

    // My Crops Section
    myCropsTitle: 'My Harvest Listings',
    myCropsSubtitle: 'Add your harvested crops to connect directly with wholesale buyers, retail chains, and food mills.',
    cropName: 'Crop Name',
    quantity: 'Quantity',
    quality: 'Quality Grade',
    harvestDate: 'Harvest Date',
    location: 'Location / Mandi',
    expectedPrice: 'Expected Price',
    status: 'Status',
    actions: 'Actions',
    viewDetails: 'View & Connect',
    salvageBtn: 'Salvage / Unsold Produce',
    deleteBtn: 'Delete',
    active: 'Active for Sale',
    sold: 'Sold Out',
    unsold: 'Unsold Surplus',

    // Add Crop Modal
    modalAddCropTitle: 'List Your Harvested Crop',
    modalAddCropSub: 'Provide accurate harvest details to receive the best buyer offers and AI price benchmarks.',
    selectCropPlaceholder: 'Select or type crop name...',
    category: 'Crop Category',
    unit: 'Unit',
    qualityPlaceholder: 'Select quality grade...',
    descriptionLabel: 'Crop Description & Quality Notes',
    cropImageLabel: 'Crop Image / Photo (Firebase Storage Upload)',
    takeCameraBtn: 'Take Photo (Camera)',
    chooseGalleryBtn: 'Choose from Gallery',
    imageUploadHint: 'Supports JPG, PNG, WEBP. Saved directly to Firebase Storage.',
    saveListingBtn: 'Publish Crop Listing 🚜',
    cancelBtn: 'Cancel',

    // AI Price Prediction Section
    aiPredictTitle: 'AI Price Forecast Engine (XGBoost & LSTM)',
    aiPredictSub: 'Hybrid Machine Learning architecture combining Long Short-Term Memory (LSTM) sequence trends with Extreme Gradient Boosted Trees (XGBoost) for supply arrival & weather anomalies.',
    selectCropToPredict: 'Select Crop for AI Valuation:',
    forecastHorizon: 'Forecast Horizon:',
    days7: 'Next 7 Days',
    days15: 'Next 15 Days',
    days30: 'Next 30 Days',
    runPredictionBtn: 'Run AI Model Forecast ⚡',
    currentPriceLabel: 'Current Mandi Rate',
    predictedPriceLabel: 'AI Predicted Rate',
    mspBenchmarkLabel: 'Govt. MSP Benchmark',
    modelConfidenceLabel: 'Model Confidence (MAPE)',
    aiRecommendationTitle: 'Strategic AI Recommendation for Farmer',
    featureImportanceTitle: 'XGBoost Exogenous Drivers & Weightings',
    historicalVsForecast: 'Historical Trend vs LSTM Projection Window',

    // TOPSIS Section
    topsisTitle: 'Best Market & Buyer Optimizer (TOPSIS)',
    topsisSub: 'Multi-Criteria Decision Making (TOPSIS) ranks prospective buyers and mandis based on Price Offered, Demand Urgency, Distance, and Logistics Cost.',
    weightPriceLabel: 'Price Weight (Benefit):',
    weightDemandLabel: 'Demand Score Weight (Benefit):',
    weightDistanceLabel: 'Distance Weight (Cost):',
    weightTransportLabel: 'Transport Cost Weight (Cost):',
    recalculateTopsisBtn: 'Re-Rank Alternatives 🔄',
    rankBadge: 'Rank',
    closenessScore: 'TOPSIS Closeness Score',
    netProfit: 'Estimated Net Take-Home',
    directCall: 'Call Buyer',
    chatWhatsapp: 'WhatsApp Trade',

    // Salvage Engine Section
    salvageTitle: 'Unsold Crop Salvage & Resource Allocation',
    salvageSub: 'Eliminate distress selling and post-harvest wastage. Our Decision Tree & Rule-Based AI routes unsold produce to food processors, cattle feed cooperatives, food bank donation, vermicompost, or clean biogas.',
    daysSinceHarvestLabel: 'Days Since Harvest:',
    damagePercentLabel: 'Produce Damage / Spoilage (%):',
    perishabilityLabel: 'Crop Perishability Index:',
    runDecisionTreeBtn: 'Evaluate Salvage Path 🌳',
    decisionPathTitle: 'Evaluated Decision Tree Traversal:',
    recommendedRouteTitle: 'Primary Recommended Route',
    secondaryRouteTitle: 'Secondary Alternative',
    salvagePartnersTitle: 'Verified Tamil Nadu Salvage Off-Takers & Centers',
    estimatedRecovery: 'Estimated Value Recovery',

    // Nearby Buyers Section
    buyersTitle: 'Direct Wholesale Buyers & Mandi Hubs',
    buyersSub: 'Pre-verified agro-processors, supermarket chains, and wholesale merchants offering direct procurement.',
    filterDistrict: 'Filter by District:',
    allDistricts: 'All Tamil Nadu Mandis',

    // Alerts Section
    alertsTitle: 'Smart Price Alerts & Market Notifications',
    alertsSub: 'Set automated SMS and in-app triggers when crop prices cross your target thresholds in local mandis.',
    createNewAlertBtn: '+ Set New Price Alert',
    activeAlerts: 'Active Alerts',
    targetPriceLabel: 'Target Price Trigger',
    conditionLabel: 'Condition',
    mandiLabel: 'Target Mandi',

    // Auth Modal
    loginTitle: 'Welcome to FarmConnect 🚜',
    loginSubtitle: 'Direct farmer trading with AI intelligence',
    fullName: 'Full Name',
    phoneLabel: 'Mobile Phone Number',
    roleLabel: 'I am a...',
    farmerRole: 'Farmer / Producer',
    buyerRole: 'Wholesale Buyer / Trader / Processor',
    enterBtn: 'Continue to FarmConnect'
  },
  ta: {
    appName: 'FarmConnect',
    appTagline: 'விவசாயிகள் மற்றும் வாங்குபவர்களுக்கான நேரடி வர்த்தக தளம் • இடைத்தரகர் இல்லாத சந்தை',
    appSubBadge: 'தமிழ்நாடு உழவர் இணைப்பு',
    langToggle: 'English',

    // Nav Tabs
    tabMyCrops: 'எனது பயிர்கள்',
    tabPricePredict: 'AI விலை கணிப்பு (XGBoost/LSTM)',
    tabTopsis: 'சிறந்த சந்தை தரவரிசை (TOPSIS)',
    tabSalvage: 'விற்காத பயிர் மேலாண்மை',
    tabBuyers: 'அருகிலுள்ள வாங்குபவர்கள்',
    tabAlerts: 'விலை எச்சரிக்கை',
    tabProfile: 'விவசாயி சுயவிவரம் & கணக்கு',

    // Top Bar & Farmer Profile
    farmerProfile: 'விவசாயி சுயவிவரம்',
    addCropBtn: '+ புதிய பயிர் சேர்க்க',
    verifiedFarmer: 'சரிபார்க்கப்பட்ட காவிரி டெல்டா விவசாயி',
    locationLabel: 'இடம்',
    landSizeLabel: 'நிலப்பரப்பு',
    activeCropsLabel: 'பயிரிடப்பட்டவை',
    trustScoreLabel: 'நம்பகத்தன்மை மதிப்பு',
    acres: 'ஏக்கர்',
    signInBtn: 'உள்நுழைக / பதிவு செய்க',
    signOutBtn: 'வெளியேறுக',
    switchAccountBtn: 'கணக்கு மாறுக',
    editProfileBtn: 'சுயவிவரத்தை திருத்து',
    saveProfileBtn: 'விவரங்களை சேமிக்க',

    // Auth Modal
    authModalTitle: 'FarmConnect உழவர் தளம் 🚜',
    authModalSub: 'விவசாயிகளுக்கான நேரடி வர்த்தகம் & AI தொழில்நுட்பம்',
    tabSignIn: 'உள்நுழைக (Sign In)',
    tabSignUp: 'புதிய கணக்கு தொடங்க (Sign Up)',
    fullName: 'முழு பெயர்',
    phoneLabel: 'கைபேசி எண்',
    passwordLabel: 'கடவுச்சொல்',
    roleLabel: 'நான் பதிவு செய்வது...',
    farmerRole: 'விவசாயி / உற்பத்தியாளர்',
    buyerRole: 'மொத்த வியாபாரி / வாங்குபவர் / ஆலை',
    districtLabel: 'மாவட்டம் / மண்டி இருப்பிடம்',
    landSizeInputLabel: 'விவசாய நிலப்பரப்பு (ஏக்கர்)',
    companyNameLabel: 'நிறுவனம் / வியாபார பெயர்',
    cropsGrownLabel: 'பயிரிடப்படும் முதன்மை பயிர்கள்',
    enterSignInBtn: 'FarmConnect-ல் உள்நுழைக 🚜',
    enterSignUpBtn: 'கணக்கை தொடங்குக 🌾',
    orQuickDemoLogin: 'அல்லது 1-நொடியில் சோதனை உள்நுழைவு:',
    demoFarmer1: '🌾 முருகன் பழனிசாமி (தஞ்சாவூர் விவசாயி)',
    demoFarmer2: '🌾 செல்வி ராமசாமி (திண்டுக்கல் விவசாயி)',
    demoBuyer1: '🏢 அண்ணாமலை அக்ரோ டிரேடர்ஸ் (மொத்த வியாபாரி)',
    noAccountPrompt: 'கணக்கு இல்லையா? புதிய கணக்கு தொடங்குக',
    haveAccountPrompt: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',

    // Stats Bar
    statActiveListings: 'விற்பனைக்கு உள்ளவை',
    statTotalQuantity: 'கையிருப்பில் உள்ள அளவு',
    statEstimatedValue: 'மதிப்பிடப்பட்ட சந்தை மதிப்பு',
    statDirectBuyers: 'அருகிலுள்ள வாங்குபவர்கள்',

    // My Crops Section
    myCropsTitle: 'எனது அறுவடை பட்டியல்',
    myCropsSubtitle: 'உங்கள் விளைபொருட்களை இடைத்தரகர் இன்றி மொத்த வியாபாரிகளுக்கும், ஆலைகளுக்கும் நேரடியாக விற்கலாம்.',
    cropName: 'பயிர் பெயர்',
    quantity: 'அளவு (குவிண்டால்/டன்)',
    quality: 'தரம் (கிரேடு)',
    harvestDate: 'அறுவடை தேதி',
    location: 'இடம் / மண்டி',
    expectedPrice: 'எதிர்பார்க்கும் விலை',
    status: 'நிலை',
    actions: 'செயல்கள்',
    viewDetails: 'தொடர்பு கொள்ள',
    salvageBtn: 'விற்காத பயிர் ஒதுக்கீடு',
    deleteBtn: 'நீக்கு',
    active: 'விற்பனையில் உள்ளது',
    sold: 'விற்கப்பட்டது',
    unsold: 'விற்காத உபரி',

    // Add Crop Modal
    modalAddCropTitle: 'உங்கள் அறுவடை பயிரை பட்டியலிடுக',
    modalAddCropSub: 'அறுவடை விவரங்களை துல்லியமாக பதிவிட்டு சிறந்த வாங்குபவர்களை கண்டறியுங்கள்.',
    selectCropPlaceholder: 'பயிர் பெயரை தேர்வு செய்க...',
    category: 'பயிர் வகை',
    unit: 'அளவீட்டு அலகு',
    qualityPlaceholder: 'தரத்தை தேர்வு செய்க...',
    descriptionLabel: 'பயிர் விவரம் & குறிப்புகள்',
    cropImageLabel: 'பயிர் புகைப்படம் (Firebase Storage-ல் சேமிக்கப்படும்)',
    takeCameraBtn: 'படம் எடுக்க (கேமரா)',
    chooseGalleryBtn: 'கேலரியிலிருந்து தேர்வு செய்க',
    imageUploadHint: 'JPG, PNG, WEBP படங்கள் ஏற்றுக் கொள்ளப்படும்.',
    saveListingBtn: 'பயிரை வெளியிடுக 🚜',
    cancelBtn: 'ரத்து செய்',

    // AI Price Prediction Section
    aiPredictTitle: 'செயற்கை நுண்ணறிவு விலை கணிப்பு (XGBoost & LSTM)',
    aiPredictSub: 'கடந்த கால விலை போக்கை அறியும் LSTM மற்றும் மண்டி வரத்து, பருவமழை, போக்குவரத்து செலவை ஆராயும் XGBoost தொழில்நுட்பம்.',
    selectCropToPredict: 'விலை கணிக்க வேண்டிய பயிர்:',
    forecastHorizon: 'கணிப்பு கால அளவு:',
    days7: 'அடுத்த 7 நாட்கள்',
    days15: 'அடுத்த 15 நாட்கள்',
    days30: 'அடுத்த 30 நாட்கள்',
    runPredictionBtn: 'AI கணிப்பை இயக்குக ⚡',
    currentPriceLabel: 'தற்போதைய மண்டி விலை',
    predictedPriceLabel: 'AI கணிக்கப்பட்ட விலை',
    mspBenchmarkLabel: 'அரசு குறைந்தபட்ச ஆதரவு விலை (MSP)',
    modelConfidenceLabel: 'துல்லியம் (MAPE)',
    aiRecommendationTitle: 'விவசாயிகளுக்கான செயற்கை நுண்ணறிவு ஆலோசனை',
    featureImportanceTitle: 'XGBoost விலையை நிர்ணயிக்கும் காரணிகள்',
    historicalVsForecast: 'வரலாற்று விலை போக்கு vs LSTM கணிப்பு',

    // TOPSIS Section
    topsisTitle: 'சிறந்த சந்தை & வாங்குபவர் ஒப்பீட்டு தேர்வு (TOPSIS)',
    topsisSub: 'விலை, சந்தை தேவை, தூரம் மற்றும் போக்குவரத்து செலவு ஆகிய 4 காரணிகளை ஒப்பிட்டு சிறந்த வாங்குபவரை TOPSIS கணித முறை தேர்வு செய்கிறது.',
    weightPriceLabel: 'விலை முக்கியத்துவம் (லாபம்):',
    weightDemandLabel: 'தேவை முக்கியத்துவம் (லாபம்):',
    weightDistanceLabel: 'தூரம் முக்கியத்துவம் (செலவு):',
    weightTransportLabel: 'போக்குவரத்து செலவு (செலவு):',
    recalculateTopsisBtn: 'மறுபரிசீலனை செய்க 🔄',
    rankBadge: 'வரிசை எண்',
    closenessScore: 'TOPSIS பொருத்தம்',
    netProfit: 'நிகர லாபம் (போக்குவரத்து கழித்து)',
    directCall: 'அழைக்க',
    chatWhatsapp: 'வாட்ஸ்அப் செய்தி',

    // Salvage Engine Section
    salvageTitle: 'விற்காத பயிர் மேலாண்மை & மறுபயன்பாட்டு ஒதுக்கீடு',
    salvageSub: 'குறைந்த விலைக்கு தாரைவார்ப்பதை தடுக்க முடிவு மரம் (Decision Tree) மூலம் பதப்படுத்தும் ஆலை, கால்நடை தீவனம், சமூக உணவு வங்கி, மண்புழு உரம் அல்லது பயோ-கேஸ் நிலையங்களுக்கு ஒதுக்கீடு செய்கிறது.',
    daysSinceHarvestLabel: 'அறுவடை செய்து எத்தனை நாட்கள்:',
    damagePercentLabel: 'சேதம் / அழுகல் சதவீதம் (%):',
    perishabilityLabel: 'பயிர் கெட்டுப்போகும் தன்மை:',
    runDecisionTreeBtn: 'முடிவு மரத்தை இயக்குக 🌳',
    decisionPathTitle: 'ஆராயப்பட்ட முடிவு மரத்தின் பாதை:',
    recommendedRouteTitle: 'முதன்மை பரிந்துரை பாதை',
    secondaryRouteTitle: 'இரண்டாம் நிலை மாற்று',
    salvagePartnersTitle: 'தமிழ்நாட்டின் அங்கீகரிக்கப்பட்ட மறுபயன்பாட்டு மையங்கள்',
    estimatedRecovery: 'எதிர்பார்க்கப்படும் வருவாய் மீட்பு',

    // Nearby Buyers Section
    buyersTitle: 'நேரடி மொத்த வியாபாரிகள் & மண்டி மையங்கள்',
    buyersSub: 'சரிபார்க்கப்பட்ட உணவு நிறுவனங்கள், சூப்பர் மார்க்கெட் மற்றும் மொத்த வணிகர்கள்.',
    filterDistrict: 'மாவட்ட வாரியாக:',
    allDistricts: 'அனைத்து தமிழ்நாடு மண்டிகள்',

    // Alerts Section
    alertsTitle: 'ஸ்மார்ட் விலை எச்சரிக்கைகள் & தகவல்கள்',
    alertsSub: 'மண்டிகளில் விலை நீங்கள் நிர்ணயித்த அளவை எட்டும்போது உடனடி எச்சரிக்கை அறிவிப்பு.',
    createNewAlertBtn: '+ புதிய விலை எச்சரிக்கை அமைக்க',
    activeAlerts: 'செயலில் உள்ள எச்சரிக்கைகள்',
    targetPriceLabel: 'இலக்கு விலை',
    conditionLabel: 'நிபந்தனை',
    mandiLabel: 'மண்டி',

    // Auth Modal
    loginTitle: 'FarmConnect-க்கு உங்களை வரவேற்கிறோம் 🚜',
    loginSubtitle: 'விவசாயிகளுக்கான நேரடி வர்த்தகம் & AI தொழில்நுட்பம்',
    fullName: 'முழு பெயர்',
    phoneLabel: 'கைபேசி எண்',
    roleLabel: 'நான் ஒரு...',
    farmerRole: 'விவசாயி / உற்பத்தியாளர்',
    buyerRole: 'மொத்த வியாபாரி / வாங்குபவர் / ஆலை',
    enterBtn: 'FarmConnect-ல் நுழைக'
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerHTML = translations[lang][key];
      }
    }
  });

  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.innerHTML = lang === 'en' ? '🇮🇳 தமிழ்' : '🇬🇧 English';
  }

  // Fire event so charts and dynamic views re-render in the active language
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

function getTranslation(key) {
  if (translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  return translations['en'][key] || key;
}

window.translations = translations;
window.setLanguage = setLanguage;
window.getTranslation = getTranslation;
window.getCurrentLang = () => currentLang;
