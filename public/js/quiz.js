document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('startBtn');
  const submitBtn = document.getElementById('submitBtn');
  const quizForm = document.getElementById('quizForm');
  const questionsContainer = document.getElementById('questionsContainer');
  const progressBar = document.getElementById('progressBar');
  const results = document.getElementById('results');
  const scoreDisplay = document.getElementById('scoreDisplay');

  const questionsPerPage = 10;
  let currentPage = 0;
  const answers = {};

  startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    results.style.display = 'none';
    currentPage = 0;
    showQuestions(currentPage);
    updateProgress(0);
  });

  quizForm.addEventListener('submit', function (e) {
    e.preventDefault();
    results.style.display = 'block';
    updateProgress(100);
    showResults();
  });

  function showQuestions(page) {
    questionsContainer.innerHTML = '';
    const start = page * questionsPerPage;
    const end = Math.min(start + questionsPerPage, quizData.length);
    const pageQuestions = quizData.slice(start, end);

    pageQuestions.forEach((q, index) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'mb-3';
      qDiv.innerHTML = `<p><strong>${start + index + 1}. ${q.text}</strong></p>`;

      q.scale.forEach((opt, i) => {
        const inputId = `${q.id}_${i}`;
        qDiv.innerHTML += `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="${q.id}" value="${opt}" id="${inputId}" required />
            <label class="form-check-label" for="${inputId}">${opt}</label>
          </div>
        `;
      });

      questionsContainer.appendChild(qDiv);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary mt-3';
    nextBtn.type = 'button';
    nextBtn.textContent = (end === quizData.length) ? 'Review & Submit' : 'Next';

    nextBtn.addEventListener('click', () => {
      let allAnswered = true;
      pageQuestions.forEach(q => {
        const selected = quizForm.querySelector(`input[name="${q.id}"]:checked`);
        if (!selected) allAnswered = false;
        else answers[q.id] = selected.value;
      });

      if (!allAnswered) {
        alert("Please answer all questions before proceeding.");
        return;
      }

      if (end === quizData.length) {
        showConfirmation();
      } else {
        currentPage++;
        showQuestions(currentPage);
        updateProgress((currentPage * questionsPerPage / quizData.length) * 100);
      }
    });

    questionsContainer.appendChild(nextBtn);
  }

  function showConfirmation() {
    questionsContainer.innerHTML = `
      <div class="alert alert-info">
        <h4>Review Complete</h4>
        <p>Please review your responses and click <strong>Submit</strong> to finish.</p>
      </div>
    `;
    submitBtn.style.display = 'inline-block';
  }

  function showResults() {
    // Send to backend
    fetch('/save-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    }).then(res => res.json())
      .then(data => {
        scoreDisplay.textContent = data.message || "Responses recorded successfully.";
      }).catch(err => {
        scoreDisplay.textContent = "⚠️ Error submitting quiz.";
        console.error(err);
      });

    // Show answer summary
    const summary = document.createElement('div');
    for (let key in answers) {
      const q = quizData.find(q => q.id === key);
      const ans = answers[key];
      summary.innerHTML += `
        <div class="mb-2">
          <strong>${q.text}</strong><br/>
          <span class="text-muted">Your answer: ${ans}</span>
        </div>
      `;
    }
    results.appendChild(summary);
  }

  function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent);
  }
});
