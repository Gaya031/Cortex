import mongoose from 'mongoose';

import {env} from "../../config/env.js";

export const connectToDB = async () => {
    try{
        if(mongoose.connection.readyState === 1) return;
        if(!env.mongodbUri) {
            throw new Error('MONGODB_URI is not defined in environment');
        }
        await mongoose.connect(env.mongodbUri);
        
        console.log("MONGODB Connected");
        
    }catch(err){
        console.error("mongodb connection error", err);
        process.exit(1);
    }
}