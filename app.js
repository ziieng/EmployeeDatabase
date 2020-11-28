// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const { Table } = require("console-table-printer");
// documentation: https://console-table.netlify.app/docs/

// Set the port of our application
const PORT = process.env.PORT || 8080;

// MySQL DB Connection Information (remember to change this with our specific credentials)
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "empTrack_DB",
});

// Initiate MySQL Connection.
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  chooseRoute();
});

//REQUIREMENTS
// Employee Mgmt Database
//   Department table
//   Role table
//   Employee table
// MySQL Queries
//   Constructor or class to contain/organize them?
// Inquirer interface
//   console-table-printer is prettier

//Interface Path
//  If no database, create DB
//  (**If no departments, force create one?)
//  (**If no roles, force create one?)
//  (**If no employees, force create one?)
//
function chooseRoute() {
  inquirer
    .prompt({
      name: "next",
      type: "list",
      message: "What type of action would you like to take?",
      choices: ["View", "Edit", "Add", "Delete", "Exit"],
    })
    .then((ans) => {
      switch (ans.next) {
        case "View":
          chooseView();
          break;
        case "Edit":
          //view choices
          break;
        case "Add":
          //view choices
          break;
        case "Delete":
          //view choices
          break;
        case "Exit":
          console.log("See you later!");
          //close
          break;
      }
    });
}

function chooseView() {
  inquirer
    .prompt({
      name: "query",
      type: "list",
      message: "What would you like to view?",
      choices: [
        new inquirer.Separator("DEPARTMENTS:"),
        "All departments",
        "Utilized budget of a department",
        new inquirer.Separator("ROLES:"),
        "All Roles",
        "Roles in a department",
        new inquirer.Separator("EMPLOYEES:"),
        "All employees",
        "Employees in a department",
        "Employees reporting to same manager",
        new inquirer.Separator("OR:"),
        "Go back",
        new inquirer.Separator("*****"),
      ],
    })
    .then((ans) => {
      switch (ans.query) {
        case "All departments":
          //query: select * from departments
          break;
        case "Utilized budget of a department":
          //query: select (sum of salaries) from role where dept_id is (selected)
          break;
        case "All Roles":
          //query: select * from roles
          //page breaks?
          break;
        case "Roles in a department":
          //query: select * from roles where dept_id is (selected)
          break;
        case "All employees":
          //query: select * from employees
          //page breaks?
          break;
        case "Employees in a department":
          //query: select * from employees where dept_id is (selected)
          //page breaks?
          break;
        case "Employees reporting to same manager":
          //query: select * from employees where manager_id is (selected)
          //page breaks?
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}
//  *Edit:
//      Update Employee's Manager
//      Update Employee's Role
//      Update Salary of Role
//      Update Department of Role
//
//  *Add:
//      Add Employee
//       -> First Name
//       -> Last Name
//       -> Role (if more than 5, prompt which department first)
//          CHECK: Does role exist?
//       -> Manager
//          CHECK: Does employee exist?
//      Add Role
//       -> Title
//       -> Salary
//       -> Department
//          CHECK: Does department exist?
//      Add Department
//       -> Name
//
//  *Delete:
//      Delete Employee
//          CHECK: Do they have direct reports?
//      Delete Role
//          CHECK: Does it have any assigned employees?
//      Delete Department
//          CHECK: Does it have any assigned roles?
