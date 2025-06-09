import { ComponentPropsWithoutRef, CSSProperties, FC } from "react"

import { cn } from "@/lib/utils"

export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "relative inline-flex text-foreground",

        // Base text
        "before:content-[attr(data-text)] before:absolute before:left-0 before:top-0 before:z-0",

        // Shine effect
        "after:content-[attr(data-text)] after:absolute after:left-0 after:top-0 after:z-10",
        "after:bg-gradient-to-r after:from-transparent after:via-white after:to-transparent",
        "after:bg-clip-text after:text-transparent",
        "after:animate-shiny-text after:[background-size:200%_100%]",

        className
      )}
      data-text={children}
      {...props}
    >
      {children}
    </span>
  )
}
