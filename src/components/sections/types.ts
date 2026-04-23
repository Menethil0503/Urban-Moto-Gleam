export type SocialItem = {
  name: string;
  url: string;
};

export type PackageItem = {
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  icon: string;
};

export type ProcessStep = {
  step: number;
  title: string;
  desc: string;
};

export type TestimonialItem = {
  name: string;
  text: string;
  rating: number;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type LandingData = {
  company: {
    name: string;
    slogan: string;
    description: string;
    mission: string;
    vision: string;
    certifications: string[];
    location: string;
    whatsapp: string;
    email: string;
    phone: string;
    hours: string;
    social: SocialItem[];
  };
  packages: PackageItem[];
  benefits: string[];
  processSteps: ProcessStep[];
  testimonials: TestimonialItem[];
  faq: FaqItem[];
  gallery?: string[];
  images: {
    hero: string;
    beforeAfter: {
      before: string;
      after: string;
    };
    gallery: string[];
  };
};

export type NavItem = {
  label: string;
  id: string;
};
