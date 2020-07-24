import { serve, ServerRequest, parse, exists, fromFileUrl, DB } from "./deps.ts";
//import { PageModule } from "./page.ts";
/** Provide engaging material for school. */
const webPort = 2020;
const webURL = `http://localhost:${webPort}/index.html`;
const webRoot = decodeURI(fromFileUrl(new URL("./www", import.meta.url)));
const quizDB = new DB(decodeURI(fromFileUrl(new URL("./quiz.sqlite3",import.meta.url))));

const MIME = {
  ".html":	"text/html",
  ".png":		"image/png",
  ".jpg":		"image/jpeg",
  ".jpeg":	"image/jpeg",
  ".css": 	"text/css",
  ".txt": 	"text/plain",
  ".js": 		"application/javascript",
  ".json": 	"application/json",
	".svg": 	"image/svg+xml",
	".ttf":		"font/ttf",
	".gif":		"image/gif",
	".mp3":		"audio/mpeg",
	".mp4":		"video/mp4",
};

// Start web service
const s = serve({ port: webPort });
console.log("+----------------------------------------+");
console.log("| SPX StudyCities                        |");
console.log("|                                        |");
console.log("| 2020 IPT - Major Project               |");
console.log("| Oliver Lenehan                         |");
console.log("|                                        |");
console.log("| Visit "+webURL+" |");
console.log("+----------------------------------------+");

// Auto open user's browser
const p = Deno.run({ cmd: ["cmd", "/C", "start", "", webURL] });
await p.status();
Deno.close(p.rid);

window.onunload = ()=>{quizDB.close()};

// Handle requests
for await (const r of s) {
  if (r.url === "/")
    r.respond({
			status: 308,
			headers: new Headers({"Location": "/index.html"})
		});
	else if (r.url.startsWith("/api"))
		serveData(r);
  else
    servePage(r);
}

async function servePage(r: ServerRequest): Promise<void> {
	const pageUrl = new URL(r.url, "http://0.0.0.0");
	const pagePath = webRoot+pageUrl.pathname;
	if (await exists(pagePath)) {
    return r.respond({
      status: 200,
      headers: new Headers({
				"Content-Type": MIME[parse(pageUrl.pathname).ext as keyof typeof MIME] ?? "text/plain"
			}),
      body: await Deno.readFile(pagePath)
    });
  }
  else
    return r.respond({status: 404});
}

interface Quiz {
	id: string;
	title: string;
	questions: {
		[id: number]: {
			description: string;
			choices: {
				[id: number]: string;
			};
		}
	};
}

async function serveData(r: ServerRequest): Promise<void> {
	const url = new URL(r.url, "http://0.0.0.0");
	const response = {
		status: 400,
		body: undefined as any,
		headers: new Headers({
			"Content-Type": "text/plain"
		})
	};
	if (r.url.startsWith("/api/quiz-get")) {
		const quiz: Quiz = {
			id: url.searchParams.get("quizId") || "",
			title: "",
			questions: {},
		};
		for (let row of quizDB.query(
			`SELECT
				Quiz.quizId,
				quizTitle,
				Question.questionId,
				questionDesc,
				Choice.choiceId,
				choiceDesc
			FROM
				Quiz, Question, Choice
			WHERE
				Quiz.quizId = Question.quizId
				AND Question.questionId = Choice.questionId
				AND Quiz.quizId = ?
			`,[quiz.id])
		){
			quiz.title = row[1];
			if (quiz.questions[row[2]] === undefined)
				quiz.questions[row[2] as number] = {
					description: row[3],
					choices: {
						[row[4]]: row[5]
					}
				};
			else
				quiz.questions[row[2]].choices[row[4]] = row[5];
			response.status = 200;
			response.body = JSON.stringify(quiz);
			response.headers.set("Content-Type", MIME[".json"]);
		}
	}
	else if (r.url.startsWith("/api/quiz-answers")) {
		const answers: any = {};
		for (let row of quizDB.query(`SELECT Choice.questionId, Choice.choiceId FROM Choice, Question WHERE Choice.questionId = Question.questionId AND choiceCorrect = 1 AND Question.quizId = ?`, [url.searchParams.get("quizId") || ""])){
			answers[String(row[0])] = String(row[1]);
		}
		response.status = 200;
		response.body = JSON.stringify(answers);
		response.headers.set("Content-Type", MIME[".json"]);
	}
	return r.respond(response);
}
