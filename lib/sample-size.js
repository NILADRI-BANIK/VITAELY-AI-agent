const Z_SCORES = {
  90: 1.645,
  95: 1.96,
  98: 2.326,
  99: 2.576,
};

function getZScore(confidenceLevel) {
  const rounded = Math.round(confidenceLevel);
  if (Z_SCORES[rounded]) return Z_SCORES[rounded];
  const keys = Object.keys(Z_SCORES).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  let minDiff = Math.abs(rounded - closest);
  for (const k of keys) {
    const diff = Math.abs(rounded - k);
    if (diff < minDiff) {
      minDiff = diff;
      closest = k;
    }
  }
  return Z_SCORES[closest];
}

export function calculateCochranSampleSize({
  confidenceLevel = 95,
  marginOfError = 5,
  population = null,
  responseDistribution = 50,
} = {}) {
  const z = getZScore(confidenceLevel);
  const e = marginOfError / 100;
  const p = responseDistribution / 100;

  if (e <= 0 || e >= 1) {
    throw new Error("marginOfError must be between 0 and 100 exclusive");
  }
  if (p <= 0 || p >= 1) {
    throw new Error("responseDistribution must be between 0 and 100 exclusive");
  }

  const n0 = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);

  let finalSampleSize = n0;
  let adjustedForPopulation = false;

  if (population && Number(population) > 0) {
    const N = Number(population);
    finalSampleSize = n0 / (1 + (n0 - 1) / N);
    adjustedForPopulation = true;
  }

  return {
    recommendedSampleSize: Math.ceil(finalSampleSize),
    rawSampleSize: Math.ceil(n0),
    zScore: z,
    confidenceLevel,
    marginOfError,
    responseDistribution,
    population: population ? Number(population) : null,
    adjustedForPopulation,
    formula: "Cochran's Formula",
  };
}

export function calculateStratifiedSampleSize({
  strata = [],
  confidenceLevel = 95,
  marginOfError = 5,
  responseDistribution = 50,
} = {}) {
  if (!Array.isArray(strata) || strata.length === 0) {
    throw new Error("strata must be a non-empty array");
  }

  const totalPopulation = strata.reduce(
    (sum, s) => sum + (Number(s.population) || 0),
    0,
  );

  if (totalPopulation <= 0) {
    throw new Error("total population across strata must be greater than 0");
  }

  const overall = calculateCochranSampleSize({
    confidenceLevel,
    marginOfError,
    population: totalPopulation,
    responseDistribution,
  });

  const breakdown = strata.map((s) => {
    const stratumPopulation = Number(s.population) || 0;
    const proportion = stratumPopulation / totalPopulation;
    const stratumSampleSize = Math.ceil(
      overall.recommendedSampleSize * proportion,
    );
    return {
      name: s.name ?? "Unnamed Stratum",
      population: stratumPopulation,
      proportion: Number((proportion * 100).toFixed(2)),
      sampleSize: stratumSampleSize,
    };
  });

  const totalSampleSize = breakdown.reduce((sum, b) => sum + b.sampleSize, 0);

  return {
    totalPopulation,
    totalSampleSize,
    overallRecommendedSampleSize: overall.recommendedSampleSize,
    confidenceLevel,
    marginOfError,
    responseDistribution,
    breakdown,
    formula: "Stratified Cochran's Formula",
  };
}

export function calculateMarginOfErrorFromSampleSize({
  sampleSize,
  population = null,
  confidenceLevel = 95,
  responseDistribution = 50,
} = {}) {
  if (!sampleSize || Number(sampleSize) <= 0) {
    throw new Error("sampleSize must be greater than 0");
  }

  const z = getZScore(confidenceLevel);
  const p = responseDistribution / 100;
  const n = Number(sampleSize);

  let marginOfError;

  if (population && Number(population) > 0) {
    const N = Number(population);
    const adjustedN = (n * N) / (N - n + n);
    marginOfError = Math.sqrt((Math.pow(z, 2) * p * (1 - p)) / adjustedN) * 100;
  } else {
    marginOfError = Math.sqrt((Math.pow(z, 2) * p * (1 - p)) / n) * 100;
  }

  return {
    marginOfError: Number(marginOfError.toFixed(2)),
    sampleSize: n,
    population: population ? Number(population) : null,
    confidenceLevel,
    responseDistribution,
  };
}

export function calculatePowerAnalysisSampleSize({
  effectSize = 0.5,
  alpha = 0.05,
  power = 0.8,
  testType = "two-sample",
} = {}) {
  const alphaZScores = {
    0.01: 2.576,
    0.05: 1.96,
    0.1: 1.645,
  };
  const powerZScores = {
    0.8: 0.84,
    0.9: 1.28,
    0.95: 1.645,
  };

  const zAlpha = alphaZScores[alpha] ?? 1.96;
  const zBeta = powerZScores[power] ?? 0.84;

  if (!effectSize || effectSize <= 0) {
    throw new Error("effectSize must be greater than 0");
  }

  const multiplier = testType === "two-sample" ? 2 : 1;
  const n = (multiplier * Math.pow(zAlpha + zBeta, 2)) / Math.pow(effectSize, 2);

  return {
    recommendedSampleSizePerGroup: Math.ceil(n),
    totalRecommendedSampleSize:
      testType === "two-sample" ? Math.ceil(n) * 2 : Math.ceil(n),
    effectSize,
    alpha,
    power,
    testType,
    formula: "Power Analysis",
  };
}

export function validateSampleSizeInputs({
  confidenceLevel,
  marginOfError,
  population,
  responseDistribution,
} = {}) {
  const errors = [];

  if (
    confidenceLevel !== undefined &&
    (confidenceLevel < 50 || confidenceLevel > 99.99)
  ) {
    errors.push("confidenceLevel must be between 50 and 99.99");
  }

  if (
    marginOfError !== undefined &&
    (marginOfError <= 0 || marginOfError >= 100)
  ) {
    errors.push("marginOfError must be between 0 and 100 exclusive");
  }

  if (population !== undefined && population !== null && population < 0) {
    errors.push("population must be a positive number");
  }

  if (
    responseDistribution !== undefined &&
    (responseDistribution <= 0 || responseDistribution >= 100)
  ) {
    errors.push("responseDistribution must be between 0 and 100 exclusive");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getRecommendedConfidenceLevels() {
  return [
    { value: 90, label: "90%", description: "Lower rigor, smaller sample" },
    { value: 95, label: "95%", description: "Standard for most research" },
    { value: 98, label: "98%", description: "High rigor" },
    { value: 99, label: "99%", description: "Very high rigor, larger sample" },
  ];
}