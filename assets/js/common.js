window.showModal = (selector) => {
  var ele = document.querySelector(selector);
  if (ele) {
    ele.style.display = "block";
  }
};

window.hideModal = () => {
  var eles = document.querySelectorAll(".modal");
  eles.forEach((e) => {
    if (e.style.display === "block") {
      e.style.display = "none";
    }
  });
};

window.hidePopup = () => {
  var eles = document.querySelectorAll(".pop-up-container");
  eles.forEach((e) => {
    e.classList.remove("fadein");
    e.classList.add("fadeout");
  });
};

window.showVideo = (src) => {
  var video = document.getElementById("video");
  document.querySelector(".fake-video").style.display = "none";
  video.style.display = "block";
  video.setAttribute("src", src);
  video = null;
};

window.toggleSiblingClass = (that, classname) => {
  var target = that.parentNode;
  if (target) {
    target.classList.toggle(classname);
  }
};
