import Image from 'next/image';

interface LetoLogoProps {
  /** Tamaño del ícono en px (el cuadrado del monograma) */
  size?: number;
  /** Mostrar el wordmark "LETO" al lado */
  showWordmark?: boolean;
  /** Clase extra para el wrapper */
  className?: string;
}

/**
 * Logo oficial de LETO.
 * Usa logo.svg de /public — escala perfecto en cualquier tamaño.
 */
export default function LetoLogo({
  size = 32,
  showWordmark = true,
  className = '',
}: LetoLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/leto.png"
        alt="LETO"
        width={size}
        height={size}
        priority
        className="object-contain"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span
          className="font-black tracking-widest uppercase select-none"
          style={{ fontSize: size * 0.44, color: '#16603D', letterSpacing: '0.2em' }}
        >
          LETO
        </span>
      )}
    </div>
  );
}
