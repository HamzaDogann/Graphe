import {
  LineChart,
  Table2,
  PieChart,
  Gauge,
  BarChart3,
  Network,
} from "lucide-react";
import styles from "./SuggestionsGrid.module.scss";

const suggestionItems = [
  { icon: LineChart, className: styles.bgBlue },
  { icon: Table2, className: styles.bgOrange },
  { icon: PieChart, className: styles.bgGreen },
  { icon: Gauge, className: styles.bgLime },
  { icon: BarChart3, className: styles.bgPurple },
  { icon: Network, className: styles.bgRed },
];

export const SuggestionsGrid = () => {
  return (
    <div className={styles.suggestionsGrid}>
      {suggestionItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`${styles.suggestionCard} ${item.className}`}
          >
            <Icon size={28} />
          </div>
        );
      })}
    </div>
  );
};
