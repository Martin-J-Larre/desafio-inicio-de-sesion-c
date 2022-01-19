import { connectDb } from "./db/options/mongoose.js";
import { Server as IOServer } from "socket.io";
let io;

const socketOn = () => {
    connectDb((err) => {
        if (err) return console.log("Error connecting to database: ", err);
        console.log("DATABASE CONNECTED");

        io = new IOServer(server); //!este ya esta  any

        io.on("connection", async (socket) => {
            console.log("User connected...");
            //! Ver si afecta los fetch con respecto a las importaciones y demases
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

// export default socketOn; //! Cuál de las dos formas?
export {io, socketOn}
