import React from 'react';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  const content = {
    en: {
      title: "About Yeka Sub City Library",
      mission: "Our Mission",
      missionText: "To provide free and equal access to information, knowledge, and cultural resources for all members of our community.",
      vision: "Our Vision",
      visionText: "To be a leading community library that empowers individuals through learning and fosters a love for reading.",
      history: "Our History",
      historyText: "Established in 1995, Yeka Sub City Library has been serving the community for over 25 years. We started with a small collection of 500 books and have grown to house over 15,000 titles across various categories.",
      values: "Our Values",
      value1: "Access for All",
      value2: "Community Focus",
      value3: "Lifelong Learning",
      value4: "Innovation"
    },
    am: {
      title: "ስለ የየካ ክፍለ ከተማ ቤተ መጻሕፍት",
      mission: "የእኛ ምስል",
      missionText: "ለሁሉም የህዝብ አባላት በነጻ እና በተሳካይ መረጃ፣ እውቀት እና የባህል ሀብቶች ማግኘት መስጠት።",
      vision: "የእኛ እይታ",
      visionText: "ትምህርት በማድረግ ስዎችን የሚአመዘረው እና የንባብ መፍቀርን የሚያስፋ መሪ የህዝብ ቤተ መጻሕፍት ማወን።",
      history: "የእኛ ታሪክ",
      historyText: "በ 1995 የተመሰረተው የየካ ክፍለ ከተማ ቤተ መጻሕፍት ለ 25 ዓመታት ለህዝቡ እያገልግለ ነው። በ 500 መጻሕፍት ትንሽ ስብስባ ጀምሮ አሁን ለ 15,000 የሚበሉ ምዕራፎችን እንዘዞ አድገናል።",
      values: "የእኛ እሴቶች",
      value1: "ለሁሉም ማግኘት",
      value2: "የህዝብ የማደርግ",
      value3: "ለሁሉም ሰው መመር",
      value4: "አዲስ ፍጥረት"
    },
    om: {
      title: "Waa'ee Mana Kitaabaa Aanaa Magaalaa Yeekaa",
      mission: "Kaayyoo Keenya",
      missionText: "Miseensota hawaasa keenyaa hundaaf odeeffannoo, beekumsa fi qabeenya aadaa bilisaan fi walqixa ta'een kennuu.",
      vision: "Mul'ata Keenya",
      visionText: "Barnoota karaa namoota humneessu fi jaalala dubbisaa guddisu mana kitaabaa hawaasaa hoogganaa ta'uu.",
      history: "Seenaa Keenya",
      historyText: "Bara 1995 hundeeffame, Mana Kitaabaa Aanaa Magaalaa Yeekaa waggaa 25 ol hawaasaaf tajaajilaa jira. Walitti qabama kitaabota 500 xiqqaa jalqabne fi amma gosa adda addaa keessaa kitaabota 15,000 ol qabna.",
      values: "Gatii Keenya",
      value1: "Hundaaf Argannaa",
      value2: "Xiyyeeffannoo Hawaasaa",
      value3: "Barnoota Umurii Guutuu",
      value4: "Kalaqaa"
    }
  };

  const data = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 sm:mb-8">{data.title}</h1>
        
        <div className="space-y-6 sm:space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-3 sm:mb-4 break-words">{data.mission}</h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed break-words">{data.missionText}</p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-3 sm:mb-4 break-words">{data.vision}</h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed break-words">{data.visionText}</p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-3 sm:mb-4 break-words">{data.history}</h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed break-words">{data.historyText}</p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-3 sm:mb-4 break-words">{data.values}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[data.value1, data.value2, data.value3, data.value4].map((value, index) => (
                <div key={index} className="card text-center flex flex-col items-center justify-center h-full">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-4">
                    {['📚', '👥', '🎓', '💡'][index]}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 break-words text-center">{value}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
