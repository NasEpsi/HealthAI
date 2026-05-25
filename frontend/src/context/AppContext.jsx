import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "healthai_coach";

const defaultProfile = {
  email: "",
  name: "",
  age: 30,
  sex: "Femme",
  height: 170,
  weight: 65,
  activityLevel: "Modéré",
  goal: "Équilibre nutritionnel",
  allergies: "",
  dietTags: [],
  preferences: "",
  budget: 50,
  sportLevel: "Débutant",
  equipment: "Aucun équipement",
  sessionMinutes: 45,
  sessionsPerWeek: 3,
  injuries: "",
  targetCalories: 2172,
  onboardingComplete: false,
};

const defaultDaily = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const AppContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [daily, setDaily] = useState(defaultDaily);
  const [meals, setMeals] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [sportProgram, setSportProgram] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setIsAuthenticated(saved.isAuthenticated ?? false);
      setProfile({ ...defaultProfile, ...saved.profile });
      setDaily({ ...defaultDaily, ...saved.daily });
      setMeals(saved.meals ?? []);
      setMealPlan(saved.mealPlan ?? null);
      setSportProgram(saved.sportProgram ?? null);
    }
  }, []);

  useEffect(() => {
    saveState({
      isAuthenticated,
      profile,
      daily,
      meals,
      mealPlan,
      sportProgram,
    });
  }, [isAuthenticated, profile, daily, meals, mealPlan, sportProgram]);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const login = useCallback((email, password) => {
    if (!email || !password) return false;
    setProfile((p) => ({ ...p, email }));
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback((updates) => {
    setProfile((p) => ({ ...p, ...updates }));
  }, []);

  const completeOnboarding = useCallback((data) => {
    const targetCalories = calculateCalories(data);
    setProfile((p) => ({
      ...p,
      ...data,
      targetCalories,
      onboardingComplete: true,
    }));
    setIsAuthenticated(true);
  }, []);

  const addMeal = useCallback((meal) => {
    const newMeal = { ...meal, id: Date.now(), date: new Date().toISOString() };
    setMeals((m) => [newMeal, ...m]);
    setDaily((d) => ({
      calories: d.calories + (meal.calories || 0),
      protein: d.protein + (meal.protein || 0),
      carbs: d.carbs + (meal.carbs || 0),
      fat: d.fat + (meal.fat || 0),
    }));
    showToast("Repas enregistré !");
  }, [showToast]);

  const generateMealPlan = useCallback(() => {
    const plan = buildMealPlan(profile.targetCalories);
    setMealPlan(plan);
    showToast("Plan de repas généré !");
  }, [profile.targetCalories, showToast]);

  const deleteMealPlan = useCallback(() => {
    setMealPlan(null);
  }, []);

  const generateSportProgram = useCallback(() => {
    const program = buildSportProgram(profile);
    setSportProgram(program);
    showToast("Programme généré !");
  }, [profile, showToast]);

  const deleteSportProgram = useCallback(() => {
    setSportProgram(null);
  }, []);

  const macroTargets = {
    protein: Math.round((profile.targetCalories * 0.3) / 4),
    carbs: Math.round((profile.targetCalories * 0.45) / 4),
    fat: Math.round((profile.targetCalories * 0.25) / 9),
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        profile,
        daily,
        meals,
        mealPlan,
        sportProgram,
        macroTargets,
        toast,
        login,
        logout,
        updateProfile,
        completeOnboarding,
        addMeal,
        generateMealPlan,
        deleteMealPlan,
        generateSportProgram,
        deleteSportProgram,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="toast">
          <span>✓</span> {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function calculateCalories(data) {
  const weight = Number(data.weight) || 65;
  const height = Number(data.height) || 170;
  const age = Number(data.age) || 30;
  const sexFactor = data.sex === "Homme" ? 5 : -161;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexFactor;
  const activityMap = {
    Sédentaire: 1.2,
    Léger: 1.375,
    Modéré: 1.55,
    Actif: 1.725,
    "Très actif": 1.9,
  };
  const factor = activityMap[data.activityLevel] || 1.55;
  let tdee = Math.round(bmr * factor);
  const goalMap = {
    "Perte de poids": -400,
    "Prise de masse": 300,
    "Équilibre nutritionnel": 0,
    "Performance sportive": 200,
    Maintien: 0,
  };
  tdee += goalMap[data.goal] ?? 0;
  return Math.max(1200, tdee);
}

function buildMealPlan(calories) {
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const mealsByDay = {
    Lundi: [
      { type: "Petit-Déj", name: "Flocons d'avoine aux fruits et noix", kcal: 350, desc: "Avoine, banane, amandes, lait" },
      { type: "Déjeuner", name: "Salade de quinoa et légumes grillés", kcal: 450, desc: "Quinoa, courgette, poivron, feta" },
      { type: "Dîner", name: "Saumon grillé et brocoli", kcal: 500, desc: "Saumon, brocoli, riz complet" },
      { type: "Collation", name: "Yaourt grec et miel", kcal: 200, desc: "Yaourt, miel, noix" },
    ],
    Mardi: [
      { type: "Petit-Déj", name: "Smoothie protéiné", kcal: 320, desc: "Banane, protéine, épinards" },
      { type: "Déjeuner", name: "Wrap poulet et avocat", kcal: 480, desc: "Tortilla, poulet, avocat, salade" },
      { type: "Dîner", name: "Curry de lentilles", kcal: 420, desc: "Lentilles, lait de coco, épices" },
      { type: "Collation", name: "Pomme et beurre d'amande", kcal: 180, desc: "Pomme, beurre d'amande" },
    ],
    Mercredi: [
      { type: "Petit-Déj", name: "Œufs brouillés et pain complet", kcal: 380, desc: "Œufs, pain, tomates" },
      { type: "Déjeuner", name: "Bowl méditerranéen", kcal: 460, desc: "Pois chiches, houmous, légumes" },
      { type: "Dîner", name: "Pâtes complètes aux légumes", kcal: 490, desc: "Pâtes, tomates, basilic" },
      { type: "Collation", name: "Barre granola maison", kcal: 210, desc: "Avoine, miel, fruits secs" },
    ],
    Jeudi: [
      { type: "Petit-Déj", name: "Pancakes protéinés", kcal: 340, desc: "Farine d'avoine, banane, œuf" },
      { type: "Déjeuner", name: "Buddha bowl tofu", kcal: 440, desc: "Tofu, riz, edamame" },
      { type: "Dîner", name: "Poulet rôti et patate douce", kcal: 510, desc: "Poulet, patate douce, haricots" },
      { type: "Collation", name: "Fromage blanc et fruits rouges", kcal: 190, desc: "Fromage blanc, framboises" },
    ],
    Vendredi: [
      { type: "Petit-Déj", name: "Granola et yaourt", kcal: 360, desc: "Granola, yaourt, myrtilles" },
      { type: "Déjeuner", name: "Salade César légère", kcal: 430, desc: "Laitue, poulet, parmesan" },
      { type: "Dîner", name: "Tacos poisson", kcal: 470, desc: "Tortilla, poisson blanc, salsa" },
      { type: "Collation", name: "Smoothie vert", kcal: 170, desc: "Kiwi, épinards, pomme" },
    ],
    Samedi: [
      { type: "Petit-Déj", name: "Toast avocat et œuf", kcal: 390, desc: "Pain, avocat, œuf poché" },
      { type: "Déjeuner", name: "Risotto aux champignons", kcal: 480, desc: "Riz arborio, champignons" },
      { type: "Dîner", name: "Burger végétal maison", kcal: 520, desc: "Steak végétal, pain, salade" },
      { type: "Collation", name: "Mix fruits secs", kcal: 200, desc: "Amandes, raisins, noix" },
    ],
    Dimanche: [
      { type: "Petit-Déj", name: "Brunch complet", kcal: 420, desc: "Œufs, bacon, pancakes" },
      { type: "Déjeuner", name: "Soupe de légumes et pain", kcal: 380, desc: "Légumes de saison, pain" },
      { type: "Dîner", name: "Lasagnes légères", kcal: 500, desc: "Pâtes, bœuf maigre, légumes" },
      { type: "Collation", name: "Chocolat noir et noix", kcal: 220, desc: "Chocolat 70%, noix" },
    ],
  };

  return {
    title: `Plan de repas hebdomadaire pour un régime équilibré (${calories} kcal)`,
    days: days.map((day) => ({ day, meals: mealsByDay[day] })),
  };
}

function buildSportProgram(profile) {
  return {
    title: "Programme de Stabilité Débutant",
    description: `Programme adapté à votre niveau (${profile.sportLevel}), ${profile.sessionsPerWeek} séances par semaine de ${profile.sessionMinutes} minutes.`,
    sessions: [
      {
        title: "Séance 1 : Fondations et Équilibre Statique",
        subtitle: "Renforcement musculaire général et proprioception - 45 min",
        exercises: [
          { name: "Squats au poids du corps", stats: "3 x 8-12 - repos 60s", note: "Concentrez-vous sur la forme, genoux alignés avec les pieds." },
          { name: "Fentes avant alternées", stats: "3 x 10 par jambe - repos 45s", note: "Gardez le buste droit, abaissez jusqu'à 90°." },
          { name: "Planche", stats: "3 x 30-45s - repos 30s", note: "Corps aligné, abdos et fessiers engagés." },
          { name: "Pont fessier", stats: "3 x 12-15 - repos 45s", note: "Serrez les fessiers en haut du mouvement." },
        ],
      },
      {
        title: "Séance 2 : Force Fonctionnelle",
        subtitle: "Mouvements composés et endurance musculaire - 45 min",
        exercises: [
          { name: "Pompes (genoux si besoin)", stats: "3 x 8-12 - repos 60s", note: "Coudes à 45°, corps gainé." },
          { name: "Rowing avec élastique", stats: "3 x 12-15 - repos 45s", note: "Tirez vers la poitrine, omoplates serrées." },
          { name: "Step-ups sur banc", stats: "3 x 10 par jambe - repos 45s", note: "Montez en poussant sur le talon." },
          { name: "Dead bug", stats: "3 x 10 par côté - repos 30s", note: "Bas du dos collé au sol." },
        ],
      },
      {
        title: "Séance 3 : Mobilité et Récupération Active",
        subtitle: "Étirements dynamiques et renforcement léger - 45 min",
        exercises: [
          { name: "Cat-cow", stats: "2 x 10 - fluide", note: "Mobilisez la colonne vertébrale." },
          { name: "Hip circles", stats: "2 x 10 par sens", note: "Hanches détendues, mouvement contrôlé." },
          { name: "Goblet squat léger", stats: "3 x 10 - repos 45s", note: "Utilisez un poids léger ou une bouteille d'eau." },
          { name: "Étirement ischio-jambiers", stats: "3 x 30s par jambe", note: "Respirez profondément, sans forcer." },
        ],
      },
    ],
  };
}
