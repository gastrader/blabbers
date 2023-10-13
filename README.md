# Blabbers: A Real-time Communication Platform

Welcome to **Blabbers**, a go implementation of an end-to-end encrypted websocket communication platform.
<div>
   <img src="https://github.com/gastrader/blabbers/assets/37260212/f336cbf3-a85b-47ac-ba18-f2b2d8f5ed80" alt="Blabbers Image" style="width: 50%;">
</div>
---
<br>
### Features

1. **Client Side Encryption**
   - Utilize Web Cryptography APIs to encrpyt/decrypt data.
   - Keys distributed as part of URL so the server can never see it: <br>
     http://localhost:8080/?room=0b158544-5774-44a0-aae4-b0b54952e95f#key=bZn7UbLbJB4_ILIsbgfvUg

2. **Event Handling**
   - Event-driven architecture to manage user interactions.
   - Supports various event types for versatile communication.

3. **OTP Authentication**
   - Secure One-Time Password (OTP) based authentication.
   - Ensures the integrity and confidentiality of user data.

4. **Manager Interface**
   - Centralized management of all active connections.
   - Real-time monitoring and control of user sessions.

5. **Client Management**
   - Efficient handling of client connections.
   - Robust error handling to ensure uninterrupted communication.
     
##Try it for yourself!

```bash
git clone https://github.com/gastrader/blabbers.git
go mod download
go run .



