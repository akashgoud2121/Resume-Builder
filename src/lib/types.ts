
export type ContactInfo = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
};

export type EducationCategory = 'schooling' | 'intermediate' | 'higher' | 'other';

export type Education = {
  id: string;
  category: EducationCategory;
  school: string;
  degree: string;
  date: string;
  city: string;
  grades: string;
};

export type Experience = {
  id:string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Project = {
  id:string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type SkillCategory = {
    id: string;
    name: string;
    skills: string; // Comma-separated list of skills
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
};

export type AchievementCategory = 'workshop' | 'hackathon' | 'poster' | 'techfest' | 'leadership' | 'volunteering' | 'publication' | 'other';

export type Achievement = {
  id: string;
  category: AchievementCategory;
  name: string;
  context: string;
  date: string;
  description: string;
};

export type ResumeData = {
  contact: ContactInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  achievements: Achievement[];
};
