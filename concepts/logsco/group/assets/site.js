(function(){
  var root=document.documentElement;
  try{var s=localStorage.getItem('logsco-theme');if(s)root.dataset.theme=s;}catch(e){}
  var tb=document.getElementById('theme');
  if(tb)tb.addEventListener('click',function(){
    var dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme=dark?'light':'dark';
    try{localStorage.setItem('logsco-theme',root.dataset.theme);}catch(e){}
  });

  // values rail
  var rail=document.getElementById('rail'),prog=document.getElementById('prog');
  if(rail){
    var step=function(d){var c=rail.querySelector('.v');rail.scrollBy({left:d*(c.offsetWidth+14),behavior:'smooth'})};
    document.getElementById('next').onclick=function(){step(1)};
    document.getElementById('prev').onclick=function(){step(-1)};
    rail.addEventListener('scroll',function(){var m=rail.scrollWidth-rail.clientWidth;prog.style.width=(m>0?14+86*rail.scrollLeft/m:100)+'%'},{passive:true});
  }

  // reveal on scroll
  if('IntersectionObserver' in window){
    var rv=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.rv').forEach(function(el,i){el.style.transitionDelay=(i%4)*60+'ms';rv.observe(el)});
  }else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})}

  // preselect enquiry topic from ?topic=
  var t=new URLSearchParams(location.search).get('topic');
  if(t){var r=document.querySelector('.topic input[value="'+t+'"]');if(r)r.checked=true;}

  // draft forms
  var toast=document.getElementById('toast');
  document.querySelectorAll('form[data-draft]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},3000)});
  });
})();
