# Application Layer Dashboard — Dual-Panel Activity & Protocol Visualizer

## Assignment coverage
This project implements the required two-panel dashboard:
- Left: Browsing, Mail, Streaming activities with controls, status, and activity log.
- Right: synchronized sequential visualization of DNS, HTTP, and SMTP messages.
- Visualization controls: Previous, Pause/Resume, Next, Replay.
- Direction, timing, key fields, protocol names, and exact example commands are shown.
- Protocols are simulated; no real DNS/SMTP/video traffic is generated.

The assignment explicitly permits simulated protocols and prefers Python + Flask/FastAPI + HTML/JS. It also requires evidence of AI assistance and a reflection. See the supplied assignment specification. 

## Run
Windows:
1. Install Python 3.10+.
2. Open a terminal in this folder.
3. Run `pip install -r requirements.txt`.
4. Run `python app.py`.
5. Open http://127.0.0.1:5000

## Files
- `app.py` — Flask server
- `templates/index.html` — dashboard UI
- `static/style.css` — styling
- `static/app.js` — activity/protocol simulation and synchronization
- `requirements.txt` — dependency
- `AI_USAGE_LOG.md` — AI development evidence/log template
- `REFLECTION.md` — submission reflection
- `DEMO_SCRIPT.md` — 2–4 minute demo script
