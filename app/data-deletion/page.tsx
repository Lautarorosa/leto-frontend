import { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import LegalLayout from '@/components/LegalLayout';
import { renderLegalMarkdown } from '@/lib/legalMarkdown';

export const metadata: Metadata = {
  title: 'Política de Eliminación de Datos | LETO',
  description:
    'Política de Eliminación de Datos de LETO V1.1. Cómo gestionamos solicitudes de eliminación, acceso y retiro de datos de comerciantes y consumidores finales.',
  robots: { index: true, follow: true },
};

export default function DataDeletionPage() {
  const content = readFileSync(
    join(process.cwd(), 'content/legal/data-deletion.md'),
    'utf-8'
  );
  const html = renderLegalMarkdown(content);

  return (
    <LegalLayout>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
