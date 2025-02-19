const express = require('express')
const cors = require ('cors')
const app = express()
const port = process.env.PORT || 3000;
require('dotenv').config()
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzup6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    
    await client.connect();
    const jobsCollection  = client.db('jobPortal')

    const jobs = jobsCollection.collection('jobs')
    const job_applications = jobsCollection.collection('job_applications')




    app.get('/jobs',async(req, res)=>{
        const cursor = jobs.find()
        const result = await cursor.toArray();
        res.send(result);
    })


    //job application apis

    app.post('/job-application',async(req, res)=>{
      const application = req.body;
      const result = await job_applications.insertOne(application);
      res.send(result)
      

    })
    app.get('/job-application',async(req, res)=>{
      const email = req.query.email;
      const query = {applicant_email:email}
      const result =await job_applications.find(query).toArray();

      for(const application of result){
        console.log(application.job_id)
        const jobQuery = {_id:new ObjectId(application.job_id)}
        const QueryResult = await jobs.findOne(jobQuery);
        if (QueryResult){
          application.title = QueryResult.title
          application.company = QueryResult.company
          application.applicationDeadline = QueryResult.applicationDeadline
        }

      }

      res.send(result);      
      
    })

    app.get('/job-application/jobs/:job_id',async(req, res)=>{
      const jobId = req.params.job_id;
      const query = {job_id:jobId}
      const result = await job_applications.find(query).toArray();
      res.send(result)
    })

    // app.get('/jobs/:id',async(req, res)=>{
    //     const id = req.params.id;
    //     console.log(id)
    //     const query = {_id:new ObjectId(id)}
    //     const result = await jobs.findOne(query)
    //     res.send(result)
    // })
    app.patch('/job-application/:id',async(req, res)=>{
      const id =req.params.id;
      const data = req.body;
      const filter = {_id:new ObjectId(id)};
      const updatedDoc = {
        $set:{
          status:data.status
        }
      }
      const result = await job_applications.updateOne(filter,updatedDoc);
    })

    
    

    const { ObjectId } = require('mongodb');
    app.get('/jobs/:id', async (req, res) => {
        try {
            const id = req.params.id;

            // Validate the ID
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }

            // Query the database
            const query = { _id: new ObjectId(id) };
            const result = await jobs.findOne(query);

            if (!result) {
                return res.status(404).json({ error: 'Job not found' });
            }
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  } 
}
run().catch(console.dir);



app.get('/',(req, res)=>{
    res.send('job is falling form sky')
})

app.listen(port,()=>{
    console.log(`job is waiting , ${port}`)
})

