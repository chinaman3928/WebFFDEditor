let LIGHT_DARK = false;

const HEADER_CSS = [document.getElementById("header-title").style,
                    document.getElementById("header-sectionNav").style,
                    document.getElementById("header-externalNav").style]

const SECTION_CSS = [document.getElementById("section-player").style,
                     document.getElementById("section-pets").style,
                     document.getElementById("section-quests").style,
                     document.getElementById("section-histories").style,
                     document.getElementById("section-misc").style]

function toggleLightDark(light_dark)
{
  const p = light_dark ? 3 : 0;
  for (let i = 0; i < HEADER_CSS.length; ++i)
  {
    const rg = Math.floor((3 - i) / (4.0 + p) * 255).toString(16);
    HEADER_CSS[i].backgroundColor = `#${rg}${rg}ff`;
  }
  for (let i = 0; i < SECTION_CSS.length; ++i)
  {
    const gb = Math.floor((5 - i) / (6.0 + p) * 255).toString(16);
    SECTION_CSS[i].backgroundColor = `#ff${gb}${gb}`;
  }
}
toggleLightDark(false);

const lightDarkToggleElem = document.getElementById("lightDarkToggle");
lightDarkToggleElem.addEventListener("click",
                                     function(ev) {
                                       LIGHT_DARK = !LIGHT_DARK;
                                       if (LIGHT_DARK)
                                       {
                                         lightDarkToggleElem.title = "Toggle Light";
                                         lightDarkToggleElem.querySelector("img").src = "./img/leftBlack.png";
                                       }
                                       else
                                       {
                                         lightDarkToggleElem.title = "Toggle Dark";
                                         lightDarkToggleElem.querySelector("img").src = "./img/leftWhite.png";
                                       }
                                       toggleLightDark(LIGHT_DARK);
});


///////////////////////////////////////////////////////////////////////////////////////////////////


window.addEventListener("scroll", reveal);
//window.addEventListener("resize", reveal);

let animation = {
  revealDistance: 150,
  initialOpacity: 0,
  transitionDelay: 0,
  transitionDuration: '2s',
  transitionProperty: 'all',
  transitionTimingFunction: 'ease'
}

const revealableContainers = document.querySelectorAll(".revealable");

function reveal()
{
  for (let i = 0; i < revealableContainers.length; ++i)
  {
    let windowHeight = window.innerHeight;
    let topOfRevealableContainer = revealableContainers[i].getBoundingClientRect().top;
    
    if (topOfRevealableContainer < windowHeight - animation.revealDistance)
      revealableContainers[i].classList.add("active");
    else
      revealableContainers[i].classList.remove("active");
  }
}

let animationOn = true;
document.getElementById("toggleAnimation").addEventListener("click", toggleAnimation);

function toggleAnimation() {
  if (animationOn = !animationOn) {
    for (let i = 0; i < revealableContainers.length; ++i)
      revealableContainers[i].classList.remove("revealable");
    document.getElementById("toggleAnimation").innerHTML = "Resume<br>Motion";
  }
  else {
    for (let i = 0; i < revealableContainers.length; ++i)
      revealableContainers[i].classList.add("revealable");
    document.getElementById("toggleAnimation").innerHTML = "Reduce<br>Motion";
  }
}