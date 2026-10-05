import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — StatPitch Analytics" },
      {
        name: "description",
        content:
          "How StatPitch Analytics collects, uses and protects your data: account details, payment processing through Paystack, cookies and your rights.",
      },
      { property: "og:title", content: "Privacy Policy — StatPitch Analytics" },
      {
        property: "og:description",
        content:
          "What data StatPitch Analytics collects, how payments are processed, and how to exercise your privacy rights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "1. What we collect",
    paragraphs: [
      "Account details: your email address when you sign up, and a display name if you choose one. This is required to create and secure your account.",
      "Subscription status: whether your account is on the free or Pro plan, and when your Pro access started. This powers what content you can see.",
      "Payment records: we store a record that a payment happened (date, plan, amount and a transaction reference from Paystack). We never see or store your card number — Paystack processes card and mobile-money payments directly.",
      "Usage data: basic technical logs such as pages requested and error reports, used to keep the Service working and secure.",
    ],
  },
  {
    heading: "2. What we do NOT collect",
    paragraphs: [
      "We do not collect your card details, bank credentials or mobile-money PIN — those go directly to Paystack, our payment processor.",
      "We do not sell your personal data, and we do not run advertising networks on the Service.",
      "We do not knowingly collect data from anyone under 18.",
    ],
  },
  {
    heading: "3. How we use your data",
    paragraphs: [
      "To provide the Service: create your account, remember your sign-in, unlock Pro content when you subscribe, and deliver the statistics and insights you came for.",
      "To manage your subscription: verify payments, prevent duplicate or fraudulent sign-ups, and honour cancellation and refund requests.",
      "To keep the Service safe: detect abuse, credential sharing and attacks.",
      "To communicate with you: essential emails about your account or subscription. We will not spam you with marketing.",
    ],
  },
  {
    heading: "4. Who we share data with",
    paragraphs: [
      "Paystack: to take your payment and tell us when it succeeds. Paystack receives your payment details directly and processes them under its own privacy policy.",
      "Our infrastructure providers: the hosting, database and authentication services that run StatPitch Analytics. They process data only on our instructions.",
      "Bookmakers and affiliate partners: we share nothing personal with them. If you click through to a sportsbook, their own privacy policy applies from that point.",
      "Law enforcement: only where legally required.",
    ],
  },
  {
    heading: "5. Cookies and local storage",
    paragraphs: [
      "We use a small number of browser cookies and local-storage entries to keep you signed in and to remember your Pro status and odds-format preference between visits.",
      "These are strictly functional — we do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    heading: "6. Your rights",
    paragraphs: [
      "You can access, correct or delete your account data at any time. Use \"Delete account\" on your account page to permanently remove your sign-in, profile, Pro status and the payment records we store. Paystack retains its own transaction records as required by law.",
      "You can object to processing or request a copy of your data by contacting us through the StatPitch VIP Telegram channel or the support contact shown in the app.",
      "If you are in the EEA or UK, you also have the right to lodge a complaint with your local data-protection authority.",
    ],
  },
  {
    heading: "7. Security and retention",
    paragraphs: [
      "We protect your data with encrypted connections (HTTPS), secure authentication, and database access rules that block unauthorised reads — including of Pro-only content.",
      "We keep your account data while your account is active, and payment records for as long as tax and accounting rules require.",
    ],
  },
  {
    heading: "8. Changes and contact",
    paragraphs: [
      "If this policy changes materially, we will announce it in the app before it takes effect.",
      "Questions or privacy requests: reach us through the StatPitch VIP Telegram channel or the support contact shown in the app.",
    ],
  },
];

function PrivacyPage() {
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
          Privacy Policy
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
          See also our{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
