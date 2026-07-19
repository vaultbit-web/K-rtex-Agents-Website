/* ============================================================
   KÓRTEX — comportamientos compartidos (home + producto + confianza)
   Cada bloque comprueba si su nodo existe (if(!el) return), así que
   cada página ejecuta solo lo que encuentra en su DOM.
   ============================================================ */

// Mobile menu (overlay a pantalla completa)
(function(){
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobileMenu');
  if(!toggle || !menu) return;
  var closeBtn = menu.querySelector('.mm-close');
  function open(){
    menu.hidden = false;
    requestAnimationFrame(function(){ menu.classList.add('is-open'); });
    toggle.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
  }
  function close(){
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    setTimeout(function(){ menu.hidden = true; }, 320);
    toggle.focus();
  }
  toggle.addEventListener('click', open);
  if(closeBtn) closeBtn.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
})();

// Sticky mobile CTA: ocultar sobre el héroe y sobre el CTA final (#contacto)
(function(){
  var bar = document.getElementById('mobileCta');
  if(!bar || !('IntersectionObserver' in window)) return;
  var hero = document.querySelector('.xhero');
  var contacto = document.getElementById('contacto');
  var visible = new Set();
  var o = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
    });
    bar.classList.toggle('hide', visible.size > 0);
  }, {threshold: 0.05});
  if(hero) o.observe(hero);
  if(contacto) o.observe(contacto);
})();

// FAQ accordions (accessible)
document.querySelectorAll('.qa .q').forEach(function(btn){
  btn.addEventListener('click', function(){
    var qa = btn.closest('.qa');
    var wasOpen = qa.classList.contains('open');
    document.querySelectorAll('.qa').forEach(function(o){
      o.classList.remove('open');
      var b = o.querySelector('.q'); if(b) b.setAttribute('aria-expanded','false');
    });
    if(!wasOpen){ qa.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
  });
});

// Flip cards (pilares): click / Enter / Space gira; hover en desktop vía CSS
document.querySelectorAll('.flip').forEach(function(card){
  card.addEventListener('click', function(){
    var flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  });
});

// Reveal on scroll
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

// Manifesto: word-by-word reveal
(function(){
  var st = document.getElementById('statement');
  if(!st) return;
  var idx = 0;
  function wrapWords(node){
    var children = Array.prototype.slice.call(node.childNodes);
    children.forEach(function(child){
      if(child.nodeType === 3){
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function(part){
          if(/^\s+$/.test(part) || part === ''){ frag.appendChild(document.createTextNode(part)); }
          else{
            var s = document.createElement('span');
            s.className = 'w'; s.style.setProperty('--i', idx++); s.textContent = part;
            frag.appendChild(s);
          }
        });
        node.replaceChild(frag, child);
      } else if(child.nodeType === 1){ wrapWords(child); }
    });
  }
  wrapWords(st);
  var sio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ st.classList.add('in'); sio.disconnect(); }
    });
  }, {threshold: 0.4});
  sio.observe(st);
})();

// Journey: sync sticky visual with steps
(function(){
  var steps = document.querySelectorAll('.j-step');
  var imgs = document.querySelectorAll('#jvisual img');
  var tag = document.getElementById('jtag');
  if(!steps.length) return;
  var jio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        steps.forEach(function(s){ s.classList.remove('on'); });
        e.target.classList.add('on');
        var n = e.target.getAttribute('data-img');
        imgs.forEach(function(im){ im.classList.toggle('on', im.getAttribute('data-j') === n); });
        if(tag){ tag.textContent = e.target.getAttribute('data-tag'); }
      }
    });
  }, {rootMargin: '-42% 0px -42% 0px'});
  steps.forEach(function(s){ jio.observe(s); });
})();

// Count-up numbers (es-ES formatting)
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fmt(v, dec){ return v.toLocaleString('es-ES', {minimumFractionDigits:dec, maximumFractionDigits:dec}); }
function countUp(el){
  var target = parseFloat(el.getAttribute('data-count'));
  var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
  if(reduced){ el.textContent = fmt(target, dec); return; }
  var t0 = null, dur = 1400;
  function frame(t){
    if(!t0) t0 = t;
    var p = Math.min((t - t0) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * eased, dec);
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
var cio = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){ countUp(e.target); cio.unobserve(e.target); }
  });
}, {threshold: 0.5});
document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

// Nav: condensed state after scrolling past the hero fold
(function(){
  var nav = document.querySelector('.nav');
  if(!nav) return;
  var ticking = false;
  function update(){
    nav.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(update); }
  }, {passive:true});
  update();
})();

// Teaser del centro de operaciones (home): rotación suave de eventos simulados
(function(){
  var stream = document.getElementById('mctStream');
  if(!stream) return;
  if(reduced) return; // WCAG 2.2.2: sin rotación automática con reduced motion (quedan los eventos estáticos)
  var POOL = [
    ['Vega · Agente de citación', 'Ha atendido una llamada y ha agendado una resonancia para el jueves.', 'Cita confirmada', 'ok'],
    ['Lola · Agente de reputación', 'Nueva reseña respondida con el tono del centro.', '', ''],
    ['Hugo · Agente de captación', 'Consulta por la web respondida en menos de un minuto.', 'Al momento', 'ok'],
    ['Celia · Agente de familias', 'Ha atendido la llamada de una familia, con calma y sin prisas.', '', ''],
    ['Clara · Agente de dosimetría & QA', 'QA diario archivado con fecha, equipo y responsable.', 'Archivado', 'ok'],
    ['Jara · Agente de agenda', 'Cancelación detectada: hueco ofrecido a la lista de espera.', 'Hueco recuperado', 'ok'],
    ['Alma · Agente de acompañamiento RT', 'Ha preguntado a 6 pacientes cómo se encuentran tras su sesión.', '', ''],
    ['Olmo · Agente de supervisión', 'Ha reunido los partes del día en un solo informe.', '', '']
  ];
  var i = 0;
  function hhmm(){ return new Date().toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'}); }
  setInterval(function(){
    var ev = POOL[i % POOL.length]; i++;
    var card = document.createElement('div');
    card.className = 'mc-ev' + (ev[3] ? ' ' + ev[3] : '');
    card.innerHTML = '<div class="ev-top"><span class="ev-agent">' + ev[0] + '</span><span class="ev-time">' + hhmm() + '</span></div><p>' + ev[1] + '</p>' + (ev[2] ? '<span class="ev-chip">' + ev[2] + '</span>' : '');
    stream.prepend(card);
    while(stream.children.length > 3){ stream.removeChild(stream.lastChild); }
  }, 4600);
})();

// Magnetic buttons (pointer + reduced-motion aware)
(function(){
  if(reduced) return;
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.magnetic').forEach(function(el){
    var raf = null;
    function move(e){
      var r = el.getBoundingClientRect();
      var mx = e.clientX - (r.left + r.width/2);
      var my = e.clientY - (r.top + r.height/2);
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function(){
        el.style.transform = 'translate(' + (mx*0.18).toFixed(1) + 'px,' + (my*0.28).toFixed(1) + 'px)';
      });
    }
    function reset(){ if(raf) cancelAnimationFrame(raf); el.style.transform = ''; }
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', reset);
  });
})();
