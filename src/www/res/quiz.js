///<reference lib="dom"/>
//@ts-nocheck

const alphabet = "abcdefghijklmnopqrstuvwxyz";

class Quiz {
	constructor(root=HTMLElement.prototype, questions=[]) {
		while (root.lastChild) root.removeChild(root.lastChild);
		this.done = fetch("/api/quiz-get?quizId="+root.getAttribute("data-topic")).then(async r=>{
			const quizData = await r.json();
			const title = document.createElement("h2");
			title.textContent = "Quiz - "+quizData.title;
			const form = document.createElement("form");
			form.name = quizData.id;
			form.action = "javascript:void(0);";
			let questionCounter = 1;
			for (let [qId, question] of Object.entries(quizData.questions)) {
				const questionField = document.createElement("fieldset");
				const questionLegend = document.createElement("legend");
				questionLegend.textContent = `${questionCounter}. ${question.description}`;
				questionField.appendChild(questionLegend);
				let choiceCounter = 0;
				let setRequired = true
				for (let [cId, choice] of Object.entries(question.choices)) {
					const choiceLabel = document.createElement("label");
					const choiceInput = document.createElement("input");
					choiceInput.name = qId;
					choiceInput.value = cId;
					choiceInput.type = "radio";
					if (setRequired) {
						choiceInput.required = true;
						setRequired = false;
					}
					choiceInput.setAttribute("data-letter", alphabet[choiceCounter]);
					const choiceText = document.createTextNode(choice);
					choiceLabel.appendChild(choiceInput);
					choiceLabel.appendChild(choiceText);
					questionField.appendChild(choiceLabel);
					choiceCounter++;
				}
				form.appendChild(questionField);
				questionCounter++;
			}
			const markButton = document.createElement("button");
			markButton.textContent = "Submit Answers for Marking"
			markButton.type = "submit";
			// mark the quiz
			form.addEventListener("submit",async e=>{
				e.preventDefault();
				const formAnswers = new URLSearchParams(new FormData(form));
				form.className = "marked";
				for (let [questionId,correctAnswer] of Object.entries(await (await fetch(`/api/quiz-answers?quizId=${quizData.id}`)).json())) {
					const answer = formAnswers.get(questionId);
					if (correctAnswer === answer) {
						const ele = document.querySelector(`input[value="${answer}"][name="${questionId}"]`).parentElement;
						ele.className = "correct";
					} else {
						const answered = document.querySelector(`input[value="${answer}"][name="${questionId}"]`).parentElement;
						const actual = document.querySelector(`input[value="${correctAnswer}"][name="${questionId}"]`).parentElement;
						answered.className = "incorrect";
						actual.className = "actual";
					}
				}
			});
			form.appendChild(markButton);
			root.appendChild(title);
			root.appendChild(form);
			if (window.renderMathInElement) renderMathInElement(form);
		});
	}
}

const quizElements = document.getElementsByClassName("quiz");
for (let e of quizElements) {
	new Quiz(e);
}