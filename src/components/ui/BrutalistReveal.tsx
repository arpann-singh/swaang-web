"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BrutalistRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

export default function BrutalistReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: BrutalistRevealProps) {
  const getInitial = () => {
    switch (direction) {
      case "up": return { y: 100, opacity: 0 };
      case "down": return { y: -100, opacity: 0 };
      case "left": return { x: 100, opacity: 0 };
      case "right": return { x: -100, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 1.5,
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
