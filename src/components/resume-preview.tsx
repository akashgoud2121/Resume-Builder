
"use client";

import React, { forwardRef } from 'react';
import { useResume } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { EducationCategory, Achievement, AchievementCategory } from '@/lib/types';
import { Github, Linkedin, Mail, Phone, Link as LinkIcon } from 'lucide-react';


const categoryTitles: Record<EducationCategory, string> = {
  higher: 'Higher Education',
  intermediate: 'Intermediate / Diploma',
  schooling: 'Schooling',
};

const achievementCategoryTitles: Record<AchievementCategory, string> = {
  hackathon: 'Hackathons',
  workshop: 'Workshops',
  poster: 'Poster Presentations',
  techfest: 'Techfest Participation',
};

const addHttp = (url: string) => {
  if (!url) return '';
  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
      return `https://${url}`;
  }
  return url;
}

const renderDescription = (text: string) => {
  if (!text) return null;
  const bulletPoints = text
    .split(/\n|(?=- )/)
    .map(line => line.trim())
    .filter(line => line.startsWith('-'));

  if (bulletPoints.length === 0) {
     return <p className="text-sm text-gray-800 leading-relaxed">{text}</p>;
  }
  
  return (
      <ul className="list-none space-y-1">
          {bulletPoints.map((line, index) => (
          <li key={index} className="text-sm text-gray-800 pl-4 relative">
             <span className="absolute left-0 text-gray-600 top-0.5">•</span>
              <span>{line.replace(/^- /, '')}</span>
          </li>
          ))}
      </ul>
  );
};

export const ResumePreview = forwardRef<HTMLDivElement>((props, ref) => {
  const { resumeData } = useResume();
  const { contact, summary, education, experience, projects, skills, certifications, achievements } = resumeData;
  
  const hasSkills = skills && skills.some(cat => cat.name && cat.skills);

  const groupedEducation = education.reduce((acc, edu) => {
    const category = edu.category || 'higher';
    if (!acc[category]) {
      acc[category] = [];
    }
    if (edu.school) {
      acc[category].push(edu);
    }
    return acc;
  }, {} as Record<EducationCategory, typeof education>);

  const educationOrder: EducationCategory[] = ['higher', 'intermediate', 'schooling'];

  const groupedAchievements = achievements.reduce((acc, ach) => {
    const category = ach.category || 'hackathon';
    if (!acc[category]) {
      acc[category] = [];
    }
    if(ach.name) {
      acc[category].push(ach);
    }
    return acc;
  }, {} as Record<AchievementCategory, Achievement[]>);
  
  const achievementOrder: AchievementCategory[] = ['hackathon', 'workshop', 'poster', 'techfest'];

  return (
    <div
      ref={ref}
      className={cn(
        "bg-white shadow-lg page-container",
        "w-[210mm] min-h-[297mm] p-8", 
        "font-sans text-gray-900 text-[10pt]"
      )}
    >
        <div data-section="contact" className="text-center mb-6">
            {contact.name && <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">{contact.name}</h1>}
             <div className="flex justify-center items-center gap-x-4 gap-y-1 text-xs text-gray-600 flex-wrap">
              {contact.email && (
                 <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary hover:underline">
                   <Mail className="h-3 w-3" />
                   <span>{contact.email}</span>
                 </a>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1.5">
                   <Phone className="h-3 w-3" />
                   <span>{contact.phone}</span>
                </div>
              )}
               {contact.linkedin && (
                 <a href={addHttp(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary hover:underline">
                    <Linkedin className="h-3 w-3" />
                   <span>{contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '')}</span>
                 </a>
              )}
              {contact.github && (
                 <a href={addHttp(contact.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary hover:underline">
                    <Github className="h-3 w-3" />
                   <span>{contact.github.replace(/^(https?:\/\/)?(www\.)?/, '')}</span>
                 </a>
              )}
            </div>
             <hr className="mt-4 border-t-2 border-gray-300" />
        </div>

      {summary && (
        <div data-section="summary" className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Summary</h2>
          <p className="text-sm text-gray-700 leading-normal">{summary}</p>
        </div>
      )}

      {hasSkills && (
        <div data-section="skills" className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Skills</h2>
          <div className="text-sm text-gray-700 space-y-1">
            {skills.map((category) => {
              const trimmedSkills = category.skills.split(',').map(s => s.trim()).filter(Boolean).join(', ');
              if (category.name && trimmedSkills) {
                return (
                  <div key={category.id} className="flex items-start">
                    <p className="w-1/3 font-semibold text-gray-800">{category.name}:</p>
                    <p className="w-2/3">{trimmedSkills}</p>
                  </div>
                )
              }
              return null;
            })}
          </div>
        </div>
      )}

      {experience.length > 0 && experience.some(e => e.title) && (
        <div data-section="experience" className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Work Experience</h2>
          {experience.map(exp => exp.title && (
            <div key={exp.id} className="mb-3 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-gray-900">{exp.title}</h3>
                <p className="text-xs text-gray-600 font-medium">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm font-medium text-gray-700 italic mb-1">{exp.company}</p>
              <div className="mt-1">
                {renderDescription(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && projects.some(p => p.title) && (
        <div data-section="projects" className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Projects</h2>
          {projects.map(proj => proj.title && (
            <div key={proj.id} className="mb-3 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-gray-900">{proj.title}</h3>
                <p className="text-xs text-gray-600 font-medium">{proj.startDate} - {proj.endDate}</p>
              </div>
              {proj.organization && <p className="text-sm font-medium text-gray-700 italic mb-1">{proj.organization}</p>}
              <div className="mt-1">
                {renderDescription(proj.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {education.some(e => e.school) && (
        <div data-section="education" className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Education</h2>
            {educationOrder.map(category => {
            const entries = groupedEducation[category];
            if (!entries || entries.length === 0) return null;
            return (
                <React.Fragment key={category}>
                  {entries.map(edu => (
                      <div key={edu.id} className="flex justify-between items-start mb-2 break-inside-avoid">
                        <div className="flex-grow">
                            <h4 className="text-sm font-bold text-gray-900">{edu.school}</h4>
                            <p className="text-sm text-gray-700">{edu.degree}</p>
                            {edu.grades && <p className="text-sm text-gray-600">{edu.grades}</p>}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-xs text-gray-600 font-medium">{edu.date}</p>
                            <p className="text-xs text-gray-600">{edu.city}</p>
                        </div>
                      </div>
                  ))}
                </React.Fragment>
            )
            })}
        </div>
      )}
      
       {certifications.length > 0 && certifications.some(c => c.name) && (
        <div data-section="certifications" className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Certifications</h2>
          {certifications.map(cert => cert.name && (
            <div key={cert.id} className="mb-3 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-gray-900">{cert.name}</h3>
                <p className="text-xs text-gray-600 font-medium">{cert.date}</p>
              </div>
              <p className="text-sm font-medium text-gray-700 italic mb-1">{cert.issuer}</p>
              <div className="mt-1">
                {renderDescription(cert.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {achievements.length > 0 && achievements.some(a => a.name) && (
        <div data-section="achievements" className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-2">Achievements & Activities</h2>
            {achievementOrder.map(category => {
                const entries = groupedAchievements[category];
                if (!entries || entries.length === 0) return null;

                return (
                    <div key={category} className="mb-2 break-inside-avoid">
                        <h3 className="text-sm font-semibold text-gray-700 underline mb-2">{achievementCategoryTitles[category]}</h3>
                        {entries.map(ach => (
                             <div key={ach.id} className="mb-3 break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-sm font-bold text-gray-900">{ach.name}</h4>
                                    <p className="text-xs text-gray-600 font-medium">{ach.date}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700 italic mb-1">{ach.context}</p>
                                <div className="mt-1">
                                    {renderDescription(ach.description)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
      )}

    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
