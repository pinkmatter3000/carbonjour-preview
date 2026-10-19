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
    if(burger)burger.setAttribute('aria-label',t(nav.classList.contains('open')?'menuClose':'menuOpen'));
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
  var deepSecs=[].slice.call(document.querySelectorAll('.part,.contact,.cta-band,footer'));
  function onScroll(){
    var y=72;
    var overHero=hero?hero.getBoundingClientRect().bottom>y:false;
    var overDeep=deepSecs.some(function(s){var r=s.getBoundingClientRect();return r.top<=y&&r.bottom>y});
    nav.classList.toggle('on-deep',!overHero&&overDeep);
    nav.classList.toggle('solid',!overHero&&!overDeep);
    nav.classList.toggle('glass',overHero&&window.scrollY>8);
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  if(burger){
    burger.addEventListener('click',function(){
      var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',t(o?'menuClose':'menuOpen'));
    });
    menu.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label',t('menuOpen'))}});
  }

  // ---- statement lines: brighten the line nearest the middle of the screen ----
  var lineEls=[].slice.call(document.querySelectorAll('#lines li'));
  if(lineEls.length&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var tick=function(){var mid=innerHeight/2,best=null,bd=1e9;lineEls.forEach(function(li){var r=li.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);if(d<bd){bd=d;best=li}});lineEls.forEach(function(li){li.classList.toggle('on',li===best)})};
    window.addEventListener('scroll',tick,{passive:true});tick();
  }else{lineEls.forEach(function(li){li.classList.add('on')})}

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
