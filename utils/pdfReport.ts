/**
 * LETO — Generador de reporte PDF premium
 * 100% programático con jsPDF + jspdf-autotable.
 * Sin capturas de pantalla. Siempre fondo blanco.
 */

import type { Product } from '@/components/ProductsTable';

// ── Colores oficiales LETO ──────────────────────────────────────────────────
const C = {
  green:      [22, 96, 61]   as [number,number,number],
  greenLight: [236, 248, 242] as [number,number,number],
  red:        [214, 69, 69]  as [number,number,number],
  redLight:   [253, 242, 242] as [number,number,number],
  amber:      [180, 83, 9]   as [number,number,number],
  amberLight: [255, 250, 235] as [number,number,number],
  dark:       [17, 24, 39]   as [number,number,number],
  mid:        [75, 85, 99]   as [number,number,number],
  muted:      [156, 163, 175] as [number,number,number],
  border:     [229, 231, 235] as [number,number,number],
  bg:         [248, 249, 250] as [number,number,number],
  white:      [255, 255, 255] as [number,number,number],
};

export interface ReportMetrics {
  total_products: number;
  products_with_cost: number;
  products_without_cost: number;
  avg_margin: number;
  negative_margin_count: number;
  low_margin_count: number;
  good_margin_count: number;
  revenue_at_risk: number;
}

export interface RecommendationHistoryItem {
  id: number;
  product_id: number;
  product_name: string;
  option_id: string;
  action_type: string;
  was_applied: boolean;
  applied_at: string;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function marginStatus(m: number | null): { label: string; color: [number,number,number]; bg: [number,number,number] } {
  if (m === null) return { label: 'Sin costo',  color: C.muted,  bg: C.bg };
  if (m < 0)      return { label: 'Crítico',    color: C.red,    bg: C.redLight };
  if (m < 20)     return { label: 'Bajo',       color: C.amber,  bg: C.amberLight };
  return            { label: 'Bueno',     color: C.green,  bg: C.greenLight };
}

const ACTION_LABEL: Record<string, string> = {
  increase_price: 'Aumento de precio',
  liquidate:      'Liquidacion de stock',
  pause_wait:     'Pausa y espera',
};

const ACTION_COLOR: Record<string, [number,number,number]> = {
  increase_price: [22, 96, 61],    // green
  liquidate:      [180, 83, 9],    // amber
  pause_wait:     [75, 85, 99],    // mid-gray
};

export async function generatePDFReport(
  metrics: ReportMetrics,
  products: Product[],
  storeName: string,
  history?: RecommendationHistoryItem[],
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210;
  const M = 18;         // margin lateral
  const CW = W - M * 2; // content width = 174mm

  const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const generated = new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Total pages computed upfront so all footers match
  const totalPages = (history && history.filter(h => h.was_applied).length > 0) ? 4 : 3;

  // ── PAGE FOOTER helper ───────────────────────────────────────────────────
  function addFooter(pageNum: number, totalPages: number) {
    const y = 285;
    doc.setFillColor(...C.green);
    doc.rect(0, y - 1, W, 0.4, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text('LETO — Análisis de Márgenes', M, y + 5);
    doc.text(`Página ${pageNum} de ${totalPages}`, W / 2, y + 5, { align: 'center' });
    doc.text(`Generado: ${generated}`, W - M, y + 5, { align: 'right' });
  }

  // ── PAGE SECTION HEADER helper ──────────────────────────────────────────
  function sectionHeader(text: string, y: number) {
    doc.setFillColor(...C.bg);
    doc.rect(M, y, CW, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.green);
    doc.text(text.toUpperCase(), M + 3, y + 4.8);
    return y + 12;
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  PÁGINA 1 — PORTADA                                      ║
  // ╚══════════════════════════════════════════════════════════╝

  // Header band
  doc.setFillColor(...C.green);
  doc.rect(0, 0, W, 52, 'F');

  // LETO wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...C.white);
  doc.text('LETO', M, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 230, 215);
  doc.text('Análisis de Márgenes · Reporte Ejecutivo', M, 38);

  // White decorative bar
  doc.setFillColor(...C.white);
  doc.rect(0, 52, W, 3, 'F');

  // Title block
  doc.setTextColor(...C.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Reporte de Márgenes', M, 78);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C.mid);
  doc.text(storeName, M, 90);
  doc.text(date, M, 99);

  // Divider
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, 108, W - M, 108);

  // ── KPI summary grid on cover ──
  const kpis = [
    { label: 'Margen Promedio',    value: `${metrics.avg_margin.toFixed(1)}%`, color: metrics.avg_margin >= 20 ? C.green : metrics.avg_margin >= 0 ? C.amber : C.red },
    { label: 'Ingresos en Riesgo', value: fmtMoney(metrics.revenue_at_risk), color: metrics.revenue_at_risk > 0 ? C.red : C.green },
    { label: 'Productos Críticos', value: String(metrics.negative_margin_count), color: metrics.negative_margin_count > 0 ? C.red : C.green },
    { label: 'Margen Bajo',        value: String(metrics.low_margin_count), color: metrics.low_margin_count > 0 ? C.amber : C.green },
    { label: 'Margen Bueno',       value: String(metrics.good_margin_count), color: C.green },
    { label: 'Total Productos',    value: String(metrics.total_products), color: C.dark },
  ];

  const KW = (CW - 8) / 3; // 3 cols
  const KH = 28;
  const kpiStartY = 118;

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * (KW + 4);
    const y = kpiStartY + row * (KH + 4);

    // Card background
    doc.setFillColor(...C.white);
    doc.roundedRect(x, y, KW, KH, 2, 2, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, KW, KH, 2, 2, 'S');

    // Left accent bar
    doc.setFillColor(...kpi.color);
    doc.rect(x, y, 2, KH, 'F');

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + 6, y + 13);

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(kpi.label, x + 6, y + 21);
  });

  // ── Margin distribution bar ──
  const barY = kpiStartY + 2 * (KH + 4) + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.dark);
  doc.text('Distribución de márgenes', M, barY);

  const barTotal = metrics.negative_margin_count + metrics.low_margin_count + metrics.good_margin_count;
  if (barTotal > 0) {
    const segments = [
      { count: metrics.negative_margin_count, color: C.red   },
      { count: metrics.low_margin_count,      color: C.amber },
      { count: metrics.good_margin_count,     color: C.green },
    ];
    const BAR_H = 8;
    const BAR_Y = barY + 4;
    let x = M;
    for (const seg of segments) {
      if (seg.count === 0) continue;
      const segW = (seg.count / barTotal) * CW;
      doc.setFillColor(...seg.color);
      doc.rect(x, BAR_Y, segW, BAR_H, 'F');
      if (segW > 14) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...C.white);
        doc.text(`${seg.count}`, x + segW / 2, BAR_Y + 5.2, { align: 'center' });
      }
      x += segW;
    }

    // Legend
    const legendY = BAR_Y + BAR_H + 5;
    const legends = [
      { label: `Crítico (< 0%)  ${metrics.negative_margin_count}`, color: C.red },
      { label: `Bajo (0–20%)  ${metrics.low_margin_count}`,        color: C.amber },
      { label: `Bueno (>= 20%)  ${metrics.good_margin_count}`,     color: C.green },
    ];
    let lx = M;
    for (const leg of legends) {
      doc.setFillColor(...leg.color);
      doc.rect(lx, legendY, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.mid);
      doc.text(leg.label, lx + 5, legendY + 2.8);
      lx += 52;
    }
  }

  // ── Confidential footer on cover ──
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text('Confidencial — generado exclusivamente para ' + storeName, M, 270);
  doc.text('letocorp.com', W - M, 270, { align: 'right' });

  addFooter(1, totalPages);

  // ╔══════════════════════════════════════════════════════════╗
  // ║  PÁGINA 2 — RESUMEN EJECUTIVO                            ║
  // ╚══════════════════════════════════════════════════════════╝

  doc.addPage();

  // Page header bar
  doc.setFillColor(...C.green);
  doc.rect(0, 0, W, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text('LETO — Reporte de Márgenes', M, 8);
  doc.setFont('helvetica', 'normal');
  doc.text(storeName + '  ·  ' + date, W - M, 8, { align: 'right' });

  let curY = 24;

  curY = sectionHeader('Resumen ejecutivo', curY);

  // Analysis paragraph
  const negPct = barTotal > 0 ? Math.round((metrics.negative_margin_count / barTotal) * 100) : 0;
  const goodPct = barTotal > 0 ? Math.round((metrics.good_margin_count / barTotal) * 100) : 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);

  const summary = doc.splitTextToSize(
    `La tienda "${storeName}" cuenta con ${metrics.total_products} productos activos analizados. ` +
    `El margen promedio real es de ${metrics.avg_margin.toFixed(1)}%, considerando precio de venta, ` +
    `costo y comision de plataforma estimada. El ${goodPct}% de los productos tiene margen saludable ` +
    `(20% o mas), mientras que el ${negPct}% opera con margen negativo, generando perdida real en cada venta. ` +
    `Se estiman ${fmtMoney(metrics.revenue_at_risk)} en ingresos en riesgo que requieren accion inmediata.`,
    CW
  );
  doc.text(summary, M, curY);
  curY += summary.length * 5 + 8;

  // ── Key insights boxes ──
  const insights = [
    metrics.revenue_at_risk > 0
      ? `${fmtMoney(metrics.revenue_at_risk)} en ingresos comprometidos por productos con margen negativo.`
      : 'No se detectan ingresos en riesgo. Todos los productos operan con margen positivo.',
    metrics.negative_margin_count > 0
      ? `${metrics.negative_margin_count} producto${metrics.negative_margin_count > 1 ? 's' : ''} con margen negativo. Cuanto más se venden, más se pierde.`
      : 'Excelente: ningún producto opera con margen negativo.',
    metrics.low_margin_count > 0
      ? `${metrics.low_margin_count} producto${metrics.low_margin_count > 1 ? 's' : ''} con margen bajo (0–20%). Vulnerables ante descuentos o suba de costos.`
      : 'No hay productos en zona de margen bajo.',
    metrics.products_without_cost > 0
      ? `${metrics.products_without_cost} producto${metrics.products_without_cost > 1 ? 's sin' : ' sin'} costo registrado. El margen real de estos no puede calcularse.`
      : 'Todos los productos tienen costo registrado.',
  ];

  curY = sectionHeader('Observaciones clave', curY);

  for (const insight of insights) {
    const lines = doc.splitTextToSize(insight, CW - 12);
    const boxH = lines.length * 4.8 + 6;

    doc.setFillColor(...C.bg);
    doc.rect(M, curY, CW, boxH, 'F');
    doc.setFillColor(...C.green);
    doc.rect(M, curY, 2.5, boxH, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dark);
    doc.text(lines, M + 7, curY + 5);

    curY += boxH + 4;
  }

  // ── Category summary table ──
  curY = sectionHeader('Resumen por categoría', curY + 4);

  const catMap: Record<string, { total: number; sumM: number; critical: number; low: number; good: number }> = {};
  for (const p of products) {
    const cat = p.category || 'Sin categoría';
    if (!catMap[cat]) catMap[cat] = { total: 0, sumM: 0, critical: 0, low: 0, good: 0 };
    catMap[cat].total++;
    if (p.margin === null) continue;
    catMap[cat].sumM += p.margin;
    if (p.margin < 0)  catMap[cat].critical++;
    else if (p.margin < 20) catMap[cat].low++;
    else catMap[cat].good++;
  }

  const catRows = Object.entries(catMap)
    .map(([cat, d]) => [
      cat,
      String(d.total),
      d.total > 0 ? `${(d.sumM / d.total).toFixed(1)}%` : '—',
      String(d.critical),
      String(d.low),
      String(d.good),
    ])
    .sort((a, b) => parseFloat(a[2]) - parseFloat(b[2]));

  autoTable(doc, {
    startY: curY,
    head: [['Categoría', 'Productos', 'Margen Prom.', 'Críticos', 'Bajos', 'Buenos']],
    body: catRows,
    margin: { left: M, right: M },
    styles: { fontSize: 8, cellPadding: 3, font: 'helvetica', textColor: C.dark, lineColor: C.border, lineWidth: 0.2 },
    headStyles: { fillColor: C.green, textColor: C.white, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: C.bg },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center', textColor: C.red },
      4: { halign: 'center', textColor: C.amber },
      5: { halign: 'center', textColor: C.green },
    },
  });

  addFooter(2, totalPages);

  // ╔══════════════════════════════════════════════════════════╗
  // ║  PÁGINA 3 — DETALLE DE PRODUCTOS                         ║
  // ╚══════════════════════════════════════════════════════════╝

  doc.addPage();

  // Page header bar
  doc.setFillColor(...C.green);
  doc.rect(0, 0, W, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text('LETO — Reporte de Márgenes', M, 8);
  doc.setFont('helvetica', 'normal');
  doc.text(storeName + '  ·  ' + date, W - M, 8, { align: 'right' });

  curY = 24;
  curY = sectionHeader('Análisis detallado por producto', curY);

  const sorted = [...products].sort((a, b) => (a.margin ?? 999) - (b.margin ?? 999));

  const rows = sorted.map(p => {
    const st = marginStatus(p.margin);
    return {
      data: [
        p.name,
        p.sku || '—',
        p.category || '—',
        `$${p.price.toLocaleString('es-AR')}`,
        p.cost ? `$${p.cost.toLocaleString('es-AR')}` : '—',
        p.promotional_price ? `$${p.promotional_price.toLocaleString('es-AR')}` : '—',
        p.margin !== null ? `${p.margin.toFixed(1)}%` : '—',
        st.label,
        String(p.stock || 0),
      ],
      statusColor: st.color,
      statusBg:    st.bg,
    };
  });

  autoTable(doc, {
    startY: curY,
    head: [['Producto', 'SKU', 'Cat.', 'Precio', 'Costo', 'Promo', 'Margen', 'Estado', 'Stock']],
    body: rows.map(r => r.data),
    margin: { left: M, right: M },
    styles: { fontSize: 7.2, cellPadding: 2.5, font: 'helvetica', textColor: C.dark, lineColor: C.border, lineWidth: 0.15, overflow: 'ellipsize' },
    headStyles: { fillColor: C.green, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: C.bg },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 10, halign: 'center' },
    },
    didParseCell(data) {
      if (data.section === 'body') {
        const row = rows[data.row.index];
        if (data.column.index === 6 || data.column.index === 7) {
          data.cell.styles.textColor = row.statusColor;
        }
        if (data.column.index === 7) {
          data.cell.styles.fillColor = row.statusBg;
        }
      }
    },
  });

  const hasHistory = history && history.filter(h => h.was_applied).length > 0;

  addFooter(3, totalPages);

  // ╔══════════════════════════════════════════════════════════╗
  // ║  PÁGINA 4 — DECISIONES TOMADAS (opcional)                ║
  // ╚══════════════════════════════════════════════════════════╝

  if (hasHistory) {
    doc.addPage();

    // Page header bar
    doc.setFillColor(...C.green);
    doc.rect(0, 0, W, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text('LETO — Reporte de Margenes', M, 8);
    doc.setFont('helvetica', 'normal');
    doc.text(storeName + '  |  ' + date, W - M, 8, { align: 'right' });

    let curY4 = 24;

    curY4 = sectionHeader('Decisiones tomadas', curY4);

    // Intro paragraph
    const appliedCount = history.filter(h => h.was_applied).length;
    const actionCounts: Record<string, number> = {};
    for (const h of history) {
      if (h.was_applied) actionCounts[h.action_type] = (actionCounts[h.action_type] || 0) + 1;
    }
    const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];
    const topActionLabel = topAction ? ACTION_LABEL[topAction[0]] ?? topAction[0] : 'N/A';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dark);
    const introLines = doc.splitTextToSize(
      `Se registran ${appliedCount} decision${appliedCount !== 1 ? 'es' : ''} aplicada${appliedCount !== 1 ? 's' : ''} en esta tienda. ` +
      `La accion mas frecuente fue "${topActionLabel}". ` +
      `Cada decision impacta directamente en el margen promedio y la salud financiera del negocio.`,
      CW
    );
    doc.text(introLines, M, curY4);
    curY4 += introLines.length * 5 + 10;

    // Applied actions table
    const historyRows = history
      .filter(h => h.was_applied)
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
      .map(h => {
        const d = new Date(h.applied_at);
        const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        return [
          h.product_name,
          ACTION_LABEL[h.action_type] ?? h.action_type,
          `Opcion ${h.option_id}`,
          dateStr,
          timeStr,
        ];
      });

    autoTable(doc, {
      startY: curY4,
      head: [['Producto', 'Accion aplicada', 'Opcion', 'Fecha', 'Hora']],
      body: historyRows,
      margin: { left: M, right: M },
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
        font: 'helvetica',
        textColor: C.dark,
        lineColor: C.border,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: C.green,
        textColor: C.white,
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 19, halign: 'center' },
      },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 1) {
          // Color by action type
          const actionType = history.filter(h => h.was_applied)
            .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
            [data.row.index]?.action_type;
          if (actionType) data.cell.styles.textColor = ACTION_COLOR[actionType] ?? C.dark;
        }
      },
    });

    // Impact summary section
    const tableEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? curY4 + 60;
    let impY = tableEndY + 14;

    // Check space
    if (impY > 240) { doc.addPage(); impY = 24; }

    impY = sectionHeader('Impacto estimado en la tienda', impY);

    // 3 stat boxes
    const impStats = [
      {
        label: 'Acciones registradas',
        value: String(appliedCount),
        color: C.green,
      },
      {
        label: 'Productos intervenidos',
        value: String(new Set(history.filter(h => h.was_applied).map(h => h.product_id)).size),
        color: C.green,
      },
      {
        label: 'Margen promedio actual',
        value: `${metrics.avg_margin.toFixed(1)}%`,
        color: metrics.avg_margin >= 20 ? C.green : metrics.avg_margin >= 0 ? C.amber : C.red,
      },
    ];

    const IW = (CW - 8) / 3;
    const IH = 24;
    impStats.forEach((s, i) => {
      const x = M + i * (IW + 4);
      doc.setFillColor(...C.white);
      doc.roundedRect(x, impY, IW, IH, 2, 2, 'F');
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, impY, IW, IH, 2, 2, 'S');
      doc.setFillColor(...s.color);
      doc.rect(x, impY, 2.5, IH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...s.color);
      doc.text(s.value, x + 7, impY + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.text(s.label, x + 7, impY + 18);
    });

    impY += IH + 10;

    // Contextual insight box
    const insightText = metrics.avg_margin >= 20
      ? `La tienda opera con un margen promedio saludable del ${metrics.avg_margin.toFixed(1)}%. Las decisiones aplicadas contribuyeron a mantener la rentabilidad por encima del umbral recomendado.`
      : `El margen promedio actual es del ${metrics.avg_margin.toFixed(1)}%. Se recomienda revisar los productos criticos y considerar nuevas acciones correctivas para alcanzar el objetivo del 20%.`;

    const insightLines = doc.splitTextToSize(insightText, CW - 12);
    const insightH = insightLines.length * 4.8 + 8;

    doc.setFillColor(...C.bg);
    doc.rect(M, impY, CW, insightH, 'F');
    doc.setFillColor(...(metrics.avg_margin >= 20 ? C.green : C.amber));
    doc.rect(M, impY, 2.5, insightH, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dark);
    doc.text(insightLines, M + 7, impY + 5.5);

    addFooter(4, totalPages);
  }

  // ── Save ──
  const filename = `LETO-Reporte-${storeName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
