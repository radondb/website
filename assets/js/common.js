window.addEventListener("load", (event) => {
  var flag = true;
  document.body.onscroll = () => {
    // (98 - 50) / 2
    if (document.documentElement.scrollTop < 24) {
      document.body.classList.remove("fixed");
      flag = true;
    } else if (flag) {
      document.body.classList.add("fixed");
    }
  };
});

window.showModal = (selector, params) => {
  var ele = document.querySelector(selector);
  if (ele) {
    ele.style.display = "block";
    var video = ele.querySelector("video");
    if (video) {
      video.setAttribute("src", params ? params.videoSrc : '');
      video.play();
    }
  }
};

window.hideModal = () => {
  var eles = document.querySelectorAll(".modal");
  eles.forEach((e) => {
    if (e.style.display === "block") {
      e.style.display = "none";
      var video = e.querySelector("video");
      if (video) {
        video.pause();
      }
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
  document.querySelectorAll(".fake-video").forEach(fake => fake.style.display = "none")
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
    console.log(node);
    if (node.getAttribute("data-version") === event.target.value) {
      node.classList.remove("hide");
    } else {
      node.classList.add("hide");
    }
  });
};

window.backTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};
