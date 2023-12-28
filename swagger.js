/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: API endpoints for security operations
 */

/**
 * @swagger
 * /register/user:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint is for creating a new user account.
 *     tags:
 *       - User Management
 *     security:
 *       - BearerAuth: [] # Applies the BearerAuth security to the route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - name
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request. The server could not understand the request due to invalid syntax.
 *       401:
 *         description: Unauthorized. The user is not authorized to access this endpoint.
 *       500:
 *         description: Internal Server Error. A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
 */

/**
 * @swagger
 * /login/security:
 *   post:
 *     summary: Login for security account
 *     tags: [Security]
 *     requestBody:
 *       description: Security login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 */
/**
 * @swagger
 * /view/visitor/security:
 *   get:
 *     summary: View all visitors (Security)
 *     tags: [Security]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of visitors
 */
/**
 * @swagger
 * /login/user:
 *   post:
 *     summary: User login account
 *     tags: [User Management]
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 */

/**
 * @swagger
 * /create/visitor/user:
 *   post:
 *     summary: Create a visitor (User)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Visitor information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitorname:
 *                 type: string
 *               checkintime:
 *                 type: string
 *               checkouttime:
 *                 type: string
 *               temperature:
 *                 type: number
 *               gender:
 *                 type: string
 *               ethnicity:
 *                 type: string
 *               age:
 *                 type: number
 *               phonenumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Visitor created successfully
 */
/**
 * @swagger
 * /view/visitor/user:
 *   get:
 *     summary: View visitors created by a particular user
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of visitors created by the authenticated user
 *       '500':
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /update/visitor/{visitorname}:
 *   put:
 *     summary: Update visitor information (User)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: visitorname
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated visitor information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkintime:
 *                 type: string
 *               checkouttime:
 *                 type: string
 *               temperature:
 *                 type: number
 *               gender:
 *                 type: string
 *               ethnicity:
 *                 type: string
 *               age:
 *                 type: number
 *               phonenumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Visitor updated successfully
 *       '404':
 *         description: Visitor not found or unauthorized
 *       '500':
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /view/visitor/{visitorName}:
 *   get:
 *     summary: View visitor data by name
 *     tags: [Visitor]
 *     parameters:
 *       - in: path
 *         name: visitorName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Visitor data retrieved successfully
 *       '404':
 *         description: Visitor not found
 *       '500':
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /protected/endpoint:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Example of a protected endpoint.
 *     description: This endpoint requires a Bearer token.
 *     responses:
 *       '200':
 *         description: A successful response.
 */

