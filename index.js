const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xnb9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('tripo');
        const toursCollection = database.collection('tours');
        const bookingCollection = database.collection('bookings');
        // POST API
        app.post('/tours', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await toursCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });
        // GET API
        app.get('/tours', async (req, res) => {
            const cursor = toursCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });
        // GET Single Service
        app.get('/tours/:id', async (req, res) => {
            console.log("hghghg");
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await toursCollection.findOne(query);
            res.json(service);
        });
        // DELETE API
        app.delete('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toursCollection.deleteOne(query);
            res.json(result);
        })
        // booking post api
        app.post('/bookings', async (req, res) => {
            console.log("sjdksk")
            const booking = req.body;
            booking.createdAt = new Date();
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        })
        // BOOKING GET  API
        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            console.log(bookings)
            res.send(bookings);
        });

        app.post('/bookings/status', async (req, res) => {
            const status = req.body;
            console.log(status);
            let result;
            if (status.status === 0) {
                 result = await bookingCollection.updateOne({ _id: ObjectId(status._id) }, { $set: { status: 1 } });
            } else {
                 result = await bookingCollection.updateOne({ _id: ObjectId(status._id) }, { $set: { status: 0 } });
            }
            console.log(result)

            res.json(result);
            // console.log(status);
            // res.json(result);


        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})