"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      ref={ref}
      {...props}
    />
    <div
      className={cn(
        "w-11 h-6 bg-input rounded-full peer peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-focus:ring-offset-background peer-checked:bg-primary transition-colors",
        className
      )}
    >
      <div className="absolute top-[2px] left-[2px] bg-background border border-muted w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full peer-checked:border-primary shadow-sm" />
    </div>
  </label>
))
Switch.displayName = "Switch"

export { Switch }
