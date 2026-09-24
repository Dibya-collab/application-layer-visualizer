# Reflection — Application + Transport Layer Visualizer

The project began as a two-panel Application Layer activity and protocol visualizer. I extended it with a Transport Layer mode instead of replacing the original work.

The Application Layer still demonstrates Browsing, Mail and Streaming using simulated DNS, HTTP and SMTP exchanges. The new Transport Layer demonstrates how application data is delivered between processes using TCP or UDP. The simulation makes ports, segmentation, sequence numbers, acknowledgements, retransmission, checksum checking, flow control, congestion control, multiplexing and demultiplexing visible.

The TCP retransmission, checksum and congestion-control views are deliberately simplified educational models. This keeps the visualization understandable while avoiding the claim that the browser implements a complete TCP stack in JavaScript.
