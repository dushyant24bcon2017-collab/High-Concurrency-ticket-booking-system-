import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis();

// This executes inside Redis atomically. No race conditions allowed
const tokenBucketScript = `
    local tokens_key = KEYS[1]
    local timestamp_key = KEYS[2]
    
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2]) 
    local now = tonumber(ARGV[3])
    
    -- Get current tokens, default to capacity if it's their first time
    local tokens_left = tonumber(redis.call("get", tokens_key))
    if tokens_left == nil then
        tokens_left = capacity
    end
    
    -- Get last refill time, default to now
    local last_refilled = tonumber(redis.call("get", timestamp_key))
    if last_refilled == nil then
        last_refilled = now
    end
    
    -- Calculate how much time passed and how many tokens to add back
    local time_passed =  now - last_refilled
    local tokens_to_add = math.floor(time_passed * refill_rate)
    
    -- Add tokens, but don't exceed the max bucket capacity
    tokens_left = math.min(capacity, tokens_left + tokens_to_add)
    
    -- Check if they have at least 1 token to spend
    if tokens_left >= 1 then
        tokens_left = tokens_left - 1
        
        -- Save the new token count and timestamp
        redis.call("set", tokens_key, tokens_left)
        
        -- Only update the timestamp if we actually refilled tokens, 
        -- or if it was their very first request
        if tokens_to_add > 0 or last_refilled == now then
             redis.call("set", timestamp_key, now)
        end
        
        return {1, tokens_left} -- 1 means ACCEPTED
    else
        return {0, tokens_left} -- 0 means REJECTED
    end
`;

// Register the script in Redis so it's cached and runs lightning fast
redis.defineCommand("checkTokenBucket", {
    numberOfKeys: 2,
    lua: tokenBucketScript,
});

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // We grab the ID that our first Bouncer (verifyApiKey) slapped on the request!
        const clientId = req.headers['x-client-id'];

        if (!clientId || typeof clientId !== 'string') {
             return res.status(500).json({ error: "Rate limiter failed: Missing Client ID from previous middleware." });
        }

        //  CONSTRAINTS 
        const CAPACITY = 10;           // Max 10 requests allowed instantly (Burst)
        const REFILL_RATE = 1;         // Refill 1 token per second
        const NOW = Math.floor(Date.now() / 1000); // Current time in seconds

        
        const tokensKey = `bucket:${clientId}:tokens`;
        const timestampKey = `bucket:${clientId}:timestamp`;

        // Execute the atomic Lua script in Redis
        // @ts-ignore  becase we defiend a coomand but its not in the typescript 
        const result = await redis.checkTokenBucket(
            tokensKey, 
            timestampKey, 
            CAPACITY, 
            REFILL_RATE, 
            NOW
        );

        const isAllowed = result[0] === 1;
        const tokensLeft = result[1];

        // Let the client know how many tokens they have left in the HTTP headers
        res.setHeader('X-RateLimit-Limit', CAPACITY);
        res.setHeader('X-RateLimit-Remaining', tokensLeft);

        if (!isAllowed) {
            
            console.log(`Blocked ${clientId}. No tokens left!`);
            return res.status(429).json({ 
                error: "Too many requests ,wait a second, and try again." 
            });
        }

       
        console.log(`Allowed ${clientId}. Tokens left: ${tokensLeft}`);
        
        
        next();

    } catch (error) {
        console.error("[RATE LIMITER ERROR]", error);
        return res.status(500).json({ error: "Internal Gateway Error" });
    }
};