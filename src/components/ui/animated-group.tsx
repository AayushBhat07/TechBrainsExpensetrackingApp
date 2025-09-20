import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedGroupProps {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: any;
    item?: any;
  };
  preset?: "fade" | "slide" | "scale";
}

const presetVariants = {
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.5 }
      }
    }
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
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
        transition: { duration: 0.6 }
      }
    }
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      hidden: { 
        opacity: 0, 
        scale: 0.8,
        filter: "blur(4px)"
      },
      visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.6 }
      }
    }
  }
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset = "slide"
}: AnimatedGroupProps) {
  const selectedVariants = variants || presetVariants[preset];

  return (
    <motion.div
      className={className}
      variants={selectedVariants.container}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={selectedVariants.item}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={selectedVariants.item}>{children}</motion.div>
      }
    </motion.div>
  );
}
