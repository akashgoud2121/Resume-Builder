import type { ResumeData } from './types';

export const initialResumeData: ResumeData = {
  contact: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
  },
  summary: '',
  education: [
    {
      id: `edu_${Date.now()}`,
      school: '',
      degree: '',
      date: '',
      city: '',
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
