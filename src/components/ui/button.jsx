import * as React from "react"

import {
  Button as AnimateButton,
  buttonVariants as animateButtonVariants,
} from "@/components/animate-ui/components/buttons/button"
import { cn } from "@/lib/utils"

// Re-export the animate-ui cva so shadcn-style consumers (AlertDialogAction /
// AlertDialogCancel / etc.) get the same variant set. This module is the
// legacy shadcn-style entry point used by animate-ui's own sidebar; the
// canonical import going forward is `@/components/animate-ui/components/buttons/button`.
export const buttonVariants = animateButtonVariants

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  return (
    <AnimateButton
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(animateButtonVariants({ variant, size, className }))}
      asChild={asChild}
      {...props}
    />
  )
}

export { Button }
