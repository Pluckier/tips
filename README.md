# Racing Tips

A modern, data-driven React application that analyzes daily racecards to identify high-value tips. The app automatically fetches the latest race data and applies sophisticated performance and market filters to highlight the most promising runners.

## ✨ Key Features

- **Dual Selection Strategies**:
  - **Trainer/Peak (Default)**: Prioritizes runners from a "Hot Trainers" whitelist combined with their lifetime peak rating.
  - **Average L3**: A form-consistency approach that selects the horse with the highest average rating across its last three runs.
- **Primary (NAP) & Next Best (NB)**: Every race provides a top selection and a secondary alternative, allowing for more flexible betting or analysis.
- **Dynamic Date Navigation**: Integrated React DatePicker allows users to jump to any specific date to analyze historical tips or upcoming cards.
- **Quality Filtering (FORM > 50%)**: Automatically excludes low-confidence races where the FORM rating (extracted via regex from race details) is 50% or less.
- **Advanced Market Filters**:
  - **Min/Max Odds Sliders**: Dual sliders to refine selections. Find favorites by setting a low Max Odds, or hunt for outsiders by setting a high Min Odds.
  - **Hot Trainer Toggle**: Instantly filter for horses trained by the most successful names in the industry.
- **Inter-App Integration**: 
  - **Deep-Linking**: Clicking a horse's silks instantly opens the corresponding race card in the main Racing App.
  - **Hash Synchronization**: URLs use a `#DATE@TIMEPLACE` format to ensure both apps stay perfectly in sync.
- **Rich Data Display**:
  - **Horse Silks**: Dynamic image loading of racing silks for every runner.
  - **Deep Pedigree**: View Owner, Breeding, and Foaled data alongside the Jockey and Trainer.
  - **Market Position**: Displays current decimal odds directly next to the horse name.
- **Professional UI/UX**:
  - **Theme Support**: Default Dark Mode with a high-contrast Light Mode toggle.
  - **Persistence**: Remembers your theme and filter preferences across sessions using `localStorage`.
- **Mobile Optimized**: A responsive grid system and centered modals provide a premium experience on any device.

## 🔗 Connected Apps

- **Racing App**: The primary data visualization tool for deep-diving into individual race cards and runner history.

## 🚀 How it Works

1. **Strategy Execution**: 
   - **Peak Mode**: Validates runners against the `HOT_TRAINERS` list and scores them by their highest historic rating.
   - **Average Mode**: Calculates the mean score of the three most recent runs for every valid runner.
2. **Validation**: Market data is scanned to ensure selections are live runners (filtering out "NR" or "null" prices).

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
