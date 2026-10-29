// Sample data only: nothing here is sent to a restaurant or to the AI.
(() => {
  const img = (name) => '/demo-assets/' + name;
  const dish = (id, name, price, image, description, ingredients, available = true) => ({ id, name, price: price + ' so‘m', image: img(image), description, ingredients, available });
  const data = {
    restaurantName: 'Samarqand Bistro',
    chapters: [
      { key: 'salads', title: 'Salatlar', dishes: [dish('d1', 'Yangi bog‘ salati', '32 000', 'food-salad.jpg', 'Pomidor, bodring, rayhon va zaytun moyi bilan yengil salat.', 'pomidor, bodring, rayhon'), dish('d2', 'Non va qaymoq', '18 000', 'food-bread.jpg', 'Tandir noni, uy qaymog‘i va asal.', 'un, qaymoq, asal')] },
      { key: 'mains', title: 'Ikkinchi taomlar', dishes: [dish('d3', 'Kabob assorti', '89 000', 'food-grill.jpg', 'Qo‘y go‘shti, tovuq va sabzavotlar ko‘mirda pishirilgan.', 'qo‘y go‘shti, tovuq, piyoz'), dish('d4', 'Krem pasta', '54 000', 'food-pasta.jpg', 'Qaymoqli sous, qo‘ziqorin va parmezan.', 'pasta, qaymoq, qo‘ziqorin'), dish('d5', 'Karri', '61 000', 'food-curry.jpg', 'Tovuqli achchiq karri va guruch.', 'tovuq, guruch, ziravorlar'), dish('d6', 'Sushi to‘plami', '120 000', 'food-sushi.jpg', '12 dona: losos, avokado, bodring.', 'guruch, losos, nori', false)] },
      { key: 'fast', title: 'Fastfood', dishes: [dish('d7', 'Bistro burger', '47 000', 'food-burger.jpg', 'Mol go‘shti kotleti, cheddar va maxsus sous.', 'bulochka, mol go‘shti, pishloq'), dish('d8', 'Margarita pitsa', '68 000', 'food-pizza.jpg', 'Pomidor sousi, motsarella, rayhon.', 'xamir, motsarella, pomidor')] },
      { key: 'desserts', title: 'Desertlar', dishes: [dish('d9', 'Shokoladli tort', '29 000', 'food-dessert.jpg', 'Qora shokolad va yong‘oq bilan.', 'shokolad, yong‘oq')] },
      { key: 'drinks', title: 'Issiq ichimliklar', dishes: [dish('d10', 'Kapuchino', '22 000', 'food-coffee.jpg', 'Ikki shot espresso va sut ko‘pigi.', 'kofe, sut')] },
    ],
  };
  const tables = [
    { number: 1, floor: 1, seats: 2, x: 18, y: 22, shape: 'round' },
    { number: 2, floor: 1, seats: 4, x: 45, y: 22, shape: 'round' },
    { number: 3, floor: 1, seats: 6, x: 76, y: 24, shape: 'rectangle' },
    { number: 4, floor: 1, seats: 4, x: 20, y: 70, shape: 'rectangle' },
    { number: 5, floor: 1, seats: 8, x: 55, y: 68, shape: 'rectangle' },
    { number: 6, floor: 1, seats: 2, x: 84, y: 72, shape: 'round' },
  ];
  const states = { 2: 'booked', 5: 'occupied' };
  const lang = document.documentElement.lang;

  window.RF3DLoad().then((api) => {
    document.getElementById('openMenu').onclick = () => api.fullscreenMenu.open({ data, lang, onAddToCart: (d, qty) => console.log('[demo] add', d.id, qty) });

    const hall = document.getElementById('hall');
    let selected = null;
    const drawHall = () => api.hall.mount(hall, { tables, width: 14, length: 10, states, selected, lang, onSelect: (n) => { selected = n; document.getElementById('hallStatus').textContent = n + '-stol tanlandi.'; drawHall(); } });
    drawHall();

    // Lip-sync check without TTS: a syllable-like modulated tone drives the analyser.
    // The AI concierge (public/concierge-avatar.js, SVG) with analyser lip-sync.
    const avatar = window.RFConcierge?.mount(document.getElementById('avatar'));
    avatar?.mode('speaking');
    document.getElementById('talk').onclick = () => {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator(), gain = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain(), analyser = ctx.createAnalyser();
      osc.frequency.value = 180; lfo.frequency.value = 4.5; depth.gain.value = 0.25; gain.gain.value = 0.25;
      lfo.connect(depth); depth.connect(gain.gain); osc.connect(gain); gain.connect(analyser); gain.connect(ctx.destination);
      analyser.fftSize = 512; avatar?.speak(analyser);
      osc.start(); lfo.start();
      setTimeout(() => { osc.stop(); lfo.stop(); avatar?.speak(null); ctx.close(); }, 2500);
    };
  });
})();
