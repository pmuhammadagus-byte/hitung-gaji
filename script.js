const USERS = { admin: 'admin123' };

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || JSON.stringify(USERS));
}
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }

function getKehadiran() {
  return JSON.parse(localStorage.getItem('kehadiran') || '[]');
}
function saveKehadiran(k) { localStorage.setItem('kehadiran', JSON.stringify(k)); }

function nowStr() {
  const d = new Date();
  return d.toLocaleString('id-ID', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function renderKehadiran() {
  const k = getKehadiran();
  const el = document.getElementById('riwayat');
  if (k.length === 0) {
    el.innerHTML = '<p style="color:#6b7280;font-size:0.875rem;">Belum ada catatan</p>';
    return;
  }
  el.innerHTML = k.reverse().map(r => `
    <div class="riwayat-item">
      <strong>${r.tanggal}</strong>
      <span class="label">Masuk:</span> <span>${r.masuk || '-'}</span>
      <span class="label">Pulang:</span> <span>${r.pulang || '-'}</span>
      ${r.durasi ? `<span class="label">Durasi:</span> <span>${r.durasi}</span>` : ''}
    </div>
  `).join('');
}

function updateStatus() {
  const k = getKehadiran();
  const today = todayKey();
  const todayRec = k.find(r => r.tanggal === today);
  const status = document.getElementById('statusKehadiran');
  const btnMasuk = document.getElementById('btnMasuk');
  const btnPulang = document.getElementById('btnPulang');

  if (!todayRec || !todayRec.masuk) {
    status.textContent = 'Belum absen masuk hari ini';
    status.className = 'status status-belum';
    btnMasuk.disabled = false;
    btnPulang.disabled = true;
  } else if (!todayRec.pulang) {
    status.textContent = `Sudah masuk: ${todayRec.masuk}`;
    status.className = 'status status-masuk';
    btnMasuk.disabled = true;
    btnPulang.disabled = false;
  } else {
    status.textContent = `Selesai: ${todayRec.masuk} → ${todayRec.pulang} (${todayRec.durasi})`;
    status.className = 'status status-selesai';
    btnMasuk.disabled = true;
    btnPulang.disabled = true;
  }
}

function hitungDurasi(masuk, pulang) {
  const [mh, mm] = masuk.split(':').map(Number);
  const [ph, pm] = pulang.split(':').map(Number);
  const dm = (ph * 60 + pm) - (mh * 60 + mm);
  if (dm <= 0) return '-';
  const h = Math.floor(dm / 60);
  const m = dm % 60;
  return `${h} jam ${m} menit`;
}

document.getElementById('btnMasuk').addEventListener('click', () => {
  const k = getKehadiran();
  const today = todayKey();
  const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const idx = k.findIndex(r => r.tanggal === today);
  if (idx >= 0) {
    k[idx].masuk = waktu;
  } else {
    k.push({ tanggal: today, masuk: waktu, pulang: '', durasi: '' });
  }
  saveKehadiran(k);
  renderKehadiran();
  updateStatus();
});

document.getElementById('btnPulang').addEventListener('click', () => {
  const k = getKehadiran();
  const today = todayKey();
  const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const idx = k.findIndex(r => r.tanggal === today);
  if (idx >= 0 && k[idx].masuk) {
    k[idx].pulang = waktu;
    k[idx].durasi = hitungDurasi(k[idx].masuk, waktu);
  }
  saveKehadiran(k);
  renderKehadiran();
  updateStatus();
});

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const users = getUsers();
  if (users[u] === p) {
    localStorage.setItem('auth', u);
    renderKehadiran();
    updateStatus();
    showApp();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
});

document.getElementById('formDaftar').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('daftarUsername').value;
  const p = document.getElementById('daftarPassword').value;
  const users = getUsers();
  if (users[u]) {
    document.getElementById('daftarError').style.display = 'block';
    document.getElementById('daftarSukses').style.display = 'none';
  } else {
    users[u] = p;
    saveUsers(users);
    document.getElementById('daftarError').style.display = 'none';
    document.getElementById('daftarSukses').style.display = 'block';
  }
});

document.getElementById('toDaftar').addEventListener('click', (e) => {
  e.preventDefault();
  showDaftar();
});
document.getElementById('toLogin').addEventListener('click', (e) => {
  e.preventDefault();
  showLogin();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('auth');
  showLogin();
});

document.getElementById('formGaji').addEventListener('submit', (e) => {
  e.preventDefault();
  const tarif = parseFloat(document.getElementById('tarifJam').value);
  const gajiHari = parseFloat(document.getElementById('gajiHari').value);
  const k = getKehadiran();
  const today = todayKey();
  const todayRec = k.find(r => r.tanggal === today);
  let total, keterangan;
  if (todayRec && todayRec.durasi) {
    const parts = todayRec.durasi.match(/(\d+) jam (\d+) menit/);
    let jam = 0;
    if (parts) {
      jam = parseInt(parts[1]) + parseInt(parts[2]) / 60;
    }
    if (jam >= 9) {
      total = gajiHari;
      keterangan = `Kerja ${jam.toFixed(1)} jam (≥ 9 jam) → dihitung perhari`;
    } else {
      total = jam * tarif;
      keterangan = `Durasi ${todayRec.durasi} × Rp${tarif.toLocaleString('id-ID')}`;
    }
  } else if (todayRec && todayRec.masuk && !todayRec.pulang) {
    total = gajiHari;
    keterangan = `Belum pulang → dihitung perhari: Rp${gajiHari.toLocaleString('id-ID')}`;
  } else {
    total = gajiHari;
    keterangan = `Belum absen hari ini → gaji perhari: Rp${gajiHari.toLocaleString('id-ID')}`;
  }
  const hasil = document.getElementById('hasil');
  hasil.style.display = 'block';
  hasil.innerHTML = `<div>${keterangan}</div><div style="font-size:1.25rem;margin-top:6px;">Total: Rp${total.toLocaleString('id-ID')}</div>`;
});

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('daftarScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'block';
}
function showLogin() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('daftarScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'none';
}
function showDaftar() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('daftarScreen').style.display = 'block';
  document.getElementById('appScreen').style.display = 'none';
}
if (localStorage.getItem('auth')) {
  renderKehadiran();
  updateStatus();
  showApp();
} else {
  showLogin();
}