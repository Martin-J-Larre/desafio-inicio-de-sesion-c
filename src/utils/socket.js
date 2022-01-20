import { connectDb } from "../db/options/mongoose.js";
import { Server as IOServer } from "socket.io";
import { server } from '../../index.js';

import { Container } from "../controllers/Container.js";
import { MessagesServices } from "../controllers/MessagesServices.js";
import { options as sqlite3Options } from "../db/options/sqlite3.js";
const sqliteServices = new Container(sqlite3Options, "products");
import { messagesCollection } from "../db/options/mongoDB.js";
const mongoServices = new MessagesServices(messagesCollection);
import { getFakerProducts } from "../controllers/fakerProducts.js";

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

export {io, socketOn}
