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

//name is what inquirer displays - from https://stackoverflow.com/questions/46210279/pass-objects-in-array-into-inquirer-list-choices


let trackFetcher = new Promise((resolve, reject) => {
    for (let track of data.tracks.items) {
        var trackData = {
            name: track.name + " by: " + track.artists[0].name,
            value: {
                name: track.name,
                album: track.album.name,
                artist: track.artists[0].name,
                url: track.external_urls.spotify,
            }
        }
        tracks.push(trackData);
        resolve(tracks);
    }
});

trackFetcher.then((tracks) => {
    inquirer.prompt([{
        type: 'list',
        message: 'Select a track from the list',
        choices: tracks,
        name: "track"
    }]).then(function (selected) {
        //Do stuff with the result
    });
});