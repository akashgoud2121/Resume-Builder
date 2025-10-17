
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
  skills: '',
};
