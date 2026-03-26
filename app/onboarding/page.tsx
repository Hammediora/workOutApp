export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage() {
  const session = await auth().catch(() => null);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Let's build your plan.</h1>
        <p className="text-muted-foreground">Answer a few questions to generate your optimal training split.</p>
      </div>
      <OnboardingWizard userId={session?.user?.id} />
    </div>
  );
}
