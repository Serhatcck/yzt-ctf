const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { addUser, loginUser, readUsers } = require('./utils/userManager');
const { generateToken, authenticateToken, ENCRYPTION_KEY, ENCRYPTION_IV } = require('./utils/jwtManager');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Duck Hunt API',
      version: '1.0.0',
      description: 'API for Duck Hunt CTF Challenge',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new hunter account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastName
 *               - email
 *               - password
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Invalid input or email already exists
 */
app.post('/api/register', async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await addUser(userData);
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   description: User information
 *       400:
 *         description: Invalid credentials
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await loginUser(email, password);
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/hunt:
 *   post:
 *     summary: Hunt a duck
 *     description: Submit a duck type for hunting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duckType
 *             properties:
 *               duckType:
 *                 type: string
 *                 description: Type of the duck to hunt
 *     responses:
 *       200:
 *         description: Successful hunt
 *       400:
 *         description: Invalid duck type
 *       401:
 *         description: Unauthorized
 */
app.post('/api/hunt', (req, res) => {
  const { duckType } = req.body;
  
  if (!duckType) {
    return res.status(400).json({ error: 'Duck type is required' });
  }

  // TODO: Implement duck hunting logic
  res.json({ message: `Hunting ${duckType} duck!` });
});

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user information
 *     description: Get authenticated user's information using JWT token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     type:
 *                       type: string
 *                     registeredAt:
 *                       type: string
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;
        
        res.json({
            message: 'User information retrieved successfully',
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving user information'
        });
    }
});

/**
 * @swagger
 * /api/hunt/dufy-duck:
 *   get:
 *     summary: Hunt the dufy duck
 *     description: Dufy Duck !!!
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Encrypted flag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dufy_duck:
 *                   type: string
 */
app.get('/api/hunt/dufy-duck', authenticateToken, (req, res) => {
    // Check if user is admin
    if (req.user.type !== 'admin') {
        return res.status(403).json({ 
            error: 'Access denied. Admin privileges required.' 
        });
    }

    // Encrypt the flag using static parameters
    const flag = 'yztctf{duck_hunt_jwt_none_algorithm_vulnerability}';
    const cipher = crypto.createCipheriv(
        'aes-128-cbc',
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        Buffer.from(ENCRYPTION_IV, 'hex')
    );
    let dufy_duck = cipher.update(flag, 'utf8', 'hex');
    dufy_duck += cipher.final('hex');

    // Return the encrypted flag
    res.json({
        dufy_duck,
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
}); 