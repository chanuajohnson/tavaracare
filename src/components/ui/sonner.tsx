
import { Toaster as Sonner } from "sonner"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className={cn("toaster group", props.className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-l-4 group-[.toast]:border-l-green-500",
          error: "group-[.toast]:border-l-4 group-[.toast]:border-l-red-500",
          warning: "group-[.toast]:border-l-4 group-[.toast]:border-l-yellow-500",
          info: "group-[.toast]:border-l-4 group-[.toast]:border-l-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
