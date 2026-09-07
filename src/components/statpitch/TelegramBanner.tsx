import { Send } from "lucide-react";
import { TELEGRAM_VIP_URL } from "@/lib/odds";

export function TelegramBanner({ onGoPro }: { onGoPro: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neon to-neon-dim p-4 glow-ring">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-10 place-items-center rounded-full bg-background/20 text-primary-foreground">
            <Send className="size-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-tight text-primary-foreground">
              StatPitch VIP Telegram — 10,000+ bettors
            </p>
            <p className="text-xs font-medium text-primary-foreground/80">
              Instant high-value signals and early market drops before kickoff.
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <a
            href={TELEGRAM_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-background px-6 py-2 text-center text-xs font-bold uppercase text-neon transition hover:bg-background/85 sm:flex-none"
          >
            Join now
          </a>
          <button
            onClick={onGoPro}
            className="flex-1 rounded-lg border border-background/40 px-6 py-2 text-xs font-bold uppercase text-primary-foreground transition hover:bg-background/10 sm:flex-none"
          >
            Pro tiers
          </button>
        </div>
      </div>
    </section>
  );
}
