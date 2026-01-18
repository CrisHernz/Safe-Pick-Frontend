import React, { useState, useEffect, useMemo } from "react";
import "./PhoneInput.css";

const DEFAULT_COUNTRIES = [
  {
    iso2: "EC",
    name: "Ecuador",
    dialCode: "+593",
    maxLength: 9,
    example: "991234567",
  },
  {
    iso2: "CO",
    name: "Colombia",
    dialCode: "+57",
    maxLength: 10,
    example: "3211234567",
  },
  {
    iso2: "MX",
    name: "México",
    dialCode: "+52",
    maxLength: 10,
    example: "5512345678",
  },
  {
    iso2: "PE",
    name: "Perú",
    dialCode: "+51",
    maxLength: 9,
    example: "912345678",
  },
  {
    iso2: "CL",
    name: "Chile",
    dialCode: "+56",
    maxLength: 9,
    example: "912345678",
  },
  {
    iso2: "AR",
    name: "Argentina",
    dialCode: "+54",
    maxLength: 10,
    example: "9112345678",
  },
  {
    iso2: "US",
    name: "Estados Unidos",
    dialCode: "+1",
    maxLength: 10,
    example: "4151234567",
  },
  {
    iso2: "ES",
    name: "España",
    dialCode: "+34",
    maxLength: 9,
    example: "612345678",
  },
];

const sanitizeDigits = (value = "") => value.replace(/\D/g, "");

function PhoneInput({
  label = "Teléfono",
  id = "phone-input",
  name = "phone",
  value = "",
  onChange,
  required = false,
  disabled = false,
  error = "",
  helperText = "Ingresa solo números después del código del país.",
  countries = DEFAULT_COUNTRIES,
}) {
  const defaultCountry = useMemo(() => countries[0], [countries]);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [nationalNumber, setNationalNumber] = useState("");

  const emitChange = (country, localNumber) => {
    if (!onChange) return;
    if (!localNumber) {
      onChange("");
      return;
    }
    onChange(`${country.dialCode}${localNumber}`);
  };

  useEffect(() => {
    if (!value) {
      if (nationalNumber || selectedCountry.iso2 !== defaultCountry.iso2) {
        setSelectedCountry(defaultCountry);
        setNationalNumber("");
      }
      return;
    }

    const match = countries.find((country) =>
      value.startsWith(country.dialCode),
    );
    const targetCountry = match || defaultCountry;
    const localDigits = match
      ? value.slice(match.dialCode.length)
      : value.replace(/^\+/, "");

    const trimmedDigits = targetCountry.maxLength
      ? sanitizeDigits(localDigits).slice(0, targetCountry.maxLength)
      : sanitizeDigits(localDigits);

    const currentValue = selectedCountry.dialCode + nationalNumber;
    const incomingValue = targetCountry.dialCode + trimmedDigits;

    if (
      selectedCountry.iso2 !== targetCountry.iso2 ||
      currentValue !== incomingValue
    ) {
      setSelectedCountry(targetCountry);
      setNationalNumber(trimmedDigits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, countries, defaultCountry]);

  const handleCountryChange = (event) => {
    const iso = event.target.value;
    const nextCountry =
      countries.find((country) => country.iso2 === iso) || defaultCountry;
    const trimmedNumber = nextCountry.maxLength
      ? nationalNumber.slice(0, nextCountry.maxLength)
      : nationalNumber;

    setSelectedCountry(nextCountry);
    setNationalNumber(trimmedNumber);
    emitChange(nextCountry, trimmedNumber);
  };

  const handleNumberChange = (event) => {
    const digitsOnly = sanitizeDigits(event.target.value);
    const trimmedDigits = selectedCountry.maxLength
      ? digitsOnly.slice(0, selectedCountry.maxLength)
      : digitsOnly;

    setNationalNumber(trimmedDigits);
    emitChange(selectedCountry, trimmedDigits);
  };

  return (
    <div className={`phone-input ${error ? "has-error" : ""}`}>
      {label && (
        <label htmlFor={id} className="phone-input-label">
          {label} {required && <span className="phone-input-required">*</span>}
        </label>
      )}

      <div className="phone-input-control">
        <select
          className="phone-input-select"
          value={selectedCountry.iso2}
          onChange={handleCountryChange}
          disabled={disabled}
          name={`${name}-country`}
        >
          {countries.map((country) => (
            <option key={country.iso2} value={country.iso2}>
              {country.name} ({country.dialCode})
            </option>
          ))}
        </select>

        <input
          id={id}
          name={name}
          type="tel"
          className="phone-input-field"
          placeholder={selectedCountry.example}
          value={nationalNumber}
          onChange={handleNumberChange}
          disabled={disabled}
          required={required}
        />
      </div>

      <div className="phone-input-hint">
        {selectedCountry.dialCode} • {selectedCountry.maxLength || ""} dígitos
      </div>

      {helperText && <p className="phone-input-helper">{helperText}</p>}
      {error && <p className="phone-input-error">{error}</p>}
    </div>
  );
}

export default PhoneInput;
