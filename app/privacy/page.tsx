import { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import LegalLayout from '@/components/LegalLayout';
import { renderLegalMarkdown } from '@/lib/legalMarkdown';

export const metadata: Metadata = {
  title: 'Política de Privacidad | LETO',
  description:
    'Política de Privacidad de LETO. Qué datos tratamos, cómo los usamos, con quién los compartimos y cuáles son tus derechos como titular de datos.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const content = readFileSync(
    join(process.cwd(), 'content/legal/privacy.md'),
    'utf-8'
  );
  const html = renderLegalMarkdown(content);

  return (
    <LegalLayout>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalLayout>
  );
}
