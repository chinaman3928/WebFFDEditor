const nameBox = document.getElementById("nameBox");
const commBox = document.getElementById("commentBox");
const submitElem = document.getElementById("submit");
const commentsElem = document.getElementById("commentArea-comments");
const nComm = document.getElementById("numComments");
let N = 0;

submitElem.addEventListener("click",
                            function(ev) {
                              (nameBox.value.length < 2) ? nameBox.classList.add("errBox") : nameBox.classList.remove("errBox");
                              (commBox.value.length < 2) ? commBox.classList.add("errBox") : commBox.classList.remove("errBox");

                              if (nameBox.value.length >= 2 && commBox.value.length >= 2)
                              {
                                const newP = document.createElement("p");
                                const userName = nameBox.value;
                                newP.innerHTML = `<b>${nameBox.value}:</b> ${commBox.value}`;
                                commentsElem.appendChild(newP);
                                nameBox.value = commBox.value = "";
                                nComm.innerHTML = `There ${++N == 1 ? "is" : "are"} ${N} comment${N == 1 ? '' : 's'} currently.`;

                                toggleModal(userName);
                              }
                            });


///////////////////////////////////////////////////////////////////////////////////////////////////


function toggleModal(userName) {
  const modal = document.getElementById("thanks-modal");
  const modalContent = document.getElementById("thanks-modal-content");

  modal.style.display = "flex";
  modalContent.textContent = `Fate has favored you, ${userName}!`;

  let intervalId = setInterval(scaleImage, 500);
  
  setTimeout(() => {modal.style.display = "none"; clearInterval(intervalId);}, 4000);
}


let scaleFactor = 1.0;
let modalImage = document.getElementById("robedFate");

function scaleImage() {
  scaleFactor = (scaleFactor == 1.0) ? 0.8 : 1.0;
  modalImage.style.transform = `scale(${scaleFactor})`;  
}