const LANG = {
  'zh': {
    title: 'SDS Emblem Planner',
    desc: '上传图片，选择裁剪区域，分割为4行。',
    upload: '选择图片',
    crop: '裁剪并分割',
    leftPad: '左侧边距',
    rightPad: '右侧边距',
    fontSize: '字体大小',
    toggle: 'English',
    emblems: ['艾黛尔贾特', '艾克', '艾莉可', '贝雷特', '琳', '露琪娜', '罗伊', '马尔斯', '米卡雅', '赛莉卡', '神威', '辛格尔特'],
  },
  'en': {
    title: 'SDS Emblem Planner',
    desc: 'Upload an image, select a crop region, and slice into 4 rows.',
    upload: 'Choose an image',
    crop: 'Crop & Slice',
    leftPad: 'Left Pad',
    rightPad: 'Right Pad',
    fontSize: 'Font Size',
    toggle: '中文',
    emblems: ['Edelgard', 'Ike', 'Eirika', 'Byleth', 'Lyn', 'Lucina', 'Roy', 'Marth', 'Micaiah', 'Celica', 'Corrin', 'Sigurd'],
  },
};

let currentLang = 'en';

const imageInput = document.getElementById('imageInput');
const cropSection = document.getElementById('cropSection');
const cropImage = document.getElementById('cropImage');
const cropCanvas = document.getElementById('cropCanvas');
const slicesContainer = document.getElementById('slices');
const cropBtn = document.getElementById('cropBtn');
const sliceControls = document.getElementById('sliceControls');
const leftPad = document.getElementById('leftPad');
const rightPad = document.getElementById('rightPad');
const leftPadVal = document.getElementById('leftPadVal');
const rightPadVal = document.getElementById('rightPadVal');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeVal = document.getElementById('fontSizeVal');
const langToggle = document.getElementById('langToggle');
const desc = document.getElementById('desc');
const uploadLabel = document.getElementById('uploadLabel');

const ICON_MAP = {
  '艾黛尔贾特': 'edelgard.png',
  '艾克': 'ike.png',
  '艾莉可': 'eirikia.png',
  '贝雷特': 'byleth.png',
  '琳': 'lyn.png',
  '露琪娜': 'lucina.png',
  '罗伊': 'roy.png',
  '马尔斯': 'marth.png',
  '米卡雅': 'micaiah.png',
  '赛莉卡': 'celica.png',
  '神威': 'corrin.png',
  '辛格尔特': 'sigurd.png',
};

let imgNatural = null;
let crop = { x1: 0, y1: 0, x2: 0, y2: 0 };
let drawing = false;

imageInput.addEventListener('change', handleImage);

function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    imgNatural = img;
    cropImage.src = img.src;
    slicesContainer.classList.add('hidden');
    sliceControls.classList.add('hidden');
    slicesContainer.innerHTML = '';
    showCrop();
  };
  img.src = URL.createObjectURL(file);
}

function showCrop() {
  cropSection.classList.remove('hidden');
  cropCanvas.width = cropImage.offsetWidth;
  cropCanvas.height = cropImage.offsetHeight;
  cropCanvas.style.width = cropImage.offsetWidth + 'px';
  cropCanvas.style.height = cropImage.offsetHeight + 'px';
  crop = { x1: 0, y1: 0, x2: cropCanvas.width, y2: cropCanvas.height };
  drawOverlay();
}

function drawOverlay() {
  const ctx = cropCanvas.getContext('2d');
  ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  const x1 = Math.min(crop.x1, crop.x2);
  const y1 = Math.min(crop.y1, crop.y2);
  const x2 = Math.max(crop.x1, crop.x2);
  const y2 = Math.max(crop.y1, crop.y2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
  ctx.clearRect(x1, y1, x2 - x1, y2 - y1);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.setLineDash([]);
}

function getPos(e) {
  const rect = cropCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;
  return { x: Math.max(0, Math.min(x, cropCanvas.width)), y: Math.max(0, Math.min(y, cropCanvas.height)) };
}

cropCanvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const pos = getPos(e);
  crop.x1 = pos.x; crop.y1 = pos.y;
  crop.x2 = pos.x; crop.y2 = pos.y;
});

cropCanvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  crop.x2 = pos.x; crop.y2 = pos.y;
  drawOverlay();
});

cropCanvas.addEventListener('mouseup', () => { drawing = false; });
cropCanvas.addEventListener('mouseleave', () => { drawing = false; });

cropCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  drawing = true;
  const pos = getPos(e);
  crop.x1 = pos.x; crop.y1 = pos.y;
  crop.x2 = pos.x; crop.y2 = pos.y;
}, { passive: false });

cropCanvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const pos = getPos(e);
  crop.x2 = pos.x; crop.y2 = pos.y;
  drawOverlay();
}, { passive: false });

cropCanvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  drawing = false;
}, { passive: false });

cropBtn.addEventListener('click', doCropAndSlice);

langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  translate();
});

function translate() {
  const t = LANG[currentLang];
  document.querySelector('h1').textContent = t.title;
  desc.textContent = t.desc;
  uploadLabel.textContent = t.upload;
  cropBtn.textContent = t.crop;
  document.querySelectorAll('.ctrl-label').forEach(el => {
    el.textContent = t[el.dataset.key];
  });
  langToggle.textContent = t.toggle;
  document.querySelectorAll('.option[data-index]').forEach(el => {
    el.textContent = t.emblems[el.dataset.index];
  });
  document.querySelectorAll('.custom-select.selected').forEach(el => {
    const val = el.dataset.selected;
    if (val) {
      const idx = LANG.zh.emblems.indexOf(val);
      if (idx !== -1) {
        const label = el.querySelector('.sel-label');
        if (label) label.textContent = t.emblems[idx];
      }
    }
  });
}

leftPad.addEventListener('input', applySliderValues);
rightPad.addEventListener('input', applySliderValues);
fontSizeSlider.addEventListener('input', applySliderValues);

function applySliderValues() {
  leftPadVal.textContent = leftPad.value;
  rightPadVal.textContent = rightPad.value;
  fontSizeVal.textContent = fontSizeSlider.value;
  document.querySelectorAll('.slots-grid').forEach(g => {
    g.style.paddingLeft = leftPad.value + '%';
    g.style.paddingRight = rightPad.value + '%';
  });
  document.querySelectorAll('.custom-select').forEach(s => {
    s.style.fontSize = fontSizeSlider.value + 'px';
  });
}

function doCropAndSlice() {
  const dispW = cropImage.offsetWidth;
  const dispH = cropImage.offsetHeight;
  const x1 = Math.min(crop.x1, crop.x2);
  const y1 = Math.min(crop.y1, crop.y2);
  const x2 = Math.max(crop.x1, crop.x2);
  const y2 = Math.max(crop.y1, crop.y2);
  const cw = x2 - x1;
  const ch = y2 - y1;
  if (cw < 4 || ch < 4) return;
  const scaleX = imgNatural.naturalWidth / dispW;
  const scaleY = imgNatural.naturalHeight / dispH;
  const sx = Math.round(x1 * scaleX);
  const sy = Math.round(y1 * scaleY);
  const sw = Math.round(cw * scaleX);
  const sh = Math.round(ch * scaleY);
  const full = document.createElement('canvas');
  full.width = sw;
  full.height = sh;
  full.getContext('2d').drawImage(imgNatural, sx, sy, sw, sh, 0, 0, sw, sh);
  sliceImage(full);
}

function sliceImage(sourceCanvas) {
  const rowHeight = sourceCanvas.height / 4;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = sourceCanvas.width;
  canvas.height = rowHeight;

  slicesContainer.innerHTML = '';
  slicesContainer.classList.remove('hidden');
  sliceControls.classList.remove('hidden');

  for (let i = 0; i < 4; i++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sourceCanvas, 0, -i * rowHeight);
    const dataUrl = canvas.toDataURL('image/png');

    const group = document.createElement('div');
    group.className = 'row-group';

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Row ${i + 1}`;
    group.appendChild(img);

    const slots = document.createElement('div');
    slots.className = 'slots-grid';
    for (let s = 0; s < 5; s++) {
      slots.appendChild(createSlot());
    }
    group.appendChild(slots);
    slicesContainer.appendChild(group);
  }
  applySliderValues();
}

let openDropdown = null;

document.addEventListener('click', (e) => {
  if (openDropdown && !openDropdown.contains(e.target)) {
    openDropdown.classList.remove('open');
    openDropdown = null;
  }
});

function createSlot() {
  const div = document.createElement('div');
  div.className = 'slot';

  const customSelect = document.createElement('div');
  customSelect.className = 'custom-select';

  const trigger = document.createElement('div');
  trigger.className = 'select-trigger';
  trigger.innerHTML = '<span class="placeholder">—</span>';

  const optionsList = document.createElement('div');
  optionsList.className = 'select-options';

  function addOption(value, label, index) {
    const opt = document.createElement('div');
    opt.className = 'option';
    opt.dataset.value = value;
    if (index !== undefined) opt.dataset.index = index;
    opt.textContent = label;
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectValue(value, label);
    });
    optionsList.appendChild(opt);
  }

  addOption('', '—');
  LANG.zh.emblems.forEach((name, i) => {
    addOption(name, LANG[currentLang].emblems[i], i);
  });

  function selectValue(val, label) {
    if (val) {
      document.querySelectorAll('.custom-select.selected').forEach(el => {
        if (el.dataset.selected === val && el !== customSelect) {
          const t = el.querySelector('.select-trigger');
          if (t) t.innerHTML = '<span class="placeholder">—</span>';
          el.classList.remove('selected');
          delete el.dataset.selected;
        }
      });
      const idx = LANG.zh.emblems.indexOf(val);
      const curLabel = idx !== -1 ? LANG[currentLang].emblems[idx] : label;
      trigger.innerHTML = `<img class="sel-icon" src="icons/${ICON_MAP[val]}" alt="" /><span class="sel-label">${curLabel}</span>`;
      customSelect.classList.add('selected');
      customSelect.dataset.selected = val;
    } else {
  trigger.innerHTML = '<span class="placeholder">—</span>';
      customSelect.classList.remove('selected');
      delete customSelect.dataset.selected;
    }
    customSelect.classList.remove('open');
    openDropdown = null;
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = customSelect.classList.contains('open');
    if (openDropdown) {
      openDropdown.classList.remove('open');
    }
    if (!wasOpen) {
      customSelect.classList.add('open');
      openDropdown = customSelect;
    } else {
      openDropdown = null;
    }
  });

  customSelect.appendChild(trigger);
  customSelect.appendChild(optionsList);
  div.appendChild(customSelect);
  return div;
}
