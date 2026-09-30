
    window.addEventListener('scroll',()=>{const p=window.scrollY/(document.body.scrollHeight-window.innerHeight);const el=document.getElementById('v2-progress');if(el)el.style.width=Math.min(p*100,100)+'%';});
  