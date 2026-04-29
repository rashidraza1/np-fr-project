import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type SelectContextType = {
  value?: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextType | null>(null)

const Select = ({ children, value: propsValue, onValueChange: propsOnValueChange, disabled }: { children: React.ReactNode, value?: string, onValueChange?: (v: string) => void, disabled?: boolean }) => {
  const [internalValue, setInternalValue] = React.useState(propsValue)
  const [open, setOpen] = React.useState(false)

  const value = propsValue !== undefined ? propsValue : internalValue
  const onValueChange = React.useCallback((v: string) => {
    if (propsOnValueChange) {
      propsOnValueChange(v)
    } else {
      setInternalValue(v)
    }
    setOpen(false)
  }, [propsOnValueChange])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")

  return (
    <button
      disabled={context.disabled}
      onClick={() => !context.disabled && context.setOpen(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  return <span>{context.value || placeholder}</span>
}

const SelectContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")

  if (!context.open || context.disabled) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      <div className={cn("absolute top-11 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50", className)}>
        <div className="p-1">
          {children}
        </div>
      </div>
    </>
  )
}

const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  const isActive = context.value === value

  return (
    <div
      onClick={() => !context.disabled && context.onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
        isActive && "bg-slate-100 dark:bg-slate-800",
        context.disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
