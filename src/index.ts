import express from "express"
import type { Application, Request, Response } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { apicheck } from "./API-Key-Middleware/security";
import { rateLimiter } from "./Rate-Limiter/redis-bucket";
const app : Application = express()
const port = 3000

// const pathFilter = (path:String,req:Request)=>{
//     return path.startsWith("/admin") && req.method === 'GET'
//}
export const proxyMiddleware = createProxyMiddleware<Request, Response>({
  target: 'http://localhost:5000',
  changeOrigin: true,
//   pathFilter:pathFilter,
  

//   on: {
//     proxyReq: (proxyReq, req, res) => {

//       console.log(`It is a ${req.method} request!`);

//       proxyReq.setHeader('X-Passowrd', 'Passwordhepasswordhai');

//     },
// }
});
app.use( proxyMiddleware,apicheck,rateLimiter);
app.listen(port,()=>console.log("server is rinning on port 3000"))