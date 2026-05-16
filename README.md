# Medicare Enrollment Dashboard

An interactive analytics dashboard for CMS Medicare Monthly Enrollment data. Visualizes enrollment trends, plan type breakdowns, and geographic penetration rates across all US states and counties.

## Running the App

```bash
cd dashboard
npm install
npm run dev
```

## Usage

1. **Switch views** — Use the toggle in the top-right to switch between Hospital/Medical and Prescription Drug enrollment data.
2. **Read the KPI cards** — The four summary cards at the top show total enrollment, plan type counts, and penetration rate for the current view.
3. **Explore the map** — Hover over states to see a tooltip with penetration percentages. Click a state to drill down.
4. **Drill into a state** — When you click a state, the right sidebar shows that state's enrollment summary and a scrollable list of all its counties with enrollment counts and penetration rates.
5. **Analyze trends** — Below the map, toggle between Yearly and 12-Month views to see enrollment count and percent-of-total charts. When a state is selected, trends update to show that state's data.
6. **Return to overview** — Click the ✕ button in the sidebar header to deselect the state and return to the top-10 states overview.

## Features

- **Dual view modes**: Hospital/Medical (MA vs FFS) and Prescription Drug (MAPD vs PDP)
- **Interactive choropleth map**: State-level penetration rates with click-to-drill-down
- **Contextual sidebar**: Selecting a state reveals county-level breakdown with enrollment counts and penetration bars — no redundant grid views
- **Trend charts**: Yearly and 12-month enrollment count (line) and percent-of-total (stacked bar)
- **Summary KPI cards**: Total enrollment, plan type counts, and penetration rate at a glance
- **Live CMS data**: Fetches directly from the data.cms.gov API with react-query caching

## Design

Modernized UI based on a Figma analytics dashboard template:

- **Typography**: Inter font with semibold/medium/normal weight hierarchy
- **Color system**: Neutral gray palette with accessible chart colors (sky blue, emerald, amber, red, violet)
- **Layout**: Centered max-width container, responsive 3-column grid (map + trends | sidebar)
- **Components**: Rounded-xl cards with subtle borders, pill-style segmented controls, colored icon badges
- **Stack**: React 19, Vite 8, Tailwind CSS 4, Recharts, Leaflet, lucide-react, Radix UI primitives

## Data Source

[CMS Medicare Monthly Enrollment](https://data.cms.gov/summary-statistics-on-beneficiary-enrollment/medicare-and-medicaid-reports/medicare-monthly-enrollment) — National, State, and County level enrollment counts.
