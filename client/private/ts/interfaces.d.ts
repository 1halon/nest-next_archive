interface RTCConnectionOptions {
    gateway: string;
}

interface WSOptions {
    debug?: boolean | string;
    protocols?: string | string[];
}

interface HandleDataChannelCallbacks {
    close?: (this: RTCDataChannel) => void;
    error?: (this: RTCDataChannel) => void;
    global?: (this: RTCDataChannel) => void;
    open?: (this: RTCDataChannel) => void;
    message?: (this: RTCDataChannel, data?, origin?: string, ports?: readonly MessagePort[]) => void;
}