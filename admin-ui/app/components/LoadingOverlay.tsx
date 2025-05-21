"use client";

import { motion } from "framer-motion";

export default function LoadingOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-16 h-16 border-5 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </motion.div>
  );
}
