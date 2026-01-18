import mongoose from "mongoose";


// connect to mongoDb database

const connectDB = async ()=>{
    mongoose.connection.on('connected', ()=> console.log('Database connected successfully!')
    )
    // Use 127.0.0.1 instead of localhost to force IPv4
    const uri = process.env.MONGODB_URI.replace('localhost', '127.0.0.1')
    await mongoose.connect(`${uri}/Edemy`)

}
export default connectDB;