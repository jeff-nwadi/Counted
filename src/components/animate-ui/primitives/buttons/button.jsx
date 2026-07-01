'use client';;
import * as React from 'react';
import { motion } from 'motion/react';

import { Slot } from '@/components/animate-ui/primitives/animate/slot';

function Button({
  // Defaults to no motion so the existing CSS `active:scale-[0.98]` /
  // `active:translate-y-px` rules on the brand buttons keep driving the
  // press feedback. Callers can opt back in by passing values explicitly.
  hoverScale = 1,
  tapScale = 1,
  asChild = false,
  ...props
}) {
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={{ scale: tapScale }}
      whileHover={{ scale: hoverScale }}
      {...props} />
  );
}

export { Button };
