import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

interface LooseObject {
    [key: string]: any
}

// admin.initializeApp(functions.config().firebase);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://my-shop-c9e0b.firebaseio.com'
});


const app = express();
const main = express();

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', '*');
  next();
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', '*');
  next();
});


main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));


const db = admin.firestore();
const productCollection = 'products';
const userCollection = "users";
const orderCollection = "orders"

var obj: LooseObject = {}

exports.createNewUser = functions.https.onCall((data)=>{
  obj.email=data.email
  obj.password=data.password
  obj.firstName=data.firstName
  obj.lastName=data.lastName
  obj.admin=data.admin
  obj.orders=data.orders
  admin.auth().createUser({
  email: data.email,
  password: data.password
})
  .then(function(userRecord) {
    obj.uid=userRecord.uid
    db.collection(userCollection).doc(userRecord.uid).set(obj).then(()=>{
        console.log("user added")
    })
    .catch((error)=>{
        console.error("Error writing document: ", error);
    });
    console.log('Successfully created new user:', userRecord.uid);
  })
  .catch(function(error) {
    console.log('Error creating new user:', error);
  });
})

exports.webApi = functions.https.onRequest(main);

app.get('/products', async (req, res) => {
    try {
        const productQuerySnapshot = await db.collection(productCollection).get();
        const products: any[] = [];
        productQuerySnapshot.forEach(
            (doc)=>{
                let data = doc.data()
                data.id = doc.id
                products.push(
                    data
            );
            }
        );
        res.status(200).json(products);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/products/:id", async (req,res)=>{
  try {

    const id = req.params.id
    const product = await db.collection(productCollection).doc(id)
    product.get().then((doc)=>{
      if(doc.data()!==null)
      res.status(200).json(doc.data())
      else res.status(404).send("Product not found!")
    }).catch((err)=>{
      res.status(500).send(err)
    })
  } catch(error) {
    res.status(404).send("Product Not Found");
  }
})

app.patch("/products/:id", async (req,res)=>{
  try {
    const id = req.params.id
    const product = await db.collection(productCollection).doc(id)
    product.update(req.body).catch((err)=>{
      res.status(500).send(err)
    })
    res.status(200).send("product updated!")
  } catch(err){
    res.status(500).send(err)
  }
})

app.delete("/products/:id", async (req,res)=>{
  try {
    const id = req.params.id
    const product = await db.collection(productCollection).doc(id)
    product.delete().then(()=>{
      res.status(200).send("Product deleted!")
    }).catch((err)=>{
      res.status(500).send(err)
    })

  } catch(err){

  }
})

app.post("/products", async (req,res)=>{
  try {

    db.collection(productCollection).add(req.body)
.then(()=>{

    res.status(201).send("Product added!")
})
.catch((error)=>{
    console.error("Error writing document: ", error);
});
} catch(err) {
    res.status(500).send(err)
  }
})

app.get('/users', async (req, res) => {
    try {
        const userQuerySnapshot = await db.collection(userCollection).get();
        const users: any[] = [];
        userQuerySnapshot.forEach(
            (doc)=>{
                users.push(
                    doc.data()
            );
            }
        );
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/users/:id", async (req,res)=>{
  try {

    const id = req.params.id
    const user = await db.collection(userCollection).doc(id)
    user.get().then((doc)=>{
      if(doc.data()!==null)
      res.status(200).json(doc.data())
      else res.status(404).send("User Not Found!")
    }).catch((err)=>{
      res.status(500).send(err)
    })
  } catch(error) {
    res.status(404).send("User Not Found");
  }
})

app.patch("/users/:id", async (req,res)=>{
  try {
    const id = req.params.id
    const user = await db.collection(userCollection).doc(id)
    user.update(req.body).catch((err)=>{
      res.status(500).send(err)
    })
    res.status(200).send("user updated!")
  } catch(err){
    res.status(500).send(err)
  }
})

app.post("/users/:id", async (req,res)=>{
  try {
    const id = req.params.id
    db.collection(userCollection).doc(id).set(req.body)
.then(()=>{
    res.status(201).send("User added!")
})
.catch((error)=>{
    console.error("Error writing document: ", error);
});
} catch(err) {
    res.status(500).send(err)
  }
})

app.delete("/users/:id", async (req,res)=>{
  try {
    const id = req.params.id
    const user = await db.collection(userCollection).doc(id)
    user.delete().then(()=>{
      res.status(200).send("User deleted!")
    }).catch((err)=>{
      res.status(500).send(err)
    })

  } catch(err){

  }
})

app.get('/orders', async (req, res) => {
    try {
        const orderQuerySnapshot = await db.collection(orderCollection).get();
        const orders: any[] = [];
        orderQuerySnapshot.forEach(
            (doc)=>{
                let data = doc.data()
                data.id = doc.id
                orders.push(
                    data
            );
            }
        );
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete("/orders/:id", async (req,res)=>{
  try {
    const id = req.params.id
    const order = await db.collection(orderCollection).doc(id)
    order.delete().then(()=>{
      res.status(200).send("Order deleted!")
    }).catch((err)=>{
      res.status(500).send(err)
    })

  } catch(err){

  }
})

app.post("/orders", async (req,res)=>{
  try {

    db.collection(orderCollection).add(req.body)
.then(()=>{
    res.status(201).send("User added!")
})
.catch((error)=>{
    console.error("Error writing document: ", error);
});
} catch(err) {
    res.status(500).send(err)
  }
})

app.patch("/orders/:id", async (req,res)=>{
  try {
    const id = req.params.id
    const order = await db.collection(orderCollection).doc(id)
    order.update(req.body).catch((err)=>{
      res.status(500).send(err)
    })
    res.status(200).send("user updated!")
  } catch(err){
    res.status(500).send(err)
  }
})
