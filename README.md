
# Before Starting

Make sure you have installed node.js and npm

- Go to Web folder:

        cd Web

- Execute in terminal:

        npm install

        // if it throws you an error: "cannot be loaded becouse running scripts is disabled on this system" 
        //execute this command in the same folder

        set-ExecutionPolicy RemoteSigned -Scope CurrentUser

- Now run the web:

        npm run dev



# RubrITM

This project is a web application designed for the ITM university to facilitate the creation, management, and sharing of evaluation rubrics across different courses. The system allows professors to create and customize rubrics, collaborate with other professors, and efficiently communicate final grades to students via their institutional Outlook email.

The application is built using Vue.js and Nuxt.js, providing a robust and scalable foundation for both the frontend and backend logic.


## Key Features

- Group Creation and Management:

        1. Professors can create groups for specific courses.

        2. Group creators can invite other professors to join the group.

        3. Each group represents a course and serves as a collaborative space for rubric       creation and management.
- Rubric Creation and Customization

        1. The group creator can design an initial or model rubric for the course.

        2. Other professors in the group can choose to adopt the model rubric or modify it to suit their specific class needs.

        3. Rubrics can include customizable criteria, weightings, and grading scales.
- User Roles and Permissions

        1. Group Creator: Has full control over the group, including inviting members and creating the initial rubric.

        2. Group Members: Can view, modify, and use rubrics within the group.

        3. Students: Receive final grades via email but do not have access to the rubric creation or modification tools.

## Tech Stack

**Frontend:** Vue.js, Nuxt.js

**Backend:** Node.js, javascript

**Database:** MongoDB

## Color Palette

**White Version**
| Color Name       | Hex Code   | Example                     |
|------------------|------------|-----------------------------|
| Dark Blue     | `#2a3465`  | ![Dark Blue](https://img.shields.io/badge/Dark%20Blue-%232a3465?style=for-the-badge&color=2a3465) |
| White  | `#ffffff`  | ![White](https://img.shields.io/badge/White-%23ffffff?style=for-the-badge&color=ffffff) |
| Medium Blue    | `#3b4a8a`  | ![Medium Blue](https://img.shields.io/badge/Medium%20Blue-%233b4a8a?style=for-the-badge&color=3b4a8a) |
| Purple  | `#523a72`  | ![Purple](https://img.shields.io/badge/Purple-%23523a72?style=for-the-badge&color=523a72) |

**Dark Version**
| Color Name       | Hex Code   | Example                     |
|------------------|------------|-----------------------------|
| Dark Grey    | `#383332`  | ![Dark Gray](https://img.shields.io/badge/Dark%20Gray-%23383332?style=for-the-badge&color=383332) |
| White  | `#ffffff`  | ![White](https://img.shields.io/badge/White-%23ffffff?style=for-the-badge&color=ffffff) |
| Light Gray    | `#d3d3d3`  | ![Light Gray](https://img.shields.io/badge/Light%20Gray-%23d3d3d3?style=for-the-badge&color=d3d3d3) |
| Medium Gray  | `#544f4c`  | ![Medium Gray](https://img.shields.io/badge/Medium%20Gray-%23544f4c?style=for-the-badge&color=544f4c) |
| Muted Brown  | `#6b5e5a`  | ![Muted Brown](https://img.shields.io/badge/Muted%20Brown-%236b5e5a?style=for-the-badge&color=6b5e5a) |