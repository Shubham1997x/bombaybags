import { LoginForm } from "./LoginForm";
import { site } from "@/lib/site";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm rounded-xl border border-hairline bg-white p-8 shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-ultra font-display text-xl font-extrabold text-paper">
            V
          </span>
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Admin panel
          </p>
        </div>
        <h1 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink">
          {site.name}
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
