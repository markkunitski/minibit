if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.dataset.theme = "night";
} else {
  document.documentElement.dataset.theme = "emerald";
}
// alert close
alert_close.addEventListener("click", function () {
  myalert.style.display = "none";
});

class TimerCalculator {
  constructor(seconds) {
    this.seconds = seconds;
  }
  calcTimer() {
    const hours = Math.floor(this.seconds / 3600);
    const minutes = Math.floor((this.seconds % 3600) / 60);
    const seconds = this.seconds % 60;

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}

class Modal {
  constructor(title, text) {
    (this.text = text), (this.title = title);
  }
  openModal() {
    task_text.textContent = this.text;
    task_name.textContent = this.title;
    my_modal.showModal();
  }
}

class Fetched {
  getData() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "http://localhost:3000/tasks", true);
      xhr.onload = function () {
        if (this.status == 200) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject("Error: " + this.status);
        }
      };
      xhr.onerror = function () {
        reject("Request failed");
      };
      xhr.send();
    });
  }
}

class CookieHandler {
  static getCookie(name) {
    const cookieArray = document.cookie.split("; ");
    const cookie = cookieArray.find((row) => row.startsWith(`${name}=`));
    if (cookie) {
      return cookie.split("=")[1];
    }
    return null;
  }

  static setCookie(name, value, expiryDays = 365) {
    const date = new Date();
    date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  static parseCookies() {
    const cookies = {};
    const cookieArray = document.cookie.split("; ");
    cookieArray.forEach((cookie) => {
      const [name, value] = cookie.split("=");
      cookies[name] = value;
    });
    return cookies;
  }
}

class Task {
  constructor(id, title, timer, priority, deadline, completed, task) {
    this.id = id;
    this.title = title;
    this.timer = timer;
    this.priority = priority;
    this.deadline = deadline;
    this.completed = completed;
    this.task = task;
  }
  openModal() {
    let openFunc = new Modal(this.title, this.task);
    openFunc.openModal();
  }
  removeTask() {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://localhost:3000/tasks/${this.id}`, true);
    xhr.onload = function () {
      if (this.status != 200) {
        throw new Error("Error while removing task");
      }
    };
    xhr.send();
  }

  startTimer(htmlElem) {
    console.log(htmlElem);
    let active_timers = CookieHandler.getCookie(`active_timers`);
    if (active_timers) {
      active_timers = JSON.parse(active_timers);
    } else {
      active_timers = [];
    }
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval); // Clear the existing interval
      this.timerInterval = null;
      if (active_timers.includes(this.id)) active_timers.splice(active_timers.indexOf(this.id), 1);
      CookieHandler.setCookie(`timerStart_${this.id}`, 0, -1);
      CookieHandler.setCookie(`active_timers`, JSON.stringify(active_timers));

      this.saveTimer();
    } else {
      this.timerInterval = setInterval(() => {
        this.timer++;
        const timerCalculator = new TimerCalculator(this.timer);
        const properTime = timerCalculator.calcTimer();
        htmlElem.lastElementChild.textContent = properTime;
      }, 1000);
      
      if (!active_timers.includes(this.id)) active_timers.push(this.id);
      
      CookieHandler.setCookie(`timerStart_${this.id}`, Date.now());
      CookieHandler.setCookie(`active_timers`, JSON.stringify(active_timers));
    }

    
  }

  // loadTimer() {
  //   const cookies = CookieHandler.parseCookies();
  //   const timerStart = cookies["timerStart"];
  //   const activeButtons = cookies["activeButtons"];
  //   if (timerStart) {
  //     const elapsedSeconds = Math.floor(
  //       (Date.now() - Number(timerStart)) / 1000
  //     );
  //     this.timer = elapsedSeconds;

  //     if (activeButtons) {
  //       const activeButtonIds = activeButtons.split(",");
  //       activeButtonIds.forEach((id) => {
  //         const button = document.getElementById(`timer_btn_${id}`);
  //         if (button) {
  //           const task = taskMap.get(button.closest("tr"));
  //           if (task) {
  //             task.startTimer(button.closest(".timer_btn"));
  //           }
  //         }
  //       });
  //     }
  //   }
  // }

  saveTimer() {
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", `http://localhost:3000/tasks/${this.id}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      if (this.status != 200) {
        throw new Error("Error while saving timer");
      }
    };
    xhr.send(JSON.stringify(this));
  }
  completeTask() {
    this.completed = true;
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", `http://localhost:3000/tasks/${this.id}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      if (this.status != 200) {
        throw new Error("Error while completing task");
      }
    };
    xhr.send(JSON.stringify(this));
  }
}
let taskMap = new Map();
class fetchAndAdd {
  doFetch() {
    const data = new Fetched();
    if (data) {
      thead.innerHTML = null;
      tbody.innerHTML = null;
      data
        .getData()
        .then((data) => {
          data.forEach((obj, index) => {
            const task = new Task(
              obj.id,
              obj.title,
              obj.timer,
              obj.priority,
              obj.deadline,
              obj.completed,
              obj.task
            );
            let row = document.createElement("tr");
            const keyOrder = [
              "id",
              "title",
              "timer",
              "priority",
              "deadline",
              "completed",
              "task",
            ];
            for (const key of keyOrder) {
              if (key === "timer" || key === "task") continue;
              // th
              let node = null;
              if (data.length - 1 === index) {
                node = document.createElement("th");
                node.textContent = key === "id" ? "" : key;
              }
              // td
              let contentNode = document.createElement("td");
              switch (key) {
                case "id":
                  contentNode.innerHTML =
                    key === "id"
                      ? `<label>
                          <input type="checkbox" class="checkbox" />
                        </label>`
                      : obj[key];
                  break;
                case "title":
                  let timer = new TimerCalculator(obj.timer);
                  contentNode.innerHTML =
                    key === "title"
                      ? `<div class='flex items-center'>
                    <button id="timer_btn_${
                      obj.id
                    }" class="btn btn-neutral btn-xs me-2 timer_btn">
                  <span class="material-icons text-sm">
                  play_arrow
                  </span>
                  <p>
                  ${timer.calcTimer()}
                  </p>
                  </button>
                  ${obj[key]}
                  </div>
    
                  `
                      : obj[key];
                  break;
                case "priority":
                  contentNode.innerHTML =
                    key === "priority"
                      ? `
                    <span class="material-icons priority_icon ${obj[key]}">
                    ${obj[key]}
                    </span>
                  `
                      : obj[key];
                  break;
                case key:
                  contentNode.textContent = obj[key];
                  break;
              }
              if (key === "completed" && obj[key] === true) {
                row.firstChild.classList.add("completed");
              }
              row.appendChild(contentNode);
              if (node) thead.append(node);
            }
            let button = document.createElement("button");
            button.textContent = "details";
            button.className = "btn btn-neutral btn-xs";
            button.addEventListener("click", task.openModal.bind(task));
            // row append
            let td = document.createElement("td");
            td.appendChild(button);
            row.appendChild(td);
            row.classList.add("hover");
            tbody.append(row);
            taskMap.set(row, task);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
}
class GetTask {
  constructor(elementClass) {
    this.elementClass = elementClass;
  }
  get() {
    let rows = document.querySelectorAll("tbody tr");
    let result = [];
    rows.forEach((row) => {
      let elem = row.querySelector(`.${this.elementClass}`);
      if (!elem) return;
      if (elem.checked) {
        let task = taskMap.get(row);
        if (task) {
          result.push(task);
          return;
        }
      }
    });
    return result.length ? result : undefined;
  }
}
complete_button.addEventListener("click", () => {
  // get checkboxes
  const getTask = new GetTask("checkbox");
  getTask.get().forEach((elem) => elem.completeTask());
  doFetch.doFetch();
});

delete_button.addEventListener("click", () => {
  // get checkboxes
  const getTask = new GetTask("checkbox");
  getTask.get().forEach((elem) => elem.removeTask());
  doFetch.doFetch();
});
const doFetch = new fetchAndAdd();
doFetch.doFetch();
// form
form_add.addEventListener("submit", async function (event) {
  event.preventDefault();
  const myform = new FormData(this);
  const taskData = { timer: "0", completed: "false" };
  myform.forEach((elem, index) => {
    taskData[index] = elem;
  });
  if (Object.keys(taskData).length) {
    const response = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
  }
});
// btns show
function listenerCheckboxes(event) {
  if (event.target.classList.contains("checkbox")) {
    let checkboxes = document.querySelectorAll(".checkbox");

    function isAtLeastOneCheckboxChecked() {
      return Array.from(checkboxes).some((checkbox) => checkbox.checked);
    }
    // Add event listeners to the checkboxes
    if (checkboxes) {
      Array.from(checkboxes).forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          if (isAtLeastOneCheckboxChecked()) {
            delete_button.classList.remove("hidden");
            complete_button.classList.remove("hidden");
          } else {
            delete_button.classList.add("hidden");
            complete_button.classList.add("hidden");
          }
        });
      });
    }
  }
  this.removeEventListener("input", listenerCheckboxes);
}
function listenerTimers(event) {
  if (
    event.target.classList.contains("timer_btn") ||
    event.target.closest(".timer_btn")
  ) {
    const row = event.target.closest("tr");
    if (taskMap.has(row)) {
      const task = taskMap.get(row);
      task.startTimer(event.target.closest(".timer_btn"));
    }
  }
}
main_table.addEventListener("input", listenerCheckboxes);
main_table.addEventListener("click", listenerTimers);
window.addEventListener("beforeunload", () => {
  taskMap.forEach((task) => {
    task.saveTimer();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const cookies = CookieHandler.parseCookies();
    let active_timers = CookieHandler.getCookie(`active_timers`);
    if (active_timers) {
      active_timers = JSON.parse(active_timers);
    } else {
      active_timers = [];
    }

    // const activeButtons = cookies["activeButtons"];

    if (active_timers) {
      const currentTime = Date.now();

      taskMap.forEach((task) => {
        if (active_timers.includes(task.id)) {
          console.log(1);
          const timerStart = cookies[`timerStart_${task.id}`];
          const timerStartTime = Number(timerStart);
          const elapsedTime = currentTime - timerStartTime;
          const elapsedSeconds = Math.floor(elapsedTime / 1000);
          task.timer += elapsedSeconds;
          task.startTimer(document.getElementById(`timer_btn_${task.id}`));
        }
      });
    }
  }, 250);
});
