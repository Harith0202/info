const express = require('express');
const app = express();

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');


const MongoURI = process.env.MONGODB_URI;

const rateLimit = require('express-rate-limit');

// Configure the rate limiter
const loginLimiter = rateLimit({
  windowMs: 30 * 1000, // 30sec
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 30secs)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many login attempts from this IP, please try again after 30 seconds'
});


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
const uri = "mongodb+srv://harithrosly:harith123@cluster0.qpxndud.mongodb.net/";

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

app.post('/register/user', verifySecurityToken, async (req, res) => {
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
app.post('/login/security', loginLimiter, (req, res) => {
  console.log(req.body);
  login(req.body.username, req.body.password)
    .then(result => {
      if (result.message === 'Correct password') {
        const token = generateSecurityToken({ username: req.body.username });
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
app.post('/login/admin', loginLimiter, (req, res) => {
  console.log(req.body);
  loginadmin(req.body.username, req.body.password)
    .then(result => {
      if (result.message === 'Correct password') {
        const token = generateAdminToken({ username: req.body.username });
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

app.get('/view/user/admin', verifyAdminToken, async (req, res) => {
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
app.post('/login/user', loginLimiter, (req, res) => {
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

//retrieve token
app.post('/retrieve/visitortoken', async (req, res) => {
  const { visitorname, phonenumber } = req.body;

  try {
    // Use aggregation pipeline to match the user document and filter the visitors array
    const pipeline = [
      { $unwind: "$visitors" }, // Deconstruct the visitors array
      { 
        $match: {
          // Match the specific visitor in the visitors array
          "visitors.visitorname": visitorname,
          "visitors.phonenumber": phonenumber
        }
      },
      {
        $project: {
          // Project the necessary fields
          visitorToken: "$visitors.visitorToken",
          username: "$username", // Adjusted to reference the username field
          checkintime: "$visitors.checkintime"
        }
      }
    ];

    const results = await client.db('benr2423').collection('users').aggregate(pipeline).toArray();

    if (results.length > 0) {
      // Send the first match's details
      const user = results[0];
      res.json({ success: true, visitorToken: user.visitorToken, username: user.username, checkintime: user.checkintime });
    } else {
      res.status(404).json({ success: false, message: 'Visitor not found or no token exists.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

app.delete('/delete/visitor', verifyToken, async (req, res) => {
  const visitorToken = req.query.visitorToken;

  try {
    // Use the $pull operator to remove the visitor with the given token
    const result = await client.db('benr2423').collection('users').updateOne(
      { 'username': req.user.username },
      { $pull: { 'visitors': { 'visitorToken': visitorToken } } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ success: true, message: 'Visitor deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Visitor not found or deletion failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});


app.get('/get/userphonenumber', verifySecurityToken, async (req, res) => {
  try {
    const visitorToken = req.query.visitorToken; // Retrieve the visitorToken from query parameters

    if (!visitorToken) {
      return res.status(400).json({ success: false, message: 'Visitor token is required.' });
    }

    const user = await client.db('benr2423').collection('users').findOne({
      'visitors.visitorToken': visitorToken
    }, {
      projection: { 'username': 1, 'phonenumber': 1, 'visitors.$': 1, _id: 0 }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found for the provided visitor token.' });
    }

    // Extract the visitor details
    const visitor = user.visitors[0];
    const username = user.username;
    const userPhoneNumber = user.phonenumber;
    const visitorCheckinTime = visitor.checkintime;

    res.json({
      success: true,
      username: username,
      userPhoneNumber: userPhoneNumber,
      visitorCheckinTime: visitorCheckinTime
    });

    // Optionally, you can delete the visitor's information after retrieval
    await client.db('benr2423').collection('users').updateOne(
      { 'username': username },
      { $pull: { 'visitors': { 'visitorToken': visitorToken } } }
    );
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
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
  try {
    let matchUser = await client.db('benr2423').collection('users').findOne({ username: { $eq: reqUsername } });

    if (!matchUser) {
      return { message: "User not found!" };
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(reqPassword, matchUser.password);

    if (isPasswordMatch) {
      return { message: "Correct password", user: matchUser };
    } else {
      return { message: "Invalid password" };
    }
  } catch (error) {
    console.error(error);
    return { message: "Internal Server Error" };
  }
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

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is the salt rounds

    // Replace the plain password with the hashed password
    userData.password = hashedPassword;

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

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is the salt rounds

    // Replace the plain password with the hashed password
    userData.password = hashedPassword;

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

// Function to generate a visitor pass token
function generateVisitorToken(visitorData) {
  const visitorToken = jwt.sign(
    visitorData,
    'visitorSecretPassword', // Ensure you use a secure, environment-specific password
    { expiresIn: '1d' } // Set an appropriate expiration time for the visitor pass
  );

  return visitorToken;
}

function generateAdminToken(adminData) {
  const adminToken = jwt.sign(
    {
      ...adminData,
      role: 'admin' // Include the admin role in the token payload
    },
    'adminSecretPassword', // Use a secure, environment-specific password for admin tokens
    { expiresIn: '1d' } // Set an appropriate expiration time for the admin token
  );

  return adminToken;
}
function verifyAdminToken(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];
  jwt.verify(token, 'adminSecretPassword', (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }

    // Check if the decoded token has the admin role
    if (decoded.role === 'admin') {
      next(); // Allow access to the route
    } else {
      return res.status(403).send('Forbidden: Insufficient privileges');
    }
  });
}

// Function to generate a security token
function generateSecurityToken(securityData) {
  const securityToken = jwt.sign(
    {
      ...securityData,
      role: 'security' // Include the security role in the token payload
    },
    'securitySecretPassword', // Use a secure, environment-specific password for security tokens
    { expiresIn: '1d' } // Set an appropriate expiration time for the security token
  );

  return securityToken;
}

// Middleware to verify security tokens
function verifySecurityToken(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];
  jwt.verify(token, 'securitySecretPassword', (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }

    // Check if the decoded token has the security role
    if (decoded.role === 'security') {
      next(); // Allow access to the route
    } else {
      return res.status(403).send('Forbidden: Insufficient privileges');
    }
  });
}
