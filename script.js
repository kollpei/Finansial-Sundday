// ==========================================
// 1. STATE DATA UTAMA & GLOBAL VARIABLES
// ==========================================
let totalIncome = 0;
let totalExpense = 0;
let currentEmergencyTarget = 1000000; // Default awal sebelum pendapatan diisi

// Array histori transaksi untuk Fitur Ekspor CSV
let transactionHistory = [];
let calcExpression = ""; // Menyimpan input ekspresi kalkulator aritmatika

// ==========================================
// 2. LOGIKA UTAMA SIDEBAR & RESPONSIVITAS MOBILE
// ==========================================
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

// ==========================================
// 3. FITUR INTERAKTIF DARK MODE
// ==========================================
function toggleDarkMode() {
  document.body.classList.toggle("dark-theme");
  const btn = document.getElementById("dark-mode-toggle");
  btn.innerText = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
}

// ==========================================
// 4. LOGIKA GRAFIK CHART BERSIH (CHART.JS)
// ==========================================
const ctx = document.getElementById("expenseChart").getContext("2d");
let expenseLabels = [];
let expenseData = [];

const expenseChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: expenseLabels,
    datasets: [
      {
        data: expenseData,
        backgroundColor: [],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
  },
});

// Menangani Aksi Submit Input Pengeluaran Baru
document
  .getElementById("expense-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const nameInput = document.getElementById("expense-name");
    const amountInput = document.getElementById("expense-amount");

    const name = nameInput.value;
    const amount = parseFloat(amountInput.value);

    if (name && amount) {
      // A. Update Visual Chart secara Dinamis
      expenseChart.data.labels.push(name);
      expenseChart.data.datasets[0].data.push(amount);
      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
      expenseChart.data.datasets[0].backgroundColor.push(randomColor);
      expenseChart.update();

      // B. Tambahkan Elemen Baru ke History List HTML
      const list = document.getElementById("transaction-list");
      const li = document.createElement("li");
      li.className = "transaction-item";
      li.innerHTML = `<span>${name}</span> <strong>Rp ${amount.toLocaleString("id-ID")}</strong>`;
      list.appendChild(li);

      // C. Simpan data untuk Laporan CSV
      transactionHistory.push({ nama: name, jumlah: amount });

      // D. Perbarui Total Pengeluaran & Evaluasi Kesehatan Keuangan
      totalExpense += amount;
      checkFinancialHealth();

      // Reset Form
      nameInput.value = "";
      amountInput.value = "";
    }
  });

// ==========================================
// 5. FITUR PREMIUM: EKSPOR DATA KE CSV
// ==========================================
function exportToCSV() {
  if (transactionHistory.length === 0) {
    alert("Belum ada data transaksi untuk diekspor!");
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Nama Pengeluaran,Jumlah (Rp)\n";
  transactionHistory.forEach(function (row) {
    csvContent += `${row.nama},${row.jumlah}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Laporan_Keuangan_FinanceApp.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 6. FITUR PREMIUM: FINANCIAL HEALTH CHECK & LIMIT ALERT
// ==========================================
function checkFinancialHealth() {
  const statusBox = document.getElementById("health-status");
  const alertBox = document.getElementById("financial-alert");

  if (totalIncome === 0) {
    statusBox.innerText =
      "Silakan isi 'Total Pendapatan Bulanan' di Budget Planner terlebih dahulu.";
    statusBox.style.background = "var(--bg-body)";
    statusBox.style.color = "var(--text-main)";
    alertBox.style.display = "none";
    return;
  }

  const ratio = (totalExpense / totalIncome) * 100;

  if (ratio > 80) {
    alertBox.style.display = "block";
  } else {
    alertBox.style.display = "none";
  }

  if (ratio <= 50) {
    statusBox.innerText = `🟢 SEHAT (Pengeluaran Anda terkontrol pada tingkat ${ratio.toFixed(1)}% dari pendapatan)`;
    statusBox.style.backgroundColor = "#2ecc71";
    statusBox.style.color = "white";
  } else if (ratio > 50 && ratio <= 80) {
    statusBox.innerText = `🟡 SIAGA (Rasio belanja Anda sudah menyentuh ${ratio.toFixed(1)}%. Kurangi pengeluaran tersier!)`;
    statusBox.style.backgroundColor = "#f1c40f";
    statusBox.style.color = "#2c3e50";
  } else {
    statusBox.innerText = `🔴 BAHAYA (Keuangan Kritis! Pengeluaran Anda sudah ${ratio.toFixed(1)}% melewati ambang batas aman!)`;
    statusBox.style.backgroundColor = "#e74c3c";
    statusBox.style.color = "white";
  }
}

// ==========================================
// 7. FITUR SINKRONISASI: DANA DARURAT & BUDGET PLANNER
// ==========================================
function updateEmergency() {
  const current =
    parseFloat(document.getElementById("current-emergency").value) || 0;

  let percentage = 0;
  if (currentEmergencyTarget > 0) {
    percentage = Math.round((current / currentEmergencyTarget) * 100);
  }
  if (percentage > 100) percentage = 100;

  const progressBar = document.getElementById("emergency-progress");
  progressBar.style.width = percentage + "%";
  progressBar.innerText = percentage + "%";
}

function calculateBudget() {
  totalIncome =
    parseFloat(document.getElementById("monthly-income").value) || 0;

  // A. Alokasi 50/30/20
  const needs = totalIncome * 0.5;
  const wants = totalIncome * 0.3;
  const savings = totalIncome * 0.2;

  // B. Hitung Rekomendasi Alokasi Dana Darurat Bulanan (10% dari Pendapatan)
  const emergencySuggest = totalIncome * 0.1;

  // C. Tampilkan Hasil Alokasi ke Layar HTML
  document.getElementById("budget-needs").innerText =
    "Rp " + needs.toLocaleString("id-ID");
  document.getElementById("budget-wants").innerText =
    "Rp " + wants.toLocaleString("id-ID");
  document.getElementById("budget-savings").innerText =
    "Rp " + savings.toLocaleString("id-ID");
  document.getElementById("budget-emergency-suggest").innerText =
    "Rp " + emergencySuggest.toLocaleString("id-ID");

  // D. KONEKSI DINAMIS: Target Dana Darurat = 6 Bulan Kebutuhan Pokok (Needs)
  currentEmergencyTarget = needs * 6;
  if (currentEmergencyTarget === 0) currentEmergencyTarget = 12000000; // Kembalikan ke default jika kosong

  document.getElementById("target-display").innerText =
    "Rp " + currentEmergencyTarget.toLocaleString("id-ID");

  // Perbarui progress bar agar langsung menyesuaikan target baru
  updateEmergency();
  checkFinancialHealth();
}

// ==========================================
// 8. FITUR PREMIUM: TARGET TABUNGAN (TRACKER IMPIAN)
// ==========================================
document.getElementById("goal-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("goal-name").value;
  const price = parseFloat(document.getElementById("goal-price").value);
  const monthly = parseFloat(document.getElementById("goal-monthly").value);

  if (name && price && monthly) {
    const monthsNeeded = Math.ceil(price / monthly);
    const list = document.getElementById("goal-list");
    const li = document.createElement("li");
    li.className = "transaction-item";
    li.style.flexDirection = "column";
    li.style.alignItems = "flex-start";
    li.innerHTML = `
      <div><strong>🎯 Target: ${name}</strong></div>
      <div style="font-size:0.85rem; color: var(--text-muted);">
        Harga: Rp ${price.toLocaleString("id-ID")} | Tabungan: Rp ${monthly.toLocaleString("id-ID")}/bln
      </div>
      <div style="margin-top:5px; color: var(--success); font-weight:bold; font-size:0.9rem;">
        ⏱️ Estimasi Waktu: ${monthsNeeded} Bulan Lagi
      </div>
    `;
    list.appendChild(li);
    document.getElementById("goal-form").reset();
  }
});

// ==========================================
// 9. UTILITY ALAT: KALKULATOR INVESTASI (COMPOUND INTEREST)
// ==========================================
function calculateInvestment() {
  const principal =
    parseFloat(document.getElementById("calc-principal").value) || 0;
  const rate =
    (parseFloat(document.getElementById("calc-rate").value) || 0) / 100;
  const years = parseInt(document.getElementById("calc-years").value) || 0;

  const result = principal * Math.pow(1 + rate, years);
  document.getElementById("calc-result").innerText =
    "Rp " + Math.round(result).toLocaleString("id-ID");
}

// ==========================================
// 10. UTILITY ALAT: REAL-TIME KURS (EXCHANGERATE-API WITH KEY)
// ==========================================
async function convertCurrency() {
  const usdAmount =
    parseFloat(document.getElementById("usd-amount").value) || 0;
  const resultTarget = document.getElementById("idr-result");

  if (usdAmount === 0) {
    resultTarget.innerText = "Rp 0";
    return;
  }

  // SILAKAN GANTI TEKS DI BAWAH INI DENGAN API KEY ASLI KAMU
  const apiKey = "f772b7c7afc76db619aed469";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  try {
    resultTarget.innerText = "Menghitung...";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Validasi API Key Gagal / Server Error");

    const data = await response.json();
    const idrRate = data.conversion_rates.IDR;
    const totalConversion = usdAmount * idrRate;

    resultTarget.innerText =
      "Rp " + Math.round(totalConversion).toLocaleString("id-ID");
  } catch (error) {
    console.error("Kurs API Error, Menggunakan Fallback:", error);
    const fallbackRate = 16500;
    const fallbackResult = usdAmount * fallbackRate;
    resultTarget.innerText =
      "Rp " +
      Math.round(fallbackResult).toLocaleString("id-ID") +
      " (Mode Cadangan)";
  }
}

// ==========================================
// 11. WIDGET UTILITY: LOGIKA KALKULATOR STANDAR
// ==========================================
function inputCalc(value) {
  const display = document.getElementById("calc-display");
  if (display.value === "0" && !isNaN(value)) {
    calcExpression = value;
  } else {
    calcExpression += value;
  }
  display.value = calcExpression;
}

function clearCalc() {
  calcExpression = "";
  document.getElementById("calc-display").value = "0";
}

function calculateResult() {
  const display = document.getElementById("calc-display");
  try {
    if (calcExpression) {
      const result = new Function(`return ${calcExpression}`)();
      display.value = Number(result.toFixed(4)).toString();
      calcExpression = display.value;
    }
  } catch (error) {
    display.value = "Error";
    calcExpression = "";
  }
}

// ==========================================
// 12. FITUR PREMIUM: DATABASE TIPS FINANSIAL ACAK
// ==========================================
const financialTips = [
  "Jangan menabung apa yang tersisa setelah dibelanjakan, tapi belanjakan apa yang tersisa setelah ditabung.",
  "Aturan emas keuangan: Belajarlah hidup dengan pengeluaran yang lebih kecil dari pendapatan nyata Anda.",
  "Mencatat pengeluaran kecil harian sama pentingnya dengan memikirkan instrumen investasi besar.",
  "Dana darurat bukan sekadar tabungan mengendap, itu adalah tameng pelindung ketenangan pikiran Anda.",
  "Sebelum berniat membeli barang tersier mewah, pastikan Anda sanggup membelinya dua kali lipat tanpa membebani kas tabungan utama.",
];

function displayRandomTip() {
  const hariIni = new Date().toDateString(); // Mengambil tanggal hari ini (Contoh: "Mon May 18 2026")
  const tipTersimpan = localStorage.getItem("tip_hari_ini");
  const tanggalTersimpan = localStorage.getItem("tanggal_tip");

  // Jika hari sudah berganti atau belum ada tips yang disimpan sebelumnya
  if (tanggalTersimpan !== hariIni || !tipTersimpan) {
    // Pilih tips secara acak dari database
    const randomIndex = Math.floor(Math.random() * financialTips.length);
    const tipTerpilih = financialTips[randomIndex];

    // Simpan tips dan tanggal hari ini ke dalam memori browser
    localStorage.setItem("tip_hari_ini", tipTerpilih);
    localStorage.setItem("tanggal_tip", hariIni);

    // Tampilkan ke layar
    document.getElementById("daily-tip").innerText = `"${tipTerpilih}"`;
  } else {
    // Jika masih di hari yang sama, gunakan tips yang sudah dikunci tadi
    document.getElementById("daily-tip").innerText = `"${tipTersimpan}"`;
  }
}

// ==========================================
// 13. FITUR PREMIUM: RESET DATA BULANAN
// ==========================================
function resetMonthlyData() {
  const konfirmasi = confirm(
    "Apakah Anda yakin ingin memulai bulan baru? Semua histori transaksi saat ini akan dihapus permanen. Pastikan Anda sudah mengekspor data ke CSV jika masih dibutuhkan.",
  );

  if (konfirmasi) {
    // A. Bersihkan data pengeluaran
    totalExpense = 0;
    transactionHistory = [];

    // B. Bersihkan visual Chart.js
    expenseChart.data.labels = [];
    expenseChart.data.datasets[0].data = [];
    expenseChart.data.datasets[0].backgroundColor = [];
    expenseChart.update();

    // C. Bersihkan list tabel HTML
    document.getElementById("transaction-list").innerHTML = "";

    // D. Hitung ulang budget & kesehatan agar kembali ke posisi sehat
    calculateBudget();

    alert(
      "Data berhasil direset! Selamat memulai pencatatan di bulan yang baru.",
    );
  }
}

// Inisialisasi awal saat dokumen selesai dimuat
window.addEventListener("DOMContentLoaded", () => {
  displayRandomTip();
  document.getElementById("target-display").innerText =
    "Rp " + currentEmergencyTarget.toLocaleString("id-ID");
});
