const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB',
    'HTML', 'CSS', 'Git', 'Docker', 'AWS',
    'REST API', 'GraphQL', 'Redux', 'Next.js', 'Express.js',
    'Prisma', 'Figma', 'Photoshop', 'Excel', 'Communication',
    'Leadership', 'Project Management', 'Agile', 'Scrum'
  ];
  res.json(skills.map((s, i) => ({ id: i + 1, skill_name: s })));
});

module.exports = router;
