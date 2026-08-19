import type { Def } from './exercise-def';

/** Core, anti-rotation and loaded carries. */
export const CORE_DEFS: Def[] = [
  {
    id: 'hanging-leg-raise', name: 'Hanging Leg Raise',
    primary: ['core'], secondary: ['forearms', 'lats'],
    equipment: 'bodyweight', movement: 'core',
    cue: 'Curl the pelvis up, do not just lift the legs.',
    steps: [
      'Hang from a bar with the shoulders active and the body still.',
      'Brace the core and tilt the pelvis slightly back before the first rep.',
      'Raise the legs until the thighs pass parallel, curling the hips toward the ribs.',
      'Lower slowly without letting the body swing.',
    ],
    mistakes: [
      'Swinging into each rep with momentum.',
      'Only lifting from the hip flexors with a flat lower back.',
      'Dropping the legs fast at the end of the rep.',
    ],
    alt: ['cable-crunch', 'ab-wheel-rollout', 'dead-bug'],
  },
  {
    id: 'cable-crunch', name: 'Cable Crunch',
    primary: ['core'], secondary: [],
    equipment: 'cable', movement: 'core',
    cue: 'Bring the ribs to the pelvis, hips stay fixed.',
    steps: [
      'Kneel facing a high pulley with a rope held beside the head.',
      'Set the hips back so the torso is slightly hinged and keep them there.',
      'Crunch by rounding the spine and pulling the elbows toward the thighs.',
      'Return slowly until the abs are stretched, without letting the weight rest.',
    ],
    mistakes: [
      'Hinging at the hips rather than flexing the spine.',
      'Pulling with the arms and lats.',
      'Coming up too fast and losing the contraction.',
    ],
    alt: ['hanging-leg-raise', 'ab-wheel-rollout', 'plank'],
  },
  {
    id: 'plank', name: 'Front Plank',
    primary: ['core'], secondary: ['shoulders', 'glutes'],
    equipment: 'bodyweight', movement: 'core',
    cue: 'Squeeze the glutes and tuck the ribs down.',
    steps: [
      'Set the elbows under the shoulders and the feet hip width.',
      'Push the forearms into the floor so the upper back is not sagging.',
      'Squeeze the glutes and brace the abs to flatten the lower back.',
      'Hold for the prescribed time, breathing steadily throughout.',
    ],
    mistakes: [
      'Letting the hips drop and the lower back arch.',
      'Holding the breath for the whole set.',
      'Raising the hips into a pike to make it easier.',
    ],
    alt: ['dead-bug', 'ab-wheel-rollout', 'pallof-press'],
  },
  {
    id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout',
    primary: ['core'], secondary: ['lats', 'shoulders'],
    equipment: 'other', movement: 'core',
    cue: 'The lower back must not arch, that is the whole exercise.',
    steps: [
      'Kneel with the wheel under the shoulders and the arms straight.',
      'Tuck the pelvis and brace hard before moving.',
      'Roll forward only as far as you can hold the brace.',
      'Pull back by squeezing the abs and lats, not by hinging the hips.',
    ],
    mistakes: [
      'Rolling out further than the core can control so the back arches.',
      'Piking the hips to return to the start.',
      'Starting from standing before kneeling reps are solid.',
    ],
    alt: ['plank', 'hanging-leg-raise', 'cable-crunch'],
  },
  {
    id: 'pallof-press', name: 'Pallof Press',
    primary: ['core'], secondary: ['shoulders', 'glutes'],
    equipment: 'cable', movement: 'core', uni: true,
    cue: 'Resist the twist, do not create one.',
    steps: [
      'Set a pulley at chest height and stand side-on with both hands on the handle.',
      'Step out until the cable is taut, feet shoulder width, knees soft.',
      'Press the handle straight out from the sternum and hold for two seconds.',
      'Return to the chest without letting the torso rotate, then swap sides.',
    ],
    mistakes: [
      'Letting the shoulders turn toward the machine.',
      'Standing too close so there is no resistance to resist.',
      'Holding the breath instead of breathing through the press.',
    ],
    alt: ['plank', 'dead-bug', 'farmers-carry'],
  },
  {
    id: 'dead-bug', name: 'Dead Bug',
    primary: ['core'], secondary: [],
    equipment: 'bodyweight', movement: 'core',
    cue: 'Lower back stays pressed into the floor all the way through.',
    steps: [
      'Lie on your back with the arms up and the hips and knees bent to 90 degrees.',
      'Press the lower back gently into the floor and exhale to set the brace.',
      'Extend the opposite arm and leg toward the floor slowly.',
      'Return to the start and repeat on the other side.',
    ],
    mistakes: [
      'Letting the lower back lift off the floor as the leg extends.',
      'Moving quickly and losing the brace.',
      'Extending further than you can control.',
    ],
    alt: ['plank', 'pallof-press', 'cable-crunch'],
  },
  {
    id: 'farmers-carry', name: 'Farmer Carry',
    primary: ['forearms', 'traps'], secondary: ['core', 'glutes'],
    equipment: 'dumbbell', movement: 'carry',
    cue: 'Tall posture, quiet feet, do not rush.',
    steps: [
      'Deadlift a heavy dumbbell or kettlebell into each hand.',
      'Stand tall with the shoulders pulled down and the ribs stacked over the hips.',
      'Walk in a straight line with short, controlled steps for the prescribed distance or time.',
      'Set the weights down with a hinge, not a drop.',
    ],
    mistakes: [
      'Leaning back and letting the ribs flare.',
      'Shrugging the shoulders up toward the ears.',
      'Rushing and letting the weights swing into the legs.',
    ],
    alt: ['dumbbell-shrug', 'barbell-shrug', 'plank'],
  },
];
