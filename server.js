// Import and require mysql2
const mysql = require('mysql2');

// Import and require inquirer
const inquirer = require('inquirer');

// Import and require helper functions
const viewAllDepartments = require('./lib/viewAllDepartments');
const viewAllRoles = require('./lib/viewAllRoles');
const viewAllEmployees = require('./lib/viewAllEmployees');
const addDepartment = require('./lib/addDepartment');
const addRole = require('./lib/addRole');
const addEmployee = require('./lib/addEmployee');
const updateEmployeeRole = require('./lib/updateEmployeeRole');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'P@ssWord',
      database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
  );

  function runApplication() {

  }
  
  module.exports = runApplication;

