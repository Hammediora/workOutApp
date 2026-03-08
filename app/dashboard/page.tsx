// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const program = await db.workoutProgram.findFirst({
    where: { userId: session.user.id },
    include: {
      days: {
        orderBy: { dayIndex: "asc" },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!program) redirect("/onboarding");

  return (
    <div className="space-y-12">

      {/* Page header */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Active program
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{program.name}</h1>
        <p className="text-sm text-muted-foreground">
          Select a day to view your workout and track your sets.
        </p>
      </div>

      {/* Progression reminder */}
      <div className="pl-4 border-l-2 border-foreground/20 space-y-1">
        <p className="text-sm font-semibold tracking-tight">Add weight every week.</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aim for 5 lb increases on each lift per session. Write down what you lifted — beat it next time.
        </p>
      </div>

      {/* Day grid */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-4">
          This week
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {program.days.map((day) => (
            <div
              key={day.id}
              className="rounded-2xl border border-border/60 p-5 flex flex-col gap-4 hover:border-border transition-colors duration-200"
            >
              <div>
                <p className="text-xs text-muted-foreground">{day.exercises.length} exercises</p>
                <h2 className="text-base font-semibold tracking-tight mt-0.5">{day.name}</h2>
              </div>

              <ul className="space-y-1.5 flex-1">
                {day.exercises.slice(0, 4).map((ex) => (
                  <li key={ex.id} className="flex items-baseline gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-foreground/20 shrink-0 mt-1.5" />
                    <span className="truncate">{ex.exercise?.name ?? "Exercise"}</span>
                    <span className="shrink-0 ml-auto tabular-nums">{ex.sets}×{ex.reps}</span>
                  </li>
                ))}
                {day.exercises.length > 4 && (
                  <li className="text-xs text-muted-foreground/50 pl-3">
                    +{day.exercises.length - 4} more
                  </li>
                )}
              </ul>

              <Link href={`/workout/${day.id}`}>
                <Button className="w-full" size="default">
                  Start Workout
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Regenerate */}
      <div className="flex justify-end pt-4 border-t border-border/40">
        <Link href="/onboarding">
          <Button variant="outline" size="sm">Regenerate Plan</Button>
        </Link>
      </div>
    </div>
  );
}
