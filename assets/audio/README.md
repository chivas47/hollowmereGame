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
    ├── tools/  farming/  combat/  fishing/  items/  animals/  world/  jingles/  ui/
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
| mines | the Hollow, the Sunken Cavern, the Ember Vent | one per zone |
| island | the island, the dig site, the Smoke Peak | the island; the dig site and the peak their own |
| desert | the Dunes, the Oasis, the Gilded Dune casino | the Dunes; the casino its own |
| others | house, forest, beach, mountains, wilds, caves, sacred (shrine, crypt), tavern, shops | one each |

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
| The Hollow, caves | mysterious | synth pads, low bass, sparse percussion |
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
  `peak`) beats everything its region has. A new map goes in a region in `REGIONS`; a test fails if a map has no music.
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
no ids it re-records everything, overwriting the first file of every slot, including ones you replaced.

### Credits

None yet: every file is generated by the game.

<!-- slots:start (written by tools/audio_list.mjs --readme) -->

## Music

Ogg Vorbis, one file per track, named by its id. Several tracks that fit the same moment make a pool (the director draws one and moves on after a few loops). Key and tempo are the generated placeholder's.

| File | Track | Plays for | Placeholder key, tempo | Id |
|---|---|---|---|---|
| `music/farm/farm_spring_01.ogg` | Spring on the Farm | location, season; in farm; Spring | E major pentatonic, 100 bpm | `farm_spring_01` |
| `music/farm/farm_spring_02.ogg` | First Shoots | location, season; in farm; Spring | D major pentatonic, 96 bpm | `farm_spring_02` |
| `music/farm/farm_summer_01.ogg` | Summer on the Farm | location, season; in farm; Summer | G major pentatonic, 112 bpm | `farm_summer_01` |
| `music/farm/farm_autumn_01.ogg` | Autumn on the Farm | location, season; in farm; Autumn | D dorian, 92 bpm | `farm_autumn_01` |
| `music/farm/farm_winter_01.ogg` | Winter on the Farm | location, season; in farm; Winter | C minor pentatonic, 80 bpm | `farm_winter_01` |
| `music/farm/farm_night_01.ogg` | Farm After Dark | location; in farm; night | A minor pentatonic, 70 bpm | `farm_night_01` |
| `music/farm/farm_rain_01.ogg` | Rain on the Rows | location; in farm; rain, storm | B dorian, 84 bpm | `farm_rain_01` |
| `music/village/village_spring_01.ogg` | Village in Spring | location; in village; Spring | G major hexatonic, 108 bpm | `village_spring_01` |
| `music/village/village_summer_01.ogg` | Village in Summer | location; in village; Summer | A major pentatonic, 116 bpm | `village_summer_01` |
| `music/village/village_autumn_01.ogg` | Village in Autumn | location; in village; Autumn | E dorian, 98 bpm | `village_autumn_01` |
| `music/village/village_winter_01.ogg` | Village in Winter | location; in village; Winter | D minor pentatonic, 86 bpm | `village_winter_01` |
| `music/village/village_rain_01.ogg` | Village in the Rain | location; in village; rain, storm | C dorian, 88 bpm | `village_rain_01` |
| `music/wild/forest_01.ogg` | Under the Canopy | location; in forest | D dorian, 92 bpm | `forest_01` |
| `music/wild/beach_01.ogg` | Tide Line | location; in beach | F lydian, 100 bpm | `beach_01` |
| `music/wild/mountain_01.ogg` | High Paths | location; in mountains | C major hexatonic, 90 bpm | `mountain_01` |
| `music/wild/exploration_01.ogg` | Off the Map | location; in wilds | A dorian, 104 bpm | `exploration_01` |
| `music/underground/hollow_01.ogg` | The Hollow | location; at hollow; in mines | D phrygian, 72 bpm | `hollow_01` |
| `music/underground/caves_01.ogg` | Drip and Echo | location; in caves | C phrygian, 66 bpm | `caves_01` |
| `music/indoors/house_01.ogg` | Home | location; in house | E major pentatonic, 82 bpm | `house_01` |
| `music/indoors/tavern_01.ogg` | The Common Room | location; in tavern | D blues, 118 bpm | `tavern_01` |
| `music/indoors/shops_01.ogg` | Open for Business | location; in shops | G major hexatonic, 104 bpm | `shops_01` |
| `music/underground/cavern_01.ogg` | The Sunken Cavern | location; at cavern; in mines | C# phrygian, 78 bpm | `cavern_01` |
| `music/underground/vent_01.ogg` | The Ember Vent | location; at vent; in mines | D# blues, 92 bpm | `vent_01` |
| `music/duskmarch/gloamwood_01.ogg` | Gloamwood | location; at gloamwood; in duskmarch | A dorian, 86 bpm | `gloamwood_01` |
| `music/duskmarch/tangle_01.ogg` | The Tangle | location; at tangle; in duskmarch | G phrygian, 80 bpm | `tangle_01` |
| `music/duskmarch/mournfield_01.ogg` | Mournfield | location; at mournfield; in duskmarch | F minor pentatonic, 66 bpm | `mournfield_01` |
| `music/duskmarch/mournfield_night_01.ogg` | When the Dead Walk | location; at mournfield; in duskmarch; night | D phrygian, 72 bpm | `mournfield_night_01` |
| `music/sacred/sacred_01.ogg` | Old Stones | location; in sacred | D phrygian, 64 bpm | `sacred_01` |
| `music/island/island_01.ogg` | Warm Water | location; in island | F lydian, 104 bpm | `island_01` |
| `music/island/digsite_01.ogg` | Bones in the Sand | location; at digsite; in island | D dorian, 94 bpm | `digsite_01` |
| `music/island/peak_01.ogg` | The Smoke Peak | location; at peak; in island | E blues, 100 bpm | `peak_01` |
| `music/desert/desert_01.ogg` | Heat Shimmer | location; in desert | D phrygian, 96 bpm | `desert_01` |
| `music/desert/casino_01.ogg` | The Gilded Dune | location; at inside_casino; in desert | C blues, 112 bpm | `casino_01` |
| `music/default/default_01.ogg` | Hollowmere | default | E major pentatonic, 96 bpm | `default_01` |
| `music/festivals/festival_01.ogg` | Bunting and Lanterns | event | F major hexatonic, 124 bpm | `festival_01` |
| `music/festivals/festival_spring_01.ogg` | Spring Fair | event; Spring | G major pentatonic, 128 bpm | `festival_spring_01` |
| `music/festivals/festival_summer_01.ogg` | Midsummer | event; Summer | A lydian, 132 bpm | `festival_summer_01` |
| `music/festivals/festival_autumn_01.ogg` | Maze Night | event; Autumn | D dorian, 112 bpm | `festival_autumn_01` |
| `music/festivals/festival_winter_01.ogg` | Frostlight | event; Winter | E major hexatonic, 100 bpm | `festival_winter_01` |
| `music/festivals/festival_harvest_01.ogg` | Harvest Home | event; festival grangefair, weighin | F major pentatonic, 120 bpm | `festival_harvest_01` |
| `music/festivals/competition_01.ogg` | The Judges Walk | event; festival blossom, catch | G blues, 124 bpm | `competition_01` |
| `music/story/story_01.ogg` | A Letter at Winter's End | cutscene | C lydian, 76 bpm | `story_01` |
| `music/story/celebration_01.ogg` | The Whole Valley Gathers | cutscene; cutscene wedding | F major hexatonic, 112 bpm | `celebration_01` |
| `music/combat/combat_01.ogg` | Teeth in the Dark | combat | E blues, 140 bpm | `combat_01` |
| `music/combat/combat_02.ogg` | Hold the Line | combat | D phrygian, 146 bpm | `combat_02` |
| `music/combat/boss_01.ogg` | The Golden One | boss | C phrygian, 152 bpm | `boss_01` |
| `music/fishing/fishing_01.ogg` | Something on the Line | fishing | G major pentatonic, 132 bpm | `fishing_01` |
| `music/menu/menu_01.ogg` | Hollowmere Farm | menu | E lydian, 88 bpm | `menu_01` |
| `music/menu/credits_01.ogg` | Thank You for Playing | credits | D major pentatonic, 84 bpm | `credits_01` |
| `music/stingers/sting_gameover.ogg` | Carried Home | sting:gameover (once) | A minor pentatonic, 70 bpm | `sting_gameover` |
| `music/stingers/sting_victory.ogg` | Victory | sting:victory (once) | G major pentatonic, 120 bpm | `sting_victory` |
| `music/stingers/sting_discovery.ogg` | A New Place | sting:discovery (once) | A lydian, 100 bpm | `sting_discovery` |

## Sound effects

One-shots, played when something happens (the Effects volume; the menu click is Interface).

| File | Plays for | Id in data/audio.js |
|---|---|---|
| `sfx/farming/weeds_cut_rustle_01.wav` | thick weeds cut with the weapon | `rustle` |
| `sfx/tools/hoe_till_soil_01.wav` | the hoe tilling soil | `hoe` |
| `sfx/tools/watering_can_pour_01.wav` | the watering can pouring | `can` |
| `sfx/farming/seed_plant_01.wav` | a seed planted | `seed` |
| `sfx/tools/axe_chop_wood_01.wav` | the axe chopping | `axe` |
| `sfx/tools/pickaxe_strike_rock_01.wav` | the pickaxe striking rock | `pick` |
| `sfx/combat/sword_swing_01.wav` | a sword swing | `sword` |
| `sfx/combat/dagger_swing_01.wav` | a dagger swing | `swingDagger` |
| `sfx/combat/club_swing_01.wav` | a club or hammer swing | `swingClub` |
| `sfx/combat/weapon_hit_01.wav` | a blow landing on a creature | `hit` |
| `sfx/combat/weapon_hit_critical_01.wav` | a critical hit | `crit` |
| `sfx/combat/monster_defeated_01.wav` | a creature defeated | `slay` |
| `sfx/combat/ground_slam_01.wav` | a weapon special slamming the ground | `slam` |
| `sfx/combat/low_health_heartbeat_01.wav` | low health in a fight | `heartbeat` |
| `sfx/items/item_pickup_01.wav` | picking something up | `pickup` |
| `sfx/fishing/fish_bite_alert_01.wav` | a fish biting | `bite` |
| `sfx/fishing/fish_caught_01.wav` | a fish caught | `catch` |
| `sfx/fishing/fish_escaped_01.wav` | a fish getting away | `miss` |
| `sfx/combat/player_hurt_01.wav` | the farmer hurt | `hurt` |
| `sfx/items/coins_earned_01.wav` | gold earned | `coin` |
| `sfx/jingles/skill_level_up_01.wav` | a skill levelling up | `levelup` |
| `sfx/animals/animal_pet_01.wav` | petting an animal | `pet` |
| `sfx/items/object_place_01.wav` | setting an object down | `place` |
| `sfx/world/door_map_change_01.wav` | going through a door or onto another map | `door` |
| `sfx/combat/bomb_explosion_01.wav` | a bomb | `boom` |
| `sfx/world/thunder_rumble_01.wav` | thunder in a storm | `thunder` |
| `sfx/animals/bird_take_off_01.wav` | a bird taking off | `flap` |
| `sfx/ui/menu_click_01.wav` | menu buttons | `ui` |
| `sfx/jingles/wishing_stone_chime_01.wav` | blessings, guide steps and tips | `chime` |
| `sfx/world/lantern_water_splash_01.wav` | a lantern set on the water | `splash` |
| `sfx/jingles/morning_wake_01.wav` | waking up to the morning report | `morning` |

## Footsteps

One per step, by what is underfoot (the Effects volume; Steps turns them off). Pools are most worth it here.

| File | Plays for | Id in data/audio.js |
|---|---|---|
| `sfx/footsteps/footstep_grass_01.wav` | walking on grass | `grass` |
| `sfx/footsteps/footstep_dirt_path_01.wav` | walking on dirt paths | `path` |
| `sfx/footsteps/footstep_sand_01.wav` | walking on sand | `sand` |
| `sfx/footsteps/footstep_stone_01.wav` | walking on stone | `stone` |
| `sfx/footsteps/footstep_wood_01.wav` | walking on wooden floors and the pier | `wood` |
| `sfx/footsteps/footstep_snow_01.wav` | walking on snow | `snow` |
| `sfx/footsteps/footstep_wet_ground_01.wav` | walking on wet ground in rain | `wet` |
| `sfx/footsteps/horse_hoof_01.wav` | riding the horse | `hoof` |

## Ambient and environment loops

Looped and faded with the scene: the levels are set by the rules in `src/data/ambience.js`.

| File | Plays for | Id in data/audio.js |
|---|---|---|
| `ambience/weather/rain_loop_01.wav` | rain outdoors (and muffled indoors) | `rain` |
| `ambience/weather/wind_loop_01.wav` | wind on windy maps, in winter, in rain and storms, and softly at night | `wind` |
| `environment/waterfall_loop_01.wav` | near a waterfall | `falls` |
| `ambience/water/sea_surf_loop_01.wav` | on the beach | `surf` |
| `ambience/underground/cave_hum_loop_01.wav` | inside caves | `hum` |
| `environment/hearth_fire_loop_01.wav` | near a hearth or stove | `fire` |

## Ambient calls

One-shots at random moments while the scene suits them (rules in `src/data/ambience.js`).

| File | Plays for | Id in data/audio.js |
|---|---|---|
| `ambience/nature/bird_chirp_01.wav` | birdsong by day | `bird` |
| `ambience/nature/cricket_chirp_01.wav` | crickets at night | `cricket` |
| `ambience/water/gull_cry_01.wav` | gulls at the shore | `gull` |
| `ambience/underground/cave_drip_01.wav` | water dripping in caves | `drip` |
| `ambience/town/town_bell_distant_01.wav` | a far bell in town | `bell` |
| `ambience/weather/wind_gust_01.wav` | gusts on windy maps | `gust` |
| `ambience/weather/rain_on_glass_01.wav` | rain tapping on a window | `tap` |
| `ambience/nature/owl_hoot_01.wav` | an owl at night in the wild | `owl` |
| `environment/fire_crackle_01.wav` | a fire crackling | `crackle` |

<!-- slots:end -->
