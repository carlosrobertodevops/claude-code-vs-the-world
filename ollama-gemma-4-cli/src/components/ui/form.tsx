import * as React from "react"
import { cn } from "@/lib/utils"

export const Form = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
)
Form.displayName = "Form"

export const FormControl = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="mb-4" {...props}>{children}</div>
)
FormControl.displayName = "FormControl"

export const FormField = ({ control, name, render }: any) => {
  return render({ field: { name, value: "", onChange: () => {} } })
}
FormField.displayName = "FormField"

export const FormItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="space-y-2" {...props}>{children}</div>
)
FormItem.displayName = "FormItem"

export const FormLabel = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-sm font-medium leading-none" {...props}>{children}</p>
)
FormLabel.displayName = "FormLabel"

export const FormMessage = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-sm font-medium text-destructive" {...props}>{children}</p>
)
FormMessage.displayName = "FormMessage"
