
import type { ResumeData, EducationCategory } from './types';

export const initialResumeData: ResumeData = {
  contact: {
    name: 'E Akash Goud',
    email: 'letsmail.akashgoud@gmail.com',
    phone: '9849886222',
    linkedin: 'linkedin.com/in/akash-goud-7a3b62318/',
    github: 'github.com/akashgoud2121',
  },
  summary: 'I am a highly motivated final-year CSE student specializing in AIML, passionate about software development. I possess strong foundational skills in React, Python, and SQL, and am eager to apply these in a practical setting. I am actively seeking a challenging software engineering internship to contribute effectively to innovative projects and grow my technical expertise.',
  education: [
    {
      id: `edu_${Date.now()}_1`,
      category: 'higher',
      school: 'Malla Reddy College Of Engineering and Technology',
      degree: 'B.Tech in Computer Science (AIML)',
      date: '2022 - 2026',
      city: 'Hyderabad',
      grades: '8.57 CGPA',
    },
    {
      id: `edu_${Date.now()}_2`,
      category: 'intermediate',
      school: 'Sri Gayatri Junior College',
      degree: 'MPC',
      date: '2020 - 2022',
      city: 'Hyderabad',
      grades: '95.6%',
    },
    {
      id: `edu_${Date.now()}_3`,
      category: 'schooling',
      school: 'Viswa Bharathi Techno School',
      degree: 'SSC',
      date: '2019 - 2020',
      city: 'Gadwal',
      grades: '9.3 GPA',
    },
  ],
  experience: [
      {
        id: `exp_${Date.now()}`,
        title: 'Aiml Engineer',
        company: 'Cognisys Ai',
        startDate: 'May 2025',
        endDate: 'May 2026',
        description: `- Designed and developed a responsive web application UI for daily water intake tracking, leveraging React and Tailwind CSS to enhance user experience and engagement.
- Engineered core functionalities including personalized goal setting and reminder notifications by integrating Firebase, enabling users to consistently meet their hydration targets.
- Implemented dynamic data visualizations using Chart.js to clearly display daily water intake trends, providing users with actionable insights into their hydration patterns.`
      }
  ],
  projects: [
    {
      id: `proj_${Date.now()}_1`,
      title: 'Trust Free Block Chain Frame work For AIGC And Management in Metaverse',
      organization: 'Major Project',
      startDate: 'April 2025',
      endDate: 'May 2025',
      description: `- Developed a trust-free front-end interface using React and Tailwind CSS, facilitating seamless transactions for AI-generated content within a metaverse network.
- Engineered interactive front-end components that seamlessly integrated with blockchain functionalities, enabling secure and transparent buying and selling of AI-generated content.`
    },
    {
      id: `proj_${Date.now()}_2`,
      title: 'RAG Chat bot',
      organization: 'Minor Project',
      startDate: 'Apr 2023',
      endDate: 'July 2023',
      description: `- Developed a fullstack Retrieval-Augmented Generation (RAG) chatbot using Python and Streamlit, enabling users to securely input API keys, upload custom documents, and engage in AI-powered conversations to extract precise answers.
- Engineered a seamless user experience by integrating document upload and API key management features.`
    },
  ],
  skills: [
    {
        id: `skillcat_${Date.now()}_1`,
        name: 'Programming Languages',
        skills: 'Python, SQL',
    },
    {
        id: `skillcat_${Date.now()}_2`,
        name: 'Frontend Frameworks & Libraries',
        skills: 'React, Chart.js',
    },
    {
        id: `skillcat_${Date.now()}_3`,
        name: 'Styling & UI Libraries',
        skills: 'Tailwind CSS',
    },
    {
        id: `skillcat_${Date.now()}_4`,
        name: 'Backend Services & Databases',
        skills: 'Firebase',
    },
     {
        id: `skillcat_${Date.now()}_5`,
        name: 'AI/ML Concepts',
        skills: 'AIML',
    },
  ],
  certifications: [
    {
      id: `cert_${Date.now()}`,
      name: 'Salesforce Developer Virtual Internship Certification',
      issuer: 'SalesForce',
      date: 'May 2024',
      description: `- Architected and developed robust, secure, and scalable solutions on the Salesforce platform, demonstrating validated proficiency through successful completion of rigorous hands-on labs and a comprehensive final certification exam.
- Engineered dynamic and efficient Salesforce solutions by leveraging advanced platform features, showcasing expertise in solution management and optimization through intensive virtual internship exercises.`
    }
  ],
  achievements: [
    {
        id: `achieve_${Date.now()}_1`,
        category: 'hackathon',
        name: 'Smart India Hackathon',
        context: 'National Level Championship',
        date: 'March 2024',
        description: `- Championed a winning urban waste management solution, securing 1st place out of over 500 competing teams in the Smart India Hackathon by developing a comprehensive full-stack web application.
- Optimized garbage collection routes by implementing a predictive model with Python and Scikit-learn, integrating with Google Maps API to enhance operational efficiency and resource allocation.`
    },
    {
        id: `achieve_${Date.now()}_2`,
        category: 'workshop',
        name: 'Synchro Serve Workshop',
        context: 'International',
        date: 'September 2025',
        description: `- Mastered foundational Machine Learning and Deep Learning principles, including core algorithms and methodologies, through an interactive 3-day workshop, strengthening expertise in AI fundamentals.
- Utilized cutting-edge Generative AI tools such as ChatGPT, Zapier, and SunoAI, by hands-on exploration of Large Language Models (LLMs) and no-code automation platforms, enhancing practical application skills for AI-driven solutions.`
    }
  ],
};
