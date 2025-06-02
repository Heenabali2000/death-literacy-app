let currentStep = 0;
let steps = [];
let responses = {};
let quizDataByArea = {};

const topicIcons = {
  "Demographics": "🧾",
  "Health Status": "🩺",
  "Planning": "🗓️",
  "Experiences": "🕯️",
  "Work/Volunteering": "🤝",
  "Training": "🎓",
  "Health Professional Status": "👨‍⚕️",
  "Community Perceptions": "🏘️",
  "Communication Ability": "🗣️",
  "Cultural Beliefs": "🧠",
  "Cultural Practices": "🧬",
  "Rituals and Customs": "📜",
  "Cultural Taboos": "⚰️",
  "Caregivers and Roles": "👪",
  "services and support": "💼"
};

function groupByArea(data) {
  return data.reduce((acc, q) => {
    const area = q.area || "General";
    if (!acc[area]) acc[area] = [];
    acc[area].push(q);
    return acc;
  }, {});
}

function renderSteps() {
  const container = document.getElementById("stepsContainer");
  container.innerHTML = "";
  steps = [];

  Object.entries(quizDataByArea).forEach(([area, questions], index) => {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step mb-4";
    stepDiv.id = `step-${index}`;

    const icon = topicIcons[area] || "📘";

    const title = `
      <h4 class="text-success fw-bold">${icon} ${area}</h4>
    `;

    const items = questions.map(q => {
      // Render Likert 1–5 if applicable
      if (
        Array.isArray(q.scale) &&
        q.scale.length === 5 &&
        q.scale.every(label => typeof label === "string") &&
        q.scale.includes("1") && q.scale.includes("5")
      ) {
        const scaleItems = [1, 2, 3, 4, 5].map(num => `
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="${q.id}" id="${q.id}-${num}" value="${num}" required>
            <label class="form-check-label me-3" for="${q.id}-${num}">${num}</label>
          </div>
        `).join('');

        return `<div class="mb-4">
          <label class="form-label fw-semibold d-block" for="${q.id}">${q.text}</label>
          <div class="d-flex flex-wrap ms-2">${scaleItems}</div>
        </div>`;
      } else {
        // Keep original Yes/No or custom scales
        const scaleItems = (q.scale || []).map((label, i) => `
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="${q.id}" id="${q.id}-${i}" value="${label}" required>
            <label class="form-check-label me-3" for="${q.id}-${i}">${label}</label>
          </div>
        `).join('');

        return `<div class="mb-4">
          <label class="form-label fw-semibold d-block" for="${q.id}">${q.text}</label>
          <div class="d-flex flex-wrap ms-2">${scaleItems}</div>
        </div>`;
      }
    }).join('');

    stepDiv.innerHTML = `
      <div class="card shadow-sm p-4">
        <h2 class="text-center fw-bold mb-3">Death Literacy Index Quiz</h2>
        <div class="progress mb-4"><div class="progress-bar bg-success" id="progressBar" style="width: 0%"></div></div>
        ${title}
        ${items}
        <div class="score-summary mt-4 d-none"></div>
        <div class="mt-4 d-flex justify-content-start">
          <button type="button" class="btn btn-success next-or-submit-btn">Next</button>
        </div>
      </div>
    `;

    container.appendChild(stepDiv);
    steps.push(stepDiv);
  });

  // Navigation
  steps.forEach((step, idx) => {
    const btn = step.querySelector(".next-or-submit-btn");
    if (btn) {
      if (idx === steps.length - 1) {
        btn.textContent = "Submit";
        btn.classList.remove("btn-success");
        btn.classList.add("btn-primary");
        btn.addEventListener("click", () => document.getElementById("submitBtn").click());
      } else {
        btn.addEventListener("click", () => changeStep(1));
      }
    }
  });

  showStep(0);
}

function showStep(i) {
  steps.forEach((step, idx) => {
    step.style.display = idx === i ? 'block' : 'none';
  });

  const progressBar = steps[i].querySelector("#progressBar");
  if (progressBar) {
    progressBar.style.width = `${((i + 1) / steps.length) * 100}%`;
  }

  currentStep = i;
}

function changeStep(dir) {
  const next = currentStep + dir;
  if (next >= 0 && next < steps.length) {
    showStep(next);
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  quizDataByArea = groupByArea(quizData);
  renderSteps();
  document.getElementById("quizForm").classList.remove("d-none");
  document.getElementById("startBtn").classList.add("d-none");
});

document.getElementById("submitBtn").addEventListener("click", () => {
  let allAnswered = true;
  quizData.forEach(q => {
    const answered = document.querySelector(`input[name="${q.id}"]:checked`);
    if (!answered) allAnswered = false;
  });

  if (!allAnswered) {
    alert("Please answer all questions before submitting.");
    return;
  }

  responses = {};
  quizData.forEach(q => {
    const selected = document.querySelector(`input[name="${q.id}"]:checked`);
    responses[q.id] = selected ? parseInt(selected.value) : 0;
  });

  showResults();
});

function showResults() {
  const resultBox = document.getElementById("resultsSummary");
  const overallSpan = document.getElementById("overallScore");
  const scores = {}, counts = {};

  quizData.forEach(q => {
    const area = q.area || "General";
    if (!scores[area]) {
      scores[area] = 0;
      counts[area] = 0;
    }
    scores[area] += responses[q.id] || 0;
    counts[area]++;
  });

  let totalScore = 0, totalCount = 0;
  let output = `<ul class="list-unstyled">`;

  Object.keys(scores).forEach((area, index) => {
    const avg = scores[area] / counts[area];
    totalScore += scores[area];
    totalCount += counts[area];

    const icon = topicIcons[area] || "📘";

    output += `
      <li class="mb-2 p-2 rounded bg-success bg-opacity-10 border-start border-success border-4 d-flex align-items-center">
        <span class="me-2">${icon}</span><strong>${area}:</strong> <span class="ms-auto">${avg.toFixed(2)}</span>
      </li>`;

    const stepCard = document.getElementById(`step-${index}`);
    if (stepCard) {
      const summaryDiv = stepCard.querySelector(".score-summary");
      if (summaryDiv) {
        summaryDiv.classList.remove("d-none");
        summaryDiv.classList.add("bg-success", "bg-opacity-10", "p-3", "rounded");
        summaryDiv.innerHTML = `${icon} <strong>${area} average score:</strong> ${avg.toFixed(2)}`;
      }
    }
  });

  const overall = (totalScore / totalCount).toFixed(2);

  output += `</ul>
    <hr/>
    <div class="mt-3">
      <b class="text-success">🧮 Overall Death Literacy Score:</b> ${overall}<br/>
      <p>You have a strong level of death literacy across multiple domains. This suggests you are well-equipped to navigate conversations, care, and planning related to end-of-life matters.</p>
      <p class="text-muted">This tool is based on the revised Death Literacy Index (Revised 2024)</p>
    </div>`;

  resultBox.innerHTML = output;
  overallSpan.innerText = overall;

  document.getElementById("results").classList.remove("d-none");
  document.getElementById("quizForm").classList.add("d-none");
  document.getElementById("submitBtn").classList.add("d-none");
}
