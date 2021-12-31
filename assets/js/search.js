getPostCard = (params) => `<a class="post-card flex-row fl-center" href="${params.permalink}">
      <img class="picture" src="${params.img || "/images/intro-poster.png"}" />
      <div class="content">
        <div class="title"><span class="text-ellip">${params.title}</span></div>
        <div class="info flex-row fl-center">
          <div class="flex-row fl-center"><img src="/images/common/person.svg" /><span style="word-break: keep-all">${
            params.author
          }</span></div>
          <div class="flex-row fl-center"><img src="/images/common/time.svg" /><span>${
            params.date
          }</span></div>
          <div class="flex-row fl-center fl-wrap">
            ${
              params.tags
                ? params.tags.map((tag) => `<div class="post-tag">${tag}</div>`).join('')
                : ""
            }
          </div>
        </div>
        <div class="text-ellip-2 summary">${params.summary}</div>
      </div>
      <button class="btn"></button>
    </a>
`;
var limit = 10;
var currentPage = 1;
var allPage = 1;

window.onload = () => {
  var url = "/index.json";
  var request = new XMLHttpRequest();
  request.open("get", url);
  request.send(null);
  request.onload = function () {
    if (request.status == 200) {
      var json = JSON.parse(request.responseText);
      window.posts = json;
      selectTag();
      renderPosts(currentPage);
      renderPagination(currentPage);
    }
  };
};

function selectTag() {
  var tag = param("tag");
  var tagEle = document.getElementById(tag || "all");
  if (tagEle) {
    tagEle.classList.add("actived");
  }
}

function renderPosts(page) {
  var container = document.getElementById("post-list");
  container.innerHTML = filterPosts()
    .slice((page - 1) * limit, page * limit)
    .map(getPostCard)
    .join("");
  container = null;
}

function filterPosts() {
  if (!posts) {
    return [];
  }
  var result = posts.slice();
  var tagFilter = param("tag");
  var nameFilter = param("name");
  if (tagFilter && tagFilter !== "all") {
    result = result.filter((r) => r.tags && r.tags.includes(tagFilter));
  }
  if (nameFilter) {
    document.getElementById('tagInput').value = nameFilter;
    result = result.filter((r) => r.title.toLowerCase().includes(nameFilter.toLowerCase()) || r.contents.toLowerCase().includes(nameFilter.toLowerCase()));
  }
  allPage = Math.ceil(result.length / limit);
  return result;
}

function param(name) {
  return decodeURIComponent(
    (location.search.split(name + "=")[1] || "").split("&")[0]
  ).replace(/\+/g, " ");
}

function getPagePrev(disabled) {
  return `<span id="prev" class="prev${
    disabled ? " disabled" : ""
  }" onclick="handlePrev()"></span>`;
}

function getPageNext(disabled) {
  return `<span id="next" class="next${
    disabled ? " disabled" : ""
  }" onclick="handleNext()"></span>`;
}

function getPages(count, current) {
  var html = "";
  for (var i = 1; i < count + 1; i++) {
    html += `<span class="page${
      current === i ? " actived" : ""
    }" onclick="handlePage(${i})">${i}</span>`;
  }
  return html;
}

handlePage = (page) => {
  currentPage = page;
  renderPosts(page);
  renderPagination(page);
  document.getElementById("tags").scrollIntoView({ behavior: "smooth" });
};

handlePrev = () => {
  currentPage--;
  renderPosts(currentPage);
  renderPagination(currentPage);
  document.getElementById("tags").scrollIntoView({ behavior: "smooth" });
};

handleNext = () => {
  currentPage++;
  renderPosts(currentPage);
  renderPagination(currentPage);
  document.getElementById("tags").scrollIntoView({ behavior: "smooth" });
};

function renderPagination(page) {
  var pageContainer = document.getElementById("pagination");
  if (pageContainer && allPage) {
    pageContainer.innerHTML =
      getPagePrev(page === 1) +
      getPages(allPage, page) +
      getPageNext(page === allPage);
    pageContainer = null;
  }
}
