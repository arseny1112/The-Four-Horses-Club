document.addEventListener('DOMContentLoaded', function() {

 const track = document.querySelector(".participants__track"); 
  const itemsEls = document.querySelectorAll(".participants__item");
  let itemWidth = itemsEls[0].offsetWidth;
  const itemsCount = itemsEls.length;

  // Инициализация переменных
  let position = 0;
  let step = 3;
  let currentIndex = 0;
  let autoSlide;

  // Функция для выбора актуальной навигации
  function getNavElements() {
    const nav = document.querySelector(".participants__nav--adaptive");
    if (!nav) return {};
    return {
      prevBtn: nav.querySelector(".participants__btn--prev"),
      nextBtn: nav.querySelector(".participants__btn--next"),
      counterStart: nav.querySelector(".counter-start"),
      counterEnd: nav.querySelector(".counter-end"),
    };
  }

  // Обновление счётчика
  function updateCounter(counterStart, counterEnd) {
    if (counterStart) counterStart.textContent = Math.min(currentIndex + step, itemsCount);
    if (counterEnd) counterEnd.textContent = itemsCount;
  }

  // Обновление размеров и шага
  function updateSizes() {
    itemWidth = itemsEls[0].offsetWidth;
    if (window.innerWidth < 870) step = 1;
    else if (window.innerWidth < 1345) step = 2;
    else step = 3;

    const { counterStart, counterEnd } = getNavElements();
    updateCounter(counterStart, counterEnd);
  }

  // Сдвиг слайдов
  function moveSlide() {
    track.style.transform = `translateX(${-position}px)`;
    const { counterStart, counterEnd } = getNavElements();
    updateCounter(counterStart, counterEnd);
  }

  function nextSlide() {
    if (currentIndex + step < itemsCount) {
      currentIndex += step;
      position = currentIndex * itemWidth;
      moveSlide();
    }
  }

  function prevSlide() {
    if (currentIndex - step >= 0) {
      currentIndex -= step;
      position = currentIndex * itemWidth;
      moveSlide();
    }
  }

  // Автослайд
  function startAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      if (currentIndex + step < itemsCount) nextSlide();
      else {
        currentIndex = 0;
        position = 0;
        moveSlide();
      }
    }, 44444000);
  }

  // Привязка событий к кнопкам
  function attachNavEvents() {
    const { prevBtn, nextBtn } = getNavElements();
    if (prevBtn) prevBtn.onclick = () => { clearInterval(autoSlide); prevSlide(); startAutoSlide(); };
    if (nextBtn) nextBtn.onclick = () => { clearInterval(autoSlide); nextSlide(); startAutoSlide(); };
  }

  // Инициализация
  updateSizes();
  attachNavEvents();
  startAutoSlide();

  // Пересборка при ресайзе
  window.addEventListener('resize', () => {
    const oldStep = step;
    updateSizes();
    attachNavEvents(); // пересобираем кнопки, если поменялась навигация
    if (oldStep !== step) {
      currentIndex = 0;
      position = 0;
      moveSlide();
      startAutoSlide();
    }
  });


const stagesItems = Array.from(document.querySelectorAll('.stages__item'));
const prevBtnStage = document.querySelector('.stages__btn--prev');
const nextBtnStage = document.querySelector('.stages__btn--next');

if (stagesItems.length && prevBtnStage && nextBtnStage) {
  const originalHTML = stagesItems.map(it => it.innerHTML);

  const merges = [
    {from: 1, to: 0},
    {from: 4, to: 3}
  ];

  let hiddenIndices = new Set();
  let slidesForShow = stagesItems.slice();
  let currentIndexStage = 0;

  function rebuildSlidesForShow() {
    slidesForShow = stagesItems.filter((_, i) => !hiddenIndices.has(i));
    if (currentIndexStage >= slidesForShow.length) {
      currentIndexStage = Math.max(0, slidesForShow.length - 1);
    }
  }

  // контейнер для точек
// контейнер для точек
const dotsContainer = document.createElement('div');
dotsContainer.classList.add('stages__dots');

// вставляем точки между prev и next
prevBtnStage.parentNode.insertBefore(dotsContainer, nextBtnStage);


  function createDots() {
    dotsContainer.innerHTML = '';
    slidesForShow.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('stages__dot');
      if (i === currentIndexStage) dot.classList.add('active');
      dot.addEventListener('click', () => showSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  function updateNav() {
    prevBtnStage.disabled = currentIndexStage === 0;
    nextBtnStage.disabled = currentIndexStage === slidesForShow.length - 1;

    const allDots = dotsContainer.querySelectorAll('.stages__dot');
    allDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndexStage);
    });
  }

function showSlide(index) {
  if (!slidesForShow.length) return;

  if (index < 0) index = 0;
  if (index > slidesForShow.length - 1) index = slidesForShow.length - 1;

  if (window.innerWidth < 920) {
    // скрываем все слайды только на мобилке
    slidesForShow.forEach(item => {
      item.classList.remove('active');
      item.style.display = 'none';
    });
  }

  // показываем текущий
  const el = slidesForShow[index];
  el.classList.add('active');
  el.style.display = 'flex';
  currentIndexStage = index;

  updateNav();
}


  nextBtnStage.addEventListener('click', () => {
    if (currentIndexStage < slidesForShow.length - 1) {
      showSlide(currentIndexStage + 1);
    }
  });

  prevBtnStage.addEventListener('click', () => {
    if (currentIndexStage > 0) {
      showSlide(currentIndexStage - 1);
    }
  });

  function applyMerge(enable) {
    if (enable) {
      merges.forEach(pair => {
        const from = stagesItems[pair.from];
        const to = stagesItems[pair.to];
        if (!from || !to) return;

        if (hiddenIndices.has(pair.from)) return;

        const fromNumber = from.querySelector('.stages__number');
        const fromText = from.querySelector('.stages__text');

        if (fromNumber && fromText) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('stages__merged');
          wrapper.innerHTML = `
            <span class="stages__number">${fromNumber.textContent}</span>
            <p class="stages__text">${fromText.innerHTML}</p>
          `;
          to.appendChild(wrapper);
        } else {
          to.innerHTML += '<br><br>' + from.innerHTML;
        }

        from.style.display = 'none';
        hiddenIndices.add(pair.from);
      });
    } else {
      hiddenIndices.forEach(idx => {
        stagesItems[idx].style.display = '';
      });
      hiddenIndices.clear();
      stagesItems.forEach((el, i) => {
        el.innerHTML = originalHTML[i];
      });
    }

    rebuildSlidesForShow();
    createDots();
    showSlide(0);
  }

  const mq = window.matchMedia('(max-width: 920px)');
  applyMerge(mq.matches);

  const onChange = (e) => applyMerge(e.matches);
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onChange);
  } else {
    mq.addListener(onChange);
  }

  // запуск при загрузке
  createDots();
  showSlide(0);
}

})
