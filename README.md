# Application + Transport Layer Protocol Visualizer

This project keeps the original Application Layer dashboard and adds an interactive Transport Layer simulator.

## Application Layer
- Browsing: DNS -> HTTP request/response
- Mail: SMTP conversation
- Streaming: DNS -> HTTP manifest -> media segments
- Previous / Next / Pause / Replay controls

## Transport Layer
- TCP and UDP simulation
- Process-to-process delivery and port addressing
- Segmentation and reassembly
- Multiplexing and demultiplexing
- TCP three-way handshake
- TCP sequence numbers and ACKs
- Simplified packet loss and retransmission
- Simplified checksum/error detection
- TCP flow-control window visualization
- Simplified congestion-control visualization
- TCP/UDP header fields
- Animated end-to-end packet flow

The transport layer is an educational simulation. It does not claim to implement the operating system's complete TCP stack.

## Run on Windows
1. Install Python 3.10+.
2. Open a terminal in this folder.
3. Run `py -m pip install -r requirements.txt`.
4. Run `py app.py`.
5. Open `http://127.0.0.1:5000`.

No external website is opened when using the Browsing demo; application-layer traffic is simulated.


### Simulation behavior
Clicking any of the three Application Layer tabs (Browsing, Mail, Streaming) immediately starts its corresponding animated protocol flow. The same behavior is available in the Transport Layer activity tabs.

## Automatic communication session

The Application Layer now starts an automatic communication session when the page loads. It runs Browsing, then Mail, then Streaming without requiring manual activity selection. The existing Previous, Pause, Next, and Replay controls remain available for manual inspection.
