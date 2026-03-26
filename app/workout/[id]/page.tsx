export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { WorkoutDayClient } from "./client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WorkoutDayPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const day = await db.workoutDay.findUnique({
    where: { id: params.id },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: true,
        },
      },
    },
  });

  if (!day) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-14 max-w-5xl items-center mx-auto px-4 md:px-6">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <div className="flex flex-1 items-center justify-end">
            <span className="font-semibold text-sm tracking-wide">{day.name}</span>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{day.name}</h1>
          <p className="text-muted-foreground mt-1">Complete the sets below. Focus on form over weight.</p>
        </div>

        <WorkoutDayClient
          workoutDayId={day.id}
          initialExercises={day.exercises.map(e => ({
             ...e,
             exercise: e.exercise
          }))}
        />
      </main>
    </div>
  );
}
