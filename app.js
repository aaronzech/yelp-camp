
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//console.log("ENV",process.env.CLOUDINARY_CLOUD_NAME);

const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const Campground = require('./models/campground')
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const app = express();
const path = require('path');
const session = require('express-session')
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL

const mongoSanitize = require('express-mongo-sanitize');


 const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dybbimxyw/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dybbimxyw/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dybbimxyw/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dybbimxyw/" ];
 
app.use(
    helmet({
        contentSecurityPolicy: {
            directives : {
                defaultSrc : [],
                connectSrc : [ "'self'", ...connectSrcUrls ],
                scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
                styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
                workerSrc  : [ "'self'", "blob:" ],
                objectSrc  : [],
                imgSrc     : [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dybbimxyw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc    : [ "'self'", ...fontSrcUrls ],
                mediaSrc   : [ "https://res.cloudinary.com/dlzez5yga/" ],
                childSrc   : [ "blob:" ]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);







const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review')
//const dbURL = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {   //mongodb://localhost:27017/yelp-camp for local, dbUrl for cloud db
    //useNewURLParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});


// DB connection setup
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(flash())
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride('_method'));
app.use(mongoSanitize());
//app.use(helmet({contentSecurityPolicy:false}));
//app.use(helmet({ crossOriginEmbedderPolicy: false }));


const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("Error",function(e){
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store: store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // security thing
        // secure: true, // For deploy only req https
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7 
    }

}
app.use(session(sessionConfig))

// Passport Plugins
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(express.static(path.join(__dirname,'public'))) 





app.use((req,res,next) =>{
    console.log(req.query)
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        console.log(req.originalUrl);
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)



app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req,res,next) =>{
    
    req.session.returnTo = req.session.previousReturnTo;
    console.log('Previous returnTo reset to:', req.session.returnTo )
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const {statusCode=500, message="somthing went wrong"} = err;
    if(!err.message) err.message = "Oh no, somthing went wrong";
    res.status(statusCode).render('error',{err});
})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(port,"SERVING ON PORT ")
});