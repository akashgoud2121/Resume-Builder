
import type { ResumeData } from './types';

export const initialResumeData: ResumeData = {
  contact: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
  },
  summary: '',
  education: [
    {
      id: `edu_${Date.now()}`,
      category: 'higher',
      school: '',
      degree: '',
      date: '',
      city: '',
      grades: '',
    },
  ],
  experience: [],
  projects: [
    {
      id: `proj_${Date.now()}`,
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  skills: [
    {
        id: `skillcat_${Date.now()}_1`,
        name: 'Programming Languages',
        skills: 'JavaScript, Python, C++',
    },
    {
        id: `skillcat_${Date.now()}_2`,
        name: 'Frameworks & Libraries',
        skills: 'React, Node.js, Express',
    },
    {
        id: `skillcat_${Date.now()}_3`,
        name: 'Developer Tools',
        skills: 'Git, Docker, VS Code',
    },
  ],
  certifications: [],
  achievements: [],
};
