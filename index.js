const express = require('express');
const app = express();

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const port = process.env.PORT || 3000;


const MongoURI = process.env.MONGODB_URI;


// Swagger JSDoc options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'hotel visitor management API',
      version: '1.0.0',
      description: 'API documentation for Your Express.js API',
    },
    servers: [
      {
        url: 'https://vmstadak.azurewebsites.net',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  security: [{
    BearerAuth: [],
  }],
  apis: ['./swagger.js'],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://harith:Harith123@cluster0.iezu3ww.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect().then(res => {
  console.log(res);
});

app.use(express.json());

app.post('/register/user', async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      email: req.body.email,
    };

    const result = await register(userData);

    if (result.success) {
      res.status(201).json(result); // Return JSON response
    } else {
      res.status(400).json(result); // Return JSON response
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" }); // Return JSON response
}
});


//security login to the security account, if successfully login it will get a token for do other operation the security can do
app.post('/login/security', (req, res) => {
  console.log(req.body);
  login(req.body.username, req.body.password)
    .then(result => {
      if (result.message === 'Correct password') {
        const token = generateToken({ username: req.body.username });
        res.send({ message: 'Successful login', token });
      } else {
        res.send('Login unsuccessful');
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

//the security view all the visitor (the token is true)
app.get('/view/visitor/security', verifyToken, async (req, res) => {
  try {
    const result = await client
      .db('benr2423')
      .collection('visitor')
      .find()
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


//user login account 
app.post('/login/user', (req, res) => {
  console.log(req.body);
  loginuser(req.body.username, req.body.password)
    .then(result => {
      if (result.message === 'Correct password') {
        const token = generateToken({ username: req.body.username });
        res.send({ message: 'Successful login', token });
      } else {
        res.send('Login unsuccessful');
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

///user create visitor 
app.post('/create/visitor/user', verifyToken, async (req, res) => {
  const createdBy = req.user.username; // Get the username from the decoded token
  let result = createvisitor(
    req.body.visitorname,
    req.body.checkintime,
    req.body.checkouttime,
    req.body.temperature,
    req.body.gender,
    req.body.ethnicity,
    req.body.age,
    req.body.phonenumber,
    createdBy
  );   
  res.send(result);
});

///view visitor that has been create by particular user 
app.get('/view/visitor/user', verifyToken, async (req, res) => {
  try {
    const username = req.user.username; // Get the username from the decoded token
    const result = await client
      .db('benr2423')
      .collection('visitor')
      .find({ createdBy: username }) // Retrieve visitors created by the authenticated user
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


/// user update its visitor info
app.put('/update/visitor/:visitorname', verifyToken, async (req, res) => {
  const visitorname = req.params.visitorname;
  const username = req.user.username;
  const { checkintime, checkouttime,temperature,gender,ethnicity,age,phonenumber } = req.body;

  try {
    const updateVisitorResult = await client
      .db('benr2423')
      .collection('visitor')
      .updateOne(
        { visitorname, createdBy: username },
        { $set: { checkintime, checkouttime,temperature,gender,ethnicity,age,phonenumber } }
      );

    if (updateVisitorResult.modifiedCount === 0) {
      return res.status(404).send('Visitor not found or unauthorized');
    }

    res.send('Visitor updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/// visitor can view their data by insert their name
app.get('/view/visitor/:visitorName', async (req, res) => {
  const visitorName = req.params.visitorName;

  try {
    const result = await client
      .db('benr2423')
      .collection('visitor')
      .findOne({ visitorname: visitorName });

    if (result) {
      res.send(result);
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function login(reqUsername, reqPassword) {
  let matchUser = await client.db('benr2423').collection('security').findOne({ username: { $eq: reqUsername } });

  if (!matchUser)
    return { message: "User not found!" };

  if (matchUser.password === reqPassword)
    return { message: "Correct password", user: matchUser };
  else
    return { message: "Invalid password" };
}

async function loginuser(reqUsername, reqPassword) {
  let matchUser = await client.db('benr2423').collection('users').findOne({ username: { $eq: reqUsername } });

  if (!matchUser)
    return { message: "User not found!" };

  if (matchUser.password === reqPassword)
    return { message: "Correct password", user: matchUser };
  else
    return { message: "Invalid password" };
}

// Update the register function to accept a single userData object
async function register(userData) {
  try {
    // Basic input validation
    if (!userData.username || !userData.password || !userData.name || !userData.email) {
      throw new Error('Incomplete user data. Please provide all required fields.');
    }

    // Check if the username is already taken
    const existingUser = await client.db('benr2423').collection('users').findOne({ username: userData.username });
    if (existingUser) {
      throw new Error('Username is already taken. Please choose a different username.');
    }

    // Insert the user data into the database
    const result = await client.db('benr2423').collection('users').insertOne(userData);

    // Check if the insertion was successful
    if (!result.acknowledged) {
      throw new Error('Failed to create the user account.');
    }

    // Return success message
    return { success: true, message: "Account created" };
  } catch (error) {
    // Return detailed error message in case of any issues
    return { success: false, message: error.message };
}
}
///create visitor 
function createvisitor(reqVisitorname, reqCheckintime, reqCheckouttime,reqTemperature,reqGender,reqEthnicity,reqAge,ReqPhonenumber, createdBy) {
  client.db('benr2423').collection('visitor').insertOne({
    "visitorname": reqVisitorname,
    "checkintime": reqCheckintime,
    "checkouttime": reqCheckouttime,
    "temperature":reqTemperature,
    "gender":reqGender,
    "ethnicity":reqEthnicity,
    "age":reqAge,
    "phonenumber":ReqPhonenumber,
    "createdBy": createdBy // Add the createdBy field with the username
  });
  return "visitor created";
}

const jwt = require('jsonwebtoken');

function generateToken(userData) {
  const token = jwt.sign(
    userData,
    'mypassword',
    { expiresIn: 600 }
  );

  console.log(token);
  return token;
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    res.status(401).send('Unauthorized');
    return;
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'mypassword', function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized');
      return;
    }
    req.user = decoded;
    next();
  });
}
