const $ = id => document.getElementById(id);
let mode = "browsing", messages = [], current = -1, paused = true, timer = null;

const flows = {
  browsing: [
    ["Client → DNS", "DNS", "Q: A example.com", "Query name: example.com | Type: A"],
    ["DNS → Client", "DNS", "A: 93.184.216.34", "Answer: example.com → 93.184.216.34 | TTL: 300"],
    ["Client → Server", "HTTP", "GET /index.html HTTP/1.1", "Host: example.com\nAccept: text/html"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Content-Type: text/html\nContent-Length: 1256"],
  ],
  mail: [
    ["Client → Server", "SMTP", "EHLO student.example", "Client identifies itself to SMTP server"],
    ["Server → Client", "SMTP", "250-mail.example Hello", "250-STARTTLS\n250 SIZE 10485760"],
    ["Client → Server", "SMTP", "MAIL FROM:<student@example.com>", "Envelope sender"],
    ["Server → Client", "SMTP", "250 2.1.0 OK", "Sender accepted"],
    ["Client → Server", "SMTP", "RCPT TO:<student@example.com>", "Envelope recipient"],
    ["Server → Client", "SMTP", "250 2.1.5 OK", "Recipient accepted"],
    ["Client → Server", "SMTP", "DATA", "Client begins message transfer"],
    ["Server → Client", "SMTP", "354 End data with <CRLF>.<CRLF>", "Ready for message content"],
    ["Client → Server", "SMTP", "Subject: Computer Networks Assignment", "Message body follows, ending with a single dot"],
    ["Server → Client", "SMTP", "250 2.0.0 Message accepted", "Message queued"],
    ["Client → Server", "SMTP", "QUIT", "Close SMTP session"],
    ["Server → Client", "SMTP", "221 2.0.0 Bye", "Session closed"],
  ],
  streaming: [
    ["Client → DNS", "DNS", "Q: A video.example", "Query name: video.example | Type: A"],
    ["DNS → Client", "DNS", "A: 203.0.113.20", "Answer: video.example → 203.0.113.20"],
    ["Client → Server", "HTTP", "GET /movie/master.m3u8 HTTP/1.1", "Host: video.example\nAccept: application/vnd.apple.mpegurl"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Content-Type: application/vnd.apple.mpegurl\nManifest returned"],
    ["Client → Server", "HTTP", "GET /movie/720p/seg-001.ts HTTP/1.1", "Segment request #1"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Video segment #1 returned"],
    ["Client → Server", "HTTP", "GET /movie/720p/seg-002.ts HTTP/1.1", "Segment request #2"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Video segment #2 returned"],
  ]
};

function log(text){
  const li=document.createElement("li"); li.className="log-item";
  li.textContent=`${new Date().toLocaleTimeString()} — ${text}`;
  $("activityLog").prepend(li);
}
function setStatus(text, cls="idle"){ $("status").textContent=text; $("status").className=`status ${cls}`; }
function render(){
  $("stepCounter").textContent=`${Math.max(current+1,0)} / ${messages.length}`;
  $("timelineFill").style.width=messages.length ? `${((current+1)/messages.length)*100}%` : "0%";
  $("protocolFlow").innerHTML="";
  if(!messages.length){
    $("protocolFlow").innerHTML='<div class="empty-state"><div>🌐</div><h3>No protocol flow yet</h3><p>Perform an activity on the left.</p></div>'; return;
  }
  messages.forEach((m,i)=>{
    const el=document.createElement("div"); el.className=`message ${i<=current?"visible":""}`;
    const isClient=m[0].startsWith("Client");
    el.innerHTML=`<div class="direction">${m[0]}<div class="arrow">${isClient?"→":"←"}</div><small>t+${(i*0.4).toFixed(1)}s</small></div>
      <div class="card ${isClient?"client":"server"}"><div class="meta"><span class="proto">${m[1]}</span><span>Step ${i+1}</span></div>
      <div class="payload">${escapeHtml(m[2])}\n<span class="key">${escapeHtml(m[3])}</span></div></div>`;
    $("protocolFlow").appendChild(el);
  });
}
function escapeHtml(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function startFlow(newMode){
  mode=newMode; messages=flows[mode]; current=-1; paused=false; render();
  setStatus("Running","running");
  $("flowDescription").textContent = mode==="browsing" ? "DNS → HTTP request/response" : mode==="mail" ? "SMTP conversation" : "DNS → HTTP manifest → video segments";
  clearInterval(timer); timer=setInterval(()=>{ if(!paused) next(); },800);
}
function next(){
  if(current < messages.length-1){current++; render();}
  else {clearInterval(timer); paused=true; setStatus("Complete","done");}
}
function prev(){if(current>0){current--; render(); setStatus("Running","running");}}
function replay(){current=-1;paused=false;setStatus("Running","running");render();clearInterval(timer);timer=setInterval(()=>{if(!paused)next()},800)}
document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active")); $(btn.dataset.mode).classList.add("active"); mode=btn.dataset.mode;
});
$("visitBtn").onclick=()=>{log(`Browsing: visited ${$("urlInput").value}`);startFlow("browsing");};
$("sendBtn").onclick=()=>{log(`Mail: sent to ${$("toInput").value} — ${$("subjectInput").value}`);startFlow("mail");};
$("playBtn").onclick=()=>{ $("streamState").textContent=`Playing at ${$("quality").value}`; log(`Streaming: Play at ${$("quality").value}`); startFlow("streaming");};
$("pauseBtn").onclick=()=>{paused=true;$("streamState").textContent="Paused";setStatus("Paused");};
$("nextBtn").onclick=()=>{paused=true;next()}; $("prevBtn").onclick=()=>{paused=true;prev()};
$("replayBtn").onclick=()=>replay(); $("pauseViz").onclick=()=>{paused=!paused;$("pauseViz").textContent=paused?"▶ Resume":"Ⅱ Pause";};
$("clearLog").onclick=()=>{$("activityLog").innerHTML=""};
render();
