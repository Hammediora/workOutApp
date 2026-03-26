import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <section className="w-full max-w-5xl px-4 md:px-6 py-24 mx-auto text-center space-y-8 flex flex-col items-center">
        <div className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none bg-secondary text-secondary-foreground mb-8">
          WorkoutOS Beta
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
          Personalized training, <br className="hidden sm:block" />
          zero resistance.
        </h1>

        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 text-balance">
          Generate an intelligent, movement-based workout plan in seconds. Focus on the lift, let the engine handle the logic. No fluff, no noise.
        </p>

        <div className="space-x-4 pt-8">
          <Link href="/onboarding">
            <Button size="lg" className="h-12 px-8 font-medium tracking-wide">
              Generate Plan
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="h-12 px-8 font-medium tracking-wide border-border/50 bg-background hover:bg-accent/50">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="w-full max-w-5xl px-4 md:px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="rounded-xl border border-border/50 bg-card p-6 flex flex-col space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg tracking-tight">Pattern-Based Logic</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We don't just assign muscles. Our engine balances horizontal pushes, vertical pulls, and hip hinges for structural integrity.
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 flex flex-col space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg tracking-tight">Adaptive to You</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Train at home with bands, or at a commercial gym. The algorithm maps appropriate exercises to your exact environment.
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 flex flex-col space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg tracking-tight">Zero Friction</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Log in, generate, and lift. No infinite scrolling tracking spreadsheets or social feeds distracting you from the core objective.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
