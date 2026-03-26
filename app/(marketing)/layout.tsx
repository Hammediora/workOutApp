export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-5xl items-center mx-auto px-4 md:px-6">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                WorkoutOS
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center">
              <a href="/api/auth/signin" className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                Log in
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-5xl mx-auto px-4 md:px-6">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for focus.
          </p>
        </div>
      </footer>
    </div>
  );
}
