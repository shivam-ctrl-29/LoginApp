const express = require('express');
const router = express.Router();
const cache = require('../src/utils/cache');

const SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB',
  'HTML', 'CSS', 'Git', 'Docker', 'AWS',
  'REST API', 'GraphQL', 'Redux', 'Next.js', 'Express.js',
  'Prisma', 'Figma', 'Photoshop', 'Excel', 'Communication',
  'Leadership', 'Project Management', 'Agile', 'Scrum'
];

router.get('/', (req, res) => {
  const cached = cache.get('skills');
  if (cached) {
    console.log('Cache HIT: skills');
    return res.json(cached);
  }
  const mapped = SKILLS.map((s, i) => ({ id: i + 1, skill_name: s }));
  cache.set('skills', mapped);
  console.log('Cache SET: skills');
  res.json(mapped);
});

module.exports = router;
