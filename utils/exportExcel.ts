/**
 * Export products to Excel (.xlsx) using the SheetJS library.
 * Called from the dashboard "Exportar Excel" button.
 */
import type { Product } from '@/components/ProductsTable';

function marginLabel(m: number | null): string {
  if (m === null) return 'Sin costo';
  if (m < 0) return 'Crítico';
  if (m < 20) return 'Bajo';
  return 'Bueno';
}

export async function exportProductsToExcel(
  products: Product[],
  storeName: string,
): Promise<void> {
  // Dynamic import — keeps initial bundle small
  const XLSX = await import('xlsx');

  const rows = products.map((p) => ({
    Nombre: p.name,
    Categoría: p.category || '',
    SKU: p.sku || '',
    'Precio ($)': p.price,
    'Costo ($)': p.cost ?? '',
    'Precio Promo ($)': p.promotional_price ?? '',
    'Margen (%)': p.margin !== null ? parseFloat(p.margin.toFixed(2)) : '',
    'Estado Margen': marginLabel(p.margin),
    Stock: p.stock,
    'Ventas/mes': p.monthly_sales > 0 ? p.monthly_sales : '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 35 }, // Nombre
    { wch: 15 }, // Categoría
    { wch: 14 }, // SKU
    { wch: 13 }, // Precio
    { wch: 13 }, // Costo
    { wch: 16 }, // Precio Promo
    { wch: 13 }, // Margen
    { wch: 15 }, // Estado
    { wch: 8  }, // Stock
    { wch: 12 }, // Ventas/mes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');

  const date = new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).replace(/\//g, '-');

  const filename = `LETO_${storeName.replace(/\s+/g, '_')}_${date}.xlsx`;
  XLSX.writeFile(wb, filename);
}
