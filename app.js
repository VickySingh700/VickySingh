const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));

// Route for the Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// Route for Salary Calculator
app.get('/salary-calculator', (req, res) => {
    const employeesPath = path.join(__dirname, 'employees.json');

    fs.readFile(employeesPath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If file doesn't exist, return zero salary
                return res.render('salary-calculator', { totalSalary: 0 });
            } else {
                return res.status(500).send('Error reading employee data');
            }
        }

        // Initialize employees array if file is empty
        const employees = data ? JSON.parse(data) : [];
        const totalSalary = employees.reduce((sum, employee) => sum + parseFloat(employee.salary), 0);
        res.render('salary-calculator', { totalSalary });
    });
});

// Route for the Sign-Up Page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle Employee Sign-Up
app.post('/signup', (req, res) => {
    const employee = {
        name: req.body.name,
        email: req.body.email,
        position: req.body.position,
        salary: req.body.salary
    };

    const employeesPath = path.join(__dirname, 'employees.json');
    
    // Read existing employee data
    fs.readFile(employeesPath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If file doesn't exist, create it
                data = '[]';
            } else {
                return res.status(500).send('Error reading employee data');
            }
        }

        // Initialize employees array if file is empty
        const employees = data ? JSON.parse(data) : [];
        employees.push(employee);

        // Write updated data back to the file
        fs.writeFile(employeesPath, JSON.stringify(employees, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving employee data');
            }
            res.send(`<h2>Employee ${employee.name} signed up successfully!</h2><br><a href="/signup">Go Back</a>`);
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
