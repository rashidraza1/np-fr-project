import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type AccordionItemContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const AccordionItemContext = React.createContext<AccordionItemContextType | null>(null)

const Accordion = ({ children, className }: { children: React.ReactNode, className?: string; type?: string; collapsible?: boolean }) => (
  <div className={cn("w-full", className)}>{children}</div>
)

const AccordionItem = ({ children, className }: { value: string, children: React.ReactNode, className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <AccordionItemContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn("border-b", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

const AccordionTrigger = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionItemContext)
  if (!context) throw new Error("AccordionTrigger must be used within AccordionItem")

  return (
    <button
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", context.isOpen && "rotate-180")} />
    </button>
  )
}

const AccordionContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionItemContext)
  if (!context) throw new Error("AccordionContent must be used within AccordionItem")

  if (!context.isOpen) return null
  return (
    <div className={cn("overflow-hidden text-sm transition-all", className)}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
