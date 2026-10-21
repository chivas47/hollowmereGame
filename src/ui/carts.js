// The cart line's dialog (v108): pick a stop to ride to (systems/wing.js).
import { on } from '../core/events.js';
import { openModal, closeModal } from './modal.js';
import { cartStops, rideCart } from '../systems/wing.js';

on('ui:carts', ({ from }) => {
  const stops = cartStops(from);
  openModal('<h2>The cart line</h2><p>Hop in. Where to?</p>', [
    ...stops.map((s, i) => [s.name, () => { closeModal(); rideCart(s.key); }, i === 0]),
    ['Stay here', closeModal],
  ]);
});
