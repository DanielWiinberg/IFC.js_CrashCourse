const cards = document.getElementsByClassName("card");
const cardsArr = Array.from(cards);

for (let card of cardsArr){
    const children = Array.from(card.children);
    console.log(children);
}

const todoList = [
    "todo 1",
    "todo 2",
    "todo 3",
    "todo 4"
]

const container = document.querySelector(".main-container");
const buttons = [];

for(let task of todoList){
    const text = document.createElement("p");
    buttons.push(text);

    text.addEventListener("mouseenter", (event) => {
        text.classList.add("gray");
    })

    text.addEventListener("mouseleave", (event) => {
        text.classList.remove("gray");
    })

    text.addEventListener("mousedown", (event) => {
        buttons.forEach(button => button.classList.remove("dark-gray"));
        console.log("Selected: " + task);
        text.classList.add("dark-gray");
    })

    text.textContent = task;
    container.appendChild(text);
}