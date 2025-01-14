let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task ID
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const taskDeadline = dayjs(task.deadline);
  const today = dayjs();
  const diffDays = taskDeadline.diff(today, "days");

  let taskClass = "";
  if (diffDays < 0) {
    taskClass = "overdue"; // Task is overdue
  } else if (diffDays <= 3) {
    taskClass = "nearing-deadline"; // Task is near deadline (3 days)
  }

  // Determine color based on status
  let statusClass = "";
  if (task.status === "To Do") {
    statusClass = "to-do";
  } else if (task.status === "In Progress") {
    statusClass = "in-progress";
  } else if (task.status === "Done") {
    statusClass = "done";
  }

  const taskCard = $(`
    <div class="task-card ${statusClass}" id="task-${task.id}" data-id="${task.id}">
      <h5>${task.title}</h5>
      <p>${task.description}</p>
      <p><strong>Due:</strong> ${task.deadline}</p>
      <button class="btn btn-danger delete-task">Delete</button>
    </div>
  `);

  // Add event listener to delete task button
  taskCard.find(".delete-task").on("click", handleDeleteTask);

  // Make the task card draggable
  taskCard.draggable({
    helper: "clone", // Create a clone of the card when dragging
    revert: "invalid", // Return to original position if not dropped in valid area
    start: function (event, ui) {
      ui.helper.data("id", task.id);
    },
  });

  return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach((task) => {
    const taskCard = createTaskCard(task);

    if (task.status === "To Do") {
      $("#todo-cards").append(taskCard);
    } else if (task.status === "In Progress") {
      $("#in-progress-cards").append(taskCard);
    } else if (task.status === "Done") {
      $("#done-cards").append(taskCard);
    }
  });

  // Initialize the droppable columns after rendering
  makeColumnsDroppable();
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = $("#task-title").val();
  const taskDescription = $("#task-text").val();
  const taskDate = $("#task-date").val();

  const newTask = {
    id: generateTaskId(),
    title: taskTitle,
    description: taskDescription,
    deadline: taskDate,
    status: "To Do", // New task starts in "To Do" status
  };

  // Add the new task to the task list
  taskList.push(newTask);

  // Save the updated task list and next ID to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  // Render the updated task list and close the modal
  renderTaskList();
  $("#formModal").modal("hide");
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".task-card").data("id");

  // Filter out the deleted task
  taskList = taskList.filter((task) => task.id !== taskId);

  // Save the updated task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Re-render the task list
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.helper.data("id"); // Get the ID of the dragged task
  const newStatus = $(event.target).attr("id").replace("-cards", ""); // Get the column ID and remove "-cards" to match status names

  // Retrieve tasks and update the status
  const task = taskList.find((task) => task.id === taskId);
  if (task) {
    task.status = newStatus; // Update task status
  }

  // Save the updated task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Re-render the task list
  renderTaskList();
}

// Function to make columns droppable
function makeColumnsDroppable() {
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
    over: function (event, ui) {
      $(this).addClass("highlight");
    },
    out: function (event, ui) {
      $(this).removeClass("highlight");
    },
  });
}

// On page load, render the task list and initialize event listeners
$(document).ready(function () {
  // Render the task list on page load
  renderTaskList();

  // Add event listener for task form submission
  $("#task-form").on("submit", handleAddTask);
});
