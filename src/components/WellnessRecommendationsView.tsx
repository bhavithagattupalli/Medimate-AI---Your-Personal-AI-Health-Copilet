import React, { useState, useEffect } from 'react';
import {
  Heart,
  Droplets,
  Activity,
  Moon,
  Apple,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  XCircle,
  Plus,
  Sliders,
  RefreshCw,
  TrendingUp,
  Utensils,
  Dumbbell,
  CalendarCheck,
  Clock,
  Filter,
  Flame,
  Check,
} from 'lucide-react';
import {
  WellnessRecommendation,
  WellnessPreferences,
  AppLanguage,
  FoodPlanItem,
  FitnessRoutineItem,
  PreventionScreeningItem,
} from '../types';
import {
  fetchWellnessData,
  updateRecommendationStatus,
  addCustomRecommendation,
  updateWellnessPreferences,
} from '../services/api';

interface WellnessRecommendationsViewProps {
  language: AppLanguage;
  onNavigateTab?: (tab: string) => void;
}

export const WellnessRecommendationsView: React.FC<WellnessRecommendationsViewProps> = ({
  language,
}) => {
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [preferences, setPreferences] = useState<WellnessPreferences>({
    hydrationGoalMl: 2800,
    sleepGoalHours: 7.5,
    dailyStepsGoal: 6000,
    focusAreas: ['Cardiovascular Health', 'Blood Sugar Balance'],
    reminderFrequency: 'twice_daily',
  });

  const [topTab, setTopTab] = useState<'habits' | 'food' | 'fitness' | 'screenings'>('habits');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg' | 'eggetarian'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'no_equipment' | 'yoga_mat' | 'resistance_bands' | 'dumbbells_gym'>('all');

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  // Form states for new custom recommendation
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<WellnessRecommendation['category']>('activity');
  const [newDescription, setNewDescription] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Sample structured food plan items
  const foodPlanItems: FoodPlanItem[] = [
    {
      id: 'food-1',
      mealType: 'breakfast',
      title: 'Steel-Cut Oats with Walnuts & Ground Cinnamon',
      description: 'Slow-digesting complex carbs with alpha-linolenic omega-3s and cinnamaldehyde for insulin receptor sensitivity.',
      caloriesApprox: 320,
      glycemicIndex: 'low',
      dietType: 'veg',
      nutritionalHighlight: '7g Fiber • Low Glycemic Index • Heart Healthy',
      allergens: ['Tree Nuts'],
    },
    {
      id: 'food-2',
      mealType: 'lunch',
      title: 'Quinoa / Brown Rice Khichdi with Mixed Greens & Moong Dal',
      description: 'Rich in plant-based proteins, potassium, and magnesium. Supports steady postprandial glucose curve.',
      caloriesApprox: 460,
      glycemicIndex: 'low',
      dietType: 'veg',
      nutritionalHighlight: '18g Protein • Potassium Rich • Gluten-Free',
      allergens: [],
    },
    {
      id: 'food-3',
      mealType: 'snack',
      title: 'Roasted Chana (Bengal Gram) & Green Tea with Mint',
      description: 'High-satiety protein snack rich in bioactive flavonoids to suppress cortisol spikes and appetite.',
      caloriesApprox: 160,
      glycemicIndex: 'low',
      dietType: 'veg',
      nutritionalHighlight: '9g Plant Protein • Antioxidants',
      allergens: [],
    },
    {
      id: 'food-4',
      mealType: 'dinner',
      title: 'Steamed Methi Tofu / Paneer Curry with Sautéed Bottle Gourd (Lauki)',
      description: 'Fenugreek leaves contain soluble galactomannan fiber that slows down sugar absorption while resting.',
      caloriesApprox: 380,
      glycemicIndex: 'low',
      dietType: 'veg',
      nutritionalHighlight: '22g Protein • Low Sodium (<300mg)',
      allergens: ['Soy (if Tofu)'],
    },
    {
      id: 'food-5',
      mealType: 'dinner',
      title: 'Herb Grilled Salmon / Rohu Fish with Steamed Vegetables',
      description: 'High in bioavailable EPA and DHA fatty acids to reduce serum triglycerides and vascular inflammation.',
      caloriesApprox: 420,
      glycemicIndex: 'low',
      dietType: 'non-veg',
      nutritionalHighlight: '32g Lean Protein • Rich in EPA/DHA Omega-3',
      allergens: ['Fish'],
    },
  ];

  // Fitness & Exercise Routines
  const fitnessRoutines: FitnessRoutineItem[] = [
    {
      id: 'fit-1',
      title: 'Surya Namaskar & Joint Mobility Warmup',
      equipment: 'yoga_mat',
      durationMinutes: 15,
      targetArea: 'Full Body & Spine Flexibility',
      intensity: 'gentle',
      description: 'Flow through 6 gentle sun salutations focusing on synchronous diaphragmatic breathing to lower sympathetic tone.',
      safeForConditions: ['Hypertension', 'Pre-diabetes', 'Sedentary Lifestyle'],
    },
    {
      id: 'fit-2',
      title: 'Low-Impact Brisk Walking Interval',
      equipment: 'no_equipment',
      durationMinutes: 30,
      targetArea: 'Cardiorespiratory Endurance & Calf Muscle Pump',
      intensity: 'moderate',
      description: 'Maintain a 100-110 steps per minute pace in an open garden or indoor corridor to stimulate GLUT4 glucose transporters.',
      safeForConditions: ['Mild Knee Osteoarthritis', 'Post-MI Rehabilitation', 'All Ages'],
    },
    {
      id: 'fit-3',
      title: 'Seated Resistance Band Rows & Chest Expansions',
      equipment: 'resistance_bands',
      durationMinutes: 20,
      targetArea: 'Upper Back, Rhomboids & Posture',
      intensity: 'moderate',
      description: '3 sets of 12 controlled reps. Builds functional upper-body strength without joint compression.',
      safeForConditions: ['Lumbar Spondylosis', 'Desk-Bound Posture'],
    },
    {
      id: 'fit-4',
      title: 'Isometric Wall Sit & Core Glute Bridges',
      equipment: 'no_equipment',
      durationMinutes: 15,
      targetArea: 'Quadriceps, Glutes & Pelvic Stability',
      intensity: 'moderate',
      description: 'Hold wall sit for 30s x 3 sets, followed by 15 controlled glute bridges. Increases resting metabolic rate.',
      safeForConditions: ['Metabolic Syndrome', 'Balance Enhancement'],
    },
    {
      id: 'fit-5',
      title: 'Light Dumbbell Overhead Press & Squats (Gym / Home)',
      equipment: 'dumbbells_gym',
      durationMinutes: 25,
      targetArea: 'Compound Lower & Upper Body Strength',
      intensity: 'vigorous',
      description: 'Use 2-5kg dumbbells for compound multi-joint movements to enhance insulin sensitivity and bone density.',
      safeForConditions: ['Age < 65 with Normal Blood Pressure'],
    },
  ];

  // Preventative Health Screening Schedule
  const preventionScreenings: PreventionScreeningItem[] = [
    {
      id: 'scr-1',
      name: 'Fasting Lipid Profile (Total, HDL, LDL, Triglycerides)',
      targetGroup: 'Adults aged 35+ or with cardiovascular risk factors',
      frequency: 'Every 6-12 Months',
      purpose: 'Identifies dyslipidemia and calculates atherosclerotic cardiovascular risk (ASCVD).',
      lastDoneDate: '18 Oct 2026',
      nextDueDate: '18 Apr 2027',
      status: 'completed',
    },
    {
      id: 'scr-2',
      name: 'HbA1c & Fasting Plasma Glucose',
      targetGroup: 'Prediabetes or Family History of Diabetes',
      frequency: 'Every 3 Months',
      purpose: 'Measures 90-day average blood sugar control without being affected by acute daily meals.',
      lastDoneDate: '18 Oct 2026',
      nextDueDate: '18 Jan 2027',
      status: 'scheduled',
    },
    {
      id: 'scr-3',
      name: 'Comprehensive Eye Fundus & Diabetic Retinopathy Check',
      targetGroup: 'Adults aged 40+ or Hypertensive / Diabetic patients',
      frequency: 'Annual',
      purpose: 'Examines microvascular retinal vessels to detect early retinopathy or hypertensive changes.',
      lastDoneDate: '10 Nov 2025',
      nextDueDate: '10 Nov 2026',
      status: 'due',
    },
    {
      id: 'scr-4',
      name: 'Quarterly In-Clinic Blood Pressure Triplicate Check',
      targetGroup: 'Essential Hypertension or Borderline High BP',
      frequency: 'Every 3 Months',
      purpose: 'Standardized seated measurement to verify anti-hypertensive efficacy and renal protection.',
      lastDoneDate: '15 Jun 2026',
      nextDueDate: '15 Oct 2026',
      status: 'due',
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchWellnessData();
      setRecommendations(data.recommendations);
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to load wellness data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: WellnessRecommendation['status']) => {
    try {
      await updateRecommendationStatus(id, newStatus);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert('Failed to update recommendation status');
    }
  };

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const added = await addCustomRecommendation({
        category: newCategory,
        title: newTitle.trim(),
        description: newDescription.trim(),
        rationale: newRationale.trim() || 'Customized lifestyle recommendation',
        targetValue: newTarget.trim() || undefined,
        priority: 'medium',
        frequency: 'daily',
      });
      setRecommendations((prev) => [added, ...prev]);
      setShowAddModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewRationale('');
      setNewTarget('');
    } catch (err) {
      alert('Failed to add custom goal');
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateWellnessPreferences(preferences);
      setPreferences(updated);
      setShowPrefsModal(false);
    } catch (err) {
      alert('Failed to update preferences');
    }
  };

  const categories = [
    { id: 'all', label: language === 'te' ? 'అన్నీ' : 'All Categories', icon: Sparkles },
    { id: 'hydration', label: language === 'te' ? 'హైడ్రేషన్' : 'Hydration', icon: Droplets },
    { id: 'activity', label: language === 'te' ? 'వ్యాయామం' : 'Physical Activity', icon: Activity },
    { id: 'sleep', label: language === 'te' ? 'నిద్ర & విశ్రాంతి' : 'Sleep Hygiene', icon: Moon },
    { id: 'nutrition', label: language === 'te' ? 'పోషకాహారం' : 'Nutrition', icon: Apple },
    { id: 'preventive', label: language === 'te' ? 'నివారణ తనిఖీలు' : 'Preventive Care', icon: ShieldCheck },
  ];

  const filteredHabits = recommendations.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const filteredFood = foodPlanItems.filter((f) => {
    if (dietFilter === 'all') return true;
    return f.dietType === dietFilter;
  });

  const filteredFitness = fitnessRoutines.filter((f) => {
    if (equipmentFilter === 'all') return true;
    return f.equipment === equipmentFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 text-teal-700" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'te' ? 'ఆరోగ్య & జీవనశైలి సిఫార్సులు' : 'Wellness & Preventive Performance Engine'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Personalized evidence-based nutrition plans, equipment-aware exercise routines, and preventive clinical screening schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrefsModal(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'te' ? 'లక్ష్యాలను సర్దుబాటు చేయండి' : 'Configure Goals'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'కొత్త లక్ష్యం' : 'Add Custom Target'}</span>
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Daily Hydration</span>
            </span>
            <span className="text-xs font-bold text-sky-600">64%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">1,800</span>
            <span className="text-xs text-slate-500 font-medium">/ {preferences.hydrationGoalMl} ml</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((1800 / preferences.hydrationGoalMl) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Active Steps</span>
            </span>
            <span className="text-xs font-bold text-emerald-600">70%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">4,200</span>
            <span className="text-xs text-slate-500 font-medium">/ {preferences.dailyStepsGoal} steps</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((4200 / preferences.dailyStepsGoal) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Restorative Sleep</span>
            </span>
            <span className="text-xs font-bold text-indigo-600">86%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">6.5</span>
            <span className="text-xs text-slate-500 font-medium">/ {preferences.sleepGoalHours} hrs</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((6.5 / preferences.sleepGoalHours) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 4 Performance Modules Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setTopTab('habits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            topTab === 'habits'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Daily Habits & Goals</span>
        </button>

        <button
          onClick={() => setTopTab('food')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            topTab === 'food'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Food Plan & Nutrition</span>
        </button>

        <button
          onClick={() => setTopTab('fitness')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            topTab === 'fitness'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Fitness & Workouts (Equipment Filter)</span>
        </button>

        <button
          onClick={() => setTopTab('screenings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            topTab === 'screenings'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Preventive Screenings</span>
        </button>
      </div>

      {/* MODULE 1: Daily Habits & Goals */}
      {topTab === 'habits' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((item) => {
              const isCompleted = item.status === 'completed';
              const isSaved = item.status === 'saved';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between shadow-xs ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.priority} priority
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.description}</p>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 mb-3">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase mb-0.5">Clinical Rationale:</span>
                      <span className="italic leading-relaxed">{item.rationale}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleStatusChange(item.id, isCompleted ? 'active' : 'completed')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isCompleted
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(item.id, 'dismissed')}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 2: Food Plan & Nutrition */}
      {topTab === 'food' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Low-Glycemic Cardioprotective Food Plan</h2>
              <p className="text-xs text-slate-500">
                Tailored for stable blood glucose, healthy lipid balance, and sustainable daytime energy.
              </p>
            </div>

            {/* Diet Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['all', 'veg', 'non-veg', 'eggetarian'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDietFilter(mode)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition ${
                    dietFilter === mode ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {mode === 'all' ? 'All Diets' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFood.map((food) => (
              <div key={food.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {food.mealType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                      GI: {food.glycemicIndex.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      <span>~{food.caloriesApprox} kcal</span>
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{food.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{food.description}</p>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex items-center justify-between text-slate-700 font-medium">
                  <span>{food.nutritionalHighlight}</span>
                  {food.allergens.length > 0 && (
                    <span className="text-[10px] text-rose-600 font-bold">Contains: {food.allergens.join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 3: Fitness & Workouts with Equipment Filter */}
      {topTab === 'fitness' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Customized Physical Activity & Exercise Routines</h2>
              <p className="text-xs text-slate-500">
                Filter routines based on equipment available at home, park, or gym.
              </p>
            </div>

            {/* Equipment Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Equipment' },
                { id: 'no_equipment', label: 'No Equipment (Bodyweight)' },
                { id: 'yoga_mat', label: 'Yoga Mat' },
                { id: 'resistance_bands', label: 'Resistance Bands' },
                { id: 'dumbbells_gym', label: 'Dumbbells / Gym' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setEquipmentFilter(opt.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    equipmentFilter === opt.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFitness.map((fit) => (
              <div key={fit.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {fit.equipment.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200 capitalize">
                      {fit.intensity}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{fit.durationMinutes} mins</span>
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{fit.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{fit.description}</p>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Focus & Clinical Clearance:</span>
                  <p className="text-slate-800 font-semibold">{fit.targetArea}</p>
                  <p className="text-[11px] text-emerald-700">Safe for: {fit.safeForConditions.join(' • ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: Preventive Screenings */}
      {topTab === 'screenings' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Preventative Clinical Screening Tracker</h2>
              <p className="text-xs text-slate-500">
                Scheduled surveillance checks recommended by clinical guidelines based on age and health profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {preventionScreenings.map((scr) => (
              <div key={scr.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{scr.name}</h3>
                    <p className="text-xs text-slate-500">Frequency: <strong className="text-slate-700">{scr.frequency}</strong> • Target: {scr.targetGroup}</p>
                  </div>

                  <div>
                    {scr.status === 'completed' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed ({scr.lastDoneDate})
                      </span>
                    ) : scr.status === 'due' ? (
                      <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-600" /> Screening Due
                      </span>
                    ) : (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" /> Scheduled for {scr.nextDueDate}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{scr.purpose}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Next Due Date: <strong className="text-slate-800">{scr.nextDueDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Recommendation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {language === 'te' ? 'కొత్త ఆరోగ్య లక్ష్యాన్ని చేర్చండి' : 'Create Custom Wellness Target'}
            </h3>
            <form onSubmit={handleCreateRecommendation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 15-Minute Morning Yoga Stretches"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="activity">Physical Activity</option>
                  <option value="hydration">Hydration</option>
                  <option value="sleep">Sleep Hygiene</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="stress">Stress Management</option>
                  <option value="preventive">Preventive Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the healthy action..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Rationale</label>
                <input
                  type="text"
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  placeholder="Why is this beneficial?"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wellness Preferences Modal */}
      {showPrefsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {language === 'te' ? 'ఆరోగ్య లక్ష్యాలను సర్దుబాటు చేయండి' : 'Configure Personal Health Targets'}
            </h3>
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Hydration Goal (ml)</label>
                <input
                  type="number"
                  step="100"
                  value={preferences.hydrationGoalMl}
                  onChange={(e) => setPreferences({ ...preferences, hydrationGoalMl: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nightly Sleep Goal (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={preferences.sleepGoalHours}
                  onChange={(e) => setPreferences({ ...preferences, sleepGoalHours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Steps Target</label>
                <input
                  type="number"
                  step="500"
                  value={preferences.dailyStepsGoal}
                  onChange={(e) => setPreferences({ ...preferences, dailyStepsGoal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrefsModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
