import { HugeiconsIcon, type HugeiconsIconProps, type IconSvgElement } from "@hugeicons/react";

interface IconProps extends Omit<HugeiconsIconProps, "icon"> {
  icon: IconSvgElement;
  className?: string;
}

export function Icon({
  icon,
  className,
  size = 16,
  strokeWidth = 1.5,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}

// Re-export commonly used icons from Pro package for convenience
export * from "@hugeicons-pro/core-stroke-rounded";
