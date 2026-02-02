import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "pink" | "orange" | "outline";
  glow?: boolean;
  size?: "sm" | "default" | "lg";
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "pink", glow = true, size = "default", children, ...props }, ref) => {
    const variants = {
      pink: "bg-fuchsia-600/20 text-fuchsia-100 border-fuchsia-500 hover:bg-fuchsia-600 hover:text-white hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]",
      orange: "bg-amber-600/20 text-amber-100 border-amber-500 hover:bg-amber-600 hover:text-white hover:shadow-[0_0_20px_rgba(255,170,0,0.6)]",
      outline: "bg-transparent text-white border-white/20 hover:border-white hover:bg-white/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      default: "px-6 py-2 text-sm",
      lg: "px-8 py-3 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative rounded-sm border font-orbitron font-bold uppercase tracking-wider transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-transparent",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {glow && (
          <div className="absolute inset-0 rounded-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </motion.button>
    );
  }
);
NeonButton.displayName = "NeonButton";
