(function(){
  var b=document.getElementById('burger'),d=document.getElementById('drawer');
  if(b){
    b.addEventListener('click',function(){var o=d.classList.toggle('open');b.setAttribute('aria-expanded',o)});
    d.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){d.classList.remove('open');b.setAttribute('aria-expanded',false)})});
  }

  if('IntersectionObserver' in window){
    var rv=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.rv').forEach(function(el,i){el.style.transitionDelay=(i%3)*80+'ms';rv.observe(el)});
  }else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})}

  var toast=document.getElementById('toast');
  document.querySelectorAll('form[data-draft]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},3000)});
  });
})();
