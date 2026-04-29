import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
        checked ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900" : "bg-white dark:bg-slate-950",
        className
      )}
      ref={ref}
      {...props}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
