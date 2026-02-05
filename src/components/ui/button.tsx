import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "primary" | "accent" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-card text-card-foreground hover:bg-card/80": variant === "default",
                        "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
                        "bg-accent text-accent-foreground hover:bg-accent/90": variant === "accent",
                        "border border-border bg-background hover:bg-muted": variant === "outline",
                        "hover:bg-muted hover:text-foreground": variant === "ghost",
                    },
                    {
                        "h-10 px-4 py-2 text-sm": size === "default",
                        "h-9 px-3 text-xs": size === "sm",
                        "h-11 px-8 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
