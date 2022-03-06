registerProcessor('level-processor', class extends AudioWorkletProcessor {
    constructor() {
        super();
        this.active = !0;
        this.volume = 0;
        this.port.onmessage = function ({ data }) { data === 'close' && (this.active = false); }
    }

    process(inputList, outputList, parameters) {
        const input = inputList[0][0], length = input.length;

        let sum = 0;
        for (let i = 0; i < length; i++) { sum += input[i] * input[i]; }
        this.volume = Math.max(Math.sqrt(sum / length), this.volume * 0.95);
        this.port.postMessage(this.volume);

        return this.active;
    }
});