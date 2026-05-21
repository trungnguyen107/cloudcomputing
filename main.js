import { Database } from "./db.js";

const APP_CONFIG = {
  themeStorageKey: "visionsearch-theme",
  sampleSeedVersion: "visionsearch-sample-seed-v1",
  sampleRecords: [
    {
      patientName: "Phong cảnh núi hồ",
      type: "SIFT",
      diagnosis: "Keypoints: 1240\nMatch Score: 98.5%\nTime: 45ms",
      imageData: "/public/sample_images/mountain.jpg",
      colorCentroid: { r: 96, g: 126, b: 154 },
      createdAt: "2024-03-10T08:00:00.000Z",
      tags: ["nature", "mountain", "outdoor"],
    },
    {
      patientName: "Xe đỏ cổ điển",
      type: "COLOR",
      diagnosis: "Dominant: Red (60%), Black (20%)\nMatch Score: 92.1%\nTime: 12ms",
      imageData: "/public/sample_images/red_car.jpg",
      colorCentroid: { r: 150, g: 92, b: 72 },
      createdAt: "2024-03-24T09:00:00.000Z",
      tags: ["vehicle", "car", "red"],
    },
    {
      patientName: "Hoa vàng cận cảnh",
      type: "ORB",
      diagnosis: "Keypoints: 860\nMatch Score: 87.9%\nTime: 29ms",
      imageData: "/public/sample_images/yellow_rose.jpg",
      colorCentroid: { r: 201, g: 165, b: 78 },
      createdAt: "2024-04-07T10:00:00.000Z",
      tags: ["flower", "yellow", "macro"],
    },
    {
      patientName: "Đô thị hiện đại",
      type: "CNN",
      diagnosis: "Embedding: 2048 dims\nMatch Score: 97.8%\nTime: 118ms",
      imageData: "/public/sample_images/city.jpg",
      colorCentroid: { r: 90, g: 101, b: 120 },
      createdAt: "2024-04-20T11:00:00.000Z",
      tags: ["city", "urban", "architecture"],
    },
    {
      patientName: "Mèo con ánh sáng mềm",
      type: "SIFT",
      diagnosis: "Keypoints: 1740\nMatch Score: 94.4%\nTime: 52ms",
      imageData: "/public/sample_images/kitten.jpg",
      colorCentroid: { r: 145, g: 134, b: 118 },
      createdAt: "2024-05-15T07:00:00.000Z",
      tags: ["animal", "cat", "pet"],
    },
    {
      patientName: "Bãi biển mùa hè",
      type: "COLOR",
      diagnosis: "Dominant: Blue (42%), Sand (34%)\nMatch Score: 95.0%\nTime: 14ms",
      imageData: "/public/sample_images/beach.jpg",
      colorCentroid: { r: 139, g: 171, b: 181 },
      createdAt: "2024-05-22T09:00:00.000Z",
      tags: ["beach", "sea", "blue"],
    },
    {
      patientName: "Xe đạp đường phố",
      type: "ORB",
      diagnosis: "Keypoints: 1020\nMatch Score: 88.5%\nTime: 31ms",
      imageData: "/public/sample_images/bicycle.jpg",
      colorCentroid: { r: 122, g: 128, b: 130 },
      createdAt: "2024-06-03T10:00:00.000Z",
      tags: ["vehicle", "bicycle", "street"],
    },
    {
      patientName: "Chó chân dung",
      type: "SIFT",
      diagnosis: "Keypoints: 1860\nMatch Score: 93.8%\nTime: 51ms",
      imageData: "/public/sample_images/dog.jpg",
      colorCentroid: { r: 125, g: 104, b: 83 },
      createdAt: "2024-07-10T07:00:00.000Z",
      tags: ["animal", "dog", "pet"],
    },
    {
      patientName: "Cà phê buổi sáng",
      type: "ORB",
      diagnosis: "Keypoints: 920\nMatch Score: 88.7%\nTime: 32ms",
      imageData: "/public/sample_images/coffee.jpg",
      colorCentroid: { r: 120, g: 94, b: 69 },
      createdAt: "2024-08-08T10:00:00.000Z",
      tags: ["coffee", "table", "warm"],
    },
    {
      patientName: "Rừng xanh chiều mát",
      type: "CNN",
      diagnosis: "Embedding: 2048 dims\nMatch Score: 96.8%\nTime: 115ms",
      imageData: "/public/sample_images/forest.jpg",
      colorCentroid: { r: 67, g: 105, b: 70 },
      createdAt: "2024-09-29T10:00:00.000Z",
      tags: ["nature", "forest", "green"],
    },
  ],
};

const dom = {
  recordsGrid: document.getElementById("recordsGrid"),
  uploadModal: document.getElementById("uploadModal"),
  uploadBtn: document.getElementById("uploadBtn"),
  closeModal: document.getElementById("closeModal"),
  cancelBtn: document.getElementById("cancelBtn"),
  uploadForm: document.getElementById("uploadForm"),
  searchInput: document.getElementById("searchInput"),
  filterChips: document.querySelectorAll(".filter-chip"),
  navItems: document.querySelectorAll(".nav-item"),
  scrollTopBtn: document.getElementById("scrollTopBtn"),
  clearDbBtn: document.getElementById("clearDbBtn"),
  themeToggle: document.getElementById("themeToggle"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  totalRecords: document.getElementById("totalRecords"),
  countSift: document.getElementById("countSift"),
  countOrb: document.getElementById("countOrb"),
  countColor: document.getElementById("countColor"),
  toastContainer: document.getElementById("toastContainer"),
  detailModal: document.getElementById("detailModal"),
  closeDetailModal: document.getElementById("closeDetailModal"),
  detailImage: document.getElementById("detailImage"),
  detailType: document.getElementById("detailType"),
  detailPatientName: document.getElementById("detailPatientName"),
  detailDate: document.getElementById("detailDate"),
  detailDiagnosis: document.getElementById("detailDiagnosis"),
  detailId: document.getElementById("detailId"),
  keypointsContainer: document.getElementById("keypointsContainer"),
  summaryTableBody: document.getElementById("summaryTableBody"),
};

const TYPE_COLOR = {
  SIFT: "#10b981",
  ORB: "#3b82f6",
  COLOR: "#f59e0b",
  CNN: "#8b5cf6",
};

let allRecords = [];
let activeFilter = "all";
let charts = {};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    configureChartDefaults();
    initTheme();
    bindEvents();
    await loadInitialData();
    renderAll();
  } catch (error) {
    console.error("Init error:", error);
    showToast("Không thể khởi tạo ứng dụng.");
  }
});

function configureChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "'Outfit', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = "#94a3b8";
  Chart.defaults.plugins.tooltip.backgroundColor = "#1e293b";
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.borderRadius = 8;
  Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: "bold" };
}

function initTheme() {
  const savedTheme = localStorage.getItem(APP_CONFIG.themeStorageKey) || "dark";
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (dom.themeToggle) {
    dom.themeToggle.textContent = theme === "dark" ? "Dark" : "Light";
  }
}

function bindEvents() {
  dom.themeToggle?.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(APP_CONFIG.themeStorageKey, nextTheme);
    applyTheme(nextTheme);
    showToast(`Đã chuyển sang giao diện ${nextTheme === "dark" ? "tối" : "sáng"}.`);
  });

  dom.uploadBtn?.addEventListener("click", openUploadModal);
  dom.closeModal?.addEventListener("click", closeUploadModal);
  dom.cancelBtn?.addEventListener("click", closeUploadModal);
  dom.uploadModal?.addEventListener("click", (event) => {
    if (event.target === dom.uploadModal) closeUploadModal();
  });
  dom.uploadForm?.addEventListener("submit", handleUploadSubmit);

  dom.filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      dom.filterChips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      renderCards();
    });
  });

  dom.searchInput?.addEventListener("input", debounce(renderCards, 180));

  dom.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      dom.navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".view-section").forEach((section) => {
        section.style.display = "none";
      });
      const target = document.getElementById(`${item.dataset.view}View`);
      if (target) target.style.display = "block";
      if (item.dataset.view === "analytics") buildCharts();
    });
  });

  dom.scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    dom.scrollTopBtn?.classList.toggle("visible", window.scrollY > 250);
  });

  dom.closeDetailModal?.addEventListener("click", closeDetailModal);
  dom.detailModal?.addEventListener("click", (event) => {
    if (event.target === dom.detailModal) closeDetailModal();
  });

  dom.clearDbBtn?.addEventListener("click", async () => {
    const confirmed = window.confirm("Xóa toàn bộ dữ liệu cục bộ và nạp lại bộ mẫu?");
    if (!confirmed) return;
    try {
      await Database.clearAll();
      localStorage.removeItem(APP_CONFIG.sampleSeedVersion);
      await loadInitialData();
      renderAll();
      showToast("Đã reset dữ liệu cục bộ.");
    } catch (error) {
      console.error("Reset failed:", error);
      showToast("Reset dữ liệu thất bại.");
    }
  });

  dom.exportCsvBtn?.addEventListener("click", exportCsv);
  dom.exportPdfBtn?.addEventListener("click", exportPrintableReport);

  bindSampleLinks();
  setupArena();
}

async function loadInitialData() {
  allRecords = await Database.getAllRecords();
  const seedDone = localStorage.getItem(APP_CONFIG.sampleSeedVersion) === "done";
  if (!seedDone || allRecords.length === 0) {
    await seedSamples();
    localStorage.setItem(APP_CONFIG.sampleSeedVersion, "done");
    allRecords = await Database.getAllRecords();
  }
}

async function seedSamples() {
  if ((await Database.getAllRecords()).length > 0) return;
  for (const record of APP_CONFIG.sampleRecords) {
    await Database.saveRecord(record);
  }
}

function renderAll() {
  renderCards();
  updateStats();
  buildCharts();
  recreateIcons();
}

function renderCards() {
  if (!dom.recordsGrid) return;
  const term = dom.searchInput?.value.trim().toLowerCase() || "";
  const records = allRecords.filter((record) => {
    const matchesSearch =
      !term ||
      record.patientName.toLowerCase().includes(term) ||
      (record.tags || []).some((tag) => tag.toLowerCase().includes(term)) ||
      record.type.toLowerCase().includes(term);
    const matchesFilter = activeFilter === "all" || record.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (records.length === 0) {
    dom.recordsGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:#64748b">Không có bản ghi phù hợp.</div>';
    return;
  }

  dom.recordsGrid.innerHTML = records
    .map((record, index) => {
      const score = extractMatchScore(record.diagnosis);
      const tags = (record.tags || [])
        .slice(0, 3)
        .map((tag) => `<span class="tag-pill">${tag}</span>`)
        .join("");
      const fallbackImage =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="24">${record.type}</text></svg>`
        );

      return `
        <div class="record-card" onclick="openDetail(${record.id})" style="animation-delay:${index * 0.04}s">
          <div class="record-thumb">
            <img src="${record.imageData}" alt="${escapeHtml(record.patientName)}" loading="lazy" onerror="this.src='${fallbackImage}'">
            <span class="record-type-badge" style="background:${typeColor(record.type)}">${record.type}</span>
            <span class="record-score-badge">Độ khớp: ${score}</span>
          </div>
          <div class="record-info">
            <h3>${escapeHtml(record.patientName)}</h3>
            <p style="font-family:monospace;font-size:0.85em;color:var(--text-muted);">${escapeHtml(record.diagnosis.split("\n")[0])}</p>
            <div style="margin-top:0.6rem;">${tags}</div>
            <div class="record-meta">
              <span>${formatDate(record.createdAt)}</span>
              <span>REC #${record.id}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  recreateIcons();
}

function updateStats() {
  dom.totalRecords.textContent = String(allRecords.length);
  dom.countSift.textContent = String(allRecords.filter((item) => item.type === "SIFT").length);
  dom.countOrb.textContent = String(allRecords.filter((item) => item.type === "ORB").length);
  dom.countColor.textContent = String(allRecords.filter((item) => item.type === "COLOR").length);
}

window.openDetail = (id) => {
  const record = allRecords.find((item) => item.id === id);
  if (!record) return;

  dom.detailImage.src = record.imageData;
  dom.detailType.textContent = record.type;
  dom.detailType.style.background = typeColor(record.type);
  dom.detailPatientName.textContent = record.patientName;
  dom.detailDate.textContent = `Ghi nhận lúc: ${formatDateTime(record.createdAt)}`;
  dom.detailDiagnosis.innerHTML = escapeHtml(record.diagnosis).replace(/\n/g, "<br>");
  dom.detailId.textContent = `IndexedDB ID: ${record.id}`;
  dom.keypointsContainer.innerHTML = "";

  if (record.type !== "COLOR") {
    drawMockKeypoints(record.type);
  }

  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      const confirmed = window.confirm(`Xóa bản ghi "${record.patientName}"?`);
      if (!confirmed) return;
      try {
        await Database.deleteRecord(record.id);
        allRecords = await Database.getAllRecords();
        closeDetailModal();
        renderAll();
        showToast("Đã xóa bản ghi.");
      } catch (error) {
        console.error("Delete failed:", error);
        showToast("Không thể xóa bản ghi.");
      }
    };
  }

  dom.detailModal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

function closeDetailModal() {
  dom.detailModal.style.display = "none";
  document.body.style.overflow = "";
}

function drawMockKeypoints(type) {
  const pointCount = type === "SIFT" ? 54 : type === "ORB" ? 36 : 20;
  for (let index = 0; index < pointCount; index += 1) {
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.width = type === "CNN" ? "10px" : "6px";
    dot.style.height = type === "CNN" ? "10px" : "6px";
    dot.style.borderRadius = "50%";
    dot.style.background = typeColor(type);
    dot.style.border = "1px solid #fff";
    dot.style.opacity = String(Math.random() * 0.6 + 0.3);
    dot.style.left = `${Math.random() * 76 + 12}%`;
    dot.style.top = `${Math.random() * 76 + 12}%`;
    dot.classList.add("keypoint-pulse");
    dot.title = `Feature #${index + 1} • ${type}`;
    dom.keypointsContainer.appendChild(dot);
  }
}

async function handleUploadSubmit(event) {
  event.preventDefault();
  const file = document.getElementById("imageFile").files[0];
  if (!file) {
    showToast("Bạn chưa chọn ảnh.");
    return;
  }

  const submitBtn = dom.uploadForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Đang phân tích...";

  try {
    const imageData = await readFileAsDataUrl(file);
    const colorCentroid = await analyzeImageColor(imageData);
    const type = document.getElementById("scanType").value;
    const topN = Number(document.getElementById("diagnosis").value) || 10;
    const record = {
      patientName:
        document.getElementById("patientName").value.trim() || `Query ${new Date().getTime()}`,
      type,
      diagnosis: buildDiagnosis(type, topN),
      imageData,
      colorCentroid,
      createdAt: new Date().toISOString(),
      tags: inferTagsFromFilename(file.name, type),
    };

    await Database.saveRecord(record);
    allRecords = await Database.getAllRecords();
    closeUploadModal();
    renderAll();
    showToast("Đã lưu bản ghi mới.");
  } catch (error) {
    console.error("Upload failed:", error);
    showToast("Phân tích ảnh thất bại.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    recreateIcons();
  }
}

function buildDiagnosis(type, topN) {
  const keypoints = Math.floor(Math.random() * 1200) + 700;
  const matchScore = (Math.random() * 15 + 84).toFixed(1);
  const latency = Math.floor(Math.random() * 80) + 20;
  if (type === "COLOR") {
    return `Histogram bins: 64\nMatch Score: ${matchScore}%\nTopN: ${topN} • Time: ${latency}ms`;
  }
  if (type === "CNN") {
    return `Embedding: 2048 dims\nMatch Score: ${matchScore}%\nTopN: ${topN} • Time: ${latency + 40}ms`;
  }
  return `Keypoints: ${keypoints}\nMatch Score: ${matchScore}%\nTopN: ${topN} • Time: ${latency}ms`;
}

function openUploadModal() {
  dom.uploadModal.style.display = "flex";
}

function closeUploadModal() {
  dom.uploadModal.style.display = "none";
  dom.uploadForm.reset();
}

function bindSampleLinks() {
  document.querySelectorAll(".sample-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const filterValue = link.dataset.filter;
      document.querySelector('.nav-item[data-view="dashboard"]')?.click();
      const chip = Array.from(dom.filterChips).find((item) => item.dataset.filter === filterValue);
      chip?.click();
    });
  });
}

function buildCharts() {
  const counts = ["SIFT", "ORB", "COLOR", "CNN"].map(
    (type) => allRecords.filter((item) => item.type === type).length
  );

  makeChart(
    "typeChart",
    "doughnut",
    {
      labels: ["SIFT", "ORB", "COLOR", "CNN"],
      datasets: [
        {
          data: counts,
          backgroundColor: [TYPE_COLOR.SIFT, TYPE_COLOR.ORB, TYPE_COLOR.COLOR, TYPE_COLOR.CNN],
          borderWidth: 0,
        },
      ],
    },
    { plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }
  );

  const trendLabels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toLocaleDateString("vi-VN");
  });

  makeChart(
    "trendChart",
    "line",
    {
      labels: trendLabels,
      datasets: [
        {
          label: "Độ trễ giả lập (ms)",
          data: trendLabels.map(() => Math.floor(Math.random() * 50) + 25),
          borderColor: TYPE_COLOR.SIFT,
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.35,
          fill: true,
        },
      ],
    },
    { plugins: { legend: { display: false } }, maintainAspectRatio: false }
  );

  makeChart(
    "accuracyChart",
    "bar",
    {
      labels: ["SIFT", "ORB", "COLOR", "CNN"],
      datasets: [
        {
          label: "Match score trung bình",
          data: ["SIFT", "ORB", "COLOR", "CNN"].map((type) => getAverageMatchScore(type)),
          backgroundColor: [TYPE_COLOR.SIFT, TYPE_COLOR.ORB, TYPE_COLOR.COLOR, TYPE_COLOR.CNN],
          borderRadius: 8,
        },
      ],
    },
    {
      plugins: { legend: { display: false } },
      scales: { y: { min: 50, max: 100, ticks: { stepSize: 10 } } },
      maintainAspectRatio: false,
    }
  );

  makeChart(
    "radarChart",
    "radar",
    {
      labels: ["Độ chính xác", "Tốc độ", "Độ ổn định", "Chi phí lưu trữ", "Tính trực quan"],
      datasets: [
        { label: "SIFT", data: [8, 4, 9, 4, 7], borderColor: TYPE_COLOR.SIFT, backgroundColor: "rgba(16,185,129,0.1)" },
        { label: "ORB", data: [7, 8, 8, 7, 6], borderColor: TYPE_COLOR.ORB, backgroundColor: "rgba(59,130,246,0.1)" },
        { label: "COLOR", data: [6, 10, 6, 9, 8], borderColor: TYPE_COLOR.COLOR, backgroundColor: "rgba(245,158,11,0.1)" },
        { label: "CNN", data: [9, 3, 8, 3, 9], borderColor: TYPE_COLOR.CNN, backgroundColor: "rgba(139,92,246,0.1)" },
      ],
    },
    {
      plugins: { legend: { position: "right" } },
      scales: {
        r: {
          angleLines: { color: "rgba(255,255,255,0.1)" },
          grid: { color: "rgba(255,255,255,0.1)" },
          pointLabels: { color: "#94a3b8", font: { size: 11 } },
          ticks: { backdropColor: "transparent", color: "#94a3b8", showLabelBackdrop: false, stepSize: 2 },
          min: 0,
          max: 10,
        },
      },
      maintainAspectRatio: false,
    }
  );

  const labels = {};
  allRecords.forEach((record) => {
    labels[record.patientName] = (labels[record.patientName] || 0) + 1;
  });
  const topLabels = Object.entries(labels).sort((a, b) => b[1] - a[1]).slice(0, 8);

  makeChart(
    "freqChart",
    "bar",
    {
      labels: topLabels.map(([name]) => name),
      datasets: [{ data: topLabels.map(([, count]) => count), backgroundColor: TYPE_COLOR.ORB, borderRadius: 6 }],
    },
    {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { stepSize: 1 } } },
      maintainAspectRatio: false,
    }
  );

  renderSummaryTable();
}

function renderSummaryTable() {
  if (!dom.summaryTableBody) return;
  dom.summaryTableBody.innerHTML = allRecords
    .slice()
    .reverse()
    .map((record, index) => {
      const header = record.diagnosis.split("\n")[0];
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(record.patientName)}</td>
          <td><span class="type-pill" style="background:${typeColor(record.type)}">${record.type}</span></td>
          <td>${escapeHtml(header)}</td>
          <td>${formatDate(record.createdAt)}</td>
        </tr>
      `;
    })
    .join("");
}

function makeChart(id, type, data, options) {
  if (!window.Chart) return;
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(canvas.getContext("2d"), { type, data, options });
}

function getAverageMatchScore(type) {
  const values = allRecords
    .filter((record) => record.type === type)
    .map((record) => Number.parseFloat(extractMatchScore(record.diagnosis)))
    .filter((value) => !Number.isNaN(value));
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function setupArena() {
  const arenaForm = document.getElementById("arenaForm");
  const arenaScanning = document.getElementById("arenaScanning");
  const arenaGrid = document.getElementById("arenaGrid");
  const arenaQueryPreview = document.getElementById("arenaQueryPreview");
  const arenaQueryImg = document.getElementById("arenaQueryImg");

  if (!arenaForm) return;

  arenaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = document.getElementById("arenaFile").files[0];
    if (!file) {
      showToast("Bạn cần chọn ảnh để so khớp.");
      return;
    }

    const topN = Number.parseInt(document.getElementById("arenaTopN").value, 10) || 3;
    const queryData = await readFileAsDataUrl(file);
    const queryColor = await analyzeImageColor(queryData);
    const category = inferCategory(file.name, queryColor);

    arenaQueryImg.src = queryData;
    arenaQueryPreview.style.display = "block";
    arenaScanning.style.display = "block";
    arenaGrid.style.display = "none";

    setTimeout(() => {
      arenaScanning.style.display = "none";
      arenaGrid.style.display = "grid";
      renderArenaColumn("sift", "SIFT", topN, 42, category, queryColor);
      renderArenaColumn("orb", "ORB", topN, 18, category, queryColor);
      renderArenaColumn("color", "COLOR", topN, 9, category, queryColor);
      renderArenaColumn("cnn", "CNN", topN, 115, category, queryColor);
      recreateIcons();
    }, 900);
  });
}

function renderArenaColumn(columnId, type, topN, latency, category, queryColor) {
  const resultsContainer = document.getElementById(`${columnId}ArenaResults`);
  const statsContainer = document.getElementById(`${columnId}ArenaStats`);
  if (!resultsContainer || !statsContainer) return;

  const matches = allRecords
    .map((record) => ({
      record,
      score: computeArenaScore(record, type, category, queryColor),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topN);

  const averageScore = (matches.reduce((sum, item) => sum + item.score, 0) / matches.length).toFixed(1);
  statsContainer.textContent = `Độ trễ: ${latency}ms | Match: ${averageScore}%`;

  resultsContainer.innerHTML = matches
    .map(
      ({ record, score }) => `
        <div class="arena-card" onclick="openDetail(${record.id})">
          <div class="arena-card-thumb">
            <img src="${record.imageData}" alt="${escapeHtml(record.patientName)}">
          </div>
          <div class="arena-card-info">
            <h5>${escapeHtml(record.patientName)}</h5>
            <p>Độ khớp: ${score.toFixed(1)}%</p>
          </div>
        </div>
      `
    )
    .join("");
}

function computeArenaScore(record, type, category, queryColor) {
  const baseColor = record.colorCentroid || { r: 120, g: 120, b: 120 };
  const distance = Math.sqrt(
    (queryColor.r - baseColor.r) ** 2 +
      (queryColor.g - baseColor.g) ** 2 +
      (queryColor.b - baseColor.b) ** 2
  );

  let score = 94 - (distance / 441.67) * 44;
  if (record.type === type) score += type === "COLOR" ? 4 : 2;

  const normalizedTags = (record.tags || []).map((tag) => tag.toLowerCase());
  if (normalizedTags.includes(category)) score += 10;
  if (["animal", "vehicle", "nature", "flower", "blue"].includes(category) && normalizedTags.length) {
    const mismatched = !normalizedTags.includes(category);
    if (mismatched) score -= 8;
  }

  return Math.min(99.9, Math.max(15, score + Math.random() * 1.2));
}

function exportCsv() {
  if (!allRecords.length) {
    showToast("Không có dữ liệu để export.");
    return;
  }

  const rows = [
    ["id", "patientName", "type", "diagnosis", "createdAt", "tags"],
    ...allRecords.map((record) => [
      record.id,
      record.patientName,
      record.type,
      record.diagnosis.replace(/\n/g, " | "),
      record.createdAt,
      (record.tags || []).join(";"),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "visionsearch-records.csv");
}

function exportPrintableReport() {
  if (!allRecords.length) {
    showToast("Không có dữ liệu để export.");
    return;
  }

  const reportWindow = window.open("", "_blank", "width=1024,height=768");
  if (!reportWindow) {
    showToast("Trình duyệt đã chặn cửa sổ export.");
    return;
  }

  const rows = allRecords
    .map(
      (record) => `
        <tr>
          <td>${record.id}</td>
          <td>${escapeHtml(record.patientName)}</td>
          <td>${record.type}</td>
          <td>${escapeHtml(record.diagnosis.replace(/\n/g, " | "))}</td>
          <td>${formatDate(record.createdAt)}</td>
        </tr>
      `
    )
    .join("");

  reportWindow.document.write(`
    <html>
      <head>
        <title>VisionSearch Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin-bottom: 8px; }
          p { color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>VisionSearch Local Report</h1>
        <p>Tổng bản ghi: ${allRecords.length}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Thuật toán</th>
              <th>Đặc trưng</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function showToast(message) {
  if (!dom.toastContainer) return;
  dom.toastContainer.textContent = message;
  dom.toastContainer.classList.add("show");
  window.setTimeout(() => dom.toastContainer.classList.remove("show"), 2600);
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function recreateIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function typeColor(type) {
  return TYPE_COLOR[type] || TYPE_COLOR.SIFT;
}

function extractMatchScore(diagnosis) {
  const match = diagnosis.match(/Match Score: ([\d.]+)%/);
  return match ? match[1] : "N/A";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("vi-VN");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function analyzeImageColor(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 12;
      canvas.height = 12;
      context.drawImage(image, 0, 0, 12, 12);
      const pixels = context.getImageData(0, 0, 12, 12).data;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        r += pixels[index];
        g += pixels[index + 1];
        b += pixels[index + 2];
      }
      const count = pixels.length / 4;
      resolve({
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      });
    };
    image.onerror = reject;
    image.src = source;
  });
}

function inferTagsFromFilename(filename, type) {
  const lower = filename.toLowerCase();
  const tags = new Set([type.toLowerCase()]);
  if (/(dog|cat|pet|animal|cho|meo)/.test(lower)) tags.add("animal");
  if (/(car|bike|vehicle|xe|road)/.test(lower)) tags.add("vehicle");
  if (/(forest|mountain|nature|tree|beach|lake|rung)/.test(lower)) tags.add("nature");
  if (/(flower|rose|blossom|hoa)/.test(lower)) tags.add("flower");
  if (/(blue|sea|ocean)/.test(lower)) tags.add("blue");
  return Array.from(tags);
}

function inferCategory(filename, color) {
  const lower = filename.toLowerCase();
  if (/(flower|rose|blossom|hoa)/.test(lower)) return "flower";
  if (/(dog|cat|pet|animal|cho|meo)/.test(lower)) return "animal";
  if (/(car|bike|vehicle|xe|road)/.test(lower)) return "vehicle";
  if (/(forest|mountain|nature|tree|beach|lake|rung)/.test(lower)) return "nature";
  if (color.b > color.r && color.b > color.g) return "blue";
  return "neutral";
}
