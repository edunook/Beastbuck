export const SPECIALIZATIONS = [
  {
    id: 'scientist',
    name: 'Scientist',
    description: 'Experiments, observations, evidence, and science thinking.',
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Coding, debugging, apps, tools, and automation.',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Building systems, prototypes, mechanics, and problem solving.',
  },
  {
    id: 'inventor',
    name: 'Inventor',
    description: 'New ideas, product concepts, sketches, and clever improvements.',
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Visual design, drawing, craft, presentation, and creative polish.',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Learning deeply, collecting notes, comparing sources, and reporting.',
  },
  {
    id: 'marketer',
    name: 'Marketer',
    description: 'Product stories, launches, posters, pitches, and customer thinking.',
  },
  {
    id: 'leader',
    name: 'Leader',
    description: 'Team coordination, reviews, planning, and helping members succeed.',
  },
];

export function getSpecializationById(id) {
  return SPECIALIZATIONS.find(specialization => specialization.id === id);
}
