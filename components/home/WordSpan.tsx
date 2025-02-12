import { motion } from "framer-motion";

export const WordSpan = ({ word, index }: { word: string; index: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // Updated transition for a smoother fade-in
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeInOut" }}
      style={{ display: "inline", letterSpacing: "-0.01em" }}
    >
      {word}
    </motion.span>
  );
};