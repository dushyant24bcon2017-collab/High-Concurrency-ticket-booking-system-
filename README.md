<img width="2661" height="672" alt="api GATEWAY" src="https://github.com/user-attachments/assets/e67a345d-4195-4880-ba31-5d66448f2082" />
Tech Stack
Core: Node.js, Express, TypeScript
In-Memory Store: Redis
Proxy: http-proxy-middleware
Concurrency Control: Embedded Lua Scripting

Core Architecture & Features
Reverse Proxy Routing: Seamlessly intercepts and securely forwards client requests to internal downstream services while masking the internal network architecture.
Strict API Key Authentication: Acts as the first line of defense, validating x-api-key headers against active client registries stored in Redis. Strips sensitive keys before forwarding to internal services.
Atomic Rate Limiting (Token Bucket): Custom-built rate limiter utilizing the Token Bucket algorithm.
Lua Scripting for Concurrency: To prevent race conditions during high-concurrency traffic bursts, the rate limiting logic is embedded natively into Redis via a Lua script, ensuring 100% atomic read/write 
operations at lightning speed.

I learnt a lot throught this project, how race condition are handled with lua scripts how redis provides lighting fast in-memory , I also learnt about all the rate limiting algorithms , how revere proxies work . In 
the end this project was a great eperience that really leveled up my understanding of system architecture
