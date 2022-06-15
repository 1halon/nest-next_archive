registerProcessor('level-processor', class extends AudioWorkletProcessor {
    constructor() {
        super();
        this.active = !0;

        this.port.onmessage = function ({ data }) { data === 'close' && (this.active = false); }
    }

    process(inputs, outputs, parameters) {
        /**
         * @type {Float32Array}
         */
        const input = inputs[0],
            /**
            * @type {Float32Array}
            */
            output = outputs[0];

        return this.active;
    }
});