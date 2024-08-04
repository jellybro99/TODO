if (window.history.replaceState) { //removes check on form resubmittion
    window.history.replaceState(null, null, window.location.href);
}
//task logic
function createTask(name, dueDate, description) {
    this.name = name;
    this.dueDate = dueDate;
    this.description = description;
    return { name, dueDate, description };
}

const tasks = (() => {
    const toStorage = () => {
        localStorage.setItem("tasks", JSON.stringify(taskArray));
    }

    const fromStorage = () => {
        if (localStorage.getItem("tasks") == null) {
            return [createTask("my first to-do", "", "this is my very first to-do!")];
        } else {
            return JSON.parse(localStorage.getItem("tasks"));
        }
    }
    const taskArray = fromStorage();

    const add = (task) => {
        taskArray.push(task);
        toStorage();
    }

    const remove = (task) => {
        taskArray.splice(taskArray.indexOf(task), 1);
        toStorage();
    }

    const replace = (task, newTask) => {
        taskArray[taskArray.indexOf(task)] = newTask;
        task.name = newTask.name;
        task.dueDate = newTask.dueDate;
        task.description = newTask.description;
        toStorage();
    }

    const getAll = () => { return taskArray; }

    return { add, remove, replace, getAll };
})();

const popupController = (() => {
    let currTaskCard = null;
    const popup = document.querySelector("#popup");
    const form = document.querySelector("form");
    //button connections
    const buttonConnections = () => {
        popup.addEventListener("mousedown", (e) => {
            if (e.target.id == "popup") { close(); }
        })
        document.querySelector("form").addEventListener("submit", submit);
        document.querySelector("#complete").addEventListener("click", complete);
        document.querySelector("#edit").addEventListener("click", edit);
        document.querySelector("#trash").addEventListener("click", trash);
        document.querySelector("#close").addEventListener("click", close);
        document.querySelector("#cornerbob").addEventListener("click", close)
    }

    const setTaskCard = (taskCard) => {
        currTaskCard = taskCard;
    }
    
    const submit = (e) => {
        e.preventDefault();
        const formContents = Object.fromEntries(new FormData(e.target));
        const newTask = createTask(formContents["title"], formContents["date"], formContents["description"]);

        if (currTaskCard == null) {
            tasks.add(newTask);
            addToPage(newTask);
        } else {
            tasks.replace(currTaskCard.task, newTask);
            currTaskCard.task = newTask;
            currTaskCard.children[1].textContent = newTask.name;
        }
        close();
    }

    const complete = () => {
        tasks.remove(currTaskCard.task);
        currTaskCard.remove();
        close();
    }

    const trash = () => {
        tasks.remove(currTaskCard.task);
        currTaskCard.remove();
        close();
    }

    const open = () => {
        popup.style.visibility = "visible";
    }

    const close = () => {
        popup.style.visibility = "hidden";
        currTaskCard = null;
        document.querySelector("form").reset();
    }

    const formButtons = (submitButton, completeButton, editButton, trashButton, closeButton) => { //sets display of desired buttons
        document.querySelector("#submit").style.display = (submitButton) ? "block" : "none";
        document.querySelector("#complete").style.display = (completeButton) ? "block" : "none";
        document.querySelector("#edit").style.display = (editButton) ? "block" : "none";
        document.querySelector("#trash").style.display = (trashButton) ? "block" : "none";
        document.querySelector("#close").style.display = (closeButton) ? "block" : "none";
    }

    const readOnly = (readOnly) => {
        if (readOnly) {
            document.querySelector("#title").setAttribute("readonly", "readonly");
            document.querySelector("#date").setAttribute("readonly", "readonly");
            document.querySelector("#description").setAttribute("readonly", "readonly");
        } else {
            document.querySelector("#title").removeAttribute("readonly");
            document.querySelector("#date").removeAttribute("readonly");
            document.querySelector("#description").removeAttribute("readonly");
        }
    }

    const create = () => {
        open();
        document.querySelector("#title").focus();
        formButtons(true, false, false, false, true);
        readOnly(false)
        document.querySelector("#form-title").textContent = "create to-do";
    }

    const view = () => {
        open();
        formButtons(false, true, true, true, true);
        readOnly(true);
        document.querySelector("#form-title").textContent = "view to-do";

        document.querySelector("#title").value = currTaskCard.task.name;
        document.querySelector("#date").value = currTaskCard.task.dueDate;
        document.querySelector("#description").value = currTaskCard.task.description;
    }

    const edit = () => {
        document.querySelector("#title").focus();
        formButtons(true, false, false, true, true);
        readOnly(false);
        document.querySelector("#form-title").textContent = "edit to-do";
    }

    buttonConnections();
    return { setTaskCard, create, view };
})();

//page logic
function addToPage(task) {
    //create element
    let taskCard = document.createElement("div");
    taskCard.classList.add("task");
    taskCard.style.top = `${Math.random() * 100}%`;
    taskCard.style.left = `${Math.random() * 100}%`;
    taskCard.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;


    let taskCardImage = document.createElement("img");
    taskCardImage.setAttribute("src", "./notepad.png");
    taskCard.appendChild(taskCardImage);

    let taskCardText = document.createElement("h1");
    taskCardText.textContent = task.name;
    taskCard.appendChild(taskCardText);

    taskCard.task = task;

    //make draggable
    taskCard.setAttribute("draggable", "true");

    //taskCard.textContent = taskCard.task.name;
    taskCard.addEventListener("click", () => {
        popupController.setTaskCard(taskCard);
        popupController.view()
    })

    //animation?
    document.querySelector("main").appendChild(taskCard);
}

function reset() {
    document.querySelector("main").textContent = "";
    tasks.getAll().forEach((task) => { addToPage(task) });
}

document.querySelectorAll(".reset").forEach((e) => e.addEventListener("click", () => {
    reset();    
}))

document.querySelectorAll(".create").forEach((e) => e.addEventListener("click", () => {
    popupController.create();
}))

reset();