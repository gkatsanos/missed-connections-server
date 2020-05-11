const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const compress = require("compression");
const methodOverride = require("method-override");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const routes = require("../routes/index");
const jwtStrategy = require("./passport");
const { logs } = require("./vars");
const error = require("../middlewares/error");

/**
 * Express instance
 * @public
 */
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// mount api v1 routes
app.use("/", routes);

// catch 404 and forward to error handler
app.use(error.notFound);

// universal middleware to convert errors with boom
app.use(error.converter);

module.exports = app;
