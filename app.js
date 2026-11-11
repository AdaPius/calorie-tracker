/**
 * NutriTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * Persistent local browser storage (localStorage)
 * No frameworks, no external libraries.
 */

(function () {
  "use strict";

  // ==========================================================================
  // Storage Keys & Default Configuration
  // ==========================================================================
  const STORAGE_KEYS = {
    ENTRIES: "nutritrack_entries",
    SETTINGS: "nutritrack_settings",
    WATER: "nutritrack_water"
  };

  const DEFAULT_SETTINGS = {
    calorieTarget: 2000,
    proteinTarget: 140,
    carbsTarget: 220,
    fatTarget: 65,
    waterTarget: 2000
  };

  // ==========================================================================
  // Application State
  // ==========================================================================
  let state = {
    currentDate: getTodayDateString(),
    settings: { ...DEFAULT_SETTINGS },
    entries: [],
    waterLogs: {}
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const elements = {
    // Date navigation
    prevDayBtn: document.getElementById("prevDayBtn"),
    nextDayBtn: document.getElementById("nextDayBtn"),
    todayBtn: document.getElementById("todayBtn"),
    dateDisplayBtn: document.getElementById("dateDisplayBtn"),
    dateDisplayLabel: document.getElementById("dateDisplayLabel"),
    datePickerInput: document.getElementById("datePickerInput"),

    // Overview metrics
    calorieStatusBadge: document.getElementById("calorieStatusBadge"),
    statTargetCalories: document.getElementById("statTargetCalories"),
    statConsumedCalories: document.getElementById("statConsumedCalories"),
    statRemainingCalories: document.getElementById("statRemainingCalories"),
    remainingLabel: document.getElementById("remainingLabel"),
    calorieProgressBar: document.getElementById("calorieProgressBar"),
    caloriePercentText: document.getElementById("caloriePercentText"),
    calorieRemainingSubtext: document.getElementById("calorieRemainingSubtext"),

    // Macros
    proteinCurrent: document.getElementById("proteinCurrent"),
    proteinTarget: document.getElementById("proteinTarget"),
    proteinPercent: document.getElementById("proteinPercent"),
    proteinBar: document.getElementById("proteinBar"),

    carbsCurrent: document.getElementById("carbsCurrent"),
    carbsTarget: document.getElementById("carbsTarget"),
    carbsPercent: document.getElementById("carbsPercent"),
    carbsBar: document.getElementById("carbsBar"),

    fatCurrent: document.getElementById("fatCurrent"),
    fatTarget: document.getElementById("fatTarget"),
    fatPercent: document.getElementById("fatPercent"),
    fatBar: document.getElementById("fatBar"),

    proteinCalPct: document.getElementById("proteinCalPct"),
    carbsCalPct: document.getElementById("carbsCalPct"),
    fatCalPct: document.getElementById("fatCalPct"),

    // Water
    waterGoalBadge: document.getElementById("waterGoalBadge"),
    waterIntakeAmount: document.getElementById("waterIntakeAmount"),
    waterGlassesContainer: document.getElementById("waterGlassesContainer"),
    addWaterBtn: document.getElementById("addWaterBtn"),
    subWaterBtn: document.getElementById("subWaterBtn"),
    resetWaterBtn: document.getElementById("resetWaterBtn"),

    // Meal lists
    breakfastItemsList: document.getElementById("breakfastItemsList"),
    lunchItemsList: document.getElementById("lunchItemsList"),
    dinnerItemsList: document.getElementById("dinnerItemsList"),
    snackItemsList: document.getElementById("snackItemsList"),

    breakfastCaloriesTotal: document.getElementById("breakfastCaloriesTotal"),
    lunchCaloriesTotal: document.getElementById("lunchCaloriesTotal"),
    dinnerCaloriesTotal: document.getElementById("dinnerCaloriesTotal"),
    snackCaloriesTotal: document.getElementById("snackCaloriesTotal"),

    // Buttons
    openAddFoodModalBtn: document.getElementById("openAddFoodModalBtn"),
    inlineAddMealBtn: document.getElementById("inlineAddMealBtn"),
    openSettingsModalBtn: document.getElementById("openSettingsModalBtn"),

    // Food Modal
    foodModal: document.getElementById("foodModal"),
    foodModalTitle: document.getElementById("foodModalTitle"),
    closeFoodModalBtn: document.getElementById("closeFoodModalBtn"),
    cancelFoodModalBtn: document.getElementById("cancelFoodModalBtn"),
    foodForm: document.getElementById("foodForm"),
    editEntryId: document.getElementById("editEntryId"),
    foodNameInput: document.getElementById("foodNameInput"),
    foodMealSelect: document.getElementById("foodMealSelect"),
    foodCaloriesInput: document.getElementById("foodCaloriesInput"),
    foodProteinInput: document.getElementById("foodProteinInput"),
    foodCarbsInput: document.getElementById("foodCarbsInput"),
    foodFatInput: document.getElementById("foodFatInput"),
    foodDateInput: document.getElementById("foodDateInput"),

    // Settings Modal
    settingsModal: document.getElementById("settingsModal"),
    closeSettingsModalBtn: document.getElementById("closeSettingsModalBtn"),
    cancelSettingsBtn: document.getElementById("cancelSettingsBtn"),
    settingsForm: document.getElementById("settingsForm"),
    settingCalorieGoal: document.getElementById("settingCalorieGoal"),
    settingProteinGoal: document.getElementById("settingProteinGoal"),
    settingCarbsGoal: document.getElementById("settingCarbsGoal"),
    settingFatGoal: document.getElementById("settingFatGoal"),
    settingWaterGoal: document.getElementById("settingWaterGoal"),
    exportDataBtn: document.getElementById("exportDataBtn"),
    importDataFileInput: document.getElementById("importDataFileInput"),
    clearAllDataBtn: document.getElementById("clearAllDataBtn"),

    // Sidebar
    weeklyChartCanvas: document.getElementById("weeklyChartCanvas"),
    summaryTotalItems: document.getElementById("summaryTotalItems"),
    summaryAvgCalories: document.getElementById("summaryAvgCalories"),
    summaryWaterPct: document.getElementById("summaryWaterPct"),
    summaryBudgetStatus: document.getElementById("summaryBudgetStatus"),

    // Toast
    toastNotification: document.getElementById("toastNotification")
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    loadSettings();
    loadEntries();
    loadWaterLogs();

    // Check if this is a first-time launch; if so, populate sample entries for today
    seedSampleDataIfEmpty();

    attachEventListeners();
    render();
  }

  // ==========================================================================
  // Date Helpers
  // ==========================================================================
  function getTodayDateString() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(dateStr) {
    const parts = dateStr.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDisplayDate(dateStr) {
    const dateObj = parseDateKey(dateStr);
    const todayStr = getTodayDateString();

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterdayObj);

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = formatDateKey(tomorrowObj);

    const options = { month: "short", day: "numeric" };
    const dateFormatted = dateObj.toLocaleDateString(undefined, options);

    if (dateStr === todayStr) {
      return `Today, ${dateFormatted}`;
    } else if (dateStr === yesterdayStr) {
      return `Yesterday, ${dateFormatted}`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow, ${dateFormatted}`;
    } else {
      const weekday = dateObj.toLocaleDateString(undefined, { weekday: "short" });
      return `${weekday}, ${dateFormatted}`;
    }
  }

  function shiftDate(days) {
    const currentObj = parseDateKey(state.currentDate);
    currentObj.setDate(currentObj.getDate() + days);
    state.currentDate = formatDateKey(currentObj);
    render();
  }

  // ==========================================================================
  // Storage Handlers
  // ==========================================================================
  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        state.settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load settings from localStorage:", e);
      state.settings = { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }

  function loadEntries() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (saved) {
        state.entries = JSON.parse(saved);
      } else {
        state.entries = [];
      }
    } catch (e) {
      console.warn("Could not load entries from localStorage:", e);
      state.entries = [];
    }
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(state.entries));
    } catch (e) {
      console.error("Failed to save entries:", e);
    }
  }

  function loadWaterLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      if (saved) {
        state.waterLogs = JSON.parse(saved);
      } else {
        state.waterLogs = {};
      }
    } catch (e) {
      console.warn("Could not load water logs from localStorage:", e);
      state.waterLogs = {};
    }
  }

  function saveWaterLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(state.waterLogs));
    } catch (e) {
      console.error("Failed to save water logs:", e);
    }
  }

  // First-run seed data so the app looks vibrant immediately
  function seedSampleDataIfEmpty() {
    if (state.entries.length === 0 && !localStorage.getItem("nutritrack_seeded")) {
      const today = getTodayDateString();
      const sampleItems = [
        {
          id: "seed_1",
          date: today,
          meal: "Breakfast",
          name: "Oatmeal with Blueberries & Honey",
          calories: 280,
          protein: 10,
          carbs: 52,
          fat: 4,
          createdAt: Date.now() - 36000000
        },
        {
          id: "seed_2",
          date: today,
          meal: "Lunch",
          name: "Grilled Chicken Breast with Quinoa",
          calories: 460,
          protein: 44,
          carbs: 45,
          fat: 10,
          createdAt: Date.now() - 20000000
        },
        {
          id: "seed_3",
          date: today,
          meal: "Snack",
          name: "Greek Yogurt & Almonds",
          calories: 210,
          protein: 18,
          carbs: 12,
          fat: 9,
          createdAt: Date.now() - 10000000
        }
      ];

      state.entries = sampleItems;
      state.waterLogs[today] = 1250; // 5 glasses
      saveEntries();
      saveWaterLogs();
      localStorage.setItem("nutritrack_seeded", "true");
    }
  }

  // ==========================================================================
  // Main Render Function
  // ==========================================================================
  function render() {
    // 1. Date display
    elements.dateDisplayLabel.textContent = formatDisplayDate(state.currentDate);
    elements.datePickerInput.value = state.currentDate;

    // 2. Filter today's entries
    const dayEntries = state.entries.filter(item => item.date === state.currentDate);

    // Compute totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    dayEntries.forEach(item => {
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    const targetCal = state.settings.calorieTarget;
    const remainingCal = targetCal - totalCalories;
    const caloriePct = targetCal > 0 ? Math.min(100, Math.round((totalCalories / targetCal) * 100)) : 0;

    // 3. Update Calorie Overview Card
    elements.statTargetCalories.textContent = targetCal.toLocaleString();
    elements.statConsumedCalories.textContent = totalCalories.toLocaleString();

    const metricHighlightBlock = elements.statRemainingCalories.parentElement;

    if (remainingCal >= 0) {
      elements.remainingLabel.textContent = "Remaining";
      elements.statRemainingCalories.textContent = remainingCal.toLocaleString();
      elements.calorieRemainingSubtext.textContent = `${remainingCal.toLocaleString()} kcal left`;
      elements.calorieStatusBadge.className = "status-badge badge-success";
      elements.calorieStatusBadge.textContent = "On Track";
      metricHighlightBlock.classList.remove("over-budget");

      // Progress bar fill
      elements.calorieProgressBar.style.width = `${caloriePct}%`;
      if (caloriePct > 90) {
        elements.calorieProgressBar.className = "progress-bar-fill warning";
      } else {
        elements.calorieProgressBar.className = "progress-bar-fill";
      }
    } else {
      const overCal = Math.abs(remainingCal);
      elements.remainingLabel.textContent = "Over By";
      elements.statRemainingCalories.textContent = overCal.toLocaleString();
      elements.calorieRemainingSubtext.textContent = `${overCal.toLocaleString()} kcal over budget`;
      elements.calorieStatusBadge.className = "status-badge badge-danger";
      elements.calorieStatusBadge.textContent = "Over Budget";
      metricHighlightBlock.classList.add("over-budget");

      elements.calorieProgressBar.style.width = "100%";
      elements.calorieProgressBar.className = "progress-bar-fill danger";
    }

    elements.caloriePercentText.textContent = `${caloriePct}% of daily goal`;

    // 4. Update Macronutrients Card
    const targetP = state.settings.proteinTarget;
    const targetC = state.settings.carbsTarget;
    const targetF = state.settings.fatTarget;

    const pPct = targetP > 0 ? Math.round((totalProtein / targetP) * 100) : 0;
    const cPct = targetC > 0 ? Math.round((totalCarbs / targetC) * 100) : 0;
    const fPct = targetF > 0 ? Math.round((totalFat / targetF) * 100) : 0;

    elements.proteinCurrent.textContent = Math.round(totalProtein);
    elements.proteinTarget.textContent = targetP;
    elements.proteinPercent.textContent = `(${pPct}%)`;
    elements.proteinBar.style.width = `${Math.min(100, pPct)}%`;

    elements.carbsCurrent.textContent = Math.round(totalCarbs);
    elements.carbsTarget.textContent = targetC;
    elements.carbsPercent.textContent = `(${cPct}%)`;
    elements.carbsBar.style.width = `${Math.min(100, cPct)}%`;

    elements.fatCurrent.textContent = Math.round(totalFat);
    elements.fatTarget.textContent = targetF;
    elements.fatPercent.textContent = `(${fPct}%)`;
    elements.fatBar.style.width = `${Math.min(100, fPct)}%`;

    // Macro calorie distribution breakdown
    const proteinKcal = totalProtein * 4;
    const carbsKcal = totalCarbs * 4;
    const fatKcal = totalFat * 9;
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

    if (totalMacroKcal > 0) {
      const distP = Math.round((proteinKcal / totalMacroKcal) * 100);
      const distC = Math.round((carbsKcal / totalMacroKcal) * 100);
      const distF = Math.round((fatKcal / totalMacroKcal) * 100);
      elements.proteinCalPct.textContent = `Protein: ${distP}%`;
      elements.carbsCalPct.textContent = `Carbs: ${distC}%`;
      elements.fatCalPct.textContent = `Fat: ${distF}%`;
    } else {
      elements.proteinCalPct.textContent = "Protein: 0%";
      elements.carbsCalPct.textContent = "Carbs: 0%";
      elements.fatCalPct.textContent = "Fat: 0%";
    }

    // 5. Update Water Tracker
    renderWaterTracker();

    // 6. Render Meal Sections
    renderMealSection("Breakfast", elements.breakfastItemsList, elements.breakfastCaloriesTotal, dayEntries);
    renderMealSection("Lunch", elements.lunchItemsList, elements.lunchCaloriesTotal, dayEntries);
    renderMealSection("Dinner", elements.dinnerItemsList, elements.dinnerCaloriesTotal, dayEntries);
    renderMealSection("Snack", elements.snackItemsList, elements.snackCaloriesTotal, dayEntries);

    // 7. Update Quick Daily Summary Sidebar
    elements.summaryTotalItems.textContent = `${dayEntries.length} item${dayEntries.length === 1 ? "" : "s"}`;
    const avgCal = dayEntries.length > 0 ? Math.round(totalCalories / dayEntries.length) : 0;
    elements.summaryAvgCalories.textContent = `${avgCal.toLocaleString()} kcal`;

    const currentWater = state.waterLogs[state.currentDate] || 0;
    const waterGoal = state.settings.waterTarget || 2000;
    const waterReachedPct = Math.round((currentWater / waterGoal) * 100);
    elements.summaryWaterPct.textContent = `${waterReachedPct}%`;
    elements.summaryBudgetStatus.textContent = remainingCal >= 0 ? "Under Goal" : "Exceeded Goal";
    elements.summaryBudgetStatus.style.color = remainingCal >= 0 ? "#059669" : "#dc2626";

    // 8. Render 7-Day Trend Canvas Chart
    renderWeeklyTrendChart();
  }

  // ==========================================================================
  // Render Meal Sections
  // ==========================================================================
  function renderMealSection(mealName, listEl, subtotalEl, dayEntries) {
    const mealItems = dayEntries.filter(item => item.meal === mealName);
    let subtotal = 0;
    listEl.innerHTML = "";

    if (mealItems.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "empty-meal-state";
      emptyLi.textContent = `No ${mealName.toLowerCase()} foods logged yet.`;
      listEl.appendChild(emptyLi);
    } else {
      mealItems.forEach(item => {
        subtotal += Number(item.calories) || 0;
        const li = document.createElement("li");
        li.className = "food-item-row";
        li.dataset.id = item.id;

        const infoDiv = document.createElement("div");
        infoDiv.className = "food-item-info";

        const titleDiv = document.createElement("div");
        titleDiv.className = "food-item-title";
        titleDiv.textContent = item.name;
        infoDiv.appendChild(titleDiv);

        const macrosTagsDiv = document.createElement("div");
        macrosTagsDiv.className = "food-item-macros-tags";

        const hasP = item.protein !== undefined && item.protein !== null && item.protein !== "";
        const hasC = item.carbs !== undefined && item.carbs !== null && item.carbs !== "";
        const hasF = item.fat !== undefined && item.fat !== null && item.fat !== "";

        if (hasP || hasC || hasF) {
          if (hasP) macrosTagsDiv.innerHTML += `<span class="tag-p">P: ${item.protein}g</span>`;
          if (hasC) macrosTagsDiv.innerHTML += `<span class="tag-c">C: ${item.carbs}g</span>`;
          if (hasF) macrosTagsDiv.innerHTML += `<span class="tag-f">F: ${item.fat}g</span>`;
        } else {
          macrosTagsDiv.innerHTML = '<span style="color: #94a3b8;">No macros entered</span>';
        }

        infoDiv.appendChild(macrosTagsDiv);

        // Right side: calories & action buttons
        const rightDiv = document.createElement("div");
        rightDiv.className = "food-item-right";

        const calSpan = document.createElement("span");
        calSpan.className = "food-item-calories";
        calSpan.textContent = `${Number(item.calories).toLocaleString()} kcal`;
        rightDiv.appendChild(calSpan);

        const editBtn = document.createElement("button");
        editBtn.className = "item-action-btn edit-btn";
        editBtn.setAttribute("title", "Edit Item");
        editBtn.setAttribute("aria-label", "Edit");
        editBtn.innerHTML = "✏️";
        editBtn.addEventListener("click", () => openEditFoodModal(item.id));
        rightDiv.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "item-action-btn delete-btn";
        deleteBtn.setAttribute("title", "Delete Item");
        deleteBtn.setAttribute("aria-label", "Delete");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.addEventListener("click", () => deleteFoodItem(item.id));
        rightDiv.appendChild(deleteBtn);

        li.appendChild(infoDiv);
        li.appendChild(rightDiv);
        listEl.appendChild(li);
      });
    }

    subtotalEl.textContent = `${subtotal.toLocaleString()} kcal`;
  }

  // ==========================================================================
  // Render Water Tracker
  // ==========================================================================
  function renderWaterTracker() {
    const currentWater = state.waterLogs[state.currentDate] || 0;
    const targetWater = state.settings.waterTarget || 2000;
    const glassSize = 250;
    const totalGlasses = Math.max(8, Math.ceil(targetWater / glassSize));
    const filledGlasses = Math.floor(currentWater / glassSize);

    elements.waterGoalBadge.textContent = `Goal: ${targetWater.toLocaleString()} ml`;
    elements.waterIntakeAmount.textContent = currentWater.toLocaleString();
    elements.waterGlassesContainer.innerHTML = "";

    for (let i = 1; i <= totalGlasses; i++) {
      const glass = document.createElement("div");
      glass.className = "water-glass-icon" + (i <= filledGlasses ? " filled" : "");
      glass.title = `Glass ${i} (${i * glassSize} ml)`;

      // Clicking a glass directly sets water level
      glass.addEventListener("click", () => {
        setWaterAmount(i * glassSize);
      });

      elements.waterGlassesContainer.appendChild(glass);
    }
  }

  function setWaterAmount(amount) {
    const clamped = Math.max(0, amount);
    state.waterLogs[state.currentDate] = clamped;
    saveWaterLogs();
    render();
  }

  function addWater(amount) {
    const current = state.waterLogs[state.currentDate] || 0;
    setWaterAmount(current + amount);
    showToast(`Hydration: +${amount} ml logged! 💧`);
  }

  // ==========================================================================
  // Render 7-Day Trend Chart on Canvas
  // ==========================================================================
  function renderWeeklyTrendChart() {
    const canvas = elements.weeklyChartCanvas;
    if (!canvas) return;

    // Get 7 dates up to today or selected date
    const dates = [];
    const baseDate = parseDateKey(state.currentDate);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      dates.push(formatDateKey(d));
    }

    // Calculate calories for each of the 7 days
    const dailyData = dates.map(dateKey => {
      const dayTotal = state.entries
        .filter(item => item.date === dateKey)
        .reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

      const dObj = parseDateKey(dateKey);
      const dayName = dObj.toLocaleDateString(undefined, { weekday: "narrow" });
      const dayNum = dObj.getDate();

      return {
        dateKey,
        label: `${dayName} ${dayNum}`,
        calories: dayTotal,
        isCurrent: dateKey === state.currentDate
      };
    });

    const targetCal = state.settings.calorieTarget;
    const maxVal = Math.max(targetCal * 1.25, ...dailyData.map(d => d.calories), 2400);

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 320;
    const height = 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Chart margins
    const padTop = 20;
    const padBottom = 35;
    const padLeft = 40;
    const padRight = 15;
    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridSteps = 3;
    for (let s = 0; s <= gridSteps; s++) {
      const val = Math.round((maxVal / gridSteps) * s);
      const y = padTop + chartHeight - (val / maxVal) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val, padLeft - 6, y);
    }

    // Draw Target dashed line
    const targetY = padTop + chartHeight - (targetCal / maxVal) * chartHeight;
    ctx.save();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, targetY);
    ctx.lineTo(padLeft + chartWidth, targetY);
    ctx.stroke();
    ctx.restore();

    // Draw Target label on line
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 9px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("GOAL", padLeft + 4, targetY - 4);

    // Draw Bars
    const barCount = dailyData.length;
    const slotWidth = chartWidth / barCount;
    const barWidth = Math.min(28, slotWidth * 0.6);

    dailyData.forEach((item, index) => {
      const x = padLeft + index * slotWidth + (slotWidth - barWidth) / 2;
      const barHeight = (item.calories / maxVal) * chartHeight;
      const y = padTop + chartHeight - barHeight;

      // Color: green if within budget, red if over
      const isOver = item.calories > targetCal;
      ctx.fillStyle = isOver ? "#ef4444" : "#10b981";

      // If active current date, give subtle glow / border
      if (item.isCurrent) {
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, barWidth, barHeight, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        roundRect(ctx, x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      // Day Label at bottom
      ctx.fillStyle = item.isCurrent ? "#0f172a" : "#64748b";
      ctx.font = item.isCurrent ? "bold 11px -apple-system, BlinkMacSystemFont, sans-serif" : "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(item.label, x + barWidth / 2, padTop + chartHeight + 8);

      // Calorie text on top of bar if space permits
      if (item.calories > 0) {
        ctx.fillStyle = item.isCurrent ? "#0f172a" : "#475569";
        ctx.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(item.calories, x + barWidth / 2, y - 2);
      }
    });

    // Helper for rounded bar tops
    function roundRect(context, rx, ry, rw, rh, rad) {
      if (rh <= 0) return;
      const r = Math.min(rad, rw / 2, rh);
      context.beginPath();
      context.moveTo(rx, ry + rh);
      context.lineTo(rx, ry + r);
      context.quadraticCurveTo(rx, ry, rx + r, ry);
      context.lineTo(rx + rw - r, ry);
      context.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      context.lineTo(rx + rw, ry + rh);
      context.closePath();
    }
  }

  // ==========================================================================
  // Food Item CRUD Operations
  // ==========================================================================
  function openAddFoodModal(presetMeal) {
    elements.foodModalTitle.textContent = "Log Food Item";
    elements.editEntryId.value = "";
    elements.foodForm.reset();

    // Default values
    elements.foodDateInput.value = state.currentDate;
    if (presetMeal && ["Breakfast", "Lunch", "Dinner", "Snack"].includes(presetMeal)) {
      elements.foodMealSelect.value = presetMeal;
    } else {
      elements.foodMealSelect.value = "Breakfast";
    }

    elements.foodModal.classList.add("active");
    elements.foodModal.setAttribute("aria-hidden", "false");
    setTimeout(() => elements.foodNameInput.focus(), 50);
  }

  function openEditFoodModal(entryId) {
    const item = state.entries.find(e => e.id === entryId);
    if (!item) return;

    elements.foodModalTitle.textContent = "Edit Food Item";
    elements.editEntryId.value = item.id;
    elements.foodNameInput.value = item.name;
    elements.foodMealSelect.value = item.meal;
    elements.foodCaloriesInput.value = item.calories;
    elements.foodProteinInput.value = item.protein !== undefined ? item.protein : "";
    elements.foodCarbsInput.value = item.carbs !== undefined ? item.carbs : "";
    elements.foodFatInput.value = item.fat !== undefined ? item.fat : "";
    elements.foodDateInput.value = item.date || state.currentDate;

    elements.foodModal.classList.add("active");
    elements.foodModal.setAttribute("aria-hidden", "false");
    setTimeout(() => elements.foodNameInput.focus(), 50);
  }

  function closeFoodModal() {
    elements.foodModal.classList.remove("active");
    elements.foodModal.setAttribute("aria-hidden", "true");
    elements.foodForm.reset();
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const name = elements.foodNameInput.value.trim();
    const calories = parseInt(elements.foodCaloriesInput.value, 10);
    const meal = elements.foodMealSelect.value;
    const date = elements.foodDateInput.value || state.currentDate;

    const protein = elements.foodProteinInput.value === "" ? 0 : parseFloat(elements.foodProteinInput.value);
    const carbs = elements.foodCarbsInput.value === "" ? 0 : parseFloat(elements.foodCarbsInput.value);
    const fat = elements.foodFatInput.value === "" ? 0 : parseFloat(elements.foodFatInput.value);

    if (!name || isNaN(calories) || calories < 0) {
      showToast("Please provide a valid food name and calorie amount.");
      return;
    }

    const editId = elements.editEntryId.value;

    if (editId) {
      // Update existing
      const index = state.entries.findIndex(item => item.id === editId);
      if (index !== -1) {
        state.entries[index] = {
          ...state.entries[index],
          name,
          meal,
          calories,
          protein,
          carbs,
          fat,
          date
        };
        showToast(`Updated "${name}"`);
      }
    } else {
      // Create new
      const newEntry = {
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        name,
        meal,
        calories,
        protein,
        carbs,
        fat,
        date,
        createdAt: Date.now()
      };
      state.entries.push(newEntry);
      showToast(`Logged "${name}" (${calories} kcal)`);
    }

    saveEntries();
    closeFoodModal();

    // If item was logged for a different date, switch to that date to let user see it
    if (state.currentDate !== date) {
      state.currentDate = date;
    }

    render();
  }

  function deleteFoodItem(entryId) {
    const item = state.entries.find(e => e.id === entryId);
    const itemName = item ? item.name : "Item";

    state.entries = state.entries.filter(e => e.id !== entryId);
    saveEntries();
    render();
    showToast(`Removed "${itemName}"`);
  }

  function quickAddCalories(kcal) {
    const newEntry = {
      id: "quick_" + Date.now(),
      name: `Quick Add (+${kcal} kcal)`,
      meal: "Snack",
      calories: kcal,
      protein: 0,
      carbs: 0,
      fat: 0,
      date: state.currentDate,
      createdAt: Date.now()
    };
    state.entries.push(newEntry);
    saveEntries();
    render();
    showToast(`Quick added +${kcal} kcal to Snacks!`);
  }

  // ==========================================================================
  // Settings & Goals Modal
  // ==========================================================================
  function openSettingsModal() {
    elements.settingCalorieGoal.value = state.settings.calorieTarget;
    elements.settingProteinGoal.value = state.settings.proteinTarget;
    elements.settingCarbsGoal.value = state.settings.carbsTarget;
    elements.settingFatGoal.value = state.settings.fatTarget;
    elements.settingWaterGoal.value = state.settings.waterTarget;

    elements.settingsModal.classList.add("active");
    elements.settingsModal.setAttribute("aria-hidden", "false");
  }

  function closeSettingsModal() {
    elements.settingsModal.classList.remove("active");
    elements.settingsModal.setAttribute("aria-hidden", "true");
  }

  function handleSettingsSubmit(e) {
    e.preventDefault();

    const calTarget = parseInt(elements.settingCalorieGoal.value, 10);
    const pTarget = parseInt(elements.settingProteinGoal.value, 10);
    const cTarget = parseInt(elements.settingCarbsGoal.value, 10);
    const fTarget = parseInt(elements.settingFatGoal.value, 10);
    const wTarget = parseInt(elements.settingWaterGoal.value, 10);

    if (isNaN(calTarget) || calTarget <= 0) {
      showToast("Please enter a valid calorie target.");
      return;
    }

    state.settings = {
      calorieTarget: calTarget,
      proteinTarget: isNaN(pTarget) ? 0 : pTarget,
      carbsTarget: isNaN(cTarget) ? 0 : cTarget,
      fatTarget: isNaN(fTarget) ? 0 : fTarget,
      waterTarget: isNaN(wTarget) ? 2000 : wTarget
    };

    saveSettings();
    closeSettingsModal();
    render();
    showToast("Daily goals updated successfully! 🎯");
  }

  // ==========================================================================
  // Data Backup / Restore / Reset
  // ==========================================================================
  function exportData() {
    const backupData = {
      exportDate: new Date().toISOString(),
      version: 1,
      settings: state.settings,
      entries: state.entries,
      waterLogs: state.waterLogs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nutritrack-data-${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Data backup file exported! 💾");
  }

  function handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.entries && Array.isArray(imported.entries)) {
          state.entries = imported.entries;
          saveEntries();
        }
        if (imported.settings) {
          state.settings = Object.assign({}, DEFAULT_SETTINGS, imported.settings);
          saveSettings();
        }
        if (imported.waterLogs) {
          state.waterLogs = imported.waterLogs;
          saveWaterLogs();
        }

        render();
        closeSettingsModal();
        showToast("Backup data restored successfully! ✅");
      } catch (err) {
        showToast("Error importing file. Invalid JSON format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function clearAllData() {
    const confirmed = window.confirm("Are you sure you want to reset all logged meals, hydration records, and goals? This action cannot be undone.");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.WATER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem("nutritrack_seeded");

    state.settings = { ...DEFAULT_SETTINGS };
    state.entries = [];
    state.waterLogs = {};

    closeSettingsModal();
    render();
    showToast("All data cleared from local browser storage.");
  }

  // ==========================================================================
  // Toast Notification
  // ==========================================================================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    elements.toastNotification.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3200);
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================
  function attachEventListeners() {
    // Date Navigation
    elements.prevDayBtn.addEventListener("click", () => shiftDate(-1));
    elements.nextDayBtn.addEventListener("click", () => shiftDate(1));
    elements.todayBtn.addEventListener("click", () => {
      state.currentDate = getTodayDateString();
      render();
    });

    elements.dateDisplayBtn.addEventListener("click", () => {
      elements.datePickerInput.showPicker ? elements.datePickerInput.showPicker() : elements.datePickerInput.click();
    });

    elements.datePickerInput.addEventListener("change", (e) => {
      if (e.target.value) {
        state.currentDate = e.target.value;
        render();
      }
    });

    // Modals Open / Close
    elements.openAddFoodModalBtn.addEventListener("click", () => openAddFoodModal());
    elements.inlineAddMealBtn.addEventListener("click", () => openAddFoodModal());
    elements.closeFoodModalBtn.addEventListener("click", closeFoodModal);
    elements.cancelFoodModalBtn.addEventListener("click", closeFoodModal);
    elements.foodForm.addEventListener("submit", handleFoodFormSubmit);

    elements.openSettingsModalBtn.addEventListener("click", openSettingsModal);
    elements.closeSettingsModalBtn.addEventListener("click", closeSettingsModal);
    elements.cancelSettingsBtn.addEventListener("click", closeSettingsModal);
    elements.settingsForm.addEventListener("submit", handleSettingsSubmit);

    // Close modal on background click
    elements.foodModal.addEventListener("click", (e) => {
      if (e.target === elements.foodModal) closeFoodModal();
    });
    elements.settingsModal.addEventListener("click", (e) => {
      if (e.target === elements.settingsModal) closeSettingsModal();
    });

    // Meal Category Quick Add buttons
    document.querySelectorAll(".meal-quick-add-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const mealType = e.currentTarget.dataset.meal;
        openAddFoodModal(mealType);
      });
    });

    // Presets in modal
    document.querySelectorAll(".preset-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        elements.foodNameInput.value = btn.dataset.name || "";
        elements.foodCaloriesInput.value = btn.dataset.kcal || "";
        elements.foodProteinInput.value = btn.dataset.p || "";
        elements.foodCarbsInput.value = btn.dataset.c || "";
        elements.foodFatInput.value = btn.dataset.f || "";
        if (btn.dataset.meal) {
          elements.foodMealSelect.value = btn.dataset.meal;
        }
      });
    });

    // Quick Add Calorie Strip buttons (+50, +100, etc.)
    document.querySelectorAll(".quick-add-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        const kcal = parseInt(e.currentTarget.dataset.quickKcal, 10);
        if (!isNaN(kcal)) {
          quickAddCalories(kcal);
        }
      });
    });

    // Water Tracker Controls
    elements.addWaterBtn.addEventListener("click", () => addWater(250));
    elements.subWaterBtn.addEventListener("click", () => addWater(-250));
    elements.resetWaterBtn.addEventListener("click", () => {
      setWaterAmount(0);
      showToast("Hydration reset for today.");
    });

    // Data Management
    elements.exportDataBtn.addEventListener("click", exportData);
    elements.importDataFileInput.addEventListener("change", handleImportData);
    elements.clearAllDataBtn.addEventListener("click", clearAllData);

    // Responsive Canvas Resize
    window.addEventListener("resize", () => {
      renderWeeklyTrendChart();
    });

    // Keyboard accessibility: ESC to close modals
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeFoodModal();
        closeSettingsModal();
      }
    });
  }

  // Run on page load
  document.addEventListener("DOMContentLoaded", init);
})();

