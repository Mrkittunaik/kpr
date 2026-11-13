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


/* WhatsApp chat popup (opens from the floating WhatsApp button) */
(function(){
  var fc=document.querySelector('.float-contact');if(!fc)return;
  var wa=fc.querySelector('.fc-wa');if(!wa)return;
  var pop=document.createElement('div');
  pop.className='wa-popup';pop.hidden=true;
  pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Chat on WhatsApp');
  pop.innerHTML=
    '<div class="wa-head"><div class="wa-avatar">K</div>'+
    '<div class="wa-who"><strong>KPR Design &amp; Laser</strong><span>Chat on WhatsApp</span></div>'+
    '<button type="button" class="wa-close" aria-label="Close chat">&times;</button></div>'+
    '<div class="wa-body"><div class="wa-bubble">Hi there &#128075;<br>How can we help you today? Share your requirement and we will get back to you.</div></div>'+
    '<a class="wa-start" href="'+wa.getAttribute('href')+'" target="_blank" rel="noopener">Start chat</a>';
  fc.appendChild(pop);

  function setOpen(o){pop.hidden=!o;wa.setAttribute('aria-expanded',o?'true':'false');}
  wa.setAttribute('aria-expanded','false');
  wa.addEventListener('click',function(e){e.preventDefault();setOpen(pop.hidden);});
  pop.querySelector('.wa-close').addEventListener('click',function(){setOpen(false);});
  pop.querySelector('.wa-start').addEventListener('click',function(){setOpen(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false);});
  document.addEventListener('click',function(e){if(!pop.hidden&&!fc.contains(e.target))setOpen(false);});

  /* show once per visit, after a short delay */
  var seen=false;try{seen=sessionStorage.getItem('waPopupSeen')==='1';}catch(err){}
  if(!seen){
    setTimeout(function(){
      var lb=document.getElementById('lightbox');
      if(lb&&lb.classList.contains('open'))return;
      setOpen(true);
      try{sessionStorage.setItem('waPopupSeen','1');}catch(err){}
    },6000);
  }
})();


/* ===== Auto-update: reload the page when the website has been updated ===== */
(function(){
  if(!/^https?:$/.test(location.protocol)) return;          // skip file:// previews
  var CHECK_MS=30000;                                        // check every 30s
  var baseline=null, busy=false;

  function hash(str){var h=5381,i=str.length;while(i)h=(h*33)^str.charCodeAt(--i);return (h>>>0).toString(36)+str.length;}
  function bust(u){return u+(u.indexOf('?')>-1?'&':'?')+'_=' + Date.now();}
  function get(u){return fetch(bust(u),{cache:'no-store',credentials:'same-origin'}).then(function(r){return r.ok?r.text():'';}).catch(function(){return '';});}

  function assetUrls(){
    var list=[];
    document.querySelectorAll('link[rel="stylesheet"][href],script[src]').forEach(function(el){
      var u=el.href||el.src;
      if(u&&u.indexOf(location.origin)===0) list.push(u.split('?')[0]);
    });
    return list;
  }

  function signature(){
    var urls=[location.pathname+location.search].concat(assetUrls());
    return Promise.all(urls.map(get)).then(function(parts){
      return parts.map(hash).join('|');
    });
  }

  function userIsTyping(){
    var a=document.activeElement;
    return a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&(a.value||'').length>0;
  }

  function hardReload(){
    // refresh the browser cache for css/js first, then reload the page
    Promise.all(assetUrls().concat([location.href]).map(function(u){
      return fetch(u,{cache:'reload'}).catch(function(){});
    })).then(function(){location.reload();});
  }

  function check(){
    if(busy||document.hidden) return;
    busy=true;
    signature().then(function(sig){
      busy=false;
      if(!sig||sig.indexOf('|')===-1&&!sig) return;
      if(baseline===null){baseline=sig;return;}
      if(sig!==baseline){
        if(userIsTyping()) return;                           // don't wipe a half-filled form
        hardReload();
      }
    });
  }

  window.addEventListener('load',function(){setTimeout(check,1500);});
  setInterval(check,CHECK_MS);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)check();});
  window.addEventListener('focus',check);
  window.addEventListener('online',check);
  window.addEventListener('pageshow',function(e){if(e.persisted)hardReload();}); // back/forward cache
})();
