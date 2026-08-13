import { Send, Users } from "lucide-react";
import { TELEGRAM_VIP_URL } from "@/lib/odds";

export function TelegramBanner({ onGoPro }: { onGoPro: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neon/40 bg-surface p-5 card-shadow sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-neon/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center gap-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-neon/12 text-neon glow-ring">
          <Send className="size-5" />
        </span>
        <div className="min-w-[240px] flex-1">
          <h2 className="text-lg font-bold sm:text-xl">
            Join 10,000+ Bettors in Our VIP Telegram Signals Group 🚀
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" /> Daily model picks, live edge alerts and slip drops before kickoff.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <a
            href={TELEGRAM_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-neon px-5 py-2.5 text-center text-sm font-bold text-primary-foreground transition hover:bg-neon/90 sm:flex-none"
          >
            Join Telegram
          </a>
          <button
            onClick={onGoPro}
            className="flex-1 rounded-xl border border-neon/40 px-5 py-2.5 text-sm font-bold text-neon transition hover:bg-neon/10 sm:flex-none"
          >
            See Pro tiers
          </button>
        </div>
      </div>
    </section>
  );
}
