import styles from "./ChatInput.module.scss";

interface Props {
  data: number[];
}

export const VoiceVisualizer = ({ data }: Props) => {
  return (
    <div className={styles.voiceContainer}>
      <div className={styles.waveWrapper}>
        {data.map((height, i) => (
          <div
            key={i}
            className={styles.waveBar}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
};
