import mongoose from "mongoose";
const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Success: Connected to MongoDB");
    }catch(e){
        console.log("Failed: UnConnected to MongoDB");
        return console.error(e);
    }
};

export default connectDB;