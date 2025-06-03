$(document).ready(function () {
  var currentQuestionIndex = 0;
  var totalSections = 6; // Total sections (6 domains)
  var currentSectionIndex = 0;
  var answers = [];
  var averageScores={};
  var overallScore=0;
  var feedback = '';
  var questions = [
    {
      title: "🗣️ Talking-Support",
      subtitle:
        "This reflects your grace in having conversations around death, dying, and grief.",
      scale: "(1 = Not at all able, 5 = Very able)",
      questions: [
        "Talking about death, dying or grief to a close friend",
        "Talking about death, dying or grieving with a child",
        "Talking to a grieving person about their loss",
        "Talking to a health professional about getting support for a dying person where they live",
      ],
    },
    {
      title: "👐 Providing Hands-On Care",
      subtitle:
        "This indicates how prepared you feel to provide direct care to someone nearing end-of-life.",
      scale: "(1 = Not at all able, 5 = Very able)",
      questions: [
        "Feed or help a person to eat",
        "Wash a person",
        "Lifting a person or helping them move",
        "Administer injections",
      ],
    },
    {
      title: "🌱 Experiential Knowledge",
      subtitle:
        "Your life experiences appear to have significantly contributed to your emotional preparedness and understanding.",
      scale: "(1 = Do not agree at all, 5 = Strongly agree)",
      questions: [
        "Made me more emotionally prepared to support others with death, dying and bereavement",
        "Made me think about what is important and not important in life",
        "Developed my wisdom and understanding",
        "Made me more compassionate toward myself",
        "Made me better prepared to face similar challenges in the future",
      ],
    },
    {
      title: "📘 Factual Knowledge",
      subtitle:
        "You show strong knowledge of legal, medical, and procedural aspects related to dying and death.",
      scale: "(1 = Do not agree at all, 5 = Strongly agree)",
      questions: [
        "I know the rules and regulations when a person dies at home",
        "I know what documents are needed when planning for death",
        "I know enough about the healthcare system to find the support that a dying person needs",
        "I know enough to make decisions about funeral services and options",
        "I know how to access palliative care in my area",
        "I know enough about how illnesses progress to make decisions about medical treatments at end of life",
        "I know about the ways that cemetery staff can be of help around funerals",
      ],
    },
    {
      title: "🌏 Community Knowledge",
      subtitle:
        "You have some awareness of community resources, though there may be areas for growth or exploration.",
      scale: "(1 = Strongly disagree, 5 = Strongly agree)",
      questions: [
        "To get support in the area where I live (e.g. from clubs, associations or volunteer groups)",
        "To get help with providing day-to-day care for a person at the end of life",
        "To get equipment that is required for care",
        "To get support that is culturally appropriate for a person",
        "To get emotional support for myself",
      ],
    },
    {
      title: "🤝 Community Support",
      subtitle:
        "You believe your community offers support for those affected by death, dying, and grief.",
      scale: "(1 = Do not agree at all, 5 = Strongly agree)",
      questions: [
        "People with life threatening illnesses",
        "People who are nearing the end of their lives",
        "People who are caring for a dying person",
        "People who are grieving",
      ],
    },
  ];

  // Load the first section
  function loadSection() {
    var currentSection = questions[currentSectionIndex];
    var questionHtml = `<h3 class="section-title">${currentSection.title}</h3>
    <p class="mb-1 fw-bold">${currentSection.subtitle}</p>
    <p class="small fw-bold mb-3 text-end">${currentSection.scale}</p>`;

    currentSection.questions.forEach(function (question, idx) {
      questionHtml += `
              <div class="mb-4">
                <label>${question}</label>
                <div class="rating-container">
                  <label class="form-check-label" for="q${currentSectionIndex}_${idx}_1">1</label>
                  <input type="radio" name="q${currentSectionIndex}_${idx}" id="q${currentSectionIndex}_${idx}_1" value="1" class="form-check-input">
                  <label class="form-check-label" for="q${currentSectionIndex}_${idx}_2">2</label>
                  <input type="radio" name="q${currentSectionIndex}_${idx}" id="q${currentSectionIndex}_${idx}_2" value="2" class="form-check-input">
                  <label class="form-check-label" for="q${currentSectionIndex}_${idx}_3">3</label>
                  <input type="radio" name="q${currentSectionIndex}_${idx}" id="q${currentSectionIndex}_${idx}_3" value="3" class="form-check-input">
                  <label class="form-check-label" for="q${currentSectionIndex}_${idx}_4">4</label>
                  <input type="radio" name="q${currentSectionIndex}_${idx}" id="q${currentSectionIndex}_${idx}_4" value="4" class="form-check-input">
                  <label class="form-check-label" for="q${currentSectionIndex}_${idx}_5">5</label>
                  <input type="radio" name="q${currentSectionIndex}_${idx}" id="q${currentSectionIndex}_${idx}_5" value="5" class="form-check-input">
                </div>
              </div>
            `;
    });

    $("#questionsContainer").html(questionHtml);

    // Update progress bar
    var progress = ((currentSectionIndex + 1) / totalSections) * 100;
    $("#progressBar").css("width", progress + "%");
    $("#progressBar").attr("aria-valuenow", progress);

    // Show submit button when last section is displayed
    if (currentSectionIndex === totalSections - 1) {
      $("#nextBtn").hide();
      $("#submitBtn").show();
    }
  }

  // Handle next question
  $("#nextBtn").on("click", function () {
    // Collect answers from the current section
    var scores = [];
    $(`input[name^="q${currentSectionIndex}"]:checked`).each(function () {
      scores.push(Number($(this).val()));
    });
    answers.push(scores);

    currentSectionIndex++;
    if (currentSectionIndex < totalSections) {
      loadSection();
    }
    $("html, body").animate({ scrollTop: 0 }, "smooth");
  });


  // Handle form submission
  $('#quizForm').on('submit', function(e) {
        e.preventDefault();
        var scores = [];

  // Collect answers from all sections
  $('input[type="radio"]:checked').each(function() {
        scores.push(Number($(this).val()));
  });
  
  
  // Calculate average scores for each domain
averageScores = {
    "Talking-Support": scores.slice(0, 4).reduce((a, b) => a + b, 0) / 4,
    "Providing Hands-On Care": scores.slice(0, 4).reduce((a, b) => a + b, 0) / 4,
    "Experiential Knowledge": scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5,
    "Factual Knowledge": scores.slice(0, 7).reduce((a, b) => a + b, 0) / 7,
    "Community Knowledge": scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5,
    "Community Support": scores.slice(0, 4).reduce((a, b) => a + b, 0) / 4
};

// Calculate overall Score
overallScore = Object.values(averageScores).reduce((sum, score) => sum + score, 0) / Object.values(averageScores).length;

// Send the scores to the server
fetch('/save-scores', {
method: 'POST',
headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify({
  overallScore: overallScore,
  averageScores: averageScores
})
})
.then(response => response.json())
.then(data => {
console.log(data.message);  // Handle the response
})
.catch(error => {
console.error('Error:', error);
});






// Insert the overall score into the HTML
$(`#overallScore`).text(overallScore.toFixed(2));


   // Display results
var resultHtml = '<h4>Results Summary</h4>';
        resultHtml+=`<div><b>Overall Score:</b> ${(overallScore).toFixed(2)}</div>`;
        for (const [section, score] of Object.entries(averageScores)) {
        resultHtml += `
             <div class="result-item">
             <b>${section}:</b> ${score.toFixed(2)} 
             </div>`;
            }
  // Update the results section

        $('#resultsSummary').html(resultHtml);
        $('#results').show();
        $('#quizForm').hide();
  });

  // This code should go after the form submission logic
  $("#submitBtn").click(function () {
    const feedback=[];
      // Determine feedback based on the overall score
    if (overallScore >= 5.8) {
      feedback.push("You scored higher than most people on the Death Literacy Index.");
    }else if (overallScore>=3.86 && overallScore<=5.80) {
      feedback.push("Your score is about average across all areas of death literacy.");
    } else {
      feedback.push("You scored lower than others on the overall Death Literacy Index.");
     }
    
    if (averageScores["Talking-Support"]<4.25) {
        feedback.push("Talking-Support:You scored lower than most people when it comes to talking about death and dying. You might not feel very confident talking about death yet-and that's completely okay");
     } else if (averageScores["Talking-Support"]>6.68){
        feedback.push("Talking-Support:You scored higher than most people in talking about death and dying.You seem really comfortable talking about end-of-life matters, which is a real strength.Use that comfort to gently support others who may find these conversations difficult. You can help make these talks feel safer.");
     } else {
        feedback.push("Talking-Support:Your score is about the same as most people's.You're about as comfortable talking about death as most people. That's a solid place to be.Keep having open conversations when the opportunity comes up—it helps create a more supportive space for everyone.");
     }

     if (averageScores["Providing Hands-On Care"]>5.89){
        feedback.push("Providing Hands-On Care:You scored higher than most people in hands-on support.You've clearly had experience helping someone directly, and that's really valuable.Consider mentoring others or getting involved in your community's end-of-life care efforts. Your experience can make a difference.");
     } else if(averageScores["Providing Hands-On Care"]<3.35){
        feedback.push("Providing Hands-On Care:You scored lower than others in hands-on care.You may not have had much experience helping someone physically at the end of life. That's very common.You could look into volunteering, or even just learn basic care skills—it can help build confidence over time.");
     } else{
        feedback.push("Providing Hands-On Care:Your score is in line with the average when it comes to hands-on support.You've had some hands-on experience, about the same as most people.Share what you've learned, and look for chances to build on your skills when you feel ready.");
     }

     if (averageScores["Experiential Knowledge"]>7.05){
        feedback.push("Experiential Knowledge:You scored higher than others in experience.You've had more exposure to death and dying than most. That gives you valuable perspective.You might find yourself naturally supporting others—your lived experience is a real asset.");
     } else if (averageScores["Experiential Knowledge"]<4.75){
        feedback.push("Experiential Knowledge:You scored lower than others in experience with death and dying.You may not have had many personal or professional experiences with death or dying.Consider listening to others' stories, or gently reflect on your own feelings. That's a good starting point.");
     } else{
        feedback.push("Experiential Knowledge:Your experience score is about average.Your experiences are about average—enough to give you a sense of what death and dying can be like.Stay open to learning from your own experiences and those around you. It builds wisdom.");
     }

     if (averageScores["Factual Knowledge"]>5.08){
         feedback.push("Factual Knowledge:You scored higher than most people in knowledge about end-of-life matters.You know quite a lot about death-related matters. That's a powerful tool.Consider helping others understand what you've learned—many people are looking for someone who can guide them.");
     } else if (averageScores["Factual Knowledge"]<2.5){
         feedback.push("Factual Knowledge:You scored lower than others in death-related knowledge.You might not feel very informed about end-of-life care or services right now.Learning even just a bit more—like what options exist—can help you feel more prepared and confident.");
     } else{
         feedback.push("Factual Knowledge:Your knowledge score is about the same as others'.You've got a good, solid base of knowledge—enough to understand what's going on.Keep asking questions and exploring. It'll help you and those you care about.");
     }

     if (averageScores["Community Knowledge"]>5.7){
         feedback.push("Community Knowledge:You scored higher than others in overall community support.You see your community as supportive and engaged around dying and grieving. That's a real strength.Share what's working—others might be looking for ideas to build similar support in their own communities.");
     } else if(averageScores["Community Knowledge"]>3.5){
         feedback.push("Community Knowledge:You scored lower than others overall in community-related support.You might not feel very supported by your community around death-related matters.See if there are community groups or events that can help build that support. Small actions make a big difference.");
     } else{
        feedback.push("Community Knowledge:Your overall community score is similar to others'.Your sense of community support is about the same as others'.Keep showing up and being part of the conversation—it helps the whole community grow stronger.");
     }

     if (averageScores["Community Support"]>5.39) {
         feedback.push("Community Support:You scored higher than most in community support.You feel like your community is pretty supportive, which is wonderful.Help keep that support going by getting involved and welcoming others in.");
     }  else if (averageScores["Community Support"]>2.91){
         feedback.push("Community Support:You scored lower than others in feeling supported by your community.You might feel like your community doesn't offer much support around death and dying.Think about ways you can connect with others—there may be more support out there than it seems.");
     } else {
        feedback.push("Community Support:Your score is typical when it comes to perceived community support.Your experience with community support is similar to most people's.Look for ways to strengthen those ties—community can be a big help during difficult times.");
     }

// Insert the feedback message into the HTML
  $('#overallScorecontainer .feedback').html(feedback.join("<br><br>"));


    // Display results with detailed explanations
    var resultHtml = "";
    for (const [section, score] of Object.entries(averageScores)) {
      var description = "";

      switch (section) {
        case "🗣️ Talking-Support":
          description =
            "This reflects your grace in having conversations around death, dying, and grief.";
          break;
        case "👐 Providing Hands-On Care":
          description =
            "This indicates how prepared you feel to provide direct care to someone nearing end-of-life.";
          break;
        case "🌱 Experiential Knowledge":
          description =
            "Your life experiences appear to have significantly contributed to your emotional preparedness and understanding.";
          break;
        case "📘 Factual Knowledge":
          description =
            "You show strong knowledge of legal, medical, and procedural aspects related to dying and death.";
          break;
        case "🌏 Community Knowledge":
          description =
            "You have some awareness of community resources, though there may be areas for growth or exploration.";
          break;
        case "🤝 Community Support":
          description =
            "You believe your community offers support for those affected by death, dying, and grief.";
          break;
      }

      resultHtml += `
        <div class="result-item">
          <b>${section}:</b> ${score.toFixed(2)} 
          <p>${description}</p>
        </div>
      `;
    }
// Add the overall score
                  
// Insert the overall score into the HTML
                  
         
         // Update the results section
         $("#resultsSummary").html(resultHtml);

         // Show the results section, hide the quiz form
         $("#results").show();
         $("#quizForm").hide();

         $("html, body").animate(
           {
             scrollTop: $("#results").offset().top,
           },
           "slow"
         );
       });
       // Initial load
       loadSection();
  });
