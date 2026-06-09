import { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import LegalLayout from '@/components/LegalLayout';
import { renderLegalMarkdown } from '@/lib/legalMarkdown';

export const metadata: Metadata = {
  title: 'Acuerdo de Procesamiento de Datos (DPA) | LETO',
  description:
    'Data Processing Agreement de LETO V1.1. Regula el tratamiento de datos personales que LETO realiza por cuenta del comerciante. Jurisdicción: Uruguay.',
  robots: { index: true, follow: true },
};

export default function DpaPage() {
  const content = readFileSync(
    join(process.cwd(), 'content/legal/dpa.md'),
    'utf-8'
  );
  const html = renderLegalMarkdown(content);

  return (
    <LegalLayout>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
