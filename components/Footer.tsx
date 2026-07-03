export function Footer() {
  return (
    <footer className="px-6 py-14">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <span className="font-display font-semibold text-lg">
            re<span className="text-amber">new</span>
          </span>
          <p className="text-ink-dim text-[13px] mt-3 max-w-55 leading-relaxed">
            Used PC hardware, sold with proof it works.
          </p>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-widest text-ink-dim mb-4">
            Marketplace
          </h4>
          <ul className="space-y-2 text-[13px] text-ink-dim">
            <li><a href="#" className="hover:text-ink">Browse GPUs</a></li>
            <li><a href="#" className="hover:text-ink">Browse CPUs</a></li>
            <li><a href="#" className="hover:text-ink">Full builds</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-widest text-ink-dim mb-4">
            Trust
          </h4>
          <ul className="space-y-2 text-[13px] text-ink-dim">
            <li><a href="/faq#how-grading-works" className="hover:text-ink">How grading works</a></li>
            <li><a href="/faq#buyer-protection" className="hover:text-ink">Buyer protection</a></li>
            <li><a href="/faq#return-policy" className="hover:text-ink">Return policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-widest text-ink-dim mb-4">
            Company
          </h4>
          <ul className="space-y-2 text-[13px] text-ink-dim">
            <li><a href="/about#about" className="hover:text-ink">About</a></li>
            <li><a href="/about#contact" className="hover:text-ink">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-line pt-6 text-[12px] text-ink-dim flex justify-between">
        <span>© 2026 Renew</span>
        <span>Built with Next.js · Supabase · Prisma</span>
      </div>
    </footer>
  );
}
