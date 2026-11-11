# NutriTrack 🔥

A lightweight, responsive calorie and macronutrient tracker built with vanilla HTML, CSS, and JavaScript. All data is saved persistently in the browser using `localStorage`—no backend, no dependencies, no frameworks, and no CSS variables.

## Features

- **Daily Calorie Budget:** Track target, consumed, and remaining calories in real time with visual progress indicators and status badges.
- **Macronutrient Tracking:** Monitor daily Protein, Carbohydrates, and Fat (grams and caloric % split).
- **Meal Categorization:** Log meals under Breakfast, Lunch, Dinner, and Snacks with subtotals.
- **Quick-Fill Presets:** Instant autofill for common foods and snacks.
- **Hydration Tracker:** Visual daily water intake tracker (250 ml increments).
- **7-Day Trend Chart:** Native HTML5 Canvas bar chart tracking calorie history vs. daily target.
- **Date Navigation:** Browse past or future days with date picker or fast jump to today.
- **Data Management:** Export and import JSON backups directly from the app; customize daily goals in Settings.

## Getting Started

Simply open `index.html` in any modern web browser or host on GitHub Pages. No build step or installation required.

```bash
# Clone the repository
git clone https://github.com/<your-username>/calorie-tracker.git

# Open index.html in your browser
open index.html
```

## Tech Stack

- **HTML5:** Semantic markup and modal dialogs.
- **CSS3:** Custom responsive layout (pure vanilla CSS).
- **JavaScript (ES6+):** Pure vanilla JS, Canvas API, and Web Storage API (`localStorage`).
