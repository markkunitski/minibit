if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.dataset.theme = "night";
} else {
  document.documentElement.dataset.theme = "emerald";
}
class TimerCalculator {
  constructor(seconds) {
    this.seconds = seconds;
  }
  calcTimer() {
    return this.seconds / 60 >= 60
      ? (this.seconds / 60 / 60).toFixed(2)
      : (this.seconds / 60).toFixed(2);
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
  async getData() {
    try {
      let response = await fetch("http://localhost:3000/tasks");
      if (!response.ok) {
        throw new Error("fetch error");
      }
      let data = await response.json();
      return data;
    } catch (err) {
      throw new Error(err);
    }
  }
}
const data = new Fetched();
data
  .getData()
  .then((data) => {
    data.forEach((obj, index) => {
      let keys = Object.keys(obj);
      let row = document.createElement("tr");
      keys.forEach((key) => {
        if (key === "timer" || key === "task") return;
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
                <button class="btn btn-neutral btn-xs me-2">
              <span class="material-icons text-sm">
              play_arrow
              </span>
              
              ${timer.calcTimer()}
              
              </button>
              ${obj[key]}
              </div>

              `
                : obj[key];
            break;
          case "type":
            contentNode.innerHTML =
              key === "type"
                ? `
                <span class="material-icons ${obj[key]}">
                ${obj[key]}
                </span>
              `
                : obj[key];
            break;
          case key:
            contentNode.textContent = obj[key];
            break;
        }
        if (obj[key] === true){
          row.firstChild.classList.add('completed')
        } 
        row.appendChild(contentNode);
        if (node) thead.append(node);
      });
      let openFunc = new Modal(obj.title, obj.task);
      let button = document.createElement("button");
      button.textContent = "details";
      button.className = "btn btn-neutral btn-xs";
      button.addEventListener("click", openFunc.openModal.bind(openFunc));
      let td = document.createElement("td");
      td.appendChild(button);
      row.appendChild(td);
      row.classList.add("hover");
      tbody.append(row);
    });
  })
  .catch((error) => {
    console.log(error);
  });
