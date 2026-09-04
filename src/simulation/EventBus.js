/**
 * Decoupled Application Event Bus
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  off(eventName, callback) {
    if (!this.listeners.has(eventName)) return;
    const callbacks = this.listeners.get(eventName).filter(cb => cb !== callback);
    this.listeners.set(eventName, callbacks);
  }

  emit(eventName, data) {
    if (!this.listeners.has(eventName)) return;
    for (const callback of this.listeners.get(eventName)) {
      callback(data);
    }
  }
}
