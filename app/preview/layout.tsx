export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-14 max-w-5xl items-center mx-auto px-4 md:px-6">
          <a href="/" className="mr-6 flex items-center space-x-2 transition-opacity hover:opacity-80">
            <span className="font-bold">WorkoutOS</span>
          </a>
          <div className="flex flex-1 items-center justify-end">
            <span className="text-sm font-medium text-muted-foreground mr-4">Preview Mode</span>
            <a href="/onboarding" className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60">
              New Plan
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
