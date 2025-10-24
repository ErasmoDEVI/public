async function fetchJSON(url, opts){ const r = await fetch(url, opts); if(!r.ok) throw new Error('Fetch error'); return r.json(); }

const Front = (function(){
  let barbers = [], services = [];
  async function init(){
    try {
      barbers = await fetchJSON('/api/barbers');
      services = await fetchJSON('/api/services');
      renderBarbers();
    } catch(e){
      console.error(e);
      document.getElementById('barbers').innerText = 'Erro ao carregar dados.';
    }
  }
  function renderBarbers(){
    const container = document.getElementById('barbers');
    container.innerHTML = '';
    barbers.forEach(b => {
      const div = document.createElement('div');
      div.className = 'service-card';
      div.innerHTML = `<div><strong>${b.name}</strong><div class="muted">${b.phone || ''}</div></div><div><button class="btn btn-primary" onclick="Front.startBooking('${b._id}')">Agendar</button></div>`;
      container.appendChild(div);
    });
  }
  function startBooking(barberId){
    window.location.href = '/booking.html?barber=' + barberId;
  }
  return { init, startBooking };
})();

window.addEventListener('load', ()=>Front.init());

