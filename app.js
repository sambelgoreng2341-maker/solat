// =========================================================================
// KONFIGURASI API GOOGLE APPS SCRIPT
// =========================================================================
// Wajib Diisi: Ganti string kosong di bawah dengan URL Web App dari Google Apps Script Anda.
// Contoh: "https://script.google.com/macros/s/AKfycby.../exec"
const GAS_URL = "https://script.google.com/macros/s/AKfycbx7_PAQsN5vQ3UZQRIKQq7uUoUbusoTZAOlza_dsJgW2VaMNY02g-h9C-B9cKP4-KfyWw/exec";

// --- INTEGRASI PENGAMAN PREVIEW MODE (MOCKING DATABASE API) ---
const googleMock = {
  getInitialData: function() {
    return {
      success: true,
      students: [
        { nisn: "2023005", nama: "Muhammad Ghaisan As Sakhiy", kelas: "Kelas 10", kamar: "Lantai 2" },
        { nisn: "2023006", nama: "Muhammad Syaifulloh", kelas: "Kelas 10", kamar: "Lantai 2" },
        { nisn: "2024001", nama: "Abdul Azis Marwan Baraba", kelas: "Kelas 9", kamar: "Lantai 2" },
        { nisn: "2024002", nama: "Adiwangsa Widyatna", kelas: "Kelas 9", kamar: "Lantai 1" },
        { nisn: "2024003", nama: "Affan Al Faris", kelas: "Kelas 9", kamar: "Lantai 1" },
        { nisn: "2024004", nama: "Akmal Javas Naraya", kelas: "Kelas 9", kamar: "Lantai 1" },
        { nisn: "2024005", nama: "Arya Hanif Haithami", kelas: "Kelas 9", kamar: "Lantai 2" },
        { nisn: "2024006", nama: "Fahri Naufal Altof", kelas: "Kelas 9", kamar: "Lantai 1" },
        { nisn: "2024007", nama: "Faith Shalahuddin Taufichin", kelas: "Kelas 9", kamar: "Lantai 1" },
        { nisn: "2024008", nama: "Haidar Hafidz Sa'dan Zuhda", kelas: "Kelas 9", kamar: "Lantai 1" },
        { nisn: "2024009", nama: "Iqbal Ali Mukti", kelas: "Kelas 9", kamar: "Lantai 2" }
      ],
      history: [
        { timestamp: "2026-07-17 04:45:00", nisn: "2023005", nama: "Muhammad Ghaisan As Sakhiy", kelas: "Kelas 10", kamar: "Lantai 2", waktuShalat: "Subuh", statusKehadiran: "Hadir", terlambat: "Tidak", seragamLengkap: "Ya", menghormatiMasjid: "Ya", catatanPerilaku: "Datang sebelum adzan subuh." },
        { timestamp: "2026-07-17 04:46:12", nisn: "2023006", nama: "Muhammad Syaifulloh", kelas: "Kelas 10", kamar: "Lantai 2", waktuShalat: "Subuh", statusKehadiran: "Hadir", terlambat: "Ya", seragamLengkap: "Ya", menghormatiMasjid: "Ya", catatanPerilaku: "Terlambat takbiratul ihram." },
        { timestamp: "2026-07-17 04:47:01", nisn: "2024001", nama: "Abdul Azis Marwan Baraba", kelas: "Kelas 9", kamar: "Lantai 2", waktuShalat: "Subuh", statusKehadiran: "Hadir", terlambat: "Tidak", seragamLengkap: "Ya", menghormatiMasjid: "Tidak", catatanPerilaku: "Bercanda setelah shalat selesai." },
        { timestamp: "2026-07-17 04:47:45", nisn: "2024002", nama: "Adiwangsa Widyatna", kelas: "Kelas 9", kamar: "Lantai 1", waktuShalat: "Subuh", statusKehadiran: "Sakit", terlambat: "Tidak", seragamLengkap: "Tidak", menghormatiMasjid: "Ya", catatanPerilaku: "Sakit demam tinggi di kamar." },
        { timestamp: "2026-07-17 12:15:00", nisn: "2023005", nama: "Muhammad Ghaisan As Sakhiy", kelas: "Kelas 10", kamar: "Lantai 2", waktuShalat: "Dzuhur", statusKehadiran: "Hadir", terlambat: "Tidak", seragamLengkap: "Ya", menghormatiMasjid: "Ya", catatanPerilaku: "" },
        { timestamp: "2026-07-17 12:15:45", nisn: "2024003", nama: "Affan Al Faris", kelas: "Kelas 9", kamar: "Lantai 1", waktuShalat: "Dzuhur", statusKehadiran: "Alpa", terlambat: "Tidak", seragamLengkap: "Tidak", menghormatiMasjid: "Tidak", catatanPerilaku: "Alpa (Tanpa Keterangan)" }
      ]
    };
  },
  saveBulkAttendance: function(records, waktu, tgl) {
    return { success: true, count: records.length };
  }
};

// Wrapper Fetch API untuk memanggil Google Apps Script
const backend = {
  run: async function(methodName, successCallback, failureCallback, ...args) {
    if (!GAS_URL || GAS_URL === "") {
      console.warn("⚠️ GAS_URL masih kosong. Menggunakan data dummy lokal.");
      setTimeout(() => {
        try {
          let result;
          if (methodName === 'getInitialData') {
            result = googleMock.getInitialData();
          } else if (methodName === 'saveBulkAttendance') {
            result = googleMock.saveBulkAttendance(...args);
          }
          if (successCallback) successCallback(result);
        } catch (err) {
          if (failureCallback) failureCallback(err);
        }
      }, 800);
      return;
    }

    // Eksekusi HTTP POST ke Google Apps Script Web App
    try {
      let payload = { action: methodName };
      if (methodName === 'saveBulkAttendance') {
        payload.records = args[0];
        payload.waktuShalat = args[1];
        payload.tanggal = args[2];
      }

      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Hindari preflight CORS error di GAS
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (successCallback) successCallback(result);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (failureCallback) failureCallback(err);
    }
  }
};

// State Penyimpanan Data di Client
let state = {
  students: [],
  history: [],
  kelasOptions: [],
  kamarOptions: []
};

// Referensi Chart Instance agar bisa di-update
let barChartInstance = null;
let pieChartInstance = null;

// Load Data awal saat halaman pertama dibuka
window.onload = function() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date-info').innerHTML = `<i class="fa-regular fa-calendar-days mr-1.5"></i>` + new Date().toLocaleDateString('id-ID', options);
  
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const localISODate = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  document.getElementById('input-tanggal').value = localISODate;

  if (!GAS_URL) {
    showToast("Mode Preview", "GAS_URL belum diisi. Menggunakan data mock/dummy.", "error");
  }

  fetchInitialData();
};

/**
 * Memanggil database santri & riwayat
 */
function fetchInitialData() {
  showLoading(true);
  const refreshIcon = document.getElementById('btn-icon-refresh');
  if (refreshIcon) refreshIcon.classList.add('animate-spin');

  backend.run('getInitialData', 
    function(response) {
      showLoading(false);
      if (refreshIcon) refreshIcon.classList.remove('animate-spin');
      
      if (response.success) {
        state.students = response.students || [];
        state.history = response.history || [];
        
        state.students.sort((a, b) => a.nama.localeCompare(b.nama));
        
        extractFilterOptions();
        populateFilterDropdowns();
        renderDashboard();
        renderBulkInputGrid();
        renderReportTable();
        populateStudentDropdownForReport();
        renderPeriodicSummary();
        
        showToast("Sinkronisasi Selesai", "Data santri & riwayat absensi terbaru berhasil dimuat.", "success");
      } else {
        showToast("Gagal memuat data", response.error, "error");
      }
    },
    function(err) {
      showLoading(false);
      if (refreshIcon) refreshIcon.classList.remove('animate-spin');
      showToast("Error Sistem", err.message, "error");
    }
  );
}

/**
 * Ekstraksi pilihan Kelas dan Kamar unik untuk dropdown filter
 */
function extractFilterOptions() {
  const kelasSet = new Set();
  const kamarSet = new Set();
  
  state.students.forEach(s => {
    if (s.kelas) kelasSet.add(s.kelas);
    if (s.kamar) kamarSet.add(s.kamar);
  });
  
  state.kelasOptions = Array.from(kelasSet).sort();
  state.kamarOptions = Array.from(kamarSet).sort();
}

/**
 * Mengisi dropdown filter
 */
function populateFilterDropdowns() {
  const fillDropdown = (elId, options) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = el.options[0].outerHTML;
    options.forEach(opt => {
      const newOpt = document.createElement('option');
      newOpt.value = opt;
      newOpt.textContent = opt;
      el.appendChild(newOpt);
    });
  };
  
  fillDropdown('input-filter-kelas', state.kelasOptions);
  fillDropdown('input-filter-kamar', state.kamarOptions);
  fillDropdown('report-filter-kelas', state.kelasOptions);
  fillDropdown('rekap-filter-kelas', state.kelasOptions);
  fillDropdown('rekap-filter-kamar', state.kamarOptions);
  fillDropdown('dash-filter-kelas', state.kelasOptions);
  fillDropdown('dash-filter-kamar', state.kamarOptions);
}

/**
 * Navigasi tab UI Utama
 */
function switchTab(tabName) {
  const tabs = ['dashboard', 'input', 'laporan'];
  tabs.forEach(t => {
    document.getElementById(`tab-${t}`).classList.add('hidden');
    const btn = document.getElementById(`btn-tab-${t}`);
    btn.className = "flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-bold rounded-xl transition duration-150 text-center text-gray-500 hover:bg-slate-50 flex items-center justify-center gap-2";
  });

  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`btn-tab-${tabName}`);
  activeBtn.className = "flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-bold rounded-xl transition duration-150 text-center bg-emerald-600 text-white shadow-sm flex items-center justify-center gap-2";

  if (tabName === 'dashboard') {
    renderDashboard();
  }
}

/**
 * Navigasi Sub-Tab Laporan
 */
function switchReportSubTab(subTabName) {
  const subTabs = ['log', 'individu', 'rekap'];
  subTabs.forEach(st => {
    document.getElementById(`subtab-content-${st}`).classList.add('hidden');
    const btn = document.getElementById(`subbtn-${st}`);
    btn.className = "px-4 py-3 text-xs md:text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-emerald-600 flex items-center gap-2";
  });

  document.getElementById(`subtab-content-${subTabName}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`subbtn-${subTabName}`);
  activeBtn.className = "px-4 py-3 text-xs md:text-sm font-semibold border-b-2 border-emerald-600 text-emerald-600 flex items-center gap-2";

  if (subTabName === 'individu') {
    renderIndividualReport();
  } else if (subTabName === 'rekap') {
    renderPeriodicSummary();
  }
}

// ================= STREAMING_CHUNK: Mengolah dashboard dan statistik =================
function renderDashboard() {
  const dateFilterEl = document.getElementById('dash-filter-tanggal');
  const classFilterEl = document.getElementById('dash-filter-kelas');
  const roomFilterEl = document.getElementById('dash-filter-kamar');
  
  if (!dateFilterEl.value) {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    dateFilterEl.value = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  }
  
  const dateFilter = dateFilterEl.value;
  const classFilter = classFilterEl ? classFilterEl.value : '';
  const roomFilter = roomFilterEl ? roomFilterEl.value : '';

  const filteredStudents = state.students.filter(s => {
    return (!classFilter || s.kelas === classFilter) && (!roomFilter || s.kamar === roomFilter);
  });
  
  document.getElementById('stat-total-santri').textContent = filteredStudents.length;

  const todayLogs = state.history.filter(log => {
    return (!dateFilter || (log.timestamp && log.timestamp.startsWith(dateFilter))) &&
           (!classFilter || log.kelas === classFilter) &&
           (!roomFilter || log.kamar === roomFilter);
  });
  
  const totalAbsenToday = todayLogs.length;

  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;
  let terlambatCount = 0;
  let seragamRapiCount = 0;
  let adabSopanCount = 0;

  todayLogs.forEach(log => {
    if (log.statusKehadiran === 'Hadir') {
      hadirCount++;
      if (log.terlambat === 'Ya') terlambatCount++;
      if (log.seragamLengkap === 'Ya') seragamRapiCount++;
      if (log.menghormatiMasjid === 'Ya') adabSopanCount++;
    } else if (log.statusKehadiran === 'Sakit') {
      sakitCount++;
    } else if (log.statusKehadiran === 'Izin') {
      izinCount++;
    } else if (log.statusKehadiran === 'Alpa') {
      alpaCount++;
    }
  });

  const presentaseHadir = totalAbsenToday > 0 ? Math.round((hadirCount / totalAbsenToday) * 100) : 0;
  document.getElementById('stat-kehadiran-hari-ini').textContent = `${presentaseHadir}%`;
  document.getElementById('stat-alpa-hari-ini').textContent = alpaCount;
  document.getElementById('stat-sakit-izin-hari-ini').textContent = sakitCount + izinCount;

  const ctxPie = document.getElementById('chartKehadiran').getContext('2d');
  if (pieChartInstance) {
    pieChartInstance.destroy();
  }
  
  const chartDataEmpty = (hadirCount + sakitCount + izinCount + alpaCount) === 0;

  pieChartInstance = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: chartDataEmpty ? ['Belum Ada Data'] : ['Hadir', 'Sakit', 'Izin', 'Alpa'],
      datasets: [{
        data: chartDataEmpty ? [1] : [hadirCount, sakitCount, izinCount, alpaCount],
        backgroundColor: chartDataEmpty ? ['#e2e8f0'] : ['#10b981', '#f59e0b', '#3b82f6', '#f43f5e'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11, weight: '600' } }
        }
      },
      cutout: '65%'
    }
  });

  const ctxBar = document.getElementById('chartPerilaku').getContext('2d');
  if (barChartInstance) {
    barChartInstance.destroy();
  }

  const totalHadirLog = hadirCount || 1;
  const persenTepatWaktu = Math.round(((hadirCount - terlambatCount) / totalHadirLog) * 100);
  const persenRapi = Math.round((seragamRapiCount / totalHadirLog) * 100);
  const persenAdab = Math.round((adabSopanCount / totalHadirLog) * 100);

  barChartInstance = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Tepat Waktu', 'Seragam Rapi', 'Adab Masjid Sopan'],
      datasets: [{
        label: 'Persentase Kepatuhan Perilaku (%)',
        data: chartDataEmpty ? [0, 0, 0] : [persenTepatWaktu, persenRapi, persenAdab],
        backgroundColor: ['#6366f1', '#f59e0b', '#14b8a6'],
        borderRadius: 8,
        maxBarThickness: 45
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 10, weight: '600' } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: '700' } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function resetDashFilters() {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  document.getElementById('dash-filter-tanggal').value = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  document.getElementById('dash-filter-kelas').value = '';
  document.getElementById('dash-filter-kamar').value = '';
  renderDashboard();
}

// ================= STREAMING_CHUNK: Membangun Grid Kartu Input Massal =================
function renderBulkInputGrid() {
  const container = document.getElementById('santri-grid-container');
  container.innerHTML = '';
  
  if (state.students.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
        <i class="fa-solid fa-triangle-exclamation text-3xl text-amber-400 mb-2"></i>
        <p class="italic">Database santri kosong. Sila periksa kembali "Sheet1" di Google Sheet Anda.</p>
      </div>`;
    return;
  }
  
  state.students.forEach((santri, index) => {
    const card = document.createElement('div');
    card.setAttribute('data-kelas', santri.kelas || "");
    card.setAttribute('data-kamar', santri.kamar || "");
    card.setAttribute('data-nisn', santri.nisn || "");
    card.setAttribute('data-nama', santri.nama || "");
    card.setAttribute('data-status', "Belum"); // Status awal belum diabsen wajib klik!
    
    card.className = "student-card bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer";
    card.id = `card-santri-${index}`;
    
    card.innerHTML = `
      <!-- Pemilih Status Taktil Sebaris -->
      <div class="mb-3">
        <div class="flex rounded-xl bg-slate-200/70 p-1 gap-1 text-[11px] font-bold shadow-inner">
          <button type="button" onclick="setStudentStatus(${index}, 'Hadir', event)" id="btn-status-hadir-${index}" class="flex-1 py-1.5 rounded-lg transition-all duration-150 text-center text-slate-500 hover:bg-slate-200/50">
            Hadir
          </button>
          <button type="button" onclick="setStudentStatus(${index}, 'Sakit', event)" id="btn-status-sakit-${index}" class="flex-1 py-1.5 rounded-lg transition-all duration-150 text-center text-slate-500 hover:bg-slate-200/50">
            Sakit
          </button>
          <button type="button" onclick="setStudentStatus(${index}, 'Izin', event)" id="btn-status-izin-${index}" class="flex-1 py-1.5 rounded-lg transition-all duration-150 text-center text-slate-500 hover:bg-slate-200/50">
            Izin
          </button>
          <button type="button" onclick="setStudentStatus(${index}, 'Alpa', event)" id="btn-status-alpa-${index}" class="flex-1 py-1.5 rounded-lg transition-all duration-150 text-center text-slate-500 hover:bg-slate-200/50">
            Alpa
          </button>
        </div>
      </div>

      <div class="space-y-1">
        <h4 class="font-bold text-slate-800 text-sm leading-tight">${santri.nama}</h4>
        <p class="text-xs text-slate-400 font-mono">NISN: ${santri.nisn}</p>
        <div class="flex gap-2 text-[10px] font-semibold pt-1">
          <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">${santri.kelas}</span>
          <span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">${santri.kamar}</span>
        </div>
      </div>

      <div id="detail-options-${index}" class="mt-4 pt-3 border-t border-emerald-100 space-y-2.5 hidden">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button type="button" onclick="toggleOption('${index}', 'terlambat', event)" id="btn-terlambat-${index}" data-active="false" class="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition">
            <i class="fa-solid fa-clock"></i> Terlambat
          </button>
          <button type="button" onclick="toggleOption('${index}', 'seragam', event)" id="btn-seragam-${index}" data-active="true" class="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-emerald-500 bg-emerald-50 text-emerald-700 transition">
            <i class="fa-solid fa-shirt"></i> Rapi (Seragam)
          </button>
        </div>

        <button type="button" onclick="toggleOption('${index}', 'adab', event)" id="btn-adab-${index}" data-active="true" class="w-full text-xs flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-emerald-500 bg-emerald-50 text-emerald-700 transition">
          <i class="fa-solid fa-hands-praying"></i> Sopan (Adab Masjid)
        </button>

        <div class="relative">
          <input type="text" id="input-catatan-${index}" placeholder="Tulis Catatan Perilaku..." onclick="event.stopPropagation()" class="row-catatan w-full bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400">
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  filterSantriGrid();
}

// ================= STREAMING_CHUNK: Logika Status Kehadiran (Hidup/Matikan Toggle) =================
let currentStatusFilter = '';

function filterByStatus(status, e) {
  currentStatusFilter = status;
  
  // Update button active state
  const buttons = document.querySelectorAll('.status-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active', 'ring-2', 'ring-offset-2', 'ring-emerald-500');
  });
  
  if (e && e.currentTarget) {
    e.currentTarget.classList.add('active', 'ring-2', 'ring-offset-2', 'ring-emerald-500');
  }
  
  filterSantriGrid();
}

function setStudentStatus(index, status, event) {
  if (event) event.stopPropagation();
  const card = document.getElementById(`card-santri-${index}`);
  const detailContainer = document.getElementById(`detail-options-${index}`);
  
  let targetStatus = status;
  
  card.setAttribute('data-status', targetStatus);
  
  // Reset semua warna segmen tombol ke gaya netral/tidak terpilih
  const statuses = ['Hadir', 'Sakit', 'Izin', 'Alpa'];
  statuses.forEach(s => {
    const btn = document.getElementById(`btn-status-${s.toLowerCase()}-${index}`);
    btn.className = "flex-1 py-1.5 rounded-lg transition-all duration-150 text-center text-slate-500 hover:bg-slate-200/50";
  });
  
  // Ubah gaya warna kartu sesuai status yang aktif (targetStatus)
  if (targetStatus === 'Hadir') {
    card.className = "student-card bg-emerald-50/50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer";
    const activeBtn = document.getElementById(`btn-status-hadir-${index}`);
    activeBtn.className = "flex-1 py-1.5 rounded-lg transition-all duration-150 text-center bg-emerald-600 text-white shadow-sm";
    detailContainer.classList.remove('hidden');
  } else if (targetStatus === 'Sakit') {
    card.className = "student-card bg-amber-50/50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer";
    const activeBtn = document.getElementById(`btn-status-sakit-${index}`);
    activeBtn.className = "flex-1 py-1.5 rounded-lg transition-all duration-150 text-center bg-amber-500 text-white shadow-sm";
    detailContainer.classList.add('hidden');
  } else if (targetStatus === 'Izin') {
    card.className = "student-card bg-blue-50/50 border-2 border-blue-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer";
    const activeBtn = document.getElementById(`btn-status-izin-${index}`);
    activeBtn.className = "flex-1 py-1.5 rounded-lg transition-all duration-150 text-center bg-blue-500 text-white shadow-sm";
    detailContainer.classList.add('hidden');
  } else if (targetStatus === 'Alpa') {
    card.className = "student-card bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-none relative overflow-hidden cursor-pointer opacity-70";
    const activeBtn = document.getElementById(`btn-status-alpa-${index}`);
    activeBtn.className = "flex-1 py-1.5 rounded-lg transition-all duration-150 text-center bg-rose-500 text-white shadow-sm";
    detailContainer.classList.add('hidden');
  } else {
    // Status 'Belum' (Reset/Mati)
    card.className = "student-card bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer";
    detailContainer.classList.add('hidden');
  }
}

/**
 * Memfilter grid kartu santri
 */
function filterSantriGrid() {
  const classVal = document.getElementById('input-filter-kelas').value;
  const roomVal = document.getElementById('input-filter-kamar').value;
  const cards = document.querySelectorAll('#santri-grid-container .student-card');
  
  let count = 0;
  cards.forEach(card => {
    const cClass = card.getAttribute('data-kelas');
    const cRoom = card.getAttribute('data-kamar');
    const cStatus = card.getAttribute('data-status') || 'Belum';
    
    const matchClass = !classVal || cClass === classVal;
    const matchRoom = !roomVal || cRoom === roomVal;
    const matchStatus = !currentStatusFilter || cStatus === currentStatusFilter;
    
    if (matchClass && matchRoom && matchStatus) {
      card.classList.remove('hidden');
      count++;
    } else {
      card.classList.add('hidden');
    }
  });
  
  document.getElementById('santri-filtered-count').textContent = count;
}

/**
 * Mengubah opsi sekunder (Terlambat, Seragam, Adab)
 */
function toggleOption(index, optionType, event) {
  if (event) event.stopPropagation();
  const btn = document.getElementById(`btn-${optionType}-${index}`);
  const isActive = btn.getAttribute('data-active') === 'true';
  const nextState = !isActive;
  
  btn.setAttribute('data-active', nextState ? 'true' : 'false');
  
  if (optionType === 'terlambat') {
    if (nextState) {
      btn.className = "flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-rose-500 bg-rose-50 text-rose-700 transition";
    } else {
      btn.className = "flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition";
    }
  } else { 
    if (nextState) {
      btn.className = "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-emerald-500 bg-emerald-50 text-emerald-700 transition";
      if(optionType === 'adab') {
        btn.className = "w-full text-xs flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-emerald-500 bg-emerald-50 text-emerald-700 transition";
      }
    } else {
      btn.className = "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-amber-500 bg-amber-50/50 text-amber-800 transition";
      if(optionType === 'adab') {
        btn.className = "w-full text-xs flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold border border-amber-500 bg-amber-50/50 text-amber-800 transition";
      }
    }
  }
}

/**
 * Tombol Pintasan Massal: Set Semua Tampil ke Status Tertentu
 */
function toggleAllAttendance(status) {
  const visibleCards = document.querySelectorAll('#santri-grid-container .student-card:not(.hidden)');
  visibleCards.forEach(card => {
    const idParts = card.id.split('-');
    const index = idParts[idParts.length - 1];
    
    const currentStatus = card.getAttribute('data-status') || 'Belum';
    // Hanya ubah jika status saat ini berbeda, untuk menjaga fungsi toggle-click
    if (currentStatus !== status) {
      setStudentStatus(index, status);
    }
  });
}

/**
 * Tombol Pintasan Massal: Mengaktifkan/Menonaktifkan Toggle Terlambat Semua
 */
function toggleAllTerlambat() {
  const btn = document.getElementById('btn-all-terlambat');
  const isActive = btn.getAttribute('data-active') === 'true';
  const nextState = !isActive;
  
  btn.setAttribute('data-active', nextState ? 'true' : 'false');
  
  if (nextState) {
    btn.className = "flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-amber-600 transition duration-150 shadow-sm";
    btn.innerHTML = `<i class="fa-solid fa-clock mr-1"></i> Terlambat Semua (Aktif)`;
  } else {
    btn.className = "flex-1 sm:flex-none bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs px-4 py-2.5 rounded-lg border border-amber-200 transition duration-150";
    btn.innerHTML = `<i class="fa-solid fa-clock mr-1"></i> Terlambat Semua`;
  }

  const visibleCards = document.querySelectorAll('#santri-grid-container .student-card:not(.hidden)');
  visibleCards.forEach(card => {
    const idParts = card.id.split('-');
    const index = idParts[idParts.length - 1];
    
    setStudentStatus(index, 'Hadir');
    
    const terlambatBtn = document.getElementById(`btn-terlambat-${index}`);
    terlambatBtn.setAttribute('data-active', nextState ? 'false' : 'true'); 
    toggleOption(index, 'terlambat');
  });
}

// ================= STREAMING_CHUNK: Menyimpan Absensi Massal ke Google Sheets =================
function submitAttendanceData() {
  const visibleCards = document.querySelectorAll('#santri-grid-container .student-card:not(.hidden)');
  if (visibleCards.length === 0) {
    showToast("Gagal Menyimpan", "Tidak ada santri yang difilter untuk disimpan.", "error");
    return;
  }

  let hasUnassigned = false;
  visibleCards.forEach(card => {
    const currentStatus = card.getAttribute('data-status') || 'Belum';
    if (currentStatus === 'Belum') {
      hasUnassigned = true;
      card.className = "student-card bg-rose-50 border-2 border-dashed border-rose-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden animate-pulse";
    }
  });

  if (hasUnassigned) {
    showToast("Peringatan Absen", "Beberapa santri belum ditentukan status kehadirannya! Mohon klik status Hadir/Sakit/Izin/Alpa terlebih dahulu.", "error");
    return;
  }
  
  const waktuShalat = document.getElementById('input-waktu-shalat').value;
  const tanggal = document.getElementById('input-tanggal').value;
  const records = [];
  
  visibleCards.forEach(card => {
    const idParts = card.id.split('-');
    const idx = idParts[idParts.length - 1];
    
    const status = card.getAttribute('data-status') || 'Hadir';
    const isHadir = (status === 'Hadir');
    const nisn = card.getAttribute('data-nisn');
    const nama = card.getAttribute('data-nama');
    const kelas = card.getAttribute('data-kelas');
    const kamar = card.getAttribute('data-kamar');
    
    const terlambatVal = isHadir ? (document.getElementById(`btn-terlambat-${idx}`).getAttribute('data-active') === 'true' ? 'Ya' : 'Tidak') : 'Tidak';
    const seragamVal = isHadir ? (document.getElementById(`btn-seragam-${idx}`).getAttribute('data-active') === 'true' ? 'Ya' : 'Tidak') : 'Tidak';
    const adabVal = isHadir ? (document.getElementById(`btn-adab-${idx}`).getAttribute('data-active') === 'true' ? 'Ya' : 'Tidak') : 'Tidak';
    
    let catatanVal = '';
    if (isHadir) {
      catatanVal = document.getElementById(`input-catatan-${idx}`).value;
    } else {
      catatanVal = `${status} (Tanpa Keterangan)`;
    }
    
    records.push({
      nisn: nisn,
      nama: nama,
      kelas: kelas,
      kamar: kamar,
      statusKehadiran: status,
      terlambat: terlambatVal,
      seragamLengkap: seragamVal,
      menghormatiMasjid: adabVal,
      catatanPerilaku: catatanVal
    });
  });
  
  showLoading(true, `Menyimpan ${records.length} Absensi Santri...`);
  
  backend.run('saveBulkAttendance',
    function(response) {
      showLoading(false);
      if (response.success) {
        showToast("Penyimpanan Berhasil!", `${response.count} data santri untuk shalat ${waktuShalat} berhasil diunggah ke Google Sheets.`, "success");
        fetchInitialData();
        switchTab('laporan');
        switchReportSubTab('log');
      } else {
        showToast("Gagal Menyimpan", response.error, "error");
      }
    },
    function(err) {
      showLoading(false);
      showToast("Koneksi Error", err.message, "error");
    },
    records, waktuShalat, tanggal
  );
}

// ================= STREAMING_CHUNK: Penyusunan Laporan dan Riwayat Lengkap =================
function renderReportTable() {
  const tbody = document.getElementById('report-table-body');
  tbody.innerHTML = '';
  
  if (state.history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="px-4 py-8 text-center text-gray-400 italic">Belum ada riwayat absensi terekam.</td></tr>`;
    return;
  }
  
  state.history.forEach(log => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50/50 transition duration-150 border-b border-gray-100 py-2 text-xs";
    
    let statusClass = 'bg-green-100 text-green-800';
    if (log.statusKehadiran === 'Sakit') {
      statusClass = 'bg-amber-100 text-amber-800';
    } else if (log.statusKehadiran === 'Izin') {
      statusClass = 'bg-blue-100 text-blue-800';
    } else if (log.statusKehadiran === 'Alpa') {
      statusClass = 'bg-red-100 text-red-800';
    }
                      
    const terlambatClass = log.terlambat === 'Ya' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800';
    const seragamClass = log.seragamLengkap === 'Ya' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800';
    const adabClass = log.menghormatiMasjid === 'Ya' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800';
    
    const isHadir = log.statusKehadiran === 'Hadir';
    
    tr.innerHTML = `
      <td class="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">${log.timestamp}</td>
      <td class="px-4 py-3 font-mono text-gray-700 font-medium">${log.nisn}</td>
      <td class="px-4 py-3 font-semibold text-gray-900">${log.nama}</td>
      <td class="px-4 py-3">${log.kelas} <span class="text-gray-400">(${log.kamar})</span></td>
      <td class="px-4 py-3 font-semibold text-emerald-700">${log.waktuShalat}</td>
      <td class="px-4 py-3 text-center"><span class="${statusClass} px-2 py-0.5 rounded-full font-bold text-[10px]">${log.statusKehadiran}</span></td>
      <td class="px-4 py-3 text-center">${isHadir ? `<span class="${terlambatClass} px-2 py-0.5 rounded-full font-bold text-[10px]">${log.terlambat === 'Ya' ? 'Terlambat' : 'Tepat'}</span>` : '<span class="text-gray-400">-</span>'}</td>
      <td class="px-4 py-3 text-center">${isHadir ? `<span class="${seragamClass} px-2 py-0.5 rounded-full font-bold text-[10px]">${log.seragamLengkap === 'Ya' ? 'Rapi' : 'Krg Rapi'}</span>` : '<span class="text-gray-400">-</span>'}</td>
      <td class="px-4 py-3 text-center">${isHadir ? `<span class="${adabClass} px-2 py-0.5 rounded-full font-bold text-[10px]">${log.menghormatiMasjid === 'Ya' ? 'Sopan' : 'Bising'}</span>` : '<span class="text-gray-400">-</span>'}</td>
      <td class="px-4 py-3 text-gray-600 italic whitespace-normal max-w-xs">${log.catatanPerilaku || '-'}</td>
    `;
    
    tbody.appendChild(tr);
  });
  
  const uniqueKelas = [...new Set(state.history.map(item => item.kelas))].sort();
  const reportKelasSelect = document.getElementById('report-filter-kelas');
  reportKelasSelect.innerHTML = '<option value="">Semua Kelas</option>';
  uniqueKelas.forEach(kelas => {
    if(kelas) {
      const opt = document.createElement('option');
      opt.value = kelas;
      opt.textContent = kelas;
      reportKelasSelect.appendChild(opt);
    }
  });
}

/**
 * Memfilter tabel riwayat dengan Jangka Waktu
 */
function filterReportTable() {
  const searchQuery = document.getElementById('report-search').value.toLowerCase();
  const kelasFilter = document.getElementById('report-filter-kelas').value;
  const shalatFilter = document.getElementById('report-filter-shalat').value;
  const statusFilter = document.getElementById('report-filter-status').value;
  const startDateVal = document.getElementById('report-filter-start-date').value;
  const endDateVal = document.getElementById('report-filter-end-date').value;
  
  const rows = document.querySelectorAll('#report-table-body tr');
  
  rows.forEach(row => {
    const cols = row.getElementsByTagName('td');
    if (cols.length < 10) return;
    
    const timestampDate = cols[0].textContent.substring(0, 10); 
    const nisn = cols[1].textContent.toLowerCase();
    const nama = cols[2].textContent.toLowerCase();
    const kelas = cols[3].textContent;
    const shalat = cols[4].textContent;
    const status = cols[5].textContent;
    
    const matchSearch = !searchQuery || nama.includes(searchQuery) || nisn.includes(searchQuery);
    const matchKelas = !kelasFilter || kelas.includes(kelasFilter);
    const matchShalat = !shalatFilter || shalat === shalatFilter;
    const matchStatus = !statusFilter || status === statusFilter;
    
    let matchDate = true;
    if (startDateVal && timestampDate < startDateVal) matchDate = false;
    if (endDateVal && timestampDate > endDateVal) matchDate = false;
    
    if (matchSearch && matchKelas && matchShalat && matchStatus && matchDate) {
      row.classList.remove('hidden');
    } else {
      row.classList.add('hidden');
    }
  });
}

// ================= STREAMING_CHUNK: Menyusun Analisis Laporan Per-Nama Santri =================
function populateStudentDropdownForReport() {
  const select = document.getElementById('select-report-santri');
  select.innerHTML = '<option value="">-- Pilih Santri --</option>';
  state.students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.nisn;
    opt.textContent = `${s.nama} (${s.kelas})`;
    select.appendChild(opt);
  });
}

function renderIndividualReport() {
  const nisnVal = document.getElementById('select-report-santri').value;
  const modeVal = document.getElementById('select-individual-mode').value;
  const resultBlock = document.getElementById('individual-report-result');
  const emptyBlock = document.getElementById('individual-report-empty');
  const tbody = document.getElementById('individual-table-body');
  const theader = document.getElementById('ind-table-header');
  
  tbody.innerHTML = '';
  
  if (!nisnVal) {
    resultBlock.classList.add('hidden');
    emptyBlock.classList.remove('hidden');
    return;
  }
  
  resultBlock.classList.remove('hidden');
  emptyBlock.classList.add('hidden');
  
  const personalLogs = state.history.filter(h => h.nisn === nisnVal);
  
  let totalLog = personalLogs.length;
  let hadir = 0, sakit = 0, izin = 0, alpa = 0;
  let tepatWaktu = 0, rapi = 0, sopan = 0;
  
  personalLogs.forEach(h => {
    if (h.statusKehadiran === 'Hadir') {
      hadir++;
      if (h.terlambat === 'Tidak') tepatWaktu++;
      if (h.seragamLengkap === 'Ya') rapi++;
      if (h.menghormatiMasjid === 'Ya') sopan++;
    } else if (h.statusKehadiran === 'Sakit') {
      sakit++;
    } else if (h.statusKehadiran === 'Izin') {
      izin++;
    } else if (h.statusKehadiran === 'Alpa') {
      alpa++;
    }
  });
  
  const scoreHadir = totalLog > 0 ? Math.round((hadir / totalLog) * 100) : 0;
  const scoreDisiplin = hadir > 0 ? Math.round((tepatWaktu / hadir) * 100) : 0;
  const scoreSeragam = hadir > 0 ? Math.round((rapi / hadir) * 100) : 0;
  const scoreAdab = hadir > 0 ? Math.round((sopan / hadir) * 100) : 0;
  
  document.getElementById('ind-score-hadir').textContent = `${scoreHadir}%`;
  document.getElementById('ind-score-disiplin').textContent = `${scoreDisiplin}%`;
  document.getElementById('ind-score-seragam').textContent = `${scoreSeragam}%`;
  document.getElementById('ind-score-adab').textContent = `${scoreAdab}%`;

  if (modeVal === 'detail') {
    theader.innerHTML = `
      <th class="px-4 py-2.5 text-left">Waktu Log</th>
      <th class="px-4 py-2.5">Waktu Shalat</th>
      <th class="px-4 py-2.5">Status</th>
      <th class="px-4 py-2.5">Terlambat?</th>
      <th class="px-4 py-2.5">Seragam Rapi?</th>
      <th class="px-4 py-2.5">Adab Masjid?</th>
      <th class="px-4 py-2.5 text-left">Catatan / Keterangan</th>
    `;
    
    if (personalLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-6 text-center text-gray-400 italic">Belum ada riwayat terekam untuk santri ini.</td></tr>`;
      return;
    }
    
    personalLogs.forEach(h => {
      const isHadir = h.statusKehadiran === 'Hadir';
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50 transition text-center";
      tr.innerHTML = `
        <td class="px-4 py-2.5 text-left font-mono text-[11px] text-gray-500">${h.timestamp}</td>
        <td class="px-4 py-2.5 font-bold text-emerald-800">${h.waktuShalat}</td>
        <td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${h.statusKehadiran === 'Hadir' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${h.statusKehadiran}</span></td>
        <td class="px-4 py-2.5">${isHadir ? (h.terlambat === 'Ya' ? '🔴 Ya' : '🟢 Tidak') : '-'}</td>
        <td class="px-4 py-2.5">${isHadir ? (h.seragamLengkap === 'Ya' ? '🟢 Rapi' : '🔴 Tidak') : '-'}</td>
        <td class="px-4 py-2.5">${isHadir ? (h.menghormatiMasjid === 'Ya' ? '🟢 Sopan' : '🔴 Bising') : '-'}</td>
        <td class="px-4 py-2.5 text-left text-gray-500 italic font-medium">${h.catatanPerilaku || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
    
  } else {
    theader.innerHTML = `
      <th class="px-4 py-2.5 text-left">Rentang Waktu</th>
      <th class="px-4 py-2.5">Total Terbaca</th>
      <th class="px-4 py-2.5 text-emerald-600">Hadir</th>
      <th class="px-4 py-2.5 text-blue-600">Sakit</th>
      <th class="px-4 py-2.5 text-amber-600">Izin</th>
      <th class="px-4 py-2.5 text-rose-600">Alpa</th>
      <th class="px-4 py-2.5 text-orange-600">Terlambat</th>
      <th class="px-4 py-2.5">Rasio (%)</th>
    `;

    const groups = {};
    personalLogs.forEach(h => {
      let key = "";
      if (modeVal === 'hari') key = h.timestamp.substring(0, 10);
      else if (modeVal === 'bulan') key = h.timestamp.substring(0, 7);
      else if (modeVal === 'minggu') key = getStartOfWeekString(h.timestamp);
      
      if (!groups[key]) groups[key] = { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 };
      groups[key].total++;
      if (h.statusKehadiran === 'Hadir') {
        groups[key].hadir++;
        if (h.terlambat === 'Ya') groups[key].terlambat++;
      } else if (h.statusKehadiran === 'Sakit') groups[key].sakit++;
      else if (h.statusKehadiran === 'Izin') groups[key].izin++;
      else if (h.statusKehadiran === 'Alpa') groups[key].alpa++;
    });

    const sortedKeys = Object.keys(groups).sort().reverse();
    if (sortedKeys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-gray-400 italic">Belum ada riwayat rekapitulasi.</td></tr>`;
      return;
    }

    sortedKeys.forEach(key => {
      const val = groups[key];
      const rate = val.total > 0 ? Math.round((val.hadir / val.total) * 100) : 0;
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50 transition text-center text-xs";
      tr.innerHTML = `
        <td class="px-4 py-2.5 text-left font-semibold text-gray-700">${key}</td>
        <td class="px-4 py-2.5 font-bold">${val.total} Kali</td>
        <td class="px-4 py-2.5 text-emerald-600 font-bold">${val.hadir}</td>
        <td class="px-4 py-2.5 text-blue-600">${val.sakit}</td>
        <td class="px-4 py-2.5 text-amber-600">${val.izin}</td>
        <td class="px-4 py-2.5 text-rose-600">${val.alpa}</td>
        <td class="px-4 py-2.5 text-orange-600">${val.terlambat}</td>
        <td class="px-4 py-2.5 font-black text-slate-800">${rate}%</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ================= STREAMING_CHUNK: Mengolah Rekapitulasi Berkala Terintegrasi =================
function renderPeriodicSummary() {
  const selectVal = document.getElementById('rekap-period-select').value;
  const kelasFilter = document.getElementById('rekap-filter-kelas').value;
  const kamarFilter = document.getElementById('rekap-filter-kamar').value;
  const tbody = document.getElementById('rekap-table-body');
  const tableTitle = document.getElementById('rekap-table-title');
  
  tbody.innerHTML = '';
  
  let filteredHistory = state.history;
  if (kelasFilter) {
    filteredHistory = filteredHistory.filter(h => h.kelas === kelasFilter);
  }
  if (kamarFilter) {
    filteredHistory = filteredHistory.filter(h => h.kamar === kamarFilter);
  }
  
  if (filteredHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400 italic">Tidak ada riwayat cocok dengan filter.</td></tr>`;
    return;
  }
  
  const summaryMap = {};
  
  filteredHistory.forEach(h => {
    let key = "";
    if (selectVal === 'hari') {
      key = h.timestamp.substring(0, 10);
    } else if (selectVal === 'bulan') {
      key = h.timestamp.substring(0, 7);
    } else if (selectVal === 'minggu') {
      key = getStartOfWeekString(h.timestamp);
    }
    
    if (!summaryMap[key]) {
      summaryMap[key] = { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 };
    }
    
    summaryMap[key].total++;
    if (h.statusKehadiran === "Hadir") {
      summaryMap[key].hadir++;
      if (h.terlambat === "Ya") summaryMap[key].terlambat++;
    } else if (h.statusKehadiran === "Sakit") {
      summaryMap[key].sakit++;
    } else if (h.statusKehadiran === "Izin") {
      summaryMap[key].izin++;
    } else if (h.statusKehadiran === "Alpa") {
      summaryMap[key].alpa++;
    }
  });
  
  const sortedKeys = Object.keys(summaryMap).sort().reverse();
  
  if (selectVal === 'hari') {
    tableTitle.innerHTML = `<i class="fa-solid fa-chart-line text-emerald-600"></i> Rekapitulasi Kehadiran Harian`;
  } else if (selectVal === 'minggu') {
    tableTitle.innerHTML = `<i class="fa-solid fa-chart-line text-emerald-600"></i> Rekapitulasi Kehadiran Mingguan`;
  } else {
    tableTitle.innerHTML = `<i class="fa-solid fa-chart-line text-emerald-600"></i> Rekapitulasi Kehadiran Bulanan`;
  }
  
  sortedKeys.forEach(key => {
    const val = summaryMap[key];
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition border-b border-gray-100 text-center";
    
    const rateKehadiran = val.total > 0 ? Math.round((val.hadir / val.total) * 100) : 0;
    let rateClass = "text-rose-600 font-bold";
    if (rateKehadiran >= 85) rateClass = "text-emerald-600 font-bold";
    else if (rateKehadiran >= 60) rateClass = "text-amber-600 font-bold";
    
    let displayPeriod = key;
    if (selectVal === 'bulan') {
      const mParts = key.split('-');
      const mNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      displayPeriod = mNames[parseInt(mParts[1], 10)] + " " + mParts[0];
    }
    
    tr.innerHTML = `
      <td class="px-4 py-3 text-left font-semibold text-gray-700">${displayPeriod}</td>
      <td class="px-4 py-3 font-bold bg-emerald-50/50 text-emerald-950">${val.total} Data</td>
      <td class="px-4 py-3 text-green-700 font-semibold">${val.hadir}</td>
      <td class="px-4 py-3 text-blue-700">${val.sakit}</td>
      <td class="px-4 py-3 text-amber-700">${val.izin}</td>
      <td class="px-4 py-3 text-rose-700">${val.alpa}</td>
      <td class="px-4 py-3 text-orange-700">${val.terlambat}</td>
      <td class="px-4 py-3 ${rateClass} text-sm">${rateKehadiran}%</td>
    `;
    tbody.appendChild(tr);
  });
}

function getStartOfWeekString(dateStr) {
  const d = new Date(dateStr.substring(0, 10));
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().substring(0, 10) + " (Mingguan)";
}

function showToast(title, desc, type = "success") {
  const toast = document.getElementById('toast-box');
  const tTitle = document.getElementById('toast-title');
  const tDesc = document.getElementById('toast-desc');
  const tIcon = document.getElementById('toast-icon');
  
  tTitle.textContent = title;
  tDesc.textContent = desc;
  
  if (type === "success") {
    tIcon.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i>`;
  } else {
    tIcon.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-400"></i>`;
  }
  
  toast.classList.remove('translate-y-20', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 4500);
}

function showLoading(show, subTitle = "Sedang menyinkronkan data dengan Google Sheets.") {
  const screen = document.getElementById('global-loading-screen');
  const sub = document.getElementById('loading-subtitle');
  if (show) {
    sub.textContent = subTitle;
    screen.classList.remove('hidden');
  } else {
    screen.classList.add('hidden');
  }
}

/**
 * Memanggil Fungsi Cetak
 */
function printReport() {
  window.focus();
  window.print();
}
