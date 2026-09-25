/**
 * TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
 * Multi-Criteria Decision Making (MCDM) Engine for Farmer-to-Market / Buyer Optimization
 * 
 * Criteria evaluated:
 * 1. Price Offered (₹/quintal) -> BENEFIT (higher is better)
 * 2. Demand Score (1-100) -> BENEFIT (higher is better)
 * 3. Distance (km) -> COST (lower is better)
 * 4. Transport Cost (₹/km) -> COST (lower is better)
 */

function runTOPSIS(buyers, userWeights = {}, cropQuantity = 50) {
  if (!buyers || buyers.length === 0) {
    return { success: false, message: 'No buyers provided for evaluation' };
  }

  // 1. Establish Criteria Weights (defaults sum to 1.0)
  const weights = {
    price: userWeights.price !== undefined ? parseFloat(userWeights.price) : 0.40,
    demand: userWeights.demand !== undefined ? parseFloat(userWeights.demand) : 0.25,
    distance: userWeights.distance !== undefined ? parseFloat(userWeights.distance) : 0.20,
    transportCost: userWeights.transportCost !== undefined ? parseFloat(userWeights.transportCost) : 0.15
  };

  // Normalize weights if sum != 1
  const sumW = weights.price + weights.demand + weights.distance + weights.transportCost;
  const w = {
    price: weights.price / sumW,
    demand: weights.demand / sumW,
    distance: weights.distance / sumW,
    transportCost: weights.transportCost / sumW
  };

  const m = buyers.length;

  // 2. Build Raw Decision Matrix:
  // Matrix Columns: [price, demand, distance, transportCost]
  const matrix = buyers.map(b => [
    Number(b.buyingPricePerUnit || 0),
    Number(b.demandScore || 50),
    Number(b.distanceKm || 10),
    Number(b.transportCostPerKm || 12)
  ]);

  // 3. Calculate Vector Norms: sqrt(sum of squares for each column)
  const colSumsSquares = [0, 0, 0, 0];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < 4; j++) {
      colSumsSquares[j] += matrix[i][j] * matrix[i][j];
    }
  }
  const normDenominators = colSumsSquares.map(s => Math.sqrt(s) || 1e-9);

  // 4. Normalized Decision Matrix (R) and Weighted Normalized Matrix (V)
  const normMatrix = [];
  const weightedMatrix = [];
  const weightArr = [w.price, w.demand, w.distance, w.transportCost];

  for (let i = 0; i < m; i++) {
    const normRow = [];
    const weightedRow = [];
    for (let j = 0; j < 4; j++) {
      const r_ij = matrix[i][j] / normDenominators[j];
      const v_ij = r_ij * weightArr[j];
      normRow.push(r_ij);
      weightedRow.push(v_ij);
    }
    normMatrix.push(normRow);
    weightedMatrix.push(weightedRow);
  }

  // 5. Determine Positive Ideal Solution (A+) and Negative Ideal Solution (A-)
  // Benefit criteria: Price (col 0), Demand (col 1) -> max is ideal(+), min is ideal(-)
  // Cost criteria: Distance (col 2), TransportCost (col 3) -> min is ideal(+), max is ideal(-)
  const idealPositive = [];
  const idealNegative = [];

  for (let j = 0; j < 4; j++) {
    const colVals = weightedMatrix.map(row => row[j]);
    const maxVal = Math.max(...colVals);
    const minVal = Math.min(...colVals);

    if (j === 0 || j === 1) {
      // Benefit criteria
      idealPositive.push(maxVal);
      idealNegative.push(minVal);
    } else {
      // Cost criteria
      idealPositive.push(minVal);
      idealNegative.push(maxVal);
    }
  }

  // 6. Calculate Euclidean Distances to A+ (S_i+) and A- (S_i-)
  const results = [];
  for (let i = 0; i < m; i++) {
    let sumSqPlus = 0;
    let sumSqMinus = 0;

    for (let j = 0; j < 4; j++) {
      sumSqPlus += Math.pow(weightedMatrix[i][j] - idealPositive[j], 2);
      sumSqMinus += Math.pow(weightedMatrix[i][j] - idealNegative[j], 2);
    }

    const sPlus = Math.sqrt(sumSqPlus);
    const sMinus = Math.sqrt(sumSqMinus);

    // Relative Closeness to Ideal Solution: C_i = S_i- / (S_i+ + S_i-)
    const closenessScore = (sPlus + sMinus) === 0 ? 0 : sMinus / (sPlus + sMinus);

    // Practical Farmer Profit Metrics
    const buyer = buyers[i];
    const grossRevenue = buyer.buyingPricePerUnit * cropQuantity;
    const estimatedTransportCost = Math.round(buyer.distanceKm * buyer.transportCostPerKm);
    const netTakeHome = grossRevenue - estimatedTransportCost;
    const netPerQuintal = Math.round(netTakeHome / cropQuantity);

    results.push({
      buyerId: buyer._id,
      buyerName: buyer.name,
      buyerTamilName: buyer.tamilName || buyer.name,
      buyerType: buyer.buyerType,
      district: buyer.district,
      phone: buyer.phone,
      address: buyer.address,
      rating: buyer.rating,
      verified: buyer.verified,
      metrics: {
        price: buyer.buyingPricePerUnit,
        demand: buyer.demandScore,
        distance: buyer.distanceKm,
        transportRate: buyer.transportCostPerKm
      },
      topsis: {
        distanceToBest: Number(sPlus.toFixed(4)),
        distanceToWorst: Number(sMinus.toFixed(4)),
        closenessScore: Number(closenessScore.toFixed(4)), // 0 to 1
        percentageScore: Math.round(closenessScore * 100)
      },
      economics: {
        grossRevenue,
        transportCostTotal: estimatedTransportCost,
        netTakeHome,
        netPerQuintal
      }
    });
  }

  // 7. Sort by Closeness Score Descending (Rank 1 is the best overall decision)
  results.sort((a, b) => b.topsis.closenessScore - a.topsis.closenessScore);

  results.forEach((item, index) => {
    item.rank = index + 1;
    if (index === 0) {
      item.badge = '🏆 Best Overall Match (TOPSIS #1)';
      item.badgeTa = '🏆 சிறந்த சந்தை (முதல் தேர்வு)';
      item.summary = `Highest balanced score (${item.topsis.percentageScore}%). Offers top net return of ₹${item.economics.netPerQuintal}/qtl after deducting ₹${item.economics.transportCostTotal} transport.`;
      item.summaryTa = `அதிகபட்ச ஒருங்கிணைந்த மதிப்பு (${item.topsis.percentageScore}%). போக்குவரத்து செலவு ₹${item.economics.transportCostTotal} போக நிகர வருமானம் ₹${item.economics.netPerQuintal}/குவிண்டால் கிடைக்கிறது.`;
    } else if (index === 1) {
      item.badge = '🥈 Second Best Alternative';
      item.badgeTa = '🥈 இரண்டாவது சிறந்த தேர்வு';
      item.summary = `Viable backup buyer with ${item.topsis.percentageScore}% TOPSIS closeness.`;
      item.summaryTa = `இரண்டாவது மாற்று வாங்குபவர் - மதிப்பெண் ${item.topsis.percentageScore}%.`;
    } else {
      item.badge = `Rank #${index + 1}`;
      item.badgeTa = `வரிசை எண் #${index + 1}`;
      item.summary = `Lower net yield due to distance or transport friction.`;
      item.summaryTa = `தூரம் அல்லது போக்குவரத்து கட்டணம் காரணமாக குறைவான நிகர லாபம்.`;
    }
  });

  return {
    success: true,
    rankedBuyers: results,
    weightsUsed: w,
    idealPositive,
    idealNegative,
    totalEvaluated: m
  };
}

module.exports = {
  runTOPSIS
};
