async function fetchJSON(url, opts){ const r = await fetch(url, opts); if(!r.ok) throw new Error('Fetch error'); return r.json(); }

document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  try{
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username:u, password:p })});
    const j = await res.json();
    if(j.token){
      localStorage.setItem('sas_token', j.token);
      loadBookings();
      document.getElementById('panel').classList.remove('hidden');
    } else {
      document.getElementById('msg').innerText = j.error || 'Erro';
    }
  }catch(e){ console.error(e); document.getElementById('msg').innerText = 'Erro' }
});

async function loadBookings(){
  const token = localStorage.getItem('sas_token');
  const res = await fetch('/api/admin/bookings', { headers: { 'Authorization': 'Bearer ' + token }});
  if(!res.ok){ document.getElementById('msg').innerText = 'Erro auth'; return; }
  const j = await res.json();
  const c = document.getElementById('bookings'); c.innerHTML='';
  j.bookings.forEach(b=>{
    const div = document.createElement('div'); div.className='service-card';
    div.innerHTML = `<div><strong>${b.name}</strong><div class="muted">${new Date(b.date).toLocaleDateString()} • ${b.time} — ${b.serviceId.name}</div></div><div><button class="btn btn-ghost" onclick="cancelBooking('${b._id}')">Cancelar</button></div>`;
    c.appendChild(div);
  });
}

async function cancelBooking(id){
  if(!confirm('Cancelar?')) return;
  const token = localStorage.getItem('sas_token');
  const res = await fetch('/api/admin/cancel', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ id })});
  const j = await res.json();
  if(j.success) loadBookings();
  else alert('Erro');
}
