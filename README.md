# Blabbers: A Real-time Communication Platform

Welcome to **Blabbers**, a go implementation of an end-to-end encrypted websocket communication platform.
<img src="https://github.com/gastrader/blabbers/assets/37260212/dd9a054c-8a82-4680-9f81-0f04390a9409" alt="Blabbers Image" style="width: 50%;">


## Features

1. **Client Side Encryption**
   - Utilize Web Cryptography APIs to encrpyt/decrypt data.
   - Keys distributed as part of URL so the server can never see it: <br>
     http://www.pfglabs.com/?room=0b158544-5774-44a0-aae4-b0b54952e95f#key=bZn7UbLbJB4_ILIsbgfvUg

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
     
## Try it for yourself!

```bash
git clone https://github.com/gastrader/blabbers.git
cd blabbers
go mod download
go run .
```



