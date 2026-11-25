# Sound files

Every sound the game plays is a file here, listed in the data by the id the code plays it by. To change a sound you
change a file, or one line of data; no game code.

## How it fits together

| Part | File | Job |
|---|---|---|
| Music database | `src/data/musicTracks.js` | every track: what it is for (layer, place, region, season, weather, time, festival, cutscene), priority, weight, volume, loop points; the places and regions |
| Music director | `src/systems/musicDirector.js` | picks the track for the moment by layer priority (menu, cutscene, festival, boss, combat, fishing, place or region, season, default), most specific first, random among equals, never restarting what still fits |
| Music player | `src/audio/music.js` | crossfades to it, loops it, plays stingers over a ducked background |
| Ambience database | `src/data/ambience.js` | rules: which loops play how loud, and which calls play how often, by place, weather, season, time and nearness |
| Ambience director | `src/systems/ambienceDirector.js` | turns the moment into those levels and chances |
| Ambience player | `src/audio/ambience.js` | fades the loops, rolls the calls; independent of the music |
| Effects | `src/audio/sfx.js`, `footsteps.js` | play when the game says something happened (`emit('sfx', id)`), steps by surface |
| Sound manifest | `src/data/audio.js` | every non-music file: pools, gain, pitch variation, what it is for |
| Mixer | `src/audio/mixer.js` | master and four volume groups: Music, Ambience, Effects, Interface (the Sound menu) |

Several layers always play at once: on a summer night in the wild you hear the music, crickets, a little wind, an owl
now and then and your own steps; on a rainy day the music, rain, wind, thunder with the lightning, and wet steps.

## Folders

```
assets/audio/
├── music/
│   ├── farm/  village/  wild/  duskmarch/  underground/  indoors/   the places, by region
│   ├── sacred/  island/  desert/
│   ├── festivals/  story/  combat/  fishing/  menu/  default/     events, cutscenes, gameplay, screens
│   └── stingers/                                                  short one-offs (victory, game over, a new place)
├── ambience/
│   ├── weather/  nature/  water/  underground/  town/             loops and calls of a place and its weather
├── environment/                                                   things you walk up to: the waterfall, a hearth
└── sfx/
    ├── tools/  farming/  combat/  creatures/  fishing/  items/  animals/  world/  jingles/  ui/
    └── footsteps/
```

## Naming rules

- Lowercase words joined by underscores, saying what it is and then what it does: `hoe_till_soil_01.wav`,
  `fish_bite_alert_01.wav`, `town_bell_distant_01.wav`.
- Loops have `_loop` in the name: `rain_loop_01.wav`.
- Always a two-digit number at the end. A second recording of the same sound is `_02`, a third `_03`.
- Music files are named by the track's id: `music/farm/farm_spring_01.ogg` is the track `farm_spring_01`. A second
  spring farm tune is `farm_spring_02`, a night version `farm_night_01`.
- The test suite fails on a file that breaks these rules or that no entry lists, so nothing gets lost.

## Places and regions

Music follows where you are at two levels. A **place** is the map you are on, or, in the Hollow, the zone (the Hollow,
the Sunken Cavern, the Ember Vent, the Smoke Peak). Each place belongs to a **region**. A track tagged with a place
plays there and beats any region track; a region track plays in every place of the region that has none of its own.

| Region | Places | Own tracks |
|---|---|---|
| farm | farm, greenhouse, shed, coop, barn | by season, night, rain |
| village | village, town, hedge maze, neighbours' cottages | by season, rain |
| duskmarch | Gloamwood, the Tangle, Mournfield | one per place; Mournfield at night |
| mines | the Hollow, the Sunken Cavern, the Ember Vent | one per zone; the Hollow by depth (floors 1 to 39, 40 to 79, 80 and deeper); the Cavern by depth (1 to 9, 10 to 24, 25 and deeper); the Vent's climb (1 to 9) and forge room (10) |
| island | the island, the dig site, the Smoke Peak | the island; the dig site its own; the peak's climb (1 to 9) and summit (10) |
| desert | the Dunes, the Oasis, the Gilded Dune casino | the Dunes; the Oasis and the casino their own |
| shops | store, smithy, carpentry, clinic, ranch, town hall, lodge, museum, picture house | one shared; the museum and the picture house their own |
| others | house, forest, beach, mountains, wilds, caves, sacred (shrine, crypt), tavern | one each |

## Composing and recording

**Formats.** Ogg Vorbis for music and long loops (it loops without a gap; MP3 adds one). WAV, 16-bit, for short
effects. 44.1 kHz or lower; mono is fine for effects and ambience, stereo for music. Any format the browser plays
works, but Ogg and WAV are what the game is tested with.

**Loudness.** Master every music track to about the same loudness (around -16 LUFS, peaks under -1 dBFS) and every
effect to a normal level; then balance in the game with each track's `volume` (`src/data/musicTracks.js`) or each
sound's `gain` (`src/data/audio.js`). The current `gain` values are set for files normalized to a 90% peak, so a
normally mastered replacement sounds right at the same gain.

**Loops.** A loop's end must join its start without a click. Music can open with an intro that plays once: set the
track's `loopStart` (and `loopEnd`, if a tail should not repeat) in seconds, and the game loops only that part. Any
length works; 1 to 3 minutes suits background music.

**Variety.** Give an effect or a footstep several recordings: add `_02`, `_03` files and list them in its entry's
`files`. Each play draws one at random and never repeats the last. `vary` also shifts the pitch a little per play.
For music, add more tracks with the same fields: they form a pool, one is drawn at random, and after about five
minutes (`rotateAfter`, counted at the end of a loop) another takes over, so a 2-minute piece plays two or three times.

**Briefs.** Every track has its own brief under *Music briefs* below (when it plays, the mood, instruments, tempo and
form), and every effect, footstep and ambient sound its own recording brief (character, length, how often it plays,
how many variants). Edit them in `src/data/musicTracks.js` and `src/data/audio.js`, then run
`node tools/audio_list.mjs --readme`; the sections below are rewritten from the data. The table here is the overall
musical palette.

**Style.** Simple, memorable melodies, relaxed pacing, warm instruments, comfortable repetition, and a mood per
season and place:

| Where | Mood | Instruments that suit it |
|---|---|---|
| Spring | fresh, hopeful | acoustic guitar, flute, light marimba |
| Summer | bright, lazy, warm | banjo, guitar, hand percussion |
| Autumn | mellow, golden | piano, strings, clarinet |
| Winter | quiet, sparse | piano, bells, soft pads |
| Night | hushed, slower | piano, soft strings; quieter than the day |
| Rain | reflective | piano, muted guitar |
| Village | sociable | guitar, accordion, light percussion |
| Forest, wilds | curious, open | flute, marimba, plucked strings |
| Beach | breezy | ukulele, steel drum, guitar |
| The Hollow, caves | mysterious; each depth band darker and heavier than the one above | synth pads, low bass, sparse percussion |
| Sunken Cavern, Ember Vent | deeper, hotter, more urgent | low drones, metallic percussion |
| Gloamwood, the Tangle | lost, watchful | low flute, plucked strings, wood percussion |
| Mournfield | mournful, still; darker at night | solo cello or violin, organ, distant bells |
| Island, dig site | sunny, far from home | marimba, steel drum, nylon guitar |
| Smoke Peak, the Dunes | heat, haze | hand drums, drones, a reed instrument |
| Festivals | lively, celebratory | fiddle, banjo, drums |
| Combat, boss | tense, driving | bass, percussion, synths |
| Stingers | a short phrase (2 to 6 s) that ends on the home note | anything from the track it plays over |

Everything must be original or permissively licensed (CC0, CC-BY), credited below, and never taken from Stardew
Valley (PROJECT_INSTRUCTIONS rule 1).

## Common jobs

- **Replace a sound:** save the new file over the old one, same name. That is all.
- **Add a variant:** save `footstep_grass_02.wav` next to `_01`, add it to `files` in `src/data/audio.js`.
- **Add a track:** save `music/village/village_night_01.ogg`, add an entry to `TRACKS` with `region: 'village',
  time: 'night'`. No other code; it plays at night in the village from then on.
- **Give one map its own music:** a track with `place: '<map id>'` (or a Hollow zone: `hollow`, `cavern`, `vent`,
  `peak`) beats everything its region has. A deep place can also go by depth: `floors: [40, 79]`, or `[80]` for 80
  and deeper (the bands are `HOLLOW_DEPTHS`, `CAVERN_DEPTHS`, `VENT_DEPTHS` and `PEAK_DEPTHS`). A new map goes in a region in `REGIONS`; a test fails if a map has no music.
- **Add an ambience layer:** a file and an entry in `BED_FILES` or `CALL_FILES` (`src/data/audio.js`), a generator of
  the same id in `src/audio/ambience.js` (the fallback), and a rule in `src/data/ambience.js`.
- **Add an effect:** a file and an entry in `SFX_FILES`, a generator in `src/audio/sfx.js`, and the game emitting it.
- **Check everything:** `node tools/audio_list.mjs` lists every slot, missing files, and files no entry lists yet;
  `node tools/audio_list.mjs --readme` rewrites the tables below.
- **Why is this playing?** In the debug menu, "music" names the track, its layer and the reason, and logs every pick
  in the console (or set localStorage `hollowmere-music-debug` to `1`).

If a file is missing or the browser cannot decode it, the game plays that sound's built-in generated version
instead (and warns in the console), so a broken file never makes the game silent.

## Where the shipped files come from

They are placeholders recorded from the game's own sound generators by `tools/render_audio.mjs` (mono 22,050 Hz;
16-bit WAV, music through ffmpeg to Ogg Vorbis). Run it again after changing a generator: `node tools/render_audio.mjs
hoe rain` re-records only those ids, and only the first file of a pool, so your own variants are never touched. With
no ids it re-records everything, overwriting the first file of every slot, including ones you replaced. The other
files of a pool are recorded only while they are missing (a fresh take each), never overwritten.

### Credits

None yet: every file is generated by the game.

<!-- slots:start (written by tools/audio_list.mjs --readme) -->

## Music briefs

One entry per track, grouped by folder: when it plays, its form, and what to compose. The brief is written in `src/data/musicTracks.js` (`brief`); the key and tempo are those of the generated placeholder, a starting point you can ignore. Several tracks that fit the same moment form a pool and take turns.

### Farm (`music/farm/`)

#### Spring on the Farm

- File: `music/farm/farm_spring_01.ogg` (id `farm_spring_01`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, in Spring, and, in its season, anywhere without music of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E major pentatonic, 100 bpm

The game's signature morning theme, heard more than any other track. Fresh and hopeful, a melody you can hum after one listen. Acoustic guitar carries it, flute answers, light marimba or glockenspiel on top. Medium-gentle tempo; 1.5 to 2.5 minutes, looping seamlessly.

#### First Shoots

- File: `music/farm/farm_spring_02.ogg` (id `farm_spring_02`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, in Spring, and, in its season, anywhere without music of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D major pentatonic, 96 bpm

A second spring farm tune to rotate with Spring on the Farm. Same warmth, different shape: more pastoral and airy, as if the first shoots are up. Flute or recorder lead over fingerpicked guitar, soft strings underneath. Avoid quoting the first spring theme.

#### Summer on the Farm

- File: `music/farm/farm_summer_01.ogg` (id `farm_summer_01`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, in Summer, and, in its season, anywhere without music of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G major pentatonic, 112 bpm

Bright, lazy, sunlit afternoons in the fields. Banjo or ukulele strumming, a whistled or fiddle melody, hand percussion (shaker, cajón). A little swing; relaxed, never rushed.

#### Autumn on the Farm

- File: `music/farm/farm_autumn_01.ogg` (id `farm_autumn_01`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, in Autumn, and, in its season, anywhere without music of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D dorian, 92 bpm

Mellow and golden: harvest time, the year turning. Piano or nylon guitar melody, warm strings, clarinet or bassoon counter-line. Slightly slower than summer, a touch of wistfulness without sadness.

#### Winter on the Farm

- File: `music/farm/farm_winter_01.ogg` (id `farm_winter_01`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, in Winter, and, in its season, anywhere without music of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C minor pentatonic, 80 bpm

Quiet, sparse, snow on the fields. Solo piano or celesta with soft pads and the occasional sleigh-bell or chime. Lots of space between notes; calm and cosy, not cold.

#### Farm After Dark

- File: `music/farm/farm_night_01.ogg` (id `farm_night_01`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, at night
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A minor pentatonic, 70 bpm

The farm after 8 pm in any season. Hushed and slow: soft piano, muted strings, a distant music-box or harp figure. Must sit under crickets and wind without competing; keep the mix soft and the low end light.

#### Rain on the Rows

- File: `music/farm/farm_rain_01.ogg` (id `farm_rain_01`)
- Plays: anywhere in the farm region (Farm, Greenhouse, Shed, The coop, The barn) without a track of its own, in rain or storm
- Form: loops; an intro can play once first (loopStart)
- Placeholder: B dorian, 84 bpm

Rain on the farm (and storms). Reflective, indoorsy even outdoors: Rhodes or felt piano, muted guitar, gentle brushed drums. Leave room for the rain sound in the high frequencies.

### Village and town (`music/village/`)

#### Village in Spring

- File: `music/village/village_spring_01.ogg` (id `village_spring_01`)
- Plays: anywhere in the village region (Hollowmere Village, Hollowmere Town, The hedge maze, neighbours' cottages) without a track of its own, in Spring
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G major hexatonic, 108 bpm

The village square in spring: sociable, neighbours chatting, market stalls opening. Guitar and accordion or concertina, light percussion, a cheerful walking bass. Busier than the farm themes but still relaxed.

#### Village in Summer

- File: `music/village/village_summer_01.ogg` (id `village_summer_01`)
- Plays: anywhere in the village region (Hollowmere Village, Hollowmere Town, The hedge maze, neighbours' cottages) without a track of its own, in Summer
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A major pentatonic, 116 bpm

The village in summer: warm evenings, people out of doors. Upbeat folk band feel: fiddle, guitar, upright bass, tambourine. Danceable but easy.

#### Village in Autumn

- File: `music/village/village_autumn_01.ogg` (id `village_autumn_01`)
- Plays: anywhere in the village region (Hollowmere Village, Hollowmere Town, The hedge maze, neighbours' cottages) without a track of its own, in Autumn
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E dorian, 98 bpm

The village in autumn: woodsmoke, apples, early dusk. Accordion or harmonium melody, plucked strings, a lilting 6/8 or slow waltz would suit.

#### Village in Winter

- File: `music/village/village_winter_01.ogg` (id `village_winter_01`)
- Plays: anywhere in the village region (Hollowmere Village, Hollowmere Town, The hedge maze, neighbours' cottages) without a track of its own, in Winter
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D minor pentatonic, 86 bpm

The village in winter: lit windows, frost, people hurrying home. Piano and bells, soft strings, a gentle carol-like melody (original, not a real carol).

#### Village in the Rain

- File: `music/village/village_rain_01.ogg` (id `village_rain_01`)
- Plays: anywhere in the village region (Hollowmere Village, Hollowmere Town, The hedge maze, neighbours' cottages) without a track of its own, in rain or storm
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C dorian, 88 bpm

Rain in the village. Cosy and unhurried, like watching the street from a café window. Muted trumpet or clarinet, brushed drums, soft piano chords.

### The wild places (`music/wild/`)

#### Under the Canopy

- File: `music/wild/forest_01.ogg` (id `forest_01`)
- Plays: anywhere in the forest region (Brackenwood, The hidden grove, The mere) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D dorian, 92 bpm

Brackenwood, the hidden grove and the mere: tall trees, dappled light, curiosity. Flute and marimba, plucked strings, light woodblock. Slightly mysterious but welcoming.

#### Tide Line

- File: `music/wild/beach_01.ogg` (id `beach_01`)
- Plays: anywhere in the beach region (Saltreach Beach) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F lydian, 100 bpm

Saltreach Beach: breezy and open, gulls and surf underneath. Ukulele or steel-string guitar, steel drum or vibraphone, laid-back groove. Leave space for the surf loop.

#### High Paths

- File: `music/wild/mountain_01.ogg` (id `mountain_01`)
- Plays: anywhere in the mountains region (Cragmoor, The quarry, The railway) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C major hexatonic, 90 bpm

Cragmoor, the quarry and the railway: high paths, wind, wide views. Open fifths, acoustic guitar, low whistle or pan flute, a steady walking pulse.

#### Off the Map

- File: `music/wild/exploration_01.ogg` (id `exploration_01`)
- Plays: anywhere in the wilds region (Ashgrove Wilds) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A dorian, 104 bpm

Ashgrove Wilds: off the beaten path, a little adventure. Driving but light: plucked strings, hand drums, flute; a sense of discovery.

### Underground: the Hollow, the Cavern, the Vent, caves (`music/underground/`)

#### The Hollow

- File: `music/underground/hollow_upper_01.ogg` (id `hollow_upper_01`)
- Plays: at the Hollow, floors 1 to 39
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D phrygian, 72 bpm

The Hollow, floors 1 to 39: earth, copper, crabs and moles. Mysterious, not yet threatening. Soft synth pads, low bass pulse, sparse percussion (drips, woodblocks), a simple modal melody on marimba or kalimba.

#### Lantern Dark

- File: `music/underground/hollow_middle_01.ogg` (id `hollow_middle_01`)
- Plays: at the Hollow, floors 40 to 79
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C phrygian, 70 bpm

The Hollow, floors 40 to 79: soot puffs, moss slimes, lantern wisps. Darker and colder than the upper floors: drones, glassy bell tones, slower and lower, a faint eerie lead.

#### The Gold Seam

- File: `music/underground/hollow_deep_01.ogg` (id `hollow_deep_01`)
- Plays: at the Hollow, floors 80 and deeper
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A# blues, 84 bpm

The Hollow, floor 80 and deeper: gold, armoured creatures, the Cavern's door. Heavy and tense: deep bass ostinato, metallic percussion, dissonant pads. The most oppressive of the three.

#### Drip and Echo

- File: `music/underground/caves_01.ogg` (id `caves_01`)
- Plays: anywhere in the caves region (Farm cave, The sewer) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C phrygian, 66 bpm

The farm cave and the sewer: small, damp, echoing places. Sparse and atmospheric: plucked notes with long reverb, water-drop percussion, a low hum; calm rather than dangerous.

#### The Sunken Cavern

- File: `music/underground/cavern_upper_01.ogg` (id `cavern_upper_01`)
- Plays: at the Sunken Cavern, floors 1 to 9
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C# phrygian, 78 bpm

The Sunken Cavern, floors 1 to 9: an ancient buried place of sand and ruins. Middle-eastern tinged modes (phrygian), low drones, hand drums, a reed or ney-like lead.

#### Past the Ember Door

- File: `music/underground/cavern_middle_01.ogg` (id `cavern_middle_01`)
- Plays: at the Sunken Cavern, floors 10 to 24
- Form: loops; an intro can play once first (loopStart)
- Placeholder: B phrygian, 84 bpm

The Sunken Cavern, floors 10 to 24, past the Ember Vent's door: heat rising, more urgent. Faster hand drums, darker drones, a rhythmic plucked figure.

#### Umbrite Veins

- File: `music/underground/cavern_deep_01.ogg` (id `cavern_deep_01`)
- Plays: at the Sunken Cavern, floors 25 and deeper
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A blues, 90 bpm

The Sunken Cavern, floor 25 and deeper, where umbrite is richest: the hardest everyday place in the game. Driving and dangerous: pounding low percussion, distorted drones, a strained high lead.

#### The Ember Vent

- File: `music/underground/vent_climb_01.ogg` (id `vent_climb_01`)
- Plays: at the Ember Vent, floors 1 to 9
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D# blues, 92 bpm

The Ember Vent, floors 1 to 9: lava, cinder and fire. Hot and relentless: low brass or synth bass, anvil-like metallic hits, a fast pulse.

#### The Forge

- File: `music/underground/vent_forge_01.ogg` (id `vent_forge_01`)
- Plays: at the Ember Vent, floors 10 and deeper
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G dorian, 72 bpm

The Ember Vent's forge room on floor 10: no monsters, a safe hearth after the climb. Warm and steady: low strings, a slow anvil rhythm, a calm melody. Relief.

### Indoors (`music/indoors/`)

#### Home

- File: `music/indoors/house_01.ogg` (id `house_01`)
- Plays: anywhere in the house region (Farmhouse, Attic) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E major pentatonic, 82 bpm

The farmhouse and attic: home. The warmest, simplest piece in the game. Solo piano or guitar, maybe a soft cello; slow and comforting.

#### The Common Room

- File: `music/indoors/tavern_01.ogg` (id `tavern_01`)
- Plays: anywhere in the tavern region (The Lantern) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D blues, 118 bpm

The Lantern tavern: a lively pub evening. Folk band: fiddle, accordion, guitar, foot-stomp percussion; jolly and loose.

#### Open for Business

- File: `music/indoors/shops_01.ogg` (id `shops_01`)
- Plays: anywhere in the shops region (Fenn's Provisions, The Anvil, Bram's Carpentry, Hollowmere Clinic, Tamsin's Ranch Supply, Hollowmere Museum, Town hall, Wardens' Lodge, The Starlight Picture House) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G major hexatonic, 104 bpm

Every working shop in town (store, smithy, carpentry, clinic, ranch, town hall, lodge): light and friendly background music. Pizzicato strings or ukulele, soft bells; unobtrusive, it plays while you browse menus.

#### Quiet Halls

- File: `music/indoors/museum_01.ogg` (id `museum_01`)
- Plays: at Hollowmere Museum
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E lydian, 72 bpm

Hollowmere Museum: quiet halls of artifacts and donations. Calm and thoughtful: solo piano or harp, soft strings, a gentle sense of wonder. Very quiet dynamics.

#### House Lights

- File: `music/indoors/theatre_01.ogg` (id `theatre_01`)
- Plays: at The Starlight Picture House
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D major hexatonic, 96 bpm

The Starlight Picture House: a small old cinema. Nostalgic and charming: an old-time piano or small band (clarinet, upright bass, brushes), like the warm-up music before a film.

### The Duskmarch (west of the village) (`music/duskmarch/`)

#### Gloamwood

- File: `music/duskmarch/gloamwood_01.ogg` (id `gloamwood_01`)
- Plays: at Gloamwood
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A dorian, 86 bpm

Gloamwood, the old woods west of the village: winding paths, easy to get lost, watched from the trees. Low flute, plucked strings, wooden percussion; dorian, a little uneasy but not scary.

#### The Tangle

- File: `music/duskmarch/tangle_01.ogg` (id `tangle_01`)
- Plays: at The Tangle
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G phrygian, 80 bpm

The Tangle, a deeper thicket of dead ends west of Gloamwood. More claustrophobic than Gloamwood: closer harmonies, a repeating circular figure (as if walking in circles), sparse percussion.

#### Mournfield

- File: `music/duskmarch/mournfield_01.ogg` (id `mournfield_01`)
- Plays: at Mournfield
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F minor pentatonic, 66 bpm

Mournfield, the valley's old graveyard, by day. Mournful and still, respectful: solo cello or violin, soft organ or harmonium, a distant bell.

#### When the Dead Walk

- File: `music/duskmarch/mournfield_night_01.ogg` (id `mournfield_night_01`)
- Plays: at Mournfield, at night
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D phrygian, 72 bpm

Mournfield after dark, when the dead rise. The day theme's mood turned eerie: tremolo strings, low choir pads, a slow uneven pulse. Unsettling, but leave room for combat music to take over in fights.

### Sacred places (`music/sacred/`)

#### Old Stones

- File: `music/sacred/sacred_01.ogg` (id `sacred_01`)
- Plays: anywhere in the sacred region (The shrine, The chapel catacombs, The north tomb) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D phrygian, 64 bpm

The shrine and the chapel crypt: old stones, reverence and mystery. Choir pads or organ, a single bell, very slow; ancient-sounding modes.

### Across the sea (`music/island/`)

#### Warm Water

- File: `music/island/island_01.ogg` (id `island_01`)
- Plays: anywhere in the island region (The island, The dig site, the Smoke Peak) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F lydian, 104 bpm

The island across the sea (Rook's boat): sunny, far from home, a holiday. Marimba, steel drum, nylon guitar, light shakers; lydian brightness.

#### Bones in the Sand

- File: `music/island/digsite_01.ogg` (id `digsite_01`)
- Plays: at The dig site
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D dorian, 94 bpm

The island's dig site: bones and old secrets in the sand. Curious and adventurous: plucked strings, hand drums, a playful woodwind; a touch of mystery.

#### The Smoke Peak

- File: `music/island/peak_climb_01.ogg` (id `peak_climb_01`)
- Plays: at the Smoke Peak, floors 1 to 9
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E blues, 100 bpm

The Smoke Peak, floors 1 to 9: the island's volcano dungeon. Tropical heat turned dangerous: tribal-style drums, low brass or synth, smoky drones.

#### Above the Smoke

- File: `music/island/peak_summit_01.ogg` (id `peak_summit_01`)
- Plays: at the Smoke Peak, floors 10 and deeper
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E lydian, 80 bpm

The Smoke Peak's summit on floor 10: the climb is over, the cache is found, the view opens. Open, triumphant but calm: strings and marimba, a soaring melody.

### The desert (`music/desert/`)

#### Heat Shimmer

- File: `music/desert/desert_01.ogg` (id `desert_01`)
- Plays: anywhere in the desert region (The Dunes, The Oasis, The Gilded Dune) without a track of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D phrygian, 96 bpm

The Dunes: heat haze, wind, endless sand. Hand drums, drones, a reed instrument (duduk-like) or bowed lead; slow, hypnotic.

#### The Gilded Dune

- File: `music/desert/casino_01.ogg` (id `casino_01`)
- Plays: at The Gilded Dune
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C blues, 112 bpm

The Gilded Dune casino: a little glamorous, a little shady. Lounge jazz with a desert tint: brushed drums, upright bass, vibraphone or muted trumpet.

#### Shade and Seeds

- File: `music/desert/oasis_01.ogg` (id `oasis_01`)
- Plays: at The Oasis
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F major hexatonic, 92 bpm

The Oasis shop in the desert: cool shade and rare seeds after the heat. Gentle and refreshing: harp or kalimba, soft hand percussion, a light flute; a breath of relief.

### Fallback (`music/default/`)

#### Hollowmere

- File: `music/default/default_01.ogg` (id `default_01`)
- Plays: anywhere with no music of its own
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E major pentatonic, 96 bpm

The fallback for anywhere without its own music (rare). A neutral, gentle Hollowmere theme: guitar and flute, works in any season or place.

### Festivals (`music/festivals/`)

#### Bunting and Lanterns

- File: `music/festivals/festival_01.ogg` (id `festival_01`)
- Plays: while a festival is on
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F major hexatonic, 124 bpm

Any festival without its own track: bunting, lanterns, crowds. Festive folk band: fiddle, accordion, drums; cheerful and busy.

#### Spring Fair

- File: `music/festivals/festival_spring_01.ogg` (id `festival_spring_01`)
- Plays: while a festival is on, in Spring
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G major pentatonic, 128 bpm

Spring festivals (Egg Hunt, Ribbon Dance): playful and light. Flutes, pizzicato, tambourine; a dance tune.

#### Midsummer

- File: `music/festivals/festival_summer_01.ogg` (id `festival_summer_01`)
- Plays: while a festival is on, in Summer
- Form: loops; an intro can play once first (loopStart)
- Placeholder: A lydian, 132 bpm

Summer festivals (Summer Potluck): sunny, bustling, celebratory. Brass or fiddle lead, guitars, lively percussion.

#### Maze Night

- File: `music/festivals/festival_autumn_01.ogg` (id `festival_autumn_01`)
- Plays: while a festival is on, in Autumn
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D dorian, 112 bpm

Autumn festivals (Maze Night, 10 pm in the hedge maze): mischievous and spooky-fun, never truly scary. Pizzicato, bassoon, xylophone, a swinging 6/8.

#### Frostlight

- File: `music/festivals/festival_winter_01.ogg` (id `festival_winter_01`)
- Plays: while a festival is on, in Winter
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E major hexatonic, 100 bpm

Winter festivals (Frostlight Market, Longnight Feast): lanterns in the snow, warm cider. Bells, celesta, soft choir pads, strings; magical and cosy.

#### Harvest Home

- File: `music/festivals/festival_harvest_01.ogg` (id `festival_harvest_01`)
- Plays: while a festival is on, festivals: grangefair, weighin
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F major pentatonic, 120 bpm

The Grange Fair and the Harvest Weigh-in: proud, generous, the year's work shown off. Big folk band: fiddle, banjo, accordion, drums; a stomping anthem.

#### The Judges Walk

- File: `music/festivals/competition_01.ogg` (id `competition_01`)
- Plays: while a festival is on, festivals: blossom, catch
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G blues, 124 bpm

Judged contests (Blossom Show, Midsummer Catch): a little tension while the judges walk the rows. Light suspense with a playful edge: pizzicato, ticking percussion, a rising figure that resolves warmly.

### Story scenes (`music/story/`)

#### A Letter at Winter's End

- File: `music/story/story_01.ogg` (id `story_01`)
- Plays: during story scenes
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C lydian, 76 bpm

Story scenes and the opening, the letter that brings you to Hollowmere. Emotional and intimate: solo piano, then strings. Through-composed is fine; it loops if a scene runs long.

#### The Whole Valley Gathers

- File: `music/story/celebration_01.ogg` (id `celebration_01`)
- Plays: during story scenes, scene: wedding
- Form: loops; an intro can play once first (loopStart)
- Placeholder: F major hexatonic, 112 bpm

The wedding: the whole valley gathers. Joyful and moving: strings, piano, bells, a warm melody that swells.

### Fights (`music/combat/`)

#### Teeth in the Dark

- File: `music/combat/combat_01.ogg` (id `combat_01`)
- Plays: in fights
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E blues, 140 bpm

Fighting monsters anywhere. Tense and driving but not overwhelming (fights are short and frequent): bass ostinato, punchy drums, short synth or brass stabs. Starts strong, no long intro.

#### Hold the Line

- File: `music/combat/combat_02.ogg` (id `combat_02`)
- Plays: in fights
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D phrygian, 146 bpm

A second fight track to rotate with Teeth in the Dark. Different colour: faster, more percussive, strings ostinato.

#### The Golden One

- File: `music/combat/boss_01.ogg` (id `boss_01`)
- Plays: when an elite or boss is near in a fight
- Form: loops; an intro can play once first (loopStart)
- Placeholder: C phrygian, 152 bpm

Elite and boss monsters. The biggest, most dramatic piece: full drums, brass or heavy synths, a strong motif.

### Fishing (`music/fishing/`)

#### Something on the Line

- File: `music/fishing/fishing_01.ogg` (id `fishing_01`)
- Plays: while reeling in a fish
- Form: loops; an intro can play once first (loopStart)
- Placeholder: G major pentatonic, 132 bpm

Reeling in a fish (the minigame). Quick, bouncy, playful tension: pizzicato or banjo, a running bassline, light percussion. Short loop (30 to 60 s) since reels are brief.

### Menus and credits (`music/menu/`)

#### Hollowmere Farm

- File: `music/menu/menu_01.ogg` (id `menu_01`)
- Plays: on the main menu
- Form: loops; an intro can play once first (loopStart)
- Placeholder: E lydian, 88 bpm

The main menu: the game's identity. A gentle, memorable main theme others can quote; guitar and piano, strings swelling a little. Loops while you choose a farm.

#### Thank You for Playing

- File: `music/menu/credits_01.ogg` (id `credits_01`)
- Plays: during the credits
- Form: loops; an intro can play once first (loopStart)
- Placeholder: D major pentatonic, 84 bpm

The end credits (not shown yet): a warm farewell. A fuller arrangement of the main theme; reflective and grateful.

### Stingers (short, played once over the music) (`music/stingers/`)

#### Carried Home

- File: `music/stingers/sting_gameover.ogg` (id `sting_gameover`)
- Plays: when you faint
- Form: plays once, then the background music returns
- Placeholder: A minor pentatonic, 70 bpm

Played once when you faint and are carried home. 3 to 5 seconds, soft and sympathetic (not a harsh fail sound): a falling piano phrase ending on a quiet chord.

#### Victory

- File: `music/stingers/sting_victory.ogg` (id `sting_victory`)
- Plays: when you defeat an elite
- Form: plays once, then the background music returns
- Placeholder: G major pentatonic, 120 bpm

Played once over the music when you defeat an elite. 2 to 4 seconds, bright and triumphant: brass or bells, ending on the home note.

#### A New Place

- File: `music/stingers/sting_discovery.ogg` (id `sting_discovery`)
- Plays: when you find a new place
- Form: plays once, then the background music returns
- Placeholder: A lydian, 100 bpm

Played once when you find a new place. 2 to 4 seconds, wonder and curiosity: harp or celesta rising to a shimmering chord.

## Sound effects

One-shots, played when something happens. Record the variants a brief asks for as `_02`, `_03` and list them in `files`.

### `sfx/animals/`

#### Petting an animal

- File: `sfx/animals/animal_pet_01.wav` (id `pet`)
- Form: one-shot
- Volume: Effects

Petting an animal. A soft affectionate chirp or rising coo, about 0.15 s. Warm, never squeaky.

#### A bird taking off

- File: `sfx/animals/bird_take_off_01.wav` (id `flap`)
- Form: one-shot
- Volume: Effects

A bird taking off when you walk near. A quick flutter of wings, 0.15 to 0.25 s.

### `sfx/combat/`

#### A sword swing

- File: `sfx/combat/sword_swing_01.wav` (id `sword`)
- Form: one-shot
- Volume: Effects

A sword swing through the air. A clean whoosh, 0.15 to 0.25 s, mid-pitched. Played on every swing, hit or miss.

#### A dagger swing

- File: `sfx/combat/dagger_swing_01.wav` (id `swingDagger`)
- Form: one-shot
- Volume: Effects

A dagger's quick stab or slash. A short, high, thin whip, under 0.15 s: faster and lighter than the sword.

#### A club or hammer swing

- File: `sfx/combat/club_swing_01.wav` (id `swingClub`)
- Form: one-shot
- Volume: Effects

A club or hammer swing. A heavy, low, slow whoosh, 0.25 to 0.35 s, with weight at the end.

#### A blow landing on a creature

- File: `sfx/combat/weapon_hit_01.wav` (id `hit`)
- Form: one-shot
- Volume: Effects

A blow landing on a creature. A short punchy thud with a soft squelch or crack, under 0.12 s. Plays with every hit, so tight and dry.

#### A critical hit

- File: `sfx/combat/weapon_hit_critical_01.wav` (id `crit`)
- Form: one-shot
- Volume: Effects

A critical hit. The normal hit plus a bright metallic ring or sparkle on top, 0.15 to 0.25 s. Must stand out from a normal hit at once.

#### A creature defeated

- File: `sfx/combat/monster_defeated_01.wav` (id `slay`)
- Form: one-shot
- Volume: Effects

A creature defeated. A soft poof or deflate with a small rising two-note chime, 0.2 to 0.4 s. Rewarding, never gory.

#### A weapon special slamming the ground

- File: `sfx/combat/ground_slam_01.wav` (id `slam`)
- Form: one-shot
- Volume: Effects

A weapon special slamming the ground. A deep boom with rocks and dust, 0.3 to 0.5 s, strong low end.

#### Low health in a fight

- File: `sfx/combat/low_health_heartbeat_01.wav` (id `heartbeat`)
- Form: one-shot
- Volume: Effects

Low health in a fight. Two soft low heartbeat thumps (lub-dub), about 0.3 s, repeated by the game. Felt more than heard; no high frequencies.

#### The farmer hurt

- File: `sfx/combat/player_hurt_01.wav` (id `hurt`)
- Form: one-shot
- Volume: Effects

The farmer taking damage. A short low grunt-like tone or impact with a slight down-bend, 0.15 to 0.25 s. No real voice recording (the farmer has no voice).

#### A bomb

- File: `sfx/combat/bomb_explosion_01.wav` (id `boom`)
- Form: one-shot
- Volume: Effects

A bomb exploding. A deep explosion with rubble, 0.6 to 1 s, strong low end but not painful.

### `sfx/creatures/`

#### A charger winding up

- File: `sfx/creatures/charge_windup_01.wav` (id `chargeWindup`)
- Form: one-shot
- Volume: Effects

A charging creature winding up to rush you: the warning. A rising snort and scrape of hooves or claws on stone, 0.4 to 0.6 s, building toward the end. Must read at once as "it is about to charge" over the music.

#### A charger hitting a wall

- File: `sfx/creatures/charge_bump_01.wav` (id `chargeBump`)
- Form: one-shot
- Volume: Effects

A charging creature crashing into a wall or rock and staggering. A heavy dull body thud with a little rubble, 0.2 to 0.35 s, low and blunt (not the bright pickaxe clink).

#### A spitter gathering a shot

- File: `sfx/creatures/spit_charge_01.wav` (id `spitCharge`)
- Form: one-shot
- Volume: Effects

A spitter gathering a glob before it fires: the warning. A short rising wet gurgle with a faint glow-like shimmer, 0.3 to 0.45 s. Must cut through a fight.

#### A spitter firing a glob

- File: `sfx/creatures/spit_glob_01.wav` (id `spit`)
- Form: one-shot
- Volume: Effects

A spitter firing a glob. A quick wet pop or "ptoo" with a small airy tail, 0.12 to 0.2 s.

#### A burrower digging down

- File: `sfx/creatures/burrow_dig_01.wav` (id `burrowDig`)
- Form: one-shot
- Volume: Effects

A burrowing creature digging down out of sight. A short downward scrape of loose earth and pebbles, 0.25 to 0.4 s, fading as it goes under.

#### A burrower about to come up

- File: `sfx/creatures/burrow_rise_01.wav` (id `burrowRise`)
- Form: one-shot
- Volume: Effects

A burrowing creature about to break the floor: the warning while its mound shakes. A rising rumble and crumble of earth, 0.4 to 0.55 s, ending in a small burst.

#### A mimic's shell cracking

- File: `sfx/creatures/shell_crack_01.wav` (id `shellCrack`)
- Form: one-shot
- Volume: Effects

The first hit on a creature disguised as a rock or a pumpkin, cracking its shell. A stony crack with a hollow knock, 0.12 to 0.2 s.

#### A blade glancing off a shell

- File: `sfx/creatures/shell_clang_01.wav` (id `shellClang`)
- Form: one-shot
- Volume: Effects

A sword or dagger glancing off an armoured shell, doing little harm. A dull metallic clank with a short ring, 0.15 to 0.25 s: it should sound like the blade was the wrong tool.

#### A mimic waking up

- File: `sfx/creatures/mimic_wake_01.wav` (id `mimicWake`)
- Form: one-shot
- Volume: Effects

A creature that sat as a rock (or a stump, or a pumpkin) waking up. Stones or wood shifting, then a little clicking of legs, 0.3 to 0.45 s.

#### A big slime splitting

- File: `sfx/creatures/slime_split_01.wav` (id `slimeSplit`)
- Form: one-shot
- Volume: Effects

A big slime splitting into two small ones. A wet stretching squelch that pops into two, 0.25 to 0.4 s, comic rather than gross.

#### A ghost fading in or out

- File: `sfx/creatures/phase_shift_01.wav` (id `phaseShift`)
- Form: one-shot
- Volume: Effects

A ghostly creature fading in or out of sight. A soft airy shimmer or breath, 0.3 to 0.5 s, quiet: it repeats every few seconds while the creature is near.

#### A slime noticing you

- File: `sfx/creatures/slime_alert_01.wav` (id `slimeAlert`)
- Form: one-shot
- Volume: Effects

A slime noticing you. A small wet blorp with an upward bend, about 0.15 s. Cute; heard often.

#### A slime falling

- File: `sfx/creatures/slime_death_01.wav` (id `slimeDeath`)
- Form: one-shot
- Volume: Effects

A slime defeated: its own sound under the game's defeat chime. A soft wet splat or deflating squish, 0.2 to 0.3 s. No chime of its own.

#### A bug noticing you

- File: `sfx/creatures/bug_alert_01.wav` (id `bugAlert`)
- Form: one-shot
- Volume: Effects

A bug (mites, beetles, wasps, shellbacks, crabs) noticing you. A dry rapid clicking or chitter, about 0.15 to 0.2 s, insect-like.

#### A bug falling

- File: `sfx/creatures/bug_death_01.wav` (id `bugDeath`)
- Form: one-shot
- Volume: Effects

A bug defeated, under the defeat chime. A dry crunch with a last click, 0.15 to 0.25 s. No chime of its own; never gory.

#### A beast noticing you

- File: `sfx/creatures/beast_alert_01.wav` (id `beastAlert`)
- Form: one-shot
- Volume: Effects

A beast (bats, boars, rams, hounds, serpents) noticing you. A short snarl, snort or screech depending on size, 0.2 to 0.3 s, animal but stylized.

#### A beast falling

- File: `sfx/creatures/beast_death_01.wav` (id `beastDeath`)
- Form: one-shot
- Volume: Effects

A beast defeated, under the defeat chime. A short falling yelp or grunt, 0.2 to 0.35 s. No chime of its own; never pained or cruel.

#### A bone walker noticing you

- File: `sfx/creatures/bone_alert_01.wav` (id `boneAlert`)
- Form: one-shot
- Volume: Effects

A skeleton, wraith or grave rattler noticing you. A dry rattle of bones with a hollow knock, 0.2 to 0.3 s.

#### A bone walker falling

- File: `sfx/creatures/bone_death_01.wav` (id `boneDeath`)
- Form: one-shot
- Volume: Effects

A skeleton or wraith defeated, under the defeat chime. Bones clattering to the floor, 0.3 to 0.45 s. No chime of its own.

#### A ghost noticing you

- File: `sfx/creatures/ghost_alert_01.wav` (id `ghostAlert`)
- Form: one-shot
- Volume: Effects

A ghost or wisp noticing you. A soft hollow moan or breathy whistle rising, 0.3 to 0.45 s. Eerie but gentle.

#### A ghost falling

- File: `sfx/creatures/ghost_death_01.wav` (id `ghostDeath`)
- Form: one-shot
- Volume: Effects

A ghost or wisp defeated, under the defeat chime. A sigh that thins into a high fading whisper, 0.3 to 0.5 s. No chime of its own.

#### A fire creature noticing you

- File: `sfx/creatures/ember_alert_01.wav` (id `emberAlert`)
- Form: one-shot
- Volume: Effects

A fire or ash creature (magma sprites, golems, lurkers, soot puffs) noticing you. A crackling flare like a fire catching, 0.2 to 0.3 s.

#### A fire creature falling

- File: `sfx/creatures/ember_death_01.wav` (id `emberDeath`)
- Form: one-shot
- Volume: Effects

A fire or ash creature defeated, under the defeat chime. A hiss of embers going out with a soft puff of ash, 0.3 to 0.45 s. No chime of its own.

#### A plant creature noticing you

- File: `sfx/creatures/plant_alert_01.wav` (id `plantAlert`)
- Form: one-shot
- Volume: Effects

A plant creature (bramble sprites, the gourd and stump lurkers) noticing you. A creak of wood and a rustle of leaves, 0.2 to 0.3 s.

#### A plant creature falling

- File: `sfx/creatures/plant_death_01.wav` (id `plantDeath`)
- Form: one-shot
- Volume: Effects

A plant creature defeated, under the defeat chime. A woody snap and a scatter of leaves, 0.25 to 0.4 s. No chime of its own.

### `sfx/farming/`

#### Thick weeds cut with the weapon

- Files (a pool of 3): `sfx/farming/weeds_cut_rustle_01.wav`, `sfx/farming/weeds_cut_rustle_02.wav`, `sfx/farming/weeds_cut_rustle_03.wav` (id `rustle`)
- Form: one-shot
- Volume: Effects

Cutting thick weeds with a weapon. A quick leafy swish and snap, 0.15 to 0.3 s. Heard in bursts while clearing, so keep it light; Record 3 variants.

#### A seed planted

- File: `sfx/farming/seed_plant_01.wav` (id `seed`)
- Form: one-shot
- Volume: Effects

A seed pressed into the soil. A tiny soft pop or tap, under 0.1 s. Frequent and small; it should feel satisfying, not loud.

### `sfx/fishing/`

#### A fish biting

- File: `sfx/fishing/fish_bite_alert_01.wav` (id `bite`)
- Form: one-shot
- Volume: Effects

A fish biting: the reel starts now. A sharp alert, two quick plucks or a bobber plunk with a ping, about 0.2 s. Must cut through music and ambience.

#### A fish caught

- File: `sfx/fishing/fish_caught_01.wav` (id `catch`)
- Form: one-shot
- Volume: Effects

A fish caught. A short rising fanfare, 0.4 to 0.6 s, bright plucked or bell tones. Celebratory but small.

#### A fish getting away

- File: `sfx/fishing/fish_escaped_01.wav` (id `miss`)
- Form: one-shot
- Volume: Effects

A fish getting away. A soft falling slide or 'aww' plunk, 0.3 to 0.4 s. Disappointed, not punishing.

### `sfx/items/`

#### Picking something up

- File: `sfx/items/item_pickup_01.wav` (id `pickup`)
- Form: one-shot
- Volume: Effects

Picking anything up. A light, happy two-note blip or soft pluck, about 0.15 s. Extremely frequent: pleasant and quick, the game's most 'feel-good' tiny sound.

#### Gold earned

- File: `sfx/items/coins_earned_01.wav` (id `coin`)
- Form: one-shot
- Volume: Effects

Gold earned (selling, rewards). Two bright coin chings, about 0.2 s. Classic and clean.

#### Setting an object down

- File: `sfx/items/object_place_01.wav` (id `place`)
- Form: one-shot
- Volume: Effects

Setting an object, furniture or a building piece down. A soft wooden thud, about 0.1 s.

### `sfx/jingles/`

#### A skill levelling up

- File: `sfx/jingles/skill_level_up_01.wav` (id `levelup`)
- Form: one-shot
- Volume: Effects

A skill levelling up. A rising arpeggio jingle, 0.5 to 0.8 s, bells or plucked strings, ending on the home note. A proud moment.

#### Blessings, guide steps and tips

- File: `sfx/jingles/wishing_stone_chime_01.wav` (id `chime`)
- Form: one-shot
- Volume: Effects

Blessings at the wishing stone, guide steps and tips. Two gentle bell or chime tones, about 0.6 s, a little magical.

#### Waking up to the morning report

- File: `sfx/jingles/morning_wake_01.wav` (id `morning`)
- Form: one-shot
- Volume: Effects

Waking up to the morning report. A short bright 3-note morning jingle, 0.4 to 0.6 s, like a music-box or glockenspiel. Heard every in-game day: friendly, not alarm-like.

### `sfx/tools/`

#### The hoe tilling soil

- Files (a pool of 3): `sfx/tools/hoe_till_soil_01.wav`, `sfx/tools/hoe_till_soil_02.wav`, `sfx/tools/hoe_till_soil_03.wav` (id `hoe`)
- Form: one-shot
- Volume: Effects

The hoe biting into soil. A soft dull thunk with a little crumble of earth, 0.15 to 0.25 s. One of the most repeated sounds in the game (dozens a day): short, low, never harsh. Record 3 variants.

#### The watering can pouring

- Files (a pool of 3): `sfx/tools/watering_can_pour_01.wav`, `sfx/tools/watering_can_pour_02.wav`, `sfx/tools/watering_can_pour_03.wav` (id `can`)
- Form: one-shot
- Volume: Effects

Watering a tile. A short gentle pour, water onto soil, 0.3 to 0.5 s. Very frequent: soft, no splash peak. 2 or 3 variants.

#### The axe chopping

- Files (a pool of 3): `sfx/tools/axe_chop_wood_01.wav`, `sfx/tools/axe_chop_wood_02.wav`, `sfx/tools/axe_chop_wood_03.wav` (id `axe`)
- Form: one-shot
- Volume: Effects

The axe hitting wood (trees, stumps, twigs). A solid woody chock with a short resonance, 0.15 to 0.3 s. 3 variants; the last hit that fells a tree is the same sound.

#### The pickaxe striking rock

- Files (a pool of 3): `sfx/tools/pickaxe_strike_rock_01.wav`, `sfx/tools/pickaxe_strike_rock_02.wav`, `sfx/tools/pickaxe_strike_rock_03.wav` (id `pick`)
- Form: one-shot
- Volume: Effects

The pickaxe striking stone or ore. A bright clink with a gritty crunch, 0.1 to 0.25 s. Heard hundreds of times in the mines: crisp but not piercing. 3 variants.

### `sfx/ui/`

#### Menu buttons

- File: `sfx/ui/menu_click_01.wav` (id `ui`)
- Form: one-shot
- Volume: Interface

Menu buttons and clicks. A tiny soft tick or wooden tap, under 0.05 s. Heard constantly in menus: almost subliminal (it plays at the Interface volume).

### `sfx/world/`

#### Going through a door or onto another map

- File: `sfx/world/door_map_change_01.wav` (id `door`)
- Form: one-shot
- Volume: Effects

Going through a door or onto another map. A short swing-and-latch or soft whoosh, 0.3 to 0.4 s. Very frequent: quiet and neutral.

#### Thunder in a storm

- Files (a pool of 3): `sfx/world/thunder_rumble_01.wav`, `sfx/world/thunder_rumble_02.wav`, `sfx/world/thunder_rumble_03.wav` (id `thunder`)
- Form: one-shot
- Volume: Effects

Thunder with the lightning in a storm. A distant crack then a long rolling rumble, 2 to 3 s. Played over the rain loop; record 3 variants at different distances (near, middle, far).

#### A lantern set on the water

- File: `sfx/world/lantern_water_splash_01.wav` (id `splash`)
- Form: one-shot
- Volume: Effects

A lantern set on the water. A soft small splash with a ripple, about 0.3 s.

## Footsteps

One per step, by what is underfoot (Steps in the menu turns them off). About four a second, so every step must be subtle, and variants matter most here.

### `sfx/footsteps/`

#### Walking on grass

- Files (a pool of 4): `sfx/footsteps/footstep_grass_01.wav`, `sfx/footsteps/footstep_grass_02.wav`, `sfx/footsteps/footstep_grass_03.wav`, `sfx/footsteps/footstep_grass_04.wav` (id `grass`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on grass (the default outdoors). A soft brushy step, under 0.1 s. About 4 steps a second, so it must be very subtle. Record 4 variants.

#### Walking on dirt paths

- Files (a pool of 4): `sfx/footsteps/footstep_dirt_path_01.wav`, `sfx/footsteps/footstep_dirt_path_02.wav`, `sfx/footsteps/footstep_dirt_path_03.wav`, `sfx/footsteps/footstep_dirt_path_04.wav` (id `path`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on dirt paths and roads. A soft gritty crunch, under 0.1 s, a bit firmer than grass. 4 variants.

#### Walking on sand

- Files (a pool of 4): `sfx/footsteps/footstep_sand_01.wav`, `sfx/footsteps/footstep_sand_02.wav`, `sfx/footsteps/footstep_sand_03.wav`, `sfx/footsteps/footstep_sand_04.wav` (id `sand`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on sand (the beach, the Dunes, the island). A soft shifting hiss, under 0.12 s. 4 variants.

#### Walking on stone

- Files (a pool of 4): `sfx/footsteps/footstep_stone_01.wav`, `sfx/footsteps/footstep_stone_02.wav`, `sfx/footsteps/footstep_stone_03.wav`, `sfx/footsteps/footstep_stone_04.wav` (id `stone`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on stone (the quarry, caves, the Hollow, stone paths). A hard dry tap, under 0.08 s, slightly echoey underground. 4 variants.

#### Walking on wooden floors and the pier

- Files (a pool of 4): `sfx/footsteps/footstep_wood_01.wav`, `sfx/footsteps/footstep_wood_02.wav`, `sfx/footsteps/footstep_wood_03.wav`, `sfx/footsteps/footstep_wood_04.wav` (id `wood`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on wooden floors indoors, the pier and wood paths. A hollow wooden knock, under 0.1 s. 4 variants.

#### Walking on snow

- Files (a pool of 4): `sfx/footsteps/footstep_snow_01.wav`, `sfx/footsteps/footstep_snow_02.wav`, `sfx/footsteps/footstep_snow_03.wav`, `sfx/footsteps/footstep_snow_04.wav` (id `snow`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on snow outdoors in winter. A soft compressing crunch, under 0.15 s. 4 variants.

#### Walking on wet ground in rain

- Files (a pool of 4): `sfx/footsteps/footstep_wet_ground_01.wav`, `sfx/footsteps/footstep_wet_ground_02.wav`, `sfx/footsteps/footstep_wet_ground_03.wav`, `sfx/footsteps/footstep_wet_ground_04.wav` (id `wet`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Walking on wet ground outdoors in rain. A soft squelchy splash, under 0.12 s. 4 variants.

#### Riding the horse

- Files (a pool of 4): `sfx/footsteps/horse_hoof_01.wav`, `sfx/footsteps/horse_hoof_02.wav`, `sfx/footsteps/horse_hoof_03.wav`, `sfx/footsteps/horse_hoof_04.wav` (id `hoof`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Effects

Riding the horse. One hoofbeat clop on earth, under 0.1 s, played about 3 times a second. 4 variants.

## Ambient and environment loops

Looped and faded with the scene: the levels are set by the rules in `src/data/ambience.js`. Loops must join end to start without a click, and no single event should stand out (a repeat you can spot gets tiring).

### `ambience/underground/`

#### Inside caves

- File: `ambience/underground/cave_hum_loop_01.wav` (id `hum`)
- Form: seamless loop
- Volume: Ambience

The air inside caves and the Hollow: a very low, soft hum or room tone, 10 to 20 s seamless loop. Felt rather than heard, under the music.

### `ambience/water/`

#### On the beach

- File: `ambience/water/sea_surf_loop_01.wav` (id `surf`)
- Form: seamless loop
- Volume: Ambience

Waves on the beach, 15 to 30 s seamless loop of gentle surf. The game also swells it slowly, so keep it even.

### `ambience/weather/`

#### Rain outdoors (and muffled indoors)

- File: `ambience/weather/rain_loop_01.wav` (id `rain`)
- Form: seamless loop
- Volume: Ambience

Steady rain outdoors, 10 to 30 s seamless loop. Even texture with no single drops or thunder standing out (a pattern you can hear repeat gets annoying fast). Plays at 70% in rain, 100% in storms, 25% (muffled) indoors.

#### Wind on windy maps, in winter, in rain and storms, and softly at night

- File: `ambience/weather/wind_loop_01.wav` (id `wind`)
- Form: seamless loop
- Volume: Ambience

Wind outdoors: on the desert and quarry, in winter, in rain and storms, softly at night. 15 to 30 s seamless loop, gentle and broad, slowly rising and falling; no sharp gusts (those are a separate call).

### `environment/`

#### Near a waterfall

- File: `environment/waterfall_loop_01.wav` (id `falls`)
- Form: seamless loop
- Volume: Ambience

A waterfall, heard as you walk near (louder the closer). 10 to 20 s seamless loop of falling water, full and steady.

#### Near a hearth or stove

- File: `environment/hearth_fire_loop_01.wav` (id `fire`)
- Form: seamless loop
- Volume: Ambience

A hearth or stove indoors, heard as you get near. 10 to 20 s seamless loop of a soft fire breath and low roar; the crackles are a separate call.

## Ambient calls

One-shots at random moments while the scene suits them (rules in `src/data/ambience.js`). Record them with a little distance and air, as heard from across a field.

### `ambience/nature/`

#### Birdsong by day

- Files (a pool of 4): `ambience/nature/bird_chirp_01.wav`, `ambience/nature/bird_chirp_02.wav`, `ambience/nature/bird_chirp_03.wav`, `ambience/nature/bird_chirp_04.wav` (id `bird`)
- Form: one-shot; the game shifts its pitch up to 25% either way each play
- Volume: Ambience

Birdsong by day in the wild and in town (not in winter or rain). One short phrase of 2 to 4 chirps, 0.3 to 0.8 s. Record 4 different calls, as if from different birds, to make the world feel alive; the game varies the pitch too.

#### Crickets at night

- File: `ambience/nature/cricket_chirp_01.wav` (id `cricket`)
- Form: one-shot; the game shifts its pitch up to 5% either way each play
- Volume: Ambience

Crickets on dry nights out of winter. One short chirp burst, under 0.2 s, played often; keep it soft and high.

#### An owl at night in the wild

- File: `ambience/nature/owl_hoot_01.wav` (id `owl`)
- Form: one-shot; the game shifts its pitch up to 6% either way each play
- Volume: Ambience

An owl at night in the wild, rare. A soft two-note hoot, about 1 s, from a distance.

### `ambience/town/`

#### A far bell in town

- File: `ambience/town/town_bell_distant_01.wav` (id `bell`)
- Form: one-shot
- Volume: Ambience

A far bell in town by day, rare. One distant church-like bell strike with a long tail, 1 to 2 s, very soft.

### `ambience/underground/`

#### Water dripping in caves

- Files (a pool of 3): `ambience/underground/cave_drip_01.wav`, `ambience/underground/cave_drip_02.wav`, `ambience/underground/cave_drip_03.wav` (id `drip`)
- Form: one-shot; the game shifts its pitch up to 15% either way each play
- Volume: Ambience

Water dripping in caves. A single drop into a pool with a small echo, 0.1 to 0.3 s. 3 variants.

### `ambience/water/`

#### Gulls at the shore

- File: `ambience/water/gull_cry_01.wav` (id `gull`)
- Form: one-shot; the game shifts its pitch up to 10% either way each play
- Volume: Ambience

Gulls at the shore by day. One or two gull cries, 0.5 to 0.8 s, from a little distance.

### `ambience/weather/`

#### Gusts on windy maps

- File: `ambience/weather/wind_gust_01.wav` (id `gust`)
- Form: one-shot; the game shifts its pitch up to 10% either way each play
- Volume: Ambience

A gust on windy maps (the Dunes, the quarry). A swelling whoosh that fades, 1.5 to 2 s, over the wind loop.

#### Rain tapping on a window

- Files (a pool of 3): `ambience/weather/rain_on_glass_01.wav`, `ambience/weather/rain_on_glass_02.wav`, `ambience/weather/rain_on_glass_03.wav` (id `tap`)
- Form: one-shot; the game shifts its pitch up to 30% either way each play
- Volume: Ambience

Rain tapping on a window, indoors while it rains outside. One tiny tick of a drop on glass, under 0.05 s, played very often. 3 variants.

### `environment/`

#### A fire crackling

- Files (a pool of 3): `environment/fire_crackle_01.wav`, `environment/fire_crackle_02.wav`, `environment/fire_crackle_03.wav` (id `crackle`)
- Form: one-shot; the game shifts its pitch up to 20% either way each play
- Volume: Ambience

A fire crackling near a hearth or stove. One to three small pops and snaps, under 0.3 s, played often. 3 variants.

<!-- slots:end -->
