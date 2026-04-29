import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type DialogContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

const Dialog = ({ children, open: propsOpen, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const open = propsOpen !== undefined ? propsOpen : internalOpen
  const setOpen = React.useCallback((o: boolean) => {
    if (onOpenChange) {
      onOpenChange(o)
    } else {
      setInternalOpen(o)
    }
  }, [onOpenChange])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children }: { children: React.ReactNode }) => {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogTrigger must be used within Dialog")

  return (
    <div onClick={() => context.setOpen(true)}>
      {children}
    </div>
  )
}

const DialogContent = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within Dialog")

  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={() => context.setOpen(false)} />
      <div className={cn("relative z-50 grid w-full max-w-lg gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-950 sm:rounded-lg", className)}>
        {children}
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-slate-950 dark:focus:ring-slate-300"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
