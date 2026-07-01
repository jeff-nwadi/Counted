import { Button as AnimateButton } from '@/components/animate-ui/components/buttons/button';

// Brand-themed wrapper around the animate-ui Button. Kept as a thin adapter
// so the original public API (variant: primary|secondary|ghost, size: sm|md|lg,
// asChild, ...props) still works for any consumer that imports it directly.
const variantMap = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
}

const sizeMap = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  asChild = false,
  ...props
}) {
  return (
    <AnimateButton
      variant={variantMap[variant] ?? 'default'}
      size={sizeMap[size] ?? 'default'}
      className={className}
      asChild={asChild}
      {...props}
    >
      {children}
    </AnimateButton>
  )
}
