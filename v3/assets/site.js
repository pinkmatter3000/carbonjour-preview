// 海浦麒官网公共脚本：语言切换、导航状态、句子高亮、联系表单
(function(){
  var nav=document.getElementById('nav'),burger=document.getElementById('burger'),menu=document.getElementById('menu');
  var I18N_EN=window.I18N_EN||{};

  // ---- i18n ----
  var metaDesc=document.querySelector('meta[name=description]');
  var zh={docTitle:document.title,docDesc:metaDesc?metaDesc.content:'',menuOpen:'打开菜单',menuClose:'关闭菜单'};
  var textEls=[].slice.call(document.querySelectorAll('[data-i18n]'));
  var attrEls=[].slice.call(document.querySelectorAll('[data-i18n-attr]'));
  textEls.forEach(function(el){var k=el.getAttribute('data-i18n');if(!(k in zh))zh[k]=el.innerHTML});
  attrEls.forEach(function(el){el.getAttribute('data-i18n-attr').split(';').forEach(function(p){var kv=p.split(':');if(!(kv[1] in zh))zh[kv[1]]=el.getAttribute(kv[0])})});
  var page=document.body.getAttribute('data-page')||'home';
  var lang='zh';
  function t(k){return (lang==='en'?I18N_EN:zh)[k]}
  function setLang(l,push){
    lang=l==='en'?'en':'zh';
    document.documentElement.lang=lang==='en'?'en':'zh-CN';
    document.documentElement.setAttribute('data-lang',lang);
    textEls.forEach(function(el){var v=t(el.getAttribute('data-i18n'));if(v!=null)el.innerHTML=v});
    attrEls.forEach(function(el){el.getAttribute('data-i18n-attr').split(';').forEach(function(p){var kv=p.split(':');var v=t(kv[1]);if(v!=null)el.setAttribute(kv[0],v)})});
    var title=lang==='en'?I18N_EN['title_'+page]:zh.docTitle;if(title)document.title=title;
    if(metaDesc){var d=lang==='en'?I18N_EN['desc_'+page]:zh.docDesc;if(d)metaDesc.content=d}
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lang')===lang)});
    if(burger)burger.setAttribute('aria-label',t(document.body.classList.contains('menu-open')?'menuClose':'menuOpen'));
    try{localStorage.setItem('cj-lang',lang)}catch(e){}
    if(push){try{var u=new URL(location.href);if(lang==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');history.replaceState(null,'',u)}catch(e){}}
  }
  document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'),true)})});
  var initial=location.hash==='#en'?'en':new URLSearchParams(location.search).get('lang');
  if(!initial){try{initial=localStorage.getItem('cj-lang')}catch(e){}}
  if(!initial&&navigator.language&&!/^zh/i.test(navigator.language))initial='en';
  setLang(initial==='en'?'en':'zh',false);

  // ---- nav: transparent over the photo hero, light over light sections, dark over dark ones ----
  var hero=document.getElementById('top');
  var deepSecs=[].slice.call(document.querySelectorAll('.band,.witness,.marquee,footer'));
  function onScroll(){
    var y=72;
    var overHero=hero?hero.getBoundingClientRect().bottom>y:false;
    var overDeep=deepSecs.some(function(s){var r=s.getBoundingClientRect();return r.top<=y&&r.bottom>y});
    // transparent over the photo hero; frosted dark once scrolled over it or over dark bands; frosted light elsewhere
    nav.classList.toggle('dark',(overHero&&window.scrollY>8)||(!overHero&&overDeep));
    nav.classList.toggle('light',!overHero&&!overDeep);
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  // ---- full-screen menu ----
  function setMenu(open){
    document.body.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open);
    burger.setAttribute('aria-label',t(open?'menuClose':'menuOpen'));
    if(open){var first=menu.querySelector('a');if(first)setTimeout(function(){first.focus()},50)}else{burger.focus()}
  }
  if(burger){
    burger.addEventListener('click',function(){setMenu(!document.body.classList.contains('menu-open'))});
    menu.addEventListener('click',function(e){if(e.target.closest('a'))document.body.classList.remove('menu-open')});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('menu-open'))setMenu(false)});
  }

  // ---- statement lines: brighten the line nearest the middle of the screen ----
  // statement: phrases darken one by one as they scroll past 70% of the screen; all readable at rest
  var lineEls=[].slice.call(document.querySelectorAll('#lines > span'));
  if(lineEls.length&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var tick=function(){var edge=innerHeight*.72;lineEls.forEach(function(s){s.classList.toggle('on',s.getBoundingClientRect().top<edge)})};
    window.addEventListener('scroll',tick,{passive:true});tick();
  }else{lineEls.forEach(function(s){s.classList.add('on')})}

  // ---- contact form: no backend yet, compose an email to the company ----
  var form=document.getElementById('form');
  if(!form)return;
  function field(id){return document.getElementById(id).closest('.f')}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true;
    form.querySelectorAll('.f').forEach(function(f){f.classList.remove('invalid')});
    var intent=form.querySelector('input[name=intent]:checked');
    if(!intent){form.querySelector('.intents').closest('.f').classList.add('invalid');ok=false}
    if(!document.getElementById('name').value.trim()){field('name').classList.add('invalid');ok=false}
    var ph=document.getElementById('phone').value.trim(),em=document.getElementById('email').value.trim();
    var phOk=lang==='en'?/^\+?[\d\s()-]{6,20}$/.test(ph):/^(\+?86)?1[3-9]\d{9}$/.test(ph.replace(/[\s-]/g,''));
    if(ph&&!phOk){field('phone').classList.add('invalid');ok=false}
    if((!ph&&!em)||(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))){field('email').classList.add('invalid');ok=false}
    if(!document.getElementById('msg').value.trim()){field('msg').classList.add('invalid');ok=false}
    if(!ok){var first=form.querySelector('.invalid input,.invalid textarea');if(first)first.focus();return}
    var intentLabel=intent.nextElementSibling.textContent;
    var lines=[t('fIntent')+': '+intentLabel,t('fName')+': '+document.getElementById('name').value.trim(),t('fOrg')+': '+document.getElementById('org').value.trim(),t('fPhone')+': '+ph,t('fEmail')+': '+em,'',document.getElementById('msg').value.trim()];
    var subject=(lang==='en'?'Website inquiry: ':'官网咨询：')+intentLabel;
    location.href='mailto:djh@carbonjour.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    document.getElementById('sent').classList.add('show');
  });
})();
