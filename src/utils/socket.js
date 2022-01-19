import { connectDb } from "./db/options/mongoose.js";
import { Server as IOServer } from "socket.io";
let io;

const socketOn = () => {
    connectDb((err) => {
        if (err) return console.log("Error connecting to database: ", err);
        console.log("DATABASE CONNECTED");

        io = new IOServer(server);

        io.on("connection", async (socket) => {
            console.log("User connected...");
    
            //Fetch fakerProducts
            const fakerProducts = getFakerProducts();
    
            //Fetch products
            const products = await sqliteServices.getElementsAll();
    
            //Fetch messages
            const messages = await mongoServices.getMessagesAll();
    
            socket.emit("loadFakerProducts", fakerProducts);
            socket.emit("loadProducts", products);
            socket.emit("loadMessages", messages);
        });
    });    
};

export default socketOn;
export {io, socketOn}
