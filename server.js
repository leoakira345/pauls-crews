const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuration ---

// Admin Credentials (for demonstration purposes)
const ADMIN_USER_ID = '50124';
const ADMIN_PASSWORD = 'admin50124';

// Nodemailer Transporter Setup
// IMPORTANT: Replace with your actual email service credentials
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
        user: 'your_email@gmail.com', // Your email address
        pass: 'your_email_password'   // Your email password or app-specific password
    }
});

// --- Middleware ---

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (if you were sending JSON from frontend)
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: 'supersecretkeyforpaulscleaningcrews', // Replace with a strong, random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to check if user is authenticated (admin)
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.redirect('/login.html'); // Not authenticated, redirect to login page
    }
}

// --- In-memory Data Storage (Replace with a database in production) ---
let jobApplications = [];
let nextApplicationId = 1;

// --- Routes ---

// Public Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/apply', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'apply.html'));
});

// Handle job application submission
app.post('/apply-job', (req, res) => {
    const { name, email, phone, experience, jobDetails } = req.body;

    if (!name || !email || !phone || !experience || !jobDetails) {
        return res.status(400).send('All fields are required.');
    }

    const newApplication = {
        id: nextApplicationId++,
        name,
        email,
        phone,
        experience,
        jobDetails,
        status: 'pending', // 'pending', 'approved', 'declined'
        submittedAt: new Date().toISOString()
    };

    jobApplications.push(newApplication);
    console.log('New Job Application:', newApplication);
    res.send('Application submitted successfully! We will review it shortly.');
});

// Admin Login Route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { userId, password } = req.body;

    if (userId === ADMIN_USER_ID && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin'); // Redirect to admin dashboard
    } else {
        res.status(401).send('Invalid User ID or Password.');
    }
});

// Admin Dashboard Route (Protected)
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login');
    });
});

// API to get job requests (Protected)
app.get('/api/job-requests', isAuthenticated, (req, res) => {
    res.json(jobApplications);
});

// API to approve a job application (Protected)
app.post('/api/job-requests/:id/approve', isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const application = jobApplications.find(app => app.id === id);

    if (!application) {
        return res.status(404).send('Application not found.');
    }

    application.status = 'approved';

    // Send congratulatory email
    const mailOptions = {
        from: 'your_email@gmail.com', // Your email address
        to: application.email,
        subject: 'Congratulations! You are selected for Paul\'s Cleaning Crews!',
        html: `
            <p>Dear ${application.name},</p>
            <p>We are thrilled to inform you that you have been selected to join Paul's Cleaning Crews as a valued member!</p>
            <p>Your application stood out, and we believe you will be a great asset to our team.</p>
            <p>We will be in touch shortly with more details regarding your onboarding process and first assignments.</p>
            <p>Welcome aboard!</p>
            <p>Best regards,</p>
            <p>The Paul's Cleaning Crews Team</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Approval email sent to:', application.email);
        res.send('Application approved and email sent.');
    } catch (error) {
        console.error('Error sending approval email:', error);
        res.status(500).send('Application approved, but failed to send email.');
    }
});

// API to decline a job application (Protected)
app.post('/api/job-requests/:id/decline', isAuthenticated, (req, res) => {
    const id = parseInt(req.params.id);
    const application = jobApplications.find(app => app.id === id);

    if (!application) {
        return res.status(404).send('Application not found.');
    }

    application.status = 'declined';
    // No email sent for declined applications as per requirement
    res.send('Application declined.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Admin Login: User ID - 50124, Pass - admin50124');
});