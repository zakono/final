require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { sendWelcomeEmail, sendVerificationCode } = require('./controllers/emailController');
const User = require('./models/User');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));



const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_API_URL = `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${LASTFM_API_KEY}&format=json`;



mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Database connection error:', err));


const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};




app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/login.html'));
});

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/verify.html'));
});

app.get('/portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/portfolio.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/admin.html'));
});


app.post('/signup', async (req, res) => {
    const { username, email, password, firstName, lastName, age, gender, role, twoFA } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let twoFASecret = null;
        if (twoFA) {
            const secret = speakeasy.generateSecret();
            twoFASecret = secret.base32;
        }

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            age,
            gender,
            role,
            twoFA,
            twoFASecret
        });

        await newUser.save();

        console.log('User registered successfully:', username);

       
        if (sendWelcomeEmail) {
            try {
                await sendWelcomeEmail(email, firstName || username); 
                console.log(`Welcome email sent to: ${email}`);
            } catch (emailErr) {
                console.error('Failed to send welcome email:', emailErr.message);
            }
        }

        res.json({ redirect: '/login' });
    } catch (err) {
        console.error('Error registering user:', err.message);
        res.status(500).json({ message: 'Error registering user' });
    }
});


const failedLoginAttempts = new Map(); 

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            
            failedLoginAttempts.set(
                username,
                (failedLoginAttempts.get(username) || 0) + 1
            );

            
            if (failedLoginAttempts.get(username) === 3) {
                
                await sendNotificationEmail(
                    'admin@example.com', 
                    'Failed Login Attempts Alert',
                    `User "${username}" has failed to log in 3 times.`
                );

                console.log(`Admin notified: 3 failed login attempts for "${username}"`);

                
                failedLoginAttempts.delete(username);
            }

            return res.status(401).json({ message: 'Invalid username or password' });
        }

        
        failedLoginAttempts.delete(username);

        
        if (user.twoFA) {
            const token = speakeasy.totp({
                secret: user.twoFASecret,
                encoding: 'base32',
            });

            
            user.twoFACodeExpires = Date.now() + 5 * 60 * 1000;
            await user.save();

            console.log(`2FA code generated for ${username}:`, token);

            
            await sendVerificationCode(user.email, token);

            return res.json({ redirect: '/verify', username: user.username });
        }

        
        const jwtToken = generateToken(user);
        console.log('User logged in successfully:', username);

        res.json({
            token: jwtToken,
            role: user.role,
            redirect: '/portfolio.html',
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});



app.post('/verify', async (req, res) => {
    const { username, code } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    
    if (Date.now() > user.twoFACodeExpires) {
        return res.status(400).json({ message: 'Verification code expired' });
    }

    const isVerified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code,
        window: 1,
    });

    if (!isVerified) {
        return res.status(400).json({ message: 'Invalid verification code' });
    }

    const jwtToken = generateToken(user);

    console.log('User verified successfully with 2FA:', username);
    res.json({
        token: jwtToken,
        role: user.role,
        redirect: '/portfolio.html',
    });
});


const carouselRoutes = require('./routes/carousel');
app.use('/carousel', carouselRoutes);


const stockRoutes = require('./routes/stockRoutes'); 
app.use(stockRoutes);

const currencyRoutes = require('./routes/currencyRoutes');
app.use('/api/currency', currencyRoutes);





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
