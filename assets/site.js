document.addEventListener('DOMContentLoaded',function(){
  if(!('IntersectionObserver' in window)) return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}
    });
  },{threshold:.15,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.service-card').forEach(function(el,i){
    el.style.transitionDelay=(i%2)*0.08+'s';
    io.observe(el);
  });
  document.querySelectorAll('.feature-card,.process-card,.industry-card,.cert-card,.client-card,.testimonial-card,.blog-card').forEach(function(el,i){
    el.style.transitionDelay=(i%3)*0.07+'s';
    io.observe(el);
  });
});

document.querySelectorAll('#mmenu a').forEach(function(a){
  a.addEventListener('click',function(){
    document.getElementById('mmenu').classList.remove('open');
    var t=document.getElementById('mtoggle');t.classList.remove('open');t.setAttribute('aria-expanded','false');
  });
});

document.querySelectorAll('.faq-item').forEach(item=>{
  item.querySelector('.faq-q').addEventListener('click',()=>{
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

(function(){
  function toggle(btnId,gridId,openTxt,closeTxt,scrollEl){
    var b=document.getElementById(btnId),g=document.getElementById(gridId);
    if(!b||!g)return;
    b.addEventListener('click',function(){
      var open=g.classList.toggle('show-all');
      b.classList.toggle('open',open);
      b.setAttribute('aria-expanded',open);
      b.querySelector('span').textContent=open?closeTxt:openTxt;
      if(open){g.querySelectorAll('.testimonial-card').forEach(function(c){c.classList.add('in-view');});}
      else if(scrollEl){document.getElementById(scrollEl).scrollIntoView({behavior:'smooth',block:'start'});}
    });
  }
  toggle('reviewsToggle','reviewsGrid','Show more reviews','Show fewer reviews');
  toggle('galleryToggle','galleryGrid','Show more work','Show less','gallery');

  var lb=document.getElementById('lightbox');if(!lb)return;
  var img=lb.querySelector('img'),cap=lb.querySelector('.lb-cap'),idx=0,list=[];
  function vis(){return Array.prototype.filter.call(document.querySelectorAll('#galleryGrid .g-item'),function(e){return e.offsetParent!==null;});}
  function show(i){list=vis();idx=(i+list.length)%list.length;var f=list[idx];img.src=f.dataset.full;img.alt=f.dataset.title;cap.innerHTML=f.dataset.title;}
  function open(el){list=vis();show(list.indexOf(el));lb.classList.add('open');document.body.style.overflow='hidden';}
  function close(){lb.classList.remove('open');document.body.style.overflow='';img.src='';}
  document.querySelectorAll('#galleryGrid .g-item').forEach(function(el){el.addEventListener('click',function(){open(el);});});
  lb.querySelector('.lb-close').onclick=close;
  lb.querySelector('.lb-prev').onclick=function(e){e.stopPropagation();show(idx-1);};
  lb.querySelector('.lb-next').onclick=function(e){e.stopPropagation();show(idx+1);};
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1);
  });
})();


/* WhatsApp forms (contact + book online) */
document.querySelectorAll('form[data-wa]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var lines=[f.getAttribute('data-wa')];
    f.querySelectorAll('[name]').forEach(function(el){
      var v=(el.value||'').trim();
      if(v){lines.push((el.getAttribute('data-label')||el.name)+': '+v);}
    });
    window.open('https://wa.me/919963098624?text='+encodeURIComponent(lines.join('\n')),'_blank');
    var b=f.querySelector('button[type=submit]');if(b){b.textContent='Opening WhatsApp\u2026';}
  });
});
