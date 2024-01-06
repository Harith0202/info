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
const uri = "mongodb+srv://harithrosly123:Harith123@cluster0.cfe5zxw.mongodb.net/?retryWrites=true&w=majority";

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

app.post('/register/user', verifyToken, async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      email: req.body.email,
      phonenumber: req.body.phonenumber
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

app.post('/register/test/user', async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      email: req.body.email,
      phonenumber: req.body.phonenumber
    };

    const result = await registertest(userData);

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

//admin login to the admin account, if successfully login it will get a token for do other operation the admin can do
app.post('/login/admin', (req, res) => {
  console.log(req.body);
  loginadmin(req.body.username, req.body.password)
    .then(result => {
      if (result.message === 'Correct password') {
        // Generate token with role set to 'administrator'
        const token = generateToken({ username: req.body.username }, 'administrator');
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
app.get('/view/user/admin', [verifyToken, isAdmin], async (req, res) => {
  try {
    const result = await client
      .db('benr2423')
      .collection('users')
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
  let result = await createvisitor(
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
  res.status(result.success ? 200 : 400).json(result);
});
///view visitor that has been create by particular user 
app.get('/view/visitor/user', verifyToken, async (req, res) => {
  try {
    const username = req.user.username; // Get the username from the decoded token
    
    // Retrieve the user's document, which includes the visitors array
    const userWithVisitors = await client
      .db('benr2423')
      .collection('users')
      .findOne(
        { username: username },
        { projection: { visitors: 1, _id: 0 } } // Only retrieve the visitors field
      );

    if (!userWithVisitors) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    // Send the visitors array if it exists, otherwise send an empty array
    res.status(200).send({ success: true, visitors: userWithVisitors.visitors || [] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
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


//retrieve token
app.post('/retrieve/visitortoken', async (req, res) => {
  const { visitorname, phonenumber } = req.body;

  try {
    // Use aggregation pipeline to match the user document and filter the visitors array
    const pipeline = [
      {
        $match: {
          "visitors.visitorname": visitorname,
          "visitors.phonenumber": phonenumber
        }
      },
      {
        $project: {
          visitors: {
            $filter: {
              input: "$visitors",
              as: "visitor",
              cond: {
                $and: [
                  { $eq: ["$$visitor.visitorname", visitorname] },
                  { $eq: ["$$visitor.phonenumber", phonenumber] }
                ]
              }
            }
          },
          _id: 0
        }
      }
    ];

    const [result] = await client.db('benr2423').collection('users').aggregate(pipeline).toArray();

    if (result && result.visitors.length > 0) {
      // Assuming there is only one match, take the first element of the array
      const visitor = result.visitors[0];
      res.json({ success: true, visitorToken: visitor.visitorToken });
    } else {
      res.status(404).json({ success: false, message: 'Visitor not found or no token exists.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
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

async function loginadmin(reqUsername, reqPassword) {
  let matchUser = await client.db('benr2423').collection('administrator').findOne({ username: { $eq: reqUsername } });

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
    if (!userData.username || !userData.password || !userData.name || !userData.email || !userData.phonenumber) {
      throw new Error('Incomplete user data. Please provide all required fields.');
    }

    // Strong password validation
    // Require at least one number, one lowercase, one uppercase letter, and one special character
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    if (!passwordRegex.test(userData.password)) {
      throw new Error('Password must contain at least one number, one lowercase, one uppercase letter, and one special symbol.');
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
    return { success: false, message: error.message };
}
}

// Update the register function to accept a single userData object
async function registertest(userData) {
  try {
    // Basic input validation
    if (!userData.username || !userData.password || !userData.name || !userData.email || !userData.phonenumber) {
      throw new Error('Incomplete user data. Please provide all required fields.');
    }

    // Strong password validation
    // Require at least one number, one lowercase, one uppercase letter, and one special character
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    if (!passwordRegex.test(userData.password)) {
      throw new Error('Password must contain at least one number, one lowercase, one uppercase letter, and one special symbol.');
    }

    // Check if the username is already taken
    const existingUser = await client.db('benr2423').collection('users').findOne({ username: userData.username });
    if (existingUser) {
      throw new Error('Username is already taken. Please choose a different username.');
    }
    // Return success message
    return { success: true, message: "Account created" };
  } catch (error) {
    // Return detailed error message in case of any issues
    return { success: false, message: error.message };
}
}


///create visitor 
async function createvisitor(reqVisitorname, reqCheckintime, reqCheckouttime, reqTemperature, reqGender, reqEthnicity, reqAge, ReqPhonenumber, createdBy) {
  try {
    // Generate a token for the visitor pass
    const visitorPassToken = generateVisitorToken({
      "visitorname": reqVisitorname,
      "checkintime": reqCheckintime,
      "checkouttime": reqCheckouttime,
      "temperature": reqTemperature,
      "gender": reqGender,
      "ethnicity": reqEthnicity,
      "age": reqAge,
      "phonenumber": ReqPhonenumber
    });

    // Define the visitor object with the token included
    const visitor = {
      "visitorname": reqVisitorname,
      "checkintime": reqCheckintime,
      "checkouttime": reqCheckouttime,
      "temperature": reqTemperature,
      "gender": reqGender,
      "ethnicity": reqEthnicity,
      "age": reqAge,
      "phonenumber": ReqPhonenumber,
      "visitorToken": visitorPassToken // Save the token here
    };

    // Push the visitor object (with token) to the visitors array of the user who created the visitor
    const updateResult = await client.db('benr2423').collection('users').updateOne(
      { "username": createdBy },
      { $push: { "visitors": visitor } }
    );

    if (updateResult.matchedCount === 0) {
      return { success: false, message: "User not found" };
    }
    if (updateResult.modifiedCount === 0) {
      return { success: false, message: "Failed to add visitor to the user" };
    }

    // Return success message along with the visitor pass token
    return { success: true, message: "Visitor created", visitorPassToken: visitorPassToken };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create visitor: " + error.message };
  }
}

app.get('/get/userphonenumber', async (req, res) => {
  // Extract the visitor token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No authorization header provided.' });
  }

  const token = authHeader.split(' ')[1]; // Assuming the header is "Bearer [token]"

  try {
    // Verify the visitor token
    const decoded = jwt.verify(token, 'visitorSecretPassword'); // Use the correct secret for verification

    // Find the user associated with the visitor token
    const user = await client.db('benr2423').collection('users').findOne({
      "visitors.visitorToken": token
    });

    if (user) {
      // Respond with the user's phone number
      res.json({ success: true, visitor_of: user.username });
    } else {
      res.status(404).json({ success: false, message: 'User not found for the provided token.' });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle invalid token
      res.status(401).json({ success: false, message: 'Invalid token.' });
    } else {
      // Handle other errors
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  }
});

const jwt = require('jsonwebtoken');

function generateToken(userData, role) {
  const tokenPayload = {
    username: userData.username,
    role: role // Include the role in the token payload
  };
  
  const token = jwt.sign(
    tokenPayload,
    'mypassword', // This should be an environment-specific secret
    { expiresIn: '1h' } // Set an appropriate expiration time for the token
  );

  console.log(token);
  return token;
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];
  jwt.verify(token, 'mypassword', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    
    // Check if the role in the token is 'administrator'
    if (decoded.role !== 'administrator') {
      return res.status(403).send('Forbidden: Insufficient privileges');
    }

    req.user = decoded;
    next();
  });
}

// Function to generate a visitor pass token
function generateVisitorToken(visitorData) {
  const visitorToken = jwt.sign(
    visitorData,
    'visitorSecretPassword', // Ensure you use a secure, environment-specific password
    { expiresIn: '1d' } // Set an appropriate expiration time for the visitor pass
  );

  return visitorToken;
}
