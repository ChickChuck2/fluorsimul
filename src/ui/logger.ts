import { ELEMENTS } from './dom.js';

export class Logger {
  log(msg: string) {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const logEl = ELEMENTS.logEl;
    logEl.innerHTML = `<div>[${time}] ${msg}</div>` + logEl.innerHTML;
  }

  clear() {
    ELEMENTS.logEl.innerHTML = '';
  }
}

export const logger = new Logger();
