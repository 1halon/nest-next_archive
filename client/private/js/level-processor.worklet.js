registerProcessor('level-processor', class extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputList, outputList, parameters) {
        const input = inputList[0][0];

        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }

        this.port.postMessage(sum / input.length);

        return true;
    }
});