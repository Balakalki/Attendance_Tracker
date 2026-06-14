import { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared input look used across all auth fields.
export const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClass =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-all duration-200 hover:bg-violet-700 focus-visible:ring-4 focus-visible:ring-violet-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export const ghostActionClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const errorRing =
  "border-red-400 focus:border-red-500 focus:ring-red-500/15";

export function FieldShell({ label, htmlFor, error, labelRight, children }) {
  return (
    <div className="space-y-1.5">
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
              {label}
            </label>
          )}
          {labelRight}
        </div>
      )}
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function IconInput({ icon: Icon, error, wrapperClassName, className, ...props }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
      )}
      <input
        {...props}
        className={cn(inputClass, Icon && "pl-10", error && errorRing, className)}
      />
    </div>
  );
}

export function PasswordInput({ icon: Icon = Lock, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
      )}
      <input
        {...props}
        type={show ? "text" : "password"}
        className={cn(inputClass, "pl-10 pr-11", error && errorRing)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
      >
        {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
}

export function Alert({ children }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function StatusText({ success, children }) {
  if (!children) return null;
  return (
    <p className={cn("mt-1.5 text-xs font-medium", success ? "text-emerald-600" : "text-red-600")}>
      {children}
    </p>
  );
}
