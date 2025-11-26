import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { ResidentFeedbackForm } from "@/features/feedback/components/resident-feedback-form";
import { Sparkles, Users, Shield, MessageSquare } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Shape community upgrades",
    description:
      "Your insights help us prioritize maintenance schedules, amenity upgrades, and neighborhood projects.",
  },
  {
    icon: Shield,
    title: "Report safety concerns",
    description:
      "Let us know about gate incidents, lighting issues, or security gaps so we can respond immediately.",
  },
  {
    icon: Users,
    title: "Improve resident services",
    description:
      "Share what’s working (or not) with billing, reservations, or office support to improve your experience.",
  },
  {
    icon: MessageSquare,
    title: "Celebrate community wins",
    description:
      "Tell us what you enjoyed — events, initiatives, or helpful staff moments — to keep them going.",
  },
];

const FeedbackPage = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1f2b1d]">
      <Navbar variant="community" />

      <section className="relative isolate overflow-hidden bg-linear-to-br from-[#0f2f1d] via-[#17462b] to-[#25673b]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-28 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-white/70">
            Resident Care Desk
          </p>
          <h1 className="text-4xl font-serif uppercase leading-tight tracking-wide sm:text-5xl">
            We listen to every resident story
          </h1>
          <p className="text-base text-white/85 md:text-lg">
            Submit kudos, concerns, or suggestions anytime. Your voice keeps The Promenade
            safer, kinder, and better managed for everyone.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-6 rounded-[32px] border border-[#dfe3d9] bg-white p-8 shadow-sm lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1d402a]">
              Why share feedback?
            </p>
            <h2 className="text-3xl font-semibold text-[#0f2f1d]">
              Every report reaches our admin review board
            </h2>
            <p className="text-sm text-[#4f6053]">
              Whether you’re reporting noise disturbances, requesting street lighting, or
              sharing praise for the security team, submissions are routed to the right
              admins for action within one business day.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#edf1e6] bg-[#f9fbf7] p-4"
                >
                  <div className="mb-3 inline-flex rounded-2xl bg-[#e6f0ea] p-3 text-[#1f5e38]">
                    <item.icon className="size-5" />
                  </div>
                  <p className="text-base font-semibold text-[#1f2b1d]">
                    {item.title}
                  </p>
                  <p className="text-sm text-[#4f6053]">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-[#c5d2c6] bg-linear-to-r from-[#f5faf5] to-[#e8f1ea] p-5 text-sm text-[#1c3d25]">
              <p className="font-semibold uppercase tracking-[0.4em] text-[#5d7762]">
                Response commitment
              </p>
              <p className="mt-2">
                Urgent safety items are reviewed within 4 hours. All other entries receive
                an acknowledgement via email within one business day.
              </p>
            </div>
          </div>
          <ResidentFeedbackForm />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default FeedbackPage;


