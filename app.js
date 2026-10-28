(() => {
  const STATUSES = ['Listed', 'Matched', 'Picked up', 'Delivered'];
  const PARTNERS = [
    { id: 'p1', name: 'Riverside Community Pantry', area: 'Riverside', types: ['Bread', 'Produce', 'Dairy'], note: 'Community pantry' },
    { id: 'p2', name: 'Harbor House Kitchen', area: 'Harbor', types: ['Prepared meals', 'Produce', 'Bakery'], note: 'Community kitchen' },
    { id: 'p3', name: 'Maple Street Hostel', area: 'Maple Street', types: ['Bread', 'Dairy', 'Prepared meals'], note: 'Neighbourhood hostel' },
    { id: 'p4', name: 'Northside Share Table', area: 'Northside', types: ['Produce', 'Bakery', 'Bread'], note: 'Food-share table' }
  ];
  function future(hours) {
    const d = new Date(Date.now() + hours * 3600000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    return d.toISOString();
  }
  const seed = [
    { id: 'l1', foodType: 'Fresh bread', quantity: '18 loaves', area: 'Riverside', window: future(2), notes: 'Collected in reusable crates', status: 'Matched', partnerId: 'p1', pickup: future(1) },
    { id: 'l2', foodType: 'Seasonal produce', quantity: '8 mixed boxes', area: 'Harbor', window: future(5), notes: 'Apples, greens, and carrots', status: 'Listed', partnerId: '', pickup: '' },
    { id: 'l3', foodType: 'Prepared meals', quantity: '14 portions', area: 'Maple Street', window: future(3), notes: 'Chilled, packed individually', status: 'Picked up', partnerId: 'p3', pickup: future(0) },
    { id: 'l4', foodType: 'Bakery pastries', quantity: '2 trays', area: 'Northside', window: future(-1), notes: 'Assorted pastries', status: 'Delivered', partnerId: 'p4', pickup: future(-2) }
  ];
  const $ = (s) => document.querySelector(s);
  const grid = $('#listing-grid'), form = $('#listing-form'), partnerList = $('#partner-list'), scheduleList = $('#schedule-list');
  let listings = load();
  let toastTimer;
  function load() {
    try {
      const value = JSON.parse(localStorage.getItem('foodloop-listings'));
      return Array.isArray(value) && value.length ? value : seed;
    } catch (e) { return seed; }
  }
  function save() { localStorage.setItem('foodloop-listings', JSON.stringify(listings)); }
  function esc(value) { return String(value || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function normal(value) { return String(value || '').toLowerCase().trim().replace(/\s+/g, ' '); }
  function typeMatches(foodType, accepted) {
    const f = normal(foodType);
    return accepted.some((t) => {
      const a = normal(t);
      if (f.includes(a) || a.includes(f)) return true;
      const breadLike = (s) => /bread|bakery|pastry|pastries/.test(s);
      return breadLike(f) && breadLike(a);
    });
  }
  function matchingPartners(item) { return PARTNERS.filter((p) => normal(p.area) === normal(item.area) && typeMatches(item.foodType, p.types)); }
  function labelTime(value) {
    if (!value) return 'Not scheduled';
    const date = new Date(value);
    return Number.isNaN(+date) ? 'Not scheduled' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
  function toLocalInput(value) {
    const d = new Date(value);
    if (Number.isNaN(+d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function foodIcon(type) {
    const f = normal(type);
    if (/bread|bakery|pastr/.test(f)) return '🥖';
    if (/produce|vegetable|fruit/.test(f)) return '🥬';
    if (/meal/.test(f)) return '🍲';
    return '🍽️';
  }
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }
  function renderPartners() {
    partnerList.innerHTML = PARTNERS.map((p) => '<article class="partner"><strong>' + esc(p.name) + '</strong><p>' + esc(p.area) + ' · ' + esc(p.types.join(', ')) + '</p><p>' + esc(p.note) + '</p></article>').join('');
  }
  function renderSchedule() {
    const entries = listings.filter((x) => x.partnerId && x.status !== 'Delivered').sort((a, b) => new Date(a.pickup || a.window) - new Date(b.pickup || b.window));
    if (!entries.length) { scheduleList.innerHTML = '<p>No pickups scheduled yet. Match a listing to add it here.</p>'; return; }
    scheduleList.innerHTML = entries.map((item) => {
      const partner = PARTNERS.find((p) => p.id === item.partnerId);
      return '<article class="schedule-row"><div><strong>' + esc(item.foodType) + '</strong><p>' + esc(item.area) + ' → ' + esc(partner ? partner.name : 'Partner') + ' · ' + esc(item.status) + '</p></div><label>Pickup time <input type="datetime-local" data-pickup="' + esc(item.id) + '" value="' + esc(toLocalInput(item.pickup || item.window)) + '"></label></article>';
    }).join('');
  }
  function renderListings() {
    const status = $('#filter-status').value;
    const areaSelect = $('#filter-area');
    const previousArea = areaSelect.value;
    const areas = [...new Set(listings.map((x) => x.area).filter(Boolean))].sort();
    areaSelect.innerHTML = '<option value="All">All areas</option>' + areas.map((a) => '<option value="' + esc(a) + '">' + esc(a) + '</option>').join('');
    if (areas.includes(previousArea) || previousArea === 'All') areaSelect.value = previousArea;
    const area = areaSelect.value;
    const visible = listings.filter((x) => (status === 'All' || x.status === status) && (area === 'All' || x.area === area));
    if (!visible.length) { grid.innerHTML = '<div class="empty-state"><strong>No listings match these filters.</strong><p>Try another status or area, or add a new listing.</p></div>'; }
    else {
      grid.innerHTML = visible.map((item) => {
        const matches = matchingPartners(item);
        const partner = PARTNERS.find((p) => p.id === item.partnerId);
        const matchText = partner ? 'Matched with ' + esc(partner.name) : (matches.length ? matches.length + ' match' + (matches.length > 1 ? 'es' : '') + ' found' : 'No sample match for this area and food type yet');
        const options = matches.map((p) => '<option value="' + p.id + '"' + (p.id === item.partnerId ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('');
        const matchControl = item.status === 'Listed' && matches.length ? '<label>Match with <select data-match="' + esc(item.id) + '"><option value="">Choose a partner</option>' + options + '</select></label>' : '';
        const advance = STATUSES.indexOf(item.status) < STATUSES.length - 1 ? '<button type="button" data-action="advance" data-id="' + esc(item.id) + '">Move to ' + STATUSES[STATUSES.indexOf(item.status) + 1] + '</button>' : '<span>Complete</span>';
        return '<article class="listing-card"><div class="card-top"><span class="food-chip">' + foodIcon(item.foodType) + '</span><span class="status status-' + item.status.toLowerCase().replace(/\s+/g, '-') + '">' + esc(item.status) + '</span></div><h3>' + esc(item.foodType) + '</h3><p>' + esc(item.quantity) + ' · ' + esc(item.area) + '</p><p>Available until: ' + esc(labelTime(item.window)) + '</p><p>Pickup: ' + esc(labelTime(item.pickup)) + '</p><p>' + esc(matchText) + '</p>' + (item.notes ? '<p>Notes: ' + esc(item.notes) + '</p>' : '') + '<div class="card-actions">' + matchControl + advance + '</div></article>';
      }).join('');
    }
    $('#stat-active').textContent = listings.filter((x) => x.status !== 'Delivered').length;
    $('#stat-matches').textContent = listings.filter((x) => !!x.partnerId).length;
    $('#stat-rescued').textContent = listings.filter((x) => x.status === 'Delivered').length;
    renderSchedule();
  }
  function getItem(id) { return listings.find((x) => x.id === id); }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const item = {
      id: 'l' + Date.now(),
      foodType: data.get('foodType').trim(),
      quantity: data.get('quantity').trim(),
      area: data.get('area').trim(),
      window: data.get('window') ? new Date(data.get('window')).toISOString() : '',
      notes: (data.get('notes') || '').trim(),
      status: 'Listed',
      partnerId: '',
      pickup: ''
    };
    listings.unshift(item);
    save();
    form.reset();
    renderListings();
    toast('Listing added. Check for a match.');
  });
  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const item = getItem(button.dataset.id);
    if (!item) return;
    if (button.dataset.action === 'advance') {
      const next = STATUSES.indexOf(item.status) + 1;
      if (next < STATUSES.length) { item.status = STATUSES[next]; save(); renderListings(); toast('Status updated to ' + item.status + '.'); }
    }
  });
  grid.addEventListener('change', (event) => {
    if (!event.target.matches('[data-match]')) return;
    const item = getItem(event.target.dataset.match);
    if (!item || !event.target.value) return;
    item.partnerId = event.target.value;
    item.status = 'Matched';
    if (!item.pickup) item.pickup = item.window;
    save();
    renderListings();
    toast('Matched. Pickup added to the schedule.');
  });
  scheduleList.addEventListener('change', (event) => {
    if (!event.target.matches('[data-pickup]')) return;
    const item = getItem(event.target.dataset.pickup);
    if (!item) return;
    item.pickup = new Date(event.target.value).toISOString();
    save();
    renderListings();
    toast('Pickup time updated.');
  });
  $('#filter-status').addEventListener('change', renderListings);
  $('#filter-area').addEventListener('change', renderListings);
  renderPartners();
  renderListings();
})();
