
"use client";

import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { useResume } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { EducationCategory, Achievement, AchievementCategory, ResumeData } from '@/lib/types';
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
     return <p className="text-sm">{text}</p>;
  }
  
  return (
      <ul className="list-none space-y-1">
          {bulletPoints.map((line, index) => (
          <li key={index} className="text-sm pl-2 mb-1 flex items-start">
              <span className='mr-2'>•</span>
              <span>{line.trim().replace(/^- /, '')}</span>
          </li>
          ))}
      </ul>
  );
};


// A4 page dimensions in pixels at 96 DPI. 1 inch = 96px.
const A4_HEIGHT_PX = 1122.5; 
const PAGE_MARGIN_TOP_BOTTOM_PX = 96; // 1 inch
const PAGE_CONTENT_HEIGHT_PX = A4_HEIGHT_PX - (PAGE_MARGIN_TOP_BOTTOM_PX * 2);

interface ResumeContentProps {
  resumeData: ResumeData;
  isPaginationEnabled?: boolean;
}

const ResumeContent: React.FC<ResumeContentProps> = ({ resumeData, isPaginationEnabled = false }) => {
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

  const sectionClassName = isPaginationEnabled ? "break-inside-avoid" : "";

  return (
    <>
      <div className={`text-center mb-6 ${sectionClassName}`}>
        {contact.name && <h1 className="text-4xl font-bold tracking-tight">{contact.name}</h1>}
         <div className="flex justify-center items-center gap-x-4 gap-y-2 mt-2 text-sm flex-wrap">
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
        <div className={`mb-6 ${sectionClassName}`}>
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Summary</h2>
          <p className="text-sm text-justify">{summary}</p>
        </div>
      )}

      {hasSkills && (
        <div className={`mb-6 ${sectionClassName}`}>
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Skills</h2>
          <div className="text-sm">
            {skills.map((category) => {
              const trimmedSkills = category.skills.split(',').map(s => s.trim()).filter(Boolean).join(', ');
              if (category.name && trimmedSkills) {
                return (
                  <p key={category.id} className="mb-1.5">
                    <span className="font-bold">{category.name}:</span>
                    {' '}
                    {trimmedSkills}
                  </p>
                )
              }
              return null;
            })}
          </div>
        </div>
      )}

      {education.some(e => e.school) && (
        <div className={`mb-6 ${sectionClassName}`}>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Education</h2>
            {educationOrder.map(category => {
            const entries = groupedEducation[category];
            if (!entries || entries.length === 0) return null;
            return (
                <div key={category} className={`mb-4 ${sectionClassName}`}>
                  <h3 className="text-md font-bold text-muted-foreground mb-2">{categoryTitles[category]}</h3>
                  {entries.map(edu => (
                      <div key={edu.id} className={`flex justify-between items-start mb-2 ${sectionClassName}`}>
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
      )}

      {projects.length > 0 && projects.some(p => p.title) && (
        <div className={`mb-6 ${sectionClassName}`}>
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Projects</h2>
          {projects.map(proj => proj.title && (
            <div key={proj.id} className={`mb-4 ${sectionClassName}`}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{proj.title}</h3>
                <p className="text-sm font-light">{proj.startDate} - {proj.endDate}</p>
              </div>
              <p className="text-sm font-semibold italic">{proj.organization}</p>
              <div className="mt-1">
                {renderDescription(proj.description)}
              </div>
            </div>
          ))}
        </div>
      )}
      
       {certifications.length > 0 && certifications.some(c => c.name) && (
        <div className={`mb-6 ${sectionClassName}`}>
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Certifications</h2>
          {certifications.map(cert => cert.name && (
            <div key={cert.id} className={`mb-4 ${sectionClassName}`}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{cert.name}</h3>
                <p className="text-sm font-light">{cert.date}</p>
              </div>
              <p className="text-sm font-semibold italic">{cert.issuer}</p>
              <div className="mt-1">
                {renderDescription(cert.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {achievements.length > 0 && achievements.some(a => a.name) && (
        <div className={`mb-6 ${sectionClassName}`}>
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Achievements & Activities</h2>
            {achievementOrder.map(category => {
                const entries = groupedAchievements[category];
                if (!entries || entries.length === 0) return null;

                return (
                    <div key={category} className={`mb-4 ${sectionClassName}`}>
                        <h3 className="text-md font-bold text-muted-foreground mb-2">{achievementCategoryTitles[category]}</h3>
                        {entries.map(ach => (
                             <div key={ach.id} className={`mb-4 ${sectionClassName}`}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-bold">{ach.name}</h3>
                                    <p className="text-sm font-light">{ach.date}</p>
                                </div>
                                <p className="text-sm font-semibold italic">{ach.context}</p>
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
        <div className={`mb-6 ${sectionClassName}`}>
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b-2 border-primary pb-1">Work Experience</h2>
          {experience.map(exp => exp.title && (
            <div key={exp.id} className={`mb-4 ${sectionClassName}`}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{exp.title}</h3>
                <p className="text-sm font-light">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm font-semibold italic">{exp.company}</p>
              <div className="mt-1">
                {renderDescription(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};


const ResumePaginator: React.FC<{ resumeData: ResumeData, children: React.ReactElement }> = ({ resumeData, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([[]]);

  useEffect(() => {
    if (!contentRef.current) return;

    const sections = Array.from(contentRef.current.children) as HTMLElement[];
    const newPages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentPageHeight = 0;

    sections.forEach((section, index) => {
      const sectionHeight = section.getBoundingClientRect().height;

      if (currentPageHeight + sectionHeight > PAGE_CONTENT_HEIGHT_PX && currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
        currentPageHeight = 0;
      }
      
      currentPage.push(React.cloneElement(children, {
        ...children.props,
        children: children.props.children[index]
      }));
      currentPageHeight += sectionHeight;
    });

    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }
    
    // We recreate the elements in pages, so React re-renders them.
    const finalPages = newPages.map((page, pageIndex) => 
        page.map((section: React.ReactElement, sectionIndex) =>
          React.cloneElement(section, { key: `${pageIndex}-${sectionIndex}` })
        )
      );

    setPages(finalPages);

  }, [resumeData, children]);


  return (
    <>
      {/* Hidden container for measuring content */}
      <div ref={contentRef} className="absolute opacity-0 -z-10 w-[210mm]" style={{ padding: '1in' }}>
        {children.props.children}
      </div>

      {/* Visible paginated content */}
      {pages.map((pageContent, pageIndex) => (
        <div key={pageIndex} className="page-container bg-background shadow-lg">
          <div className="page-content">
            {pageContent.map((section: React.ReactElement) => section.props.children)}
          </div>
        </div>
      ))}
    </>
  );
};


type ResumePreviewProps = {
  isPaginatorEnabled?: boolean;
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ isPaginatorEnabled = true }, ref) => {
    const { resumeData } = useResume();

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted/30 w-full h-full",
          "print:bg-transparent print:shadow-none"
        )}
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {isPaginatorEnabled ? (
          <ResumePaginator resumeData={resumeData}>
            <ResumeContent resumeData={resumeData} isPaginationEnabled={true} />
          </ResumePaginator>
        ) : (
          <div className="bg-background w-full min-h-full">
             <div className="page-content">
              <ResumeContent resumeData={resumeData} />
             </div>
          </div>
        )}
      </div>
    );
  }
);


ResumePreview.displayName = "ResumePreview";

    

    