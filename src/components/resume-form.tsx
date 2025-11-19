
"use client";

import React, { useState } from 'react';
import { useResume } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Sparkles, Loader2, Copy, X, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Education, Experience, Project, SkillCategory as SkillCategoryType, Certification, Achievement, AchievementCategory, EducationCategory, OtherLink } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { generateSummary } from '@/ai/flows/generate-summary-flow';
import { generateExperience } from '@/ai/flows/generate-experience-flow';
import { useNotification } from '@/lib/notification-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import type { GenerateSummaryInput } from '@/ai/schemas';
import { MonthYearPicker } from './date-picker';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Stepper } from './stepper';


const educationCategoryConfig: Record<EducationCategory, any> = {
  schooling: {
    title: 'Schooling (Class X/XII)',
    fields: {
      school: { label: 'School Name', placeholder: 'e.g., Delhi Public School' },
      degree: { label: 'Board (e.g., CBSE, ICSE) or Class', placeholder: 'e.g., CBSE Class XII' },
      startDate: { label: 'Start Date', placeholder: 'e.g., May 2019' },
      endDate: { label: 'End Date', placeholder: 'e.g., May 2020' },
      city: { label: 'City / State', placeholder: 'e.g., New Delhi, Delhi' },
      grades: { label: 'Grades / Percentage', placeholder: 'e.g., 95% or 10 CGPA' },
    }
  },
  intermediate: {
    title: 'Intermediate / Diploma',
    fields: {
      school: { label: 'College / Institute Name', placeholder: 'e.g., Sri Chaitanya Junior College' },
      degree: { label: 'Group / Specialization', placeholder: 'e.g., MPC' },
      startDate: { label: 'Start Date', placeholder: 'e.g., June 2020' },
      endDate: { label: 'End Date', placeholder: 'e.g., May 2022' },
      city: { label: 'City / State', placeholder: 'e.g., Hyderabad, Telangana' },
      grades: { label: 'Grades / Percentage', placeholder: 'e.g., 98%' },
    }
  },
  higher: {
    title: 'Higher Education (University)',
    fields: {
      school: { label: 'University / College Name', placeholder: 'e.g., Indian Institute of Technology Bombay' },
      degree: { label: 'Degree & Major', placeholder: 'e.g., B.Tech in Computer Science' },
      startDate: { label: 'Start Date', placeholder: 'e.g., July 2022' },
      endDate: { label: 'End Date (or Expected)', placeholder: 'e.g., May 2026' },
      city: { label: 'City / State', placeholder: 'e.g., Mumbai, Maharashtra' },
      grades: { label: 'CGPA / Percentage', placeholder: 'e.g., 8.5 CGPA' },
    }
  },
  other: {
    title: 'Other Qualification',
    fields: {
      school: { label: 'Institution / Provider Name', placeholder: 'e.g., Coursera' },
      degree: { label: 'Qualification / Course Name', placeholder: 'e.g., Machine Learning Specialization' },
      startDate: { label: 'Start Date', placeholder: 'e.g., Jan 2024' },
      endDate: { label: 'End Date', placeholder: 'e.g., May 2024' },
      city: { label: 'Location (Optional)', placeholder: 'e.g., Online' },
      grades: { label: 'Grades / Score (Optional)', placeholder: 'e.g., 98%' },
    }
  }
};

const achievementCategoryConfig: Record<AchievementCategory, { title: string; nameLabel: string; contextLabel: string }> = {
    workshop: { title: 'Workshop', nameLabel: 'Workshop Title', contextLabel: 'Conducted by' },
    hackathon: { title: 'Hackathon', nameLabel: 'Hackathon Name / Project Title', contextLabel: 'Organized by / Rank' },
    poster: { title: 'Poster Presentation', nameLabel: 'Presentation Title', contextLabel: 'Event / Conference' },
    techfest: { title: 'Techfest Participation', nameLabel: 'Event Name', contextLabel: 'Organized by / Role' },
    leadership: { title: 'Leadership', nameLabel: 'Role / Position', contextLabel: 'Organization / Club' },
    volunteering: { title: 'Volunteering', nameLabel: 'Role', contextLabel: 'Organization' },
    publication: { title: 'Publication', nameLabel: 'Paper / Article Title', contextLabel: 'Journal / Conference Name' },
    other: { title: 'Other', nameLabel: 'Activity Name', contextLabel: 'Context (e.g., Competition Name)' },
};

const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
    'hackathon',
    'workshop',
    'poster',
    'techfest',
    'leadership',
    'volunteering',
    'publication',
    'other',
];

type AiExperienceState = {
  isOpen: boolean;
  projectTitle: string;
  projectDescription: string;
  technologiesUsed: string;
  generatedBulletPoints: string;
  isGenerating: boolean;
  targetIndex: number | null;
  targetType: 'experience' | 'projects' | 'achievements' | 'certifications';
};

const initialSummaryAiState: GenerateSummaryInput = {
    year: '',
    major: '',
    specialization: '',
    skills: '',
    jobType: ''
};

const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frontend Frameworks & Libraries',
  'Backend Frameworks & Libraries',
  'Styling & UI Libraries',
  'Databases',
  'Cloud & DevOps',
  'Developer Tools',
  'AI/ML Concepts',
  'Other',
];

const SUGGESTED_SKILLS: Record<string, string[]> = {
    'Programming Languages': ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'SQL', 'Go', 'Rust', 'Kotlin', 'Swift'],
    'Frontend Frameworks & Libraries': ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'jQuery'],
    'Backend Frameworks & Libraries': ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails', 'ASP.NET'],
    'Styling & UI Libraries': ['Tailwind CSS', 'Bootstrap', 'Material-UI (MUI)', 'Chakra UI', 'Sass', 'LESS'],
    'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase Firestore'],
    'Cloud & DevOps': ['AWS', 'Google Cloud (GCP)', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions'],
    'Developer Tools': ['Git', 'GitHub', 'VS Code', 'Jira', 'Figma', 'Postman', 'Webpack'],
    'AI/ML Concepts': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenCV', 'NLTK', 'Spacy'],
};


const PROJECT_TYPES = [
    'Major Project',
    'Minor Project',
    'Course Project',
    'Personal Project',
    'Client Project',
    '3rd-1 Sem App Dev',
    '3rd-2 Sem App Dev 2',
    'Other'
];

const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const BulletPointTooltip = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>To create bullet points, start each line with a hyphen (-) or press Enter to create a new point on a new line.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
);

const RequiredIndicator = () => <span className="text-destructive ml-1">*</span>;

const baseFormSteps = [
    { id: 'contact', name: 'Contact' },
    { id: 'summary', name: 'Summary' },
    { id: 'skills', name: 'Skills' },
    { id: 'education', name: 'Education' },
    { id: 'projects', name: 'Projects' },
    { id: 'certifications', name: 'Certifications' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'experience', name: 'Experience' }, // Last fixed step
    // 'Other' section removed - users can add custom sections instead
];

export function ResumeForm() {
  const { resumeData, setResumeData } = useResume();
  const [userApiKey, setUserApiKey] = React.useState<string | null>(null);
  const [isSummaryAiDialogOpen, setIsSummaryAiDialogOpen] = React.useState(false);
  const [summaryAiState, setSummaryAiState] = React.useState<GenerateSummaryInput>(initialSummaryAiState);
  const [otherYear, setOtherYear] = React.useState('');
  const [generatedSummary, setGeneratedSummary] = React.useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const isGeneratingRef = React.useRef(false); // Prevent double calls
  const { showNotification } = useNotification();

  const [dateErrors, setDateErrors] = React.useState<Record<string, string | null>>({});
  const [validationErrors, setValidationErrors] = React.useState<Record<string, boolean>>({});


  const [aiExperienceState, setAiExperienceState] = React.useState<AiExperienceState>({
    isOpen: false,
    projectTitle: '',
    projectDescription: '',
    technologiesUsed: '',
    generatedBulletPoints: '',
    isGenerating: false,
    targetIndex: null,
    targetType: 'experience',
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [customSections, setCustomSections] = useState<Array<{ id: string; name: string }>>([]);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  
  // Initialize custom sections from resumeData when it loads
  React.useEffect(() => {
    if (resumeData.customSections && Object.keys(resumeData.customSections).length > 0) {
      const sectionsArray = Object.entries(resumeData.customSections).map(([id, section]) => ({
        id,
        name: section.title,
      }));
      setCustomSections(sectionsArray);
    }
  }, [resumeData.customSections]);
  
  // Build dynamic steps list
  const formSteps = React.useMemo(() => {
    // Add custom sections AFTER Experience (at the end)
    return [...baseFormSteps, ...customSections];
  }, [customSections]);

  const validateStep = (stepIndex: number): boolean => {
    const stepId = formSteps[stepIndex]?.id;
    if (!stepId) return true;
    
    const errors: Record<string, boolean> = {};
    let isValid = true;

    const check = (value: string, fieldId: string) => {
        if (!value || value.trim() === '') {
            errors[fieldId] = true;
            isValid = false;
        }
    };
    
    // Custom sections don't require validation
    if (stepId.startsWith('custom-')) {
        return true;
    }
    
    if (stepId === 'contact') {
        check(resumeData.contact.name, 'contact.name');
        check(resumeData.contact.email, 'contact.email');
        check(resumeData.contact.phone, 'contact.phone');
        check(resumeData.contact.location, 'contact.location');
        resumeData.contact.otherLinks.forEach((link, i) => {
            check(link.label, `contact.otherLinks.${link.id}.label`);
            check(link.url, `contact.otherLinks.${link.id}.url`);
        });
    } else if (stepId === 'summary') {
        check(resumeData.summary, 'summary');
    } else if (stepId === 'education') {
        resumeData.education.forEach(edu => {
            check(edu.school, `education.${edu.id}.school`);
            check(edu.degree, `education.${edu.id}.degree`);
            check(edu.startDate, `education.${edu.id}.startDate`);
            check(edu.endDate, `education.${edu.id}.endDate`);
            check(edu.city, `education.${edu.id}.city`);
        });
    } else if (stepId === 'projects') {
        resumeData.projects.forEach(proj => {
            check(proj.title, `projects.${proj.id}.title`);
            check(proj.projectType, `projects.${proj.id}.projectType`);
            check(proj.organization, `projects.${proj.id}.organization`);
            check(proj.startDate, `projects.${proj.id}.startDate`);
            check(proj.endDate, `projects.${proj.id}.endDate`);
            check(proj.description, `projects.${proj.id}.description`);
        });
    } else if (stepId === 'experience') {
        resumeData.experience.forEach(exp => {
            check(exp.title, `experience.${exp.id}.title`);
            check(exp.company, `experience.${exp.id}.company`);
            check(exp.startDate, `experience.${exp.id}.startDate`);
            check(exp.endDate, `experience.${exp.id}.endDate`);
            check(exp.description, `experience.${exp.id}.description`);
        });
    } else if (stepId === 'certifications') {
        resumeData.certifications.forEach(cert => {
            check(cert.name, `certifications.${cert.id}.name`);
            check(cert.issuer, `certifications.${cert.id}.issuer`);
            check(cert.date, `certifications.${cert.id}.date`);
            check(cert.description, `certifications.${cert.id}.description`);
            check(cert.technologies, `certifications.${cert.id}.technologies`);
        });
    } else if (stepId === 'achievements') {
        resumeData.achievements.forEach(ach => {
            check(ach.category, `achievements.${ach.id}.category`);
            check(ach.name, `achievements.${ach.id}.name`);
            check(ach.context, `achievements.${ach.id}.context`);
            check(ach.date, `achievements.${ach.id}.date`);
            check(ach.description, `achievements.${ach.id}.description`);
        });
    } else if (stepId === 'skills') {
        resumeData.skills.forEach(skillCat => {
            check(skillCat.name, `skills.${skillCat.id}.name`);
            check(skillCat.skills, `skills.${skillCat.id}.skills`);
        });
    }


    setValidationErrors(errors);
    return isValid;
  };

  const goToNextStep = async () => {
    if (validateStep(currentStep)) {
        setValidationErrors({});
        
        // Trigger an immediate save when clicking Next (hybrid approach)
        // This ensures data is saved at section boundaries + auto-save
        const saveEvent = new CustomEvent('force-save-resume');
        window.dispatchEvent(saveEvent);
        
        setCurrentStep(prev => (prev < formSteps.length - 1 ? prev + 1 : prev));
    } else {
        showNotification({
            type: "error",
            title: "Missing Fields",
            description: "Please fill out all required fields before continuing.",
        });
    }
  };

  const goToPreviousStep = () => {
    setValidationErrors({});
    setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleStepClick = (stepIndex: number) => {
    setValidationErrors({});
    setCurrentStep(stepIndex);
  };

  const handleAddCustomSection = () => {
    setIsAddSectionDialogOpen(true);
  };

  const confirmAddSection = () => {
    if (newSectionName.trim()) {
      const newSection = {
        id: `custom-${Date.now()}`,
        name: newSectionName.trim(),
      };
      setCustomSections([...customSections, newSection]);
      
      // Initialize data for the custom section
      setResumeData(prev => ({
        ...prev,
        customSections: {
          ...prev.customSections,
          [newSection.id]: {
            title: newSectionName.trim(),
            items: [],
          }
        }
      }));
      
      setNewSectionName('');
      setIsAddSectionDialogOpen(false);
      showNotification({
        title: 'Section Added',
        description: `"${newSectionName}" section has been added.`,
        type: 'success',
      });
    }
  };

  const handleDeleteCustomSection = (sectionId: string) => {
    setCustomSections(customSections.filter(s => s.id !== sectionId));
    
    // Remove data for this custom section
    setResumeData(prev => {
      const newCustomSections = { ...prev.customSections };
      delete newCustomSections[sectionId];
      return {
        ...prev,
        customSections: newCustomSections
      };
    });
    
    // Go to previous step if we deleted the current one
    if (formSteps[currentStep]?.id === sectionId) {
      setCurrentStep(prev => Math.max(0, prev - 1));
    }
    
    showNotification({
      title: 'Section Removed',
      description: 'Custom section has been deleted.',
      type: 'info',
    });
  };


  React.useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    const key = localStorage.getItem('userApiKey');
    setUserApiKey(key);

    const handleStorageChange = () => {
        const newKey = localStorage.getItem('userApiKey');
        setUserApiKey(newKey);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const templateTexts = {
    experience: {
        title: "Generate Work Experience Description",
        descriptionLabel: "Brief Description of Responsibilities",
        techLabel: "Technologies Used",
        descriptionPlaceholder: "e.g., 'Responsible for front-end development of the checkout page and implementing payment gateway APIs.'",
        techPlaceholder: "e.g., React, TypeScript, Node.js, Stripe API",
        template: {
            description: "As a software engineering intern, my primary role was to develop new features for the company's flagship e-commerce platform. I was tasked with improving the user experience of the product discovery journey and optimizing page load times.",
            technologies: "Next.js, TypeScript, Tailwind CSS, GraphQL"
        }
    },
    projects: {
        title: "Generate Project Description",
        descriptionLabel: "Brief Description of the Project",
        techLabel: "Technologies Used",
        descriptionPlaceholder: "e.g., 'Built a social media dashboard to track user engagement metrics and display data visualizations.'",
        techPlaceholder: "e.g., React, Firebase, Chart.js, Tailwind CSS",
        template: {
            description: "The goal of this project was to build a web app to help users track their daily water intake. The app had features for setting daily goals and sending reminders. My main responsibility was designing the user interface and developing the front-end components.",
            technologies: "React, Firebase, Chart.js, Tailwind CSS"
        }
    },
    certifications: {
        title: "Generate Certification Description",
        descriptionLabel: "What did you learn or what was the certification about?",
        techLabel: "Skills/Topics Covered",
        descriptionPlaceholder: "e.g., 'This certification covered core Google Cloud services like Compute Engine, Cloud Storage, and Kubernetes Engine.'",
        techPlaceholder: "e.g., VPC, IAM, BigQuery, Cloud Functions",
        template: {
            description: "This certification validates the ability to design, develop, and manage robust, secure, scalable, and dynamic solutions on Google Cloud. I completed a series of hands-on labs and a final exam to earn this credential.",
            technologies: "Google App Engine, Cloud SQL, IAM, Cloud Build"
        }
    },
    achievements: {
        title: "Generate Achievement Description",
        descriptionLabel: "Briefly describe the achievement",
        techLabel: "Relevant Skills/Technologies (Optional)",
        descriptionPlaceholder: "e.g., 'Won first place in a national-level hackathon by developing a mobile app for waste management.'",
        techPlaceholder: "e.g., Flutter, Firebase, Google Maps API",
        template: {
            description: "Our team developed a solution for urban waste management that won 1st place out of over 500 competing teams. The project involved creating a full-stack web application with a predictive model for optimizing garbage collection routes.",
            technologies: "Python, Flask, React, Scikit-learn, Google Maps API"
        }
    },
    other: {
        title: "Generate Custom Section Description",
        descriptionLabel: "Briefly describe the item",
        techLabel: "Relevant Skills/Technologies (Optional)",
        descriptionPlaceholder: "e.g., 'Co-authored a paper on...', 'Organized a coding workshop for 50+ students...'",
        techPlaceholder: "e.g., LaTeX, Python, Public Speaking",
        template: {
            description: "Presented research on the topic of 'Efficient Deep Learning Models for Edge Devices' at a university-level symposium. Our work focused on model quantization and knowledge distillation techniques to reduce computational overhead.",
            technologies: "Python, TensorFlow Lite, Quantization"
        }
    }
  };


  // Validate LinkedIn URL format
  const isValidLinkedInUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid (optional field)
    const trimmedUrl = url.trim();
    // LinkedIn pattern: linkedin.com/in/username or linkedin.com/company/companyname
    const linkedinPattern = /^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[\w-]+|linkedin\.com\/company\/[\w-]+)\/?$/i;
    return linkedinPattern.test(trimmedUrl);
  };

  // Validate GitHub URL format
  const isValidGitHubUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid (optional field)
    const trimmedUrl = url.trim();
    // GitHub pattern: github.com/username
    const githubPattern = /^(https?:\/\/)?(www\.)?(github\.com\/[\w-]+)\/?$/i;
    return githubPattern.test(trimmedUrl);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    
    setResumeData(prev => ({ ...prev, contact: { ...prev.contact, [fieldName]: value } }));
    
    // Validate LinkedIn and GitHub URLs if they have values
    if (fieldName === 'linkedin' && value.trim()) {
      if (!isValidLinkedInUrl(value)) {
        // Set validation error
        setValidationErrors(prev => ({
          ...prev,
          [`contact.${fieldName}`]: true
        }));
      } else {
        // Clear validation error if URL is valid
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`contact.${fieldName}`];
          return newErrors;
        });
      }
    } else if (fieldName === 'github' && value.trim()) {
      if (!isValidGitHubUrl(value)) {
        // Set validation error
        setValidationErrors(prev => ({
          ...prev,
          [`contact.${fieldName}`]: true
        }));
      } else {
        // Clear validation error if URL is valid
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`contact.${fieldName}`];
          return newErrors;
        });
      }
    } else if ((fieldName === 'linkedin' || fieldName === 'github') && !value.trim()) {
      // Clear validation error if field is empty (optional fields)
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`contact.${fieldName}`];
        return newErrors;
      });
    }
  };

  const handleOtherLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    setResumeData(prev => {
        const newLinks = [...prev.contact.otherLinks];
        newLinks[index] = {...newLinks[index], [field]: value};
        return {...prev, contact: {...prev.contact, otherLinks: newLinks}};
    });
    
    // Validate URL in real-time
    if (field === 'url' && value.trim()) {
      const link = resumeData.contact.otherLinks[index];
      const fieldId = `contact.otherLinks.${link.id}.url`;
      
      if (!isValidUrl(value)) {
        // Set validation error
        setValidationErrors(prev => ({
          ...prev,
          [fieldId]: true
        }));
      } else {
        // Clear validation error if URL is valid
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    } else if (field === 'url' && !value.trim()) {
      // Clear validation error if field is empty
      const link = resumeData.contact.otherLinks[index];
      const fieldId = `contact.otherLinks.${link.id}.url`;
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    
    // Clear validation errors when user starts typing in label field
    if (field === 'label') {
      const link = resumeData.contact.otherLinks[index];
      const fieldId = `contact.otherLinks.${link.id}.label`;
      if (validationErrors[fieldId]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    const trimmedUrl = url.trim();
    
    // Allow URLs with or without protocol (http://, https://)
    // Pattern: (optional protocol) + domain + optional path
    // Examples: example.com, https://example.com, www.example.com/path, subdomain.example.com
    const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    
    // Also allow localhost and IP addresses for development
    const localPattern = /^(https?:\/\/)?(localhost|[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})(:\d+)?([\/\w \.-]*)*\/?$/i;
    
    return urlPattern.test(trimmedUrl) || localPattern.test(trimmedUrl);
  };

  const addOtherLink = () => {
    // Validate all existing links before adding a new one
    const existingLinks = resumeData.contact.otherLinks;
    
    // Check if any existing link has empty label or URL (partial completion not allowed)
    const incompleteLinks = existingLinks.filter(link => {
      const hasLabel = link.label?.trim();
      const hasUrl = link.url?.trim();
      // Incomplete means: has one but not both, or has neither (empty link)
      return (hasLabel && !hasUrl) || (!hasLabel && hasUrl) || (!hasLabel && !hasUrl);
    });
    
    if (incompleteLinks.length > 0) {
      showNotification({
        title: 'Validation Error',
        description: 'Please fill in both Label and URL for all existing links before adding a new one. You cannot leave any link partially filled.',
        type: 'error',
      });
      // Set validation errors for incomplete links
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        incompleteLinks.forEach(link => {
          if (!link.label?.trim()) {
            newErrors[`contact.otherLinks.${link.id}.label`] = true;
          }
          if (!link.url?.trim()) {
            newErrors[`contact.otherLinks.${link.id}.url`] = true;
          }
        });
        return newErrors;
      });
      return;
    }

    // Validate URL format for all existing links that have URLs
    const linksWithUrls = existingLinks.filter(link => link.url?.trim());
    const invalidUrls = linksWithUrls.filter(link => !isValidUrl(link.url));
    if (invalidUrls.length > 0) {
      showNotification({
        title: 'Invalid URL Format',
        description: 'Please enter a valid URL format (e.g., example.com or https://example.com) for all existing links.',
        type: 'error',
      });
      // Set validation errors for invalid URLs
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        invalidUrls.forEach(link => {
          newErrors[`contact.otherLinks.${link.id}.url`] = true;
        });
        return newErrors;
      });
      return;
    }

    // Clear any validation errors since all links are valid
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      existingLinks.forEach(link => {
        delete newErrors[`contact.otherLinks.${link.id}.label`];
        delete newErrors[`contact.otherLinks.${link.id}.url`];
      });
      return newErrors;
    });

    // All validations passed, add new link
    setResumeData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        otherLinks: [...prev.contact.otherLinks, { id: `link_${Date.now()}`, label: 'Portfolio', url: '' }]
      }
    }));
  };
  
  const removeOtherLink = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        otherLinks: prev.contact.otherLinks.filter(link => link.id !== id)
      }
    }));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData(prev => ({ ...prev, summary: e.target.value }));
  };
  
  const handleSummaryAiStateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSummaryAiState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const validateDateRange = (startDateStr: string, endDateStr: string): boolean => {
    if (!startDateStr || !endDateStr) return false;

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    if (startDate && endDate) {
      return startDate > endDate;
    }
    return false;
  };

  const handleGenericChange = <T extends Education | Experience | Project | SkillCategoryType | Certification | Achievement>(
    section: 'education' | 'experience' | 'projects' | 'skills' | 'certifications' | 'achievements',
    index: number,
    field: keyof T,
    value: string
  ) => {
    const newSectionData = [...resumeData[section]] as T[];
    const updatedItem = { ...newSectionData[index], [field]: value };
    newSectionData[index] = updatedItem;

    setResumeData(prev => ({
      ...prev,
      [section]: newSectionData,
    }));
    
    // Validate URL fields (link) in real-time
    if (field === 'link' && value.trim()) {
      const itemWithId = updatedItem as any;
      const fieldId = `${section}.${itemWithId.id}.link`;
      
      if (!isValidUrl(value)) {
        // Set validation error
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          [fieldId]: true
        }));
      } else {
        // Clear validation error if URL is valid
        setValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    } else if (field === 'link' && !value.trim()) {
      // Clear validation error if field is empty (optional fields)
      const itemWithId = updatedItem as any;
      const fieldId = `${section}.${itemWithId.id}.link`;
      setValidationErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    
    // Clear validation errors when user starts typing (for non-link fields)
    if (field !== 'link') {
      const itemWithId = updatedItem as any;
      const fieldId = `${section}.${itemWithId.id}.${String(field)}`;
      if (validationErrors[fieldId]) {
        setValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    }
    
    if (field === 'startDate' || field === 'endDate') {
        const itemWithId = updatedItem as any;
        const startDate = field === 'startDate' ? value : itemWithId.startDate;
        const endDate = field === 'endDate' ? value : itemWithId.endDate;
        const isInvalid = validateDateRange(startDate, endDate);
        
        setDateErrors(prevErrors => ({
            ...prevErrors,
            [(itemWithId as any).id]: isInvalid ? "Start date cannot be after end date." : null
        }));
    }
  };

  const handleEducationCategoryChange = (index: number, value: EducationCategory) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], category: value };
      return { ...prev, education: newEducation };
    });
  };
  
  const handleAchievementCategoryChange = (index: number, value: string) => {
    setResumeData(prev => {
      const newAchievements = [...prev.achievements];
      newAchievements[index] = { ...newAchievements[index], category: value };
      return { ...prev, achievements: newAchievements };
    });
  };

  const addEntry = (section: 'education' | 'experience' | 'projects' | 'skills' | 'certifications' | 'achievements') => {
    setResumeData(prev => {
      let newEntry;
      if (section === 'education') {
        newEntry = { id: `edu_${Date.now()}`, category: 'higher' as EducationCategory, school: '', degree: '', startDate: '', endDate: '', city: '', grades: '' };
      } else if (section === 'experience') {
        newEntry = { id: `exp_${Date.now()}`, title: '', company: '', startDate: '', endDate: '', description: '' };
      } else if (section === 'projects') {
        newEntry = { id: `proj_${Date.now()}`, title: '', projectType: '', organization: '', startDate: '', endDate: '', description: '', link: '' };
      } else if (section === 'skills') {
        newEntry = { id: `skillcat_${Date.now()}`, name: '', skills: '' };
      } else if (section === 'certifications') {
        newEntry = { id: `cert_${Date.now()}`, name: '', issuer: '', date: '', description: '', technologies: '', link: '' };
      } else if (section === 'achievements') {
        newEntry = { id: `ach_${Date.now()}`, category: 'hackathon' as AchievementCategory, name: '', context: '', date: '', description: '', link: '' };
      } else {
        return prev;
      }
      return { ...prev, [section]: [...prev[section], newEntry] };
    });
  };
  
  const removeEntry = (section: 'education' | 'experience' | 'projects' | 'skills' | 'certifications' | 'achievements', id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter(item => item.id !== id),
    }));
    setDateErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors[id];
        return newErrors;
    })
  };

  const handleGenerateSummary = async () => {
    // Prevent double calls
    if (isGeneratingRef.current || isGeneratingSummary) {
      return;
    }
    
    isGeneratingRef.current = true;
    setIsGeneratingSummary(true);
    setGeneratedSummary('');
    
    try {
      const year = summaryAiState.year === 'Other' ? otherYear : summaryAiState.year;
      const result = await generateSummary({ ...summaryAiState, year, userApiKey });
      if (result.summary) {
        setGeneratedSummary(result.summary);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      showNotification({
        title: "Generation Failed",
        description: errorMessage.includes('overloaded') 
          ? "The AI service is currently overloaded. Please try again in a few moments."
          : errorMessage.includes('API key') || errorMessage.includes('key')
          ? "API key error. Please check your API key in settings."
          : "Something went wrong. If you're using your own API key, please ensure it's correct and has access to the Gemini API.",
        type: "error",
      });
    } finally {
      setIsGeneratingSummary(false);
      isGeneratingRef.current = false;
    }
  };

  const handleUseSummary = () => {
    if (!generatedSummary?.trim()) {
      return;
    }
    
    const summaryText = generatedSummary.trim();
    
    // Signal that user is actively editing (prevent data overwrite from cloud load)
    // Dispatch event BEFORE updating data to ensure flag is set
    const editingEvent = new CustomEvent('user-editing-resume', {
      detail: { isEditing: true, reason: 'ai-summary' }
    });
    window.dispatchEvent(editingEvent);
    
    // Update resume data with the generated summary
    setResumeData(prev => ({ ...prev, summary: summaryText }));
    
    // Close dialog and clear generated summary
    setIsSummaryAiDialogOpen(false);
    setGeneratedSummary('');
    
    // Small delay to ensure state update is processed, then trigger immediate save
    setTimeout(() => {
      // Trigger immediate save (bypass debounce) to prevent data loss
      // Dispatch event that resume-builder will listen to for immediate save
      const saveEvent = new CustomEvent('force-save-resume-immediate', {
        detail: { summary: summaryText }
      });
      window.dispatchEvent(saveEvent);
    }, 100);
    
    showNotification({
      title: "Summary Updated!",
      description: "The AI-generated summary has been added to your resume and saved.",
      type: "success",
    });
  };
  
  const openExperienceAiDialog = (type: 'experience' | 'projects' | 'achievements' | 'certifications', index: number) => {
    // Type guard to ensure type is valid
    if (type !== 'experience' && type !== 'projects' && type !== 'achievements' && type !== 'certifications') {
      return;
    }
    const entry = resumeData[type][index] as Experience | Project | Achievement | Certification; // Assertion for correct type
    let title = '';
    if ('title' in entry) title = entry.title;
    if ('name' in entry) title = entry.name;
    
    setAiExperienceState({
      ...aiExperienceState,
      isOpen: true,
      targetIndex: index,
      targetType: type,
      projectTitle: title,
      projectDescription: '',
      technologiesUsed: (type === 'certifications' && 'technologies' in entry) ? entry.technologies : '',
      generatedBulletPoints: '',
      isGenerating: false,
    });
  };

  const handleGenerateExperience = async () => {
    if (!aiExperienceState.projectDescription.trim()) {
       showNotification({
        title: "Description is missing",
        description: "Please provide a description.",
        type: "error",
      });
      return;
    }

    setAiExperienceState(prev => ({ ...prev, isGenerating: true, generatedBulletPoints: '' }));

    try {
      const result = await generateExperience({
        projectTitle: aiExperienceState.projectTitle,
        projectDescription: aiExperienceState.projectDescription,
        technologiesUsed: aiExperienceState.technologiesUsed,
        userApiKey,
      });
      if (result.bulletPoints) {
        setAiExperienceState(prev => ({ ...prev, generatedBulletPoints: result.bulletPoints, isGenerating: false }));
      } else {
        setAiExperienceState(prev => ({ ...prev, isGenerating: false }));
      }
    } catch {
      setAiExperienceState(prev => ({ ...prev, isGenerating: false }));
      showNotification({
        title: "Generation Failed",
        description: "Something went wrong. If you're using your own API key, please ensure it's correct and has access to the Gemini API.",
        type: "error",
      });
    }
  };

  const handleUseExperience = () => {
    if (aiExperienceState.targetIndex === null || !aiExperienceState.generatedBulletPoints) return;
    
    // Type-safe call based on targetType
    const type = aiExperienceState.targetType;
    if (type === 'experience') {
      handleGenericChange<Experience>(type, aiExperienceState.targetIndex, 'description', aiExperienceState.generatedBulletPoints);
    } else if (type === 'projects') {
      handleGenericChange<Project>(type, aiExperienceState.targetIndex, 'description', aiExperienceState.generatedBulletPoints);
    } else if (type === 'achievements') {
      handleGenericChange<Achievement>(type, aiExperienceState.targetIndex, 'description', aiExperienceState.generatedBulletPoints);
    } else if (type === 'certifications') {
      handleGenericChange<Certification>(type, aiExperienceState.targetIndex, 'description', aiExperienceState.generatedBulletPoints);
    }
    
    setAiExperienceState(prev => ({ ...prev, isOpen: false }));
    showNotification({
      title: "Description Updated!",
      description: "The AI-generated bullet points have been added.",
      type: "success",
    });
  };

  const handleCopyExperienceTemplate = () => {
    if (!aiExperienceState.targetType) return;
    const template = templateTexts[aiExperienceState.targetType].template;
    setAiExperienceState(prev => ({
        ...prev,
        projectDescription: template.description,
        technologiesUsed: template.technologies,
    }));
    showNotification({
        title: "Template Copied!",
        description: "The example text has been copied into the fields below.",
        type: "success",
    });
  };

  const handleSkillAdd = (index: number, skillToAdd: string) => {
    const currentSkills = resumeData.skills[index].skills;
    const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);

    if (!skillsArray.includes(skillToAdd)) {
        const newValue = currentSkills ? `${currentSkills}, ${skillToAdd}` : skillToAdd;
        handleGenericChange<SkillCategoryType>('skills', index, 'skills', newValue);
    }
  };
  
  const renderStepContent = () => {
    const currentStepId = formSteps[currentStep]?.id;
    
    // Handle custom sections
    if (currentStepId?.startsWith('custom-')) {
      const sectionName = formSteps[currentStep].name;
      const sectionData = resumeData.customSections?.[currentStepId] || { title: sectionName, items: [] };
      
      return (
        <div>
          <CardTitle className="text-xl mb-4">{sectionName}</CardTitle>
          <p className="text-sm text-muted-foreground mb-4">
            Add items to your {sectionName} section.
          </p>
          <div className="space-y-4">
            {sectionData.items.map((item, index) => (
              <Card key={item.id} className="p-4 relative bg-background shadow-none border">
                <CardContent className="space-y-4 p-2">
                  <div className="space-y-2">
                    <Label>Content<RequiredIndicator /></Label>
                    <Textarea
                      value={item.content}
                      onChange={(e) => {
                        setResumeData(prev => {
                          const section = prev.customSections?.[currentStepId];
                          if (!section) return prev;
                          const newItems = [...section.items];
                          newItems[index] = { ...newItems[index], content: e.target.value };
                          return {
                            ...prev,
                            customSections: {
                              ...prev.customSections,
                              [currentStepId]: { ...section, items: newItems }
                            }
                          };
                        });
                      }}
                      placeholder={`Enter content for ${sectionName}...`}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-destructive" 
                  onClick={() => {
                    setResumeData(prev => {
                      const section = prev.customSections?.[currentStepId];
                      if (!section) return prev;
                      return {
                        ...prev,
                        customSections: {
                          ...prev.customSections,
                          [currentStepId]: {
                            ...section,
                            items: section.items.filter(i => i.id !== item.id)
                          }
                        }
                      };
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
            <Button 
              variant="outline" 
              onClick={() => {
                setResumeData(prev => {
                  const section = prev.customSections?.[currentStepId] || { title: sectionName, items: [] };
                  return {
                    ...prev,
                    customSections: {
                      ...prev.customSections,
                      [currentStepId]: {
                        ...section,
                        items: [...section.items, { id: `item_${Date.now()}`, content: '' }]
                      }
                    }
                  };
                });
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>
      );
    }
    
    switch (currentStepId) {
        case 'contact':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Contact Information</CardTitle>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name<RequiredIndicator /></Label>
                            <Input id="contact.name" name="name" value={resumeData.contact.name} onChange={handleContactChange} placeholder="John Doe" className={cn(validationErrors['contact.name'] && 'border-destructive')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email<RequiredIndicator /></Label>
                            <Input id="contact.email" name="email" type="email" value={resumeData.contact.email} onChange={handleContactChange} placeholder="john.doe@email.com" className={cn(validationErrors['contact.email'] && 'border-destructive')}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone<RequiredIndicator /></Label>
                            <Input id="contact.phone" name="phone" value={resumeData.contact.phone} onChange={handleContactChange} placeholder="(123) 456-7890" className={cn(validationErrors['contact.phone'] && 'border-destructive')}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location<RequiredIndicator /></Label>
                            <Input id="contact.location" name="location" value={resumeData.contact.location} onChange={handleContactChange} placeholder="City, Country" className={cn(validationErrors['contact.location'] && 'border-destructive')}/>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input 
                                id="linkedin" 
                                name="linkedin" 
                                value={resumeData.contact.linkedin} 
                                onChange={handleContactChange} 
                                placeholder="linkedin.com/in/johndoe"
                                className={cn(validationErrors['contact.linkedin'] && 'border-destructive')}
                            />
                            {validationErrors['contact.linkedin'] && (
                                <p className="text-sm text-destructive">Please enter a valid LinkedIn URL (e.g., linkedin.com/in/johndoe or https://linkedin.com/in/johndoe)</p>
                            )}
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="github">GitHub URL</Label>
                            <Input 
                                id="github" 
                                name="github" 
                                value={resumeData.contact.github} 
                                onChange={handleContactChange} 
                                placeholder="github.com/johndoe"
                                className={cn(validationErrors['contact.github'] && 'border-destructive')}
                            />
                            {validationErrors['contact.github'] && (
                                <p className="text-sm text-destructive">Please enter a valid GitHub URL (e.g., github.com/johndoe or https://github.com/johndoe)</p>
                            )}
                        </div>
                        <div className="sm:col-span-2 space-y-4">
                            <Label>Other Links</Label>
                            <div className="space-y-2">
                                {resumeData.contact.otherLinks.map((link, index) => (
                                    <div key={link.id} className="flex items-end gap-2 p-2 border rounded-md relative">
                                        <div className="grid grid-cols-2 gap-2 flex-1">
                                            <div className="space-y-1">
                                            <Label htmlFor={`link-label-${index}`} className="text-xs">Label<RequiredIndicator /></Label>
                                            <Input id={`contact.otherLinks.${link.id}.label`} value={link.label} onChange={(e) => handleOtherLinkChange(index, 'label', e.target.value)} placeholder="e.g., Portfolio" className={cn(validationErrors[`contact.otherLinks.${link.id}.label`] && 'border-destructive')} />
                                            </div>
                                        <div className="space-y-1">
                                        <Label htmlFor={`link-url-${index}`} className="text-xs">URL<RequiredIndicator /></Label>
                                        <Input id={`contact.otherLinks.${link.id}.url`} value={link.url} onChange={(e) => handleOtherLinkChange(index, 'url', e.target.value)} placeholder="your-portfolio.com" className={cn(validationErrors[`contact.otherLinks.${link.id}.url`] && 'border-destructive')} />
                                        {validationErrors[`contact.otherLinks.${link.id}.url`] && (
                                            <p className="text-xs text-destructive">Please enter a valid URL (e.g., example.com or https://example.com)</p>
                                        )}
                                        </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => removeOtherLink(link.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={addOtherLink}><PlusCircle className="mr-2 h-4 w-4" /> Add Link</Button>
                        </div>
                    </div>
                </div>
            );
        case 'summary':
            return (
                 <div>
                    <CardTitle className="text-xl mb-4">Professional Summary</CardTitle>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="summary">Summary/Objective<RequiredIndicator /></Label>
                        <Dialog open={isSummaryAiDialogOpen} onOpenChange={(isOpen) => { setIsSummaryAiDialogOpen(isOpen); if (!isOpen) setGeneratedSummary(''); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate with AI
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Generate a Student Resume Objective</DialogTitle>
                              <DialogDescription>
                                Provide a few key details, and our AI will craft a professional and personalized objective for you.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <ScrollArea className="max-h-[60vh] p-1">
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="year">Year / Level of Study<RequiredIndicator /></Label>
                                            <Select
                                                name="year"
                                                value={summaryAiState.year}
                                                onValueChange={(value) => {
                                                    setSummaryAiState(prev => ({...prev, year: value}));
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="First-year">First-year</SelectItem>
                                                    <SelectItem value="Second-year">Second-year</SelectItem>
                                                    <SelectItem value="Third-year">Third-year</SelectItem>
                                                    <SelectItem value="Final-year">Final-year</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {summaryAiState.year === 'Other' && (
                                                <Input
                                                    id="otherYear"
                                                    name="otherYear"
                                                    value={otherYear}
                                                    onChange={(e) => setOtherYear(e.target.value)}
                                                    placeholder="Please specify"
                                                    className="mt-2"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="major">Major / Field of Study<RequiredIndicator /></Label>
                                            <Input id="major" name="major" value={summaryAiState.major} onChange={handleSummaryAiStateChange} placeholder="e.g., Computer Science" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="specialization">Specialization (Optional)</Label>
                                            <Input id="specialization" name="specialization" value={summaryAiState.specialization} onChange={handleSummaryAiStateChange} placeholder="e.g., AI/ML" />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="jobType">Desired Role<RequiredIndicator /></Label>
                                            <Input id="jobType" name="jobType" value={summaryAiState.jobType} onChange={handleSummaryAiStateChange} placeholder="e.g., Software Internship" />
                                        </div>
                                        <div className="sm:col-span-2 space-y-2">
                                            <Label htmlFor="skills">Top Skills<RequiredIndicator /></Label>
                                            <Input id="skills" name="skills" value={summaryAiState.skills} onChange={handleSummaryAiStateChange} placeholder="e.g., React, Python, SQL" />
                                        </div>
                                    </div>
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleGenerateSummary();
                                      }}
                                      disabled={
                                        isGeneratingRef.current ||
                                        isGeneratingSummary ||
                                        !summaryAiState.year ||
                                        (summaryAiState.year === 'Other' && !otherYear.trim()) ||
                                        !summaryAiState.major.trim() ||
                                        !summaryAiState.jobType.trim() ||
                                        !summaryAiState.skills.trim()
                                      }
                                      className="w-full"
                                      type="button"
                                    >
                                        {isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        {isGeneratingSummary ? 'Generating...' : 'Generate Objective'}
                                    </Button>
                                    {generatedSummary && (
                                        <div className="space-y-2 rounded-md border bg-muted/50 p-4">
                                        <Label>Generated Objective:</Label>
                                        <p className="text-sm">{generatedSummary}</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            
                            <DialogFooter className="pr-5">
                              <Button variant="secondary" onClick={() => {setIsSummaryAiDialogOpen(false); setGeneratedSummary(''); }}>Cancel</Button>
                              <Button onClick={handleUseSummary} disabled={!generatedSummary}>
                                Use This Objective
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Textarea id="summary" value={resumeData.summary} onChange={handleSummaryChange} placeholder="Write a 2-3 sentence objective. Mention your field of study, key skills, and what you're looking for (e.g., 'a challenging software engineering internship')." rows={5} className={cn(validationErrors['summary'] && 'border-destructive')} />
                    </div>
                </div>
            );
        case 'skills':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Skills</CardTitle>
                     <div className="space-y-4">
                        {resumeData.skills.map((category, index) => {
                        const suggestions = SUGGESTED_SKILLS[category.name] || [];
                        const existingSkills = new Set(category.skills.split(',').map(s => s.trim().toLowerCase()));
                        
                        // Get categories already used by other skill entries (excluding current one)
                        const usedCategories = new Set(
                            resumeData.skills
                                .filter((_, idx) => idx !== index)
                                .map(cat => cat.name.trim().toLowerCase())
                        );
                        
                        // Filter available categories to exclude already used ones (case-insensitive)
                        const availableCategories = SKILL_CATEGORIES.filter(cat => 
                            !usedCategories.has(cat.toLowerCase()) || cat.toLowerCase() === category.name.trim().toLowerCase()
                        );

                        return (
                            <Card key={category.id} className="p-4 relative bg-background shadow-none border">
                            <CardContent className="grid grid-cols-1 gap-4 p-2">
                                <div className="space-y-2">
                                <Label>Skill Category<RequiredIndicator /></Label>
                                <Select
                                    value={SKILL_CATEGORIES.includes(category.name) ? category.name : 'Other'}
                                    onValueChange={(value) => {        
                                        if (value !== 'Other') {
                                            // Check if this category is already used by another skill entry (case-insensitive)
                                            const isDuplicate = resumeData.skills.some((cat, idx) => 
                                                idx !== index && cat.name.trim().toLowerCase() === value.toLowerCase()
                                            );
                                            
                                            if (isDuplicate) {
                                                showNotification({
                                                    title: "Duplicate Category",
                                                    description: `"${value}" is already selected. Please choose a different category.`,
                                                    type: "error",
                                                });
                                                return;
                                            }
                                            
                                            handleGenericChange<SkillCategoryType>('skills', index, 'name', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger className={cn(validationErrors[`skills.${category.id}.name`] && 'border-destructive')}>
                                    <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {availableCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    id={`skills.${category.id}.name`}
                                    value={category.name}
                                    onChange={e => {
                                        const newValue = e.target.value;
                                        // Check if this category name is already used by another skill entry
                                        const isDuplicate = resumeData.skills.some((cat, idx) => 
                                            idx !== index && cat.name.trim().toLowerCase() === newValue.trim().toLowerCase()
                                        );
                                        
                                        if (isDuplicate && newValue.trim() !== '') {
                                            showNotification({
                                                title: "Duplicate Category",
                                                description: `"${newValue.trim()}" is already selected. Please choose a different category name.`,
                                                type: "error",
                                            });
                                            return;
                                        }
                                        
                                        handleGenericChange<SkillCategoryType>('skills', index, 'name', newValue);
                                    }}
                                    placeholder="Or type a custom category"
                                    className={cn("mt-2", validationErrors[`skills.${category.id}.name`] && 'border-destructive')}
                                />
                                <p className="text-xs text-muted-foreground">Select a category or type your own if you choose 'Other'.</p>
                                </div>
                                <div className="space-y-2">
                                <Label>Skills<RequiredIndicator /></Label>
                                <Textarea
                                    id={`skills.${category.id}.skills`}
                                    value={category.skills}
                                    onChange={e => handleGenericChange<SkillCategoryType>('skills', index, 'skills', e.target.value)}
                                    placeholder="e.g., JavaScript, Python, Java"
                                    rows={3}
                                    className={cn(validationErrors[`skills.${category.id}.skills`] && 'border-destructive')}
                                />
                                <p className="text-sm text-muted-foreground">Separate skills with a comma.</p>
                                {suggestions.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                    <Label className="text-xs text-muted-foreground">Suggestions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map(skill => {
                                            const isAdded = existingSkills.has(skill.toLowerCase());
                                            return (
                                            <Button
                                                key={skill}
                                                variant={isAdded ? "secondary" : "outline"}
                                                size="sm"
                                                className="h-7 text-xs px-2"
                                                onClick={() => handleSkillAdd(index, skill)}
                                                disabled={isAdded}
                                            >
                                                {skill}
                                            </Button>
                                            );
                                        })}
                                    </div>
                                    </div>
                                )}
                                </div>
                            </CardContent>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('skills', category.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </Card>
                        )})}
                        <Button variant="outline" onClick={() => addEntry('skills')}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill Category</Button>
                    </div>
                </div>
            );
        case 'education':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Education</CardTitle>
                    <div className="space-y-4">
                    {resumeData.education.map((edu, index) => {
                        const config = educationCategoryConfig[edu.category];
                        if (!config) return null;
                        const error = dateErrors[edu.id];
                        return (
                        <Card key={edu.id} className="p-4 relative bg-background shadow-none border">
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                            <div className="sm:col-span-2 space-y-2">
                                <Label>Education Category<RequiredIndicator /></Label>
                                <Select
                                value={edu.category}
                                onValueChange={(value: EducationCategory) => handleEducationCategoryChange(index, value)}
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="higher">Higher Education (University)</SelectItem>
                                    <SelectItem value="intermediate">Intermediate/Diploma</SelectItem>
                                    <SelectItem value="schooling">Schooling (Class X/XII)</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>{config.fields.school.label}<RequiredIndicator /></Label>
                                <Input id={`education.${edu.id}.school`} value={edu.school} onChange={e => handleGenericChange<Education>('education', index, 'school', e.target.value)} placeholder={config.fields.school.placeholder} className={cn(validationErrors[`education.${edu.id}.school`] && 'border-destructive')} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>{config.fields.degree.label}<RequiredIndicator /></Label>
                                <Input id={`education.${edu.id}.degree`} value={edu.degree} onChange={e => handleGenericChange<Education>('education', index, 'degree', e.target.value)} placeholder={config.fields.degree.placeholder} className={cn(validationErrors[`education.${edu.id}.degree`] && 'border-destructive')} />
                            </div>
                            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{config.fields.startDate.label}<RequiredIndicator /></Label>
                                    <MonthYearPicker value={edu.startDate} onChange={value => handleGenericChange<Education>('education', index, 'startDate', value)} hasError={!!error || validationErrors[`education.${edu.id}.startDate`]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{config.fields.endDate.label}<RequiredIndicator /></Label>
                                    <MonthYearPicker value={edu.endDate} onChange={value => handleGenericChange<Education>('education', index, 'endDate', value)} hasError={!!error || validationErrors[`education.${edu.id}.endDate`]} />
                                </div>
                            </div>
                            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
                            <div className="space-y-2">
                                <Label>{config.fields.grades.label}</Label>
                                <Input id={`education.${edu.id}.grades`} value={edu.grades} onChange={e => handleGenericChange<Education>('education', index, 'grades', e.target.value)} placeholder={config.fields.grades.placeholder} />
                            </div>
                            <div className="space-y-2">
                                <Label>{config.fields.city.label}<RequiredIndicator /></Label>
                                <Input id={`education.${edu.id}.city`} value={edu.city} onChange={e => handleGenericChange<Education>('education', index, 'city', e.target.value)} placeholder={config.fields.city.placeholder} className={cn(validationErrors[`education.${edu.id}.city`] && 'border-destructive')} />
                            </div>
                            </CardContent>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('education', edu.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </Card>
                        );
                    })}
                    <Button variant="outline" onClick={() => addEntry('education')}><PlusCircle className="mr-2 h-4 w-4" /> Add Another Qualification</Button>
                    </div>
                </div>
            );
        case 'projects':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Projects</CardTitle>
                    <div className="space-y-4">
                        {resumeData.projects.map((proj, index) => {
                            const error = dateErrors[proj.id];
                             const isOtherSelected = proj.projectType === 'Other' || !PROJECT_TYPES.includes(proj.projectType);
                            return (
                            <Card key={proj.id} className="p-4 relative bg-background shadow-none border">
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                                <div className="space-y-2">
                                    <Label>Project Title<RequiredIndicator /></Label>
                                    <Input id={`projects.${proj.id}.title`} value={proj.title} onChange={e => handleGenericChange<Project>('projects', index, 'title', e.target.value)} placeholder="e.g., Personal Portfolio Website" className={cn(validationErrors[`projects.${proj.id}.title`] && 'border-destructive')} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Link (Optional)</Label>
                                    <Input 
                                        value={proj.link || ''} 
                                        onChange={e => handleGenericChange<Project>('projects', index, 'link', e.target.value)} 
                                        placeholder="e.g., github.com/user/repo"
                                        className={cn(validationErrors[`projects.${proj.id}.link`] && 'border-destructive')}
                                    />
                                    {validationErrors[`projects.${proj.id}.link`] && (
                                        <p className="text-sm text-destructive">Please enter a valid URL (e.g., github.com/user/repo or https://example.com)</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Type<RequiredIndicator /></Label>
                                    <Select
                                        value={PROJECT_TYPES.includes(proj.projectType) ? proj.projectType : 'Other'}
                                        onValueChange={(value) => {
                                            handleGenericChange<Project>('projects', index, 'projectType', value);
                                        }}
                                    >
                                        <SelectTrigger className={cn(validationErrors[`projects.${proj.id}.projectType`] && 'border-destructive')}>
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROJECT_TYPES.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isOtherSelected && (
                                        <Input
                                            id={`projects.${proj.id}.projectType`}
                                            value={proj.projectType === 'Other' ? '' : proj.projectType}
                                            onChange={e => handleGenericChange<Project>('projects', index, 'projectType', e.target.value)}
                                            placeholder="Please specify type"
                                            className={cn("mt-2", validationErrors[`projects.${proj.id}.projectType`] && 'border-destructive')}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Organization / Affiliation<RequiredIndicator /></Label>
                                    <Input id={`projects.${proj.id}.organization`} value={proj.organization} onChange={e => handleGenericChange<Project>('projects', index, 'organization', e.target.value)} placeholder="e.g., University Name" className={cn(validationErrors[`projects.${proj.id}.organization`] && 'border-destructive')}/>
                                </div>
                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date<RequiredIndicator /></Label>
                                            <MonthYearPicker value={proj.startDate} onChange={value => handleGenericChange<Project>('projects', index, 'startDate', value)} hasError={!!error || validationErrors[`projects.${proj.id}.startDate`]}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date<RequiredIndicator /></Label>
                                            <MonthYearPicker value={proj.endDate} onChange={value => handleGenericChange<Project>('projects', index, 'endDate', value)} hasError={!!error || validationErrors[`projects.${proj.id}.endDate`]} />
                                        </div>
                                    </div>
                                    {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
                                <div className="sm:col-span-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className='flex items-center gap-2'>
                                            <Label>Bullet Points / Description<RequiredIndicator /></Label>
                                            <BulletPointTooltip />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => openExperienceAiDialog('projects', index)}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate with AI
                                        </Button>
                                    </div>
                                    <Textarea id={`projects.${proj.id}.description`} value={proj.description} onChange={e => handleGenericChange<Project>('projects', index, 'description', e.target.value)} placeholder="- Developed a feature that improved performance by 15%.&#10;- Built a full-stack application using React and Node.js." rows={5} className={cn(validationErrors[`projects.${proj.id}.description`] && 'border-destructive')} />
                                </div>
                            </CardContent>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('projects', proj.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </Card>
                        )})}
                        <Button variant="outline" onClick={() => addEntry('projects')}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
                    </div>
                </div>
            );
        case 'experience':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Work Experience</CardTitle>
                    <div className="space-y-4">
                        {resumeData.experience.map((exp, index) => {
                            const error = dateErrors[exp.id];
                            return (
                            <Card key={exp.id} className="p-4 relative bg-background shadow-none border">
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                                <div className="space-y-2">
                                    <Label>Job Title/Role<RequiredIndicator /></Label>
                                    <Input id={`experience.${exp.id}.title`} value={exp.title} onChange={e => handleGenericChange<Experience>('experience', index, 'title', e.target.value)} placeholder="e.g., Software Engineering Intern" className={cn(validationErrors[`experience.${exp.id}.title`] && 'border-destructive')} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company<RequiredIndicator /></Label>
                                    <Input id={`experience.${exp.id}.company`} value={exp.company} onChange={e => handleGenericChange<Experience>('experience', index, 'company', e.target.value)} placeholder="e.g., Tech Corp" className={cn(validationErrors[`experience.${exp.id}.company`] && 'border-destructive')}/>
                                </div>
                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date<RequiredIndicator /></Label>
                                            <MonthYearPicker value={exp.startDate} onChange={value => handleGenericChange<Experience>('experience', index, 'startDate', value)} hasError={!!error || validationErrors[`experience.${exp.id}.startDate`]}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date<RequiredIndicator /></Label>
                                            <MonthYearPicker value={exp.endDate} onChange={value => handleGenericChange<Experience>('experience', index, 'endDate', value)} hasError={!!error || validationErrors[`experience.${exp.id}.endDate`]}/>
                                        </div>
                                    </div>
                                    {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
                                <div className="sm:col-span-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className='flex items-center gap-2'>
                                        <Label>Description<RequiredIndicator /></Label>
                                        <BulletPointTooltip />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => openExperienceAiDialog('experience', index)}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate with AI
                                        </Button>
                                    </div>
                                    <Textarea id={`experience.${exp.id}.description`} value={exp.description} onChange={e => handleGenericChange<Experience>('experience', index, 'description', e.target.value)} placeholder="- Responsible for developing feature X, which led to a 15% increase in user engagement." rows={5} className={cn(validationErrors[`experience.${exp.id}.description`] && 'border-destructive')} />
                                </div>
                            </CardContent>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('experience', exp.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </Card>
                        )})}
                        <Button variant="outline" onClick={() => addEntry('experience')}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                    </div>
                </div>
            );
        case 'certifications':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Certifications</CardTitle>
                    <div className="space-y-4">
                    {resumeData.certifications.map((cert, index) => (
                        <Card key={cert.id} className="p-4 relative bg-background shadow-none border">
                        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                            <div className="space-y-2">
                            <Label>Certification Name<RequiredIndicator /></Label>
                            <Input id={`certifications.${cert.id}.name`} value={cert.name} onChange={e => handleGenericChange<Certification>('certifications', index, 'name', e.target.value)} placeholder="e.g., Google Cloud Certified" className={cn(validationErrors[`certifications.${cert.id}.name`] && 'border-destructive')} />
                            </div>
                            <div className="space-y-2">
                            <Label>Issuing Body<RequiredIndicator /></Label>
                            <Input id={`certifications.${cert.id}.issuer`} value={cert.issuer} onChange={e => handleGenericChange<Certification>('certifications', index, 'issuer', e.target.value)} placeholder="e.g., Google" className={cn(validationErrors[`certifications.${cert.id}.issuer`] && 'border-destructive')} />
                            </div>
                            <div className="space-y-2">
                            <Label>Date Issued<RequiredIndicator /></Label>
                            <MonthYearPicker value={cert.date} onChange={value => handleGenericChange<Certification>('certifications', index, 'date', value)} hasError={validationErrors[`certifications.${cert.id}.date`]}/>
                            </div>
                            <div className="space-y-2">
                            <Label>Certification Link (Optional)</Label>
                            <Input 
                                value={cert.link || ''} 
                                onChange={e => handleGenericChange<Certification>('certifications', index, 'link', e.target.value)} 
                                placeholder="e.g., your-credential-link.com"
                                className={cn(validationErrors[`certifications.${cert.id}.link`] && 'border-destructive')}
                            />
                            {validationErrors[`certifications.${cert.id}.link`] && (
                                <p className="text-sm text-destructive">Please enter a valid URL (e.g., example.com or https://example.com)</p>
                            )}
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <div className="flex justify-between items-center">
                                <div className='flex items-center gap-2'>
                                    <Label>Description<RequiredIndicator /></Label>
                                    <BulletPointTooltip />
                                    </div>
                                <Button variant="outline" size="sm" onClick={() => openExperienceAiDialog('certifications', index)}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate with AI
                                    </Button>
                                </div>
                                <Textarea id={`certifications.${cert.id}.description`} value={cert.description} onChange={e => handleGenericChange<Certification>('certifications', index, 'description', e.target.value)} placeholder="- Briefly describe what you learned or achieved." rows={3} className={cn(validationErrors[`certifications.${cert.id}.description`] && 'border-destructive')}/>
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                            <Label>Technologies/Skills Covered<RequiredIndicator /></Label>
                            <Textarea
                                id={`certifications.${cert.id}.technologies`}
                                value={cert.technologies}
                                onChange={e => handleGenericChange<Certification>('certifications', index, 'technologies', e.target.value)}
                                placeholder="e.g., VPC, IAM, BigQuery, Cloud Functions"
                                rows={2}
                                className={cn(validationErrors[`certifications.${cert.id}.technologies`] && 'border-destructive')}
                            />
                            <p className="text-sm text-muted-foreground">Separate items with a comma.</p>
                            </div>
                        </CardContent>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('certifications', cert.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </Card>
                    ))}
                    <Button variant="outline" onClick={() => addEntry('certifications')}><PlusCircle className="mr-2 h-4 w-4" /> Add Certification</Button>
                    </div>
                </div>
            );
        case 'achievements':
            return (
                <div>
                    <CardTitle className="text-xl mb-4">Achievements & Activities</CardTitle>
                    <div className="space-y-4">
                        {resumeData.achievements.map((ach, index) => {
                        const config = achievementCategoryConfig[ach.category as AchievementCategory] || achievementCategoryConfig.other;
                        const isOtherSelected = ach.category === 'other' || !ACHIEVEMENT_CATEGORIES.includes(ach.category as AchievementCategory);
                        return (
                            <Card key={ach.id} className="p-4 relative bg-background shadow-none border">
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                                <div className="sm:col-span-2 space-y-2">
                                    <Label>Category<RequiredIndicator /></Label>
                                    <Select
                                        value={ACHIEVEMENT_CATEGORIES.includes(ach.category as AchievementCategory) ? ach.category : 'other'}
                                        onValueChange={(value) => handleAchievementCategoryChange(index, value)}
                                    >
                                        <SelectTrigger className={cn(validationErrors[`achievements.${ach.id}.category`] && 'border-destructive')}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hackathon">Hackathon</SelectItem>
                                            <SelectItem value="workshop">Workshop</SelectItem>
                                            <SelectItem value="poster">Poster Presentation</SelectItem>
                                            <SelectItem value="techfest">Techfest Participation</SelectItem>
                                            <SelectItem value="leadership">Leadership</SelectItem>
                                            <SelectItem value="volunteering">Volunteering</SelectItem>
                                            <SelectItem value="publication">Publication</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isOtherSelected && (
                                        <Input
                                            id={`achievements.${ach.id}.category`}
                                            value={ach.category === 'other' ? '' : ach.category}
                                            onChange={e => handleAchievementCategoryChange(index, e.target.value)}
                                            placeholder="Please specify category"
                                            className={cn("mt-2", validationErrors[`achievements.${ach.id}.category`] && 'border-destructive')}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                <Label>{config.nameLabel}<RequiredIndicator /></Label>
                                <Input id={`achievements.${ach.id}.name`} value={ach.name} onChange={e => handleGenericChange<Achievement>('achievements', index, 'name', e.target.value)} placeholder={`e.g., ${config.title} Name`} className={cn(validationErrors[`achievements.${ach.id}.name`] && 'border-destructive')}/>
                                </div>
                                <div className="space-y-2">
                                <Label>{config.contextLabel}<RequiredIndicator /></Label>
                                <Input id={`achievements.${ach.id}.context`} value={ach.context} onChange={e => handleGenericChange<Achievement>('achievements', index, 'context', e.target.value)} placeholder="e.g., National Level" className={cn(validationErrors[`achievements.${ach.id}.context`] && 'border-destructive')}/>
                                </div>
                                <div className="space-y-2">
                                <Label>Date<RequiredIndicator /></Label>
                                <MonthYearPicker value={ach.date} onChange={value => handleGenericChange<Achievement>('achievements', index, 'date', value)} hasError={validationErrors[`achievements.${ach.id}.date`]}/>
                                </div>
                                <div className="space-y-2">
                                <Label>Achievement Link (Optional)</Label>
                                <Input 
                                    value={ach.link || ''} 
                                    onChange={e => handleGenericChange<Achievement>('achievements', index, 'link', e.target.value)} 
                                    placeholder="e.g., your-project-link.com"
                                    className={cn(validationErrors[`achievements.${ach.id}.link`] && 'border-destructive')}
                                />
                                {validationErrors[`achievements.${ach.id}.link`] && (
                                    <p className="text-sm text-destructive">Please enter a valid URL (e.g., example.com or https://example.com)</p>
                                )}
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                    <div className='flex items-center gap-2'>
                                        <Label>Description<RequiredIndicator /></Label>
                                        <BulletPointTooltip />
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => openExperienceAiDialog('achievements', index)}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate with AI
                                    </Button>
                                    </div>
                                    <Textarea id={`achievements.${ach.id}.description`} value={ach.description} onChange={e => handleGenericChange<Achievement>('achievements', index, 'description', e.target.value)} placeholder="- Describe the achievement, e.g., 'Developed a solution for urban waste management that won 1st place out of 500+ teams.'" rows={3} className={cn(validationErrors[`achievements.${ach.id}.description`] && 'border-destructive')}/>
                                </div>
                            </CardContent>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('achievements', ach.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </Card>
                        )
                        })}
                        <Button variant="outline" onClick={() => addEntry('achievements')}><PlusCircle className="mr-2 h-4 w-4" /> Add Achievement/Activity</Button>
                    </div>
                </div>
            );
        default:
            return null;
    }
  };


  return (
    <div className="w-full">
        <Stepper
            steps={formSteps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            onAddSection={handleAddCustomSection}
            onDeleteSection={handleDeleteCustomSection}
        />
        <Card className="mt-4">
            <CardContent className="p-6">
                 {renderStepContent()}
                 <div className="mt-6 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={goToPreviousStep}
                        disabled={currentStep === 0}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        onClick={goToNextStep}
                        disabled={currentStep === formSteps.length - 1}
                    >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
      
       {/* Add Custom Section Dialog */}
       <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Section</DialogTitle>
              <DialogDescription>
                Add a custom section to your resume (e.g., Publications, Languages, Volunteer Work, etc.)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="section-name">Section Name</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Publications, Languages, Awards"
                  onKeyDown={(e) => e.key === 'Enter' && confirmAddSection()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAddSection} disabled={!newSectionName.trim()}>
                Add Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

       <Dialog open={aiExperienceState.isOpen} onOpenChange={(isOpen) => setAiExperienceState(prev => ({ ...prev, isOpen }))}>
           <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{templateTexts[aiExperienceState.targetType]?.title || "Generate Description"}</DialogTitle>
                <DialogDescription>
                    Provide some details, and AI will generate professional bullet points using the STAR method.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] p-1">
                <div className="py-4 px-3 space-y-4">
                    <div className="p-4 rounded-md bg-muted/70 border text-sm relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopyExperienceTemplate}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <p className="font-semibold text-muted-foreground mb-2">Example Template:</p>
                        <p className="mb-2 pr-8"><span className="font-medium">Description:</span> {templateTexts[aiExperienceState.targetType]?.template.description}</p>
                        <p className="pr-8"><span className="font-medium">{templateTexts[aiExperienceState.targetType]?.techLabel}:</span> {templateTexts[aiExperienceState.targetType]?.template.technologies}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Title / Name<RequiredIndicator /></Label>
                      <Input
                        value={aiExperienceState.projectTitle}
                        readOnly
                        disabled
                        className="font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{templateTexts[aiExperienceState.targetType]?.descriptionLabel}<RequiredIndicator /></Label>
                      <Textarea
                        value={aiExperienceState.projectDescription}
                        onChange={(e) => setAiExperienceState(prev => ({ ...prev, projectDescription: e.target.value }))}
                        placeholder={templateTexts[aiExperienceState.targetType]?.descriptionPlaceholder}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{templateTexts[aiExperienceState.targetType]?.techLabel}</Label>
                      <Input
                        value={aiExperienceState.technologiesUsed}
                        onChange={(e) => setAiExperienceState(prev => ({ ...prev, technologiesUsed: e.target.value }))}
                        placeholder={templateTexts[aiExperienceState.targetType]?.techPlaceholder}
                      />
                    </div>
                    <Button onClick={handleGenerateExperience} disabled={aiExperienceState.isGenerating} className="w-full">
                      {aiExperienceState.isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Generate Description
                    </Button>
                    {aiExperienceState.generatedBulletPoints && (
                      <div className="space-y-2 rounded-md border bg-muted/50 p-4">
                        <Label>Generated Bullet Points:</Label>
                        <Textarea
                          className="text-sm"
                          readOnly
                          value={aiExperienceState.generatedBulletPoints}
                          rows={6}
                        />
                      </div>
                    )}
                </div>
              </ScrollArea>
              <DialogFooter className="pr-5">
                <Button variant="secondary" onClick={() => setAiExperienceState(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                <Button onClick={handleUseExperience} disabled={!aiExperienceState.generatedBulletPoints}>
                  Use This Description
                </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    