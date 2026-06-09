/**
 * Simple markdown-to-HTML renderer for LETO legal documents.
 * Handles: headings, paragraphs, bullet/numbered lists, tables,
 * horizontal rules, inline bold, links, and inline code.
 * Content is trusted (canonical V1.1 docs) — dangerouslySetInnerHTML is safe.
 */

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-green-700 hover:underline underline-offset-2">$1</a>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 rounded px-1 py-0.5 text-sm font-mono text-slate-700">$1</code>'
    );
}

export function renderLegalMarkdown(md: string): string {
  const lines = md.split('\n');

  // Strip leading metadata block (e.g. "Status: Official", "Version: V1.1")
  const metadataRe = /^(Status|Version|Owner|Section|Last Updated):/;
  let startIndex = 0;
  while (
    startIndex < lines.length &&
    (metadataRe.test(lines[startIndex].trim()) || lines[startIndex].trim() === '')
  ) {
    startIndex++;
  }

  const src = lines.slice(startIndex);
  let html = '';
  let i = 0;

  while (i < src.length) {
    const raw = src[i];
    const line = raw.trim();

    // Blank line
    if (!line) {
      i++;
      continue;
    }

    // Horizontal rule
    if (line === '---') {
      html += '<hr class="my-8 border-slate-200">';
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      html += `<h1 class="text-3xl font-black text-slate-900 mb-4 mt-2 leading-tight">${inlineFormat(line.slice(2))}</h1>`;
      i++;
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      html += `<h2 class="text-xl font-bold text-slate-900 mt-10 mb-3">${inlineFormat(line.slice(3))}</h2>`;
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      html += `<h3 class="text-base font-bold text-slate-800 mt-6 mb-2">${inlineFormat(line.slice(4))}</h3>`;
      i++;
      continue;
    }

    // Table (lines starting with |)
    if (line.startsWith('|')) {
      let tableHtml =
        '<div class="overflow-x-auto my-6"><table class="w-full text-sm border-collapse">';
      let isHeader = true;
      while (i < src.length && src[i].trim().startsWith('|')) {
        const rowLine = src[i].trim();
        const cells = rowLine
          .split('|')
          .slice(1, -1); // remove first empty and last empty
        // Skip separator row like |---|---|
        if (cells.every((c) => /^[\-: ]+$/.test(c))) {
          i++;
          continue;
        }
        if (isHeader) {
          tableHtml += '<thead><tr>';
          cells.forEach(
            (c) =>
              (tableHtml += `<th class="border border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold text-slate-800">${inlineFormat(c.trim())}</th>`)
          );
          tableHtml += '</tr></thead><tbody>';
          isHeader = false;
        } else {
          tableHtml += '<tr class="even:bg-slate-50">';
          cells.forEach(
            (c) =>
              (tableHtml += `<td class="border border-slate-200 px-4 py-2 align-top text-slate-700">${inlineFormat(c.trim())}</td>`)
          );
          tableHtml += '</tr>';
        }
        i++;
      }
      tableHtml += '</tbody></table></div>';
      html += tableHtml;
      continue;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      html += '<ul class="list-disc list-outside ml-5 space-y-1 my-3">';
      while (i < src.length) {
        const ll = src[i].trim();
        if (ll.startsWith('- ') || ll.startsWith('* ')) {
          html += `<li class="text-slate-700 leading-relaxed">${inlineFormat(ll.slice(2))}</li>`;
          i++;
        } else if (!ll) {
          i++;
          // Peek ahead: if next non-blank is another bullet, continue list
          let j = i;
          while (j < src.length && !src[j].trim()) j++;
          if (
            j < src.length &&
            (src[j].trim().startsWith('- ') || src[j].trim().startsWith('* '))
          ) {
            i = j;
            continue;
          }
          break;
        } else {
          break;
        }
      }
      html += '</ul>';
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      html += '<ol class="list-decimal list-outside ml-5 space-y-1 my-3">';
      while (i < src.length) {
        const ll = src[i].trim();
        if (/^\d+\.\s/.test(ll)) {
          const content = ll.replace(/^\d+\.\s+/, '');
          html += `<li class="text-slate-700 leading-relaxed">${inlineFormat(content)}</li>`;
          i++;
        } else if (!ll) {
          i++;
          let j = i;
          while (j < src.length && !src[j].trim()) j++;
          if (j < src.length && /^\d+\.\s/.test(src[j].trim())) {
            i = j;
            continue;
          }
          break;
        } else {
          break;
        }
      }
      html += '</ol>';
      continue;
    }

    // Regular paragraph
    html += `<p class="text-slate-700 leading-relaxed my-3">${inlineFormat(line)}</p>`;
    i++;
  }

  return html;
}
