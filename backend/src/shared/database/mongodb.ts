import mongoose from 'mongoose';

import {env} from "../../config/env.js";

export const connectToDB = async () => {
    try{
        if(mongoose.connection.readyState === 1) return;
        await mongoose.connect(env.mongodbUri);
        
        console.log("MONGODB Connected");
        
    }catch(err){
        console.error("mongodb connection error");
        process.exit(1);
    }
}