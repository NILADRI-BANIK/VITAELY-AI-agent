"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import {
  buildMethodologyCacheKey,
  getCachedMethodologyData,
  setCachedMethodologyData,
} from "./methodology-cache";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const VALID_DATA_TYPES = [
  "numerical",
  "categorical",
  "text",
  "image",
  "time-series",
  "mixed",
];

const VALID_ANALYSIS_GOALS = [
  "comparison",
  "prediction",
  "classification",
  "clustering",
  "correlation",
  "forecasting",
  "detection",
];

const STATISTICAL_TEST_LIBRARY = {
  comparison: [
    { name: "T-Test", useCase: "Compare means of two groups", confidence: 90, evidence: "Rule-based" },
    { name: "ANOVA", useCase: "Compare means across three or more groups", confidence: 90, evidence: "Rule-based" },
    { name: "Chi-square Test", useCase: "Compare categorical distributions", confidence: 85, evidence: "Rule-based" },
    { name: "Mann-Whitney U Test", useCase: "Non-parametric comparison of two groups", confidence: 80, evidence: "Rule-based" },
  ],
  correlation: [
    { name: "Pearson Correlation", useCase: "Linear relationship between numerical variables", confidence: 90, evidence: "Rule-based" },
    { name: "Spearman Correlation", useCase: "Monotonic relationship, non-parametric", confidence: 80, evidence: "Rule-based" },
    { name: "Regression Analysis", useCase: "Model relationship and predict outcomes", confidence: 85, evidence: "Rule-based" },
  ],
  prediction: [
    { name: "Linear Regression", useCase: "Predict continuous numerical outcomes", confidence: 85, evidence: "Rule-based" },
    { name: "Logistic Regression", useCase: "Predict binary categorical outcomes", confidence: 85, evidence: "Rule-based" },
    { name: "Multiple Regression", useCase: "Predict outcome from multiple predictors", confidence: 80, evidence: "Rule-based" },
  ],
  classification: [
    { name: "Random Forest", useCase: "Robust classification with feature importance", confidence: 85, evidence: "Rule-based" },
    { name: "Support Vector Machine (SVM)", useCase: "Classification with clear margin separation", confidence: 75, evidence: "Rule-based" },
    { name: "XGBoost", useCase: "High-performance gradient boosted classification", confidence: 85, evidence: "Rule-based" },
    { name: "Naive Bayes", useCase: "Fast probabilistic classification", confidence: 70, evidence: "Rule-based" },
  ],
  clustering: [
    { name: "K-Means Clustering", useCase: "Partition data into K groups", confidence: 80, evidence: "Rule-based" },
    { name: "Hierarchical Clustering", useCase: "Build nested cluster hierarchy", confidence: 75, evidence: "Rule-based" },
    { name: "DBSCAN", useCase: "Density-based clustering with noise handling", confidence: 75, evidence: "Rule-based" },
  ],
  forecasting: [
    { name: "ARIMA", useCase: "Time-series forecasting with trend and seasonality", confidence: 80, evidence: "Rule-based" },
    { name: "Exponential Smoothing", useCase: "Short-term time-series forecasting", confidence: 75, evidence: "Rule-based" },
    { name: "LSTM", useCase: "Deep learning sequence forecasting", confidence: 70, evidence: "Rule-based" },
  ],
  detection: [
    { name: "Isolation Forest", useCase: "Anomaly/outlier detection", confidence: 80, evidence: "Rule-based" },
    { name: "CNN", useCase: "Image-based detection tasks", confidence: 75, evidence: "Rule-based" },
    { name: "Autoencoder", useCase: "Anomaly detection via reconstruction error", confidence: 75, evidence: "Rule-based" },
  ],
};

const ML_MODEL_LIBRARY = {
  image: ["CNN", "ResNet", "Vision Transformer (ViT)"],
  text: ["BERT", "LSTM", "Naive Bayes", "SVM"],
  "time-series": ["ARIMA", "LSTM", "Prophet"],
  numerical: ["Random Forest", "XGBoost", "Linear/Logistic Regression"],
  categorical: ["Random Forest", "Decision Tree", "Naive Bayes"],
  mixed: ["Random Forest", "XGBoost", "Neural Network"],
};

const TEST_ASSUMPTIONS = {
  "T-Test": [
    { name: "Normality", required: true, checkFn: "Shapiro-Wilk" },
    { name: "Equal Variance", required: true, checkFn: "Levene Test" },
    { name: "Independent Observations", required: true, checkFn: null },
  ],
  "ANOVA": [
    { name: "Normality", required: true, checkFn: "Shapiro-Wilk" },
    { name: "Equal Variance", required: true, checkFn: "Levene Test" },
    { name: "Independent Observations", required: true, checkFn: null },
  ],
  "Mann-Whitney U Test": [
    { name: "Independent Observations", required: true, checkFn: null },
    { name: "Ordinal or Continuous Data", required: true, checkFn: null },
  ],
  "Pearson Correlation": [
    { name: "Linearity", required: true, checkFn: null },
    { name: "Normality", required: true, checkFn: "Shapiro-Wilk" },
    { name: "No Outliers", required: false, checkFn: null },
  ],
  "Spearman Correlation": [
    { name: "Monotonic Relationship", required: true, checkFn: null },
  ],
  "Regression Analysis": [
    { name: "Linearity", required: true, checkFn: null },
    { name: "Homoscedasticity", required: true, checkFn: "Levene Test" },
    { name: "No Multicollinearity", required: true, checkFn: "VIF" },
    { name: "Independence of Residuals", required: true, checkFn: "Durbin Watson" },
  ],
  "Linear Regression": [
    { name: "Linearity", required: true, checkFn: null },
    { name: "Homoscedasticity", required: true, checkFn: "Levene Test" },
    { name: "No Multicollinearity", required: true, checkFn: "VIF" },
    { name: "Independence of Residuals", required: true, checkFn: "Durbin Watson" },
  ],
  "Logistic Regression": [
    { name: "No Multicollinearity", required: true, checkFn: "VIF" },
    { name: "Independence of Observations", required: true, checkFn: null },
    { name: "Large Sample Size", required: true, checkFn: null },
  ],
  "Chi-square Test": [
    { name: "Categorical Variables Only", required: true, checkFn: null },
    { name: "Expected Frequency >= 5", required: true, checkFn: null },
  ],
};

const PARAMETRIC_ALTERNATIVES = {
  "T-Test": "Mann-Whitney U Test",
  "ANOVA": "Kruskal-Wallis Test",
  "Pearson Correlation": "Spearman Correlation",
};

const EFFECT_SIZE_LIBRARY = {
  "T-Test": "Cohen's d",
  "Mann-Whitney U Test": "Rank-Biserial Correlation",
  "ANOVA": "Eta Squared",
  "Kruskal-Wallis Test": "Epsilon Squared",
  "Chi-square Test": "Cramer's V",
  "Pearson Correlation": "R²",
  "Spearman Correlation": "R²",
  "Linear Regression": "R²",
  "Multiple Regression": "R²",
  "Logistic Regression": "Odds Ratio",
};

const VISUALIZATION_LIBRARY = {
  "T-Test": ["Box Plot", "Histogram"],
  "ANOVA": ["Box Plot", "Bar Chart with Error Bars"],
  "Mann-Whitney U Test": ["Box Plot"],
  "Pearson Correlation": ["Scatter Plot", "Heatmap"],
  "Spearman Correlation": ["Scatter Plot"],
  "Regression Analysis": ["Scatter Plot", "QQ Plot", "Residual Plot"],
  "Linear Regression": ["Scatter Plot", "QQ Plot", "Residual Plot"],
  "Logistic Regression": ["ROC Curve", "Confusion Matrix Heatmap"],
  "Chi-square Test": ["Bar Chart", "Heatmap"],
  "Random Forest": ["Feature Importance Bar Chart", "Confusion Matrix Heatmap"],
  "XGBoost": ["Feature Importance Bar Chart", "ROC Curve"],
};

const MINIMUM_SAMPLE_SIZE = {
  "T-Test": 30,
  "ANOVA": 20,
  "Mann-Whitney U Test": 10,
  "Pearson Correlation": 30,
  "Regression Analysis": 50,
  "Linear Regression": 50,
  "Logistic Regression": 100,
  "Chi-square Test": 20,
};

const CODE_SNIPPET_LIBRARY = {
  "T-Test": {
    python: "from scipy.stats import ttest_ind\nresult = ttest_ind(group1, group2)",
    r: "t.test(group1, group2)",
    spss: "Analyze > Compare Means > Independent-Samples T Test",
  },
  "ANOVA": {
    python: "from scipy.stats import f_oneway\nresult = f_oneway(group1, group2, group3)",
    r: "aov(outcome ~ group, data = df)",
    spss: "Analyze > Compare Means > One-Way ANOVA",
  },
  "Chi-square Test": {
    python: "from scipy.stats import chi2_contingency\nresult = chi2_contingency(table)",
    r: "chisq.test(table)",
    spss: "Analyze > Descriptive Statistics > Crosstabs",
  },
  "Pearson Correlation": {
    python: "from scipy.stats import pearsonr\nresult = pearsonr(x, y)",
    r: "cor.test(x, y, method = 'pearson')",
    spss: "Analyze > Correlate > Bivariate",
  },
  "Linear Regression": {
    python: "from sklearn.linear_model import LinearRegression\nmodel = LinearRegression().fit(X, y)",
    r: "lm(y ~ x, data = df)",
    spss: "Analyze > Regression > Linear",
  },
  "Logistic Regression": {
    python: "from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression().fit(X, y)",
    r: "glm(y ~ x, data = df, family = binomial)",
    spss: "Analyze > Regression > Binary Logistic",
  },
};

function validateDataType(dataType) {
  return VALID_DATA_TYPES.includes(dataType?.toLowerCase())
    ? dataType.toLowerCase()
    : null;
}

function validateAnalysisGoal(goal) {
  return VALID_ANALYSIS_GOALS.includes(goal?.toLowerCase())
    ? goal.toLowerCase()
    : null;
}

function getRuleBasedTests(analysisGoal) {
  return STATISTICAL_TEST_LIBRARY[analysisGoal] ?? [];
}

function getRuleBasedMLModels(dataType) {
  return ML_MODEL_LIBRARY[dataType] ?? [];
}

function attachAssumptions(tests) {
  return tests.map((t) => ({
    ...t,
    assumptions: TEST_ASSUMPTIONS[t.name] ?? [],
    parametricAlternative: PARAMETRIC_ALTERNATIVES[t.name] ?? null,
    effectSize: EFFECT_SIZE_LIBRARY[t.name] ?? null,
    visualizations: VISUALIZATION_LIBRARY[t.name] ?? [],
    codeSnippets: CODE_SNIPPET_LIBRARY[t.name] ?? null,
  }));
}

function checkSampleSizeWarning(tests, sampleSize) {
  if (!sampleSize) return [];
  const warnings = [];
  tests.forEach((t) => {
    const minRequired = MINIMUM_SAMPLE_SIZE[t.name];
    if (minRequired && sampleSize < minRequired) {
      warnings.push({
        test: t.name,
        message: `Sample size (${sampleSize}) may be too small for ${t.name}. Recommended minimum: ${minRequired}.`,
      });
    }
  });
  return warnings;
}

function explainExcludedTests(analysisGoal, dataType) {
  const excluded = [];
  const allTests = Object.values(STATISTICAL_TEST_LIBRARY).flat();
  const includedNames = getRuleBasedTests(analysisGoal).map((t) => t.name);

  allTests.forEach((t) => {
    if (includedNames.includes(t.name)) return;
    if (excluded.some((e) => e.name === t.name)) return;

    let reason = `Not aligned with the "${analysisGoal}" analysis goal.`;
    if (t.name === "Chi-square Test" && dataType !== "categorical") {
      reason = "Your data type is not purely categorical.";
    } else if (
      (t.name === "Linear Regression" || t.name === "Pearson Correlation") &&
      dataType === "categorical"
    ) {
      reason = "Your dependent variable appears categorical, not numerical.";
    }

    excluded.push({ name: t.name, reason });
  });

  return excluded.slice(0, 5);
}

async function generateStatisticsRecommendationWithGroq({
  topic,
  dataType,
  analysisGoal,
  sampleSize,
  ruleBasedTests,
  ruleBasedModels,
}) {
  if (!groq) throw new Error("Groq API not configured");

  const contextLines = [
    `Topic: "${topic}"`,
    dataType ? `Data type: ${dataType}` : null,
    analysisGoal ? `Analysis goal: ${analysisGoal}` : null,
    sampleSize ? `Approximate sample size: ${sampleSize}` : null,
    ruleBasedTests.length
      ? `Candidate statistical tests: ${ruleBasedTests.map((t) => t.name).join(", ")}`
      : null,
    ruleBasedModels.length
      ? `Candidate ML models: ${ruleBasedModels.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1536,
    messages: [
      {
        role: "system",
        content: `You are an expert research statistician and ML advisor.
Respond with a valid JSON object containing:
  - "recommendedTests": { "name": string, "reason": string, "confidence": number (0-100) }[] (2-4 statistical tests)
  - "recommendedModels": { "name": string, "reason": string, "confidence": number (0-100) }[] (0-4 ML models, empty array if not applicable)
  - "assumptions": string[] (2-4 statistical assumptions to check, e.g. normality, homogeneity of variance)
  - "software": string[] (recommended tools, e.g. SPSS, R, Python scikit-learn)
  - "overallReasoning": string (2-3 sentence explanation of the overall recommendation)
Do not include any text outside the JSON object.`,
      },
      { role: "user", content: contextLines },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  return {
    recommendedTests: Array.isArray(parsed.recommendedTests)
      ? parsed.recommendedTests.filter(
          (t) => t && typeof t.name === "string" && typeof t.reason === "string",
        )
      : [],
    recommendedModels: Array.isArray(parsed.recommendedModels)
      ? parsed.recommendedModels.filter(
          (m) => m && typeof m.name === "string" && typeof m.reason === "string",
        )
      : [],
    assumptions: Array.isArray(parsed.assumptions)
      ? parsed.assumptions.filter((a) => typeof a === "string")
      : [],
    software: Array.isArray(parsed.software)
      ? parsed.software.filter((s) => typeof s === "string")
      : [],
    overallReasoning:
      typeof parsed.overallReasoning === "string" ? parsed.overallReasoning : "",
  };
}

export async function recommendStatisticalApproach({
  topic,
  dataType,
  analysisGoal,
  sampleSize = null,
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };

  const validDataType = validateDataType(dataType);
  if (!validDataType)
    return { success: false, error: `Invalid dataType: ${dataType}` };

  const validGoal = validateAnalysisGoal(analysisGoal);
  if (!validGoal)
    return { success: false, error: `Invalid analysisGoal: ${analysisGoal}` };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const cacheKey = buildMethodologyCacheKey(
    "statistics_recommendation",
    userId,
    topic,
    validDataType,
    validGoal,
  );

  const cached = await getCachedMethodologyData(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const rawRuleBasedTests = getRuleBasedTests(validGoal);
    const ruleBasedTests = attachAssumptions(rawRuleBasedTests);
    const ruleBasedModels = getRuleBasedMLModels(validDataType);
    const sampleSizeWarnings = checkSampleSizeWarning(rawRuleBasedTests, sampleSize);
    const excludedTests = explainExcludedTests(validGoal, validDataType);

    const aiRecommendation = await generateStatisticsRecommendationWithGroq({
      topic: topic.trim(),
      dataType: validDataType,
      analysisGoal: validGoal,
      sampleSize,
      ruleBasedTests,
      ruleBasedModels,
    });

    const result = {
      topic: topic.trim(),
      dataType: validDataType,
      analysisGoal: validGoal,
      sampleSize,
      ruleBasedTests,
      ruleBasedModels,
      sampleSizeWarnings,
      excludedTests,
      ...aiRecommendation,
      generatedAt: new Date().toISOString(),
    };

    await setCachedMethodologyData(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to recommend statistical approach",
    };
  }
}

export async function getStatisticalTestLibrary() {
  return { success: true, data: STATISTICAL_TEST_LIBRARY };
}

export async function getMLModelLibrary() {
  return { success: true, data: ML_MODEL_LIBRARY };
}

export async function getSupportedDataTypes() {
  return {
    success: true,
    data: VALID_DATA_TYPES.map((type) => ({ id: type, label: type })),
  };
}

export async function getSupportedAnalysisGoals() {
  return {
    success: true,
    data: VALID_ANALYSIS_GOALS.map((goal) => ({ id: goal, label: goal })),
  };
}