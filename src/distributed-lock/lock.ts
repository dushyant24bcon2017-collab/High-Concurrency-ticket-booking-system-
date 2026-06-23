import Redis from "ioredis";

const redis = new Redis()

//ACCQUIRE LOCK 
const accquireLock = async(lockKey:string,lockValue:string,ttl:number)=>{
    let result = await redis.set(lockKey,lockValue,"PX", ttl,"NX");
    return result ==="OK" // LOCK ACCQUIRED 
}


// RELEASE LOCK
const releaseLock = async(lockKey:string,lockValue:string)=>{

    //LUA SCRIPT
    const script=`
    if redis.call("GET" , KEYS[1]) === ARGV[1] then 
        redis.call("DEL", KEYS[1])

    else
        return 0
    end
    `
    return await redis.eval(script,1,lockKey,lockValue)
}


