/**
 * Decision Tree & Rule-Based Matcher for Unsold / Surplus Crops
 * Matches unsold crops to:
 * 1. Food Processing (Puree, Canning, Chips, Dehydration)
 * 2. Animal Feed (Dairy Cattle, Poultry, Aquaculture)
 * 3. Donation / Charity (Food Banks, Mid-Day Meal, Zero-Waste NGOs)
 * 4. Organic Compost & Vermicompost (Soil Enrichment)
 * 5. Biogas & Compressed Bio-Gas (CBG) / Renewable Energy
 */

const SALVAGE_ROUTES = {
  PROCESSING: {
    id: 'processing',
    title: 'Food Processing & Value Addition',
    titleTa: 'உணவு பதப்படுத்துதல் & மதிப்புக்கூட்டுதல்',
    icon: '🏭',
    badgeClass: 'badge-processing',
    payoutRecovery: '65% - 80% of Market Value',
    payoutRecoveryTa: 'சந்தை மதிப்பில் 65% - 80% வரை மீட்பு',
    description: 'Direct dispatch to food processing units for pulp, puree, pickle, flour milling, or dehydration.',
    descriptionTa: 'தக்காளி சாறு, பழக்கூழ், ஊறுகாய், மாவு மில்கள் அல்லது உலரவைக்கும் தொழிற்சாலைகளுக்கு அனுப்புதல்.'
  },
  ANIMAL_FEED: {
    id: 'animal_feed',
    title: 'Animal Feed & Cattle Fodder',
    titleTa: 'கால்நடை & கோழி தீவனம்',
    icon: '🐄',
    badgeClass: 'badge-feed',
    payoutRecovery: '40% - 55% of Market Value',
    payoutRecoveryTa: 'சந்தை மதிப்பில் 40% - 55% மீட்பு',
    description: 'Converted into nutrient-dense silage, cattle feed, or poultry rations for dairy cooperatives.',
    descriptionTa: 'பால் பண்ணை மாடுகளுக்கான தீவனம், அடர் தீவனம் அல்லது கோழி தீவனமாகப் பயன்படுதல்.'
  },
  DONATION: {
    id: 'donation',
    title: 'Donation & Food Bank (Zero-Waste)',
    titleTa: 'அறக்கட்டளை & சமூக உணவு வங்கி',
    icon: '🤝',
    badgeClass: 'badge-donation',
    payoutRecovery: 'Social Credit + Tax 80G Certificate + Free Pickup',
    payoutRecoveryTa: 'வரி விலக்கு சான்றிதழ் + இலவச வாகன ஏற்பாடு',
    description: 'Nutritious edible produce distributed to hunger relief kitchens, ashrams, and community shelters.',
    descriptionTa: 'உண்ணக்கூடிய நல்ல உணவுப் பொருட்களை சமூக உணவு வங்கிகள் மற்றும் ஆதரவற்றோர் இல்லங்களுக்கு வழங்குதல்.'
  },
  COMPOST: {
    id: 'compost',
    title: 'Organic Compost & Vermiculture',
    titleTa: 'இயற்கை மண்புழு உரம் தயாரிப்பு',
    icon: '🌱',
    badgeClass: 'badge-compost',
    payoutRecovery: '15% - 25% or Bio-Fertilizer Barter',
    payoutRecoveryTa: '15% - 25% தொகை அல்லது இயற்கை உரம் பண்டமாற்று',
    description: 'Enriched microbial composting to regenerate agricultural topsoil and farm nutrients.',
    descriptionTa: 'மண்ணின் வளத்தை பெருக்க மண்புழு உரம் மற்றும் நுண்ணுயிர் இயற்கை உரமாக மாற்றுதல்.'
  },
  BIOGAS: {
    id: 'biogas',
    title: 'Biogas & Clean Bio-Energy (CBG)',
    titleTa: 'உயிரி எரிவாயு (பயோ-கேஸ் & மின்சாரம்)',
    icon: '⚡',
    badgeClass: 'badge-biogas',
    payoutRecovery: '₹2.00 - ₹3.50 per Kg Waste Incentive',
    payoutRecoveryTa: 'கிலோவுக்கு ₹2.00 - ₹3.50 வரை அரசு மானிய ஊக்கத்தொகை',
    description: 'High-moisture fermentable biomass utilized in anaerobic digesters for clean cooking gas and electricity.',
    descriptionTa: 'அதிக ஈரப்பதமுள்ள அழுகிய கழிவுகளை காற்றில்லா முறையில் உயிரி எரிவாயு மற்றும் மின்சாரமாக மாற்றுதல்.'
  }
};

/**
 * Evaluates Decision Tree rules based on crop condition parameters
 */
function evaluateSalvageDecisionTree(cropData) {
  const {
    cropName = 'Tomato',
    quantity = 10, // quintals
    grade = 'Grade B',
    daysSinceHarvest = 4,
    damagePercent = 15,
    perishability = 'High', // High (Tomato, Banana), Medium (Onion, Potato), Low (Paddy, Grains)
    isCertifiedOrganic = false
  } = cropData;

  const decisionPath = [];
  let primaryRoute = null;
  let secondaryRoute = null;
  let ruleTriggered = '';
  let ruleTriggeredTa = '';

  // Decision Node 1: Damage & Edibility Assessment
  if (damagePercent <= 15) {
    decisionPath.push('Node 1: Minimal Damage (<= 15%) -> High Edibility & Safety Standard');
    
    // Sub-Node 1A: Processing vs Fresh Donation
    if (grade === 'Grade A' || grade === 'Grade B' || grade === 'Grade A+') {
      decisionPath.push('Node 1A: High/Standard Commercial Grade -> Processing Industry Primary');
      primaryRoute = SALVAGE_ROUTES.PROCESSING;
      secondaryRoute = SALVAGE_ROUTES.DONATION;
      ruleTriggered = `Produce has low cosmetic damage (${damagePercent}%). Ideal for food processing, pulping, puree, or chips manufacturing with high revenue recovery.`;
      ruleTriggeredTa = `பயிரில் சேதம் குறைவு (${damagePercent}%). கூழ், சாறு அல்லது சிப்ஸ் தயாரிக்கும் உணவு பதப்படுத்தும் ஆலைகளுக்கு அனுப்பினால் அதிக லாபம் கிடைக்கும்.`;
    } else {
      decisionPath.push('Node 1B: Edible but uneven sizing -> Donation Food Bank');
      primaryRoute = SALVAGE_ROUTES.DONATION;
      secondaryRoute = SALVAGE_ROUTES.PROCESSING;
      ruleTriggered = `Edible surplus with uneven sizing. Best suited for quick community food bank distribution with transport subsidy and zero waste tax credit.`;
      ruleTriggeredTa = `உண்ணக்கூடிய நல்ல உணவுப் பொருள். சமூக உணவு வங்கிகளுக்கு வழங்கினால் உணவுக் கழிவு தவிர்க்கப்பட்டு வரிவிலக்கு கிடைக்கும்.`;
    }
  } else if (damagePercent > 15 && damagePercent <= 40) {
    decisionPath.push('Node 2: Moderate Bruising / Overripeness (16% - 40%) -> Safe for Cattle & Animals');
    primaryRoute = SALVAGE_ROUTES.ANIMAL_FEED;
    secondaryRoute = SALVAGE_ROUTES.COMPOST;
    ruleTriggered = `Produce has moderate blemishes/softening (${damagePercent}%). Highly nutritious for dairy cattle silage and poultry feed mixing with guaranteed offtake.`;
    ruleTriggeredTa = `பயிரில் மிதமான நசுங்கல் (${damagePercent}%). இது பால் மாடுகள் மற்றும் கோழி தீவனத்திற்கு மிகவும் ஏற்ற சத்துமிக்க தீவனமாகும்.`;
  } else {
    // Damage > 40% (Spoiled, fermented, or physical damage)
    decisionPath.push('Node 3: Significant Spoilage / Degradation (> 40%)');

    const lowerName = cropName.toLowerCase();
    const isHighMoisture = lowerName.includes('tomato') || lowerName.includes('banana') || lowerName.includes('fruit') || perishability === 'High';

    if (isHighMoisture) {
      decisionPath.push('Node 3A: Wet Biomass / High Moisture -> Anaerobic Biogas Digestion');
      primaryRoute = SALVAGE_ROUTES.BIOGAS;
      secondaryRoute = SALVAGE_ROUTES.COMPOST;
      ruleTriggered = `High moisture degraded biomass (${damagePercent}% spoilage). High methane yield makes it ideal for local biogas energy plants with clean energy credits.`;
      ruleTriggeredTa = `அதிக ஈரப்பதம் மற்றும் அழுகிய கழிவு (${damagePercent}%). பயோ-கேஸ் உயிரி எரிவாயு நிலையங்களுக்கு உகந்தது; கிலோவுக்கு கட்டணம் கிடைக்கும்.`;
    } else {
      decisionPath.push('Node 3B: Fibrous / Low Moisture Residue -> Organic Vermicompost');
      primaryRoute = SALVAGE_ROUTES.COMPOST;
      secondaryRoute = SALVAGE_ROUTES.BIOGAS;
      ruleTriggered = `Dry organic biomass with structural fiber. Recommended for microbial composting to regenerate farm soils and vermicompost trading.`;
      ruleTriggeredTa = `உலர்ந்த இயற்கை கழிவு. மண்புழு உரம் மற்றும் இயற்கை உரம் தயாரிக்க உகந்தது; நிலத்தின் வளத்தை பெருக்கும்.`;
    }
  }

  // Calculate estimated salvage monetary value
  const estimatedStandardPrice = 2500; // Rs/quintal base reference
  let estimatedRecoveryPerQuintal = 0;
  if (primaryRoute.id === 'processing') estimatedRecoveryPerQuintal = Math.round(estimatedStandardPrice * 0.72);
  else if (primaryRoute.id === 'animal_feed') estimatedRecoveryPerQuintal = Math.round(estimatedStandardPrice * 0.48);
  else if (primaryRoute.id === 'donation') estimatedRecoveryPerQuintal = 0; // Tax/Social benefit
  else if (primaryRoute.id === 'compost') estimatedRecoveryPerQuintal = Math.round(estimatedStandardPrice * 0.20);
  else if (primaryRoute.id === 'biogas') estimatedRecoveryPerQuintal = Math.round(estimatedStandardPrice * 0.16);

  const totalSalvageValue = Math.round(estimatedRecoveryPerQuintal * quantity);

  return {
    success: true,
    cropAnalyzed: cropName,
    quantityQuintals: quantity,
    damagePercent,
    decisionTreePath: decisionPath,
    primaryRoute,
    secondaryRoute,
    ruleExplanation: ruleTriggered,
    ruleExplanationTa: ruleTriggeredTa,
    estimatedEconomics: {
      recoveryPerQuintal: estimatedRecoveryPerQuintal,
      totalSalvageValue,
      currency: '₹',
      avoidedWasteKg: quantity * 100
    }
  };
}

module.exports = {
  evaluateSalvageDecisionTree,
  SALVAGE_ROUTES
};
