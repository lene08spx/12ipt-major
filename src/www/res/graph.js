///<reference lib="dom"/>
//@ts-nocheck
async function delay(ms=0) {
	return new Promise(r=>{setTimeout(r,ms)});
}
class SimpleVCO {
	constructor(){
		this.hasInit = false;
	}
	async init(){
		if (this.hasInit) return;
		this.hasInit = true
		this.audioCtx = new AudioContext();
		this.audioOut = this.audioCtx.destination;
		this.vco = this.audioCtx.createOscillator();
		this.vca = this.audioCtx.createGain();
		this.vca.connect(this.audioOut);
		this.vco.connect(this.vca);
		this.vca.gain.value = 0;
		this.vco.type = "sawtooth";
		this.vco.frequency.value = 220;
		this.vco.start(this.audioCtx.currentTime);
		await delay(100);
	}
	async play(freq=440){
		this.vca.gain.value = 0.1;
		this.vco.frequency.value = freq;
	}
	stop(){
		this.vca.gain.value = 0;
	}
}

function mapValue(val=0, srcMin=0, srcMax=100, outMin=0, outMax=100) {
	const percentage = (val-srcMin)/(srcMax-srcMin);
	const output = percentage * outMax + outMin;
	return output;
}
class FunctionPlot {
	constructor(e=HTMLElement.prototype) {
		this.isPlaying = false;
		this.instrument = new SimpleVCO();
		// create the function data
		const [domainMin, domainMax] = e.getAttribute("data-domain").split("->").map(Number);
		const fx = new Function("x", e.getAttribute("data-equation"));
		const rawPlotData = [];
		const domainStep = Math.abs(domainMax-domainMin)/250;
		let rangeMin = 0;
		let rangeMax = 0;
		for (let x = domainMin; x <= domainMax; x += domainStep) {
			const y = fx(x);
			if (y > rangeMax) rangeMax = y;
			if (y < rangeMin) rangeMin = y
			rawPlotData.push([x,y]);
		}
		// map it to our square space
		this.mappedPlotData = rawPlotData.map(v=>[
			mapValue(v[0], domainMin, domainMax, 0, 1000),
			1000-mapValue(v[1], rangeMin, rangeMax, 0, 1000),
		]);
		// setup plot elements
		// the svg canvas
		const plot = document.createElementNS("http://www.w3.org/2000/svg","svg");
		plot.setAttribute("viewBox", "-50 -50 1100 1100");
		// the current position cursor
		this.plotCursor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.plotCursor.setAttribute("r", 30);
		this.plotCursor.setAttribute("cx", this.mappedPlotData[0][0]);
		this.plotCursor.setAttribute("cy", this.mappedPlotData[0][1]);
		// the graph line
		const plotLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
		plotLine.setAttribute("stroke-width", 10);
		// the title of the graph
		const plotTitle = document.createElement("h1");
		plotTitle.textContent = `\\(${e.getAttribute("data-katex-equation")}\\), for \\(${domainMin}<x<${domainMax}\\)`;
		// "play" the graph
		const plotPlayButton = document.createElement("button");
		plotPlayButton.textContent = "Play";
		plotPlayButton.addEventListener("click", async()=>{await this.play()});
		// draw plot
		for (let p of this.mappedPlotData) {
			const svgP = plot.createSVGPoint();
			svgP.x = p[0];
			svgP.y = p[1];
			plotLine.points.appendItem(svgP);
		}
		// attach to document and draw to screen
		plot.appendChild(plotLine);
		plot.appendChild(this.plotCursor);
		e.appendChild(plotTitle);
		e.appendChild(plot);
		e.appendChild(plotPlayButton);
	}
	async play(){
		if (this.isPlaying) return;
		this.isPlaying = true;
		await this.instrument.init();
		for (let i=1; i<this.mappedPlotData.length;i++) {
			this.plotCursor.setAttribute("cx", this.mappedPlotData[i][0]);
			this.plotCursor.setAttribute("cy", this.mappedPlotData[i][1]);
			this.instrument.play(((1000-this.mappedPlotData[i][1])/1000*660)+220);
			await delay(5);
		}
		await delay(50);
		this.instrument.stop();
		this.isPlaying = false;
	}
}

for (let e of document.getElementsByClassName("graph")) {
	new FunctionPlot(e);
}