// ============================================================
//  QuizSphere — reviews.js
//  User review form with star rating + local display
// ============================================================

let selectedRating = 0;

// ── Star Rating ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('#starRating .star');

  stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseleave', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.val);
      highlightStars(selectedRating);
    });
  });

  // Render any saved reviews from localStorage
  renderReviews();
});

function highlightStars(n) {
  document.querySelectorAll('#starRating .star').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
}

// ── Submit Review ─────────────────────────────────────────────

function submitReview() {
  const name   = document.getElementById('reviewName').value.trim();
  const text   = document.getElementById('reviewText').value.trim();
  const rating = selectedRating;

  if (!name)   { showToast('⚠️ Please enter your name.'); return; }
  if (!rating) { showToast('⚠️ Please select a star rating.'); return; }
  if (!text)   { showToast('⚠️ Please write a review.'); return; }

  const review = {
    name,
    rating,
    text,
    date: new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
  };

  // Save to localStorage
  const existing = JSON.parse(localStorage.getItem('quizReviews') || '[]');
  existing.unshift(review);
  localStorage.setItem('quizReviews', JSON.stringify(existing.slice(0, 50)));

  // Reset form
  document.getElementById('reviewName').value  = '';
  document.getElementById('reviewText').value  = '';
  selectedRating = 0;
  highlightStars(0);

  showToast('🎉 Thank you for your review!');
  renderReviews();
}

// ── Render Reviews ────────────────────────────────────────────

function renderReviews() {
  const list = document.getElementById('reviewsList');
  const all  = getSeedReviews().concat(
    JSON.parse(localStorage.getItem('quizReviews') || '[]')
  );

  if (!all.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:.9rem;">Be the first to leave a review!</p>';
    return;
  }

  list.innerHTML = all.map(r => `
    <div class="review-card">
      <div class="review-card-header">
        <span class="review-card-name">${escHtml(r.name)}</span>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p class="review-card-text">${escHtml(r.text)}</p>
      <p class="review-card-date">${r.date}</p>
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Seed Reviews (pre-populated for first-time visitors) ─────

function getSeedReviews() {
  return [
    { name:"Aisha M.",      rating:5, text:"Absolutely love this quiz site! The random question order keeps it fresh every single time. Spent an hour here without even realising it.", date:"Jun 12, 2025" },
    { name:"Daniel K.",     rating:5, text:"Super clean design and a great variety of questions. No annoying login walls — just jump straight in. Will definitely be coming back!", date:"Jun 8, 2025"  },
    { name:"Priya S.",      rating:4, text:"Really enjoyed the True/False section. A few questions surprised me — I thought I knew but I was wrong! Great for learning something new.", date:"May 29, 2025" },
    { name:"Omar H.",       rating:5, text:"Best free quiz site I've found. The progress bar and score ring at the end are a really nice touch. Showed it to my whole class.", date:"May 22, 2025" },
    { name:"Sophie T.",     rating:4, text:"Solid question bank with a good mix of topics. Would love even more science questions, but overall this is great!", date:"May 15, 2025" },
  ];
}
