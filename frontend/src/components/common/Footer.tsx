import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const footerSections = [
    {
      title: t('footer.about'),
      links: [
        { name: t('footer.about'), href: '/about' },
        { name: t('footer.services'), href: '/services' },
        { name: t('footer.policies'), href: '/policies' },
        { name: t('footer.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footer.services'),
      links: [
        { name: 'Book Borrowing', href: '/services/borrowing' },
        { name: 'Digital Library', href: '/services/digital' },
        { name: 'Research Support', href: '/services/research' },
        { name: 'Events & Programs', href: '/events' },
      ],
    },
    {
      title: 'Quick Links',
      links: [
        { name: 'Catalog Search', href: '/books' },
        { name: 'New Arrivals', href: '/books/new' },
        { name: 'Popular Books', href: '/books/popular' },
        { name: 'Member Portal', href: '/member' },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Library Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold text-white">
                  {t('header.libraryName')}
                </h3>
              </div>
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Serving the Yeka Sub City community with knowledge, resources, and educational programs since 1995.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('footer.address')}</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('footer.phone')}</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('footer.email')}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-sm">Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div key={section.title} variants={itemVariants}>
              <h4 className="text-lg font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-neutral-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-neutral-400 mb-4 md:mb-0">
              {t('footer.copyright')}
            </div>
            <div className="flex space-x-6">
              <a
                href="/privacy"
                className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200"
              >
                {t('footer.privacy')}
              </a>
              <a
                href="/terms"
                className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200"
              >
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
