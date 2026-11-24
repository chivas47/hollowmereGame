// v295: each neighbour's own voice, on top of their lines in data/npcs.js, so nobody repeats themselves for weeks
// and no two people say the same thing. Written from each one's life: their work, their family and friends, their
// worries and their jokes. Plain words, our own (PROJECT_INSTRUCTIONS rules 1 and 8). {name}: the farmer; {fav}: their
// favourite thing (the farmer profile).
//   more: [strangers, 2+ hearts, 5+ hearts], lines added to that tier's pool in data/npcs.js
//   season: one line per season, said now and then in that season and on its first day
//   snow: their word on a snowy day; birthday: on their own birthday; bday: on someone else's ({name}: whose; a friend
//   still tells you what they love, data/topics.js BIRTHDAY.friend); eve: the day before a festival, before its intro
//   again: when you talk to them again the same day, after they have said their piece
// v323 (roadmap 113): depth, for anyone written up to it (the marriage candidates first), all optional:
//   more[3]: lines once you are close (8+ hearts), dealt together with the 5+ pool so those lines stay in the mix
//   season: a line or a list of lines per season (one a day, by day)
//   rain: their own words on a rainy day (a list, one a day), instead of the one line in data/npcs.js RAIN_LINES
//   places: { map id: [lines] }, now and then when you meet them there (PLACE_CHANCE)
// How often, on a day with nothing else to say, a neighbour mentions the season instead of their own news.
export const SEASON_CHANCE = 1 / 6;
// v323: how often a neighbour met at one of their own places talks about it (on a day with nothing more pressing).
export const PLACE_CHANCE = 1 / 3;
// v323: every line a voice holds, for tests and tools (no two people may share one).
export const voiceLines = (v) => [...v.more.flat(), ...Object.values(v.season).flat(), v.snow, v.birthday, v.bday, v.eve, ...v.again,
  ...(v.rain || []), ...Object.values(v.places || {}).flat()].filter(Boolean);

export const VOICES = {
  ines: {
    more: [
      ['If one lands on you, stand still and think kind thoughts. It works more than you would expect.', 'I sell honey from a table by my gate. Pay what you think is fair; the bees do not count.', "Clover, then lime, then heather. You can taste the whole year in a shelf of jars.", "I wear the veil for the bees' sake, not mine. They get embarrassed."],
      ['A hive swarmed on Tuesday. I followed it halfway to the Wilds in my slippers.', 'Tamsin says her cows give better milk when my bees work her clover. I think she is being polite. I hope she is not.', 'I talk to the hives every morning. You tell them the news, or they sulk. Old rule.', 'Nell and I swapped seedlings for honey again. Neither of us knows who is winning.'],
      ['I told the bees about you. Properly, the way you tell them about family.', 'My mother kept the first hive. When she passed I nearly let them go. I am glad I did not.', 'There is a jar on my shelf with your name on it. I am waiting for a good year to fill it.', 'Come out to the hives at dusk one evening. The sound they make then, you will not forget it.'],
      // v323 (roadmap 113a): once you are close
      ['I caught myself humming at the hives this morning. The bees hum back, so I can never tell who started it.', 'You smell a little of smoke and clover today. That means you have been near my bees, or near me. Both, I hope.', 'My mother said a keeper knows the right person by how the bees settle round them. Mine settle round you. I am only telling you what I saw.', 'Some evenings I walk to your gate and back without knocking. Just to see the lamp on.', 'When the season is done I am going to teach you to cut comb. Properly, with the warm knife. It is a thing I have only ever shown family.'],
    ],
    season: {   // v323: a few each
      Spring: ['Spring. The bees wake hungry and cross, and so do I.', 'The willows are out by the stream. Willow pollen is the first good meal the bees get all year.', 'I split two hives this spring. One went quietly. The other told me exactly what it thought of me.'],
      Summer: ['Summer. The hives roar all day. I can hear them from my kitchen.', 'The lime trees past the east road are in flower. Lime honey is pale and sharp. Nell says it tastes like a sneeze.', 'Hot days, I put out shallow dishes of water with stones in, so the bees can drink without drowning.'],
      Autumn: ["Autumn. Time to take the honey and leave them enough for winter. Greed kills hives.", 'Ivy is the last flower of the year. The bees go mad for it. The honey sets hard as soap.', 'I melt the old comb down for candles now. The cottage smells like a church for a week.'],
      Winter: ['Winter. I wrap the hives in straw and put my ear to them. Still humming. Good.', 'In winter I knock on each hive and listen. A hum means all is well. Silence means I sit down for a while.', 'I mend frames by the stove all winter. It is slow work, and I like slow work.'],
    },
    rain: ['The bees stay in when it rains, so I do too. The whole kitchen smells of honey.', 'Rain on the hives sounds like a drum. They will be grumpy tomorrow. So will the clover.', 'I put a tile on each hive roof when it rains. My mother called them hats. I still call them hats.'],
    places: {
      wilds: ['My bees forage out here when the meadow flowers. I like to come and watch them work. It is only polite.', 'See that one on the thistle? Mine. You can tell by the way she does not hurry.'],
      beach: ['Saturdays I sit here with Nell and say nothing. It is the best conversation of my week.', 'Bees will not cross open sea. I like that about them. They know where home is.'],
    },
    snow: 'Snow on the hives. They are warm inside, all huddled round the queen. Like us round a stove.',
    birthday: 'My birthday. I am going to eat honey straight off the comb with my fingers. Do not tell anyone.',
    bday: "It is {name}'s birthday. I am taking them a jar of the good honey. The dark one.",
    eve: 'The {festival} is tomorrow. I am bringing honey cakes. Three dozen. They will be gone in an hour.',
    again: ['Still here? The bees would say you are lingering. I say it is nice.', 'Go on, I have kept you long enough. Mind the clover on your way.'],
  },
  bram: {
    more: [
      ['Mind that gate hinge. I would fix it, but it is not my gate.', 'Most things break because somebody was in a hurry. Slow down.', 'Oak for posts, ash for handles, pine for nothing you care about.', 'Farmer before you planted in circles. Circles. I ask you.'],
      ['My knees know when rain is coming. They are never wrong. The almanac is wrong all the time.', 'I still have every tool I ever bought. Some I have not used in twenty years. Still sharp.', 'Tamsin\'s barn was my first big job. I was younger than you. Still standing. So am I.', 'Wren tried to sell me a plastic bucket once. Once.'],
      ['My wife used to bring me lunch at the workshop. I still stop at noon. Habit, I suppose.', 'I am too old to build much now. Watching you build things is the next best thing.', 'Made a stool for your kitchen. It is in my shed. I will bring it when I stop fussing with it.', 'You are the first person in years who has asked me how to do something. Do you know what that is worth to an old man?'],
    ],
    season: { Spring: 'Spring. Everything swells and sticks. Plane your doors now or curse them in May.', Summer: 'Summer. Wood splits in the heat. So do tempers. Keep both in the shade.', Autumn: 'Autumn. Best time to fell. The sap is down and the wood behaves.', Winter: 'Winter. I sit by the stove and carve spoons nobody needs. Do not tell me otherwise.' },
    snow: 'Snow. Check your roof beams. If they groan, come and get me. If they crack, run.',
    birthday: 'Birthday. Seventy-something. I stopped counting when I ran out of fingers and toes twice.',
    bday: "{name}'s birthday today. In my day you made a person something. A spoon. A stool. Something.",
    eve: 'The {festival} is tomorrow. I will sit on the bench I built and complain about the music. Tradition.',
    again: ['You again. Go on, the day is half gone.', 'I have said my piece. Off you go before I start on hinges.'],
  },
  odile: {
    more: [
      ['A good knot holds when you need it and lets go when you ask. Most people are worse than that.', 'I tie nets in the evening. My hands do it; my head goes elsewhere.', 'Do not walk on the pond bank after rain. It slides, and so do you.', 'My mother mended nets for forty boats. I mend for six. Nets are better now. Boats are not.'],
      ['I saw a heron take a fish bigger than its head this morning. It looked surprised too.', 'Rook ties a bowline backwards. It holds. It still offends me.', 'I caught nothing yesterday and it was a good day. People do not understand that.', 'If you ever tear your line, bring it here. I will splice it so you cannot find the join.'],
      ['I do not say much to most people. You make it easy. I have not decided if I like that.', 'My mother would have liked you. She liked anyone who was up before the light.', 'Some mornings I think about going back south. Then the mist comes off the pond and I stay.', 'Here. A net needle. My mother\'s. I have two. Do not lose it.'],
      // v324 (roadmap 113b): once you are close
      ["I caught a grayling this morning and my first thought was to show you. That has never happened before. I did not care for it.", "You are the only person I let walk on the bank while I fish. Even the herons have to wait.", "I sleep better since you came. I do not know why. I have decided not to ask.", "My mother said a good net is mostly holes. I think a good life might be the same. Room for what matters to swim in.", "If you ever want to learn the pond properly, every stone and every deep bit, I will teach you. Slowly. It takes years."],
    ],
    season: {   // v324: a few each
      Spring: ['Spring. The pond is cold and the fish are hungry. Best fishing of the year, if your fingers work.', "The ice goes off the pond all at once, with a sound like a sigh. I wait for it every year.", "Spring nets are the worst. Winter weed in every mesh. My hands smell of it until May."],
      Summer: ['Summer. The fish go deep and sulk. I fish at dawn or not at all.', "Summer evenings the midges come up off the water like smoke. I fish anyway. They eat me anyway.", "Children paddle in the shallows all summer and scare every fish. I pretend to be cross."],
      Autumn: ['Autumn. The grayling are fat and slow. I feel the same.', "The mist sits on the pond till noon in autumn. You cast into nothing and hope.", "Autumn is when I mend every net I own. All of them. It takes the whole season."],
      Winter: ['Winter. Ice at the edges. I mend nets by the fire and wait.', "In winter I cut a hole in the ice at the far end. The fish come to the light. So do I, I suppose.", "Long winter evenings I teach Esme knots. She ties them beautifully and cannot untie a single one."],
    },
    rain: ["Fish bite in the rain, but my knees do not like it. Nets today, pond tomorrow.", "Rain on the pond is the only time it is noisy. Thousands of little rings. I like to watch it from the door.", "Wet days I mend nets by the Lantern window. Esme draws me. I have stopped minding."],
    places: {
      wilds: ["This is my pond. Not on paper. But the fish know me, and the mist does.", "Stand there and do not talk and you will see the grayling rise. Most people talk."],
      beach: ["Sea nets are coarse. Pond nets are fine. I mend both. The sea is less patient with mistakes.", "My brother fishes a sea like this one, far south. I come here when I think about him."],
      "inside_tavern": ["The window seat is mine. Everyone knows. Even Lio does not argue.", "The light through that window is good for knots. The cider is good for the rest."],
    },
    snow: 'Snow on the pond. Everything goes grey and quiet. My favourite kind of morning.',
    birthday: 'My birthday. I am going to sit by the pond and not catch anything on purpose.',
    bday: "It is {name}'s birthday. I will say happy birthday. Once. Quietly.",
    eve: 'The {festival} is tomorrow. I will go for an hour and leave when the crowd thickens.',
    again: ['Still here. The fish will not catch themselves. Neither will your chores.', 'That is all I have today. Words run out before the morning does.'],
  },
  tavi: {
    more: [
      ['Is that tree new? It is not on any map. Hold on, I need to write that down.', 'I count my steps everywhere. Two thousand from the fountain to your gate. Roughly.', 'Old maps have dragons in the corners. Mine have question marks. Same idea.', 'My compass points a bit west near the Hollow. Either the compass is wrong or the Hollow is.'],
      ['I fell in the stream again mapping the ford. That is three times. The ford is now very accurate.', 'Kit wants me to draw a bridge that does not exist yet. Maps are for what is, Kit.', 'Aldous wants a cross for every bone ever found. I have run out of crosses.', 'I tried mapping the mere. It kept moving. Garrow says that is the reeds, not the water.'],
      ['I keep one map nobody else sees. It has the places I like. Your porch is on it.', 'My father made maps for the army. I make them so people can find each other. I think that is better.', 'When I was small I thought the edge of a map was the edge of the world. You make me want to go past it.', 'If I ever get lost, really lost, I hope it is somewhere near here.'],
    ],
    season: { Spring: 'Spring. Every path I drew last year is under mud. Start again.', Summer: 'Summer. The long days are best for mapping. My nose is permanently pink.', Autumn: 'Autumn. The leaves come down and suddenly I can see where everything is.', Winter: 'Winter. Snow hides the paths, so I draw the old ones from memory and hope.' },
    snow: 'Snow! Every path is gone. It is like the valley has been handed back blank.',
    birthday: 'My birthday. I am going to map the whole Wilds in one day. Or try. Mostly try.',
    bday: "{name}'s birthday! I am drawing them a map to their own front door. As a joke. A nice joke.",
    eve: 'I have a map of the {festival} grounds already, for tomorrow. With the food stalls marked. Obviously.',
    again: ['Back again? I was just measuring your shadow. Hold still.', 'I should go. There is a hedge out east that has moved, I am sure of it.'],
  },
  wren: {
    more: [
      ['First time? Turnips and potatoes. Cheap, quick, forgiving. Everybody starts there.', 'I order seed from the coast each season. Some of it even arrives on time.', 'Shopping list? Read it to me. I know where everything is, even the things I have lost.', 'Fenn\'s Provisions. Fenn was my grandmother. She would not let you leave without a bag.'],
      ['Rook bought nine pots of blue paint this month. Nine. I have stopped asking.', 'Juno brings the orders in. Half the time the labels are wet. I plant a few just to see what they are.', 'Somebody paid me in eggs today. I took them. I am not a monster.', 'I have a ledger going back sixty years. I can tell you who owed my father for nails.'],
      ['Dad wanted me to sell up and move to the coast. I did not. On days like this I know why.', 'I keep a packet of your favourite seed under the counter. Nobody else gets it. Rules are rules.', 'You are good for the shop and good for me. I should not say that out loud. I just did.', 'If I ever close early, it is because I went walking past your field. Do not tell anyone.'],
    ],
    season: { Spring: 'Spring. Everybody wants everything at once. I love it. I am also very tired.', Summer: 'Summer seed is in. Melons by the door, the good ones at the back.', Autumn: 'Autumn. Last chance for the big crops. People get desperate. I raise prices. Joking.', Winter: 'Winter. Quiet shop, warm stove, inventory. My favourite season. Do not tell anyone.' },
    snow: 'Snow. Nobody comes in, so I reorganise the shelves. Third time this week.',
    birthday: 'My birthday. Buy something. That is the gift. Anything. A single seed.',
    bday: "{name}'s birthday today. Half the valley has been in to buy them presents. The other half forgot.",
    eve: 'The {festival} is tomorrow. Shop is shut. I will be the one eating the most and buying nothing.',
    again: ['Forget something? Everybody does. Have a look round.', 'Off you go, I have a delivery to unpack and a cat asleep on it.'],
  },
  corvin: {
    more: [
      ['Copper is soft. Iron is honest. Gold is for people who want to look at things.', 'If it is broken, I fix it. If you broke it being stupid, I fix it slower.', 'Stand back from the quench. The steam does not care who you are.', 'My father worked this forge. So did his. I am the first who can read.'],
      ['Kit borrowed my tongs again. I found them in a machine that waters plants. It worked.', 'Hob\'s stew is the only thing in this town I do not have to fix.', 'Wilmot says my springs are nearly as good as his. Nearly. He will die before he says as good.', 'Aurel and I had lunch. He said "good bread." I said "yes." Best talk we have had all month.'],
      ['I do not talk much. The hammer does it for me. You seem to understand that.', 'My father hit me with a cold bar once for letting the fire die. I never let it die again. I never hit anyone.', 'I am making you a gate latch. A proper one. It will outlive the gate.', 'When you come in, I stop hammering. I do not do that for anybody else.'],
    ],
    season: { Spring: 'Spring. Everybody remembers their tools are broken at the same time. Queue.', Summer: 'Summer. The forge and the sun together. I drink a bucket of water a day.', Autumn: 'Autumn. Best working weather. Cool air, hot iron.', Winter: 'Winter. The warmest room in town is mine. People find excuses to visit.' },
    snow: 'Snow. Folk come in to stand by the forge and pretend they want a nail. I let them.',
    birthday: 'My birthday. I am going to make something nobody ordered. Just because.',
    bday: "It is {name}'s birthday. I made them a hook. For coats. People always need hooks.",
    eve: 'The {festival} is tomorrow. I shut the forge and eat. That is my whole plan.',
    again: ['Something else? Speak up, the bellows are loud.', 'Back to work. Both of us.'],
  },
  hob: {
    more: [
      ['Wipe your boots. I just did the floor and I did it badly.', 'Stew today is turnip and something. Something is a secret.', 'Most nights the same six people sit at the same six stools. I could set a clock by them.', 'First drink is on the house for newcomers. Second drink you pay for twice.'],
      ['Corvin had three bowls of stew and said nothing. That is five stars from Corvin.', 'Lio played a new tune last night and Bram tapped his foot. Bram does not tap his foot.', 'Somebody carved their initials in the bar in 1840. I have tried to find out who. Nobody will say.', 'Sabine comes in every Friday and tells me the train is coming. Every Friday.'],
      ['My mother ran this place. I swore I never would. Here I am, swearing at the same stove.', 'You are the only one who asks how I am. Most people ask what is cooking.', 'I am saving you a stool by the fire. Do not tell Bram, it is his stool.', 'One day I will close the door at night, sit down with a bowl, and not get up. Join me.'],
    ],
    season: { Spring: 'Spring. I take the shutters off and air the place out. It smells like forty winters.', Summer: 'Summer. Cold cider by the barrel. The cellar is the most popular room in town.', Autumn: 'Autumn. Stew season. Best time of year to run a tavern. Worst for my back.', Winter: 'Winter. Full house every night. I hear every secret in the valley and keep most of them.' },
    snow: 'Snow. The fire is lit and the soup is on. Come in when you have done your rounds.',
    birthday: 'My birthday. I am not cooking. Someone else can cook. Nobody will. I will cook.',
    bday: "{name}'s birthday. First drink tonight is on me. Tell them. Do not tell anyone else.",
    eve: 'The {festival} is tomorrow. I have been cooking since Tuesday and I will still run out.',
    again: ['Another? You know where the bar is.', 'Off you go, the lunch crowd is coming and they are grumpy.'],
  },
  maren: {
    more: [
      ['Wash your hands before you eat. Especially if you have been in the Hollow.', 'I see more cuts from sickles than from monsters. Watch your shins.', 'The clinic smells of iodine because I clean it twice a day. You are welcome.', 'Water, food, sleep. People expect me to say something cleverer. That is the medicine.'],
      ['Hale came in with a slime burn and said it was nothing. It was not nothing.', 'Bryn hid my bag again at five. She thinks I do not know. I let her win.', 'Kit stitched his own thumb last week. Neatly. I was furious and slightly impressed.', 'I have read every book on the shelf twice. Pell brings me new ones. Mostly poetry. I pretend to mind.'],
      ['In the city I saw a hundred patients a day and remembered none. Here I know everyone\'s middle name.', 'I nearly left, my second winter. Nell brought me soup every night for a week. I stayed.', 'You look after yourself better than you did. I notice these things. It is my job and also I care.', 'If I ever fall asleep at my desk, put a blanket on me and lock the door. Bryn knows the drill.'],
    ],
    season: { Spring: 'Spring. Pollen season. Half the valley sneezes and the other half blames the bees.', Summer: 'Summer. Sunburn, heatstroke, bee stings. Drink water. I am begging you.', Autumn: 'Autumn. Harvest backs. Lift with your knees, not your pride.', Winter: 'Winter. Colds. Wrap up, wash your hands, and stop visiting sick people with your face.' },
    snow: 'Snow. Ice on the paths means wrists. Walk like a penguin. Nobody is watching.',
    birthday: 'My birthday. I am taking the afternoon off. Bryn insisted. Bryn hid my bag.',
    bday: "It is {name}'s birthday. Remind them that cake is not a vegetable. Then let them have cake.",
    eve: 'The {festival} is tomorrow. I will have the clinic open after. Someone always eats too much.',
    again: ['Still here? Then sit down for a minute. You look like you need it.', 'I have patients. Go and eat something green.'],
  },
  hale: {
    more: [
      ['Never go below without telling someone. I mean it.', 'Count your torches before you go down. Count them again when you come up.', 'The lodge is open to anyone who fights. You do not have to be good. You have to come back.', 'Slimes are not clever, but there are a lot of them. That is a kind of clever.'],
      ['Thorne sat by the fire for three hours and said one word. It was "good". I agreed.', 'Aldous brought me a bone and said it was older than the Hollow. It was a cow.', 'I patched my coat again. Maren says I should get a new one. This one knows me.', 'Saw something big on the forties last week. It saw me too. We both decided not today.'],
      ['My friend Arno went down with me for fifteen years. On the sixteenth he did not come up. I still set a cup out for him.', 'You remind me of him a little. You laugh when things go wrong. He did that.', 'If I go down and do not come back, keep the lodge fire lit. Somebody will need it.', 'I do not say this to many: I am glad you are down there. The Hollow feels less lonely.'],
    ],
    season: { Spring: 'Spring. The Hollow floods on the low floors. Watch your step and your boots.', Summer: 'Summer. Hot up here, cool down there. The only season people go below willingly.', Autumn: 'Autumn. Things move in the deep when the weather turns. Keep your blade close.', Winter: 'Winter. The lodge fire never goes out. Come and sit if your hands are cold.' },
    snow: 'Snow up top, same dark below. The Hollow does not care about weather.',
    birthday: 'Birthday. I am going down to floor ten and back. Old habit. Do not tell Maren.',
    bday: "{name}'s birthday. Another year above ground. That is worth marking.",
    eve: 'The {festival} is tomorrow. I will stand at the edge and keep an eye on things. Someone has to.',
    again: ['Still here? Then sharpen something while you are at it.', 'That is all. Mind yourself below.'],
  },
  lio: {
    more: [
      ['This is the only tune I know all the way through. Do not request anything else.', 'My fiddle was my gran\'s. It has a crack. It sounds better with the crack.', 'The pigeons are my best audience. They do not clap but they do not leave either.', 'If you hum something, I can probably play it. Badly. But recognisably.'],
      ['Esme says she paints faster when I play. Or maybe she is trying to finish before the next song.', 'Hob paid me in soup last night. Honestly the best payment I have had.', 'I learned a new tune from a man on the goods train. He did not stop. I learned it very fast.', 'Kit tried to build me an amplifier. It worked for about ten seconds, then it was a small fire.'],
      ['I wrote a song for you. It is not finished. I keep adding verses about your terrible hat.', 'Sometimes I play at night by the fountain when nobody is there. That is when it sounds right.', 'My mum said I would never make a living from this. She is right. I make a life, though.', 'When I play the slow one, I am thinking about this place. All of it. You too.'],
    ],
    season: { Spring: 'Spring! The birds are back. Competition, honestly.', Summer: 'Summer. People stay out late and listen. Best season to be a fiddler.', Autumn: 'Autumn. I play the minor ones. Everybody gets a bit sad and buys me cider.', Winter: 'Winter. My fingers stop working at the fountain. The Lantern is warmer.' },
    snow: 'Snow! The square sounds completely different. Everything is muffled. Listen.',
    birthday: 'It is my birthday and I am going to play every song I know. All four.',
    bday: "It is {name}'s birthday! I am going to play them a song whether they like it or not.",
    eve: 'The {festival} is tomorrow! I have been practising so hard my neighbour moved out. Joking. Mostly.',
    again: ['Back for an encore? I only have the one, you have heard it.', 'Go on, go on. I have to tune this thing before Hob opens.'],
  },
  pell: {
    more: [
      ['If a child asks you something you do not know, say so. They respect that more than a guess.', 'The school has eleven pupils and one globe. The globe is from before two of the countries on it.', 'I mark the spelling in green, not red. Red makes them cry. Green makes them curious.', 'You are welcome to sit in on a lesson. Most adults learn something. Usually humility.'],
      ['Pip asked me today why the sky is blue. Then why I am not. Then why the cat is.', 'Hester came to watch my lesson. She corrected my board twice. Gently. I wanted to sink through the floor.', 'Juno and I trade gossip for spelling corrections. It is a fair exchange.', 'I am reading a book about stars. Every night I go out to check it. It is mostly right.'],
      ['I was meant to stay one year. Then a girl who could not read wrote me a letter at Midwinter. I stayed.', 'Some nights I sit in the empty classroom and listen. It is the best kind of quiet.', 'You would have been a terror in my class. Asking questions. I would have loved it.', 'I keep a list of things I want to learn before I am old. You have added three to it.'],
    ],
    season: { Spring: 'Spring term. The children cannot sit still and frankly neither can I.', Summer: 'Summer. No lessons. I read in the garden and miss the noise by Thursday.', Autumn: 'Autumn term. New pencils. The best smell in the world, do not argue.', Winter: 'Winter. We do lessons round the stove and everybody\'s spelling improves. Cosy brains.' },
    snow: 'Snow. The children will want to go out. I will say no. Then I will say yes.',
    birthday: 'My birthday. The children made me a card. It says "Hapy Brithday". I will treasure it forever.',
    bday: "{name}'s birthday today. The children are making a card. The spelling will be creative.",
    eve: 'The {festival} is tomorrow. I promised the children a day off. I also promised myself one.',
    again: ['A second question? Good. That is how learning works.', 'Off you go. I have forty spellings to mark and most are wrong.'],
  },
  juno: {
    more: [
      ['Name? Good. I will remember the face. I am bad at names and great at doors.', 'I have walked to every house in the valley in every weather. The weather mostly wins.', 'Do not put sharp things in letters. I am looking at you, Kit.', 'If a dog chases me, I run. If a goose chases me, I run faster.'],
      ['Corvin got a letter with lipstick on the envelope. I am a professional. I said nothing. I am telling you.', 'Sabine and I sit on the platform and trade stories. Nobody else is ever there to hear them.', 'Pell marked my handwriting today. A seven. A seven! I deliver her mail.', 'My boots need resoling every season. Corvin says I walk wrong. I say I walk a lot.'],
      ['Some days I deliver nothing but bills. Then I get to yours and it feels like a holiday.', 'I always wanted to see the city. Now I think I just like being the one who brings things.', 'If you ever want to write to someone and do not know how to start, I will help. I have read a lot of envelopes.', 'You are the first stop I look forward to and the last stop I want to leave.'],
      // v329 (roadmap 113g): once you are close
      ["I sorted your post first today. I always sort it first. I just did it with a bit of a smile today.", "When I see a letter in your handwriting going out, I want to know who it is to. That is very unprofessional of me.", "My feet ache every night. Except the nights after I have seen you. Then I do not notice them.", "I have read ten thousand envelopes and never wanted to read what was inside. Except a letter from you. Write me one.", "If I ever stop doing the round, it will be because I found somewhere I would rather stay. I think about that more lately."],
    ],
    season: {   // v329: a few each
      Spring: ['Spring. Mud to my knees and seed catalogues for everyone.', "Spring is seed catalogues and love letters. Same weight, same time of year. I do not think that is a coincidence.", "In spring the lanes are so muddy I take my boots off and carry them. The post stays dry. My feet do not."],
      Summer: ['Summer. Long light, short sleeves, heavy bag. Everyone writes to their aunts.', "Summer, the whole valley writes to relatives at the seaside. The relatives write back about the weather. Every single one.", "On long summer evenings I sit on the town wall after the round and watch the swifts. They fly further than I walk."],
      Autumn: ['Autumn. Leaves stick to the envelopes. I peel them off. Mostly.', "Autumn wind takes the post right out of my hand if I am careless. I chased a birthday card halfway to the Wilds once.", "In autumn folk start ordering things for Midwinter. My bag gets heavier every week until December."],
      Winter: ['Winter. Midwinter cards. The bag weighs as much as I do.', "Midwinter cards. Hundreds. I deliver every one and get none. I tell myself that is the job.", "Winter mornings I do the round in the dark with a lantern. Folk leave their porch lamps lit for me. I never told them to."],
    },
    rain: ["The mail goes out, rain or shine. My boots, unfortunately, also go out.", "I wrap every letter in oilcloth on rainy days. It takes an hour. Nobody has ever had a wet letter from me.", "Rain on the round is fine. It is the puddles I hate. Every puddle in the valley knows exactly where I step."],
    places: {
      farm: ["Your farm is on my round between Bram's and the old wing. I always slow down here. You did not hear that.", "That mailbox of yours leans to the left. I straightened it last week. It leans again. It likes leaning."],
      town: ["Town is the end of the round. Every door here gets something most days. I know them all by their knockers.", "The post office is the little door behind the hall. Nobody goes in. They just wait for me."],
    },
    snow: 'Snow. The mail still goes. Slower, wetter, and with some swearing.',
    birthday: 'My birthday. Did I get any mail? I would know. I have checked three times.',
    bday: "It is {name}'s birthday. I am carrying three cards for them already, and it is not even noon.",
    eve: 'The {festival} is tomorrow! I get the day off. The only day the post does not go.',
    again: ['Still no letter for you, sorry. I would have said.', 'Got to dash. Six more doors before lunch.'],
  },
  nell: {
    more: [
      ['Do not water at noon. You will cook them. Morning or evening.', 'I worked the Hollow with a pick for forty years. A trowel feels like cheating.', 'Kneel on a sack. Your knees will thank you when you are my age.', 'Got more beets than I can eat. Take some. Take more than that.'],
      ['I still dream about the dark sometimes. Then I wake up and there is my garden. Lucky woman.', 'Ines came over and we talked bees for an hour and weather for two.', 'Ysolde made me a basket for each thing I grow. Now I grow more things to fill them.', 'Aldous asked about the fossils I found down there. I told him I used most of them as doorstops.'],
      ['My husband Tam had the softest hands of any miner. He used to rub mine when they ached.', 'The garden is my way of putting things back. Forty years of taking from the ground.', 'You are family now, whether you like it or not. Family eats my soup.', 'When it is my time, plant something on top. Not flowers. Potatoes. Useful.'],
    ],
    season: { Spring: 'Spring. Peas in, beans in, back out. Worth it.', Summer: 'Summer. Weeding, weeding, watering, weeding. And the first tomato, which makes up for it.', Autumn: 'Autumn. Jars, jars, jars. My kitchen is a pickling factory.', Winter: 'Winter. Garden asleep. I sit with the seed catalogue and plan things I will not have room for.' },
    snow: 'Snow. Good for the ground. Kills the bugs. I will still complain about my hip.',
    birthday: 'My birthday. Tam used to bake me a terrible cake. I miss that terrible cake.',
    bday: "{name}'s birthday. I have baked. Do not say anything about my baking.",
    eve: 'The {festival} is tomorrow. I have been pickling for it for three weeks. You will try everything.',
    again: ['You are back? Put the kettle on, then.', 'Shoo. Those weeds will not pull themselves, and neither will yours.'],
  },
  rook: {
    more: [
      ['Mind the tar. It does not come off. Ask my trousers.', 'A boat is a thousand small decisions. Get one wrong and the sea tells you.', 'I steam the planks till they bend. Too much and they crack. Same as people.', 'You can sit on that crate. It is the only one that will not tip.'],
      ['Garrow says my keel is too shallow. He has said that for twenty years. My boats float.', 'Wren keeps the good brushes back for me and pretends it is an accident.', 'Odile and I argued about a knot for an hour. Then we went fishing. She was right.', 'I painted a hull blue last week. Then another blue. Wren says I am a menace to blue.'],
      ['My father drowned two miles out. I build boats so they come back. That is all it has ever been.', 'When I launch this one I am going to name it. I am thinking of naming it after somebody. Not saying who.', 'Most folk look at the sea and see danger. You look at it like I do. Like a door.', 'Come out with me one calm morning. I will show you what the valley looks like from the water.'],
    ],
    season: { Spring: 'Spring. Caulking season. Everything leaks after winter, including me.', Summer: 'Summer. Calm seas, long days. Best time to test a hull and worst time to wear tar.', Autumn: 'Autumn storms. I watch the beach and count boats.', Winter: 'Winter. Too rough to launch. I carve oars by the stove and dream about spring.' },
    snow: 'Snow on the sand. The beach looks like nobody has ever stood on it.',
    birthday: 'My birthday. I am going to row out and back and not build anything. Probably.',
    bday: "{name}'s birthday today. I carved them a little boat. It floats. Mostly.",
    eve: 'The {festival} is tomorrow. I will come in from the beach and smell of tar. People will cope.',
    again: ['Still here? Pass me that mallet, then.', 'Tide is turning. I have work.'],
  },
  esme: {
    more: [
      ['Do not look at the canvas yet. It is at the ugly stage. Every painting has one.', 'I mix my own greens. The shop greens are too cheerful.', 'The forest is never the same colour twice. That is the whole reason I came.', 'If I stare at you, I am not being rude. I am working out your shadows.'],
      ['Odile knows the name of every rock on the shore. I am painting them in order. Slowly.', 'Ysolde will not weave my green and I will not paint her ochre. We are very happy.', 'Lio played while I painted the fountain. The painting came out sad. The song was sad too.', 'Thorne let me paint his hut. I gave it a better roof. He has not forgiven me.'],
      ['In the city I painted rich people\'s dogs. Here I paint what I love. I am poorer and much happier.', 'I tried to paint you once from memory. I got your hands wrong. I need you to sit for me.', 'You see things. Most people walk through the forest. You stop.', 'When I have a show, there will be one painting that is not for sale. You know which.'],
    ],
    season: { Spring: 'Spring. Seventeen greens in one hedge. I need more paint.', Summer: 'Summer light is flat at noon. I paint at dawn and dusk and nap in between.', Autumn: 'Autumn. The best palette of the year. Even my mistakes look good.', Winter: 'Winter. White is not white. It is blue, grey, pink. Look closer.' },
    snow: 'Snow. Everyone thinks it is white. Go and look at the shadows. They are violet.',
    birthday: 'My birthday. I am going to paint something terrible on purpose and enjoy it.',
    bday: "It is {name}'s birthday. I have done a small sketch of them. Flattering. Slightly.",
    eve: 'The {festival} is tomorrow. I am bringing my sketchbook. Faces are better when they are happy.',
    again: ['Back again? Hold that pose. No, the other one.', 'I have lost the light talking. Go, go, before it changes.'],
  },
  kit: {
    more: [
      ['Careful, that has a spring in it. I think. I hope.', 'Everything is a machine if you look hard enough. Even you. Especially you.', 'Corvin lets me have the scrap. I let Corvin pretend he is not interested in what I make.', 'I have three rules: wear goggles, keep a bucket nearby, and do not tell my mum.'],
      ['Ferran says he let me win the race. He did not let me win. I have witnesses. Pip.', 'Tavi will not put my go-cart on the map because it moves. That is the point of it!', 'Emmet and I are building a rail cart. It is going to be very fast and very secret.', 'I took apart Wilmot\'s old clock. I put it back together. There are four spare bits. It still works.'],
      ['Grown-ups always say "careful". You say "show me". That is why I like you.', 'I want to build something that matters. Not a toy. Something people actually need.', 'Sometimes I get stuck and I think: what would {name} do? Then I hit it with a hammer.', 'When I am famous I will put your farm on the patent. Just a small credit. Medium.'],
    ],
    season: { Spring: 'Spring! The river is high. Perfect for testing my water wheel. Again.', Summer: 'Summer. Long days, more building. I only stop to eat Hob\'s chips.', Autumn: 'Autumn. I am building a leaf blower. The leaves are winning.', Winter: 'Winter. Indoor projects. My room is mostly gears now. My mum has given up.' },
    snow: 'Snow! I built a sled with steering. It steers into walls. Working on it.',
    birthday: 'Birthday! I asked for tools. I got socks. Tools next year. Hopefully.',
    bday: "{name}'s birthday! I built them a present. It only went off once in testing.",
    eve: 'The {festival} is tomorrow. I am building something for it. It might go off. In a good way.',
    again: ['Oh, you are back! Want to see the bit that sparks?', 'Got to go. Something is smoking and it might be mine.'],
  },
  garrow: {
    more: [
      ['Bait is fresh. Smell it if you do not believe me. Actually, do not.', 'Rods by the wall. Do not lean on them, they are older than you.', 'The mere is deeper than it looks. Most things are.', 'Row with your back, not your arms. Saves you a lot of complaining.'],
      ['I rowed Hester across to her wedding sixty years back. She was late. So was the groom.', 'Rook\'s boats are good. I tell him they are shallow. Somebody has to keep him honest.', 'There is a pike in the north end that has broken four of my lines. We know each other now.', 'Ysolde cuts reeds by my dock at dawn. We nod. That is our whole friendship. It is a good one.'],
      ['My uncle left me this boathouse and a debt. Took twenty years to clear. Worth every one.', 'I used to think I would die on the water. Now I hope I do. Peaceful way to go.', 'You come in and sit and do not need to talk. That is the best kind of company.', 'When I am gone, the boathouse should go to somebody who loves the mere. I have a name in mind.'],
    ],
    season: { Spring: 'Spring. The ice goes out and the mere breathes again. Fish are hungry.', Summer: 'Summer. Children in the shallows, bass in the weeds. I keep an eye on both.', Autumn: 'Autumn. The mist sits on the mere till noon. Best fishing of the year, if you can find the water.', Winter: 'Winter. The pike come up in the cold. Everybody else goes home. I go out.' },
    snow: 'Snow on the mere. Do not walk on the ice, whatever Kit tells you.',
    birthday: 'My birthday. I am going to sit at the end of the dock and not sell anything.',
    bday: "It is {name}'s birthday. Free bait for them today. One tin. Do not get carried away.",
    eve: 'The {festival} is tomorrow. I will row over and back for anyone too lazy to walk round.',
    again: ['Something else? Hooks are in the tin.', 'Go on. The fish will not wait and neither will my tea.'],
  },
  ysolde: {
    more: [
      ['Careful, the bundles are wet. They bite if you hold them wrong.', 'A good basket is tight enough to hold water for a moment. A great one, for an hour.', 'I learned from my grandmother. She could weave in the dark. I need a lamp.', 'Every reed has a twist. You work with the twist, not against it.'],
      ['Ferran was up at four again. I left him bread. He left me eels. That is how we talk.', 'Nell asked for a basket for her beets. Then her onions. Now her pickles. She is my best customer.', 'Garrow nods at me every morning at his dock. I nod back. It is lovely.', 'Esme wanted green reeds. I have no green reeds. I am dyeing reeds now. Thank you, Esme.'],
      ['Our mother died when Ferran was eight. I raised him. He still thinks he raised himself.', 'Weaving quiets my head. You do the same for me, I think. Odd thing to say. True, though.', 'I am making you a basket that will last longer than both of us. That is not morbid. It is practical.', 'If Ferran ever does something foolish on the mere, you will tell me. Promise.'],
    ],
    season: { Spring: 'Spring. New reeds come up soft and green. Too soft to use. I wait.', Summer: 'Summer. Best cutting weather. The reeds dry fast and so does my mouth.', Autumn: 'Autumn. I store the reeds for winter weaving. The shed smells like the whole mere.', Winter: 'Winter. Weaving by the fire. My hands go and my mind goes further.' },
    snow: 'Snow. The reeds are frozen stiff. I weave from my store and pretend it is summer.',
    birthday: 'My birthday. Ferran will forget. Then remember at midnight and bring me an eel.',
    bday: "{name}'s birthday. I wove them a little mat. It says nothing, it is a mat. But it is a good mat.",
    eve: 'The {festival} is tomorrow. I have made baskets for everyone. Well. Most people.',
    again: ['Still here? Hold this end for me, then.', 'I should finish this row before the reeds dry. Off you go.'],
  },
  ferran: {
    more: [
      ['Up at five. Back at nine. Asleep at two. Do not wake me at two.', 'Eels go where the water is dark and still. So do I, after lunch.', 'My traps are willow. Ysolde made them. Do not tell her they leak.', 'You smell that? That is a good eel morning.'],
      ['Kit raced me to the square and says I let him win. I did not let him win. I let him think I let him win.', 'Rook lets me use his shed. I pretend I am not in the way. He pretends not to see me.', 'I tried to catch the north pike Garrow talks about. It took my trap. Whole trap.', 'Odile out-fished me at the pond. With a stick. I am going back tomorrow.'],
      ['My sister thinks I take too many risks on the mere. She is probably right. Do not tell her I said that.', 'I do not remember our mother much. I remember her singing at the water. Ysolde sings like her when she thinks nobody is listening.', 'You are the only one who comes out at dawn. It is nice not being the only one awake.', 'If I ever have a boat of my own, you get first ride. After Ysolde. She would kill me.'],
    ],
    season: { Spring: 'Spring. The eels come up the stream at night. I barely sleep.', Summer: 'Summer. Warm water, lazy eels. I swim more than I trap.', Autumn: 'Autumn. The big run. Ysolde says I look like an eel by the end of it.', Winter: 'Winter. Ice on the traps. Fingers like sticks. Still out there.' },
    snow: 'Snow! I am going to throw one at Kit before he throws one at me.',
    birthday: 'My birthday. Ysolde will make a cake. I will eat half before she sees.',
    bday: "{name}'s birthday today! I would give them an eel but Ysolde says that is not a present.",
    eve: 'The {festival} is tomorrow. I am entering everything. Losing most of it. Having a great time.',
    again: ['Back again? You are worse than Kit.', 'I am off for a nap. Five o\'clock start, remember.'],
  },
  tamsin: {
    more: [
      ['Close the gate behind you. Not halfway. All the way.', 'Hay is cheaper by the bale. Your back will not thank you either way.', 'My cows have names. I will not tell you them. You will get attached.', 'Animals tell you everything if you watch. Ears, tail, how they stand. People are the same.'],
      ['Ines left honey on my gatepost and I left a fleece on hers. We have never once spoken about it.', 'Bram knocked on my barn beams again. "Still sound," he says, like he is surprised. He built it.', 'Pip asked me how many stomachs a cow has. I said four. He has told everyone. Twice.', 'A calf came at three in the morning. I was out there in my nightgown and boots. Glamorous.'],
      ['My mother died in the spring. I came home to sell the herd. That was eleven years ago. I could not do it.', 'I talk to the cows more than people. You are making me rethink that.', 'You look after your animals properly. That tells me everything I need to know about you.', 'If anything ever happens to me, look after the old red cow. She is stubborn. You will get on.'],
    ],
    season: { Spring: 'Spring. Calving season. I sleep in the barn more than the house.', Summer: 'Summer. The herd is out on the east meadow all day. Flies are out too.', Autumn: 'Autumn. Hay in, feed stocked, roof checked. Then I can breathe.', Winter: 'Winter. The barn is warm with forty cows in it. I go there to think.' },
    snow: 'Snow. The cows hate it. They stand in the barn door and look at me like I did it.',
    birthday: 'My birthday. The cows do not know. That is how I like it.',
    bday: "It is {name}'s birthday. I am taking them a cheese. Everybody likes cheese. Nearly everybody.",
    eve: 'The {festival} is tomorrow. I will bring the best cow if she cooperates. She will not.',
    again: ['Something else? Feed is on the left.', 'I have a cow with opinions waiting for me. Off you go.'],
  },
  aurel: {
    more: [
      ['Do not lean on that wall. It is three hundred years old and tired.', 'Good mortar is mostly lime, sand and patience.', 'I tap each stone before I set it. It tells you if it will hold.', 'The old wing was built by people who knew what they were doing. I am trying to keep up.'],
      ['Corvin and I ate lunch. I said six words. He said four. Very good lunch.', 'Pip helped me lay a step. It is crooked. I am keeping it crooked.', 'I found a mason\'s mark in the old wing. A little fish. Somebody was proud of that stone.', 'Bryn says I talk to walls more than to her. The walls do not interrupt.'],
      ['Bryn got the job here and I came with her. Best decision I never really made.', 'When Pip was born I built him a stone cradle. Bryn made me put a blanket in it.', 'I want to build one thing in this valley that lasts five hundred years. Maybe the bridge. Maybe a wall for you.', 'You notice the little things. The fish mark. The crooked step. That is rare.'],
    ],
    season: { Spring: 'Spring. Frost has cracked half my pointing. Back to the start.', Summer: 'Summer. Mortar dries too fast. I work at dawn and wet everything down.', Autumn: 'Autumn. The best building weather. I try to finish everything before the frost.', Winter: 'Winter. No mortar in frost. I draw plans by the fire and annoy Bryn.' },
    snow: 'Snow on the old wing roof. I go up and check. Bryn hates it when I go up.',
    birthday: 'My birthday. Pip made me a stone. It is a regular stone. It is my favourite stone.',
    bday: "{name}'s birthday. Pip is making them a stone. Pip makes everybody a stone.",
    eve: 'The {festival} is tomorrow. I am meant to relax. I will probably check the bridge on the way.',
    again: ['Still here? Then hold this level for me.', 'I should get back. That wall will not point itself.'],
  },
  bryn: {
    more: [
      ['Sit down if you feel dizzy. Do not be brave about it.', 'I have stitched more chins than I can count. Mostly children. Mostly Pip.', 'Doctor Maren works too hard. I make sure she eats. Somebody has to.', 'If you are bleeding, come in. If you are bleeding a lot, run in.'],
      ['I hid Maren\'s bag at five again. She found it. I hid it better. We both went home.', 'Pip came home with a frog in his pocket. Then another frog. Then a frog in his hat.', 'Esme is painting me for the clinic wall. I told her to leave out the tired. She did not.', 'Aurel came home with mortar in his beard again. I cut it out while he slept.'],
      ['I trained to work in a city hospital. I am so glad I did not.', 'Some days are hard here. Then someone brings me a pie for no reason. That is why we stay.', 'You are good with Pip. He talks about you more than about the cat. That is high praise.', 'If I ever look tired, which is always, bring me tea. Just tea. You do not even have to talk.'],
    ],
    season: { Spring: 'Spring. Scraped knees season. Every child in the valley is climbing something.', Summer: 'Summer. Sunburn and bee stings. And Pip falling off things.', Autumn: 'Autumn. Harvest injuries. Sickles are not toys. Please tell Pip.', Winter: 'Winter. Colds, slips and Midwinter indigestion. Busy, busy.' },
    snow: 'Snow. Pip will be out in it all day. I will have the hot water bottle ready.',
    birthday: 'My birthday. I would like one quiet hour. Pip has other plans.',
    bday: "It is {name}'s birthday. Pip has drawn them a picture. It has a horse in it, for some reason.",
    eve: 'The {festival} is tomorrow. Pip has been awake with excitement since Tuesday. So have I, now.',
    again: ['Back again? Sit for a moment, you look like you need it.', 'I have to go. Somebody has a splinter and very strong feelings about it.'],
  },
  pip: {
    more: [
      ['Who are you? I am Pip. I am seven and a half. The half is important.', 'Do you have a cat? I have a cat. Well. Pudding has me.', 'I found a rock shaped like a potato. Or a potato shaped like a rock. I have not checked.', 'I am not allowed past the bridge on my own. I am allowed to look at it.'],
      ['Kit\'s cart lost a wheel and I flew into a hedge. Best day ever.', 'Pell gave me a gold star. Then took it back because I ate it. It was a sweet.', 'Dad let me put a stone in the wall. It is the crooked one. He says it is the most important.', 'Did you know eels can go on land? Ferran told me. I am never swimming again. Maybe.'],
      ['You are my best grown-up friend. Kit is my best older friend. Pudding is my best cat friend.', 'When I am big I will build you a bridge. A small one. Over a puddle. Then bigger.', 'Mum says I can come and help on your farm one day. I am very good at carrying one thing.', 'I made you a drawing. It is you and a cow. The cow is bigger because cows are big.'],
    ],
    season: { Spring: 'It is spring! There are frogs EVERYWHERE.', Summer: 'Summer! No school! I am going to dig a hole to the other side.', Autumn: 'Autumn means conkers. I have a champion conker. It is called Gerald.', Winter: 'Winter! I want snow. Pell says wanting does not make snow. Pell does not know.' },
    snow: 'SNOW! I am building a snow Pudding. The real Pudding is very angry about it.',
    birthday: 'It is my birthday! I am eight! Well, I am going to be. Today! Now!',
    bday: "It is {name}'s birthday!! Do they get cake? Do I get cake? I am going to ask.",
    eve: 'The {festival} is TOMORROW. I am not going to sleep. Not even a little.',
    again: ['Hi again! Want to see Gerald? He is a conker.', 'I have to go, Pudding is on the wall again!'],
  },
  aldous: {
    more: [
      ['Please do not touch the cases. Fingerprints are a fossil record of rudeness.', 'Everything in here was once in the ground. Everything in the ground was once something else.', 'I label every find in three hands: mine, Latin, and one for the children.', 'Admission is free. Gratitude is optional. Donations are begged for.'],
      ['Hale insists the Hollow is ancient. I have a drawer of evidence. He has never opened the drawer.', 'Tavi drew me a map of every find in the valley. It is framed. It is mostly crosses.', 'Nell used fossils as doorstops for forty years. I have rescued eleven. She has nine more.', 'I wrote to the university again. I enclosed a drawing. They will not reply. I enjoy writing anyway.'],
      ['I came for one fossil when I was twenty-three. I found it at sixty. By then I had found everything else.', 'My wife used to say I loved old bones more than her. She was wrong. Slightly.', 'You bring me things nobody else would bother with. That is how museums are made.', 'When I retire, I hope someone like you minds the cases. Someone who stops and looks.'],
    ],
    season: { Spring: 'Spring. The rains wash new things out of the banks. I walk the streams with a sack.', Summer: 'Summer. Visitors. Four last year. I gave each of them a tour of three hours.', Autumn: 'Autumn. I re-catalogue the whole collection. It takes all season and I love it.', Winter: 'Winter. The museum is cold, so I wear two coats and talk to the fossils. They are good listeners.' },
    snow: 'Snow. The ground is shut. I polish the cases and wait for spring.',
    birthday: 'My birthday. I am now older than three of the fossils. A sobering thought.',
    bday: "{name}'s birthday today. I shall give them a small fossil. A very small one. I need the big ones.",
    eve: 'The {festival} is tomorrow. I shall attend for one hour and talk to anyone about fossils.',
    again: ['Ah, you have returned. Have you found something since?', 'I really must re-label the trilobite. Good day, good day.'],
  },
  hester: {
    more: [
      ['Stand up straight, dear. You are not in trouble. Habit.', 'I have written down the weather every day for fifty years. It has rained a great deal.', 'Roses want rain, sun and to be left alone. Rather like old women.', 'Wipe your feet. I knew your farm\'s first owner, and he never did either.'],
      ['Wilmot thinks the town clock would stop without him. I think it would stop to spite him.', 'Pell is the best teacher I ever trained. I told her that once. She cried. I will not do that again.', 'I wrote in the almanac that you planted early this year. You are in the history now.', 'Garrow rowed me to my wedding. I was late. My husband was later. We were married forty years.'],
      ['I taught your grandparents\' generation. Most of them could not spell. All of them could work.', 'My husband died on a Tuesday in autumn. I wrote "rain" in the almanac. It was sunny.', 'You have put down roots here. I can tell. I have watched people do it for seventy years.', 'When I am gone, read the almanac. You will find yourself in it. Kindly written, I promise.'],
    ],
    season: { Spring: 'Spring. The almanac says the first rose opens on the twelfth. It is usually wrong. I am usually right.', Summer: 'Summer. Long evenings for writing. I sit on the porch and record the swifts.', Autumn: 'Autumn. I count the geese going south. Two hundred and four last year. One came back.', Winter: 'Winter. I copy out the year\'s almanac in my best hand. It takes until spring.' },
    snow: 'Snow. I shall record the depth in the almanac. With a ruler, before Wilmot sits in it.',
    birthday: 'My birthday. I am ninety-one. I have written it down so I do not forget.',
    bday: "It is {name}'s birthday. I have it in the almanac. I have everyone's birthday in the almanac.",
    eve: 'The {festival} is tomorrow. I have the record of every festival since I was a girl. You may ask.',
    again: ['Yes, dear? Something else?', 'Run along. I have the almanac to finish and the light is going.'],
  },
  wilmot: {
    more: [
      ['You are exactly on time. Or the clock is fast. I shall check.', 'Every clock in the valley was mine once. Most of them are slow now. Like me.', 'Never oil a clock with cooking oil. Do not ask me how I know.', 'A clock is just patience you can hear. I have said that before. It is still true.'],
      ['Hester writes down the weather. I write down the time. We have never agreed on either.', 'Corvin made me a mainspring this week. I said it was good. He looked like I had hit him.', 'Kit took apart my old clock and put it back with four spare pieces. It keeps better time now.', 'I wound the town clock on Sunday. It is nine seconds slow. I am working on it.'],
      ['I came for one job, fifty-one years ago. I fell in love with the clock. Then with the town.', 'My hands shake now. Except on a gear. Then they are as steady as ever. Strange gift.', 'When I go, somebody must wind the clock on Sundays. I have thought about who.', 'I have made you something. A pocket watch. It is a little fast. So are you.'],
    ],
    season: { Spring: 'Spring. The damp gets into the clock. I visit it more than my doctor.', Summer: 'Summer. Brass expands in the heat. The town clock runs slow. So do I.', Autumn: 'Autumn. The evenings draw in. I set the hall clock back by one minute and nobody notices.', Winter: 'Winter. Cold oil, stiff gears. The clock and I are very alike.' },
    snow: 'Snow. The clock tower is freezing. I shall go up anyway. Do not tell Hester.',
    birthday: 'My birthday. Eighty-six years, three months and a few minutes. Give or take.',
    bday: "{name}'s birthday today. One more turn of the clock for them. A good thing to mark.",
    eve: 'The {festival} is tomorrow. I shall make sure it starts on time. It never does.',
    again: ['Back again? You are three minutes late for nothing. Lovely.', 'I must go. The clock does not wind itself. On Sundays.'],
  },
  thorne: {
    more: [
      ['Walk on the stones, not the moss. The moss was here first.', 'I do not want company. I do not mind it, either.', 'There are morels under that ash. Take three. Leave the rest.', 'The mountain gives you what you need. Not what you want.'],
      ['Hale and I sat by the lodge fire. He said "cold". I said "yes". Good evening.', 'Esme painted my hut with a better roof. I keep meaning to fix my roof to match.', 'I carved a hare yesterday. It looks like a dog. The hare would be offended.', 'A fox has been bringing me feathers. I do not know why. I keep them in a jar.'],
      ['I was a soldier once. I did things I carry. Up here they weigh less.', 'People ask why I live alone. I am not alone. There is the mountain, and now there is you.', 'I made you a carving. An owl. It is not good. It is yours.', 'If I ever do not come down to the lodge on a Wednesday, come up. Hale is too proud to.'],
    ],
    season: { Spring: 'Spring. The streams are loud. I sleep badly and walk more.', Summer: 'Summer. Wild plums on the south slope. Take a few. Leave most for the birds.', Autumn: 'Autumn. Mushrooms everywhere. I eat well and say little.', Winter: 'Winter. Snow to the knee. I chop wood, carve, and listen to the quiet.' },
    snow: 'Snow. The mountain is silent. I could listen to it all day. I will.',
    birthday: 'My birthday. I will walk to the top and back. Same as every year.',
    bday: "{name}'s birthday. I carved them a small bird. Do not make a fuss about it when you see them.",
    eve: 'The {festival} is tomorrow. I may come down. I may not. The mountain will decide.',
    again: ['Still here.', 'Go on. The light is going and the path is steep.'],
  },
  sabine: {
    more: [
      ['Welcome to the halt. It is very small. Like a good cake.', 'Timetable? Ha. The goods train comes when it comes. Usually Thursday.', 'I sweep the platform every morning. It does not need it. It is just nice.', 'Mind the gap. There is a gap. I do not know why there is a gap.'],
      ['Juno told me a story about Hob I am not allowed to repeat. I will repeat it if you sit down.', 'Emmet was in the tunnel again. I can always tell. He comes back sooty and smug.', 'A crate of oranges fell off the train last month. I made marmalade for the whole valley.', 'My father waved at every train. I do too. One day somebody waved back.'],
      ['My husband rode out on the goods train thirty years ago. He did not ride back. I still wave.', 'Emmet wants to see where the line goes. I want him to. I also want him here. Both are true.', 'You stop and talk. Most people pass through. That is the trouble with stations.', 'If the train ever brings something special, I will save it for you. I always do.'],
    ],
    season: { Spring: 'Spring. The line floods by the cutting. Emmet is out with a shovel and a grin.', Summer: 'Summer. Hot rails, slow train. I sit in the shade and wave at the heat haze.', Autumn: 'Autumn. Leaves on the line. The train skids. It is very dramatic.', Winter: 'Winter. The stove in the waiting room is lit. Nobody waits. I sit in it myself.' },
    snow: 'Snow on the line. The train will be late. Later. Latest.',
    birthday: 'My birthday. I am going to sit on the platform with cake and wave at nothing.',
    bday: "It is {name}'s birthday. I will save them anything nice that falls off the train today.",
    eve: 'The {festival} is tomorrow. I will close the halt. The train never comes on festival days anyway.',
    again: ['Back already? The train is not here yet either.', 'I must sweep. It is not dirty. That is not the point.'],
  },
  emmet: {
    more: [
      ['Do not stand on the rails. Even when there is no train. Mum says so.', 'I check every sleeper on this line every week. All four hundred and eleven.', 'Bolts loosen in the cold. I tighten them. They loosen. We have an arrangement.', 'This is the best line in the country. It is also the only one I have seen.'],
      ['Corvin sells me bolts like I am going to do something stupid with them. Usually right.', 'Kit and I have a rail cart that goes really fast. Do not tell my mum.', 'I went forty paces into the east tunnel. Then my lantern went out. Then I ran.', 'A goat got on the line last week. I had to walk it home. It did not want to go.'],
      ['Dad left on the train when I was small. I want to know where it goes. Maybe I want to know where he went.', 'I will not leave Mum alone at the halt. Not yet. One day.', 'You are all right, {name}. You talk to me like I am grown up. I mostly am.', 'When I ride the line to the end, I will send you a postcard. Juno will bring it.'],
    ],
    season: { Spring: 'Spring. The cutting floods. I dig it out. It floods again. Every year.', Summer: 'Summer. The rails sing in the heat. You can hear the train coming for miles.', Autumn: 'Autumn. Leaves on the line. I sweep them. It is a long line.', Winter: 'Winter. Ice in the points. I am out with a kettle at six in the morning.' },
    snow: 'Snow on the line. I am out with a shovel. The train will still be late.',
    birthday: 'My birthday. Mum made me a cake shaped like a train. It is a bit lopsided. Like a real train.',
    bday: "{name}'s birthday today. Mum says I have to say happy birthday properly. Not just 'oi'.",
    eve: 'The {festival} is tomorrow. Mum shuts the halt, I shut my eyes, nobody fixes anything. Bliss.',
    again: ['Oi, still here? Want to check some bolts?', 'Got to go. Four hundred sleepers will not check themselves.'],
  },
  lamp: {
    more: [
      ['Keep to the walkway. The water is not deep. It is just unkind.', 'I light each lamp at dusk and put it out at dawn. Nobody up there sees them.', 'Trade, if you like. I take what the town throws away and find what it lost.', 'The rats here are polite, if you are.'],
      ['I heard music through the grate last night. The fiddler, I think. It sounded good down here.', 'The town above forgets this place. That is fine. The water does not forget anything.', 'There is a door in the east channel nobody has opened in a hundred years. I knock on it sometimes.', 'Somebody dropped a ring through the grate in spring. I kept it safe. Nobody has asked.'],
      ['I was up there once. Long ago. I had a name people used. Now you are the only one who visits.', 'I keep a lamp lit for you at the ladder. Did you notice?', 'You do not ask why I live down here. Thank you for that.', 'If I am ever gone, light the lamps for me. One evening. That is all.'],
    ],
    season: { Spring: 'Spring. The melt runs through. The channels sing. Loud and cold.', Summer: 'Summer. The town above is hot. Down here it is always cool.', Autumn: 'Autumn. Leaves come down the grates. I fish them out. They smell of the sky.', Winter: 'Winter. The lamps are warm. I sit close to them.' },
    snow: 'Snow above. I hear it as silence through the grates.',
    birthday: 'Today was the day I was born, long ago. I light one more lamp than usual.',
    bday: "Above, it is {name}'s birthday. I heard it through the grate. Wish them well from me.",
    eve: 'The {festival} is up above tomorrow. I will listen through the grate.',
    again: ['Still here. The lamps do not mind.', 'Go up. The night is long down here.'],
  },
};
