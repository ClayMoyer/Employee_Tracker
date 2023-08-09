const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const util = require('util');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'frankwhite',
    database: 'business_db'
});

const query = util.promisify(db.query).bind(db);

function getAllDepartments() {
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function getAllRoles() {
    db.query(`SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function getAllEmployees() {
    db.query(`SELECT role.title, role.salary, e1.id, e1.first_name, e1.last_name, department.name AS department, CONCAT(e2.first_name, " ", e2.last_name) AS manager
    FROM employee e1
    JOIN role ON e1.role_id = role.id
    JOIN department
    ON role.department_id = department.id
    LEFT JOIN employee e2
    ON e1.manager_id = e2.id`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function addDepartment() {
    inquirer.prompt([
        {
            name: 'deptName',
            message: 'What would you like to call the department?',
            type: 'input'
        }
    ])
    .then(answer => {
        db.query(`INSERT INTO department (name) VALUES (?)`, answer.deptName, (err, results) => {
            if (err) console.log(err)
            else {
                console.log(`${answer.deptName} added to the database!`);
                mainMenu();
            }
        })
    })
}

async function addRole() {
    const depts = await query(`SELECT * FROM department`)
    inquirer.prompt([
        {
            name: 'title',
            message: 'Give this role a title:',
            type: 'Input'
        },
        {
            name: 'salary',
            message: 'Enter the salary:',
            type: 'input'
        },
        {
            name: 'dept',
            message: 'Which department does this role occupy?',
            type: 'list',
            choices: depts.map(obj => obj.name)
        }
    ])
    .then(answer => {
        let deptID = depts.filter(obj => {
            return obj.name == answer.dept;
        })
        db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answer.title, answer.salary, deptID[0].id], (err, results) => {
            if (err) console.log(err)
            else {
                console.log(`The role of ${answer.title} has been added to the database!`);
                mainMenu();
            }
        })
    })
}

async function addEmployee() {
    const roles = await query(`SELECT * FROM role`);
    const employees = await query(`SELECT * FROM employee`)
    employees.push({
        first_name: 'No',
        last_name: 'Manager',
        id: null
    })
    inquirer.prompt([
        {
            name: "firstName",
            message: "Enter the employee's first name.",
            type: "input"
        },
        {
            name: "lastName",
            message: "Enter the employee's last name.",
            type: "input"
        },
        {
            name: "role",
            message: "Enter the employee's role.",
            type: "input"
        },
        {
            name: "manager",
            message: "Identify the employee's manager."
        }
    ])
    .then(answer => {
        let roleId = roles.filter(obj => {
            return obj.title == answer.role;
        })
        let managerId = employees.filter(obj => {
            if(answer.manager) return `${obj.first_name} ${obj.last_name}` == answer.manager;
            else {

            }
        })
        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answer.firstName, answer.lastName, roleId[0].id, managerId[0].id], (err, results) => {
            if(err) console.log(err)
            else {
                console.log(`Added employee ${answer.firstName} ${answer.lastName} to database.`)
                mainMenu
            }
        })
    })
}
async function updateEmployeeRole() {
    const roles = await query(`SELECT * FROM role`);
    const employees = await query(`SELECT * FROM employee`);
    inquirer.prompt([
        {
            name: 'employee',
            message: "Which employee would you like to change the role of?",
            type: 'list',
            choices: employees.map(obj => `${obj.first_name} ${obj.last_name}`)
        },
        {
            name: 'role',
            message: "Select the desired role.",
            type: 'list',
            choices: roles.map(obj => obj.title)
        }
    ])
    .then(answer => {
        let roleId = roles.filter(obj => obj.title === answer.role);
        let employeeID = employees.filter(obj => `${obj.first_name} ${obj.last_name}` == answer.employee);
        db.query(`
        UPDATE employee
        SET role_id = ?
        WHERE id = ?`, [roleId[0].id, employeeID[0].id], (err, results) => {
            if(err) console.log(err)
            else {
                console.log(`Role of ${answer.employee} updated to ${answer.role}.`);
                mainMenu();
            }
        })
    })
}
function mainMenu() {
    inquirer.prompt([
        {
            name: 'option',
            message: 'Select one of the following options:',
            type: 'list',
            choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee']
        }
    ])
    .then(answer => {
        switch(answer.option) {
            case 'View Departments':
                getAllDepartments();
                break;
            case 'View Roles':
                getAllRoles();
                break;
            case 'View Employees':
                getAllEmployees();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee':
                updateEmployeeRole();
                break;
        }
    })
}

mainMenu();