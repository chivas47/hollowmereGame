// Heart scenes: the first talk after reaching 4 and 8 hearts plays a short scene with a choice.
// Each choice adds friendship points and gets its own reply. Plain text, no em dashes.
export const SCENE_HEARTS = [2, 4, 6, 8, 10, 14];   // v51: 2, 6 and 10 for the marriage candidates (10 only while dating)

export const SCENES = {
  ines: {
    4: {
      title: 'A swarm in the hedge',
      text: [
        'Ines is crouched by the hedge with an empty skep on her knees. A dark knot of bees hangs from a branch above her, humming like a kettle.',
        '"They left the hive this morning. If I rush them, they go for good. If I wait too long, it rains." She glances at you. "Hold this?"',
      ],
      choices: [
        { label: 'Hold the skep steady under the branch', pts: 60, reply: 'You hold still while she gives the branch one sharp tap. The whole swarm drops into the skep with a soft thump. Ines laughs out loud. "You did not even flinch. The bees will remember that. So will I."' },
        { label: 'Step back and let her work', pts: 25, reply: 'She coaxes the swarm in alone, slow and patient. "Sensible," she says afterwards, brushing a bee off her sleeve. "Most people run. You only walked."' },
      ],
    },
    8: {
      title: 'The honey ledger',
      text: [
        'Ines has a battered notebook open on her lap. Every page is a year: dates, weather, how many jars, a pressed flower in the margin.',
        '"My mother started it. Forty-one years of honey." She turns to a fresh page and writes your farm\'s name at the top. "The clover on your field changed the taste this year. That goes in the book."',
      ],
      choices: [
        { label: 'Ask her to teach you to read the ledger', pts: 80, reply: 'She shuffles closer and walks you through it, year by year, until the light goes. "Next spring you write the first line," she says. "Your hand, my mother\'s book. That feels right."' },
        { label: 'Tell her the field is hers to visit any time', pts: 50, reply: '"Careful," Ines says, smiling. "Bees take an open gate very seriously." She tucks the ledger under her arm, but she looks pleased all the way home.' },
      ],
    },
  },
  bram: {
    4: {
      title: 'The bin hinge',
      text: [
        'Bram is on one knee in front of your shipping bin, a hinge pin between his teeth and a hammer in his hand.',
        '"Heard it squeak from the road. Thirty years I have been fixing this hinge." He holds out a palm without looking up. "Nails. The short ones."',
      ],
      choices: [
        { label: 'Hand him the nails and watch how he sets them', pts: 60, reply: 'You pass the nails one by one. He talks the whole time: angle, grain, why you never hit a hinge pin square. When he is done the lid falls shut without a sound. "Now you know. Next time, you fix it."' },
        { label: 'Bring him a cup of water instead', pts: 25, reply: 'He finishes the hinge, drains the cup in one go and hands it back. "Thoughtful," he grunts. Coming from Bram, that is a speech.' },
      ],
    },
    8: {
      title: 'The old plans',
      text: [
        'Bram unrolls a sheet of yellowed paper across your workbench and pins the corners with stones. It is a drawing of your farmhouse, but bigger, with a porch that does not exist.',
        '"Drew it for the last farmer. He never had the money. Neither did I, to build it for free." He taps the porch. "Always thought it deserved one."',
      ],
      choices: [
        { label: 'Say the porch should be built, by the two of you', pts: 80, reply: 'Bram is quiet for a long moment. Then he rolls the plan up very carefully. "Spring," he says. "You carry the timber. I am too old to carry timber." He is smiling, which you have not seen before.' },
        { label: 'Ask him to keep the plans safe', pts: 50, reply: '"Safe as anything," he says, and slides them into his coat. "Some drawings are not for building. They are for remembering someone tried."' },
      ],
    },
  },
  odile: {
    4: {
      title: 'Knots at dawn',
      text: [
        'The pond is still grey when you find Odile sitting on the bank with a net across her knees, picking at a knot with a bone needle.',
        '"Boats down south tear these to ribbons. I fix them here because the pond does not talk back." She holds out a second needle. "You can stay if you are quiet."',
      ],
      choices: [
        { label: 'Take the needle and work a knot beside her', pts: 60, reply: 'Your knot comes out lumpy. She undoes it without a word and shows you again, slower. By sunrise you have mended a hand\'s width of net together. "Not bad," Odile says. "For a farmer."' },
        { label: 'Sit and watch the water', pts: 25, reply: 'You sit while she works and the mist lifts off the pond. Neither of you says anything. When she leaves, she nods at you, the way she nods at the water.' },
      ],
    },
    8: {
      title: 'The last boat',
      text: [
        'Odile is waiting at the pond at dusk with two rods, which she has never done before.',
        '"There is a boat south that wants me for the whole season. Good pay." She hands you a rod and does not look at you. "I keep finding reasons to stay. The grayling. The quiet." A pause. "This."',
      ],
      choices: [
        { label: 'Tell her the valley would be emptier without her', pts: 80, reply: 'She casts, a long clean line across the water. "Then I will tell the boat no," she says, as if it were nothing. Her bobber dips a moment later, and she laughs for the first time you can remember.' },
        { label: 'Say she should take the boat if she wants it', pts: 50, reply: '"Honest," she says. "I like that." She fishes in silence for a while. "I am not going," she adds finally. "But thank you for not making it harder."' },
      ],
    },
  },
  tavi: {
    4: {
      title: 'A page in the wind',
      text: [
        'Tavi comes running down the path, hat in one hand, waving the other. "Stop that paper! The north page! Six weeks of work!"',
        'A square of paper skates across the grass ahead of you, flipping end over end toward the trees.',
      ],
      choices: [
        { label: 'Chase it down and stamp a boot on it', pts: 60, reply: 'You catch it at the tree line, a little muddy but whole. Tavi takes it in both hands like something alive. "You saved the whole north ridge," they say. "I am putting your boot print in the legend. It stays."' },
        { label: 'Help Tavi weigh the rest down with stones', pts: 25, reply: 'You pin the remaining pages under stones while Tavi chases the runaway alone. They come back grinning and breathless. "Got it. And thanks. The others would all be in the pond by now."' },
      ],
    },
    8: {
      title: 'The finished map',
      text: [
        'Tavi spreads a map across the ground, held flat with four apples. Every path in the valley is on it, every tree on your farm, the cave, the pond, the little star by your farmhouse.',
        '"It is done. The first true map of the valley." They hesitate. "I always said you would get the first copy. I meant it. But I made two, and I want you to choose."',
      ],
      choices: [
        { label: 'Ask Tavi to keep the original and give you the copy', pts: 80, reply: '"No," Tavi says firmly, and presses the original into your hands. "The copy is for me. The real one should be where the star is." They are blushing to their ears.' },
        { label: 'Say you would rather they kept both', pts: 50, reply: 'Tavi rolls the maps up slowly. "Then I will hang one where everyone can see it," they say. "With the star. People should know where the good farm is."' },
      ],
    },
  },
};

// v51: the marriage candidates' scenes. dating: true plays only while you are dating them (the 10-heart scene).
const S = (title, text, a, b, dating = false) => ({ title, text, choices: [a, b], dating });
const C = (label, pts, reply) => ({ label, pts, reply });
Object.assign(SCENES.ines, {
  10: S('Under the lime trees', [
    'Ines has spread a blanket under the lime trees past the east road. The bees are loud in the blossom above you, drunk on it.',
    '"My mother said you know someone is right when the bees do not mind them." A bee lands on your sleeve, walks a slow circle, and leaves. Ines laughs. "There. Settled."',
  ], C('Take her hand', 100, 'Her hand is warm and a little sticky with honey. "Good," she says quietly. "I hoped you would." You stay until the blossom smell turns to evening.'),
  C('Tell her you have never been so happy', 80, '"Me neither," Ines says, and she says it like she is surprised to hear herself. The bees go on humming as if nothing has changed. Everything has.'), true),
});
Object.assign(SCENES.odile, {
  10: S('Low tide', [
    'Odile meets you on the pier at low tide with no rods at all. The sea has pulled back so far that the rocks are bare and shining.',
    '"I have never brought anyone here without a reason," she says. "This is the first time I had no reason." She is looking at the horizon, not at you. "Except you."',
  ], C('Stand beside her until the tide turns', 100, 'You stand together while the water creeps back over the rocks. When it reaches your boots she finally looks at you, and she does not look away.'),
  C('Tell her you would follow her to any boat', 80, '"Do not say that unless you mean it," she says. You mean it. She can tell. She takes your arm, and the two of you walk back along the pier in the dark.'), true),
});
Object.assign(SCENES.tavi, {
  10: S('The finished map', [
    'Tavi unrolls a map on your kitchen table, so big it hangs off both ends. The whole valley, every path, every tree. The ink is still drying.',
    'In the corner, where a mapmaker signs their name, there are two names. Tavi has written yours beside their own. "I did not ask first," Tavi says. "Is that all right?"',
  ], C('Tell Tavi it is the best thing anyone has made you', 100, 'Tavi goes red to the ears and grins like a kid. "It is not done. It will never be done. There will always be another path." A pause. "Walk them with me?"'),
  C('Add a small star by the farmhouse', 80, 'You dip the pen and draw a tiny star. Tavi watches, then laughs and draws a second one right next to it. "Not standard," they say. "I do not care."'), true),
});
Object.assign(SCENES, {
  esme: {
    2: S('Wet paint', ['You find Esme in the forest glaring at a canvas. A smear of green runs right through the middle of it.', '"A crow landed on it," she says. "Of course it did." She holds out a brush. "Well? You might as well try."'],
      C('Paint something into the smear', 50, 'You turn the smear into a clumsy frog. Esme stares at it, then laughs out loud for the first time since you have known her. "I am keeping that."'),
      C('Help her clean it off', 25, 'You scrape and wipe together. The canvas is saved, mostly. "Thank you," she says, a little stiff. But she looks at you differently afterwards.')),
    6: S('The portrait', ['Esme asks you to sit on a stump in the clearing. "Do not move. Do not talk. Do not look at me like that."', 'An hour passes. The light changes twice. She turns the canvas around. It is you, but softer than you think of yourself.'],
      C('Tell her it is how she sees you', 60, '"It is how you are," she says, cleaning her brush. "Most people just do not look long enough." She does not let you pay for it.'),
      C('Ask if you can sit for her again', 40, '"Every week," she says at once, then blushes. "For practice. Faces are hard."')),
    10: S('The gallery of one', ['Esme leads you into her cottage. Every wall is covered in canvases, and in every one of them, somewhere, there is you. In a field. On a path. A small blue dot.', '"I did not plan it," she says. "You just kept walking into the paintings."'],
      C('Kiss her paint-stained hand', 100, 'She lets out a breath she seems to have held for a year. "Good," she whispers. "I was running out of wall."'),
      C('Ask her to paint the two of you together', 80, '"I have already started," she admits, and pulls a sheet off a canvas in the corner. Two small figures on a hill. Side by side.'), true),
  },
  rook: {
    2: S('A loose plank', ['Rook is on his back under a half-built hull, cursing at a plank that will not sit flat.', '"Hold that end. No, the other end. Yes. Now do not let go, whatever I say."'],
      C('Hold it until he is done', 50, 'You hold it for twenty minutes while he hammers and swears. When he slides out, he looks almost pleased. "Good grip. Come back tomorrow."'),
      C('Suggest a wedge under it', 25, 'He stops, considers, and jams a wedge in. It sits flat. "Huh," he says. "Fine. You can stay."')),
    6: S('First launch', ['The little boat is finished. Rook drags it to the waterline at dawn and stands there with his hands in his pockets.', '"If it sinks, I am never building another. If it floats..." He does not finish.'],
      C('Push it out with him', 60, 'You push together and it floats, rocking, perfect. Rook makes a sound that might be a laugh. "Get in," he says. "You earned the first ride."'),
      C('Tell him it will float', 40, '"How do you know?" "Because you built it." He looks at you a long moment, then shoves it out. It floats. He does not say anything. He does not need to.')),
    10: S('The name on the hull', ['Rook takes you out in the new boat at sunset. Halfway across the bay he stops rowing.', 'Painted on the side, in careful white letters, is a name. Your name. "Boats need a name before they go far," he says. "This one is going far."'],
      C('Take the oars and row him home', 100, 'He laughs, really laughs, and lets you. Halfway back he puts his hand over yours on the oar and leaves it there.'),
      C('Tell him to keep rowing out', 80, '"Out where?" "Anywhere." He looks at you, then at the horizon, then rows. You come back in the dark, very late, very happy.'), true),
  },
  pell: {
    2: S('Spelling test', ['Pell is in the town hall marking papers, surrounded by sharpened pencils. "Can you spell parsnip?" she asks without looking up. "The class cannot agree."'],
      C('Spell it slowly for her', 50, '"Thank you. Three of them are right, then." She makes a note. "You would be a good student. You pay attention."'),
      C('Ask what the children wrote instead', 25, 'She smiles and reads you three wrong spellings, each worse than the last. By the end you are both laughing.')),
    6: S('The lost book', ['Pell is searching the town hall shelves, frantic. "My grandmother\'s book. I always keep it here. Someone has borrowed it."', 'You find it under a desk, a little crumpled, a child\'s bookmark inside.'],
      C('Smooth the pages before you hand it back', 60, 'She takes it carefully, as if it might break. "You did not have to do that." She keeps the child\'s bookmark in it anyway.'),
      C('Hand it straight back', 40, '"Thank you," she says, holding it to her chest. "I would have been lost without it. That sounds silly. It is true."')),
    10: S('After class', ['The children have gone home. Pell has written something on the board in her neat round hand. It is not a lesson.', 'It says: I would like to keep learning things with you. Underneath, smaller: This is not on the test.'],
      C('Write your answer under it', 100, 'You take the chalk and write: Yes. Pell reads it twice, then puts her hand over her mouth and laughs, and does not rub it out for a week.'),
      C('Say it aloud to her', 80, '"Yes," you say. She lets out a breath. "Good," she says. "I was going to have to rub it out before the morning."'), true),
  },
  juno: {
    2: S('A heavy bag', ['Juno is sitting on the village steps with the mailbag spilled open around her. "The strap broke. Of course it did. On the longest round of the week."'],
      C('Carry half the round with her', 50, 'You walk the whole route together. She talks the entire way. At the end she grins and says, "Same time tomorrow?" She is only half joking.'),
      C('Knot the strap back together', 25, 'It holds. Mostly. "You are a lifesaver," she says, and dashes off before you can answer.')),
    6: S('A letter with no stamp', ['Juno hands you an envelope with no stamp and no return address. "Not official mail," she says quickly. "Do not open it in front of me."', 'Inside is a drawing of your farm from the road, and the words: My favourite stop.'],
      C('Write a reply and give it to her', 60, 'You hand it over the next morning. She reads it right there in the road, then tucks it in her coat pocket instead of her bag. "Private mail," she says.'),
      C('Tell her it was your favourite letter', 40, '"Good," she says, pink in the face. "Because I wrote six versions."')),
    10: S('The last delivery', ['Juno knocks on your door after dark, out of uniform, holding a single envelope.', '"No more rounds today. This one is not for the bag." It is addressed to you, in her hand. It says: Come walking with me. Not for work. Just because.'],
      C('Take her hand and go', 100, 'You walk the long roads in the dark together, no mail, no hurry. She knows every gate and every dog. At your door she does not want to say goodnight.'),
      C('Write back: Every night', 80, 'She reads it by your lamp and laughs. "That is a lot of walking." "I know." "Good." She is already pulling you out of the door.'), true),
  },
  corvin: {
    2: S('Sparks', ['Corvin is hammering at the anvil, sweating. A spark lands on his sleeve and he does not even notice it smouldering.'],
      C('Pat the spark out', 50, 'He blinks at his sleeve, then at you. "Huh. Thanks." He goes back to hammering, but slower, and he glances at you twice.'),
      C('Tell him his sleeve is on fire', 25, 'He slaps it out, unbothered. "Happens." Then, after a moment: "Good eyes."')),
    6: S('The ring', ['You find Corvin at the forge late, working on something tiny with a fine hammer. It is a ring, plain and smooth.', '"Practice," he says, too fast. "Small work. Keeps the hands steady."'],
      C('Say it is beautiful work', 60, 'He turns it in the light. "It is not done." He puts it in his apron pocket, very carefully, and does not say who it is for.'),
      C('Ask who it is for', 40, '"Nobody," he says. Then, quieter, "Not yet." The fire crackles. He does not look up, but he is smiling.')),
    10: S('Tempered', ['Corvin closes the smithy early and walks you to the quiet end of the lane. He takes the plain ring out of his apron.', '"I do not have words. I have this." He holds it out. "I made it for whoever made me stop and look up from the anvil. It took me a while to admit it was you."'],
      C('Put it on', 100, 'It fits perfectly. Of course it does. Corvin lets out a long breath and laughs, rough and surprised. "Good," he says. "Good."'),
      C('Close his hand around it and kiss him', 80, '"That a yes?" he asks, very close. It is. He keeps the ring until you are ready to wear it, and tells you he will make a better one anyway.'), true),
  },
});

// v52: the spouse's 14-heart scene (married: true plays only for your spouse).
const M = (title, text, a, b) => ({ title, text, choices: [a, b], married: true });
const spouse14 = {
  ines: M('A new hive', ['Ines has set up a hive at the edge of the farm, painted the same colour as your door.', '"Ours," she says. "The first hive that is not my mother\'s. I wanted it to be here."'],
    C('Help her settle the bees', 120, 'You work together until dusk, slow and careful. When the last bee goes in, Ines leans on you and laughs. "Home," she says.'),
    C('Name the hive together', 80, 'You argue happily over names until it is dark. She writes the winner on the lid in her neat hand.')),
  odile: M('The net', ['Odile has mended an old net and hung it across the farmhouse porch. Woven into it, in blue thread, are both your initials.', '"Nets hold things," she says. "That is what they are for."'],
    C('Kiss her by the net', 120, 'She laughs into your shoulder. "Sentimental," she accuses. She does not take the net down.'),
    C('Tell her it is the best thing on the farm', 80, '"Second best," Odile says, and looks at you until you understand.')),
  tavi: M('The last blank space', ['Tavi spreads the valley map on the kitchen table. Every corner is drawn now, except one small square: the farmhouse.', '"I left it blank," Tavi says. "I wanted us to draw it together."'],
    C('Draw it together', 120, 'Two hands on one pen. The farmhouse comes out a little crooked. Tavi says it is the most accurate thing on the map.'),
    C('Draw a star on it', 80, 'Tavi laughs. "Not standard." Then they draw a second star next to yours.')),
  esme: M('The portrait', ['Esme finally finishes the painting she has hidden from you all season. It is the two of you on the porch, in the evening light.', '"I could never get your face right," she says. "Then I stopped painting you alone."'],
    C('Hang it above the fireplace', 120, 'You hang it together. Esme steps back, tilts her head, and for once does not want to change a single thing.'),
    C('Ask her to sign both your names', 80, 'She signs it twice, then laughs at herself and adds a small heart between the names.')),
  rook: M('The second boat', ['Rook has built a second, smaller boat in the barn. Its hull is painted with the name of your farm.', '"The first one was for going out," he says. "This one is for coming home."'],
    C('Launch it together at dawn', 120, 'It floats. Of course it floats. Rook rows you round the bay and back and does not stop smiling the whole way.'),
    C('Tell him it is beautiful', 80, '"So is the farm," he says. "So are you. I say it less than I should."')),
  pell: M('The lesson plan', ['Pell leaves a lesson plan on your pillow. The subject: Us. Lesson one: breakfast together. Lesson two: a walk. Lesson three: ask me anything.', '"There is a test at the end," she says. "You will pass."'],
    C('Follow the whole plan', 120, 'Breakfast, the walk, and you ask her everything. By evening Pell gives you full marks and a gold star on the back of your hand.'),
    C('Write a lesson for her', 80, 'You write: Lesson four: stay. She reads it twice and tucks it inside her grandmother\'s book.')),
  juno: M('No more rounds', ['Juno comes home early, hangs up her mailbag, and sits on the porch step.', '"I asked for the short round," she says. "The one that ends here. I want to come home earlier. To you."'],
    C('Sit with her until sunset', 120, 'She leans on your shoulder and tells you every dog and gate on the valley roads. You listen to all of it.'),
    C('Bring her tea', 80, '"Perfect," she sighs, and kicks off her boots. "This is the best stop on any round."')),
  corvin: M('Two rings', ['Corvin opens his apron pocket and takes out two rings: the plain one he made long ago, and a new one, finer, with a thread of gold through it.', '"Told you I would make a better one," he says.'],
    C('Wear both', 120, 'He slides them on, rough hands careful. "Good," he says, very quietly. "Good."'),
    C('Give him the old one to keep', 80, 'He closes his hand around it. "I will keep it on the anvil," he says. "So I remember why I look up."')),
};
for (const [id, sc] of Object.entries(spouse14)) SCENES[id][14] = sc;
