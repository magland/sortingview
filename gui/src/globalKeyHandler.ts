import { KeyboardEvent } from "react";

class GlobalKeyHandler {
    callbacks: ((event: KeyboardEvent) => void)[] = [];
    registerCallback(callback: (event: KeyboardEvent) => void) {
        this.callbacks.push(callback);
    }
    deregisterCallback(callback: (event: KeyboardEvent) => void) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }
    handleEvent(event: KeyboardEvent) {
        this.callbacks.forEach(cb => cb(event));
    }
}

export const globalKeyHandler = new GlobalKeyHandler();