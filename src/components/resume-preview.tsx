
"use client";

import React, { forwardRef } from 'react';
import { useResume } from '@/lib/store';
import { cn } from '@/lib/utils';
import { EducationCategory } from '@/lib/types';

const categoryTitles: Record<EducationCategory, string> = {
  higher: 'Higher Education',
  intermediate: 'Intermediate / Diploma',
  schooling: 'Schooling',
};

export const ResumePreview = forwardRef<HTMLDivElement>((props, ref) => {
  const { resumeData } = useResume();
  const { contact, summary, education, experience, projects, skills } = resumeData;

  const renderDescription = (text: string) => {
    // This regex splits the text by newlines or by hyphens that start a bullet point.
    // It handles cases where AI generates bullet points in a single line.
    // The filter removes any empty strings that result from the split.
    const bulletPoints = text
      .split(/\n|(?=- )/)
      .filter(line => line.trim() !== '');

    if (bulletPoints.length === 0 || (bulletPoints.length === 1 && !bulletPoints[0].startsWith('-'))) {
       return <p className="text-sm">{text}</p>;
    }
    
    return (
        <ul className="list-disc list-outside pl-4 space-y-1">
            {bulletPoints.map((line, index) => (
            <li key={index} className="text-sm pl-2 mb-1">
                {line.trim().replace(/^- /, '')}
            </li>
            ))}
        </ul>
    );
  };
  
  const contactItems = [
    contact.email,
    contact.phone,
    contact.linkedin,
    contact.github
  ].filter(Boolean);

  const groupedEducation = education.reduce((acc, edu) => {
    const category = edu.category || 'higher';
    if (!acc[category]) {
      acc[category] = [];
    }
    if (edu.school) { // Only add if there is a school name
      acc[category].push(edu);
    }
    return acc;
  }, {} as Record<EducationCategory, typeof education>);

  const educationOrder: EducationCategory[] = ['higher', 'intermediate', 'schooling'];

  return (
    <div
      ref={ref}
      id="resume-preview"
      className={cn(
        "aspect-[8.5/11] w-full max-w-[800px] bg-white text-gray-800 p-8 shadow-lg rounded-lg",
        "transition-transform duration-300 print:shadow-none print:scale-100 print:rounded-none"
      )}
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="text-center mb-6">
        {contact.name && <h1 className="text-4xl font-bold tracking-tight">{contact.name}</h1>}
        <div className="flex justify-center items-center gap-x-3 gap-y-1 mt-2 text-sm flex-wrap">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 mx-1">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {summary && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Summary</h2>
          <p className="text-sm text-justify">{summary}</p>
        </div>
      )}

      {skills && (
        <div className="mb-6 break-inside-avoid">
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Skills</h2>
            <p className="text-sm">{skills}</p>
        </div>
      )}
      
      {experience.length > 0 && experience.some(e => e.title) && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Work Experience</h2>
          {experience.map(exp => exp.title && (
            <div key={exp.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{exp.title}</h3>
                <p className="text-sm font-light">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm font-semibold italic">{exp.company}</p>
              <div className="mt-1 prose prose-sm max-w-none text-gray-700">
                {renderDescription(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && projects.some(p => p.title) && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Projects</h2>
          {projects.map(proj => proj.title && (
            <div key={proj.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{proj.title}</h3>
                <p className="text-sm font-light">{proj.startDate} - {proj.endDate}</p>
              </div>
              <p className="text-sm font-semibold italic">{proj.organization}</p>
              <div className="mt-1 prose prose-sm max-w-none text-gray-700">
                {renderDescription(proj.description)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="break-inside-avoid">
        {education.some(e => e.school) && <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Education</h2>}
        {educationOrder.map(category => {
          const entries = groupedEducation[category];
          if (!entries || entries.length === 0) return null;
          return (
            <div key={category} className="mb-4 break-inside-avoid">
               <h3 className="text-md font-bold text-gray-600 mb-2">{categoryTitles[category]}</h3>
               {entries.map(edu => (
                 <div key={edu.id} className="flex justify-between items-start mb-2 break-inside-avoid">
                   <div className="flex-grow">
                     <h4 className="text-md font-bold">{edu.school}</h4>
                     <p className="text-sm">{edu.degree}</p>
                     {edu.grades && <p className="text-sm font-semibold">Grades: {edu.grades}</p>}
                   </div>
                   <div className="text-right flex-shrink-0 ml-4">
                     <p className="text-sm font-light">{edu.date}</p>
                     <p className="text-sm font-light">{edu.city}</p>
                   </div>
                 </div>
               ))}
            </div>
          )
        })}
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
