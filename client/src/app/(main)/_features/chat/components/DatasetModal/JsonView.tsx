import styles from "./DatasetModal.module.scss";

interface Props {
  content: any;
}

export const JsonView = ({ content }: Props) => {
  return (
    <div className={styles.jsonContainer}>
      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  );
};
