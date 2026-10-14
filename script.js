'use strict';
const $ = id => document.getElementById(id);
let base = 100, score = 0, index = 0, questions = [], locked = false;
const TOTAL = 10;
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function makeQuestion(value, unit) {
  const answer = Math.round(value / unit) * unit;
  const candidates = [answer, answer + unit, answer > 0 ? answer - unit : answer + 2 * unit];
  return { value, answer, options: shuffle(candidates) };
}
function show(id) { ['setup', 'game', 'result'].forEach(section => { $(section).hidden = section !== id; }); }
document.querySelectorAll('.level').forEach(button => {
  button.addEventListener('click', () => {
    base = Number(button.dataset.base);
    document.querySelectorAll('.level').forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
});
function start() {
  score = 0; index = 0;
  const values = new Set();
  while (values.size < TOTAL) {
    const value = Math.floor(Math.random() * (9 * base)) + base;
    if (value % base !== 0) values.add(value);
  }
  questions = [...values].map(value => makeQuestion(value, base));
  show('game'); renderQuestion();
}
function renderQuestion() {
  locked = false;
  const q = questions[index];
  $('counter').textContent = `السؤال ${index + 1} من ${TOTAL}`;
  $('score').textContent = `⭐ ${score} نقطة`;
  $('progress').value = index;
  $('question').innerHTML = `قرّب العدد <strong dir="ltr">${q.value}</strong><br>لأقرب ${base}`;
  $('answers').replaceChildren();
  $('feedback').textContent = ''; $('feedback').className = '';
  $('next').hidden = true;
  q.options.forEach(value => {
    const button = document.createElement('button');
    button.className = 'answer'; button.textContent = value;
    button.addEventListener('click', () => choose(value, button));
    $('answers').append(button);
  });
  $('question').focus();
}
function choose(value, selected) {
  if (locked) return;
  locked = true;
  const q = questions[index], correct = value === q.answer;
  if (correct) score += 10;
  [...$('answers').children].forEach(button => {
    button.disabled = true;
    if (Number(button.textContent) === q.answer) { button.classList.add('correct'); button.textContent += ' ✓'; }
    else if (button === selected) { button.classList.add('wrong'); button.textContent += ' ✕'; }
    else button.classList.add('muted');
  });
  const digit = Math.floor(q.value / (base / 10)) % 10;
  const place = {10:'الآحاد',100:'العشرات',1000:'المئات'}[base];
  $('feedback').className = correct ? '' : 'incorrect';
  $('feedback').innerHTML = `<strong>${correct ? 'أحسنت يا بطل! ⭐ +10 نقاط' : 'محاولة جميلة! لنتعلّم معًا 💛'}</strong>رقم ${place} هو ${digit}، ${digit >= 5 ? 'وهو 5 أو أكثر، فنقرّب للأعلى' : 'وهو أقل من 5، فنقرّب للأسفل'}.<br>إذن ${q.value} ≈ ${q.answer}`;
  $('score').textContent = `⭐ ${score} نقطة`;
  $('progress').value = index + 1;
  $('next').textContent = index === TOTAL - 1 ? 'شاهد نتيجتك 🏆' : 'السؤال التالي ←';
  $('next').hidden = false;
  $('next').focus();
}
function finish() {
  show('result');
  $('result-title').textContent = score >= 80 ? 'أنت بطل التقريب!' : 'أحسنت، واصل التعلّم!';
  $('result-message').textContent = `أجبت عن ${score / 10} من ${TOTAL} أسئلة بشكل صحيح. ${score === 100 ? 'جولة رائعة بكل النجوم! 🌟' : 'كل جولة جديدة فرصة لتتألّق أكثر! 🌈'}`;
  $('final-score').textContent = `⭐ ${score} / 100`;
  try {
    const key = `rounding-hero-best-${base}`;
    const stored = Number(localStorage.getItem(key));
    const best = Math.max(Number.isFinite(stored) ? stored : 0, score);
    localStorage.setItem(key, String(best));
    $('best').textContent = `أفضل نتيجة على هذا الجهاز لأقرب ${base}: ${best} نقطة`;
  } catch { $('best').textContent = 'أكملت التحدّي! جرّب جولة أخرى.'; }
  $('result-title').focus();
}
$('start').addEventListener('click', start);
$('again').addEventListener('click', start);
$('next').addEventListener('click', () => { if (!locked) return; index++; index < TOTAL ? renderQuestion() : finish(); });
['home','change'].forEach(id => $(id).addEventListener('click', () => { show('setup'); $('start').focus(); }));
