const EventBus = {
  listeners: {},

  /**
   * Registriert einen Listener für ein Event.
   * @param {string} eventName - Name des Events.
   * @param {Function} callback - Funktion, die aufgerufen wird.
   */
  subscribe(eventName, callback) {
    if (typeof eventName !== "string" || typeof callback !== "function") {
      return;
    }

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);
  },

  /**
   * Entfernt einen registrierten Listener.
   * @param {string} eventName - Name des Events.
   * @param {Function} callback - Zu entfernende Funktion.
   */
  unsubscribe(eventName, callback) {
    if (typeof eventName !== "string" || typeof callback !== "function") {
      return;
    }

    if (!this.listeners[eventName]) {
      return;
    }

    this.listeners[eventName] = this.listeners[eventName].filter(
      (listener) => listener !== callback
    );

    if (this.listeners[eventName].length === 0) {
      delete this.listeners[eventName];
    }
  },

  /**
   * Löst ein Event aus und informiert alle Listener.
   * @param {string} eventName - Name des Events.
   * @param {*} data - Optionale Daten, die an Listener übergeben werden.
   */
  publish(eventName, data) {
    if (typeof eventName !== "string") {
      return;
    }

    const listeners = this.listeners[eventName] || [];

    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(error);
      }
    });
  },

  /**
   * Entfernt alle registrierten Listener.
   */
  clear() {
    this.listeners = {};
  }
};
