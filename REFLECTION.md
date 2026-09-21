# Reflection — Dual-Panel Activity & Protocol Visualizer

## 1. AI platform and model
I used OpenAI ChatGPT (GPT-5.6 Luna) as the AI-assisted development tool. I chose it because it could help me translate the assignment specification into a project architecture, generate the HTML/CSS/JavaScript and Flask structure, and iterate on protocol visualization and documentation. The assignment requires substantial AI assistance and evidence of that assistance, so I retained the AI usage log and will attach screenshots/chat evidence with my submission.

## 2. How the two panels stay synchronized
The dashboard uses JavaScript state to keep the activity and protocol panels synchronized. When the user clicks Visit, Send Mail, or Play, the corresponding activity is written to the activity log and a protocol-flow array is loaded into the right panel. The right panel then progressively reveals one message at a time. Previous, Next, Pause/Resume, and Replay operate on the same message index, so the visualization can be controlled without changing the selected activity.

## 3. What the AI got wrong and how I corrected it
The project uses simulated traffic, so the generated messages are examples rather than packet captures from a live network. I made that limitation explicit in the interface and README. I also checked that the SMTP sequence contains EHLO, MAIL FROM, RCPT TO, DATA and QUIT, and that streaming contains DNS followed by an HTTP manifest request and repeated HTTP segment requests. This avoids presenting the simulation as real socket traffic.

## 4. Differences between the application-layer flows
Browsing is represented as a short DNS-to-HTTP exchange: the client resolves a hostname and then requests a resource with HTTP. Mail is different because SMTP is a conversation with several commands and server replies, including envelope sender and recipient information and a DATA phase. Streaming also begins with DNS and HTTP, but after obtaining a manifest/playlist the client repeatedly requests media segments, allowing the visualization to represent continuing delivery rather than a single page response.

## 5. What I learned
The project connects a visible user action to the protocol messages underneath it. It also showed me why application-layer protocols cannot be understood only from the final user experience: browsing, sending an email, and playing a video look simple to a user but involve different message sequences and state transitions.
