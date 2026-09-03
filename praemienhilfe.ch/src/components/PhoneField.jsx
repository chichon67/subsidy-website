// src/components/PhoneField.jsx
import PhoneInput from 'react-phone-number-input';
import de from 'react-phone-number-input/locale/de.json';
import en from 'react-phone-number-input/locale/en.json';
import es from 'react-phone-number-input/locale/es.json';
import 'react-phone-number-input/style.css';

export { isValidPhoneNumber } from 'react-phone-number-input';

export const DEFAULT_COUNTRY = 'CH';

// Switzerland stays first (site default), France/Germany/Italy pinned right
// after it, then every other supported country — searchable by typing since
// the country select is a native <select>.
const COUNTRY_ORDER = ['CH', 'FR', 'DE', 'IT', '|', '...'];

const LABELS_BY_LOCALE = { de, en, es };

export default function PhoneField({ value, onChange, error, locale = 'de' }) {
  return (
    <div>
      <PhoneInput
        international={false}
        defaultCountry={DEFAULT_COUNTRY}
        countryOptionsOrder={COUNTRY_ORDER}
        labels={LABELS_BY_LOCALE[locale] ?? de}
        value={value}
        onChange={onChange}
        placeholder="79 123 45 67"
        className="phone-field"
        numberInputProps={{ className: 'phone-field-input' }}
      />
      {error && <div className="text-swiss-red text-xs mt-1">{error}</div>}
    </div>
  );
}
