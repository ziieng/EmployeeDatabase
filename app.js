// Dependencies
var mysql = require("mysql");
require("dotenv").config();
const {
    Table
} = require('console-table-printer');
// documentation: https://console-table.netlify.app/docs/

// Set the port of our application
var PORT = process.env.PORT || 8080;

// MySQL DB Connection Information (remember to change this with our specific credentials)
var connection = mysql.createConnection({
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
    inquirer.prompt({
            name: "next",
            type: "list",
            message: "What type of action would you like?",
            choices: [
                "View",
                "Edit",
                "Add",
                "Delete",
                "Exit"
            ]
        })
        .then((ans) => {
            switch (ans.next) {
                case "View":
                    //view choices
                    break
                case "Edit":
                    //view choices
                    break
                case "Add":
                    //view choices
                    break
                case "Delete":
                    //view choices
                    break
                case "Exit":
                    //close
                    break
            }
        })
}
//  Choices: (**Hide ones that aren't valid, or just validate them?)
//      View
//      Edit
//      Add
//      Delete
//
//  *View:
//      Departments
//       -> Total utilized budget of department
//      Roles
//       -> All
//       -> By Department
//      Employees
//       -> All
//       -> By Department
//       -> By Manager (if more than 5, prompt which department first)
//      
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