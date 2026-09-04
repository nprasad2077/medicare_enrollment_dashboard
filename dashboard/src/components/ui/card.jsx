import { cn } from "./utils";

export function Card({ className, ...props }) {
  return <div className={cn("bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, as: Component = "h2", ...props }) {
  return <Component className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
