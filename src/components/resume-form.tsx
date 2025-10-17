
"use client";

import React, { useState } from 'react';
import { useResume } from '@/lib/store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Sparkles, Loader2, Copy } from 'lucide-react';
import type { Education, Experience, EducationCategory } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { generateSummary } from '@/ai/flows/generate-summary-flow';
import { generateExperience } from '@/ai/flows/generate-experience-flow';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const educationCategoryConfig = {
  schooling: {
    title: 'Schooling (Class X/XII)',
    fields: {
      school: { label: 'School Name', placeholder: 'e.g., Delhi Public School' },
      degree: { label: 'Board (e.g., CBSE, ICSE) or Class', placeholder: 'e.g., CBSE Class XII' },
      date: { label: 'Year of Passing', placeholder: 'e.g., 2021' },
      city: { label: 'City / State', placeholder: 'e.g., New Delhi, Delhi' },
      grades: { label: 'Grades / Percentage', placeholder: 'e.g., 95% or 10 CGPA' },
    }
  },
  intermediate: {
    title: 'Intermediate / Diploma',
    fields: {
      school: { label: 'College / Institute Name', placeholder: 'e.g., Sri Chaitanya Junior College' },
      degree: { label: 'Group / Specialization', placeholder: 'e.g., MPC' },
      date: { label: 'Year of Passing', placeholder: 'e.g., 2023' },
      city: { label: 'City / State', placeholder: 'e.g., Hyderabad, Telangana' },
      grades: { label: 'Grades / Percentage', placeholder: 'e.g., 98%' },
    }
  },
  higher: {
    title: 'Higher Education (University)',
    fields: {
      school: { label: 'University / College Name', placeholder: 'e.g., Indian Institute of Technology Bombay' },
      degree: { label: 'Degree & Major', placeholder: 'e.g., B.Tech in Computer Science' },
      date: { label: 'Expected Graduation Year', placeholder: 'e.g., May 2027' },
      city: { label: 'City / State', placeholder: 'e.g., Mumbai, Maharashtra' },
      grades: { label: 'CGPA / Percentage', placeholder: 'e.g., 8.5 CGPA' },
    }
  }
};

type AiExperienceState = {
  isOpen: boolean;
  projectTitle: string;
  projectDescription: string;
  technologiesUsed: string;
  generatedBulletPoints: string;
  isGenerating: boolean;
  targetIndex: number | null;
};

export function ResumeForm() {
  const { resumeData, setResumeData } = useResume();
  const [isSummaryAiDialogOpen, setIsSummaryAiDialogOpen] = useState(false);
  const [summaryAiDetails, setSummaryAiDetails] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { toast } = useToast();

  const [aiExperienceState, setAiExperienceState] = useState<AiExperienceState>({
    isOpen: false,
    projectTitle: '',
    projectDescription: '',
    technologiesUsed: '',
    generatedBulletPoints: '',
    isGenerating: false,
    targetIndex: null,
  });

  const templateText = "I am a [Your Year, e.g., final-year] [Your Major] student specializing in [Your Specialization]. I have experience with [Your Top 2-3 Skills, e.g., React, Python, and SQL]. I am seeking a [Job Type, e.g., software engineering internship] to apply my skills and contribute to a challenging environment.";

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeData(prev => ({ ...prev, contact: { ...prev.contact, [e.target.name]: e.target.value } }));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeData(prev => ({ ...prev, skills: e.target.value }));
  };

  const handleGenericChange = <T extends Education | Experience>(
    section: 'education' | 'experience',
    index: number,
    field: keyof T,
    value: string
  ) => {
    setResumeData(prev => {
      const newSection = [...prev[section]] as T[];
      newSection[index] = { ...newSection[index], [field]: value };
      return { ...prev, [section]: newSection };
    });
  };

  const handleEducationCategoryChange = (index: number, value: EducationCategory) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], category: value };
      return { ...prev, education: newEducation };
    });
  };

  const addEntry = (section: 'education' | 'experience') => {
    setResumeData(prev => {
      const newEntry = section === 'education'
        ? { id: `edu_${Date.now()}`, category: 'higher' as EducationCategory, school: '', degree: '', date: '', city: '', grades: '' }
        : { id: `exp_${Date.now()}`, title: '', company: '', startDate: '', endDate: '', description: '' };
      return { ...prev, [section]: [...prev[section], newEntry] };
    });
  };
  
  const removeEntry = (section: 'education' | 'experience', id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id),
    }));
  };

  const handleGenerateSummary = async () => {
    if (!summaryAiDetails.trim()) {
      toast({
        title: "Details are empty",
        description: "Please provide some details to generate a summary.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingSummary(true);
    setGeneratedSummary('');
    try {
      const result = await generateSummary({ details: summaryAiDetails });
      if (result.summary) {
        setGeneratedSummary(result.summary);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Something went wrong while generating the summary. Check your server configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleUseSummary = () => {
    setResumeData(prev => ({ ...prev, summary: generatedSummary }));
    setIsSummaryAiDialogOpen(false);
    toast({
      title: "Summary Updated!",
      description: "The AI-generated summary has been added to your resume.",
    });
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(templateText).then(() => {
      toast({
        title: "Template Copied!",
        description: "Paste it in the text area below to get started.",
      });
    });
  };
  
  const openExperienceAiDialog = (index: number) => {
    const experience = resumeData.experience[index];
    setAiExperienceState({
      ...aiExperienceState,
      isOpen: true,
      targetIndex: index,
      projectTitle: experience.title,
      // Clear previous results
      projectDescription: '',
      technologiesUsed: '',
      generatedBulletPoints: '',
    });
  };

  const handleGenerateExperience = async () => {
    if (!aiExperienceState.projectDescription.trim() || !aiExperienceState.technologiesUsed.trim()) {
      toast({
        title: "Details are missing",
        description: "Please provide a description and technologies used.",
        variant: "destructive",
      });
      return;
    }

    setAiExperienceState(prev => ({ ...prev, isGenerating: true, generatedBulletPoints: '' }));

    try {
      const result = await generateExperience({
        projectTitle: aiExperienceState.projectTitle,
        projectDescription: aiExperienceState.projectDescription,
        technologiesUsed: aiExperienceState.technologiesUsed,
      });
      if (result.bulletPoints) {
        setAiExperienceState(prev => ({ ...prev, generatedBulletPoints: result.bulletPoints }));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Something went wrong while generating the description. Check your server configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setAiExperienceState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleUseExperience = () => {
    if (aiExperienceState.targetIndex === null || !aiExperienceState.generatedBulletPoints) return;
    
    handleGenericChange('experience', aiExperienceState.targetIndex, 'description', aiExperienceState.generatedBulletPoints);
    
    setAiExperienceState(prev => ({ ...prev, isOpen: false }));
    toast({
      title: "Description Updated!",
      description: "The AI-generated bullet points have been added.",
    });
  };


  const formSections = [
    {
      value: "contact",
      title: "Contact Information",
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={resumeData.contact.name} onChange={handleContactChange} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={resumeData.contact.email} onChange={handleContactChange} placeholder="john.doe@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={resumeData.contact.phone} onChange={handleContactChange} placeholder="(123) 456-7890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" name="linkedin" value={resumeData.contact.linkedin} onChange={handleContactChange} placeholder="linkedin.com/in/johndoe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input id="github" name="github" value={resumeData.contact.github} onChange={handleContactChange} placeholder="github.com/johndoe" />
          </div>
        </div>
      )
    },
    {
      value: "summary",
      title: "Professional Summary",
      content: (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="summary">Summary/Objective</Label>
            <Dialog open={isSummaryAiDialogOpen} onOpenChange={setIsSummaryAiDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Generate a Student Resume Objective</DialogTitle>
                  <DialogDescription>
                    To get the best result, provide details about your studies, any relevant experience (like internships or projects), your top skills, and what kind of role you're looking for.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                     <div className="p-3 rounded-md bg-muted/50 border border-muted-foreground/20 text-sm relative">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={handleCopyTemplate}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <p className="font-semibold text-muted-foreground mb-1">Example Template:</p>
                        <p>{templateText}</p>
                    </div>
                    <Label htmlFor="ai-details" className="mt-4 block">
                      Your key details
                    </Label>
                    <Textarea
                      id="ai-details"
                      value={summaryAiDetails}
                      onChange={(e) => setSummaryAiDetails(e.target.value)}
                      placeholder="Paste and edit the template above, or write your own details here..."
                      rows={5}
                    />
                  </div>
                  <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
                    {isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Objective
                  </Button>
                  {generatedSummary && (
                    <div className="space-y-2 rounded-md border bg-muted/50 p-4">
                      <Label>Generated Objective:</Label>
                      <p className="text-sm">{generatedSummary}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsSummaryAiDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUseSummary} disabled={!generatedSummary}>
                    Use This Objective
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Textarea id="summary" value={resumeData.summary} onChange={handleSummaryChange} placeholder="Write a 2-3 sentence objective. Mention your field of study, key skills, and what you're looking for (e.g., 'a challenging software engineering internship')." rows={5} />
        </div>
      )
    },
    {
      value: "education",
      title: "Education",
      content: (
        <div className="space-y-4">
          {resumeData.education.map((edu, index) => {
            const config = educationCategoryConfig[edu.category];
            if (!config) return null;
            return (
              <Card key={edu.id} className="p-4 relative">
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Education Category</Label>
                    <Select
                      value={edu.category}
                      onValueChange={(value: EducationCategory) => handleEducationCategoryChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="schooling">Schooling (Class X/XII)</SelectItem>
                        <SelectItem value="intermediate">Intermediate/Diploma</SelectItem>
                        <SelectItem value="higher">Higher Education (University)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{config.fields.school.label}</Label>
                    <Input value={edu.school} onChange={e => handleGenericChange('education', index, 'school', e.target.value)} placeholder={config.fields.school.placeholder} />
                  </div>
                  <div className="space-y-2">
                    <Label>{config.fields.degree.label}</Label>
                    <Input value={edu.degree} onChange={e => handleGenericChange('education', index, 'degree', e.target.value)} placeholder={config.fields.degree.placeholder} />
                  </div>
                  <div className="space-y-2">
                    <Label>{config.fields.date.label}</Label>
                    <Input value={edu.date} onChange={e => handleGenericChange('education', index, 'date', e.target.value)} placeholder={config.fields.date.placeholder} />
                  </div>
                  <div className="space-y-2">
                    <Label>{config.fields.city.label}</Label>
                    <Input value={edu.city} onChange={e => handleGenericChange('education', index, 'city', e.target.value)} placeholder={config.fields.city.placeholder} />
                  </div>
                   <div className="space-y-2">
                    <Label>{config.fields.grades.label}</Label>
                    <Input value={edu.grades} onChange={e => handleGenericChange('education', index, 'grades', e.target.value)} placeholder={config.fields.grades.placeholder} />
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
      )
    },
    {
        value: "experience",
        title: "Experience / Projects",
        content: (
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
                <Card key={exp.id} className="p-4 relative">
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                      <div className="space-y-2">
                          <Label>Job Title/Role</Label>
                          <Input value={exp.title} onChange={e => handleGenericChange('experience', index, 'title', e.target.value)} placeholder="e.g., Web Dev Project or Software Intern" />
                      </div>
                      <div className="space-y-2">
                          <Label>Company/Organization</Label>
                          <Input value={exp.company} onChange={e => handleGenericChange('experience', index, 'company', e.target.value)} placeholder="e.g., Personal Project or Tech Corp" />
                      </div>
                      <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input value={exp.startDate} onChange={e => handleGenericChange('experience', index, 'startDate', e.target.value)} placeholder="Jan 2024" />
                      </div>
                      <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input value={exp.endDate} onChange={e => handleGenericChange('experience', index, 'endDate', e.target.value)} placeholder="Present" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Bullet Points / Description</Label>
                            <Button variant="outline" size="sm" onClick={() => openExperienceAiDialog(index)}>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate with AI
                            </Button>
                          </div>
                          <Textarea value={exp.description} onChange={e => handleGenericChange('experience', index, 'description', e.target.value)} placeholder="- Developed a feature that improved performance by 15%.&#10;- Built a full-stack application using React and Node.js." rows={5} />
                      </div>
                  </CardContent>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('experience', exp.id)}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
            ))}
            <Button variant="outline" onClick={() => addEntry('experience')}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
             <Dialog open={aiExperienceState.isOpen} onOpenChange={(isOpen) => setAiExperienceState(prev => ({ ...prev, isOpen }))}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                    <DialogTitle>Generate Project/Experience Description</DialogTitle>
                    <DialogDescription>
                        Provide some details, and AI will generate professional bullet points using the STAR method.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Project Title / Role</Label>
                        <Input
                          value={aiExperienceState.projectTitle}
                          readOnly
                          disabled
                          className="font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brief Description or Responsibilities</Label>
                        <Textarea
                          value={aiExperienceState.projectDescription}
                          onChange={(e) => setAiExperienceState(prev => ({ ...prev, projectDescription: e.target.value }))}
                          placeholder="e.g., 'Built a social media dashboard to track user engagement' or 'Responsible for front-end development of the checkout page'."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Technologies Used</Label>
                        <Input
                          value={aiExperienceState.technologiesUsed}
                          onChange={(e) => setAiExperienceState(prev => ({ ...prev, technologiesUsed: e.target.value }))}
                          placeholder="e.g., React, TypeScript, Node.js, Firebase"
                        />
                      </div>
                      <Button onClick={handleGenerateExperience} disabled={aiExperienceState.isGenerating}>
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
                    <DialogFooter>
                      <Button variant="secondary" onClick={() => setAiExperienceState(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                      <Button onClick={handleUseExperience} disabled={!aiExperienceState.generatedBulletPoints}>
                        Use This Description
                      </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        )
    },
    {
        value: "skills",
        title: "Skills",
        content: (
            <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" value={resumeData.skills} onChange={handleSkillsChange} placeholder="JavaScript, React, Node.js, Python..." />
                <p className="text-sm text-muted-foreground">Separate skills with a comma.</p>
            </div>
        )
    },
  ];

  return (
    <Accordion type="multiple" defaultValue={["contact", "summary", "education", "experience", "skills"]} className="w-full space-y-4">
      {formSections.map(section => (
        <AccordionItem key={section.value} value={section.value} className="border-none">
          <Card>
            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="px-6">
                {section.content}
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
