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

const VALID_METHODOLOGY_TYPES = [
  "qualitative",
  "quantitative",
  "mixed-methods",
  "experimental",
  "survey",
  "case-study",
  "systematic-review",
  "action-research",
];

const VALID_MODEL_TYPES = [
  "none",
  "classification",
  "regression",
  "clustering",
  "deep-learning",
];

const VALIDATION_LIBRARY = {
  quantitative: [
    { name: "Cronbach's Alpha", useCase: "Internal consistency reliability of survey instruments" },
    { name: "Test-Retest Reliability", useCase: "Stability of measurement over time" },
    { name: "Confirmatory Factor Analysis (CFA)", useCase: "Validate underlying construct structure" },
    { name: "Content Validity Index (CVI)", useCase: "Expert-rated relevance of instrument items" },
  ],
  qualitative: [
    { name: "Member Checking", useCase: "Participants verify accuracy of interpretations" },
    { name: "Triangulation", useCase: "Cross-verify findings using multiple data sources" },
    { name: "Inter-rater Reliability (Kappa)", useCase: "Agreement between multiple coders" },
    { name: "Thick Description", useCase: "Detailed context to support transferability" },
  ],
  "mixed-methods": [
    { name: "Triangulation", useCase: "Combine quantitative and qualitative validation" },
    { name: "Cronbach's Alpha", useCase: "Reliability of quantitative instrument component" },
    { name: "Member Checking", useCase: "Validate qualitative interpretation component" },
  ],
  experimental: [
    { name: "Control Group Comparison", useCase: "Isolate treatment effect from confounds" },
    { name: "Randomization Check", useCase: "Verify balanced group assignment" },
    { name: "Manipulation Check", useCase: "Confirm the intervention was applied as intended" },
  ],
  survey: [
    { name: "Cronbach's Alpha", useCase: "Internal consistency of survey scales" },
    { name: "Pilot Testing", useCase: "Pre-test survey with small sample before full deployment" },
    { name: "Face Validity Review", useCase: "Expert review of item clarity and relevance" },
  ],
  "case-study": [
    { name: "Triangulation", useCase: "Cross-verify findings using multiple sources of evidence" },
    { name: "Pattern Matching", useCase: "Compare observed patterns to theoretical predictions" },
  ],
  "systematic-review": [
    { name: "PRISMA Checklist", useCase: "Ensure transparent and reproducible review process" },
    { name: "Inter-rater Reliability (Kappa)", useCase: "Agreement between reviewers on inclusion criteria" },
    { name: "Risk of Bias Assessment", useCase: "Evaluate quality of included studies" },
  ],
  "action-research": [
    { name: "Member Checking", useCase: "Stakeholder verification of findings and interventions" },
    { name: "Reflective Journaling", useCase: "Document researcher reflexivity across cycles" },
  ],
};

const MODEL_VALIDATION_LIBRARY = {
  classification: [
    { name: "K-Fold Cross-Validation", useCase: "Robust performance estimate across folds" },
    { name: "Precision, Recall, F1-Score", useCase: "Class-level performance evaluation" },
    { name: "ROC-AUC", useCase: "Discrimination ability across thresholds" },
    { name: "Confusion Matrix", useCase: "Detailed breakdown of prediction errors" },
  ],
  regression: [
    { name: "K-Fold Cross-Validation", useCase: "Robust generalization estimate" },
    { name: "RMSE / MAE", useCase: "Magnitude of prediction error" },
    { name: "R-squared", useCase: "Proportion of variance explained" },
  ],
  clustering: [
    { name: "Silhouette Score", useCase: "Cluster cohesion and separation quality" },
    { name: "Davies-Bouldin Index", useCase: "Average similarity between clusters" },
    { name: "Elbow Method", useCase: "Determine optimal number of clusters" },
  ],
  "deep-learning": [
    { name: "Holdout Validation Set", useCase: "Monitor overfitting during training" },
    { name: "Early Stopping", useCase: "Prevent overfitting via training halt criteria" },
    { name: "Bootstrap Resampling", useCase: "Estimate model stability across resamples" },
  ],
};

const VALIDATION_MINIMUM_REQUIREMENTS = {
  "Cronbach's Alpha": { minItems: 3, minRespondents: 30, note: "Needs at least 3 scale items and ~30 respondents for stable estimates" },
  "Test-Retest Reliability": { minItems: null, minRespondents: 20, note: "Needs a second measurement wave with at least 20 respondents" },
  "Confirmatory Factor Analysis (CFA)": { minItems: 4, minRespondents: 100, note: "Needs a minimum of 100 respondents for stable model fit" },
  "Content Validity Index (CVI)": { minItems: null, minRespondents: 3, note: "Needs at least 3 expert raters" },
  "Inter-rater Reliability (Kappa)": { minItems: null, minRespondents: 2, note: "Needs at least 2 independent coders/raters" },
  "K-Fold Cross-Validation": { minItems: null, minRespondents: 50, note: "Needs enough samples so each fold remains representative (~50+ recommended)" },
  "Holdout Validation Set": { minItems: null, minRespondents: 100, note: "Needs enough data to split into train/validation without starving either set" },
};

const VALIDATION_TEST_LINKS = {
  "T-Test": ["Test-Retest Reliability", "Randomization Check"],
  "ANOVA": ["Test-Retest Reliability", "Randomization Check"],
  "Chi-square Test": ["Inter-rater Reliability (Kappa)"],
  "Pearson Correlation": ["Cronbach's Alpha", "Confirmatory Factor Analysis (CFA)"],
  "Regression Analysis": ["Cronbach's Alpha", "Confirmatory Factor Analysis (CFA)"],
  "Linear Regression": ["Cronbach's Alpha"],
  "Logistic Regression": ["Cronbach's Alpha"],
  "Random Forest": ["K-Fold Cross-Validation"],
  "XGBoost": ["K-Fold Cross-Validation"],
  "Naive Bayes": ["K-Fold Cross-Validation"],
};

function validateMethodologyType(type) {
  return VALID_METHODOLOGY_TYPES.includes(type?.toLowerCase())
    ? type.toLowerCase()
    : null;
}

function validateModelType(type) {
  return VALID_MODEL_TYPES.includes(type?.toLowerCase())
    ? type.toLowerCase()
    : null;
}

function getRuleBasedValidation(methodologyType) {
  return VALIDATION_LIBRARY[methodologyType] ?? [];
}

function getRuleBasedModelValidation(modelType) {
  if (!modelType || modelType === "none") return [];
  return MODEL_VALIDATION_LIBRARY[modelType] ?? [];
}

function checkValidationSampleAdequacy({ sampleSize, itemCount, validationMethods }) {
  const warnings = [];
  validationMethods.forEach((v) => {
    const req = VALIDATION_MINIMUM_REQUIREMENTS[v.name];
    if (!req) return;
    if (req.minRespondents && sampleSize && sampleSize < req.minRespondents) {
      warnings.push({
        method: v.name,
        message: `Sample size (${sampleSize}) may be too small for ${v.name}. Recommended minimum: ${req.minRespondents}. ${req.note}`,
      });
    }
    if (req.minItems && itemCount && itemCount < req.minItems) {
      warnings.push({
        method: v.name,
        message: `Item count (${itemCount}) may be too small for ${v.name}. Recommended minimum: ${req.minItems}. ${req.note}`,
      });
    }
  });
  return warnings;
}

function explainExcludedValidationMethods(methodologyType, modelType) {
  const excluded = [];
  const includedNames = getRuleBasedValidation(methodologyType).map((v) => v.name);
  const includedModelNames = getRuleBasedModelValidation(modelType).map((v) => v.name);
  const allMethods = [
    ...Object.values(VALIDATION_LIBRARY).flat(),
    ...Object.values(MODEL_VALIDATION_LIBRARY).flat(),
  ];

  allMethods.forEach((v) => {
    if (includedNames.includes(v.name) || includedModelNames.includes(v.name)) return;
    if (excluded.some((e) => e.name === v.name)) return;

    let reason = `Not aligned with the "${methodologyType}" methodology type.`;
    if (v.name === "Member Checking" && methodologyType !== "qualitative" && methodologyType !== "mixed-methods" && methodologyType !== "case-study" && methodologyType !== "action-research") {
      reason = "Requires direct participant interpretation, not applicable to this methodology type.";
    } else if (v.name === "Cronbach's Alpha" && methodologyType === "qualitative") {
      reason = "Requires a scaled quantitative instrument, not applicable to qualitative designs.";
    } else if (Object.keys(MODEL_VALIDATION_LIBRARY).some((k) => MODEL_VALIDATION_LIBRARY[k].some((m) => m.name === v.name)) && (!modelType || modelType === "none")) {
      reason = "No ML model type specified, so model-specific validation does not apply.";
    }

    excluded.push({ name: v.name, reason });
  });

  return excluded.slice(0, 5);
}

function linkValidationToStatisticalTests(recommendedTests) {
  if (!Array.isArray(recommendedTests) || recommendedTests.length === 0) return [];
  const links = [];
  recommendedTests.forEach((t) => {
    const linkedMethods = VALIDATION_TEST_LINKS[t.name];
    if (linkedMethods) {
      links.push({ test: t.name, linkedValidationMethods: linkedMethods });
    }
  });
  return links;
}

async function generateValidationRecommendationWithGroq({
  topic,
  methodologyType,
  modelType,
  ruleBasedValidation,
  ruleBasedModelValidation,
}) {
  if (!groq) throw new Error("Groq API not configured");

  const contextLines = [
    `Topic: "${topic}"`,
    `Methodology type: ${methodologyType}`,
    modelType && modelType !== "none" ? `Model type: ${modelType}` : null,
    ruleBasedValidation.length
      ? `Candidate validation methods: ${ruleBasedValidation.map((v) => v.name).join(", ")}`
      : null,
    ruleBasedModelValidation.length
      ? `Candidate model validation methods: ${ruleBasedModelValidation.map((v) => v.name).join(", ")}`
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
        content: `You are an expert in research validity and reliability.
Respond with a valid JSON object containing:
  - "recommendedValidation": { "name": string, "reason": string, "confidence": number (0-100) }[] (2-4 validation methods for the research design)
  - "recommendedModelValidation": { "name": string, "reason": string, "confidence": number (0-100) }[] (0-4 model validation methods, empty array if not applicable)
  - "reliabilityConsiderations": string[] (2-3 reliability-related considerations)
  - "validityConsiderations": string[] (2-3 validity-related considerations, e.g. internal, external, construct validity)
  - "overallReasoning": string (2-3 sentence explanation)
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
    recommendedValidation: Array.isArray(parsed.recommendedValidation)
      ? parsed.recommendedValidation.filter(
          (v) => v && typeof v.name === "string" && typeof v.reason === "string",
        )
      : [],
    recommendedModelValidation: Array.isArray(parsed.recommendedModelValidation)
      ? parsed.recommendedModelValidation.filter(
          (v) => v && typeof v.name === "string" && typeof v.reason === "string",
        )
      : [],
    reliabilityConsiderations: Array.isArray(parsed.reliabilityConsiderations)
      ? parsed.reliabilityConsiderations.filter((r) => typeof r === "string")
      : [],
    validityConsiderations: Array.isArray(parsed.validityConsiderations)
      ? parsed.validityConsiderations.filter((v) => typeof v === "string")
      : [],
    overallReasoning:
      typeof parsed.overallReasoning === "string" ? parsed.overallReasoning : "",
  };
}

export async function recommendValidationStrategy({
  topic,
  methodologyType,
  modelType = "none",
  sampleSize = null,
  itemCount = null,
  recommendedTests = [],
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };

  const validMethodologyType = validateMethodologyType(methodologyType);
  if (!validMethodologyType)
    return {
      success: false,
      error: `Invalid methodologyType: ${methodologyType}`,
    };

  const validModelType = validateModelType(modelType) ?? "none";

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const cacheKey = buildMethodologyCacheKey(
    "validation_recommendation",
    userId,
    topic,
    validMethodologyType,
    validModelType,
    sampleSize ?? "na",
    itemCount ?? "na",
  );

  const cached = await getCachedMethodologyData(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const ruleBasedValidation = getRuleBasedValidation(validMethodologyType);
    const ruleBasedModelValidation = getRuleBasedModelValidation(validModelType);

    const aiRecommendation = await generateValidationRecommendationWithGroq({
      topic: topic.trim(),
      methodologyType: validMethodologyType,
      modelType: validModelType,
      ruleBasedValidation,
      ruleBasedModelValidation,
    });

    const sampleAdequacyWarnings = checkValidationSampleAdequacy({
      sampleSize,
      itemCount,
      validationMethods: [...ruleBasedValidation, ...ruleBasedModelValidation],
    });
    const excludedValidationMethods = explainExcludedValidationMethods(validMethodologyType, validModelType);
    const linkedStatisticalTests = linkValidationToStatisticalTests(recommendedTests);

    const result = {
      topic: topic.trim(),
      methodologyType: validMethodologyType,
      modelType: validModelType,
      sampleSize,
      itemCount,
      ruleBasedValidation,
      ruleBasedModelValidation,
      sampleAdequacyWarnings,
      excludedValidationMethods,
      linkedStatisticalTests,
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
          : "Failed to recommend validation strategy",
    };
  }
}

export async function getValidationLibrary() {
  return { success: true, data: VALIDATION_LIBRARY };
}

export async function getModelValidationLibrary() {
  return { success: true, data: MODEL_VALIDATION_LIBRARY };
}

export async function getSupportedModelTypes() {
  return {
    success: true,
    data: VALID_MODEL_TYPES.map((type) => ({ id: type, label: type })),
  };
}