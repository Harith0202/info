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
 *     tags:
 *       - User Management
 *     security:
 *       - BearerAuth: []
 *     summary: Register a new user
 *     description: This endpoint is for creating a new user account.
 *     requestBody:
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
 *                 description: Password must be at least 8 characters long and contain at least one number, one lowercase letter, one uppercase letter, and one special symbol.
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phonenumber: 
 *                 type: string
 *             required:
 *               - username
 *               - password
 *               - name
 *               - email
 *               - phonenumber
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request. User data is not valid.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /register/test/user:
 *   post:
 *     tags:
 *       - User Management
 *     summary: Register a new user
 *     description: This endpoint is for creating a new user account.
 *     requestBody:
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
 *                 description: Password must be at least 8 characters long and contain at least one number, one lowercase letter, one uppercase letter, and one special symbol.
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phonenumber: 
 *                 type: string
 *             required:
 *               - username
 *               - password
 *               - name
 *               - email
 *               - phonenumber
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request. User data is not valid.
 *       500:
 *         description: Internal server error
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
 * /login/admin:
 *   post:
 *     summary: Login for admin account
 *     tags: [administrator]
 *     requestBody:
 *       description: adminitrator login credentials
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
 * /view/user/admin:
 *   get:
 *     summary: View all user (security)
 *     tags: [administrator]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of users
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
 * /view/visitor/user:
 *   get:
 *     summary: View visitors associated with the user
 *     description: Retrieves a list of visitors that are associated with the authenticated user.
 *     tags:
 *       - [User Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of visitors associated with the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 visitors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       visitorname:
 *                         type: string
 *                       checkintime:
 *                         type: string
 *                       checkouttime:
 *                         type: string
 *                       temperature:
 *                         type: number
 *                       gender:
 *                         type: string
 *                       ethnicity:
 *                         type: string
 *                       age:
 *                         type: integer
 *                       phonenumber:
 *                         type: string
 *       '401':
 *         description: Unauthorized. Token is missing or invalid.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: Internal Server Error.
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
 * /retrieve/visitortoken:
 *   post:
 *     summary: Retrieve existing visitor token
 *     description: Allows a visitor to retrieve their previously generated token by providing their unique identifier.
 *     tags:
 *       - Visitor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitorname:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the existing visitor token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 visitorToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '404':
 *         description: Visitor not found or no matching token for the provided details.
 *       '500':
 *         description: Internal Server Error.
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
 * /get/userphonenumber:
 *   get:
 *     summary: Retrieve the visitor's destination using visitor token
 *     description: Allows security personnel to retrieve the detail of the user associated with a given visitor token.
 *     tags:
 *       - Security
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the visitor's destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 visitor of:
 *                   type: string
 *       '401':
 *         description: Unauthorized. Token is missing, invalid, or expired.
 *       '404':
 *         description: User not found for the provided token.
 *       '500':
 *         description: Internal Server Error.
 */

