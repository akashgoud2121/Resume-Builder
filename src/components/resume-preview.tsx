"use client";

import React, { forwardRef } from 'react';
import { useResume } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

export const ResumePreview = forwardRef<HTMLDivElement>((props, ref) => {
  const { resumeData } = useResume();
  const { contact, summary, education, experience, skills } = resumeData;

  const renderDescription = (text: string) => {
    return text.split('\n').map((line, index) => (
        <p key={index} className="text-sm">{line}</p>
    ));
  };

  return (
    <div
      ref={ref}
      id="resume-preview"
      className={cn(
        "aspect-[8.5/11] w-full max-w-[800px] bg-white text-gray-800 p-8 shadow-lg rounded-lg origin-top scale-[0.7] md:scale-100 lg:scale-[0.8] xl:scale-100",
        "transition-transform duration-300"
      )}
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="text-center mb-6">
        {contact.name && <h1 className="text-4xl font-bold tracking-tight">{contact.name}</h1>}
        <div className="flex justify-center items-center gap-x-4 gap-y-1 mt-2 text-sm flex-wrap">
          {contact.email && <p>{contact.email}</p>}
          {contact.phone && <p>{contact.phone}</p>}
          {contact.linkedin && <p>{contact.linkedin}</p>}
        </div>
      </div>

      {summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Summary</h2>
          <p className="text-sm text-justify">{summary}</p>
        </div>
      )}

      {skills && (
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Skills</h2>
            <p className="text-sm">{skills}</p>
        </div>
      )}

      {experience.length > 0 && experience[0]?.title && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-4">
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

      {education.length > 0 && education[0]?.school && (
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between items-baseline mb-2">
              <div>
                <h3 className="text-md font-bold">{edu.school}</h3>
                <p className="text-sm">{edu.degree}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-light">{edu.date}</p>
                <p className="text-sm font-light">{edu.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
