import { ReactNode } from "react";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-2">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground mt-1.5">{hint}</span>}
    </label>
  );
}

const baseInput =
  "w-full h-12 px-4 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInput} ${props.className || ""}`} />;
}

export function NumberInput({ prefix, ...props }: { prefix?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  if (prefix) {
    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{prefix}</span>
        <input
          type="number"
          {...props}
          className={`${baseInput} pl-8 ${props.className || ""}`}
        />
      </div>
    );
  }
  return <input type="number" {...props} className={`${baseInput} ${props.className || ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${baseInput} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 ${props.className || ""}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236E6E73' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")` }}
    />
  );
}
