import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — StatPitch Analytics" },
      {
        name: "description",
        content:
          "StatPitch Analytics terms of service: subscription terms, acceptable use, payment, refunds and disclaimers for our sports statistics platform.",
      },
      { property: "og:title", content: "Terms of Service — StatPitch Analytics" },
      {
        property: "og:description",
        content:
          "The terms governing your use of StatPitch Analytics, including subscriptions, payments and our no-guarantee disclaimer on betting insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "1. Acceptance of terms",
    paragraphs: [
      "By creating an account, subscribing or otherwise using StatPitch Analytics (the \"Service\"), you agree to these Terms of Service. If you do not agree, do not use the Service.",
      "You must be at least 18 years old to subscribe or to use any betting-related feature of the Service.",
    ],
  },
  {
    heading: "2. What the Service provides",
    paragraphs: [
      "StatPitch Analytics provides sports statistics, historical trends, head-to-head comparisons, model-generated probabilities and analytical insights. Content is provided for informational and entertainment purposes only.",
      "We do not operate, host or process any bets. We do not place wagers on your behalf, and we are not a bookmaker, betting exchange or gambling operator.",
    ],
  },
  {
    heading: "3. No guarantee of outcomes",
    paragraphs: [
      "All probabilities, predictions, value edges and recommendations are statistical estimates produced by automated models. They can be, and often are, wrong.",
      "We do not guarantee any result, profit, strike rate or return. Sports results are inherently unpredictable, and past performance never indicates future results.",
      "Nothing on the Service is financial, investment or betting advice. You are solely responsible for any betting decisions you make and for any money you risk.",
      "Bet responsibly. Never stake money you cannot afford to lose. If gambling stops being fun, seek help from a responsible-gambling organisation in your country.",
    ],
  },
  {
    heading: "4. Subscriptions and payment",
    paragraphs: [
      "Pro access (Weekly, Monthly or other advertised tiers) is billed through Paystack. Prices are shown before you pay and may include applicable taxes.",
      "Weekly plans renew weekly and Monthly plans renew monthly until cancelled. Cancelling stops future renewals; access already paid for remains active until the end of the paid period.",
      "We may adjust plan prices prospectively. We will give reasonable notice of any increase before it applies to your next renewal.",
    ],
  },
  {
    heading: "5. Refunds",
    paragraphs: [
      "Digital access begins immediately after payment, so purchases are generally non-refundable once the plan period has started.",
      "If you were charged in error, were billed for a period after you cancelled, or a payment failed to grant you Pro access, contact us and we will make it right — including a full or partial refund where appropriate.",
    ],
  },
  {
    heading: "6. Your account",
    paragraphs: [
      "You are responsible for keeping your login credentials secure and for all activity under your account.",
      "One subscription covers one person. Sharing credentials, reselling access or scraping paid content is prohibited and may result in termination without refund.",
    ],
  },
  {
    heading: "7. Acceptable use",
    paragraphs: [
      "You agree not to: misuse or attack the Service, attempt to access Pro content without an active subscription, use automated tools to bulk-download content, or use the Service where sports betting or gambling-related information is illegal under your local law.",
      "We may suspend or terminate accounts that violate these terms or the law.",
    ],
  },
  {
    heading: "8. Third-party links and data",
    paragraphs: [
      "The Service displays odds, fixtures and betting links from third-party providers and bookmakers. We do not control that data and it may be delayed, inaccurate or out of date. Always confirm prices at the sportsbook before betting.",
      "Links to bookmakers and the Telegram channel may be affiliate links. We may earn a commission when you use them, at no extra cost to you.",
    ],
  },
  {
    heading: "9. Availability and changes",
    paragraphs: [
      "We aim for high availability but do not guarantee uninterrupted access. Features, data sources and pricing may change; where changes materially reduce a paid feature you are actively paying for, we will offer a proportionate remedy.",
      "We may update these terms. Continued use after an update means you accept the revised terms. Material changes will be announced in the app.",
    ],
  },
  {
    heading: "10. Contact",
    paragraphs: [
      "Questions about these terms, your subscription or refunds: reach us through the StatPitch VIP Telegram channel or the support contact shown in the app.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/"
          className="text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
        >
          ← Back to StatPitch
        </Link>
        <h1 className="mt-4 font-display text-5xl tracking-wide text-foreground sm:text-6xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: October 2026 · StatPitch Analytics
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section
              key={section.heading}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h2 className="font-display text-2xl tracking-wide text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Read our{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          to see how we handle your data.
        </p>
      </main>
    </div>
  );
}
