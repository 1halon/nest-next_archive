registerProcessor('level-processor', class extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    static get parameterDescriptors() {
        return [
            {
                name: "gain",
                defaultValue: 0.25,
                minValue: 0,
                maxValue: 1
            },
        ];
    }

    process(inputList, outputList, parameters) {
        /* using the inputs (or not, as needed), write the output
           into each of the outputs */

        return true;
    }
});