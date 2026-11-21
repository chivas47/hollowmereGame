// v289 (roadmap 95d, Nuno): how much of a map the screen shows. far is the classic 24 x 16 tiles; near shows 18 x 12,
// each tile a third bigger, for phones. 18 x 12 keeps the fishing meter (40 px from the top, a 120 px column) inside
// the view and leaves 9 tiles either side of you, more than a creature's chase range (7 tiles).
export const CAMERAS = {
  far:  { cols: 24, rows: 16, name: 'far' },
  near: { cols: 18, rows: 12, name: 'near' },
};
// The Camera setting's choices, in the menu's order; auto is near on a phone (a touch screen with a side under 600 px).
export const CAMERA_CHOICES = ['auto', 'near', 'far'];
export const PHONE_QUERY = '(pointer: coarse) and (max-width: 600px), (pointer: coarse) and (max-height: 600px)';
export const cameraFor = (choice, phone) => (choice === 'near' || choice === 'far' ? choice : phone ? 'near' : 'far');
