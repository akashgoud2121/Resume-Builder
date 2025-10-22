
"use client";

import React, { forwardRef } from 'react';
import { useResume } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { EducationCategory, Achievement, AchievementCategory } from '@/lib/types';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';


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
    .filter(line => line.trim() !== '');

  if (bulletPoints.length === 0 || (bulletPoints.length === 1 && !bulletPoints[0].trim().startsWith('-'))) {
     return <p className="text-sm text-gray-800 leading-relaxed">{text}</p>;
  }
  
  return (
      <ul className="list-none space-y-1">
          {bulletPoints.map((line, index) => (
          <li key={index} className="text-sm text-gray-800 pl-2 mb-1 flex items-start leading-relaxed">
              <span className='mr-2 text-gray-600'>•</span>
              <span>{line.trim().replace(/^- /, '')}</span>
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
        "bg-background shadow-lg page-container",
        "w-[210mm] min-h-[297mm] p-[0.5in]",
        "font-['Arial','Helvetica',sans-serif] text-[11pt] leading-[1.4]"
      )}
    >
        <div data-section="contact" className="text-center mb-8 break-inside-avoid">
            {contact.name && <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">{contact.name}</h1>}
             <div className="flex justify-center items-center gap-x-6 gap-y-1 text-sm text-gray-700 flex-wrap">
              {contact.email && (
                 <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary hover:underline">
                   <Mail className="h-3.5 w-3.5" />
                   <span>{contact.email}</span>
                 </a>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1.5">
                   <Phone className="h-3.5 w-3.5" />
                   <span>{contact.phone}</span>
                </div>
              )}
               {contact.linkedin && (
                 <a href={addHttp(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary hover:underline">
                    <Linkedin className="h-3.5 w-3.5" />
                   <span>{contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '')}</span>
                 </a>
              )}
              {contact.github && (
                 <a href={addHttp(contact.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary hover:underline">
                    <Github className="h-3.5 w-3.5" />
                   <span>{contact.github.replace(/^(https?:\/\/)?(www\.)?/, '')}</span>
                 </a>
              )}
            </div>
        </div>

      {summary && (
        <div data-section="summary" className="mb-6 break-inside-avoid">
          <div className="section-header-no-break">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Summary</h2>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
        </div>
      )}

      {hasSkills && (
        <div data-section="skills" className="mb-6 break-inside-avoid">
          <div className="section-header-no-break">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Skills</h2>
          </div>
          <div className="text-sm text-gray-800">
            {skills.map((category) => {
              const trimmedSkills = category.skills.split(',').map(s => s.trim()).filter(Boolean).join(', ');
              if (category.name && trimmedSkills) {
                return (
                  <p key={category.id} className="mb-2">
                    <span className="font-semibold text-gray-900">{category.name}:</span>
                    {' '}
                    <span className="text-gray-700">{trimmedSkills}</span>
                  </p>
                )
              }
              return null;
            })}
          </div>
        </div>
      )}

      {education.some(e => e.school) && (
        <div data-section="education" className="mb-6 break-inside-avoid">
            <div className="section-header-no-break">
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Education</h2>
            </div>
            {educationOrder.map(category => {
            const entries = groupedEducation[category];
            if (!entries || entries.length === 0) return null;
            return (
                <div key={category} className="mb-4 break-inside-avoid">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{categoryTitles[category]}</h3>
                  {entries.map(edu => (
                      <div key={edu.id} className="flex justify-between items-start mb-3 break-inside-avoid">
                        <div className="flex-grow">
                            <h4 className="text-sm font-bold text-gray-900">{edu.school}</h4>
                            <p className="text-sm text-gray-700">{edu.degree}</p>
                            {edu.grades && <p className="text-sm font-medium text-gray-600">Grades: {edu.grades}</p>}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-sm text-gray-600">{edu.date}</p>
                            <p className="text-sm text-gray-600">{edu.city}</p>
                        </div>
                      </div>
                  ))}
                </div>
            )
            })}
        </div>
      )}

      {projects.length > 0 && projects.some(p => p.title) && (
        <div data-section="projects" className="mb-6 break-inside-avoid">
          <div className="section-header-no-break">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Projects</h2>
          </div>
          {projects.map(proj => proj.title && (
            <div key={proj.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-gray-900">{proj.title}</h3>
                <p className="text-sm text-gray-600">{proj.startDate} - {proj.endDate}</p>
              </div>
              <p className="text-sm font-medium text-gray-700 italic mb-2">{proj.organization}</p>
              <div className="mt-1">
                {renderDescription(proj.description)}
              </div>
            </div>
          ))}
        </div>
      )}
      
       {certifications.length > 0 && certifications.some(c => c.name) && (
        <div data-section="certifications" className="mb-6 break-inside-avoid">
          <div className="section-header-no-break">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Certifications</h2>
          </div>
          {certifications.map(cert => cert.name && (
            <div key={cert.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-gray-900">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.date}</p>
              </div>
              <p className="text-sm font-medium text-gray-700 italic mb-2">{cert.issuer}</p>
              <div className="mt-1">
                {renderDescription(cert.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {achievements.length > 0 && achievements.some(a => a.name) && (
        <div data-section="achievements" className="mb-6 break-inside-avoid">
            <div className="section-header-no-break">
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Achievements & Activities</h2>
            </div>
            {achievementOrder.map(category => {
                const entries = groupedAchievements[category];
                if (!entries || entries.length === 0) return null;

                return (
                    <div key={category} className="mb-4 break-inside-avoid">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">{achievementCategoryTitles[category]}</h3>
                        {entries.map(ach => (
                             <div key={ach.id} className="mb-4 break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-gray-900">{ach.name}</h3>
                                    <p className="text-sm text-gray-600">{ach.date}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700 italic mb-2">{ach.context}</p>
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

      {experience.length > 0 && experience.some(e => e.title) && (
        <div data-section="experience" className="mb-6 break-inside-avoid">
          <div className="section-header-no-break">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">Work Experience</h2>
          </div>
          {experience.map(exp => exp.title && (
            <div key={exp.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-gray-900">{exp.title}</h3>
                <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm font-medium text-gray-700 italic mb-2">{exp.company}</p>
              <div className="mt-1">
                {renderDescription(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
