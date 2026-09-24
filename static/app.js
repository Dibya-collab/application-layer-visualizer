const $ = id => document.getElementById(id);
let layer = "application", mode = "browsing", messages = [], current = -1, paused = true, timer = null, automaticSession = false, automaticSessionTimer = null;
document.querySelectorAll('input[name="transportStreamType"]').forEach(r=>r.addEventListener("change",()=>{
  if(transportActivity==="streaming") {
    updateStreamingChoiceUI();
    transport.events=[]; transport.index=-1;
    $("transportTimeline").innerHTML="";
    $("stepCounter").textContent="0 / 0";
  }
}));
$("transportQuality").addEventListener("change",()=>{ if(transportActivity==="streaming") updateStreamingChoiceUI(); });

transportActivity = "browsing";
let transport = {events: [], index: -1, timer: null, paused: true, speed: 700, segments: [], checksumOk: true};

const applicationFlows = {
  browsing: [
    ["Client → DNS", "DNS", "Q: A example.com", "Query name: example.com | Type: A"],
    ["DNS → Client", "DNS", "A: 93.184.216.34", "Answer: example.com → 93.184.216.34 | TTL: 300"],
    ["Client → Server", "HTTP", "GET /index.html HTTP/1.1", "Host: example.com\\nAccept: text/html"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Content-Type: text/html\\nContent-Length: 1256"],
  ],
  mail: [
    ["Client → Server", "SMTP", "EHLO student.example", "Client identifies itself to SMTP server"],
    ["Server → Client", "SMTP", "250-mail.example Hello", "250-STARTTLS\\n250 SIZE 10485760"],
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
    ["Client → Server", "HTTP", "GET /movie/master.m3u8 HTTP/1.1", "Host: video.example\\nAccept: application/vnd.apple.mpegurl"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Content-Type: application/vnd.apple.mpegurl | Manifest returned"],
    ["Client → Server", "HTTP", "GET /movie/720p/seg-001.ts HTTP/1.1", "Segment request #1"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Video segment #1 returned"],
    ["Client → Server", "HTTP", "GET /movie/720p/seg-002.ts HTTP/1.1", "Segment request #2"],
    ["Server → Client", "HTTP", "HTTP/1.1 200 OK", "Video segment #2 returned"],
  ]
};

function log(text){ const li=document.createElement("li"); li.className="log-item"; li.textContent=`${new Date().toLocaleTimeString()} — ${text}`; $("activityLog").prepend(li); }
function setStatus(text, cls="idle"){ $("status").textContent=text; $("status").className=`status ${cls}`; }
function escapeHtml(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

function renderApplication(){
  $("stepCounter").textContent=`${Math.max(current+1,0)} / ${messages.length}`;
  $("timelineFill").style.width=messages.length ? `${((current+1)/messages.length)*100}%` : "0%";
  const root=$("protocolFlow"); root.innerHTML="";
  if(!messages.length){root.innerHTML='<div class="empty-state"><div>🌐</div><h3>No protocol flow yet</h3><p>Perform an activity on the left.</p></div>';return;}
  messages.forEach((m,i)=>{
    const el=document.createElement("div"); el.className=`message ${i<=current?"visible":""}`;
    const isClient=m[0].startsWith("Client");
    el.innerHTML=`<div class="direction">${escapeHtml(m[0])}<div class="arrow">${isClient?"→":"←"}</div><small>t+${(i*0.4).toFixed(1)}s</small></div><div class="card ${isClient?"client":"server"}"><div class="meta"><span class="proto">${escapeHtml(m[1])}</span><span>Step ${i+1}</span></div><div class="payload">${escapeHtml(m[2])}<span class="key">${escapeHtml(m[3])}</span></div></div>`;
    root.appendChild(el);
  });
}
function startApplicationFlow(newMode){
  clearTimeout(automaticSessionTimer);
  mode=newMode; messages=applicationFlows[mode]; current=-1; paused=false; renderApplication(); setStatus("Running","running");
  $("flowDescription").textContent = mode==="browsing" ? "DNS → HTTP request/response" : mode==="mail" ? "SMTP conversation" : "DNS → HTTP manifest → video segments";
  clearInterval(timer); timer=setInterval(()=>{if(!paused) nextApplication();},800);
}
function nextApplication(){
  if(current<messages.length-1){
    current++;
    renderApplication();
  } else {
    clearInterval(timer);
    paused=true;
    setStatus("Complete","done");
    $("pauseViz").textContent="▶ Resume";
    if(automaticSession){
      const order=["browsing","mail","streaming"];
      const next=order.indexOf(mode)+1;
      if(next<order.length){
        automaticSessionTimer=setTimeout(()=>startApplicationFlow(order[next]),1000);
      } else {
        automaticSession=false;
        $("flowDescription").textContent="Automatic communication session complete — Browsing → Mail → Streaming.";
      }
    }
  }
}
function prevApplication(){if(current>0){current--;renderApplication();setStatus("Running","running");}}
function replayApplication(){automaticSession=false;clearTimeout(automaticSessionTimer);current=-1;paused=false;setStatus("Running","running");renderApplication();clearInterval(timer);timer=setInterval(()=>{if(!paused)nextApplication()},800);}

function runAutomaticCommunicationSession(){
  automaticSession=true;
  clearTimeout(automaticSessionTimer);
  const first="browsing";
  $("flowDescription").textContent="Automatic communication session starting: Browsing → Mail → Streaming.";
  log("Automatic session: Browsing → Mail → Streaming");
  startApplicationFlow(first);
}

function setLayer(newLayer){
  layer=newLayer;
  document.querySelectorAll(".layer-tab").forEach(x=>x.classList.toggle("active",x.dataset.layer===layer));
  const app=layer==="application";
  $("applicationControls").classList.toggle("hidden",!app); $("transportControls").classList.toggle("hidden",app);
  $("applicationVisualization").classList.toggle("hidden",!app); $("transportVisualization").classList.toggle("hidden",app);
  $("pageTitle").textContent=app?"Application Layer Visualizer":"Transport Layer Protocol Visualizer";
  $("pageSubtitle").textContent=app?"Browsing • Mail • Streaming — simulated protocol flows":"Interactive visualization of TCP and UDP transport-layer functions";
  $("panelHint").textContent=app?"Perform an application-layer activity.":"Enter data and watch process-to-process transport step by step.";
  $("visualTitle").textContent=app?"Protocol Visualization":"Transport Protocol Visualization";
  if(app){$("flowDescription").textContent="Choose an activity to begin.";setStatus("Ready");}
  else {
    setStatus("Ready");
    setTransportActivity(transportActivity || "browsing");
    resetTransport();
    // Transport communication is automatic after the user chooses the activity.
    setTimeout(()=>{
      if(transportActivity==="browsing"){ $("transportData").value=`GET ${$("transportUrlInput").value.trim()||"https://example.com/index.html"}\nHTTP request`; }
      else if(transportActivity==="mail"){ $("transportData").value=`To: ${$("transportToInput").value}\nSubject: ${$("transportSubjectInput").value}\n${$("transportBodyInput").value}`; }
      else { $("transportStreamState").textContent=`Playing ${$("transportQuality").value}`; updateStreamingChoiceUI(); }
      startTransport();
    },150);
  }
}

function clampInt(v,min,max,def){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):def;}
function makeSegments(data,size){const out=[];for(let i=0;i<data.length;i+=size)out.push(data.slice(i,i+size));return out.length?out:[""];}
function checksum(payload){let sum=0;for(let i=0;i<payload.length;i++)sum=(sum+payload.charCodeAt(i))&0xffff;return sum.toString(16).padStart(4,"0").toUpperCase();}
function getStreamingProtocol(){
  const selected=document.querySelector('input[name="transportStreamType"]:checked');
  return selected && selected.value === "live" ? "UDP" : "TCP";
}
function updateStreamingChoiceUI(){
  const live=getStreamingProtocol()==="UDP";
  $("activityTransportProtocol").textContent=live?"UDP":"TCP";
  $("transportProtocol").value=live?"UDP":"TCP";
  $("transportProtocolDisplay").value=live?"UDP":"TCP";
  $("flowDescription").textContent=live ? "Live streaming → UDP real-time media datagrams" : "Recorded streaming → HTTP media over TCP";
  $("streamTypeHint").textContent=live ? "Live streaming is shown with a UDP real-time media model." : "Recorded streaming is shown as HTTP media over TCP.";
  $("transportData").value=live ? `Live ${$("transportQuality").value} media\nUDP datagrams` : `Recorded ${$("transportQuality").value} media\nHTTP byte stream`;
}

function buildTransportEvents(){
  // The selected activity is the single source of truth: Browsing/Mail = TCP, Streaming = UDP.
  const protocol = transportActivity === "streaming" ? getStreamingProtocol() : "TCP";
  $("transportProtocol").value = protocol;
  $("transportProtocolDisplay").value = protocol;
  $("activityTransportProtocol").textContent = protocol;
  const data=$("transportData").value || "Hello Transport Layer!", size=clampInt($("segmentSize").value,1,20,5);
  const srcPort=clampInt($("sourcePort").value,1,65535,5000),dstPort=clampInt($("destPort").value,1,65535,8080),srcIp=$("sourceIp").value.trim()||"192.168.1.10",dstIp=$("destIp").value.trim()||"192.168.1.20";
  const loss=$("lossToggle").checked,error=$("errorToggle").checked; transport.segments=makeSegments(data,size); transport.checksumOk=!error;
  const ev=[]; const add=(kind,direction,title,detail,header,explain,drop=false)=>ev.push({kind,direction,title,detail,header,explain,drop});
  if(protocol==="TCP"){
    add("control","out","SYN →","Client requests a TCP connection.",`Source Port: ${srcPort} | Destination Port: ${dstPort}\nSEQ: 1000\nFlags: SYN\nWindow: 64000`,"SYN starts connection establishment and carries the first sequence number.");
    add("control","in","← SYN-ACK","Server accepts the request and acknowledges it.",`Source Port: ${dstPort} | Destination Port: ${srcPort}\nSEQ: 5000\nACK: 1001\nFlags: SYN, ACK\nWindow: 32000`,"SYN-ACK combines a server SYN with an ACK for the client's SYN.");
    add("control","out","ACK →","Client acknowledges the server.",`Source Port: ${srcPort} | Destination Port: ${dstPort}\nSEQ: 1001\nACK: 5001\nFlags: ACK`,"The three-way handshake is complete; the connection is established.");
  }
  add("control","out",protocol==="TCP"?"PORT ADDRESSING →":"PORT ADDRESSING →",`${srcIp}:${srcPort} → ${dstIp}:${dstPort}`,`Source IP: ${srcIp}\nDestination IP: ${dstIp}\nSource Port: ${srcPort}\nDestination Port: ${dstPort}`,"Ports identify the sending and receiving application processes. This is process-to-process delivery.");
  add("control","out","MULTIPLEXING →","Multiple application streams can share the transport layer.",`Browser → ${srcPort}\nMail → ${srcPort+1}\nVideo → ${srcPort+2}`,"Multiplexing combines data from different application processes before transport delivery.");
  transport.segments.forEach((seg,i)=>{
    const seq=1000+i*size; const c=checksum(seg); const dropped=loss && i===Math.min(1,transport.segments.length-1);
    if(protocol==="TCP"){
      add("data","out",dropped?`SEGMENT ${i+1} → ✕ LOST`:`SEGMENT ${i+1} →`,seg,`Source Port: ${srcPort}\nDestination Port: ${dstPort}\nSEQ: ${seq}\nACK: —\nFlags: PSH, ACK\nWindow: ${Math.max(1200,(transport.segments.length-i)*1200)}\nChecksum: 0x${c}`,dropped?"This simplified simulation drops one TCP segment to demonstrate loss.":"TCP numbers bytes so the receiver can place segments in the correct order.",dropped);
      if(!dropped) add("ack","in",`← ACK ${seq+seg.length}`,`Receiver confirms bytes through ${seq+seg.length-1}.`,`ACK: ${seq+seg.length}\nFlags: ACK\nAdvertised Window: ${Math.max(1200,(transport.segments.length-i-1)*1200)}`,`ACK ${seq+seg.length} means the receiver expects byte ${seq+seg.length} next.`);
      else add("ack","in","← DUPLICATE ACK",`Receiver is still waiting for byte ${seq}.`,`ACK: ${seq}\nFlags: ACK`,"A duplicate ACK is used here as a simplified signal that an earlier segment is missing.");
    } else {
      add("data","out",`QUIC/UDP DATAGRAM ${i+1} →`,seg,`Transport: UDP (QUIC)\nSource Port: ${srcPort}\nDestination Port: ${dstPort}\nLength: ${8+seg.length}\nChecksum: 0x${c}`,"Streaming is visualized as QUIC carried over UDP. UDP is connectionless and does not provide TCP-style SYN, ACK, or retransmission itself.",dropped);
    }
  });
  if(protocol==="TCP" && loss){const i=Math.min(1,transport.segments.length-1),seg=transport.segments[i],seq=1000+i*size;add("retransmit","out","↻ RETRANSMISSION →",seg,`Source Port: ${srcPort}\nDestination Port: ${dstPort}\nSEQ: ${seq}\nFlags: PSH, ACK\nReason: simplified timeout/duplicate-ACK recovery`,"Educational simplification: TCP retransmits the missing segment so the byte stream can be completed.");add("ack","in",`← ACK ${seq+seg.length}`,`Receiver now has the missing bytes.`,`ACK: ${seq+seg.length}\nFlags: ACK`,"The cumulative ACK advances after the missing segment arrives.");}
  add("control","in","REASSEMBLY ←","Receiver orders the received segments into the original byte stream.",`Segments: ${transport.segments.map((_,i)=>i+1).join(" → ")}\nPayload: ${data}`,protocol==="TCP"?"TCP sequence information is used to restore the byte stream.":"UDP datagrams arrive independently; this educational simulation places them back into the media stream for visualization.");
  add("control","in","DEMULTIPLEXING ←",`Destination port ${dstPort} selects the receiving application.`,`Destination Port: ${dstPort}\nTarget: Application process`,"Demultiplexing delivers incoming transport data to the correct process.");
  if(error){add("error","out","⚠ CHECKSUM ERROR",`Corrupted payload detected for one simulated packet.`,`Calculated checksum: 0x${checksum(data)}\nReceived checksum: 0x0000\nResult: INVALID`,protocol==="TCP"?"This demo marks the packet invalid and shows an error; real TCP recovery is more complex.":"UDP checksum can detect corruption, but UDP itself does not retransmit the datagram.");}
  add("done","in","APPLICATION DATA ←",data,`Delivered to destination process at ${dstIp}:${dstPort}`,"The transport layer has completed its educational end-to-end delivery demonstration.");
  return {events:ev,srcPort,dstPort,srcIp,dstIp,data,size,protocol};
}
function updateTransportStatic(cfg){
  $("detectedProtocol").textContent=cfg.protocol; $("srcApp").textContent=`Client : ${cfg.srcPort}`;$("dstApp").textContent=`Server : ${cfg.dstPort}`;$("segmentCount").textContent=cfg.segments.length;
  $("checksumState").textContent=transport.checksumOk?"Valid":"Error simulated";
  $("checksumState").className=transport.checksumOk?"":"bad";
  drawCongestion(cfg);
}
function renderTransport(){
  const ev=transport.events, idx=transport.index; $("stepCounter").textContent=`${Math.max(idx+1,0)} / ${ev.length}`;$("timelineFill").style.width=ev.length?`${((idx+1)/ev.length)*100}%`:"0%";
  $("transportTimeline").innerHTML="";
  ev.forEach((e,i)=>{const el=document.createElement("button");el.className=`event-chip ${i<=idx?"done":""} ${i===idx?"selected":""} ${e.drop?"drop":""}`;el.type="button";el.textContent=e.title;el.addEventListener("click",()=>{transport.paused=true;transport.index=i;renderTransport();});$("transportTimeline").appendChild(el);});
  if(idx<0){$("packetDetails").textContent="Start a simulation to inspect a transport header.";$("explanation").textContent="TCP will show handshake, reliable byte delivery, ACKs and optional retransmission. UDP will show connectionless datagrams.";$("connectionState").textContent="Idle";return;}
  const e=ev[idx];$("packetDetails").textContent=e.header;$("explanation").textContent=e.explain;$("connectionState").textContent=e.kind==="control"&&e.title.includes("SYN")?"Handshaking":e.title.includes("ESTABLISHED")?"Established":e.kind==="done"?"Delivered":"Transferring";
  $("packetDot").classList.toggle("reverse",e.direction==="in");$("packetDot").classList.add("active");setTimeout(()=>$("packetDot").classList.remove("active"),250);
  const pct=Math.max(0,Math.min(100,((idx+1)/ev.length)*100));$("windowFill").style.width=`${pct}%`;$("windowText").textContent=`Receiver window: ${Math.round(32000*(1-pct/130)).toLocaleString()} bytes (illustrative)`;
}
function stepTransport(){if(transport.index<transport.events.length-1){transport.index++;renderTransport();}else{clearInterval(transport.timer);transport.paused=true;setStatus("Complete","done");$("pauseViz").textContent="▶ Resume";}}
function startTransport(){
  clearInterval(transport.timer);const cfg=buildTransportEvents();transport.cfg=cfg;transport.events=cfg.events;transport.index=-1;transport.paused=false;transport.speed=Number($("simulationSpeed").value);updateTransportStatic(cfg);renderTransport();setStatus("Running","running");$("flowDescription").textContent=`${cfg.protocol} simulation: ${cfg.segments.length} segment${cfg.segments.length===1?"":"s"}, ${cfg.size}-character payload chunks`;
  log(`Transport: started ${cfg.protocol} simulation from port ${cfg.srcPort} to ${cfg.dstPort}`);transport.timer=setInterval(()=>{if(!transport.paused)stepTransport();},transport.speed);
}
function resetTransport(){clearInterval(transport.timer);transport={events:[],index:-1,timer:null,paused:true,speed:700,segments:[],checksumOk:true};$("stepCounter").textContent="0 / 0";$("timelineFill").style.width="0%";$("transportTimeline").innerHTML="";$("packetDetails").textContent="Start a simulation to inspect a transport header.";$("explanation").textContent="TCP and UDP functions will be explained here as the simulation progresses.";$("detectedProtocol").textContent="—";$("connectionState").textContent="Idle";$("segmentCount").textContent="0";$("checksumState").textContent="—";$("windowFill").style.width="0%";$("windowText").textContent="Receiver window: —";$("pauseViz").textContent="Ⅱ Pause";drawCongestion({protocol:$("transportProtocol").value,segments:[]});}
function drawCongestion(cfg){
  const canvas=$("congestionChart"),ctx=canvas.getContext("2d");const w=canvas.clientWidth||300,h=120,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);ctx.strokeStyle="#31445e";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(24,10);ctx.lineTo(24,h-20);ctx.lineTo(w-8,h-20);ctx.stroke();ctx.strokeStyle="#55baff";ctx.lineWidth=2;ctx.beginPath();const vals=[18,34,52,70,84,96,62,46,58,76];vals.forEach((v,i)=>{const x=30+i*((w-45)/(vals.length-1)),y=(h-24)-(v/100)*(h-40);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.fillStyle="#8fa0b8";ctx.font="10px Segoe UI";ctx.fillText("cwnd (simplified)",30,12);ctx.fillText(cfg.protocol==="TCP"?"growth → loss → reduction":"UDP has no built-in TCP congestion window",30,h-5);
}

// Layer and activity controls
document.querySelectorAll(".layer-tab").forEach(btn=>btn.addEventListener("click",()=>setLayer(btn.dataset.layer)));
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
  $(btn.dataset.mode).classList.add("active");
  mode=btn.dataset.mode;
  automaticSession=false;
  clearTimeout(automaticSessionTimer);
  // Every Application Layer activity starts its own visual simulation immediately.
  automaticSession=false;
  if(mode==="browsing") { log(`Browsing: simulation started for ${$("urlInput").value}`); startApplicationFlow("browsing"); }
  else if(mode==="mail") { log(`Mail: SMTP simulation started for ${$("toInput").value}`); startApplicationFlow("mail"); }
  else if(mode==="streaming") { $("streamState").textContent=`Playing at ${$("quality").value}`; log(`Streaming: simulation started at ${$("quality").value}`); startApplicationFlow("streaming"); }
}));
$("visitBtn").onclick=()=>{log(`Browsing: simulated visit to ${$("urlInput").value}`);startApplicationFlow("browsing");};
$("sendBtn").onclick=()=>{log(`Mail: simulated send to ${$("toInput").value} — ${$("subjectInput").value}`);startApplicationFlow("mail");};
$("playBtn").onclick=()=>{$("streamState").textContent=`Playing at ${$("quality").value}`;log(`Streaming: Play at ${$("quality").value}`);startApplicationFlow("streaming");};
$("pauseBtn").onclick=()=>{paused=true;$("streamState").textContent="Paused";setStatus("Paused");};
$("nextBtn").onclick=()=>{if(layer==="application"){paused=true;nextApplication();}else{transport.paused=true;stepTransport();}};
$("prevBtn").onclick=()=>{if(layer==="application"){paused=true;prevApplication();}else{transport.paused=true;if(transport.index>0){transport.index--;renderTransport();}}};
$("replayBtn").onclick=()=>{if(layer==="application")replayApplication();else{transport.index=-1;transport.paused=false;clearInterval(transport.timer);transport.timer=setInterval(()=>{if(!transport.paused)stepTransport();},transport.speed);renderTransport();setStatus("Running","running");}};
$("pauseViz").onclick=()=>{if(layer==="application"){paused=!paused;$("pauseViz").textContent=paused?"▶ Resume":"Ⅱ Pause";}else{transport.paused=!transport.paused;$("pauseViz").textContent=transport.paused?"▶ Resume":"Ⅱ Pause";setStatus(transport.paused?"Paused":"Running",transport.paused?"idle":"running");}};
$("clearLog").onclick=()=>{$("activityLog").innerHTML=""};
$("startTransport").onclick=startTransport;$("pauseTransport").onclick=()=>{$("pauseViz").click();};$("resetTransport").onclick=resetTransport;
function setTransportActivity(tmode){
  transportActivity = tmode;
  const protocol=tmode==="streaming"?getStreamingProtocol():"TCP";
  document.querySelectorAll(".transport-tab").forEach(x=>x.classList.toggle("active",x.dataset.tmode===tmode));
  document.querySelectorAll(".tmode").forEach(x=>x.classList.remove("active"));
  const panel=$("t"+tmode); if(panel) panel.classList.add("active");
  $("transportProtocol").value=protocol;
  $("transportProtocolDisplay").value=protocol;
  $("activityTransportProtocol").textContent=protocol;
  $("flowDescription").textContent=`${tmode[0].toUpperCase()+tmode.slice(1)} uses ${protocol} in this educational transport model.`;
  if(tmode==="streaming") {
    $("transportStreamState").textContent="Paused";
    updateStreamingChoiceUI();
  } else if(tmode==="browsing") {
    $("transportData").value = `HTTP request\nTCP byte stream`;
  } else if(tmode==="mail") {
    $("transportData").value = `SMTP message\nTCP byte stream`;
  }
  // Activity is the single source of truth. Clear any previous TCP event list.
  transport.events=[]; transport.index=-1;
  $("transportTimeline").innerHTML="";
  $("detectedProtocol").textContent=protocol;
  $("stepCounter").textContent="0 / 0";
}

document.querySelectorAll(".transport-tab").forEach(btn=>btn.addEventListener("click",()=>{
  setTransportActivity(btn.dataset.tmode);
  if(btn.dataset.tmode==="browsing"){ $("transportData").value=`GET ${$("transportUrlInput").value.trim()||"https://example.com/index.html"}\nHTTP request`; startTransport(); log("Transport Browsing: TCP simulation started"); }
  else if(btn.dataset.tmode==="mail"){ $("transportData").value=`To: ${$("transportToInput").value}\nSubject: ${$("transportSubjectInput").value}\n${$("transportBodyInput").value}`; startTransport(); log("Transport Mail: TCP simulation started"); }
  else { $("transportStreamState").textContent=`Playing ${$("transportQuality").value}`; startTransport(); log(`Transport Streaming: ${getStreamingProtocol()} simulation started`); }
}));
$("transportVisitBtn").onclick=()=>{
  const url=$("transportUrlInput").value.trim()||"https://www.google.com";
  $("transportData").value=`GET ${url}\nTransport payload`;
  setTransportActivity("browsing");
  startTransport();
  log(`Transport Browsing: TCP visualization started for ${url}`);
};
$("transportSendBtn").onclick=()=>{
  $("transportData").value=`To: ${$("transportToInput").value}\nSubject: ${$("transportSubjectInput").value}\n${$("transportBodyInput").value}`;
  setTransportActivity("mail");
  startTransport();
  log(`Transport Mail: TCP visualization started for ${$("transportToInput").value}`);
};
$("transportPlayBtn").onclick=()=>{
  const type=document.querySelector('input[name="transportStreamType"]:checked')?.value || "recorded";
  const protocol=type==="live"?"UDP":"TCP";
  $("transportStreamState").textContent=`Playing ${type} at ${$("transportQuality").value}`;
  $("transportData").value=type==="live" ? `Live ${$("transportQuality").value} media\nUDP datagrams` : `Recorded ${$("transportQuality").value} media\nHTTP byte stream`;
  setTransportActivity("streaming");
  startTransport();
  log(`Transport Streaming: ${type} visualization started using ${protocol} at ${$("transportQuality").value}`);
};
transportActivity = "browsing";
$("transportProtocol").value="TCP";
window.addEventListener("resize",()=>drawCongestion({protocol:transportActivity==="streaming"?getStreamingProtocol():"TCP",segments:[]}));
renderApplication();setTransportActivity("browsing");drawCongestion({protocol:"TCP",segments:[]});
// No automatic page-load session: the user chooses Browsing, Mail, or Streaming, then that activity runs automatically.
