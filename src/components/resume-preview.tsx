

"use client";

import React, { forwardRef } from 'react';
import { useResume } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Education, EducationCategory, Achievement, AchievementCategory, Certification } from '@/lib/types';
import { Github, Linkedin, Mail, Phone, Link as LinkIcon, MapPin } from 'lucide-react';


const achievementCategoryTitles: Record<AchievementCategory, string> = {
  hackathon: 'Hackathons',
  workshop: 'Workshops',
  poster: 'Poster Presentations',
  techfest: 'Techfest Participation',
  leadership: 'Leadership Roles',
  volunteering: 'Volunteering',
  publication: 'Publications',
  other: 'Other Activities',
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

  // Pre-process to handle cases where bullets are not newline separated
  const processedText = text.replace(/\.-\s*/g, '.\n-');
  
  const lines = processedText.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length <= 1 && !processedText.trim().startsWith('-')) {
    return <p className="text-sm text-gray-800 leading-relaxed">{processedText}</p>;
  }

  // If there are newlines, split by them. Otherwise, if it starts with a hyphen, split by that.
  const points = lines.length > 1 ? lines : processedText.split(/(?=- )/).map(p => p.trim()).filter(Boolean);

  return (
    <ul className="list-none space-y-1 pl-4">
      {points.map((line, index) => (
        <li key={index} className="text-sm text-gray-800 relative">
          <span className="absolute -left-4 text-primary top-0.5">•</span>
          <span>{line.replace(/^- ?/, '')}</span>
        </li>
      ))}
    </ul>
  );
};


const parseDate = (dateString: string): Date | null => {
    if (!dateString || !dateString.includes(' ')) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

export const ResumePreview = forwardRef<HTMLDivElement>((props, ref) => {
  const { resumeData } = useResume();
  const { contact, summary, education, experience, projects, skills, certifications, achievements } = resumeData;
  
  const hasSkills = skills && skills.some(cat => cat.name && cat.skills);
  const hasExperience = experience.length > 0 && experience.some(e => e.title);

  const sortedEducation = [...education]
    .filter(edu => edu.school)
    .sort((a, b) => {
        const dateA = parseDate(a.endDate);
        const dateB = parseDate(b.endDate);
        if (dateA && dateB) {
            return dateB.getTime() - dateA.getTime();
        }
        if (dateA) return -1;
        if (dateB) return 1;
        return 0;
    });

  const groupedAchievements = achievements.reduce((acc, ach) => {
    const category = ach.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    if(ach.name) {
      acc[category].push(ach);
    }
    return acc;
  }, {} as Record<AchievementCategory, Achievement[]>);
  
  const achievementOrder: AchievementCategory[] = ['hackathon', 'workshop', 'poster', 'techfest', 'leadership', 'volunteering', 'publication', 'other'];

  const Section = ({ title, children, hasData }: { title: string; children: React.ReactNode, hasData: boolean }) => {
    if (!hasData) return null;
    return (
      <div className="mb-4">
        <h2 className="text-lg font-bold uppercase tracking-widest text-primary mb-2 border-b-2 border-primary pb-1">
          {title}
        </h2>
        {children}
      </div>
    );
  };
  
  const ExperienceSection = (
      <Section title="Work Experience" hasData={hasExperience}>
          {experience.map(exp => exp.title && (
            <div key={exp.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-bold text-gray-900">{exp.title}</h3>
                <p className="text-sm text-gray-600 font-medium">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 italic mb-1.5">{exp.company}</p>
              {renderDescription(exp.description)}
            </div>
          ))}
      </Section>
  );


  return (
    <div
      ref={ref}
      className={cn(
        "bg-white shadow-lg page-container",
        "w-[210mm] min-h-[297mm] p-8", 
        "font-sans text-gray-900 text-[10.5pt]"
      )}
    >
        <header data-section="contact" className="text-center mb-6">
            {contact.name && <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">{contact.name}</h1>}
             <div className="flex justify-center items-center gap-x-6 gap-y-1 text-sm text-gray-600 flex-wrap">
              {contact.email && (
                 <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
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
               {contact.location && (
                <div className="flex items-center gap-1.5">
                   <MapPin className="h-3.5 w-3.5" />
                   <span>{contact.location}</span>
                </div>
              )}
               {contact.linkedin && (
                 <a href={addHttp(contact.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Linkedin className="h-3.5 w-3.5" />
                   <span>LinkedIn</span>
                 </a>
              )}
              {contact.github && (
                 <a href={addHttp(contact.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Github className="h-3.5 w-3.5" />
                   <span>GitHub</span>
                 </a>
              )}
              {contact.otherLinks && contact.otherLinks.map(link => link.url && (
                 <a key={link.id} href={addHttp(link.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <LinkIcon className="h-3.5 w-3.5" />
                   <span>{link.label || 'Link'}</span>
                 </a>
              ))}
            </div>
        </header>

      <Section title="Summary" hasData={!!summary}>
          <p className="text-sm text-gray-700 leading-normal">{summary}</p>
      </Section>

      <Section title="Skills" hasData={hasSkills}>
          <div className="text-sm text-gray-700 space-y-1.5">
            {skills.map((category) => {
              const trimmedSkills = category.skills.split(',').map(s => s.trim()).filter(Boolean).join(', ');
              if (category.name && trimmedSkills) {
                return (
                  <div key={category.id} className="flex items-start">
                    <p className="w-1/3 font-bold text-gray-800">{category.name}:</p>
                    <p className="w-2/3">{trimmedSkills}</p>
                  </div>
                )
              }
              return null;
            })}
          </div>
      </Section>
      
      {hasExperience && ExperienceSection}

      <Section title="Education" hasData={sortedEducation.length > 0}>
        <div className="space-y-3">
          {sortedEducation.map(edu => (
            <div key={edu.id} className="flex justify-between items-start break-inside-avoid">
              <div className="flex-grow">
                  <h4 className="text-base font-bold text-gray-900">{edu.school}</h4>
                  <p className="text-sm text-gray-700">{edu.degree}</p>
                  {edu.grades && <p className="text-sm text-gray-600">{edu.grades}</p>}
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm text-gray-600 font-medium">{edu.startDate} - {edu.endDate}</p>
                  <p className="text-sm text-gray-600">{edu.city}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      
      <Section title="Projects" hasData={projects.length > 0 && projects.some(p => p.title)}>
          {projects.map(proj => proj.title && (
            <div key={proj.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-bold text-gray-900">{proj.title}</h3>
                <p className="text-sm text-gray-600 font-medium">{proj.startDate} - {proj.endDate}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 italic mb-1.5">
                 {proj.projectType}
                 {(proj.organization && proj.organization.toLowerCase() !== 'personal project') && ` at ${proj.organization}`}
              </p>
              {renderDescription(proj.description)}
            </div>
          ))}
      </Section>

      <Section title="Certifications" hasData={certifications.length > 0 && certifications.some(c => c.name)}>
          {certifications.map((cert: Certification) => cert.name && (
            <div key={cert.id} className="mb-4 break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-bold text-gray-900">{cert.name}</h3>
                <p className="text-sm text-gray-600 font-medium">{cert.date}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 italic mb-1.5">{cert.issuer}</p>
              {renderDescription(cert.description)}
              {cert.technologies && (
                  <div className="mt-1.5 text-sm">
                      <span className="font-bold text-gray-800">Skills Covered: </span>
                      <span className="text-gray-700">{cert.technologies}</span>
                  </div>
              )}
            </div>
          ))}
      </Section>

      <Section title="Achievements & Activities" hasData={achievements.length > 0 && achievements.some(a => a.name)}>
          {achievementOrder.map(category => {
              const entries = groupedAchievements[category];
              if (!entries || entries.length === 0) return null;

              return (
                  <div key={category} className="mb-3 break-inside-avoid">
                      <h3 className="text-base font-semibold text-gray-800 underline mb-2">{achievementCategoryTitles[category]}</h3>
                      {entries.map(ach => (
                           <div key={ach.id} className="mb-4 break-inside-avoid">
                              <div className="flex justify-between items-baseline mb-1">
                                  <h4 className="text-base font-bold text-gray-900">{ach.name}</h4>
                                  <p className="text-sm text-gray-600 font-medium">{ach.date}</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-700 italic mb-1.5">{ach.context}</p>
                              {renderDescription(ach.description)}
                          </div>
                      ))}
                  </div>
              );
          })}
      </Section>
      
      {!hasExperience && ExperienceSection}

    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

    