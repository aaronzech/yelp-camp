
const mongoose = require('mongoose')
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    //useNewURLParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});


// DB connection setup
const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const sample = array =>array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i<300; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: '62d06050deb468894ca8a9a2',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            desciption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tellus in hac habitasse platea. At elementum eu facilisis sed odio morbi quis commodo odio. Velit egestas dui id ornare arcu odio ut sem. Proin fermentum leo vel orci porta non. Urna nec tincidunt praesent semper feugiat. Adipiscing diam donec adipiscing tristique risus nec feugiat. Erat pellentesque adipiscing commodo elit. Dolor magna eget est lorem ipsum dolor sit amet. Aliquet risus feugiat in ante metus dictum at tempor. Lectus sit amet est placerat in egestas erat imperdiet sed. Odio tempor orci dapibus ultrices in iaculis nunc. Tristique senectus et netus et malesuada fames. Ipsum dolor sit amet consectetur adipiscing elit',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude,
                              cities[random1000].latitude,
                                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dybbimxyw/image/upload/v1658866756/YelpCamp/vuf0alj8s8zgmg1xzlt5.jpg',
                  filename: 'YelpCamp/vuf0alj8s8zgmg1xzlt5',
                },
                {
                  url: 'https://res.cloudinary.com/dybbimxyw/image/upload/v1658866756/YelpCamp/kjpulovnymv96fxeg79s.jpg',
                  filename: 'YelpCamp/kjpulovnymv96fxeg79s',
                }
              ],
        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
});