/* ani-lite app.js - vanilla, no framework */
(function(){
"use strict";
var LS_LIB="ani-lite-library-v1", LS_POS="ani-lite-progress-v1";
function load(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
if(!load(LS_LIB,null)){
  save(LS_LIB,[
    {id:"demo-flower",title:"Demo (CC0): Flower",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",sub:"",qualities:[{label:"480p",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}]}
  ]);
}
function lib(){return load(LS_LIB,[])}
function progress(){return load(LS_POS,{})}

// index.html
var q=document.getElementById("q"), list=document.getElementById("list"), add=document.getElementById("add");
if(q&&list){
  function render(){
    var term=(q.value||"").toLowerCase(), items=lib(), p=progress();
    list.innerHTML="";
    items.filter(function(it){return it.title.toLowerCase().indexOf(term)>-1}).slice(0,20).forEach(function(it){
      var li=document.createElement("li");
      var a=document.createElement("a");
      a.href="watch.html?id="+encodeURIComponent(it.id);
      a.textContent=it.title;
      li.appendChild(a);
      var d=document.createElement("div");
      d.className="meta";
      var pr=p[it.id];
      d.textContent=pr&&pr.time>5?("continue: "+Math.floor(pr.time)+"s"):"";
      li.appendChild(d);
      list.appendChild(li);
    });
  }
  q.addEventListener("input",render);
  render();
}
if(add){
  add.addEventListener("submit",function(e){
    e.preventDefault();
    var t=document.getElementById("t").value.trim(),
        u=document.getElementById("u").value.trim(),
        s=document.getElementById("s").value.trim();
    if(!t||!u)return;
    var items=lib();
    items.push({id:"u"+Date.now(),title:t,url:u,sub:s,qualities:[{label:"default 480p",url:u}]});
    save(LS_LIB,items);
    add.reset();
    if(q){q.value="";var ev=new Event("input");q.dispatchEvent(ev);}
    alert("Added. Open it from the list.");
  });
}

// watch.html
var sel=document.getElementById("entry"), qs=document.getElementById("quality"),
    v=document.getElementById("v"), pos=document.getElementById("pos");
if(sel&&v){
  var items=lib(), params=new URLSearchParams(location.search),
      cur=params.get("id")||(items[0]&&items[0].id);
  items.forEach(function(it){
    var o=document.createElement("option");
    o.value=it.id;o.textContent=it.title;
    if(it.id===cur)o.selected=true;
    sel.appendChild(o);
  });
  function current(){return lib().filter(function(x){return x.id===sel.value})[0]||lib()[0]}
  function setQualities(it){
    qs.innerHTML="";
    (it.qualities&&it.qualities.length?it.qualities:[{label:"default 480p",url:it.url}]).forEach(function(qq,i){
      var o=document.createElement("option");
      o.value=qq.url;o.textContent=qq.label||("q"+i);
      qs.appendChild(o);
    });
  }
  function loadVideo(){
    var it=current();if(!it)return;
    setQualities(it);
    var url=qs.value||it.url;
    // clear old tracks
    v.querySelectorAll("track").forEach(function(t){t.remove()});
    if(it.sub){
      var tr=document.createElement("track");
      tr.kind="subtitles";tr.label="sub";tr.srclang="en";tr.src=it.sub;
      v.appendChild(tr);
    }
    if(url.indexOf(".m3u8")>-1&&v.canPlayType("application/vnd.apple.mpegurl")){
      v.src=url;
    }else if(url.indexOf(".m3u8")>-1){
      // lazy hls.js only when needed, keeps first load tiny
      var s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/hls.js@1";
      s.onload=function(){if(window.Hls&&Hls.isSupported()){var h=new Hls();h.loadSource(url);h.attachMedia(v)}else{v.src=url}};
      document.head.appendChild(s);
    }else{
      v.src=url;
    }
    var p=progress()[it.id];
    if(pos)pos.textContent=p&&p.time?"Saved: "+Math.floor(p.time)+"s — press Resume":"";
  }
  sel.addEventListener("change",loadVideo);
  qs.addEventListener("change",loadVideo);
  loadVideo();
  v.addEventListener("timeupdate",function(){
    if(!v.currentTime||v.currentTime<5)return;
    var p=progress();p[sel.value]={time:v.currentTime,at:Date.now()};
    save(LS_POS,p);
  });
  var r=document.getElementById("resume");
  if(r)r.addEventListener("click",function(){
    var p=progress()[sel.value];
    if(p&&p.time)v.currentTime=p.time;
    v.play();
  });
  var c=document.getElementById("clear");
  if(c)c.addEventListener("click",function(){
    var p=progress();delete p[sel.value];save(LS_POS,p);
    if(pos)pos.textContent="";
  });
}
})();
