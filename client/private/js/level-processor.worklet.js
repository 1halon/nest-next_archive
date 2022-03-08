registerProcessor('level-processor', class extends AudioWorkletProcessor {
    constructor() {
        super();
        this.active = !0;
        
        this.port.onmessage = function ({ data }) { data === 'close' && (this.active = false); }
    }

    process(inputList, outputList, parameters) {
        return this.active;
    }
});