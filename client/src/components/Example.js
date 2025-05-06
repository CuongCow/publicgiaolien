import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

function Example() {
  const { language } = useLanguage();
  
  return (
    <div>
      <h1>{translations[language].welcome}</h1>
    </div>
  );
}

export default Example; 