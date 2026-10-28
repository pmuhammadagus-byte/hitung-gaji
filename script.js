const USERS = { admin: 'admin123' };

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (USERS[u] === p) {
    localStorage.setItem('auth', '1');
    showApp();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
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
  document.getElementById('appScreen').style.display = 'block';
}
function showLogin() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('appScreen').style.display = 'none';
}
if (localStorage.getItem('auth') === '1') showApp(); else showLogin();