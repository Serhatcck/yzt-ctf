const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Read users from JSON file
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return empty array
            return [];
        }
        throw error;
    }
}

// Write users to JSON file
async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// Check if email already exists
async function isEmailExists(email) {
    const users = await readUsers();
    return users.some(user => user.email === email);
}

// Add new user
async function addUser(userData) {
    const users = await readUsers();
    
    // Validate required fields
    const requiredFields = ['name', 'lastName', 'email', 'password'];
    for (const field of requiredFields) {
        if (!userData[field]) {
            throw new Error(`${field} is required`);
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
    }

    // Check if email already exists
    if (await isEmailExists(userData.email)) {
        throw new Error('Email already registered');
    }

    userData.type = "hunter"

    // Add user with registration date
    const newUser = {
        ...userData,
        id: Date.now().toString(), // Simple ID generation
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

// Login user
async function loginUser(email, password) {
    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

module.exports = {
    readUsers,
    writeUsers,
    isEmailExists,
    addUser,
    loginUser
}; 