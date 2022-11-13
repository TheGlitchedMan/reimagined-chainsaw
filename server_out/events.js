"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.BaseEvent = exports.EventSignal = exports.EventConnection = void 0;
class EventConnection {
    constructor(signal, callback, once = false) {
        this._disconnected = false; // Internal
        this.Once = false;
        this.Signal = signal;
        this.Callback = callback;
        this.Once = once;
    }
    get Disconnected() {
        return this._disconnected;
    }
    Disconnect() {
        this._disconnected = true;
        this.Signal._GC();
    }
}
exports.EventConnection = EventConnection;
class EventSignal {
    constructor() {
        this._connections = [];
        // Connect aliases
        this.then = this.Connect; // promise-like
        this.connect = this.Connect; // lowercase
        this.once = this.Once; // Once port
        return this;
    }
    get Connections() {
        return this._connections;
    }
    Connect(callback) {
        let ev = new EventConnection(this, callback);
        this._connections.push(ev);
        return ev;
    }
    Once(callback) {
        let ev = new EventConnection(this, callback, true);
        this._connections.push(ev);
        return ev;
    }
    _GC() {
        this._connections.filter(e => e.Disconnected == true).forEach((v, x) => {
            this._connections.splice(this._connections.findIndex(e => e == v), 1);
        });
    }
}
exports.EventSignal = EventSignal;
class BaseEvent {
    constructor() {
        this.Event = new EventSignal();
    }
    Fire(...a) {
        let toDisconnect = [];
        this.Event.Connections.filter(e => e.Disconnected == false).forEach((v, x) => {
            v.Callback(...Array.from(arguments));
            if (v.Once) {
                toDisconnect.push(v);
            }
        });
        toDisconnect.forEach(v => v.Disconnect());
    }
}
exports.BaseEvent = BaseEvent;
class Event extends BaseEvent {
    constructor() {
        super(...arguments);
        this.Connect = this.Event.Connect;
        this.connect = this.Event.Connect;
        this.then = this.Event.Connect;
        this.fire = this.Fire;
    }
}
exports.Event = Event;
