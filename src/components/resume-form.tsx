"use client";

import React, { useState } from 'react';
import { useResume } from '@/lib/store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Sparkles, Loader2 } from 'lucide-react';
import type { Education, Experience } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { generateSummary } from '@/ai/flows/generate-summary-flow';
import { useToast } from '@/hooks/use-toast';

export function ResumeForm() {
  const { resumeData, setResumeData } = useResume();
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiDetails, setAiDetails] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  const addEntry = (section: 'education' | 'experience') => {
    setResumeData(prev => {
      const newEntry = section === 'education'
        ? { id: `edu_${Date.now()}`, school: '', degree: '', date: '', city: '' }
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
    const apiKey = localStorage.getItem('google-ai-api-key');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Google AI API key in the settings first.",
        variant: "destructive",
      });
      return;
    }

    if (!aiDetails.trim()) {
      toast({
        title: "Details are empty",
        description: "Please provide some details to generate a summary.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedSummary('');
    try {
      const result = await generateSummary({ details: aiDetails, apiKey });
      if (result.summary) {
        setGeneratedSummary(result.summary);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Something went wrong while generating the summary. Check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSummary = () => {
    setResumeData(prev => ({ ...prev, summary: generatedSummary }));
    setIsAiDialogOpen(false);
    toast({
      title: "Summary Updated!",
      description: "The AI-generated summary has been added to your resume.",
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
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
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
                    Create a powerful objective for internships and your first job. Your API key must be set in the main settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-details">
                      Key details (e.g., your major, an internship, key skills, career goals)
                    </Label>
                    <Textarea
                      id="ai-details"
                      value={aiDetails}
                      onChange={(e) => setAiDetails(e.target.value)}
                      placeholder="e.g., Computer Science major, proficient in Python and React, seeking a software engineering internship to apply my skills in a real-world setting."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
                  <Button variant="secondary" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUseSummary} disabled={!generatedSummary}>
                    Use This Objective
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Textarea id="summary" value={resumeData.summary} onChange={handleSummaryChange} placeholder="A brief summary of your career goals and qualifications..." rows={5} />
        </div>
      )
    },
    {
      value: "education",
      title: "Education",
      content: (
        <div className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <Card key={edu.id} className="p-4 relative">
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-2">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input value={edu.school} onChange={e => handleGenericChange('education', index, 'school', e.target.value)} placeholder="University of Example" />
                </div>
                <div className="space-y-2">
                  <Label>Degree/Major</Label>
                  <Input value={edu.degree} onChange={e => handleGenericChange('education', index, 'degree', e.target.value)} placeholder="B.S. in Computer Science" />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Date</Label>
                  <Input value={edu.date} onChange={e => handleGenericChange('education', index, 'date', e.target.value)} placeholder="May 2024" />
                </div>
                <div className="space-y-2">
                  <Label>City/State</Label>
                  <Input value={edu.city} onChange={e => handleGenericChange('education', index, 'city', e.target.value)} placeholder="Example City, ES" />
                </div>
              </CardContent>
              {resumeData.education.length > 1 &&
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('education', edu.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            </Card>
          ))}
          <Button variant="outline" onClick={() => addEntry('education')}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
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
                        <Input value={exp.title} onChange={e => handleGenericChange('experience', index, 'title', e.target.value)} placeholder="Software Engineer" />
                    </div>
                    <div className="space-y-2">
                        <Label>Company/Organization</Label>
                        <Input value={exp.company} onChange={e => handleGenericChange('experience', index, 'company', e.target.value)} placeholder="Tech Corp" />
                    </div>
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input value={exp.startDate} onChange={e => handleGenericChange('experience', index, 'startDate', e.target.value)} placeholder="Jan 2022" />
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input value={exp.endDate} onChange={e => handleGenericChange('experience', index, 'endDate', e.target.value)} placeholder="Present" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                        <Label>Bullet Points / Description</Label>
                        <Textarea value={exp.description} onChange={e => handleGenericChange('experience', index, 'description', e.target.value)} placeholder="- Developed feature X, resulting in Y% improvement.&#10;- Collaborated with team Z on project A." rows={5} />
                    </div>
                </CardContent>
                {resumeData.experience.length > 1 &&
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEntry('experience', exp.id)}>
                    <Trash2 className="h-4 w-4" />
                    </Button>
                }
                </Card>
            ))}
            <Button variant="outline" onClick={() => addEntry('experience')}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
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
