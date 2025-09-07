document.addEventListener('DOMContentLoaded', function() {
	const track = document.querySelector(".participants__track");
	const itemsEls = document.querySelectorAll(".participants__item");
	const itemsCount = itemsEls.length;
	let position = 0;
	let currentIndex = 0;
	let step = 3;
	let itemWidth = itemsEls[0].offsetWidth;
	let autoSlide;
	// Функция для получения активной навигации в зависимости от ширины
	function getNav() {
		if(window.innerWidth < 592) {
			const navAdaptive = document.querySelector(".participants__nav--adaptive");
			return navAdaptive ? {
				prevBtn: navAdaptive.querySelector(".participants__btn--prev"),
				nextBtn: navAdaptive.querySelector(".participants__btn--next"),
				counterStart: navAdaptive.querySelector(".counter-start"),
				counterEnd: navAdaptive.querySelector(".counter-end")
			} : {};
		} else {
			const nav = document.querySelector(".participants__nav");
			return nav ? {
				prevBtn: nav.querySelector(".participants__btn--prev"),
				nextBtn: nav.querySelector(".participants__btn--next"),
				counterStart: nav.querySelector(".counter-start"),
				counterEnd: nav.querySelector(".counter-end")
			} : {};
		}
	}
	// Обновление счётчика
	function updateCounter() {
		const {
			counterStart, counterEnd
		} = getNav();
		if(counterStart && counterEnd) {
			counterStart.textContent = Math.min(currentIndex + step, itemsCount);
			counterEnd.textContent = itemsCount;
		}
	}
	// Обновление размеров и шага
	function updateSizes() {
		itemWidth = itemsEls[0].offsetWidth;
		if(window.innerWidth < 870) {
			step = 1;
		} else if(window.innerWidth < 1345) {
			step = 2;
		} else {
			step = 3;
		}
		updateCounter();
	}

	function moveSlide() {
		track.style.transform = `translateX(${-position}px)`;
		updateCounter();
	}

	function nextSlide() {
		if(currentIndex + step < itemsCount) {
			currentIndex += step;
			position = currentIndex * itemWidth;
			moveSlide();
		}
	}

	function prevSlide() {
		if(currentIndex - step >= 0) {
			currentIndex -= step;
			position = currentIndex * itemWidth;
			moveSlide();
		}
	}

	function startAutoSlide() {
		clearInterval(autoSlide);
		autoSlide = setInterval(() => {
			if(currentIndex + step < itemsCount) nextSlide();
			else {
				currentIndex = 0;
				position = 0;
				moveSlide();
			}
		}, 5000);
	}
	// Привязка событий к кнопкам
	function attachNavEvents() {
		const {
			prevBtn, nextBtn
		} = getNav();
		if(prevBtn) prevBtn.onclick = () => {
			clearInterval(autoSlide);
			prevSlide();
			startAutoSlide();
		};
		if(nextBtn) nextBtn.onclick = () => {
			clearInterval(autoSlide);
			nextSlide();
			startAutoSlide();
		};
	}
	updateSizes();
	attachNavEvents();
	startAutoSlide();
	window.addEventListener('resize', () => {
		updateSizes();
		currentIndex = 0;
		position = 0;
		moveSlide();
		attachNavEvents();
	});
	const stagesItems = Array.from(document.querySelectorAll('.stages__item'));
	const prevBtnStage = document.querySelector('.stages__btn--prev');
	const nextBtnStage = document.querySelector('.stages__btn--next');
	if(stagesItems.length && prevBtnStage && nextBtnStage) {
		const originalHTML = stagesItems.map(it => it.innerHTML);
		const merges = [{
			from: 1,
			to: 0
		}, {
			from: 4,
			to: 3
		}];
		let hiddenIndices = new Set();
		let slidesForShow = stagesItems.slice();
		let currentIndexStage = 0;

		function rebuildSlidesForShow() {
			slidesForShow = stagesItems.filter((_, i) => !hiddenIndices.has(i));
			if(currentIndexStage >= slidesForShow.length) {
				currentIndexStage = Math.max(0, slidesForShow.length - 1);
			}
		}
		// контейнер для точек
		const dotsContainer = document.createElement('div');
		dotsContainer.classList.add('stages__dots');
		prevBtnStage.parentNode.insertBefore(dotsContainer, nextBtnStage);

		function createDots() {
			dotsContainer.innerHTML = '';
			slidesForShow.forEach((_, i) => {
				const dot = document.createElement('button');
				dot.classList.add('stages__dot');
				if(i === currentIndexStage) dot.classList.add('active');
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
			if(!slidesForShow.length) return;
			if(index < 0) index = 0;
			if(index > slidesForShow.length - 1) index = slidesForShow.length - 1;
			if(window.innerWidth < 920) {
				slidesForShow.forEach(item => {
					item.classList.remove('active');
					item.style.display = 'none';
				});
			}
			const el = slidesForShow[index];
			el.classList.add('active');
			el.style.display = 'flex';
			currentIndexStage = index;
			updateNav();
		}
		nextBtnStage.addEventListener('click', () => {
			if(currentIndexStage < slidesForShow.length - 1) {
				showSlide(currentIndexStage + 1);
			}
		});
		prevBtnStage.addEventListener('click', () => {
			if(currentIndexStage > 0) {
				showSlide(currentIndexStage - 1);
			}
		});

		function applyMerge(enable) {
			if(enable) {
				merges.forEach(pair => {
					const from = stagesItems[pair.from];
					const to = stagesItems[pair.to];
					if(!from || !to) return;
					if(hiddenIndices.has(pair.from)) return;
					const fromNumber = from.querySelector('.stages__number');
					const fromText = from.querySelector('.stages__text');
					if(fromNumber && fromText) {
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
		if(typeof mq.addEventListener === 'function') {
			mq.addEventListener('change', onChange);
		} else {
			mq.addListener(onChange);
		}
		createDots();
		showSlide(0);
	}
})