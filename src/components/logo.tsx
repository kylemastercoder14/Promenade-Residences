/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.ComponentProps<"img">) => {
  return (
    <img
      src="/logo.png"
      alt="logo"
      className={cn("size-7 object-contain", className)}
      {...props}
    />
  );
};
