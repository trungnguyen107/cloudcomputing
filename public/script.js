import { Database } from './db.js';

// ── DOM refs ──────────────────────────────────────────────────────────────
const recordsGrid  = document.getElementById('recordsGrid');
const uploadModal  = document.getElementById('uploadModal');
const uploadBtn    = document.getElementById('uploadBtn');
const closeModal   = document.getElementById('closeModal');
const cancelBtn    = document.getElementById('cancelBtn');
const uploadForm   = document.getElementById('uploadForm');
const searchInput  = document.getElementById('searchInput');
const filterChips  = document.querySelectorAll('.filter-chip');
const navItems     = document.querySelectorAll('.nav-item');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const clearDbBtn   = document.getElementById('clearDbBtn');

// Detail Modal refs
const detailModal       = document.getElementById('detailModal');
const closeDetailModal  = document.getElementById('closeDetailModal');
const detailImage       = document.getElementById('detailImage');
const detailType        = document.getElementById('detailType');
const detailPatientName = document.getElementById('detailPatientName');
const detailDate        = document.getElementById('detailDate');
const detailDiagnosis   = document.getElementById('detailDiagnosis');
const detailId          = document.getElementById('detailId');


let allRecords   = [];
let activeFilter = 'all';
let charts       = {};

// ── Type helpers ─────────────────────────────────────────────────────────
const TYPE_COLOR = { 'SIFT': '#10b981', 'ORB': '#3b82f6', 'COLOR': '#f59e0b', 'CNN': '#8b5cf6' };
function typeColor(t) { return TYPE_COLOR[t] || '#10b981'; }

// ── Sample data (CBIR) ──────────────────────────────────────────────
const SAMPLES = [
  { label:'Phong cảnh hồ và đồi núi',      type:'SIFT',  diagnosis:'Keypoints: 1240\nMatch Score: 98.5%\nTime: 45ms',           imageData:'https://picsum.photos/id/10/400/250', colorCentroid: { r: 100, g: 130, b: 160 }, createdAt:'2024-03-10T08:00:00.000Z' },
  { label:'Xe ô tô cổ điển',       type:'COLOR', diagnosis:'Dominant: Red (60%), Black (20%)\nMatch Score: 92.1%\nTime: 12ms', imageData:'https://picsum.photos/id/111/400/250', colorCentroid: { r: 140, g: 110, b: 90 }, createdAt:'2024-03-24T09:00:00.000Z' },
  { label:'Cành hoa anh đào nở rộ',      type:'ORB',   diagnosis:'Keypoints: 850\nMatch Score: 87.3%\nTime: 30ms',     imageData:'https://picsum.photos/id/106/400/250', colorCentroid: { r: 200, g: 150, b: 160 }, createdAt:'2024-04-07T10:00:00.000Z' },
  { label:'Lối đi giữa rừng thông',      type:'CNN',   diagnosis:'ResNet50 Vector: [0.12, 0.44...]\nMatch Score: 99.1%\nTime: 120ms', imageData:'https://picsum.photos/id/1043/400/250', colorCentroid: { r: 70, g: 85, b: 65 }, createdAt:'2024-04-20T11:00:00.000Z' },
  { label:'Chú chó Husky đen trắng',    type:'SIFT',  diagnosis:'Keypoints: 2100\nMatch Score: 94.2%\nTime: 55ms',    imageData:'https://picsum.photos/id/659/400/250', colorCentroid: { r: 110, g: 110, b: 110 }, createdAt:'2024-05-15T07:00:00.000Z' },
  { label:'Cà phê nóng ban sáng',      type:'ORB',   diagnosis:'Keypoints: 920\nMatch Score: 88.7%\nTime: 32ms',     imageData:'https://picsum.photos/id/425/400/250', colorCentroid: { r: 130, g: 100, b: 80 }, createdAt:'2024-05-01T09:00:00.000Z' },
  { label:'Chú chó Pug ngủ ngon',    type:'COLOR', diagnosis:'Dominant: Blue (55%), Sand (30%)\nMatch Score: 95.0%\nTime: 14ms', imageData:'https://picsum.photos/id/1025/400/250', colorCentroid: { r: 160, g: 150, b: 140 }, createdAt:'2024-05-22T09:00:00.000Z' },
  { label:'Phong cảnh đồi cỏ xanh',     type:'CNN',   diagnosis:'ResNet50 Vector: [0.33, 0.11...]\nMatch Score: 97.4%\nTime: 110ms', imageData:'https://picsum.photos/id/146/400/250', colorCentroid: { r: 120, g: 140, b: 150 }, createdAt:'2024-06-03T10:00:00.000Z' },
  { label:'Khung cảnh rừng xanh',      type:'SIFT',  diagnosis:'Keypoints: 1530\nMatch Score: 96.1%\nTime: 49ms',           imageData:'https://picsum.photos/id/28/400/250', colorCentroid: { r: 70, g: 110, b: 60 }, createdAt:'2024-06-12T08:00:00.000Z' },
  { label:'Thành phố về đêm',       type:'CNN',   diagnosis:'ResNet50 Vector: [0.88, 0.02...]\nMatch Score: 98.9%\nTime: 130ms', imageData:'https://picsum.photos/id/122/400/250', colorCentroid: { r: 40, g: 50, b: 70 }, createdAt:'2024-06-18T09:00:00.000Z' },
  { label:'Cốc trà ấm trên tay',      type:'ORB',   diagnosis:'Keypoints: 710\nMatch Score: 85.0%\nTime: 28ms',     imageData:'https://picsum.photos/id/225/400/250', colorCentroid: { r: 160, g: 130, b: 110 }, createdAt:'2024-07-02T10:00:00.000Z' },
  { label:'Chú chó con đáng yêu',    type:'SIFT',  diagnosis:'Keypoints: 1840\nMatch Score: 93.8%\nTime: 51ms',    imageData:'https://picsum.photos/id/237/400/250', colorCentroid: { r: 120, g: 100, b: 80 }, createdAt:'2024-07-10T07:00:00.000Z' },
  { label:'Hồ nước trong xanh',      type:'COLOR', diagnosis:'Dominant: Orange (50%), Purple (30%)\nMatch Score: 94.5%\nTime: 13ms', imageData:'https://picsum.photos/id/1011/400/250', colorCentroid: { r: 90, g: 130, b: 150 }, createdAt:'2024-07-15T09:00:00.000Z' },
  { label:'Máy đánh chữ cổ điển',    type:'COLOR', diagnosis:'Dominant: Red (45%), Yellow (35%)\nMatch Score: 89.2%\nTime: 11ms', imageData:'https://picsum.photos/id/292/400/250', colorCentroid: { r: 160, g: 150, b: 120 }, createdAt:'2024-07-22T09:00:00.000Z' },
  { label:'Chú gấu nâu hoang dã',     type:'SIFT',  diagnosis:'Keypoints: 1980\nMatch Score: 95.7%\nTime: 58ms',    imageData:'https://picsum.photos/id/433/400/250', colorCentroid: { r: 90, g: 95, b: 70 }, createdAt:'2024-08-01T10:00:00.000Z' },
  { label:'Góc làm việc công nghệ',     type:'CNN',   diagnosis:'ResNet50 Vector: [0.65, 0.12...]\nMatch Score: 96.8%\nTime: 115ms', imageData:'https://picsum.photos/id/445/400/250', colorCentroid: { r: 80, g: 80, b: 85 }, createdAt:'2024-08-08T10:00:00.000Z' },
  { label:'Sa mạc cát vàng',      type:'COLOR', diagnosis:'Dominant: Yellow (70%), Brown (20%)\nMatch Score: 91.5%\nTime: 15ms', imageData:'https://picsum.photos/id/486/400/250', colorCentroid: { r: 200, g: 170, b: 110 }, createdAt:'2024-08-20T10:00:00.000Z' },
  { label:'Chú cáo sa mạc',      type:'ORB',   diagnosis:'Keypoints: 1180\nMatch Score: 88.0%\nTime: 36ms',    imageData:'https://picsum.photos/id/582/400/250', colorCentroid: { r: 170, g: 120, b: 80 }, createdAt:'2024-09-02T10:00:00.000Z' },
  { label:'Con đường đèo núi',      type:'SIFT',  diagnosis:'Keypoints: 2310\nMatch Score: 95.0%\nTime: 62ms',    imageData:'https://picsum.photos/id/619/400/250', colorCentroid: { r: 110, g: 120, b: 110 }, createdAt:'2024-09-08T10:00:00.000Z' },
  { label:'Quả việt quất tươi',     type:'COLOR', diagnosis:'Dominant: Green (40%), White (30%)\nMatch Score: 90.8%\nTime: 12ms', imageData:'https://picsum.photos/id/674/400/250', colorCentroid: { r: 80, g: 80, b: 110 }, createdAt:'2024-09-15T10:00:00.000Z' },
  { label:'Máy ảnh cơ cổ điển',      type:'ORB',   diagnosis:'Keypoints: 1350\nMatch Score: 90.2%\nTime: 35ms',    imageData:'https://picsum.photos/id/250/400/250', colorCentroid: { r: 70, g: 70, b: 70 }, createdAt:'2024-09-22T10:00:00.000Z' },
  { label:'Điện thoại thông minh',     type:'CNN',   diagnosis:'ResNet50 Vector: [0.11, 0.67...]\nMatch Score: 97.9%\nTime: 112ms', imageData:'https://picsum.photos/id/160/400/250', colorCentroid: { r: 210, g: 210, b: 210 }, createdAt:'2024-09-29T10:00:00.000Z' },
];


// ── Init ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Chart.js Global Defaults
    if (window.Chart) {
      Chart.defaults.font.family = "'Outfit', sans-serif";
      Chart.defaults.font.size = 13;
      Chart.defaults.color = '#94a3b8'; // Lighter text for dark mode
      Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b';
      Chart.defaults.plugins.tooltip.padding = 12;
      Chart.defaults.plugins.tooltip.borderRadius = 8;
      Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: 'bold' };
    }

    await loadRecords();
    if (allRecords.length === 0) await seedSamples();
    setupNav();
    setupModal();
    setupFilters();
    setupScrollTop();
    setupArena();
  } catch (err) {
    console.error('Init error:', err);
  }
});


// ── Data ─────────────────────────────────────────────────────────────────
async function loadRecords() {
  allRecords = await Database.getAllRecords();
  renderCards();
  updateStats();
}

async function seedSamples() {
  for (const s of SAMPLES) {
    // mapping patientName -> label for db.js compatibility without modifying db.js heavily
    await Database.saveRecord({
      patientName: s.label,
      type: s.type,
      diagnosis: s.diagnosis,
      imageData: s.imageData,
      createdAt: s.createdAt
    });
  }
  await loadRecords();
}

// ── Render cards ─────────────────────────────────────────────────────────
function renderCards() {
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  const list = allRecords.filter(r => {
    const okSearch = !term || r.patientName.toLowerCase().includes(term);
    const okFilter = activeFilter === 'all' || r.type === activeFilter;
    return okSearch && okFilter;
  });

  if (!list.length) {
    recordsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:#64748b">Không tìm thấy ảnh phù hợp.</div>';
    return;
  }

  recordsGrid.innerHTML = list.map((r, i) => {
    const color  = typeColor(r.type);
    const date   = new Date(r.createdAt).toLocaleDateString('vi-VN');
    const fallback = 'https://placehold.co/400x220/1e293b/94a3b8?text=' + r.type;
    // Extract score from diagnosis string if possible
    let scoreMatch = r.diagnosis.match(/Match Score: ([\d.]+)%/);
    let score = scoreMatch ? scoreMatch[1] + '%' : 'N/A';
    
    return `
      <div class="record-card" onclick="openDetail(${r.id})" style="animation-delay: ${i * 0.05}s">
        <div class="record-thumb">
          <img src="${r.imageData}" alt="${r.patientName}" loading="lazy" onerror="this.src='${fallback}'">
          <span class="record-type-badge" style="background:${color}">${r.type}</span>
          <span class="record-score-badge">Độ chính xác: ${score}</span>
        </div>
        <div class="record-info">
          <h3>${r.patientName}</h3>
          <p style="font-family: monospace; font-size: 0.85em; color: var(--text-muted);">${r.diagnosis.split('\\n')[0]}</p>
          <div class="record-meta"><span>${date}</span><span>IMG_ID: #${r.id}</span></div>
        </div>
      </div>`;
  }).join('');

  
  // Re-create icons if any new ones were added
  if (window.lucide) window.lucide.createIcons();
}

// ── Detail Modal Logic ───────────────────────────────────────────────────
window.openDetail = (id) => {
  const record = allRecords.find(r => r.id === id);
  if (!record) return;

  detailImage.src = record.imageData;
  detailType.textContent = record.type;
  detailType.style.background = typeColor(record.type);
  detailPatientName.textContent = record.patientName;
  detailDate.textContent = 'Truy vấn lúc: ' + new Date(record.createdAt).toLocaleString('vi-VN');
  
  // Format diagnosis text properly
  detailDiagnosis.innerHTML = record.diagnosis.replace(/\n/g, '<br>');
  detailId.textContent = 'SQL_ID: ' + record.id + ' | Vector_ID: V' + (record.id * 1024 + 5);

  // Clear previous keypoints
  const kpContainer = document.getElementById('keypointsContainer');
  if (kpContainer) {
    kpContainer.innerHTML = '';
    
    // Draw mock keypoints if algorithm is SIFT, ORB, or CNN
    if (record.type === 'SIFT' || record.type === 'ORB' || record.type === 'CNN') {
      const numPoints = record.type === 'SIFT' ? 60 : (record.type === 'ORB' ? 40 : 25);
      const color = typeColor(record.type);
      for (let i = 0; i < numPoints; i++) {
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.width = record.type === 'CNN' ? '12px' : '6px';
        dot.style.height = record.type === 'CNN' ? '12px' : '6px';
        dot.style.borderRadius = '50%';
        dot.style.background = color;
        dot.style.color = color;
        dot.style.border = `1px solid #fff`;
        dot.style.opacity = Math.random() * 0.7 + 0.3;
        
        // Random position on the image canvas
        dot.style.left = `${Math.random() * 80 + 10}%`;
        dot.style.top = `${Math.random() * 80 + 10}%`;
        
        dot.classList.add('keypoint-pulse');
        // Random animation delay to make them desynchronized
        dot.style.animationDelay = `${Math.random() * 2}s`;
        
        // Detailed hover tooltip simulating OpenCV data
        dot.title = `Điểm đặc trưng OpenCV #${i+1}\nx: ${(Math.random() * 400).toFixed(1)} px\ny: ${(Math.random() * 250).toFixed(1)} px\nKích thước: ${(Math.random() * 15 + 5).toFixed(1)} px\nGóc xoay: ${Math.floor(Math.random() * 360)}°\nThuật toán: ${record.type}`;
        
        kpContainer.appendChild(dot);
      }
    }
  }

  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (confirm(`Bạn có chắc chắn muốn xóa ảnh "${record.patientName}" khỏi Cơ sở dữ liệu?`)) {
        await Database.deleteRecord(record.id);
        closeDetail();
        await loadRecords();
      }
    };
  }

  detailModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

const closeDetail = () => {
  detailModal.style.display = 'none';
  document.body.style.overflow = '';
};

if (closeDetailModal) closeDetailModal.addEventListener('click', closeDetail);
detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetail(); });


// ── Stats ─────────────────────────────────────────────────────────────────
function updateStats() {
  const count = t => allRecords.filter(r => r.type === t).length;
  document.getElementById('totalRecords').textContent = allRecords.length;
  document.getElementById('countSift').textContent    = count('SIFT');
  document.getElementById('countOrb').textContent     = count('ORB');
  document.getElementById('countColor').textContent      = count('COLOR');
}

// ── Navigation ────────────────────────────────────────────────────────────
function setupNav() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
      const view = document.getElementById(item.dataset.view + 'View');
      if (view) view.style.display = 'block';
      if (item.dataset.view === 'analytics') buildCharts();
    });
  });
}

// ── Modal ─────────────────────────────────────────────────────────────────
function setupModal() {
  const open  = () => { uploadModal.style.display = 'flex'; };
  const close = () => { uploadModal.style.display = 'none'; uploadForm.reset(); };

  uploadBtn.addEventListener('click', open);
  if (closeModal) closeModal.addEventListener('click', close);
  if (cancelBtn)  cancelBtn.addEventListener('click', close);
  uploadModal.addEventListener('click', e => { if (e.target === uploadModal) close(); });

  uploadForm.addEventListener('submit', async e => {
    e.preventDefault();
    const file = document.getElementById('imageFile').files[0];
    if (!file) return;
    const reader = new FileReader();
    
    // Simulate feature extraction delay
    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Đang phân tích (OpenCV)...';
    submitBtn.disabled = true;

    setTimeout(async () => {
      reader.onload = async () => {
        const type = document.getElementById('scanType').value;
        const keypoints = Math.floor(Math.random() * 2000) + 500;
        const matchScore = (Math.random() * 20 + 80).toFixed(1);
        const time = Math.floor(Math.random() * 100) + 10;
        
        let diagText = `Keypoints: ${keypoints}\\nMatch Score: ${matchScore}%\\nTime: ${time}ms`;
        if(type === 'COLOR') diagText = `Color Histogram extracted\\nMatch Score: ${matchScore}%\\nTime: ${time}ms`;
        if(type === 'CNN') diagText = `ResNet50 Vector generated\\nMatch Score: ${matchScore}%\\nTime: ${time + 50}ms`;

        await Database.saveRecord({
          patientName: document.getElementById('patientName').value.trim() || 'Truy vấn người dùng ' + Math.floor(Math.random()*1000),
          type:        type,
          diagnosis:   diagText,
          imageData:   reader.result,
        });
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        close();
        await loadRecords();
      };
      reader.readAsDataURL(file);
    }, 1500);
  });
}

// ── Filters & Search ──────────────────────────────────────────────────────
function setupFilters() {
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderCards();
    });
  });
  
  const sampleLinks = document.querySelectorAll('.sample-link');
  sampleLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filterVal = link.dataset.filter;
      
      // Switch active nav to dashboard
      const dashboardTab = document.querySelector('.nav-item[data-view="dashboard"]');
      if (dashboardTab) {
        dashboardTab.click();
      }
      
      // Select corresponding filter chip
      const targetChip = Array.from(filterChips).find(c => c.dataset.filter === filterVal);
      if (targetChip) {
        targetChip.click();
      }
      
      // Scroll to top of dashboard view
      const targetSec = document.getElementById('dashboardView');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (searchInput) searchInput.addEventListener('input', renderCards);
}

// ── Scroll Top ────────────────────────────────────────────────────────────
function setupScrollTop() {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 250);
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Charts ────────────────────────────────────────────────────────────────
function buildCharts() {
  const sift = allRecords.filter(r => r.type === 'SIFT').length;
  const orb  = allRecords.filter(r => r.type === 'ORB').length;
  const color   = allRecords.filter(r => r.type === 'COLOR').length;
  const cnn   = allRecords.filter(r => r.type === 'CNN').length;

  makeChart('typeChart', 'doughnut', {
    labels: ['SIFT', 'ORB', 'COLOR', 'CNN'],
    datasets: [{ data: [sift, orb, color, cnn], backgroundColor: ['#10b981','#3b82f6','#f59e0b', '#8b5cf6'], borderWidth: 0 }]
  }, { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false });

  // Trend last 7 days (simulating latency ms instead of just count for CBIR)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('vi-VN');
  });
  makeChart('trendChart', 'line', {
    labels: last7,
    datasets: [{ label: 'Độ trễ trung bình (ms)', data: last7.map(() => Math.floor(Math.random()*60)+20), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.35, fill: true }]
  }, { plugins: { legend: { display: false } }, maintainAspectRatio: false });

  // 1. Accuracy Chart (Grouped Bar chart comparing Match Scores)
  const getAvgMatchScore = (type) => {
    const records = allRecords.filter(r => r.type === type);
    if (!records.length) return 0;
    const scores = records.map(r => {
      const match = r.diagnosis.match(/Match Score: ([\d.]+)%/);
      return match ? parseFloat(match[1]) : 0;
    }).filter(s => s > 0);
    if (!scores.length) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const avgSift = getAvgMatchScore('SIFT') || 95.2;
  const avgOrb = getAvgMatchScore('ORB') || 88.4;
  const avgColor = getAvgMatchScore('COLOR') || 91.0;
  const avgCnn = getAvgMatchScore('CNN') || 98.7;

  makeChart('accuracyChart', 'bar', {
    labels: ['SIFT', 'ORB', 'COLOR', 'CNN'],
    datasets: [{
      label: 'Match Score trung bình (%)',
      data: [avgSift, avgOrb, avgColor, avgCnn],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      borderRadius: 8
    }]
  }, {
    plugins: { legend: { display: false } },
    scales: { y: { min: 50, max: 100, ticks: { stepSize: 10 } } },
    maintainAspectRatio: false
  });

  // 2. Performance Comparison Radar Chart
  makeChart('radarChart', 'radar', {
    labels: ['Độ chính xác', 'Tốc độ trích xuất', 'Dung lượng lưu trữ', 'Robust với Xoay', 'Robust với Thu phóng'],
    datasets: [
      {
        label: 'SIFT',
        data: [8, 4, 3, 9, 9],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2
      },
      {
        label: 'ORB',
        data: [7, 9, 8, 8, 6],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2
      },
      {
        label: 'COLOR',
        data: [5, 10, 10, 10, 2],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2
      },
      {
        label: 'CNN',
        data: [10, 3, 2, 7, 10],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2
      }
    ]
  }, {
    plugins: { legend: { position: 'right' } },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#94a3b8', font: { size: 11 } },
        ticks: { backdropColor: 'transparent', color: '#94a3b8', showLabelBackdrop: false, stepSize: 2 },
        min: 0,
        max: 10
      }
    },
    maintainAspectRatio: false
  });

  // Frequency top 8 labels
  const freq = {};
  allRecords.forEach(r => { const k = r.patientName.slice(0, 30); freq[k] = (freq[k] || 0) + 1; });
  const top8 = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  makeChart('freqChart', 'bar', {
    labels: top8.map(e => e[0]),
    datasets: [{ data: top8.map(e => e[1]), backgroundColor: '#3b82f6', borderRadius: 6 }]
  }, { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { stepSize: 1 } } }, maintainAspectRatio: false });

  // Summary table
  const tbody = document.getElementById('summaryTableBody');
  if (tbody) {
    tbody.innerHTML = allRecords.slice().reverse().map((r, i) => {
      const bg   = typeColor(r.type);
      const date = new Date(r.createdAt).toLocaleDateString('vi-VN');
      // Extract keypoints info
      const diag = r.diagnosis.split('\\n')[0];
      return `<tr>
        <td>${i + 1}</td>
        <td>${r.patientName}</td>
        <td><span class="type-pill" style="background:${bg}">${r.type}</span></td>
        <td>${diag}</td>
        <td>${date}</td>
      </tr>`;
    }).join('');
  }
}

function makeChart(id, type, data, opts) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(el.getContext('2d'), { type, data, options: opts });
}

// ── Algorithm Arena Logic ────────────────────────────────────────────────
function setupArena() {
  const arenaForm = document.getElementById('arenaForm');
  const arenaScanning = document.getElementById('arenaScanning');
  const arenaGrid = document.getElementById('arenaGrid');
  const arenaQueryPreview = document.getElementById('arenaQueryPreview');
  const arenaQueryImg = document.getElementById('arenaQueryImg');
  
  if (!arenaForm) return;
  
  arenaForm.addEventListener('submit', e => {
    e.preventDefault();
    const file = document.getElementById('arenaFile').files[0];
    const topN = parseInt(document.getElementById('arenaTopN').value) || 3;
    if (!file) return;
    
    // Read and show query preview image
    const reader = new FileReader();
    reader.onload = function(evt) {
      if (arenaQueryImg) arenaQueryImg.src = evt.target.result;
      if (arenaQueryPreview) arenaQueryPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Show scanning
    arenaScanning.style.display = 'block';
    arenaGrid.style.display = 'none';
    
    // Refresh lucide icon in scanning view
    if (window.lucide) window.lucide.createIcons();
    
    // Perform dynamic color-based & keyword-based CBIR matching on the uploaded image!
    const tempImg = new Image();
    tempImg.onload = () => {
      // Create hidden canvas to analyze dominant color
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(tempImg, 0, 0, 10, 10);
      const imgData = ctx.getImageData(0, 0, 10, 10).data;
      
      let rSum = 0, gSum = 0, bSum = 0;
      for (let i = 0; i < imgData.length; i += 4) {
        rSum += imgData[i];
        gSum += imgData[i+1];
        bSum += imgData[i+2];
      }
      const r = rSum / 100;
      const g = gSum / 100;
      const b = bSum / 100;
      const queryColor = { r, g, b };
      
      // Determine query category
      let category = 'neutral';
      const filename = (file.name || '').toLowerCase();
      
      if (filename.includes('flower') || filename.includes('hoa') || filename.includes('rose') || filename.includes('blossom') || filename.includes('pink') || (r > 130 && g < 150)) {
        category = 'flower';
      } else if (filename.includes('forest') || filename.includes('tree') || filename.includes('mountain') || filename.includes('rung') || filename.includes('canh') || (g > r && g > b)) {
        category = 'nature';
      } else if (filename.includes('dog') || filename.includes('cat') || filename.includes('pet') || filename.includes('cho') || filename.includes('meo') || filename.includes('gau') || filename.includes('fox') || filename.includes('husky')) {
        category = 'animal';
      } else if (filename.includes('car') || filename.includes('xe') || filename.includes('road') || filename.includes('duong')) {
        category = 'vehicle';
      } else if (b > r && b > g) {
        category = 'blue';
      }
      
      setTimeout(() => {
        // Hide scanning, show grid
        arenaScanning.style.display = 'none';
        arenaGrid.style.display = 'grid';
        
        // Render SIFT
        renderArenaColumn('sift', 'SIFT', topN, 42, category, queryColor, allRecords);
        // ORB
        renderArenaColumn('orb', 'ORB', topN, 6, category, queryColor, allRecords);
        // COLOR
        renderArenaColumn('color', 'COLOR', topN, 2, category, queryColor, allRecords);
        // CNN
        renderArenaColumn('cnn', 'CNN', topN, 115, category, queryColor, allRecords);
        
        if (window.lucide) window.lucide.createIcons();
      }, 1500);
    };
    tempImg.src = URL.createObjectURL(file);
  });
}

function renderArenaColumn(colId, type, topN, time, category, queryColor, recordsList) {
  const resultsContainer = document.getElementById(`${colId}ArenaResults`);
  const statsContainer = document.getElementById(`${colId}ArenaStats`);
  
  if (!resultsContainer || !statsContainer) return;
  
  // Score and sort all database records based on how well they match the query category, color centroid, and algorithm!
  const scored = recordsList.map(rec => {
    // 1. Calculate color similarity using 3D Euclidean distance
    const recColor = rec.colorCentroid || { r: 120, g: 120, b: 120 };
    const dist = Math.sqrt(
      Math.pow(queryColor.r - recColor.r, 2) +
      Math.pow(queryColor.g - recColor.g, 2) +
      Math.pow(queryColor.b - recColor.b, 2)
    );
    // Base score from color proximity (max dist ~442)
    let score = 95 - (dist / 441.67) * 45; // range: 50% to 95%
    
    // 2. Add keyword category semantic weight
    const label = (rec.patientName || '').toLowerCase();
    let semanticBonus = 0;
    
    if (category === 'flower') {
      if (label.includes('hoa') || label.includes('anh đào')) {
        semanticBonus = 12;
      } else if (label.includes('chó') || label.includes('husky') || label.includes('gấu') || label.includes('cáo')) {
        // Penalty for incorrect category to prevent non-flower from randomly overtaking!
        semanticBonus = -20;
      }
    } else if (category === 'nature') {
      if (label.includes('phong cảnh') || label.includes('rừng') || label.includes('núi') || label.includes('đèo')) {
        semanticBonus = 12;
      } else if (label.includes('chó') || label.includes('typewriter') || label.includes('điện thoại')) {
        semanticBonus = -20;
      }
    } else if (category === 'animal') {
      if (label.includes('chó') || label.includes('husky') || label.includes('pug') || label.includes('cáo') || label.includes('gấu')) {
        semanticBonus = 12;
      } else if (label.includes('hoa') || label.includes('sa mạc') || label.includes('lối đi')) {
        semanticBonus = -20;
      }
    } else if (category === 'vehicle') {
      if (label.includes('xe') || label.includes('ô tô') || label.includes('đường đèo')) {
        semanticBonus = 12;
      } else if (label.includes('gấu') || label.includes('hoa') || label.includes('trà')) {
        semanticBonus = -20;
      }
    } else if (category === 'blue') {
      if (label.includes('hồ nước') || label.includes('xanh') || label.includes('việt quất')) {
        semanticBonus = 12;
      }
    }
    
    score += semanticBonus;
    
    // 3. Algorithm-specific tuning & tiny random variance for dynamic feel
    let algoBonus = 0;
    if (type === 'SIFT' && rec.type === 'SIFT') algoBonus += 2;
    if (type === 'ORB' && rec.type === 'ORB') algoBonus += 2;
    if (type === 'COLOR' && rec.type === 'COLOR') algoBonus += 4;
    if (type === 'CNN' && rec.type === 'CNN') algoBonus += 2;
    
    score += algoBonus;
    
    // Very small random variance (only 2%) to prevent ranking instability!
    const finalScore = Math.min(99.9, Math.max(10.0, score + Math.random() * 2));
    
    return { rec, score: finalScore };
  });
  
  // Sort descending
  scored.sort((a, b) => b.score - a.score);
  const matched = scored.slice(0, topN);
  
  // Calculate exact average score of displayed matches
  const matchAvg = (matched.reduce((sum, item) => sum + item.score, 0) / topN).toFixed(1);
  statsContainer.textContent = `Trễ: ${time}ms | Match: ${matchAvg}%`;
  
  // Render cards
  resultsContainer.innerHTML = matched.map((item) => {
    const r = item.rec;
    return `
      <div class="arena-card" onclick="openDetail(${r.id})">
        <div class="arena-card-thumb">
          <img src="${r.imageData}" alt="${r.patientName}">
        </div>
        <div class="arena-card-info">
          <h5>${r.patientName}</h5>
          <p>Độ khớp: ${item.score.toFixed(1)}%</p>
        </div>
      </div>
    `;
  }).join('');
}
