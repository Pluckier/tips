# Racing Tips

A modern, data-driven React application that analyzes daily racecards to identify high-value tips. The app automatically fetches the latest race data and applies sophisticated performance and market filters to highlight the most promising runners.

## ✨ Key Features

- **Automated Selection Logic**: Identifies the "Tip" for each race by finding the horse with the highest historical peak rating across all past runs.
- **Quality Filtering (FORM > 50%)**: Automatically excludes low-confidence races where the FORM rating (extracted via regex from race details) is 50% or less.
- **Advanced Market Filters**:
  - **Min/Max Odds Sliders**: Dual sliders to refine selections. Find favorites by setting a low Max Odds, or hunt for outsiders by setting a high Min Odds.
  - **Hot Trainer Toggle**: Instantly filter for horses trained by the most successful names in the industry.
- **Rich Data Display**:
  - **Horse Silks**: Dynamic image loading of racing silks for every runner.
  - **Deep Pedigree**: View Owner, Breeding, and Foaled data alongside the Jockey and Trainer.
  - **Market Position**: Displays current decimal odds directly next to the horse name.
- **Professional UI/UX**:
  - **Theme Support**: Default Dark Mode with a high-contrast Light Mode toggle.
  - **Persistence**: Remembers your theme and filter preferences across sessions using `localStorage`.
  - **Mobile Optimized**: A responsive grid system that adapts cards for optimal viewing on any device.

## 🚀 How it Works

1. **Data Fetching**: On load, the app generates today's date in `DD-MM-YYYY` format and fetches the corresponding `.json` meeting data.
2. **Regex Analysis**: The app parses the `detail` property of each race to extract the `FORM X%` value for filtering.
3. **Rating Comparison**: It iterates through the `past` performance array of every runner to calculate the lifetime peak rating.
4. **Runner Validation**: Market data is scanned to ensure the tip is a live runner (filtering out "NR" or "null" prices).

## 🛠 Tech Stack

- **Framework**: React 19 (Vite)
- **Styling**: Modern CSS with CSS Variables (Theming)
- **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`)

## 💻 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
