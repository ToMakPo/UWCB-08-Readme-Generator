<!-- id: XZ6R13, version: 1.0.0 -->
# Readme Generator
A node based readme generator that will create a readme file based off the user's inputs.

---
## 📌 LINKS
[GitHub Repo](https://github.com/ToMakPo/UWCB-09-Readme-Generator)<br>
[Project Demo](https://tomakpo.github.io/UWCB-09-Readme-Generator/)

---
## 🎯 GOAL
To create a node program that can prompt the user for information about the project and generate a readme file.

---
## ✅ TASKS
- The program needs to prompt the user for information about the project.
    - Check if the user would like to create a new readme file or edit one that already exists.
        - NEW README
            - get title
            - get brief description
            - allow the user to select different sections to include
        - EDIT README
            - pull a readme stord in local storage using it's id.
            - import a readme using a JSON file.
    - Allow the user to save the file as markdown, HTML, or JSON.
    - Ask the user where to save the new document.

---
## ⚔️ PROJECT

This project will need to be ran in node. Before running the project, if you haven't done so already, you will need to install the node modules by entering `npm i` into the terminal. When everying is installed, you can run the project by entering `node index`.

```
npm i
node index
```

Once you have started the program, you will be asked to either create a new readme file or edit one that you had already made in the past.
If you select to create a new readme, you will be taken through a searise of prompts asking you to enter information about the program. When you are done, you will be given the options to save the file.
If you choose to edit an existing readme, you will be prompted to provide the path of the readme file. If the program is able to find the file, it will bring you to the edit menu where you can make any needed changes to the file before getting the option to save the changes.

> NOTE: The readme file being edited needs to be one made by this program. When the file is created a copy of it will be saved to local storage and you can retrieve it by it's id which is found at the top of the document. You can also export the file as a JSON file and import it at a later point. 

Once you are done with everything and it looks good, you will be prompted to provide a file path to save the readme file. You only need to provide the path, but not the file name. It will name the file `README` plus the appropriate file extention. If a readme file already exists in that location, then it will be overwritten.

---
## 🏆 ATTRIBUTIONS
[Google Fonts](https://fonts.google.com/) - Used in the linked css for the generated HTML readme files.