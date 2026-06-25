// ============================================================
//  QuizSphere — quiz.js
//  Handles quiz config, randomization, navigation, scoring
// ============================================================

let quizQuestions  = [];
let userAnswers    = [];
let currentIndex   = 0;
let quizSubmitted  = false;

// ── Utilities ────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function updateSliderLabel(sliderId, labelId) {
  const val = document.getElementById(sliderId).value;
  document.getElementById(labelId).textContent = val;
}

function showToast(msg, duration = 3000) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Config & Start ────────────────────────────────────────────

function showQuizConfig() {
  // Reset results
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('quizSection').style.display   = 'none';
  showModal('quizConfigModal');
}

function startQuiz() {
  const mcqCount = parseInt(document.getElementById('mcqCount').value);
  const tfCount  = parseInt(document.getElementById('tfCount').value);

  const selectedMCQ = shuffle(MCQ_BANK).slice(0, mcqCount);
  const selectedTF  = shuffle(TF_BANK).slice(0,  tfCount);

  // Shuffle MCQ options while keeping track of correct index
  quizQuestions = shuffle([...selectedMCQ, ...selectedTF]).map(q => {
    if (q.type === 'mcq') {
      const indexed = q.options.map((opt, i) => ({ opt, original: i }));
      const shuffled = shuffle(indexed);
      const newAnswerIndex = shuffled.findIndex(x => x.original === q.answer);
      return {
        ...q,
        options: shuffled.map(x => x.opt),
        answer:  newAnswerIndex,
      };
    }
    return { ...q };
  });

  userAnswers   = new Array(quizQuestions.length).fill(null);
  currentIndex  = 0;
  quizSubmitted = false;

  closeModal('quizConfigModal');
  document.getElementById('quizSection').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderQuestion();
}

function exitQuiz() {
  if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
    document.getElementById('quizSection').style.display = 'none';
  }
}

// ── Rendering ────────────────────────────────────────────────

function renderQuestion() {
  const q     = quizQuestions[currentIndex];
  const total = quizQuestions.length;

  // Progress
  const pct = Math.round(((currentIndex + 1) / total) * 100);
  document.getElementById('quizProgressBar').style.width = pct + '%';
  document.getElementById('questionCounter').textContent =
    `Question ${currentIndex + 1} / ${total}`;

  // Nav buttons
  document.getElementById('prevBtn').style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
  const isLast = currentIndex === total - 1;
  document.getElementById('nextBtn').style.display   = isLast ? 'none'  : 'inline-flex';
  document.getElementById('submitBtn').style.display = isLast ? 'inline-flex' : 'none';

  // Build question card
  const area = document.getElementById('questionArea');
  const tagClass = q.type === 'mcq' ? 'tag-mcq' : 'tag-tf';
  const tagLabel = q.type === 'mcq' ? 'Multiple Choice' : 'True / False';

  let optionsHTML = '';
  if (q.type === 'mcq') {
    const letters = ['A','B','C','D'];
    optionsHTML = `<ul class="options-list">
      ${q.options.map((opt, i) => {
        const sel = userAnswers[currentIndex] === i ? 'selected' : '';
        return `<li><button class="option-btn ${sel}" onclick="selectAnswer(${i})" data-idx="${i}">
          <span class="option-letter">${letters[i]}</span>${opt}</button></li>`;
      }).join('')}
    </ul>`;
  } else {
    const opts = ['True','False'];
    optionsHTML = `<ul class="options-list">
      ${opts.map((opt, i) => {
        const sel = userAnswers[currentIndex] === i ? 'selected' : '';
        return `<li><button class="option-btn ${sel}" onclick="selectAnswer(${i})" data-idx="${i}">
          <span class="option-letter">${opt[0]}</span>${opt}</button></li>`;
      }).join('')}
    </ul>`;
  }

  area.innerHTML = `
    <div class="question-card">
      <span class="question-type-tag ${tagClass}">${tagLabel}</span>
      <p class="question-text">Q${currentIndex + 1}. ${q.question}</p>
      ${optionsHTML}
    </div>`;
}

function selectAnswer(optIdx) {
  if (quizSubmitted) return;
  userAnswers[currentIndex] = optIdx;

  // Update button states
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === optIdx);
  });
}

function navigateQuestion(dir) {
  const newIdx = currentIndex + dir;
  if (newIdx < 0 || newIdx >= quizQuestions.length) return;
  currentIndex = newIdx;
  renderQuestion();
}

// ── Submit & Score ────────────────────────────────────────────

function submitQuiz() {
  const unanswered = userAnswers.filter(a => a === null).length;
  if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;

  quizSubmitted = true;
  let correct = 0, wrong = 0, skipped = 0;

  quizQuestions.forEach((q, i) => {
    const ua = userAnswers[i];
    if (ua === null) { skipped++; return; }
    const correctIdx = q.type === 'tf' ? (q.answer === true ? 0 : 1) : q.answer;
    if (ua === correctIdx) correct++; else wrong++;
  });

  const total   = quizQuestions.length;
  const pct     = Math.round((correct / total) * 100);

  // Hide quiz, show results
  document.getElementById('quizSection').style.display    = 'none';
  document.getElementById('resultsSection').style.display = 'block';

  document.getElementById('correctCount').textContent = correct;
  document.getElementById('wrongCount').textContent   = wrong;
  document.getElementById('skippedCount').textContent = skipped;
  document.getElementById('scorePercent').textContent = pct + '%';

  // Ring animation
  const circumference = 314.16;
  const fill = document.getElementById('scoreRingFill');
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => { fill.style.strokeDashoffset = offset; }, 100);

  // Colour ring by score
  fill.style.stroke =
    pct >= 80 ? 'var(--green)' :
    pct >= 50 ? 'var(--indigo)' :
    'var(--red)';

  // Title
  const title = document.getElementById('resultTitle');
  const sub   = document.getElementById('resultSub');
  if (pct === 100) { title.textContent = '🏆 Perfect Score!';       sub.textContent = 'Absolutely flawless. You nailed every question!'; }
  else if (pct >= 80) { title.textContent = '🎉 Excellent Work!';   sub.textContent = 'You really know your stuff. Outstanding performance!'; }
  else if (pct >= 60) { title.textContent = '👍 Good Job!';         sub.textContent = 'A solid performance. A bit more revision and you\'ll ace it!'; }
  else if (pct >= 40) { title.textContent = '📚 Keep Studying!';    sub.textContent = 'You\'re getting there. Review the answers below and try again.'; }
  else                { title.textContent = '💪 Don\'t Give Up!';   sub.textContent = 'Every expert was once a beginner. Review and try again!'; }

  // Build review cards
  const reviewArea = document.getElementById('reviewArea');
  reviewArea.innerHTML = quizQuestions.map((q, i) => {
    const ua = userAnswers[i];
    const correctIdx = q.type === 'tf' ? (q.answer === true ? 0 : 1) : q.answer;
    const opts = q.type === 'mcq' ? q.options : ['True', 'False'];
    const correctText = opts[correctIdx];
    const userText    = ua !== null ? opts[ua] : 'Not answered';
    const isCorrect   = ua === correctIdx;
    const isSkipped   = ua === null;

    const cardClass   = isSkipped ? 'skip-card' : isCorrect ? 'correct-card' : 'wrong-card';
    const icon        = isSkipped ? '⏭' : isCorrect ? '✅' : '❌';

    return `<div class="review-question-card ${cardClass}">
      <p class="review-q-text">${icon} Q${i+1}. ${q.question}</p>
      <p class="review-answer">
        Your answer: <span class="${isSkipped ? '' : isCorrect ? 'ans-correct' : 'ans-wrong'}">${userText}</span>
        ${!isCorrect ? ` &nbsp;|&nbsp; Correct: <span class="ans-correct">${correctText}</span>` : ''}
      </p>
    </div>`;
  }).join('');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToReviews() {
  document.getElementById('reviewSection').scrollIntoView({ behavior: 'smooth' });
}
