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
  experience: [
    {
      id: `exp_${Date.now()}`,
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  skills: '',
};
