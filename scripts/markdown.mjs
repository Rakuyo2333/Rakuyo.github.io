export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function compileMarkdown(source, entities) {
  const used = new Set(); let heading = 0;
  function inline(value) {
    const parts = value.split(/(\[\[[a-z0-9_-]+\|[^\]\n]+\]\])/g);
    return parts.map(part => {
      const match = part.match(/^\[\[([a-z0-9_-]+)\|([^\]\n]+)\]\]$/);
      if(!match) return escapeHTML(part);
      if(!entities[match[1]]) throw new Error('Unknown annotation: '+match[1]);
      used.add(match[1]);
      return `<button type="button" class="entry" data-entity="${match[1]}" aria-haspopup="dialog" aria-label="查看${escapeHTML(match[2])}注释">${escapeHTML(match[2])}</button>`;
    }).join('');
  }
  const html = source.trim().split(/\r?\n\s*\r?\n/).map(block => {
    const h = block.match(/^(#{1,3})\s+([^\n]+)$/);
    if(h) return `<h${h[1].length} id="section-${++heading}">${inline(h[2])}</h${h[1].length}>`;
    if(block.startsWith('> ')) return `<blockquote><p>${inline(block.replace(/^> ?/gm,''))}</p></blockquote>`;
    return `<p>${inline(block.replace(/\r?\n/g,' '))}</p>`;
  }).join('\n');
  return { html, entities:[...used], text:source.replace(/\[\[[^|]+\|([^\]]+)\]\]/g,'$1').replace(/[#>]/g,'') };
}
