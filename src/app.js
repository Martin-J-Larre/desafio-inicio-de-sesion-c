import express from "express";
const app = express();
import session from "express-session";
import MongoStore from "connect-mongo";
import { passport } from './middlewares/passport.js';

import 'dotenv/config'
import { router as productsRouter } from "./routers/productsApi.js";
import { router as chatRouter } from "./routers/chatApi.js";
import { getFakerProducts } from "./controllers/fakerProducts.js";

//-----------------Services

import { Container } from "./controllers/Container.js";
import { MessagesServices } from "./controllers/MessagesServices.js";
import { options as sqlite3Options } from "./db/options/sqlite3.js";
const sqliteServices = new Container(sqlite3Options, "products");
import { messagesCollection } from "./db/options/mongoDB.js";
import { socketOn, io } from "./utils/socket.js";
const mongoServices = new MessagesServices(messagesCollection);


//-----------------Middlewares

function validateSession(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

app.set("view engine", "ejs");
app.set("views", "./src/public/views");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));

app.use(
	session({
		store: MongoStore.create({
			mongoUrl:process.env.MONGO_URI,
			mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
		}),
		secret: "This is my secret word.",
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: { maxAge: 60000 * 10 },
	})
);

app.use(passport.initialize());
app.use(passport.session());

//---------------Helper funtions
function renderIndex(req, res, fakerProducts, products, messages) {
	res.render("./pages/index", {
		user: req.user,
		fakerProducts: fakerProducts,
		products: products,
		messages: messages,
	});
}

//-----------------Routes

//Auth
app.get("/login", (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	res.render("./pages/login");
});


app.get("/register", (req, res) => {
	res.render("./pages/register");
});


//Error
app.get("/error-login", (req, res) => {
	res.render("./pages/errorLogin");
});


app.get("/error-register", (req, res) => {
	res.render("./pages/errorRegister");
});

//Post
app.post("/login", passport.authenticate("login", { failureRedirect: "/error-login" }), (req, res) => {
	res.redirect("/");
});


app.post("/register", passport.authenticate("register", { failureRedirect: "/error-register" }), (req, res) => {
	res.redirect("/");
});


app.get("/logout", validateSession, (req, res) => {
	const tempUser = req.user;
	req.logout();
	res.render("./pages/logout", { user: tempUser });
});


//Logged user endpoints
app.get("/", validateSession, (req, res) => {
	renderIndex(req, res, [], [], []);
});


app.get("/api/faker/products", (req, res) => {
	res.json(getFakerProducts());
});


app.use("/api/products", productsRouter);
app.use("/api/chat", chatRouter);


//-----------------Socket
socketOn();

export {app, validateSession, io };