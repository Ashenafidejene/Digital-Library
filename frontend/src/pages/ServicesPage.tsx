import React from 'react';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpenIcon, ComputerDesktopIcon, AcademicCapIcon, CalendarDaysIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const ServicesPage: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Our Services",
      services: [
        { icon: BookOpenIcon, title: "Book Borrowing", desc: "Borrow books for up to 2 weeks with renewal options. Free membership for all residents." },
        { icon: GlobeAltIcon, title: "Digital Library", desc: "Access e-books, audiobooks, and digital resources 24/7 from anywhere." },
        { icon: AcademicCapIcon, title: "Research Support", desc: "Get assistance with research projects, academic papers, and information literacy." },
        { icon: CalendarDaysIcon, title: "Events & Programs", desc: "Join reading clubs, workshops, author talks, and educational programs." },
        { icon: UserGroupIcon, title: "Children's Programs", desc: "Story time, homework help, and educational activities for children." },
        { icon: ComputerDesktopIcon, title: "Computer Access", desc: "Free internet access and computer workstations for members." }
      ]
    },
    am: {
      title: "የእኛ አገልግሎቶች",
      services: [
        { icon: BookOpenIcon, title: "መጻሕፍት መበደር", desc: "መጻሕፍትን እስከ 2 ሳምንት ድረስ የማደስ ፍልንቶች ያለው ማበደር። ለሁሉም የመንገድ ተጠቃሚዎች በነጻ አባልነት።" },
        { icon: GlobeAltIcon, title: "ዲጂታል ቤተ መጻሕፍት", desc: "ኢ-መጻሕፍት፣ የድምጽ መጻሕፍት እና ዲጂታል ሀብቶችን 24/7 ከየትኛውም ይውሱ።" },
        { icon: AcademicCapIcon, title: "የጥናት ድጋፍ", desc: "ለጥናት ፕሮጀክቶች፣ አካዳሚክ ጽሁፎች እና የውድድር መረጃ ድጋፍ ያግኙ።" },
        { icon: CalendarDaysIcon, title: "ዝግጅቶች እና ፕሮግራሞች", desc: "የንባብ ክበቦች፣ ውርክሾፖች፣ የደራሲ ግባዞች እና ትምህርታዊ ፕሮግራሞችን ይቀላቀሉ።" },
        { icon: UserGroupIcon, title: "የህጻናት ፕሮግራሞች", desc: "የትርግም ጊዜ፣ የበይት ስራ ድጋፍ እና ለህጻናት ትምህርታዊ እንቅስቃሴዎች።" },
        { icon: ComputerDesktopIcon, title: "የኮምፒውተር ማግኘት", desc: "ለአባላት በነጻ የኢንተርኔት ማግኘት እና የኮምፒውተር የስራ ብየዎች።" }
      ]
    },
    om: {
      title: "Tajaajilaalee Keenya",
      services: [
        { icon: BookOpenIcon, title: "Kitaabota Liqeessuu", desc: "Kitaabota hanga torban 2 filannoo haaromsuu waliin liqeessuu. Jiraattota hundaaf miseensummaa bilisaa." },
        { icon: GlobeAltIcon, title: "Mana Kitaabaa Dijitaalaa", desc: "E-kitaabota, kitaabota sagalee fi qabeenya dijitaalaa 24/7 bakka kamirraayyuu argadhu." },
        { icon: AcademicCapIcon, title: "Deeggarsa Qorannoo", desc: "Pirojektii qorannoo, waraqaa barnootaa fi beekumsa odeeffannoof gargaarsa argadhu." },
        { icon: CalendarDaysIcon, title: "Taateewwan fi Sagantaalee", desc: "Garee dubbisaa, workshop, haasawa barreessitootaa fi sagantaalee barnootaa keessatti hirmaadhu." },
        { icon: UserGroupIcon, title: "Sagantaalee Daa'immanii", desc: "Yeroo seenaa, gargaarsa hojii manaa fi sochii barnootaa daa'immaniitiif." },
        { icon: ComputerDesktopIcon, title: "Argannaa Kompiitaraa", desc: "Argannaa interneetii bilisaa fi buufata hojii kompiitaraa miseensotaaf." }
      ]
    }
  };

  const data = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 sm:mb-12 text-center">{data.title}</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {data.services.map((service, index) => (
            <div key={index} className="card-hover flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
                <service.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 sm:mb-3 min-h-[3rem] sm:min-h-[3.5rem]">{service.title}</h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
