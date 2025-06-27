const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const stripe =require('stripe')('your_stripe_secret_key')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5qkscdg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const parcelCollection = client.db('zap-shift-user').collection('parcels')


        app.get('/parcels', async (req, res) => {
            const parcels = await parcelCollection.find().toArray();
            res.send(parcels)
        })



        // Parcels get api by user email 
        app.get('/parcels', async (req, res) => {
            try {
                const userEmail = req.query.email;

                const query = userEmail ? { created_by: userEmail } : {};
                const options = {
                    sort: { createdAt: -1 } // Newest first
                };
                const parcels = await parcelCollection.find(query, options).toArray();
                res.send(parcels)
            } catch (error) {
                console.error('Error Fetching Parcels', error)
                res.status(500).send({ message: 'Failed to get Parcels' })
            }
        })


        // parcel get by id 
        app.get('/parcels/:parcelId', async (req, res) => {
            try {
                const { parcelId } = req.params;
                const query = { _id: new ObjectId(parcelId) }
                const parcel = await parcelCollection.findOne(query)
                res.status(200).send(parcel)
            } catch (error) {
                console.log(error)
                res.status(500).send({ message: 'Failed' })
            }
        })



        //POST: create parcel 
        app.post('/parcels', async (req, res) => {

            try {
                const newParcel = req.body;
                // //  add createAt Date 
                // newParcel.createAt = new Date()
                const result = await parcelCollection.insertOne(newParcel);
                res.status(201).send(result);
            }
            catch (error) {
                console.error('Error inserting parcel:', error)
                res.status(500).send({ message: 'Failed to create parcel' })
            }

        })




        // DELETE api parcels 

        app.delete('/parcels/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await parcelCollection.deleteOne(query)

                //   if(result.deletedCount ===0){
                //     return res.status(404).send({message: 'Parcel not found'})
                //   }

                res.send(result)
            }
            catch (error) {
                console.error('Error deleting Parcel', error)
                res.status(500).send({ message: 'Failed to delete Parcel' })
            }
        })


        // payment method api 

        app.post('/create-payment-intent', async(req, res) =>{
            try{
                const payment = await stripe.paymentIntents.create({
                    amount:1000,
                    currency: 'used',
                    payment_method_types: ['card'],
                });
                res.json({clientSecret: paymentIntents.client_secret})
            }catch(error){
                res.status(500).json({error: error.message})
            }
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);








app.get('/', (req, res) => {
    res.send('Parcel Server is running')
})


app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
})