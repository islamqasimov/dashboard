/* =========================
   CONFIG
========================= */

const CERT_PATH = "./Certificates/";
const SCROLL_SPEED = 0.5; // пикселей в кадр (чем меньше, тем плавнее)
const GAP_BETWEEN_CERTS = 40; // отступ между сертификатами в пикселях
const AUTO_RESUME_DELAY = 3000; // мс до возобновления авто-скролла после ручного
const BATCH_SIZE = 5; // загружаем по 5 файлов одновременно

/* =========================
   STATE
========================= */

let files = [];
let loadedElements = []; // загруженные элементы для прокрутки
let scrollPosition = 0;
let animationFrame = null;
let userInteracting = false; // флаг ручного управления
let resumeTimeout = null; // таймер для возобновления авто-скролла

const certsContainer = document.querySelector(".certs");

/* =========================
   INIT
========================= */

(async () => {
  await loadManifest();
  await loadAllCertificates();
  startContinuousScroll();
})();

/* =========================
   MANIFEST
========================= */

async function loadManifest() {
  try {
    console.log("📂 Loading certificates list...");
    
    // Используем API для автоматического сканирования папки (manifest.json не нужен!)
    const res = await fetch("/api/certificates");
    const data = await res.json();
    
    // Проверка на ошибки
    if (data.error) {
      console.error("❌ Error loading certificates:", data.error);
      files = [];
    } else {
      files = data;
      console.log(`✅ Found ${files.length} certificates:`, files);
    }
  } catch (error) {
    console.error("❌ Failed to load manifest:", error);
    files = [];
  }
}

/* =========================
   LOAD ALL CERTIFICATES
========================= */

async function loadAllCertificates() {
  console.log("🔄 Starting to load all certificates...");
  console.log(`📊 Total files to process: ${files.length}`);
  
  // Счётчики по типам
  let pdfCount = 0;
  let imageCount = 0;
  
  files.forEach(file => {
    const ext = file.toLowerCase().split('.').pop();
    if (ext === "pdf") pdfCount++;
    else imageCount++;
  });
  
  console.log(`📑 File types: ${pdfCount} PDFs, ${imageCount} images`);
  console.log(`⚙️ Loading in batches of ${BATCH_SIZE} files...`);

  const elements = [];
  
  // Загружаем файлы порциями
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);
    
    console.log(`📦 Batch ${batchNum}/${totalBatches} (files ${i + 1}-${Math.min(i + BATCH_SIZE, files.length)})`);
    
    const batchPromises = batch.map((file, batchIndex) => {
      const globalIndex = i + batchIndex;
      const encodedFile = encodeURIComponent(file);
      const url = CERT_PATH + encodedFile;
      const ext = file.toLowerCase().split('.').pop();
      
      if (ext === "pdf") {
        console.log(`   📄 [${globalIndex + 1}/${files.length}] PDF: ${file}`);
        return loadPDF(url, file);
      } else {
        console.log(`   🖼️ [${globalIndex + 1}/${files.length}] Image: ${file}`);
        return loadImage(url, file);
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    elements.push(...batchResults);
    
    // Небольшая пауза между батчами для разгрузки браузера
    if (i + BATCH_SIZE < files.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Подсчитываем успешно загруженные
  const successCount = elements.filter(el => el !== null).length;
  const failCount = elements.length - successCount;
  
  console.log("=".repeat(60));
  console.log(`📊 LOADING RESULTS:`);
  console.log(`   ✅ Successfully loaded: ${successCount}`);
  console.log(`   ❌ Failed to load: ${failCount}`);
  console.log(`   📁 Total files: ${files.length}`);
  console.log("=".repeat(60));
  
  loadedElements = elements.filter(el => el !== null);
  
  if (loadedElements.length === 0) {
    console.error("❌ No certificates loaded! Check console for errors.");
    alert("⚠️ Не удалось загрузить ни одного сертификата! Проверьте консоль (F12).");
    return;
  }

  // ВАЖНО: Клонируем элементы для дублирования, а не просто копируем ссылки
  const duplicatedElements = loadedElements.map(el => el.cloneNode(true));
  loadedElements = [...loadedElements, ...duplicatedElements];
  
  console.log(`✅ Total elements for display: ${loadedElements.length} (${successCount} originals + ${successCount} duplicates)`);
  
  renderCertificates();
}

/* =========================
   LOAD IMAGE
========================= */

function loadImage(url, filename) {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`      ✅ Loaded: ${filename}`);
      
      const wrapper = document.createElement("div");
      wrapper.className = "cert-item";
      wrapper.style.marginBottom = GAP_BETWEEN_CERTS + "px";
      
      const imgEl = document.createElement("img");
      imgEl.src = url;
      imgEl.style.width = "100%";
      imgEl.style.display = "block";
      
      wrapper.appendChild(imgEl);
      resolve(wrapper);
    };
    
    img.onerror = (e) => {
      console.error(`      ❌ Failed: ${filename}`);
      resolve(null);
    };
    
    // Устанавливаем src после настройки обработчиков
    img.src = url;
  });
}

/* =========================
   LOAD PDF
========================= */

async function loadPDF(url, filename) {
  try {
    // Добавляем таймаут для загрузки
    const loadingTask = pdfjsLib.getDocument({
      url: url,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      disableAutoFetch: false,
      disableStream: false
    });
    
    // Таймаут 15 секунд (увеличен)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('PDF loading timeout')), 15000)
    );
    
    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    const page = await pdf.getPage(1);
    
    // Получаем размеры контейнера
    const containerWidth = certsContainer.clientWidth - 40; // минус padding
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(containerWidth / viewport.width, 2); // Максимум 2x
    const scaledViewport = page.getViewport({ scale });
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport
    }).promise;
    
    const wrapper = document.createElement("div");
    wrapper.className = "cert-item";
    wrapper.style.marginBottom = GAP_BETWEEN_CERTS + "px";
    wrapper.appendChild(canvas);
    
    console.log(`      ✅ Loaded: ${filename}`);
    
    return wrapper;
  } catch (err) {
    console.error(`      ❌ Failed: ${filename} - ${err.message || err}`);
    return null;
  }
}

/* =========================
   RENDER CERTIFICATES
========================= */

function renderCertificates() {
  certsContainer.innerHTML = "";
  
  const scrollContainer = document.createElement("div");
  scrollContainer.className = "scroll-container";
  
  loadedElements.forEach(element => {
    scrollContainer.appendChild(element);
  });
  
  certsContainer.appendChild(scrollContainer);
  
  // Логируем информацию о контейнере
  setTimeout(() => {
    const totalHeight = scrollContainer.scrollHeight;
    const halfHeight = totalHeight / 2;
    console.log("📐 Container info:");
    console.log(`   Total height: ${totalHeight}px`);
    console.log(`   Half height: ${halfHeight}px`);
    console.log(`   Elements count: ${loadedElements.length}`);
    console.log(`   Expected: first ${loadedElements.length / 2} are originals, second half are duplicates`);
  }, 100);
}

/* =========================
   CONTINUOUS SCROLL
========================= */

function startContinuousScroll() {
  const scrollContainer = certsContainer.querySelector(".scroll-container");
  if (!scrollContainer) return;
  
  function scroll() {
    // Пересчитываем высоту каждый раз (важно для fullscreen)
    const totalHeight = scrollContainer.scrollHeight;
    const halfHeight = totalHeight / 2;
    
    scrollPosition += SCROLL_SPEED;
    
    // Бесшовный цикл: используем модуль для плавного зацикливания
    // Когда доходим до конца первой половины (оригиналы),
    // телепортируемся к началу, где те же элементы повторяются
    if (scrollPosition >= halfHeight) {
      scrollPosition = scrollPosition - halfHeight;
      console.log(`🔄 Loop reset: was ${(scrollPosition + halfHeight).toFixed(0)}px, now ${scrollPosition.toFixed(0)}px`);
    }
    
    scrollContainer.style.transform = `translateY(-${scrollPosition}px)`;
    animationFrame = requestAnimationFrame(scroll);
  }
  
  scroll();
}

/* =========================
   FULLSCREEN HANDLER
========================= */

// Обработчик изменения fullscreen режима
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
  // Перезапускаем анимацию при входе/выходе из fullscreen
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  // Небольшая задержка для пересчета размеров
  setTimeout(() => {
    startContinuousScroll();
  }, 100);
}

// Обработчик видимости страницы (когда вкладка становится активной/неактивной)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Страница скрыта - останавливаем анимацию для экономии ресурсов
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  } else {
    // Страница видима - возобновляем анимацию
    if (!animationFrame) {
      startContinuousScroll();
    }
  }
});

/* =========================
   PAUSE/RESUME
========================= */

function pauseScroll() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function resumeScroll() {
  if (!animationFrame && !userInteracting) {
    startContinuousScroll();
  }
}

// Пауза при наведении мыши
certsContainer.addEventListener("mouseenter", pauseScroll);
certsContainer.addEventListener("mouseleave", resumeScroll);

/* =========================
   MANUAL SCROLL CONTROLS
========================= */

let isDragging = false;
let startY = 0;
let lastY = 0;

// Обработка колесика мыши
certsContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  
  const scrollContainer = certsContainer.querySelector(".scroll-container");
  if (!scrollContainer) return;
  
  // Останавливаем авто-скролл
  pauseScroll();
  userInteracting = true;
  
  // Ручная прокрутка
  scrollPosition += e.deltaY * 0.5;
  
  // Проверка границ для бесшовного цикла
  const totalHeight = scrollContainer.scrollHeight;
  const halfHeight = totalHeight / 2;
  
  // Нормализуем позицию с помощью while для точности
  while (scrollPosition >= halfHeight) {
    scrollPosition -= halfHeight;
  }
  while (scrollPosition < 0) {
    scrollPosition += halfHeight;
  }
  
  scrollContainer.style.transform = `translateY(-${scrollPosition}px)`;
  
  // Возобновляем авто-скролл через задержку
  clearTimeout(resumeTimeout);
  resumeTimeout = setTimeout(() => {
    userInteracting = false;
    resumeScroll();
  }, AUTO_RESUME_DELAY);
}, { passive: false });

// Touch события для мобильных устройств
certsContainer.addEventListener("touchstart", (e) => {
  isDragging = true;
  startY = e.touches[0].clientY;
  lastY = startY;
  
  pauseScroll();
  userInteracting = true;
}, { passive: true });

certsContainer.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  
  const scrollContainer = certsContainer.querySelector(".scroll-container");
  if (!scrollContainer) return;
  
  const currentY = e.touches[0].clientY;
  const deltaY = lastY - currentY;
  lastY = currentY;
  
  // Ручная прокрутка
  scrollPosition += deltaY;
  
  // Проверка границ для бесшовного цикла
  const totalHeight = scrollContainer.scrollHeight;
  const halfHeight = totalHeight / 2;
  
  while (scrollPosition >= halfHeight) {
    scrollPosition -= halfHeight;
  }
  while (scrollPosition < 0) {
    scrollPosition += halfHeight;
  }
  
  scrollContainer.style.transform = `translateY(-${scrollPosition}px)`;
}, { passive: true });

certsContainer.addEventListener("touchend", () => {
  isDragging = false;
  
  // Возобновляем авто-скролл через задержку
  clearTimeout(resumeTimeout);
  resumeTimeout = setTimeout(() => {
    userInteracting = false;
    resumeScroll();
  }, AUTO_RESUME_DELAY);
}, { passive: true });

// Drag для десктопа (опционально)
certsContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  startY = e.clientY;
  lastY = startY;
  certsContainer.style.cursor = "grabbing";
  
  pauseScroll();
  userInteracting = true;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  
  const scrollContainer = certsContainer.querySelector(".scroll-container");
  if (!scrollContainer) return;
  
  const currentY = e.clientY;
  const deltaY = lastY - currentY;
  lastY = currentY;
  
  // Ручная прокрутка
  scrollPosition += deltaY;
  
  // Проверка границ для бесшовного цикла
  const totalHeight = scrollContainer.scrollHeight;
  const halfHeight = totalHeight / 2;
  
  while (scrollPosition >= halfHeight) {
    scrollPosition -= halfHeight;
  }
  while (scrollPosition < 0) {
    scrollPosition += halfHeight;
  }
  
  scrollContainer.style.transform = `translateY(-${scrollPosition}px)`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    certsContainer.style.cursor = "grab";
    
    // Возобновляем авто-скролл через задержку
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      userInteracting = false;
      resumeScroll();
    }, AUTO_RESUME_DELAY);
  }
});
