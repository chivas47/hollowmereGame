// Heart scenes: the first talk after reaching 4 and 8 hearts plays a short scene with a choice.
// Each choice adds friendship points and gets its own reply. Plain text, no em dashes.
export const SCENE_HEARTS = [4, 8];

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
