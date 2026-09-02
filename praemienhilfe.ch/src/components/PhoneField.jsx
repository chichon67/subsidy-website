// src/components/PhoneField.jsx
import PhoneInput from 'react-phone-number-input';
import de from 'react-phone-number-input/locale/de.json';
import 'react-phone-number-input/style.css';

export { isValidPhoneNumber } from 'react-phone-number-input';

export const DEFAULT_COUNTRY = 'CH';

// Switzerland stays first (site default), France/Germany/Italy pinned right
// after it, then every other supported country — searchable by typing since
// the country select is a native <select>.
const COUNTRY_ORDER = ['CH', 'FR', 'DE', 'IT', '|', '...'];

export default function PhoneField({ value, onChange, error }) {
  return (
    <div>
      <PhoneInput
        international={false}
        defaultCountry={DEFAULT_COUNTRY}
        countryOptionsOrder={COUNTRY_ORDER}
        labels={de}
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
