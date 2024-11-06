import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("DataBase connected successfully");
        
    } catch (error) {
        console.log("DB Connection Error", error);
        process.exit(1)
    }
}