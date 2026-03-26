import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-14 max-w-5xl items-center mx-auto px-4 md:px-6">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">WorkoutOS</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {session.user.email}
            </span>
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="sm">
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
