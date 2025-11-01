import React, { useState } from 'react';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';

const ContactPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const content = {
    en: {
      title: "Contact Us",
      getInTouch: "Get In Touch",
      sendMessage: "Send us a Message",
      name: "Your Name",
      email: "Your Email",
      subject: "Subject",
      message: "Message",
      send: "Send Message"
    },
    am: {
      title: "ያነጋግሩን",
      getInTouch: "ያነጋግሩን",
      sendMessage: "መሰጀ ይላኩን",
      name: "ስምዎ",
      email: "ኢሜይልዎ",
      subject: "ጋራ",
      message: "መሰጀ",
      send: "መሰጀ ላክ"
    },
    om: {
      title: "Nu Quunnamaa",
      getInTouch: "Nu Quunnamaa",
      sendMessage: "Ergaa Nuu Ergaa",
      name: "Maqaa Keessan",
      email: "Imeelii Keessan",
      subject: "Mata-duree",
      message: "Ergaa",
      send: "Ergaa Ergii"
    }
  };

  const data = content[language as keyof typeof content] || content.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! (Demo only)');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 sm:mb-12 text-center">{data.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 sm:mb-6">{data.getInTouch}</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{t('footer.location')}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">{t('footer.address')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{t('footer.phone')}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">+251 11 123 4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{t('footer.email')}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 break-all">info@yekalibrary.gov.et</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{t('footer.hours')}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    {language === 'am' ? 'ሰኞ-አርብ: 8ሰዓት-8ሰዓት, ቅዳሜ-እሁድ: 9ሰዓት-6ሰዓት' : language === 'om' ? 'Wiixata-Jimaata: 8:00-20:00, Sanbata-Dilbata: 9:00-18:00' : 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 sm:mb-6">{data.sendMessage}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-2">{data.name}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-2">{data.email}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-2">{data.subject}</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="input-field text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-2">{data.message}</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="input-field text-sm sm:text-base"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full text-sm sm:text-base">{data.send}</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
