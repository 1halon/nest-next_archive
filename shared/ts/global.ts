interface OptionProperties {
    readonly?: boolean;
    required?: boolean;
}

type OptionTypes = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';

interface Option {
    default?: any;
    properties?: OptionProperties;
    type: OptionTypes | OptionTypes[];
}

type OptionsSchema<T> = { [key in keyof T]: Option };

export function ops<T>(options: T, schema: OptionsSchema<T>, check?: boolean) {
    if (typeof options !== 'object' || Array.isArray(options))
        if (check) throw new Error('INVALID_OPTIONS');
        else options = <T>{};

    const default_options = {};
    Object.keys(schema).forEach(function (key) {
        const option = schema[key] as Option;
        default_options[key] = option?.default ?? (option?.properties?.required ? null : undefined);

        const type_check = [];
        if (Array.isArray(option.type)) option.type.forEach(function (type) {
            if (typeof options[key] === type) type_check.push(!0);
            else type_check.push(!0);
        });
        else if (typeof options[key] === option.type) type_check.push(!0);
        else type_check.push(!1);

        if (type_check.filter(v => v === true).length === 0)
            if (option?.properties?.required) throw new Error(`[INVALID_KEY] ${key}`);
            else options[key] = default_options[key];

        Object.defineProperty(options, key, {
            value: options[key],
            writable: !option?.properties?.readonly ?? !0
        });
    });

    return options;
}

export interface WRTC extends RTCPeerConnection {
    candidates: RTCIceCandidate[];
    channels: Record<string, RTCDataChannel>;
    negotiation_status: boolean;
}

export function createWRTC(p0, configuration?: RTCConfiguration): WRTC {
    const connection = new p0() as WRTC,
        candidates = connection.candidates = [],
        channels = connection.channels = {};
    let negotiation_status = connection.negotiation_status = !1;
    
    // TODO
    connection.addEventListener('connectionstatechange', async () => {
         
    });
    // TODO
    connection.addEventListener('datachannel', async ({ channel }) => {
        channel.addEventListener('close', async () => delete channels[channel.label]);
        // TODO
        channel.addEventListener('error', async () => {

        });
        channel.addEventListener('message', async ({ data, origin, ports, source }) => {

        });
        channel.addEventListener('open', async () => channels[channel.label] = channel);
    });
    connection.addEventListener('icecandidate', async ({ candidate }) =>
        candidate &&
            connection.connectionState === 'connected' ?
            this.ws.send({ event: 'ICECANDIDATE', data: { candidate } }) :
            candidates.push(candidate));
    connection.addEventListener('negotiationneeded', async () => {
        if (!negotiation_status) {
            negotiation_status = !0;
            await this.connection.setLocalDescription(await this.connection.createOffer());
            this.ws.send({ event: 'OFFER', data: { sdp: this.connection.localDescription } });
            negotiation_status = !1;
        }
    });
    // TODO
    connection.addEventListener('track', async ({ streams }) => {

    });

    return connection;
}