window.onload = () => {
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
};
backTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};
