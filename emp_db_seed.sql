USE empTrack_DB;

INSERT INTO department (name)
VALUES ('Mighty Nein'),('Vox Machina'),('Mortal Pathfinders');

INSERT INTO role (title, salary, department_id)
VALUES ('Wizard',18.50,1),('Monk',19.50,1),('Cleric',20.50,1),('Rogue',18.50,1),('Cleric',15.50,2),('Rogue',16.50,2),('Ranger',22.50,2),('Rogue',10.50,3),('Warlock',11.50,3),('Bard',12.50,3);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ('Caleb','Widogast',1),('Pike','Trickfoot',5),('Nerium','Oleander',8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Beauregard','Lionett',2,1),('Jester','Lavorre',3,1),('Caduceus','Clay',3,1),('Veth','Brenatto',4,1),("Vax'ildan",'Vessar',6,2),("Vex'ahlia",'de Rolo',7,2),('Percival','de Rolo',7,9),('Natalia','Nightlark',9,3),('Taro','Tarnassian',10,3);