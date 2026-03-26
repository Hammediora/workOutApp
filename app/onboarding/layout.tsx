export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="absolute top-0 w-full h-14 flex items-center justify-center border-b border-border/40 bg-background/50 backdrop-blur">
        <a href="/" className="font-semibold text-sm tracking-wide hover:opacity-80 transition-opacity">WorkoutOS Setup</a>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-4">
        {children}
      </main>
    </div>
  );
}
