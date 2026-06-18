import { storageGet, storageSet } from "./storage";

export const TIERS = {
  FREEMIUM: "freemium",
  PREMIUM: "premium",
  PREMIUM_PLUS: "premium_plus",
  B2B: "b2b",
};

export const PLANS = [
  {
    id: TIERS.FREEMIUM,
    name: "Freemium",
    price: "Gratuit",
    priceDetail: "Accès de base",
    description: "Découvrez HealthAI Coach et suivez vos habitudes au quotidien.",
    features: [
      "Journal alimentaire",
      "Suivi d'activité",
      "Calcul d'IMC",
      "Tableaux de progression simples",
      "Fil social communautaire",
    ],
    cta: "Plan actuel",
    highlight: false,
  },
  {
    id: TIERS.PREMIUM,
    name: "Premium",
    price: "9,99 €",
    priceDetail: "/ mois",
    description: "Recommandations IA et plans personnalisés pour atteindre vos objectifs.",
    features: [
      "Tout le Freemium",
      "Recommandations personnalisées par IA",
      "Plans nutritionnels détaillés",
      "Programmes sportifs détaillés",
      "Suivi fin des objectifs",
      "Scanner de repas IA",
    ],
    cta: "Passer Premium",
    highlight: true,
  },
  {
    id: TIERS.PREMIUM_PLUS,
    name: "Premium+",
    price: "19,99 €",
    priceDetail: "/ mois",
    description: "Suivi avancé et accompagnement professionnel.",
    features: [
      "Tout le Premium",
      "Données biométriques (montre, balance, sommeil)",
      "Synchronisation objets connectés",
      "Consultations en ligne nutritionnistes partenaires",
      "Tableaux de bord avancés",
    ],
    cta: "Passer Premium+",
    highlight: false,
  },
  {
    id: TIERS.B2B,
    name: "B2B",
    price: "Sur devis",
    priceDetail: "Marque blanche",
    description: "Intégrez la plateforme sous votre marque pour vos adhérents ou collaborateurs.",
    features: [
      "Distribution en marque blanche",
      "Salles de sport & fitness",
      "Mutuelles & assurances",
      "Entreprises & RH",
      "Tableau de bord administrateur",
      "Support dédié & personnalisation",
    ],
    cta: "Nous contacter",
    highlight: false,
    isB2B: true,
  },
];

const TIER_RANK = {
  [TIERS.FREEMIUM]: 0,
  [TIERS.PREMIUM]: 1,
  [TIERS.PREMIUM_PLUS]: 2,
  [TIERS.B2B]: 3,
};

const TIER_FEATURES = {
  [TIERS.FREEMIUM]: new Set([
    "journal",
    "activity",
    "bmi",
    "progress_charts",
    "social_feed",
  ]),
  [TIERS.PREMIUM]: new Set([
    "journal",
    "activity",
    "bmi",
    "progress_charts",
    "social_feed",
    "ai_recommendations",
    "detailed_meal_plans",
    "detailed_sport_plans",
    "goal_tracking",
    "meal_scanner",
  ]),
  [TIERS.PREMIUM_PLUS]: new Set([
    "journal",
    "activity",
    "bmi",
    "progress_charts",
    "social_feed",
    "ai_recommendations",
    "detailed_meal_plans",
    "detailed_sport_plans",
    "goal_tracking",
    "meal_scanner",
    "biometrics",
    "connected_devices",
    "nutritionist_consultations",
    "advanced_dashboards",
  ]),
  [TIERS.B2B]: new Set([
    "journal",
    "activity",
    "bmi",
    "progress_charts",
    "social_feed",
    "ai_recommendations",
    "detailed_meal_plans",
    "detailed_sport_plans",
    "goal_tracking",
    "meal_scanner",
    "biometrics",
    "connected_devices",
    "nutritionist_consultations",
    "advanced_dashboards",
    "white_label",
    "admin_dashboard",
  ]),
};

function subscriptionKey(userId) {
  return `healthai_subscription_${userId}`;
}

export async function loadSubscription(userId) {
  if (!userId) return TIERS.FREEMIUM;
  const raw = await storageGet(subscriptionKey(userId));
  if (!raw || !TIER_FEATURES[raw]) return TIERS.FREEMIUM;
  return raw;
}

export async function saveSubscription(userId, tier) {
  if (!userId || !TIER_FEATURES[tier]) return;
  await storageSet(subscriptionKey(userId), tier);
}

export function hasFeature(tier, feature) {
  return TIER_FEATURES[tier]?.has(feature) ?? false;
}

export function tierLabel(tier) {
  const plan = PLANS.find((p) => p.id === tier);
  return plan?.name ?? "Freemium";
}

export function isTierAtLeast(tier, minimumTier) {
  return (TIER_RANK[tier] ?? 0) >= (TIER_RANK[minimumTier] ?? 0);
}
