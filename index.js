const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://quick-cart-aaf87.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// connect MongoDB

const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri = `mongodb+srv://<username>:<password>@cluster0.nbrjeuw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbrjeuw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("QuickCartDB");
    const productCollection = database.collection("products");

    // Get all the products with pagination, filtering, and search
app.get("/products", async (req, res) => {
  const size = parseInt(req.query.size) || 10; // Default to 10 if not provided
  const page = parseInt(req.query.page) - 1 || 0; // Default to page 0 if not provided
  const search = req.query.search || ""; // Default to empty string
  const filterCategory = req.query.filterCategory;
  const filterBrand = req.query.filterBrand;

  console.log("Received parameters:", { search, size, page, filterCategory, filterBrand });

  let query = {};

  // Add search filter
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Add category filter
  if (filterCategory) {
    query.category = filterCategory;
  }

  // Add brand filter
  if (filterBrand) {
    query.brand = filterBrand;
  }

  console.log("Final Query:", query);

  try {
    // Fetch the products with pagination
    const result = await productCollection
      .find(query)
      .skip(page * size)
      .limit(size)
      .toArray();

    console.log("Fetched Products:", result);
    res.send(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ message: "Failed to fetch products", error });
  }
});

// Get product count from database
app.get("/productCount", async (req, res) => {
  const search = req.query.search || "";
  const filterCategory = req.query.filterCategory;
  const filterBrand = req.query.filterBrand;

  let query = {};

  // Add search filter
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Add category filter
  if (filterCategory) {
    query.category = filterCategory;
  }

  // Add brand filter
  if (filterBrand) {
    query.brand = filterBrand;
  }

  console.log("Count Query Object:", query);

  try {
    // Get the count of documents that match the query
    const count = await productCollection.countDocuments(query);
    res.send({ count });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).send({ message: "Failed to fetch product count", error });
  }
});

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job task server running");
});

app.listen(port, () => {
  console.log(`Job server listening on port ${port}`);
});
