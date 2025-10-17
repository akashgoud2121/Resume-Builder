export type ContactInfo = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
};

export type EducationCategory = 'schooling' | 'intermediate' | 'higher';

export type Education = {
  id: string;
  category: EducationCategory;
  school: string;
  degree: string;
  date: string;
  city: string;
};

export type Experience = {
  id:string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type ResumeData = {
  contact: ContactInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string;
};
