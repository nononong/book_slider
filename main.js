/**
 * 도서 정보 모델
 * API데이터 가공
 */
class BookProfile {
  constructor({ bestRank, title, cover, author, description, link }) {
    this.bestRank = bestRank;
    this.title = title || "제목 없음";
    this.cover = cover || "";
    this.author = author ? author.split("(")[0].trim() : "저자 미상";

    this.description = description || "";
    this.url = link || "#";
  }
}

/**
 * 데이터 로드, 슬라이더 렌더링
 */
async function init() {
  //데이터 로드
  const { bestItems, newItems } = await fetchData();

  // 슬라이더 생성(베스트셀러, 신간)
  renderSlider("베스트셀러", bestItems, "best");
  renderSlider("주목할 만한 신간", newItems, "new");

  //인터랙션 활성화
  initScrollControls();
}

async function fetchData() {
  try {
    const fetchJson = async (jsonUrl) => (await fetch(jsonUrl)).json();

    const [bestData, newData] = await Promise.all([
      fetchJson("data/aladin_bestseller.json"),
      fetchJson("data/aladin_newSpecial.json"),
    ]);

    return {
      bestItems: bestData.item || [],
      newItems: newData.item || [],
    };
  } catch (error) {
    console.error("데이터를 불러오는 중 오류 발생: ", error);
    return { bestItems: [], newItems: [] };
  }
}

/**
 * 슬라이더를 생성, main-content에 추가
 */
function createBookCard(itemData, type) {
  const cardTemplate = document.getElementById("book-card-template");
  const cardClone = cardTemplate.content.cloneNode(true);
  const book = new BookProfile(itemData);

  const cardElement = cardClone.querySelector(".book-item-card");
  cardElement.classList.add(`${type}-card`);

  const rankElement = cardClone.querySelector(".book-rank");
  if (type === "best" && book.bestRank) {
    rankElement.textContent = `${book.bestRank}위`;
  } else {
    rankElement.remove();
  }

  const coverElement = cardClone.querySelector(".book-cover");
  if (coverElement) {
    if (type === "new") {
      const miniUrl = book.cover.replace("cover200", "covermini");
      coverElement.style.backgroundImage = `url(${miniUrl})`;

      const originalImg = document.createElement("img");
      originalImg.src = book.cover;
      originalImg.classList.add("original-img");

      coverElement.appendChild(originalImg);
    } else if (type === "best") {
      coverElement.style.backgroundImage = `url('${book.cover}')`;
    }
  }

  const titleElement = cardClone.querySelector(".book-title");
  if (titleElement) titleElement.textContent = book.title;

  const descriptionElement = cardClone.querySelector(".book-description");
  if (type === "best" && book.description) {
    descriptionElement.textContent = book.description;
  } else {
    descriptionElement.remove();
  }

  const linkElement = cardClone.querySelector(".book-item-card");
  if (linkElement) linkElement.href = book.url;

  const authorElement = cardClone.querySelector(".book-author");
  if (authorElement) authorElement.textContent = book.author;

  return cardClone;
}

function renderSlider(title, items, type) {
  const mainContent = document.querySelector("#main-content");
  const sliderTemplate = document.getElementById("book-slider-template");

  //슬라이더 틀 생성
  const sliderClone = sliderTemplate.content.cloneNode(true);
  sliderClone
    .querySelector(".slider-container")
    .classList.add(`${type}-slider`);
  sliderClone.querySelector(".slider-title").textContent = title;

  const listContainer = sliderClone.querySelector(".book-list-container");

  //데이터 카드로 변환, 리스트에 추가
  items.forEach((itemData) => {
    const card = createBookCard(itemData, type);
    listContainer.appendChild(card);
  });

  mainContent.appendChild(sliderClone);
}

/**
 * 슬라이더 버튼 이벤트 설정
 */
function initScrollControls() {
  const sliderButtons = document.querySelectorAll(".slide-btn");
  sliderButtons.forEach((btn) => {
    btn.onclick = function () {
      const wrapper = this.closest(".slider-wrapper");
      const scrollContainer = wrapper.querySelector(".book-list-container");

      const scrollAmount = scrollContainer.offsetWidth * 0.8; // 한번에 80% 이동
      const direction = this.classList.contains("left-btn") ? -1 : 1;

      scrollContainer.scrollBy({
        left: scrollAmount * direction,
        behavior: "smooth",
      });
    };
  });
}

window.addEventListener("DOMContentLoaded", () => {
  init();
});
