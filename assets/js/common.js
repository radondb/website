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

window.showVideo = (src) => {
  var video = document.getElementById("video");
  document.querySelector(".fake-video").style.display = "none";
  video.style.display = "block";
  video.setAttribute("src", src);
  video = null;
};

window.toggleParentClass = (that, classname) => {
  var target = that.parentNode;
  if (target) {
    target.classList.toggle(classname);
  }
};

/** 文档相关 */
window.versionOnchange = (event) => {
  Array.from(document.getElementsByClassName("docs-menu")).forEach((node) => {
    node.classList.add("hide");
    if (node.getAttribute("id") === event.target.value) {
      node.classList.remove("hide");
    } else {
      node.classList.add("hide");
    }
  });
};
