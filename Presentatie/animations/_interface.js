// _interface.js — Animation Interface Contract
// Elke animatie in animations/ implementeert dit contract.
//
// @param {HTMLElement} container - DOM-element om in te renderen
// @param {Object} options - Configuratie (snelheid, kleuren, labels, mode)
// @returns {AnimationController}
//
// export function init(container, options = {}) {
//   return {
//     play(),        // Start of hervat de animatie
//     pause(),       // Pauzeer de animatie
//     reset(),       // Terug naar begintoestand
//     destroy(),     // Opruimen (event listeners, timers)
//     onComplete(cb) // Callback wanneer animatie klaar is
//   };
// }

/**
 * Stub factory — returns a no-op controller.
 * Used during development until the real animation is built.
 */
export function createStub(name) {
  return {
    play()        { console.log(`[animation:${name}] play`); },
    pause()       { console.log(`[animation:${name}] pause`); },
    reset()       { console.log(`[animation:${name}] reset`); },
    destroy()     { console.log(`[animation:${name}] destroy`); },
    onComplete(cb) { /* no-op — stub never completes, user clicks to advance */ }
  };
}
