const USERS = { admin: 'admin123' };

function getUsers() { return JSON.parse(localStorage.getItem('users') || JSON.stringify(USERS)); }
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }
function getKehadiran() { return JSON.parse(localStorage.getItem('kehadiran') || '[]'); }
function saveKehadiran(k) { localStorage.setItem('kehadiran', JSON.stringify(k)); }

function todayKey() { return new Date().toISOString().slice(0, 10); }

function parseDuration(masuk, pulang) {
  const [mh, mm] = masuk.split(':').map(Number);
  const [ph, pm] = pulang.split(':').map(Number);
  const dm = (ph * 60 + pm) - (mh * 60 + mm);
  return dm <= 0 ? 0 : dm / 60;
}

function durasiString(masuk, pulang) {
  const j = parseDuration(masuk, pulang);
  const h = Math.floor(j);
  const m = Math.round((j - h) * 60);
  return `${h} jam ${m} menit`;
}

function renderKehadiran() {
  const k = getKehadiran().slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const el = document.getElementById('riwayat');
  if (k.length === 0) {
    el.innerHTML = '<p style="color:#6b7280;font-size:0.875rem;">Belum ada catatan</p>';
    return;
  }
  el.innerHTML = k.map(r => `
    <div class="riwayat-item">
      <strong>${r.tanggal}</strong>
      <span class="label">Masuk:</span> <span>${r.masuk || '-'}</span>
      <span class="label">Pulang:</span> <span>${r.pulang || '-'}</span>
      <span class="label">Durasi:</span> <span>${durasiString(r.masuk, r.pulang)}</span>
    </div>`).join('');
}

document.getElementById('formCatat').addEventListener('submit', (e) => {
  e.preventDefault();
  const tanggal = document.getElementById('tanggal').value;
  const masuk = document.getElementById('jamMasuk').value;
  const pulang = document.getElementById('jamPulang').value;
  if (!tanggal || !masuk || !pulang) return;
  const k = getKehadiran();
  const idx = k.findIndex(r => r.tanggal === tanggal);
  if (idx >= 0) { k[idx] = { tanggal, masuk, pulang }; } else { k.push({ tanggal, masuk, pulang }); }
  saveKehadiran(k);
  document.getElementById('formCatat').reset();
  document.getElementById('tanggal').value = todayKey();
  renderKehadiran();
});

document.getElementById('formGaji').addEventListener('submit', (e) => {
  e.preventDefault();
  const bulan = document.getElementById('bulan').value;
  const tarifJam = parseFloat(document.getElementById('tarifJam').value);
  const gajiHari = parseFloat(document.getElementById('gajiHari').value);
  const k = getKehadiran();

  const rekap = k.filter(r => r.tanggal.startsWith(bulan));
  let totalGaji = 0;
  let rows = '';

  rekap.forEach(r => {
    const durasi = parseDuration(r.masuk, r.pulang);
    let nominal, jenis;
    if (durasi >= 9) { nominal = gajiHari; jenis = 'per hari (≥ 9 jam)'; }
    else { nominal = durasi * tarifJam; jenis = `${durasi.toFixed(2)} jam × tarif`; }
    totalGaji += nominal;
    rows += `<tr style="border-bottom:1px solid #eee;">
      <td>${r.tanggal}</td>
      <td>${r.masuk}</td>
      <td>${r.pulang}</td>
      <td>${durasiString(r.masuk, r.pulang)}</td>
      <td>Rp${Math.round(nominal).toLocaleString('id-ID')} (${jenis})</td>
    </tr>`;
  });

  document.getElementById('hasil').style.display = 'block';
  document.getElementById('hasil').innerHTML = `
    <div><strong>Bulan:</strong> ${bulan}</div>
    <div><strong>Total hari kerja dicatat:</strong> ${rekap.length}</div>
    <div style="font-size:1.25rem;margin-top:6px;">Total gaji: Rp${Math.round(totalGaji).toLocaleString('id-ID')}</div>
    <table style="width:100%;margin-top:10px;border-collapse:collapse;">
      <thead><tr style="text-align:left;border-bottom:1px solid #ccc;">
        <th>Tanggal</th><th>Masuk</th><th>Pulang</th><th>Durasi</th><th>Nominal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
});

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (getUsers()[u] === p) {
    localStorage.setItem('auth', u);
    renderKehadiran();
    showApp();
  } else { document.getElementById('loginError').style.display = 'block'; }
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
    users[u] = p; saveUsers(users);
    document.getElementById('daftarError').style.display = 'none';
    document.getElementById('daftarSukses').style.display = 'block';
  }
});

document.getElementById('toDaftar').addEventListener('click', (e) => { e.preventDefault(); showDaftar(); });
document.getElementById('toLogin').addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.removeItem('auth'); showLogin(); });

function showApp() { document.getElementById('loginScreen').style.display = 'none'; document.getElementById('daftarScreen').style.display = 'none'; document.getElementById('appScreen').style.display = 'block'; }
function showLogin() { document.getElementById('loginScreen').style.display = 'block'; document.getElementById('daftarScreen').style.display = 'none'; document.getElementById('appScreen').style.display = 'none'; }
function showDaftar() { document.getElementById('loginScreen').style.display = 'none'; document.getElementById('daftarScreen').style.display = 'block'; document.getElementById('appScreen').style.display = 'none'; }

document.getElementById('tanggal').value = todayKey();

if (localStorage.getItem('auth')) { renderKehadiran(); showApp(); } else { showLogin(); }
