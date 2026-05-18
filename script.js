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
      "Silakan isi 'Total Pendapatan' di Budget Planner terlebih dahulu.";
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
    statusBox.innerText = `🟢 SEHAT (Pengeluaran Anda terkontrol pada tingkat ${ratio.toFixed(1)}% dari anggaran)`;
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
// 7. FITUR SINKRONISASI: DANA DARURAT & BUDGET PLANNER (DINAMIS BULANAN/MINGGUAN)
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
  const rawIncome =
    parseFloat(document.getElementById("monthly-income").value) || 0;
  const frequency = document.getElementById("budget-frequency").value;
  const labelInput = document.getElementById("income-label");

  // A. Sesuaikan Teks Label Input Berdasarkan Pilihan Drop-down
  if (frequency === "mingguan") {
    labelInput.innerText = "Total Pendapatan Mingguan";
    totalIncome = rawIncome; // Pendapatan dasar dinilai per minggu
  } else {
    labelInput.innerText = "Total Pendapatan Bulanan";
    totalIncome = rawIncome; // Pendapatan dasar dinilai per bulan
  }

  // B. Hitung Alokasi Metode 50/30/20
  const needs = totalIncome * 0.5;
  const wants = totalIncome * 0.3;
  const savings = totalIncome * 0.2;

  // C. Alokasi Dana Darurat Berkala (10% dari Pendapatan yang dimasukkan)
  const emergencySuggest = totalIncome * 0.1;

  // D. Tampilkan Hasil Alokasi ke Layar HTML
  document.getElementById("budget-needs").innerText =
    "Rp " + needs.toLocaleString("id-ID");
  document.getElementById("budget-wants").innerText =
    "Rp " + wants.toLocaleString("id-ID");
  document.getElementById("budget-savings").innerText =
    "Rp " + savings.toLocaleString("id-ID");
  document.getElementById("budget-emergency-suggest").innerText =
    "Rp " + emergencySuggest.toLocaleString("id-ID");

  // E. KONEKSI DANA DARURAT: Target Dana Darurat Ideal adalah 6 Bulan Kebutuhan Pokok.
  // Jika inputnya mingguan, kita kalikan dulu ke bulanan (dikali 4) baru kemudian dikali 6 bulan.
  if (frequency === "mingguan") {
    currentEmergencyTarget = needs * 4 * 6;
  } else {
    currentEmergencyTarget = needs * 6;
  }

  if (currentEmergencyTarget === 0) currentEmergencyTarget = 12000000; // Kembalikan ke default jika kosong

  document.getElementById("target-display").innerText =
    "Rp " + currentEmergencyTarget.toLocaleString("id-ID");

  // Perbarui progress bar dan status indikator kesehatan
  updateEmergency();
  checkFinancialHealth();
}

// ==========================================
// 8. FITUR PREMIUM: TARGET TABUNGAN (DENGAN OPSI FREKUENSI)
// ==========================================
document.getElementById("goal-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("goal-name").value;
  const price = parseFloat(document.getElementById("goal-price").value);
  const amount = parseFloat(document.getElementById("goal-amount").value);
  const frequency = document.getElementById("goal-frequency").value;

  if (name && price && amount) {
    const timeNeeded = Math.ceil(price / amount);

    let timeUnit = "Bulan";
    let frequencyText = "bln";

    if (frequency === "harian") {
      timeUnit = "Hari";
      frequencyText = "hari";
    } else if (frequency === "mingguan") {
      timeUnit = "Minggu";
      frequencyText = "mggu";
    }

    const list = document.getElementById("goal-list");
    const li = document.createElement("li");
    li.className = "transaction-item";
    li.style.flexDirection = "column";
    li.style.alignItems = "flex-start";
    li.innerHTML = `
      <div><strong>🎯 Target: ${name}</strong></div>
      <div style="font-size:0.85rem; color: var(--text-muted);">
        Harga: Rp ${price.toLocaleString("id-ID")} | Tabungan: Rp ${amount.toLocaleString("id-ID")}/${frequencyText}
      </div>
      <div style="margin-top:5px; color: var(--success); font-weight:bold; font-size:0.9rem;">
        ⏱️ Estimasi Waktu: ${timeNeeded} ${timeUnit} Lagi
      </div>
    `;
    list.appendChild(li);

    document.getElementById("goal-form").reset();
    document.getElementById("goal-frequency").value = "bulanan";
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
  const randomIndex = Math.floor(Math.random() * financialTips.length);
  document.getElementById("daily-tip").innerText =
    `"${financialTips[randomIndex]}"`;
}

// ==========================================
// 13. FITUR PREMIUM: RESET DATA BULANAN
// ==========================================
function resetMonthlyData() {
  const konfirmasi = confirm(
    "Apakah Anda yakin ingin memulai bulan baru? Semua histori transaksi saat ini akan dihapus permanen. Pastikan Anda sudah mengekspor data ke CSV jika masih dibutuhkan.",
  );

  if (konfirmasi) {
    totalExpense = 0;
    transactionHistory = [];

    expenseChart.data.labels = [];
    expenseChart.data.datasets[0].data = [];
    expenseChart.data.datasets[0].backgroundColor = [];
    expenseChart.update();

    document.getElementById("transaction-list").innerHTML = "";
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
