"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLoaderStore } from "@/store/useLoaderStore";
import styles from "./GlobalLoader.module.scss";

export const GlobalLoader = () => {
  const { isLoading } = useLoaderStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={styles.loaderBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.customLoader}>
            {/* Arkadaki Dönen Grafik */}
            <img
              src="/preloader/pie-chart.svg"
              alt="Loading Pie"
              className={styles.pie}
            />

            <img
              src="/preloader/brush.svg"
              alt="Loading Brush"
              className={styles.brush}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
