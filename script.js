const USERS = { admin: 'admin123' };

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || JSON.stringify(USERS));
}
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const users = getUsers();
  if (users[u] === p) {
    localStorage.setItem('auth', u);
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
  const jam = parseFloat(document.getElementById('jamKerja').value);
  const tarif = parseFloat(document.getElementById('tarifJam').value);
  const gajiHari = parseFloat(document.getElementById('gajiHari').value);
  let total, keterangan;
  if (jam >= 9) {
    total = gajiHari;
    keterangan = `Kerja ${jam} jam (≥ 9 jam) → dihitung perhari`;
  } else {
    total = jam * tarif;
    keterangan = `Kerja ${jam} jam (< 9 jam) → ${jam} × Rp${tarif.toLocaleString('id-ID')}`;
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
if (localStorage.getItem('auth')) showApp(); else showLogin();