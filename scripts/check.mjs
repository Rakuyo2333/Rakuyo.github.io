import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import data from '../assets/content.js';
import { compileMarkdown } from './markdown.mjs';
const ids=new Set();
function visit(items){for(const item of items){assert(!ids.has(item.id),'Duplicate route '+item.id);ids.add(item.id);if(item.file){assert(data.articles[item.id],'Missing article '+item.id);for(const key of data.articles[item.id].entities)assert(data.entities[key],'Missing entity '+key);}if(item.children)visit(item.children);}}
visit(data.contents);
assert.equal(data.contents.filter(item=>item.id!=='about').length,5);
assert.equal(data.contents[1].children.length,5);
assert(Object.keys(data.articles).length >= 2);
assert(data.articles.about.text.includes('493年'));
assert(data.articles['hanhua/ambition/feng'].text.includes('顺理成章地坐上了摄政的位置'));
assert.equal(compileMarkdown('<script>alert(1)</script>',{}).html,'<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
assert.throws(()=>compileMarkdown('[[unknown|词条]]',{}),/Unknown annotation/);
const html=await readFile('dist/index.html','utf8');
assert(!html.includes('__INITIAL_CONTENT__'),'Initial content not generated');
for(const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)"/g))assert((await stat('dist/'+match[1])).isFile(),'Missing asset '+match[1]);
assert((await stat('dist/assets/fonts/book-song.woff2')).size>1000,'Missing web font');
for(const [key,e] of Object.entries(data.entities)){if(e.url)assert(e.url.startsWith('https://'),'Invalid reference URL '+key);if(e.lon)assert(e.lon>=105&&e.lon<=123&&e.lat>=29&&e.lat<=44,'City outside map '+key);}
console.log(`Validated ${ids.size} routes, ${Object.keys(data.articles).length} complete original articles, ${Object.keys(data.entities).length} annotations and local assets.`);
