//REQUIREMENTS
// Employee Mgmt Database
//   Department table
//   Role table
//   Employee table
// MySQL Queries
//   Constructor or class to contain/organize them?
// Inquirer interface
//   Console.table(???)

//Interface Path
//  If no database, create DB
//  (**If no departments, force create one?)
//  (**If no roles, force create one?)
//  (**If no employees, force create one?)
//
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