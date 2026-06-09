import { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Documentos Legales | LETO',
  description:
    'Centro de documentación legal de LETO: Política de Privacidad, Términos de Servicio, Política de Eliminación de Datos y Acuerdo de Procesamiento de Datos.',
  robots: { index: true, follow: true },
};

const DOCS = [
  {
    href: '/privacy',
    title: 'Política de Privacidad',
    version: 'V1.1 · Junio 2026',
    description:
      'Qué datos tratamos, con qué finalidades, durante cuánto tiempo, con quién los compartimos y cuáles son los derechos de los titulares.',
  },
  {
    href: '/terms',
    title: 'Términos de Servicio',
    version: 'V1.1 · Junio 2026',
    description:
      'Condiciones de acceso, uso, suscripción, responsabilidad y terminación del servicio. Jurisdicción: República Oriental del Uruguay.',
  },
  {
    href: '/dpa',
    title: 'Acuerdo de Procesamiento de Datos',
    version: 'V1.1 · Junio 2026',
    description:
      'Regula el tratamiento de datos personales que LETO realiza por cuenta del comerciante, incluyendo roles, instrucciones, subprocesadores y transferencias internacionales.',
  },
  {
    href: '/data-deletion',
    title: 'Política de Eliminación de Datos',
    version: 'V1.1 · Junio 2026',
    description:
      'Cómo LETO gestiona solicitudes de eliminación, acceso, anonimización y retiro de datos de tiendas y consumidores finales, incluyendo los mecanismos técnicos de TiendaNube.',
  },
];

export default function LegalIndexPage() {
  return (
    <LegalLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          Documentos Legales
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Los documentos que regulan el uso de LETO, el tratamiento de datos y la
          relación contractual con los comerciantes que utilizan la plataforma.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Contacto legal:{' '}
          <a
            href="mailto:letocorp.uy@gmail.com"
            className="text-green-700 hover:underline"
          >
            letocorp.uy@gmail.com
          </a>
        </p>
      </div>

      <div className="space-y-4">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="block border border-slate-200 rounded-xl p-6 hover:border-green-600/30 hover:bg-green-50/30 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors mb-1">
                  {doc.title}
                </h2>
                <p className="text-xs text-slate-400 mb-2">{doc.version}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {doc.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-slate-300 group-hover:text-green-600 flex-shrink-0 mt-0.5 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-2">Versión vigente</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Los documentos publicados en este dominio son la versión oficial y vigente.
          Versiones anteriores publicadas en dominios de Netlify no se consideran
          vigentes. Ante cualquier duda, la versión aquí disponible prevalece.
        </p>
      </div>
    </LegalLayout>
  );
}
