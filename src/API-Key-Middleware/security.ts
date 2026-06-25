import Redis from "ioredis";
import { Request , Response,NextFunction, json} from "express";
//CREAITNG INSTANCE
const redis =  new Redis()

const apicheck = async(req:Request,res:Response,next:NextFunction)=>{
   try{ //RETRIVEING API KEY
    const apiKey = req.headers['x-api-key']
    //CHECKING IF API KEY IS PRESNT OR NOT AND CHEKING ITS TYPE
    if (!apiKey || typeof apiKey !=='string'){
        return res.status(400).json({error:"API key not present "})
    }
    // CHEKING THE VALUE OF API KEY 
    const clientDataSringified =await redis.get(`apikey:${apiKey}`)
    if(!clientDataSringified){
        return res.status(400).json({error:"Incorrect API Key"})
    }
    //CHECKING THE STATUS OF API KEY
    const clientData = JSON.parse(clientDataSringified)
    if(!clientData.isActive){
        return res.status(400).json({error:"API Key Expired"})

    }
    //DELETE THE API KEY FOR SECURITY 
    delete req.headers['x-api-key']

    //GIVING USER INFORMATION 
    req.headers['x-client-id'] = clientData.id;
    req.headers['x-client-name'] = clientData.name;
    next()

}
    
    catch(error){
console.error(error)
return res.status(500).json("Server Error")
    }
} 