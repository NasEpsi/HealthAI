import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  changePassword,
  appDataKey,
} from "../services/auth";
import { storageGet, storageSet } from "../services/storage";
import {
  loadThemePreference,
  saveThemePreference,
  resolveTheme,
  applyTheme,
} from "../services/theme";
import { syncSocialProfile } from "../services/social";

const defaultProfile = {
  email: "",
  name: "",
  age: 30,
  sex: "Femme",
  height: 170,
  weight: 65,
  activityLevel: "Mod?r?",
  goal: "?quilibre nutritionnel",
  allergies: "",
  dietTags: [],
  preferences: "",
  budget: 50,
  sportLevel: "D?butant",
  equipment: "Aucun ?quipement",
  sessionMinutes: 45,
  sessionsPerWeek: 3,
  injuries: "",
  targetCalories: 2172,
  onboardingComplete: false,
};

const defaultDaily = { calories: 0, protein: 0, carbs: 0, fat: 0 };

const AppContext = createContext(null);

async function loadUserAppData(userId) {
  const raw = await storageGet(appDataKey(userId));
  if (!raw) return { daily: defaultDaily, meals: [], mealPlan: null, sportProgram: null };
  try {
    const data = JSON.parse(raw);
    return {
      daily: { ...defaultDaily, ...data.daily },
      meals: data.meals ?? [],
      mealPlan: data.mealPlan ?? null,
      sportProgram: data.sportProgram ?? null,
    };
  } catch {
    return { daily: defaultDaily, meals: [], mealPlan: null, sportProgram: null };
  }
}

async function saveUserAppData(userId, data) {
  await storageSet(appDataKey(userId), JSON.stringify(data));
}

async function pushSocialProfile(user, onError) {
  try {
    await syncSocialProfile(user.id, {
      email: user.profile?.email || user.email,
      name: user.profile?.name || "Utilisateur",
      avatar_url: user.avatar ?? null,
    });
  } catch (err) {
    onError?.(`Profil social non synchronis? : ${err.message || "backend indisponible"}`);
  }
}

export function AppProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [daily, setDaily] = useState(defaultDaily);
  const [meals, setMeals] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [sportProgram, setSportProgram] = useState(null);
  const [toast, setToast] = useState(null);
  const [themePreference, setThemePreference] = useState(loadThemePreference);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const hydrateUser = useCallback(async (user) => {
    const appData = await loadUserAppData(user.id);
    setUserId(user.id);
    setAvatar(user.avatar ?? null);
    setProfile({ ...defaultProfile, ...user.profile });
    setDaily(appData.daily);
    setMeals(appData.meals);
    setMealPlan(appData.mealPlan);
    setSportProgram(appData.sportProgram);
    setIsAuthenticated(true);
    await pushSocialProfile(user, showToast);
  }, [showToast]);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user) await hydrateUser(user);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [hydrateUser]);

  useEffect(() => {
    if (!userId) return;
    saveUserAppData(userId, { daily, meals, mealPlan, sportProgram });
  }, [userId, daily, meals, mealPlan, sportProgram]);

  useEffect(() => {
    applyTheme(resolveTheme(themePreference));
    saveThemePreference(themePreference);
  }, [themePreference]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (themePreference === "system") {
        applyTheme(resolveTheme("system"));
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themePreference]);

  const login = useCallback(
    async (email, password) => {
      const user = await loginUser(email, password);
      await hydrateUser(user);
      return user.profile;
    },
    [hydrateUser]
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setUserId(null);
    setAvatar(null);
    setProfile(defaultProfile);
    setDaily(defaultDaily);
    setMeals([]);
    setMealPlan(null);
    setSportProgram(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!profile.email) return;
      const user = await updateUserProfile(profile.email, updates);
      setProfile({ ...defaultProfile, ...user.profile });
      await pushSocialProfile(user, showToast);
    },
    [profile.email, showToast]
  );

  const setUserAvatar = useCallback(
    async (dataUrl) => {
      if (!profile.email) return;
      const user = await updateUserAvatar(profile.email, dataUrl);
      setAvatar(user.avatar);
      await pushSocialProfile(user, showToast);
    },
    [profile.email, showToast]
  );

  const updatePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!profile.email) return;
      await changePassword(profile.email, currentPassword, newPassword);
    },
    [profile.email]
  );

  const completeOnboarding = useCallback(
    async (data) => {
      const targetCalories = calculateCalories(data);
      const profileData = {
        ...data,
        targetCalories,
        onboardingComplete: true,
      };

      const user = await registerUser({
        email: data.email,
        password: data.password,
        profile: profileData,
      });

      await hydrateUser(user);
      return user;
    },
    [hydrateUser]
  );

  const addMeal = useCallback(
    (meal) => {
      const newMeal = { ...meal, id: Date.now(), date: new Date().toISOString() };
      setMeals((m) => [newMeal, ...m]);
      setDaily((d) => ({
        calories: d.calories + (meal.calories || 0),
        protein: d.protein + (meal.protein || 0),
        carbs: d.carbs + (meal.carbs || 0),
        fat: d.fat + (meal.fat || 0),
      }));
      showToast("Repas enregistr? !");
    },
    [showToast]
  );

  const generateMealPlan = useCallback(() => {
    const plan = buildMealPlan(profile.targetCalories);
    setMealPlan(plan);
    showToast("Plan de repas g?n?r? !");
  }, [profile.targetCalories, showToast]);

  const deleteMealPlan = useCallback(() => setMealPlan(null), []);

  const generateSportProgram = useCallback(() => {
    const program = buildSportProgram(profile);
    setSportProgram(program);
    showToast("Programme généré !");
  }, [profile, showToast]);

  const deleteSportProgram = useCallback(() => setSportProgram(null), []);

  const macroTargets = {
    protein: Math.round((profile.targetCalories * 0.3) / 4),
    carbs: Math.round((profile.targetCalories * 0.45) / 4),
    fat: Math.round((profile.targetCalories * 0.25) / 9),
  };

  return (
    <AppContext.Provider
      value={{
        authLoading,
        isAuthenticated,
        userId,
        avatar,
        profile,
        daily,
        meals,
        mealPlan,
        sportProgram,
        macroTargets,
        themePreference,
        setThemePreference,
        toast,
        login,
        logout,
        updateProfile,
        setUserAvatar,
        updatePassword,
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
          <span>?</span> {toast}
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
    "S?dentaire": 1.2,
    "L?ger": 1.375,
    "Mod?r?": 1.55,
    "Actif": 1.725,
    "Tr?s actif": 1.9,
  };
  const factor = activityMap[data.activityLevel] || 1.55;
  let tdee = Math.round(bmr * factor);
  const goalMap = {
    "Perte de poids": -400,
    "Prise de masse": 300,
    "?quilibre nutritionnel": 0,
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
      { type: "Petit-D?j", name: "Flocons d'avoine aux fruits et noix", kcal: 350, desc: "Avoine, banane, amandes, lait" },
      { type: "D?jeuner", name: "Salade de quinoa et l?gumes grill?s", kcal: 450, desc: "Quinoa, courgette, poivron, feta" },
      { type: "D?ner", name: "Saumon grill? et brocoli", kcal: 500, desc: "Saumon, brocoli, riz complet" },
      { type: "Collation", name: "Yaourt grec et miel", kcal: 200, desc: "Yaourt, miel, noix" },
    ],
    Mardi: [
      { type: "Petit-D?j", name: "Smoothie prot?in?", kcal: 320, desc: "Banane, prot?ine, ?pinards" },
      { type: "D?jeuner", name: "Wrap poulet et avocat", kcal: 480, desc: "Tortilla, poulet, avocat, salade" },
      { type: "D?ner", name: "Curry de lentilles", kcal: 420, desc: "Lentilles, lait de coco, ?pices" },
      { type: "Collation", name: "Pomme et beurre d'amande", kcal: 180, desc: "Pomme, beurre d'amande" },
    ],
    Mercredi: [
      { type: "Petit-D?j", name: "?ufs brouill?s et pain complet", kcal: 380, desc: "?ufs, pain, tomates" },
      { type: "D?jeuner", name: "Bowl m?diterran?en", kcal: 460, desc: "Pois chiches, houmous, l?gumes" },
      { type: "D?ner", name: "P?tes compl?tes aux l?gumes", kcal: 490, desc: "P?tes, tomates, basilic" },
      { type: "Collation", name: "Barre granola maison", kcal: 210, desc: "Avoine, miel, fruits secs" },
    ],
    Jeudi: [
      { type: "Petit-D?j", name: "Pancakes prot?in?s", kcal: 340, desc: "Farine d'avoine, banane, ?uf" },
      { type: "D?jeuner", name: "Buddha bowl tofu", kcal: 440, desc: "Tofu, riz, edamame" },
      { type: "D?ner", name: "Poulet r?ti et patate douce", kcal: 510, desc: "Poulet, patate douce, haricots" },
      { type: "Collation", name: "Fromage blanc et fruits rouges", kcal: 190, desc: "Fromage blanc, framboises" },
    ],
    Vendredi: [
      { type: "Petit-D?j", name: "Granola et yaourt", kcal: 360, desc: "Granola, yaourt, myrtilles" },
      { type: "D?jeuner", name: "Salade C?sar l?g?re", kcal: 430, desc: "Laitue, poulet, parmesan" },
      { type: "D?ner", name: "Tacos poisson", kcal: 470, desc: "Tortilla, poisson blanc, salsa" },
      { type: "Collation", name: "Smoothie vert", kcal: 170, desc: "Kiwi, ?pinards, pomme" },
    ],
    Samedi: [
      { type: "Petit-D?j", name: "Toast avocat et ?uf", kcal: 390, desc: "Pain, avocat, ?uf poch?" },
      { type: "D?jeuner", name: "Risotto aux champignons", kcal: 480, desc: "Riz arborio, champignons" },
      { type: "D?ner", name: "Burger v?g?tal maison", kcal: 520, desc: "Steak v?g?tal, pain, salade" },
      { type: "Collation", name: "Mix fruits secs", kcal: 200, desc: "Amandes, raisins, noix" },
    ],
    Dimanche: [
      { type: "Petit-D?j", name: "Brunch complet", kcal: 420, desc: "?ufs, bacon, pancakes" },
      { type: "D?jeuner", name: "Soupe de l?gumes et pain", kcal: 380, desc: "L?gumes de saison, pain" },
      { type: "D?ner", name: "Lasagnes l?g?res", kcal: 500, desc: "P?tes, b?uf maigre, l?gumes" },
      { type: "Collation", name: "Chocolat noir et noix", kcal: 220, desc: "Chocolat 70%, noix" },
    ],
  };

  return {
    title: `Plan de repas hebdomadaire pour un r?gime ?quilibr? (${calories} kcal)`,
    days: days.map((day) => ({ day, meals: mealsByDay[day] })),
  };
}

function buildSportProgram(profile) {
  return {
    title: "Programme de Stabilit? D?butant",
    description: `Programme adapt? ? votre niveau (${profile.sportLevel}), ${profile.sessionsPerWeek} s?ances par semaine de ${profile.sessionMinutes} minutes.`,
    sessions: [
      {
        title: "S?ance 1 : Fondations et ?quilibre Statique",
        subtitle: "Renforcement musculaire g?n?ral et proprioception - 45 min",
        exercises: [
          { name: "Squats au poids du corps", stats: "3 x 8-12 - repos 60s", note: "Concentrez-vous sur la forme, genoux align?s avec les pieds." },
          { name: "Fentes avant altern?es", stats: "3 x 10 par jambe - repos 45s", note: "Gardez le buste droit, abaissez jusqu'? 90?." },
          { name: "Planche", stats: "3 x 30-45s - repos 30s", note: "Corps align?, abdos et fessiers engag?s." },
          { name: "Pont fessier", stats: "3 x 12-15 - repos 45s", note: "Serrez les fessiers en haut du mouvement." },
        ],
      },
      {
        title: "S?ance 2 : Force Fonctionnelle",
        subtitle: "Mouvements compos?s et endurance musculaire - 45 min",
        exercises: [
          { name: "Pompes (genoux si besoin)", stats: "3 x 8-12 - repos 60s", note: "Coudes ? 45?, corps gain?." },
          { name: "Rowing avec ?lastique", stats: "3 x 12-15 - repos 45s", note: "Tirez vers la poitrine, omoplates serr?es." },
          { name: "Step-ups sur banc", stats: "3 x 10 par jambe - repos 45s", note: "Montez en poussant sur le talon." },
          { name: "Dead bug", stats: "3 x 10 par c?t? - repos 30s", note: "Bas du dos coll? au sol." },
        ],
      },
      {
        title: "S?ance 3 : Mobilit? et R?cup?ration Active",
        subtitle: "?tirements dynamiques et renforcement l?ger - 45 min",
        exercises: [
          { name: "Cat-cow", stats: "2 x 10 - fluide", note: "Mobilisez la colonne vert?brale." },
          { name: "Hip circles", stats: "2 x 10 par sens", note: "Hanches d?tendues, mouvement contr?l?." },
          { name: "Goblet squat l?ger", stats: "3 x 10 - repos 45s", note: "Utilisez un poids l?ger ou une bouteille d'eau." },
          { name: "?tirement ischio-jambiers", stats: "3 x 30s par jambe", note: "Respirez profond?ment, sans forcer." },
        ],
      },
    ],
  };
}
