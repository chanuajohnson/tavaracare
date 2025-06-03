
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const HorizontalTabs = TabsPrimitive.Root

const HorizontalTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
        isMobile ? "w-full overflow-x-auto scrollbar-hide" : "w-full",
        className
      )}
      {...props}
    />
  )
})
HorizontalTabsList.displayName = TabsPrimitive.List.displayName

const HorizontalTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        isMobile ? "flex-shrink-0 min-w-max" : "",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
      </div>
    </TabsPrimitive.Trigger>
  )
})
HorizontalTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const HorizontalTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
HorizontalTabsContent.displayName = TabsPrimitive.Content.displayName

export { HorizontalTabs, HorizontalTabsList, HorizontalTabsTrigger, HorizontalTabsContent }
