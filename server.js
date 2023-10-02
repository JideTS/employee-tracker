// Import and require mysql2
const mysql = require('mysql2');

// Import and require inquirer
const inquirer = require('inquirer');

// Import and require console.table to format application display
const cTable = require('console.table');

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

db.connect((err) => {
  if (err) throw err;
  runApplication();
});

function runApplication() {

  inquirer.prompt([
    {
      name: 'coreQuery',
      type: 'rawlist',
      message: 'Employee management tool',
      choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
    }
  ]).then((response) => {
    switch (response.coreQuery) {

      case 'View all departments':
        viewAllDepartments();
        break;

      case 'View all roles':
        viewAllRoles();
        break;

      case 'View all employees':
        viewAllEmployees();
        break;

      case 'Add a department':
        addDepartment();
        break;

      case 'Add a role':
        addRole();
        break;

      case 'Add an employee':
        addEmployee();
        break;

      case 'Update an employee role':
        updateEmployeeRole();
        break;

      default:
        break;
    }
  })

}

function viewAllDepartments() {
  db.query(`SELECT dep.department_name 'Department', dep.id 'Associated ID' FROM department dep;`, (err, res) => {
    if (err) throw err;
    console.table('\n', res);
    runApplication();
  })
};

function viewAllRoles() {
  db.query(`SELECT rol.title 'Job title', rol.id 'Job ID', dep.department_name 'Departement', dep.id 'Department ID', rol.salary 'Salary' FROM role rol LEFT JOIN department dep ON rol.department_id = dep.id;`, (err, res) => {
    if (err) throw err;
    console.table('\n', res);
    runApplication();
  })
};

function viewAllEmployees() {
  db.query(`SELECT e.id 'Employee ID', CONCAT(e.first_name, ' ', e.last_name) 'Employee', rol.title 'Title', dep.department_name 'Department', rol.salary 'Salary', CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.id JOIN role rol ON e.role_id = rol.id JOIN department dep ON dep.id = rol.department_id;`, (err, res) => {
    if (err) throw err;
    console.table('\n', res);
    runApplication();
  })
};

function addDepartment() {
  inquirer.prompt([
    {
      name: 'newDepartment',
      type: 'input',
      message: 'What is the department you want to add?'
    }
  ]).then((res) => {
    db.query(`INSERT INTO department SET ?`,
      {
        department_name: res.newDepartment,
      },
      (err, res) => {
        if (err) throw err;
        console.log(`\n The new department has been saved.`);
        runApplication();
      })
  })
};

function addRole() {
  db.query(`SELECT * FROM department;`, (err, res) => {
    if (err) throw err;
    let departments = res.map(department => ({ name: department.department_name, id: department.id }));
    inquirer.prompt([
      {
        name: 'role',
        type: 'input',
        message: 'What is the role you want to add?'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'What is the associated salary?'
      },
      {
        name: 'departmentName',
        pageSize: 1000,
        type: 'rawlist',
        message: 'Which department should the role be associated with?',
        choices: departments
      },
    ]).then((res) => {


      db.query(`SELECT id FROM department WHERE department_name = '${res.departmentName}';`, (err, response) => {
        if (err) throw err;

        db.query(`INSERT INTO role SET ?`,
          {
            title: res.role,
            salary: res.salary,
            department_id: response[0].id,
          },
          (err, res) => {
            if (err) throw err;
            console.log(`\n The new role has been added to the database.`);
            runApplication();
          })

      })



    })
  })
};

function addEmployee() {
  db.query(`SELECT * FROM role;`, (err, response1) => {
    if (err) throw err;
    let roles = response1.map(role => ({ name: role.title, value: role.id }));
    db.query(`SELECT * FROM employee;`, (err, response2) => {
      if (err) throw err;
      let employees = response2.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));
      inquirer.prompt([
        {
          name: 'firstName',
          type: 'input',
          message: 'What is the first name of the new employee?'
        },
        {
          name: 'lastName',
          type: 'input',
          message: 'What is the last name of the new employee?'
        },
        {
          name: 'role',
          pageSize: 1000,
          type: 'rawlist',
          message: 'What is the role of the new employee?',
          choices: roles
        },
        {
          name: 'manager',
          pageSize: 1000,
          type: 'rawlist',
          message: 'Who will manage the new employee?',
          choices: employees
        }
      ]).then((response3) => {
        db.query(`INSERT INTO employee SET ?`,
          {
            first_name: response3.firstName,
            last_name: response3.lastName,
            role_id: response3.role,
            manager_id: response3.manager,
          },
          (err, response4) => {
            if (err) throw err;
            console.log(`\n ${response3.firstName} ${response3.lastName} was added to the database.`);
            runApplication();
          })
  
      })
    })
  })
};


function updateEmployeeRole() {

  db.query(`SELECT * FROM role;`, (err, response1) => {
    if (err) throw err;

    db.query(`SELECT * FROM employee;`, (err, response2) => {
      if (err) throw err;
      let employees = response2.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, id: employee.id }));
      let roles = response1.map(role => ({ name: role.title, id: role.id }));

      inquirer.prompt([
        {
          name: 'employee',
          pageSize: 1000,
          type: 'rawlist',
          message: 'Which employee should be updated?',
          choices: employees
        },
        {
          name: 'newRole',
          pageSize: 1000,
          type: 'rawlist',
          message: 'What should be the new role of the employee?',
          choices: roles
        },
      ]).then((response3) => {

        db.query(`SELECT e.id FROM employee e WHERE CONCAT(e.first_name, ' ',e.last_name) = '${response3.employee}';`, (err, response4) => {
          if (err) throw err;

          db.query(`SELECT id FROM role WHERE title = '${response3.newRole}';`, (err, response5) => {
            if (err) throw err;

            db.query(`UPDATE employee SET ? WHERE ?`,
              [
                {
                  role_id: response5[0].id,
                },
                {
                  id: response4[0].id,
                },
              ],
              (err, res) => {
                if (err) throw err;
                console.log(`\n The employee new role has been saved.`);
                runApplication();
              })
          })
        })
      })
    })
  })
}