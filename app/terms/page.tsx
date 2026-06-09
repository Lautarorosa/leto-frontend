import { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import LegalLayout from '@/components/LegalLayout';
import { renderLegalMarkdown } from '@/lib/legalMarkdown';

export const metadata: Metadata = {
  title: 'Términos de Servicio | LETO',
  description:
    'Términos de Servicio de LETO V1.1. Condiciones de uso de la plataforma SaaS de inteligencia operacional para ecommerce. Jurisdicción: Uruguay.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const content = readFileSync(
    join(process.cwd(), 'content/legal/terms.md'),
    'utf-8'
  );
  const html = renderLegalMarkdown(content);

  return (
    <LegalLayout>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
