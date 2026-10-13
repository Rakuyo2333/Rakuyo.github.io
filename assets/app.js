import data from './content.js';
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nodes = new Map();
function indexNodes(items, parents=[]) { items.forEach(item=>{nodes.set(item.id,{...item,parents});if(item.children)indexNodes(item.children,[...parents,item]);}); }
indexNodes(data.contents);
let current = 'about';
function renderToc(items, level=0) {
 return items.map(item=>item.children ? `<details class="toc-group" ${item.id==='hanhua'||item.id==='hanhua/ambition'?'open':''} data-group="${item.id}"><summary>${level===0?`<span class="chapter-number">${item.label}</span>`:''}<span>${level>0?`<small class="part-label">${item.label}</small>`:''}${escape(item.title)}</span></summary>${level===0?`<a class="toc-link" href="#/${item.id}">篇目总览</a>`:''}${renderToc(item.children,level+1)}</details>` : `<a class="toc-link" href="#/${item.id}" data-route="${item.id}">${level===0?`<span class="chapter-number">${item.label}</span>`:''}<span>${level===1?`<small class="part-label">${item.label}</small>`:''}${escape(item.title)}</span></a>`).join('');
}
$('#toc').innerHTML = renderToc(data.contents);
function setMenu(open) {$('#sidebar').classList.toggle('visible',open);$('#sidebar').inert=innerWidth<=760&&!open;$('#scrim').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'关闭目录':'打开目录');}
$('#menu-toggle').onclick=()=>setMenu(!$('#sidebar').classList.contains('visible'));
$('#scrim').onclick=()=>setMenu(false);
function chapterList(items) {return `<div class="chapter-index">${items.map((item,i)=>`<a href="#/${item.id}"><span class="number">${item.label&&item.label.length<3?item.label:String(i+1).padStart(2,'0')}</span><span class="name">${item.label&&item.label.length>=3?`<small class="part-label">${item.label}</small>`:''}${escape(item.title)}</span><small>${item.file?'阅读正文':item.children?'展开篇目':''} ↗</small></a>`).join('')}</div>`;}
function renderRoute() {
  const raw = location.hash.replace(/^#\/?/,'');
  let id; try {id=decodeURIComponent(raw)||'about';}catch{id='about';}
  const node=nodes.get(id); current=id;
  hideAnnotation();setMenu(false);
  if(!node){$('#article').innerHTML='<header class="book-opening"><h1>未找到这页札记</h1></header><div class="empty-note"><p>此篇目地址不存在。</p><a class="text-button" href="#/about">返回卷首 →</a></div>';$('#breadcrumb').textContent='篇目未找到';$('#reading-length').textContent='';document.title='未找到篇目 · 读南北朝史事札记';$('#page-outline').innerHTML='';}
  else {
    const article=data.articles[id];
    $('#breadcrumb').textContent=['卷首',...node.parents.map(p=>p.title),node.title].join(' / ');
    document.title=id==='about'?'读南北朝史事札记':`${node.title} · 读南北朝史事札记`;
    let html;
    if(article){
      const body=article.html.replace(/<h1[^>]*>.*?<\/h1>/s,'');
      const count=article.text.replace(/\s/g,'').length;
      $('#reading-length').textContent=`${count.toLocaleString('zh-CN')} 字 · 约 ${Math.ceil(count/300)} 分钟`;
      const articleContext=node.parents.map(parent=>parent.label?.length>2?`${parent.label} · ${parent.title}`:parent.title).join(' / ') || '原创文章';
      const title=id==='about'?`<header class="book-opening"><span class="eyebrow">一段乱世 · 五篇札记</span><h1>读南北朝史事札记</h1><span class="opening-caption">读史有感，落笔成札。</span></header>`:`<header><p class="book-kicker">${escape(articleContext)}</p><h1>${escape(node.title)}</h1><span class="opening-caption">原创札记</span></header>`;
      const notes=article.entities.length?`<details class="endnotes"><summary>随文注释 · ${article.entities.length} 个词条</summary><ul>${article.entities.map(key=>`<li><button class="entry" data-entity="${key}" aria-haspopup="dialog">${escape(data.entities[key].name)}</button>${escape(data.entities[key].summary)}</li>`).join('')}</ul></details>`:'';
      html=title+`<div class="article-body">${body}</div>`+notes;
      const collection=node.parents[0];
      html+=id==='about'?`<div class="article-navigation"><span>由此开篇</span><a href="#/hanhua/ambition/feng">汉化之殇 · 冯太后 →</a></div>`:`<div class="article-navigation"><a href="#/about">← 卷首与时代背景</a>${collection?`<a href="#/${collection.id}">${escape(collection.title)} · 篇目 →</a>`:''}</div>`;
    }else if(node.children){$('#reading-length').textContent='篇目';html=`<header class="book-opening"><span class="eyebrow">${escape(node.label||'篇目')}</span><h1>${escape(node.title)}</h1></header>${chapterList(node.children)}`;}
    else{$('#reading-length').textContent='尚未刊出';html=`<header class="book-opening"><span class="eyebrow">${escape(node.label||'札记')}</span><h1>${escape(node.title)}</h1></header><div class="empty-note"><p>此篇札记尚未刊出。<br>待作者落笔，再与诸君共读。</p><a class="text-button" href="#/hanhua/ambition/feng">阅读已刊文章：冯太后 →</a></div>`;}
    $('#article').innerHTML=html;
    $('#page-outline').innerHTML=[...$('#article').querySelectorAll('.article-body h2,.article-body h3')].map(h=>`<a href="#${h.id}" data-section="${h.id}">${h.textContent}</a>`).join('');
  }
  document.querySelectorAll('[data-route]').forEach(link=>{link.classList.toggle('active',link.dataset.route===id);if(link.dataset.route===id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  if(node) for(const parent of node.parents){const group=document.querySelector(`[data-group="${parent.id}"]`);if(group)group.open=true;}
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',renderRoute);
$('.skip').addEventListener('click',event=>{event.preventDefault();$('#reading').focus({preventScroll:true});$('#reading').scrollIntoView({behavior:'smooth'});});
$('#page-outline').addEventListener('click',event=>{const link=event.target.closest('[data-section]');if(link){event.preventDefault();document.getElementById(link.dataset.section)?.scrollIntoView({behavior:'smooth'});}});
window.addEventListener('scroll',()=>{const total=document.documentElement.scrollHeight-innerHeight;$('#progress').style.width=(total>0?Math.min(100,scrollY/total*100):100)+'%';},{passive:true});
// Annotations work with hover, keyboard focus, click and touch. Click pins a card.
const annotation=$('#annotation');let noteTarget=null,pinned=false,noteTimer=null;
function noteHTML(entity){return `<span class="eyebrow">${escape(entity.kind)} · 随文百科</span><h3>${escape(entity.name)}</h3><div class="period">${escape(entity.period)}</div><p>${escape(entity.summary)}</p><div class="source">注释来源：${escape(entity.source)}${entity.url?`<br><a href="${escape(entity.url)}" target="_blank" rel="noopener noreferrer">阅读所据文献 ↗</a>`:''}</div>`;}
function showAnnotation(target,lock=false){
 clearTimeout(noteTimer);const entity=data.entities[target.dataset.entity];if(!entity)return;
 if(pinned&&!lock&&target!==noteTarget)return;
 if(noteTarget&&noteTarget!==target)noteTarget.removeAttribute('aria-expanded');
 noteTarget=target;pinned=lock;target.setAttribute('aria-expanded','true');
 annotation.innerHTML=`<button class="close-note" aria-label="关闭注释">×</button>${noteHTML(entity)}${entity.lon?`<button class="text-button" data-map-city="${target.dataset.entity}">在历史地图中查看 ↗</button>`:''}`;
 annotation.hidden=false;const rect=target.getBoundingClientRect();
 const width=annotation.offsetWidth,height=annotation.offsetHeight;
 annotation.style.left=Math.max(12,Math.min(rect.left,innerWidth-width-12))+'px';
 const top=rect.bottom+10+height<innerHeight?rect.bottom+10:rect.top-height-10;
 annotation.style.top=Math.max(12,Math.min(top,innerHeight-height-12))+'px';
 annotation.querySelector('.close-note').onclick=()=>{const old=noteTarget;hideAnnotation();if(old){old.focus({preventScroll:true});hideAnnotation();}};
}
function hideAnnotation(){clearTimeout(noteTimer);annotation.hidden=true;pinned=false;noteTarget?.removeAttribute('aria-expanded');noteTarget=null;}
function delayedHide(){if(!pinned)noteTimer=setTimeout(hideAnnotation,180);}
document.addEventListener('pointerover',event=>{const target=event.target.closest('.entry');if(target&&event.pointerType!=='touch')showAnnotation(target,pinned&&target===noteTarget);});
document.addEventListener('pointerout',event=>{if(event.target.closest('.entry')&&!annotation.contains(event.relatedTarget))delayedHide();});
document.addEventListener('focusin',event=>{if(event.target.matches('.entry'))showAnnotation(event.target,pinned&&event.target===noteTarget);});
document.addEventListener('focusout',event=>{if(event.target.matches('.entry')&&!annotation.contains(event.relatedTarget))delayedHide();});
annotation.addEventListener('pointerenter',()=>clearTimeout(noteTimer));annotation.addEventListener('pointerleave',delayedHide);
document.addEventListener('click',event=>{
 const entry=event.target.closest('.entry');if(entry){showAnnotation(entry,true);return;}
 const mapCity=event.target.closest('[data-map-city]');if(mapCity){const key=mapCity.dataset.mapCity;hideAnnotation();openMap(key);return;}
 if(!annotation.contains(event.target))hideAnnotation();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){hideAnnotation();setMenu(false);}});
window.addEventListener('resize',()=>{hideAnnotation();setMenu(false);});
window.addEventListener('scroll',()=>{if(!annotation.hidden)hideAnnotation();},{passive:true});
// Reading preferences are local to the visitor's browser.
const defaults={size:19,leading:2.1,theme:'paper'};let settings={...defaults};
try{const saved=JSON.parse(localStorage.getItem('shizha-reading')||'null');if(saved){settings.size=Math.max(16,Math.min(26,Number(saved.size)||19));settings.leading=Math.max(1.6,Math.min(2.6,Number(saved.leading)||2.1));settings.theme=['paper','white','night'].includes(saved.theme)?saved.theme:'paper';}}catch{}
function applySettings(){document.documentElement.style.setProperty('--body-size',settings.size+'px');document.documentElement.style.setProperty('--body-leading',settings.leading);document.body.dataset.theme=settings.theme;$('#font-size').value=settings.size;$('#line-height').value=settings.leading;$('#paper-theme').value=settings.theme;$('#size-value').textContent=settings.size+' px';$('#line-value').textContent=settings.leading.toFixed(1);try{localStorage.setItem('shizha-reading',JSON.stringify(settings));}catch{}}
const settingsDialog=$('#settings-dialog');$('#settings-open').onclick=()=>settingsDialog.showModal();
$('#font-size').oninput=event=>{settings.size=Number(event.target.value);applySettings();};
$('#line-height').oninput=event=>{settings.leading=Number(event.target.value);applySettings();};
$('#paper-theme').onchange=event=>{settings.theme=event.target.value;applySettings();};
$('#reset-settings').onclick=()=>{settings={...defaults};applySettings();};applySettings();
// Offline map: historical city locations, approximate rivers, era-specific context.
const mapDialog=$('#map-dialog'),world=$('#map-world'),map=$('#history-map');let zoom=1,pan={x:0,y:0},selectedCity=null;
const project=(lon,lat)=>[(lon-105)/18*760+30,(44-lat)/15*460+20];
const path=coords=>coords.map(([lon,lat],i)=>`${i?'L':'M'}${project(lon,lat).map(n=>n.toFixed(1)).join(',')}`).join(' ');
const eras={
 383:{title:'淝水之战后的南北',text:'前秦南下灭晋，在淝水之战中败于东晋。北方随后再度陷入分裂。',north:'前秦',south:'东晋',keys:['feishui','jiankang'],focus:'feishui'},
 439:{title:'北魏统一北方',text:'太武帝拓跋焘灭北凉，北魏统一北方。南方为刘宋，都城建康；北魏的都城为平城。',north:'北魏',south:'刘宋',keys:['shengle','pingcheng','luoyang','jiankang','feishui'],focus:'pingcheng'},
 490:{title:'冯太后去世，孝文帝亲政',text:'太和十四年，冯太后去世。孝文帝正式亲政，北魏的政治中心此时仍在平城。南方为南齐。',north:'北魏',south:'南齐',keys:['shengle','pingcheng','luoyang','jiankang','ye','yubi'],focus:'pingcheng'},
 493:{title:'由平城，望向洛阳',text:'孝文帝以“南伐”为名南下，进驻洛阳，迁都大计确立。虚线仅表示由平城向洛阳迁都的方向。',north:'北魏',south:'南齐',keys:['shengle','pingcheng','luoyang','jiankang','ye','yubi'],focus:'luoyang'},
 494:{title:'正式迁都洛阳',text:'太和十八年，北魏正式迁都洛阳。以洛阳为新的政治中心，孝文帝进一步推动汉化改革。',north:'北魏',south:'南齐',keys:['shengle','pingcheng','luoyang','jiankang','ye','yubi'],focus:'luoyang'}
};
function mapTransform(){world.setAttribute('transform',`translate(${410+pan.x} ${270+pan.y}) scale(${zoom}) translate(-410 -270)`);$('#zoom-in').disabled=zoom>=2.5;$('#zoom-out').disabled=zoom<=.8;}
function showMapInfo(key){const era=eras[$('#map-era').value];selectedCity=key;const entity=data.entities[key];$('#map-info').innerHTML=entity?noteHTML(entity):`<span class="eyebrow">公元 ${$('#map-era').value} 年</span><h3>${era.title}</h3><p>${era.text}</p><p class="map-era-caption">选择一个地名，阅读它与文章的关联。</p>`;world.querySelectorAll('.map-city').forEach(city=>city.classList.toggle('selected',city.dataset.city===key));}
function renderMap(){
 const year=Number($('#map-era').value),era=eras[year];
 const yellow=[[105.3,38],[106.2,38.5],[106.8,39.4],[108.8,40.2],[110.4,40.1],[111.1,39.7],[110.6,37.6],[110.4,36],[110.5,34.7],[112,34.7],[113.5,34.9],[114.8,35.4],[116.5,36.3],[118.5,37.6]];
 const yangtze=[[105.2,29.4],[106.8,29.6],[108,30.4],[109.5,31],[111,30.8],[112.2,30],[114.3,30.6],[115.2,29.8],[116.5,29.7],[117.3,30.6],[118.8,32],[120,32],[121.2,31.5]];
 const coast=[[119.1,40],[121.1,40.9],[121.7,39.4],[120.1,39.5],[119.4,39],[118.3,39.1],[117.5,38.5],[118.3,38.1],[119.3,37.9],[120.1,37.2],[122.4,37],[122,36.4],[120.4,36],[119.8,35.6],[119.2,34.8],[120,33.1],[121,32],[121.8,31.3],[121.5,30.8],[121,30.7],[121.9,29.8]];
 world.innerHTML=`<path d="${path(coast)} L820,540 L820,0 Z" fill="#cbd5ce" opacity=".42"/><path d="${path(coast)}" fill="none" stroke="#a6b4ab" stroke-width="1.3"/><path d="${path(yellow)}" fill="none" stroke="#8faaa0" stroke-width="2.2"/><path d="${path(yangtze)}" fill="none" stroke="#8faaa0" stroke-width="2.4"/><text class="river-label" x="215" y="338">黄河</text><text class="river-label" x="440" y="450">长江</text><text class="map-region" x="350" y="225">${era.north}</text><text class="map-region" x="300" y="492">${era.south}</text>`;
 if(year>=493){const [x1,y1]=project(113.30,40.08),[x2,y2]=project(112.45,34.62);world.innerHTML+=`<path d="M${x1},${y1} Q${x1+55},${(y1+y2)/2} ${x2},${y2-10}" stroke="#945845" stroke-width="2" stroke-dasharray="5 6" fill="none" marker-end="url(#arrow)"/><text x="${x1+28}" y="${(y1+y2)/2}" fill="#945845" font-size="12">迁都方向</text>`;}
 for(const key of era.keys){const e=data.entities[key],[x,y]=project(e.lon,e.lat);const dy=key==='shengle'?-12:5;world.innerHTML+=`<g class="map-city" data-city="${key}" role="button" tabindex="0" aria-label="查看${escape(e.name)}的历史地理注释"><title>${escape(e.name)} · 点击阅读注释</title><circle cx="${x}" cy="${y}" r="5"/><text x="${x+12}" y="${y+dy}">${escape(e.name)}</text></g>`;}
 mapTransform();showMapInfo(null);
}
function openMap(key){hideAnnotation();mapDialog.showModal();document.body.classList.add('modal-open');zoom=1;pan={x:0,y:0};renderMap();if(key){if(!eras[$('#map-era').value].keys.includes(key)){$('#map-era').value=key==='feishui'?'383':'493';renderMap();}showMapInfo(key);}}
$('#map-open').onclick=()=>openMap();$('#map-close').onclick=()=>mapDialog.close();mapDialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
$('#map-era').onchange=()=>{zoom=1;pan={x:0,y:0};renderMap();};
world.addEventListener('click',event=>{const city=event.target.closest('[data-city]');if(city)showMapInfo(city.dataset.city);});
world.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){const city=event.target.closest('[data-city]');if(city){event.preventDefault();showMapInfo(city.dataset.city);}}});
$('#zoom-in').onclick=()=>{zoom=Math.min(2.5,zoom+.25);mapTransform();};$('#zoom-out').onclick=()=>{zoom=Math.max(.8,zoom-.25);mapTransform();};$('#zoom-reset').onclick=()=>{zoom=1;pan={x:0,y:0};mapTransform();};
let drag=null;map.addEventListener('pointerdown',event=>{if(event.target.closest('[data-city]'))return;drag={x:event.clientX,y:event.clientY,pan:{...pan}};map.setPointerCapture(event.pointerId);});
map.addEventListener('pointermove',event=>{if(!drag)return;const factor=820/map.getBoundingClientRect().width;pan={x:Math.max(-300,Math.min(300,drag.pan.x+(event.clientX-drag.x)*factor)),y:Math.max(-200,Math.min(200,drag.pan.y+(event.clientY-drag.y)*factor))};mapTransform();});
map.addEventListener('pointerup',()=>drag=null);map.addEventListener('pointercancel',()=>drag=null);
for(const dialog of [mapDialog,settingsDialog])dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
renderRoute();
