///<reference lib="dom"/>
//@ts-nocheck

const alphabet = "abcdefghijklmnopqrstuvwxyz";

class Quiz {
	constructor(root=HTMLElement.prototype, questions=[]) {
		while (root.lastChild) root.removeChild(root.lastChild);
		this.done = fetch("/api/quiz-get?quizId="+root.getAttribute("data-topic")).then(async r=>{
			const quizData = await r.json();
			const title = document.createElement("h2");
			title.textContent = quizData.title;
			const form = document.createElement("form");
			form.name = quizData.id;
			let questionCounter = 1;
			for (let [qId, question] of Object.entries(quizData.questions)) {
				const questionField = document.createElement("fieldset");
				const questionLegend = document.createElement("legend");
				questionLegend.textContent = `${questionCounter}. ${question.description}`;
				questionField.appendChild(questionLegend);
				let choiceCounter = 0;
				for (let [cId, choice] of Object.entries(question.choices)) {
					const choiceLabel = document.createElement("label");
					const choiceInput = document.createElement("input");
					choiceInput.name = qId;
					choiceInput.value = cId;
					choiceInput.type = "radio";
					choiceInput.required = true;
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