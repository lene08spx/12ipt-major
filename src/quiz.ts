
/** interacts with the sqlite db */

interface Question {
	correctChoiceIndex: number;
	choices: string[];
}

type Submission = string[];