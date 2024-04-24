const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionsRouter");
const partnerRouter = require("./routes/partnersRouter");
const mongoose = require("mongoose");

const url =
	"mongodb://127.0.0.1:27017/nucampsite?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.4";
const connect = mongoose.connect(url, {
	useCreateIndex: true,
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

connect.then(
	() => console.log("Connected correctly to server"),
	(err) => console.log(err)
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function auth(req, res, next) {
	console.log(req.headers);
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		const err = new Error("You are not authenticated!");
		res.setHeader("WWW-Authenticate", "Basic");
		err.status = 401;
		return next(err);
	}

	const auth = Buffer.from(authHeader.split(" ")[1], "base64")
		.toString()
		.split(":");
	const user = auth[0];
	const pass = auth[1];
	if (user === "admin" && pass === "password") {
		return next(); // authorized
	} else {
		const err = new Error("You are not authenticated!");
		res.setHeader("WWW-Authenticate", "Basic");
		err.status = 401;
		return next(err);
	}
}

app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
