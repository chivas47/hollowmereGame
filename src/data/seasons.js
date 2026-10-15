export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const SEASON_LENGTH = 28;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];   // v46: the 1st of every season is a Monday

// Palette per season. The world art reads only from these.
export const PAL = {
  Spring: { g: '#6f9f52', gl: '#86b964', gd: '#5e8d45', tr: '#2f6b3a', trd: '#2b6236', trl: '#3f8a4a', path: '#c4a26c', pathd: '#ad8b57', fl: ['#f4ead2', '#e9b44c'], water: '#3f7fb0', ripple: '#69aedb' },
  Summer: { g: '#76a248', gl: '#93be58', gd: '#618a3a', tr: '#2a6630', trd: '#255a2b', trl: '#4b9b47', path: '#caa66c', pathd: '#b08d55', fl: ['#e2707a', '#e9b44c'], water: '#3a7fb8', ripple: '#73b9e2' },
  Autumn: { g: '#998f4a', gl: '#b5a45a', gd: '#7d743b', tr: '#a8582a', trd: '#934a22', trl: '#d68b3a', path: '#c4a26c', pathd: '#a98754', fl: ['#d9644a', '#e8862a'], water: '#3a6f9a', ripple: '#5f97bf' },
  Winter: { g: '#dfe7ea', gl: '#ffffff', gd: '#c3ced3', tr: '#3d5f4c', trd: '#34533f', trl: '#4c7360', path: '#cfd4d6', pathd: '#b7bec2', fl: null, water: '#7fa9c4', ripple: '#c9e2ee', snow: true },
};
