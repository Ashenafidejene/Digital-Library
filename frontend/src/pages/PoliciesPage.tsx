import React from 'react';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const PoliciesPage: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Library Policies",
      policies: [
        { title: "Membership Policy", text: "Free membership available to all Yeka Sub City residents. Valid ID required for registration." },
        { title: "Borrowing Policy", text: "Members can borrow up to 5 books for 14 days. Renewals allowed if no holds exist." },
        { title: "Fines & Fees", text: "Late returns: 5 Birr per day. Lost books: Replacement cost plus 50 Birr processing fee." },
        { title: "Code of Conduct", text: "Maintain quiet atmosphere, respect others, no food or drinks in reading areas." },
        { title: "Privacy Policy", text: "We protect your personal information and reading history. Data used only for library services." }
      ]
    },
    am: {
      title: "የቤተ መጻሕፍት ፖሊሲዎች",
      policies: [
        { title: "የአባልነት ፖሊሲ", text: "ለሁሉም የየካ ክፍለ ከተማ ተጠቃሚዎች በነጻ አባልነት። ለመመዝገብ ትክክለኛ መታወቂያ ያስፈልጋል።" },
        { title: "የመበደር ፖሊሲ", text: "አባላት እስከ 5 መጻሕፍት ለ 14 ቀናት ማበደር ይችላሉ። የማደስ ፍልንቶች የተፈቀዱ እስከማይገኙ ድረስ።" },
        { title: "ቅጣቶች እና ውሎች", text: "የዘግይት ድረስ: በቀን 5 ብር። የተጠፉ መጻሕፍት: የመተካት ውል አድቶ 50 ብር የአገልግሎት ውል።" },
        { title: "የስልክ ከደብ", text: "ሰቅጣ አካባቢ ያዘጉ፣ ሌሎችን ያከብሩ፣ በንባብ አካባቢዎች ምግብ ወይም መጠጥ አይፈቅድም።" },
        { title: "የግላዊነት ፖሊሲ", text: "የእርስዎን የስም ውድድር እና የንባብ ሰናዎችን እንገና። ውድድር ለቤተ መጻሕፍት አገልግሎቶች ብቻ ይውላል።" }
      ]
    },
    om: {
      title: "Imaammata Mana Kitaabaa",
      policies: [
        { title: "Imaammata Miseensummaa", text: "Jiraattota Aanaa Magaalaa Yeekaa hundaaf miseensummaa bilisaa. Eenyummaa sirrii ta'e galmeeffachuuf barbaachisa." },
        { title: "Imaammata Liqeessuu", text: "Miseensonni hanga kitaabota 5 guyyaa 14f liqeessuu danda'u. Haaromsuun hayyamama yoo qabannaan hin jiraanne." },
        { title: "Adabbii fi Kaffaltii", text: "Yeroo darbee deebisuu: guyyaatti qarshii 5. Kitaabota badanii: gatii bakka bu'iinsaa dabalatee qarshii 50 kaffaltii adeemsa." },
        { title: "Seera Amala", text: "Naannoo tasgabbaa'aa eeguu, namoota biroo kabajuu, naannoo dubbisaa keessatti nyaata ykn dhugaatii hin hayyamamne." },
        { title: "Imaammata Dhuunfachisummaa", text: "Odeeffannoo dhuunfaa fi seenaa dubbisaa keessan ni eegna. Daataan tajaajila mana kitaabaatiif qofa ni fayyadama." }
      ]
    }
  };

  const data = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 sm:mb-12">{data.title}</h1>
        
        <div className="space-y-6 sm:space-y-8">
          {data.policies.map((policy, index) => (
            <div key={index} className="card">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-2 sm:mb-3 break-words">{policy.title}</h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed break-words">{policy.text}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliciesPage;
