"use strict";

/*================
    MODAL 
==================*/
const curtain = {
    element: document.querySelector("aside.curtaine"),
    open() { this.element.style.marginLeft = "-0"; },
    close() { this.element.style.marginLeft = "-300px"; }
}

const bottomInptModal = {
    element: document.querySelector("div.bottom-input-modal"),
    open() { this.element.style.marginBottom = "-0"; },
    close() { this.element.style.marginBottom = "-300px"; }
}


const topInptModal = {
    element: document.querySelector("div.top-input-modal"),
    open() {
        this.element.style.opacity = "1";
        this.element.style.transform = "translateY(100px)";
    },
    close() {
        this.element.style.transform = "translateY(50px)";
        this.element.style.opacity = "0";
    }
}

const modalContainer = {
    container: document.querySelector("div.modal-container"),
    modal: document.querySelectorAll("div.addlist-modal, div.editlist-modal"),
    asideElem: document.querySelector("aside"),

    open(ind) {
        this.container.style.zIndex = "3";
        this.modal[ind].style.display = "block";
        this.modal[ind].style.animationName = "animate";
        this.asideElem.style.overflow = "hidden";
    },

    close(ind) {
        this.modal[ind].style.top = "0";
        this.modal[ind].style.display = "none";
        this.container.style.zIndex = "-1";
        this.asideElem.style.overflow = "auto";
    }
}

const dayName = [
    "Sunday", "Monday", "Tuesday", "Wednesday", 
    "Thursday", "Friday", "Saturday"
];

const monthName = [
    "January", "February", "March", 
    "April", "May", "June", "July", 
    "August", "September", "October", 
    "November", "December"
];

/*This function will call for every 1 seconds to update 
the value of variable */
const displayDateTime = () => {
    const dateObj = new Date();
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth();
    let date = dateObj.getDate();
    let day = dateObj.getDay();
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    let time = twelveHourFormat(hours, minutes);

    document.getElementById("time").childNodes[0].nodeValue = time[0];
    document.getElementById("ampm").innerHTML = time[1];
    document.getElementById("date").innerHTML = dayName[day] + " " + monthName[month] + " " + date + ", " + year;
}

setInterval(displayDateTime, 1000);

const twelveHourFormat = (hours, minutes) => {
    let median, time;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    
    //Check if afternoon or morning
    if(hours > 12) {
        hours = hours - 12;
        median = "PM"
    }
    else {
        if(hours === 0) hours = 12;
        median = "AM";
    }

    time = hours + ":" + minutes;
    return [time, median];
}

const addTaskForm = document.querySelectorAll("form#frm3, form#frm4");
const errMessElem = document.querySelectorAll("p.addTaskErrMess");
const selectElem = document.querySelectorAll("select");
const todayTask = new Task(document.getElementById("todayTask"), document.getElementById("todayQty"));
const nextDayTask = new Task(document.getElementById("nextDayTask"), document.getElementById("nextDayQty"));
const missTask = new Task(document.getElementById("missTask"), document.getElementById("missTaskQty"));
const listContainer = document.getElementById("list");
const containerMap = new Map();
const listMap = new Map();
let nodes;

containerMap.set(true, todayTask);
containerMap.set(false, nextDayTask);

listMap.set("Personal", {
    listQty: document.getElementById("personal"), 
    taskContainer: [],
    taskList: []
});

listMap.set("Work", {
    listQty: document.getElementById("work"),
    taskContainer: [],
    taskList: []
});


function Task(container, containerQty) {
    this.container = container;
    this.containerQty = containerQty;
    this.containerHeight = 42;
    this.taskDate = new Map();

    //Add 42px height to container
    this.setHeight = () => { 
        this.containerHeight += 42;
        this.container.style.height = this.containerHeight + "px";
    };

    //Minus 42px height to container 
    this.reduceHeight = () => {
        this.containerHeight -= 42;
        this.container.style.height = this.containerHeight + "px";
    };
    
    //Hide and show the task listed in the container
    this.hideTask = (arrow) => {
        const container = this.container;
    
        //Show the task 
        if(container.clientHeight === 42) {
            container.style.height = this.containerHeight + "px";
            arrow.style.transform = "rotate(315deg)";
        }
        //Hide the task 
        else {
            container.style.height = "42px";
            arrow.style.transform = "rotate(135deg)";
        }
    }
}

/* This function move the task to miss container if the 
if the task not check within the day */

todayTask.moveToMissTask = function() {
    let todayDate = (new Date().getDate());
    
    setInterval(function() {
        const currentDate = (new Date().getDate());
        
        if(todayDate !== currentDate) {
            const childLabel = todayTask.container.querySelectorAll("label");
            let checkBox;
            
            for(let label of childLabel) {
                checkBox = label.querySelector("input[type='checkbox']");
                
                //Move the unchecked label to miss task container
                if(checkBox.checked === false) {
                    const mapValue = listMap.values();
                    const spanTrash = document.createElement("span");
                    spanTrash.setAttribute("class", "icon-wrapper trash");
                    
                    /* Remove existing trash element and replace with 
                    a new trash element to change the event function */
                    label.querySelector("span.trash").remove();
                    label.appendChild(spanTrash);

                    spanTrash.addEventListener("click", () => {
                        const mapValue = listMap.values();

                        for(let value of mapValue) {
                            const taskList = value.taskList;
                            const taskContainer = value.taskContainer;
                            const newTaskList = [];
                            const newTaskContainer = [];
                            let ind = 0;

                            for(let task of taskList) {
                                if(task !== label) {
                                    newTaskList.push(task);
                                    newTaskContainer.push(taskContainer[ind]); 
                                }

                                ind++;
                            }

                            value.taskList = newTaskList;
                            value.taskContainer = newTaskContainer;

                            value.listQty.innerHTML = value.taskList.length;
                        }

                        missTask.containerQty.innerHTML = Number(missTask.containerQty.innerHTML) - 1;

                        spanTrash.parentNode.remove();
                        missTask.reduceHeight();
                    });

                    missTask.container.appendChild(label);
                    missTask.setHeight();  
                    missTask.containerQty.innerHTML = Number(missTask.containerQty.innerHTML) + 1;
                    todayTask.reduceHeight();
                    todayTask.containerQty.innerHTML = Number(todayTask.containerQty.innerHTML) - 1;

                    for(let value of mapValue) {
                        value.taskList.forEach((task, index) => {
                            if(task === label) value.taskContainer[index] = missTask;
                        }) 
                    }
                }      
            }

            todayDate = currentDate;
        } 
    }, 1000)
}

nextDayTask.moveToTodayTask = function(label, listMapKey) {
    const taskDate = this.taskDate.get(label);
    const today = new Date();
    const timeOfMove = (function() {
    let hrsMs, minMs, minusMs;

        if(taskDate.getHours() === 0 && taskDate.getMinutes() === 0) {
            return (Date.parse(taskDate) - Date.parse(today));
        }  else {
            hrsMs = (taskDate.getHours() * 3600000);
            minMs = (taskDate.getMinutes() * 60000);
            minusMs = hrsMs + minMs;
            return (Date.parse(taskDate) - Date.parse(today)) - minusMs;
        } 
    })()

    setTimeout(function() {
        const spanTrash = document.createElement("span");
        spanTrash.setAttribute("class", "icon-wrapper trash");

        /* Remove existing trash element and replace with 
        a new trash element to change the event function */
        label.querySelector("span.trash").remove();
        label.appendChild(spanTrash);

        spanTrash.addEventListener("click", () => {
            const taskList = listMap.get(listMapKey).taskList;
            const taskContainer = listMap.get(listMapKey).taskContainer;
            const newTaskList = [];
            const newTaskContainer = [];

            taskList.forEach((element, index) => {
                if(element !== label) {
                    newTaskList.push(element);
                    newTaskContainer.push(taskContainer[index]);
                }
            })

            listMap.get(listMapKey).taskList = newTaskList; 
            listMap.get(listMapKey).taskContainer = newTaskContainer;
            listMap.get(listMapKey).listQty.innerHTML = Number(listMap.get(listMapKey).listQty.innerHTML) - 1;
            todayTask.taskDate.delete(label); 
            
            label.remove();
            todayTask.reduceHeight();
            todayTask.containerQty.innerHTML - Number(todayTask.containerQty.innerHTML) + 1;
        })

        todayTask.container.appendChild(label);
        todayTask.setHeight();
        todayTask.containerQty.innerHTML = Number(todayTask.containerQty.innerHTML) + 1;
        todayTask.taskDate.set(label, nextDayTask.taskDate.get(label));

        nextDayTask.containerQty.innerHTML = Number(nextDayTask.containerQty.innerHTML) - 1;
        nextDayTask.reduceHeight();
        nextDayTask.taskDate.delete(label);

        listMap.get(listMapKey).taskList.forEach((element, index) => {
            if(element === label) listMap.get(listMapKey).taskContainer[index] = todayTask;
        })

    }, timeOfMove);
}

/*====================
    ADD LIST FUNCTION 
======================*/
document.getElementById("addlistBtn").addEventListener("click", () => {
    const cloneLabel = createLabel(["full flex flex-ac", "span-txt", "circle-num"]).cloneNode(true);
    const spanTxt = cloneLabel.querySelector("span.span-txt");
    const spanCircleNum = cloneLabel.querySelector("span.circle-num");
    const spanTrash = cloneLabel.querySelector("span.trash");
    const spanEdit = cloneLabel.querySelector("span.edit-task");
    let listName = validateForm(document.getElementById("form1"), document.getElementById("frm1ErrMess"));
    let key = "";
    let match = 1;
    let copy;

    //Remove space character befor matching to map keys
    for(let c of listName) if(c !== " ") key += c;
    copy = key.toLowerCase();
        
    //To check if how many already existed keys in the map 
    for(let mapkey of listMap.keys()) {
        if(copy === mapkey.toLowerCase()) {
            copy = key.toLowerCase();
            match += 1;
            copy += match;
        }
    }

    if(match !== 1) {
        key += match;
        listName += (" " + match);
    }

    spanTxt.innerHTML = listName;
    spanCircleNum.innerHTML = 0;
    listContainer.appendChild(cloneLabel);

    listMap.set(key, {
        listQty: spanCircleNum, 
        taskContainer: [],
        taskList:[]
    });  

    //Add new option element to select element
    selectElem.forEach((select) => {
        const option = document.createElement("option");
        const txtNodes = document.createTextNode(listName);
        option.appendChild(txtNodes);
        select.appendChild(option);
    }) 

    addEventToEditList(spanEdit, spanTxt, key);
    addEventToRemoveList(spanTrash, key, listName);
})

/*====================
    ADD TASK FUNCTION 
======================*/
addTaskForm.forEach((form, ind) => {
    form.querySelector("input[value='Add']").addEventListener("click", () => {
        let taskDetails = validateForm(form, errMessElem[ind]);
        let taskName = taskDetails[0];
        let taskDate = taskDetails[1];
        let selectedOption = form.querySelector("select").value;
        let ifToday = ((taskDate.getDate()) === (new Date().getDate()));
        let containerObj = containerMap.get(ifToday); //Return true if the task date is for today
        let cloneLabel = createLabel(["full flex flex-jc flex-ac", "ninety-five", "checkmark"]).cloneNode(true);
        let cloneLabelChild = cloneLabel.querySelectorAll("span.ninety-five, span.trash");
        cloneLabelChild[0].childNodes[0].nodeValue = taskName;
        cloneLabelChild[0].childNodes[1].innerHTML = (function() {
            let month = taskDate.getMonth();
            let date = taskDate.getDate();
            let day = taskDate.getDay();
            let hours = taskDate.getHours();
            let minutes = taskDate.getMinutes();
            let time = "";
            
            twelveHourFormat(hours, minutes).forEach((value) => {
                time += value + " ";    
            });

            if(ifToday) return time + " | " + selectedOption;

            else return (dayName[day].slice(0, 3)) + ", " + 
                (monthName[month].slice(0, 3)) + " " + date + 
                " " + " | " + time + " | " + selectedOption;
        })();

        cloneLabel.removeChild(cloneLabel.querySelector("span.edit-task"));

        containerObj.taskDate.set(cloneLabel, taskDate);

        //Check if the container have task
        if(containerObj.container.children.length === 1) {
            containerObj.container.appendChild(cloneLabel);
            if(ifToday) containerObj.moveToMissTask();
        } else {
            const containerChildLabel = containerObj.container.querySelectorAll("label");
            const map = containerObj.taskDate;
            const ms = Date.parse(map.get(cloneLabel));

            //Arrange the added task in time and date order
            for(let label of containerChildLabel) { 
                if(ms <= map.get(label)) {
                    containerObj.container.insertBefore(cloneLabel, label);
                    break;
                } 
                if(ms > map.get(label)) {
                    containerObj.container.appendChild(cloneLabel);
                }
            }
        }

        containerObj.setHeight();
        containerObj.containerQty.innerHTML = Number(containerObj.containerQty.innerHTML) + 1;
        
        let key = "";
        
        for(let c of selectedOption) if(c !== " ") key += c;
        
        listMap.get(key).taskContainer.push(containerObj);
        listMap.get(key).taskList.push(cloneLabel);
        listMap.get(key).listQty.innerHTML = Number(listMap.get(key).listQty.innerHTML) + 1;
        
        if(ifToday === false) containerObj.moveToTodayTask(cloneLabel, key);
        
        addEventToRemoveTask(cloneLabelChild[1], containerObj, listMap.get(key));
    })
});

/*=======================
    CREATE LABEL ELEMENT
=========================*/
function createLabel() {
    const label = document.createElement("label");
    label.setAttribute("class", arguments[0][0]);
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("class", "hidden-checkbox");
    label.appendChild(checkbox);
    const span1 = document.createElement("span");
    span1.setAttribute("class", arguments[0][1]);

    if(arguments[0][1] === "ninety-five") {
        const text = document.createTextNode("");
        span1.appendChild(text);
        const span = document.createElement("span");
        span.setAttribute("class", "details");
        span1.appendChild(span);
    }

    label.appendChild(span1);
    const span2 = document.createElement("span");
    span2.setAttribute("class", arguments[0][2]);
    label.appendChild(span2);
    const span3 = document.createElement("span");
    span3.setAttribute("class", "icon-wrapper edit-task");
    label.appendChild(span3);
    const span4 = document.createElement("span");
    span4.setAttribute("class", "icon-wrapper trash");
    label.appendChild(span4);
    return label;
}

/*====================
    FORM VALIDATION 
======================*/
function validateForm(form, errMess) {
    const formFields = form.querySelectorAll("input[type='text'], input[type='date'], input[type='time']"); 
    let txtInput = formFields[0].value;

    try {
        /*Check if the input value have any character that match to 
        the pattern and to avoid space character only */
        if(/[abcdefghijklmnopqrstuvwxzyz0123456789]/ig.test(txtInput) === false) throw "Please name your task";
        
        /*Check if how many input element of form to know if it's 
        add task or list*/
        if(formFields.length === 1) return txtInput;
    
        let dateInpt = formFields[1].value;
        let timeInpt = formFields[2].value;
        const taskDate = new Date(dateInpt + "T" + timeInpt);
        const currentDate = new Date();

        if(dateInpt === "") throw "Please set your date";
        if(timeInpt === "") throw "Please set your time";
        if(Date.parse(taskDate) < Date.parse(currentDate)) throw "Please check your date";
        
        errMess.innerHTML = "";
        return [txtInput, taskDate]; 
    } catch(err) {
        errMess.innerHTML = err;
    }
}

/*====================
    REMOVE TASK 
======================*/
function addEventToRemoveTask(element, containerObj, listObj) {
    element.addEventListener("click", () => {
        let task = element.parentNode;
        let taskContainer = listObj.taskContainer;
        let taskList = listObj.taskList;
        
        task.remove();
        containerObj.reduceHeight();
        listObj.listQty.innerHTML = (listObj.listQty.innerHTML - 1);
        containerObj.containerQty.innerHTML = (containerObj.containerQty.innerHTML - 1);
        
        listObj.taskList = taskList.filter((element, taskListElemInd) => {
            if(element !== task) return element;
            else {
                listObj.taskContainer = taskContainer.filter((container, taskContainerElemInd) => {
                    if(taskContainerElemInd !== taskListElemInd) return container;
                });
            }
        });

        containerObj.taskDate.delete(task);
    })  
}

/*====================
    REMOVE LIST
======================*/
function addEventToRemoveList(spanTrash) {
    spanTrash.addEventListener("click", () => {
        let listName = spanTrash.parentNode.querySelector("span.span-txt").innerHTML;
        let key = "";
        let ind = 0;
        let listOfContainer, listOftask;

        for(let char of listName) if(char !== " ") key += char;

        listOfContainer = listMap.get(key).taskContainer;
        listOftask = listMap.get(key).taskList;

        for(let container of listOfContainer) {    
            listOftask[ind].remove();
            container.reduceHeight();
            container.containerQty.innerHTML = (container.containerQty.innerHTML - 1); 
            ind += 1;
        }
        
        spanTrash.parentNode.remove();
        listMap.delete(key);

        selectElem.forEach((select) => {
            const selectChildren = select.querySelectorAll("option");
            selectChildren.forEach((option) => {
                if(option.innerHTML === listName) option.remove(); 
            })
        })
    })
}

/*====================
    EDIT LIST
======================*/
function addEventToEditList(spanEdit, spanTxt, key) {
    spanEdit.addEventListener("click", () => {
        modalContainer.open(1);
        document.getElementById("frm2Txt").setAttribute("value", spanTxt.innerHTML);
        nodes = spanTxt;
    })
}

/*====================
    SAVE EDIT LIST
======================*/
document.querySelector("input[value='Save']").addEventListener("click", () => {
    let txtInput = document.getElementById("frm2Txt").value;
    let spanTxt = nodes;
    let mapkeys = listMap.keys();
    let existingKey = "";
    let newKey = ""; 
    let result = true;

    for(let char of spanTxt.innerHTML) if(char !== " ") existingKey += char;

    for(let char of txtInput) if(char !== " ") newKey += char;

    for(let k of mapkeys) {
        if(k === newKey) {
            result = false;
            break;
        }
    }

    if(result === true) {
        selectElem.forEach((select) => {
            const selectChild = select.querySelectorAll("option");
            selectChild.forEach((option) => {
                if(option.innerHTML === spanTxt.innerHTML) option.innerHTML = txtInput;
            })
        })
        
        spanTxt.innerHTML = txtInput;
        listMap.set(newKey, listMap.get(existingKey));
        listMap.delete(existingKey);

        listMap.get(newKey).taskList.forEach((task) => {
            let spanDetails = task.querySelector("span.details");
            let txt = spanDetails.innerHTML;
            let newDetails = txt.slice(0, (txt.lastIndexOf("|") + 1)) + " " + txtInput;
            spanDetails.innerHTML = newDetails;
        }); 
    }

    modalContainer.close(1);
})































