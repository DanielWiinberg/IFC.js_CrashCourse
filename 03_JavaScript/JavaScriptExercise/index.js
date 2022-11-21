const modelLinks = [
    "https://ifcjs.github.io/ifcjs-crash-course/sample-apps/01/",
    "https://ifcjs.github.io/ifcjs-crash-course/sample-apps/02/",
    "https://ifcjs.github.io/ifcjs-crash-course/sample-apps/03/",
    "https://ifcjs.github.io/ifcjs-crash-course/sample-apps/04/",
    "https://ifcjs.github.io/ifcjs-crash-course/sample-apps/05/"
];

const linkContainer = document.querySelector(".links-container");


for(let modelLink of modelLinks){
    const link = document.createElement("p");

    link.addEventListener("mouseenter", (event) =>{
        link.classList.add("gray");
    })

    link.addEventListener("mouseleave", (event) =>{
        link.classList.remove("gray");
    })

    link.addEventListener("mousedown", (event) =>{
        const iframe = document.querySelector("iframe");
        iframe.src = modelLink;
    })

    link.textContent = modelLink;
    linkContainer.appendChild(link);
}