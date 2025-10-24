async function fetchJSON(url, opts){ const r = await fetch(url, opts); if(!r.ok) throw new Error('Fetch error'); return r.json(); }
const BookingPage = (function(){
  let barberId = null;
  let barber = null;
  let services = [];
  let selectedService = null;
  let selectedDate = null;
  let selectedTime = null;
  function q(name){ return new URLSearchParams(window.location.search).get(name); }
  async function init(){
    barberId = q('barber');
    if(!barberId){ document.getElementById('msg').innerText = 'Barbeiro não informado'; return; }
    try {
      const [barbers, svs] = await Promise.all([fetchJSON('/api/barbers'), fetchJSON('/api/services')]);
      barber = barbers.find(b=>b._id===barberId);
      services = svs;
      document.getElementById('barberName').innerText = barber ? barber.name : 'Agendar';
      renderServices();
      bind();
    } catch(e){ console.error(e); document.getElementById('msg').innerText = 'Erro ao carregar'; }
  }
  function renderServices(){
    const c = document.getElementById('services'); c.innerHTML='';
    services.forEach(s=> {
      const div = document.createElement('div'); div.className='service-card';
      div.innerHTML = `<div><strong>${s.name}</strong><div class="muted">R$ ${s.price}</div></div><div><button class="btn btn-primary" onclick="BookingPage.selectService('${s._id}')">Selecionar</button></div>`;
      c.appendChild(div);
    });
  }
  function selectService(id){
    selectedService = services.find(x=>x._id===id);
    document.getElementById('msg').innerText = '';
    document.getElementById('slots').innerHTML = '';
  }
  function bind(){
    document.getElementById('dateInput').addEventListener('change', async (e)=>{
      selectedDate = e.target.value;
      if(!selectedDate || !selectedService) return;
      try {
        const res = await fetchJSON(`/api/available?barberId=${barberId}&date=${selectedDate}`);
        renderSlots(res.available);
      } catch(e){ console.error(e); document.getElementById('msg').innerText = 'Erro ao buscar horários'; }
    });
    document.getElementById('bookBtn').addEventListener('click', async ()=>{
      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      if(!selectedService) return alert('Selecione um serviço');
      if(!selectedDate) return alert('Escolha a data');
      if(!selectedTime) return alert('Escolha o horário');
      if(!name || !phone) return alert('Preencha nome e telefone');
      try {
        const body = { name, phone, barberId, serviceId: selectedService._id, date: selectedDate, time: selectedTime };
        const res = await fetch('/api/book', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        const j = await res.json();
        if(j.success){
          const dateLabel = new Date(selectedDate).toLocaleDateString();
          const text = `Novo agendamento!%0ABarbeiro: ${barber.name}%0AServiço: ${selectedService.name} (R$${selectedService.price})%0AData: ${dateLabel}%0AHora: ${selectedTime}%0ACliente: ${name} - ${phone}`;
          window.open(`https://wa.me/${barber.phone}?text=${text}`, '_blank');
          alert('Agendamento criado e WhatsApp aberto.');
          window.location = '/';
        } else {
          alert('Erro: ' + (j.error || '---'));
        }
      } catch(e){ console.error(e); alert('Erro ao criar agendamento'); }
    });
  }
  function renderSlots(slots){
    const c = document.getElementById('slots'); c.innerHTML = '';
    slots.forEach(s=>{
      const btn = document.createElement('div'); btn.className='slot'; btn.innerText = s;
      btn.onclick = ()=> {
        Array.from(c.children).forEach(x=>x.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTime = s;
      };
      c.appendChild(btn);
    });
  }
  return { init, selectService };
})();
window.addEventListener('load', ()=>BookingPage.init());
