if ( process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const ExpressError = require('./utilities/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');

const MongoDBStore = require("connect-mongo")(session)

const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes= require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
// const dbUrl = process.env.DB_URL
// 'mongodb://localhost:27017/yelp-camp'
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.set('strictQuery', true);
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(mongoSanitize())

const store = new MongoDBStore({
    url:dbUrl,
    secret:'this should be a better secret',
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
   console.log("session store error", e) 
})
const sessionConfig = {
       store,
       name: 'session',
       secret:'this should be a better secret',
       resave: false,
       saveUninitialized: true,
       cookie: {
            httpOnly: true,
            // secure: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7
               }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dolkq3jxl/", 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
      console.log(req.session)
      res.locals.currentUser=req.user;
      res.locals.success = req.flash('success');
      res.locals.error = req.flash('error');
      next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });

})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})