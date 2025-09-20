import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TextEffectProps {
  children: ReactNode;
  per?: "word" | "char";
  as?: keyof typeof motion;
  variants?: {
    container?: any;
    item?: any;
  };
  className?: string;
}

export function TextEffect({
  children,
  per = "word",
  as = "div",
  variants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
      }
    },
    item: {
      hidden: { 
        opacity: 0,
        y: 20,
        filter: "blur(4px)"
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          duration: 0.4
        }
      }
    }
  },
  className
}: TextEffectProps) {
  const MotionComponent = motion[as as keyof typeof motion] as any;
  
  const words = typeof children === "string" ? children.split(" ") : [];
  const chars = typeof children === "string" ? children.split("") : [];

  if (per === "word") {
    return (
      <MotionComponent
        className={className}
        variants={variants.container}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={variants.item}
            style={{ display: "inline-block", marginRight: "0.25em" }}
          >
            {word}
          </motion.span>
        ))}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      className={className}
      variants={variants.container}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          variants={variants.item}
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
