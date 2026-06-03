# Racing Info

A modern, data-driven React application that analyzes daily racecards to identify value. The app automatically fetches the latest race data and applies sophisticated performance and market filters to highlight the most promising runners.

## ✨ Key Features

- **Symbol-Driven Filtering**: A comprehensive suite of toggleable icons representing specific data insights:
  - ✨ Favourite | ⭐ Top Rated (3 Runs) | 🌟 2nd Rated (3 runs)
  - 📊 Top Spike on chart | 📈 2nd Top Spike | 🏃 Only last run
  - 🔥 Hot trainer | 💎 Massive spike | 🟣 Light Today
  - 🚀 Improving | 🎯 Handicap newbie | 💀 Bottom rated
- **Dynamic Shortlisting**: Horses are categorized based on active symbols. If all symbols for a horse are toggled off, they automatically move from the "Shortlist" to the "All Runners" section.
- **🏆 Tricast Analysis**: Dedicated filter for high-value betting opportunities. Automatically identifies Handicap races with 8+ runners (including NRs) and displays a real-time badge count.
- **🕒 Live Upcoming Tracking**: Filters out races that have already run (with an 8-minute grace period). Features a dynamic badge count that decrements as races go off.
- **Optimized "App" Layout**: 
  - **Fixed Header**: Date picker, timeline, and meeting filters stay pinned to the top.
  - **Scrollable Card Area**: Only the race cards scroll, ensuring navigation is always accessible.
  - **Mobile Responsive**: Uses fluid typography (`clamp`) and optimized padding for a native-app feel on small screens.
- **Vanish Animation**: Visual "puff" feedback when a race is about to be filtered out of the upcoming view.
- **Inter-App Integration**: 
  - **Deep-Linking**: Clicking a horse's silks instantly opens the corresponding race card in the main Racing App.
  - **Hash Synchronization**: URLs use a `#DATE@TIMEPLACE` format to ensure both apps stay perfectly in sync.
- **Advanced Market Insights**:
  - **Odds Movement**: Live indicators (▲/▼) showing market support or drift since the previous price update.
  - **Hot Trainers**: Automated detection of runners from a curated `HOT_TRAINERS` whitelist.
- **Rich Data Display**:
  - **Market Position**: Displays current decimal odds directly next to the horse name.
  - **Tip Reasons**: Every shortlisted horse displays badges for the specific criteria that triggered the tip.
- **Professional UI/UX**:
  - **Theme Support**: Integrated dark/light mode with a persistent `useTheme` hook.
  - **Live Chat**: Collapsible `Chatter` modal for real-time discussion on the day's card.
  - **Fullscreen Mode**: Toggleable fullscreen support for a distraction-free analysis experience.

## 🔗 Connected Apps

- **Racing App**: The primary data visualization tool for deep-diving into individual race cards and runner history.

## 🚀 How it Works

1. **Data Aggregation**: The app fetches live race data and calculates various metrics (Peak Ratings, Average L3, Weight Change, etc.).
2. **Heuristic Labeling**: Every runner is evaluated against a set of 12 distinct criteria and assigned relevant symbols.
3. **Market Validation**: Non-runners and "null" odds are automatically filtered out to ensure only active betting opportunities are presented.

## 💻 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
