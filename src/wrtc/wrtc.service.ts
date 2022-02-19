import { Injectable } from '@nestjs/common';

@Injectable()
export class WrtcService {
    handleDataChannel(channel: RTCDataChannel, callbacks?: {
        close?: (this: RTCDataChannel) => void;
        error?: (this: RTCDataChannel) => void;
        global?: (this: RTCDataChannel) => void;
        open?: (this: RTCDataChannel) => void;
        message?: (this: RTCDataChannel, data?, origin?: string, ports?: readonly MessagePort[]) => void;
    }) {
        channel.bufferedAmountLowThreshold = 0;
        callbacks?.global?.apply(channel);
        channel.addEventListener('close', function () {
            callbacks?.close?.apply(channel);
        });
        channel.addEventListener('error', function () {
            callbacks?.error?.apply(channel);
            channel.close();
        });
        channel.addEventListener('message', function ({ data, origin, ports }) {
            callbacks?.message?.apply(channel, [data, origin, ports]);
        });
        channel.addEventListener('open', function () {
            callbacks?.message?.apply(channel);
        });

        return channel;
    }
}
