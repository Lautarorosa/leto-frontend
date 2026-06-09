import Link from 'next/link';
import LetoLogo from '@/components/LetoLogo';

const NAV_LINKS = [
  { href: '/privacy',       label: 'Privacidad' },
  { href: '/terms',         label: 'Términos' },
  { href: '/dpa',           label: 'DPA' },
  { href: '/data-deletion', label: 'Eliminación de datos' },
];

interface Props {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <LetoLogo size={26} />
            <span className="text-xs text-slate-400 font-medium">Legal</span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LetoLogo size={20} showWordmark={false} />
            <span className="text-xs text-slate-400">© 2026 LETO Corp</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a href="mailto:letocorp.uy@gmail.com" className="hover:text-slate-700 transition-colors">
              letocorp.uy@gmail.com
            </a>
            <Link href="/legal" className="hover:text-slate-700 transition-colors">
              Documentos legales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
