const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const app = express()

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(fileUpload());
require('dotenv').config();

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hoteldata.jqt51.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("CREATIVE-AGENCY");
        const serviceCollection = database.collection("SERVICES");
        const usersCollection = database.collection("USERS");
        const reviewsCollection = database.collection("REVIEWS");
        const ordersCollection = database.collection("ORDERS");

        app.post('/saveServices', async (req, res) => {
            const title = req.body.title;
            const description = req.body.description;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const service = {
                title,
                description,
                image: imageBuffer
            }
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        })

        app.get('/getServices', async (req, res) => {
            const cursor = serviceCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/users', async (req, res) => {
            const email = req.query.email;
            const query = await usersCollection.findOne({ email: email });
            if (query) {
                return res.send({ alreadySaved: true });
            }
            const displayName = req.body.displayName;
            const img = req.body.img;
            const result = await usersCollection.insertOne({ displayName: displayName, email: email, img: img });
            res.send(result)
        })

        app.put('/makeAdmin', async (req, res) => {
            const email = req.query.email;
            const query = await usersCollection.findOne({ email: email });
            if (query) {
                const update = {
                    $set: { role: 'admin' }
                }
                const result = await usersCollection.updateOne(query, update);
                res.send(result)
            }
            res.statusCode = 404;
        })

        app.get('/isAdmin', async (req, res) => {
            const email = req.query.email;
            const query = await usersCollection.findOne({ email: email });
            let isAdmin = false;
            if (query?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ isAdmin: isAdmin });
        })

        app.post('/saveReview', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const description = req.body.description;
            const position = req.body.position;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const service = {
                name,
                email,
                description,
                position,
                image: imageBuffer
            }
            const result = await reviewsCollection.insertOne(service);
            res.json(result);
        })

        app.get('/getReviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);

        })
        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = await serviceCollection.findOne({ _id: ObjectId(id) });
            res.json(query);

        })

        app.post('/saveOrder', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const loginEmail = req.body.loginEmail;
            const product = req.body.product;
            const cursor = await ordersCollection.insertOne({ name, email, loginEmail, product, status: 'pending' });
            res.json(cursor);
        })

        app.get('/getOrders', async (req, res) => {
            const email = req.query.email;
            const query =  ordersCollection.find({ loginEmail: email });
            const result = await query.toArray();
            res.send(result);
        })
        app.get('/getAllOrders', async (req, res) => {
            const query =  ordersCollection.find({});
            const result = await query.toArray();
            res.send(result);
        })

        app.put('/changeStatus', async (req, res) => {
            const id = req.query.id;
            const getStatus = req.query.selected;
            if (getStatus) {
                const query = await ordersCollection.findOne({ _id: ObjectId(id) });
                const status = {
                    $set: { status: getStatus }
                }
                const result = await ordersCollection.updateOne(query, status)
                res.send(result);
            }
        })

    }
    finally {

    }
}


run().catch(console.dir)



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})