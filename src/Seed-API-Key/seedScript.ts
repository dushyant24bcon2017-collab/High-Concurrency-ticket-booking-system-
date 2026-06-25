import Redis from "ioredis";
//CREATING INSTANCE 
const redis = new Redis()

const seedRedis = async()=>{
    //CREATING A FAKE API KEY
    const apiKey = "hello_bhai_can_I_get_a_referral"
    //CRETATING FAKE USER DATA FOR TESTING
    const user ={
        id : "client_111",
        name:"book_my_show",
        isActive:true
    }
    //SETTING THEM IN REDIS CACHE MEMORY
    await redis.set(`apikey:${apiKey}`,JSON.stringify(user))
    console.log("sucess")
    //EXITING THE PROCESS
    process.exit(0)
}
seedRedis()