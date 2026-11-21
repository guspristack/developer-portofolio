export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ block: 'start' });
  target?.focus({ preventScroll: true });
}

export function CreditFooter({ className }: { className?: string }) {
  return <footer className={className}>Pengembangan <a href="https://github.com/guspriaman">guspriaman</a> · <a href="https://github.com/guspristack">guspriStack</a></footer>;
}
