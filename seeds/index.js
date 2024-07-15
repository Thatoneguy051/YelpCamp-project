const axios = require('axios')
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


// async function seedImg() {
//     try {
//       const resp = await axios.get('https://api.unsplash.com/photos/random', {
//         params: {
//           client_id: 'gDi3ww8oJmpWAuclq5Gc5LwX26Wu9QnarkrAp0gBfK8',
//           collections: 1114848,
//         },
//       })
//       return resp.data.urls.small
//     } catch (err) {
//       console.error(err)
//     }
//   }

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '6685129b20ead21a8730693e',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      price,
      geometry: {
         type: "Point",
         coordinates:  [ -113.13311532139778, 47.02007823890639 ]
        },
      images: [

        {
          url: 'https://res.cloudinary.com/dolkq3jxl/image/upload/v1720596187/YelpCamp/kdhloppgwayxmap8ghd0.jpg',
          filename: 'YelpCamp/kdhloppgwayxmap8ghd0'
        },
        {
          url: 'https://res.cloudinary.com/dolkq3jxl/image/upload/v1720596187/YelpCamp/s7fnmujl4bw4mweasb2h.jpg',
          filename: 'YelpCamp/s7fnmujl4bw4mweasb2h'
        },
        {
          url: 'https://res.cloudinary.com/dolkq3jxl/image/upload/v1720596187/YelpCamp/cvrwi2ximxrm5tnkyv0n.jpg',
          filename: 'YelpCamp/cvrwi2ximxrm5tnkyv0n'
        }

      ]
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
});
