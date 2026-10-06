/** Default registrant contact for OTE/production registration (server env only). */
export function defaultRegistrantContact() {
  return {
    FirstName:
      process.env.DOMAIN_REGISTRANT_FIRST_NAME?.trim() || "HostingBeyond",
    LastName: process.env.DOMAIN_REGISTRANT_LAST_NAME?.trim() || "Registrant",
    Company: process.env.DOMAIN_REGISTRANT_COMPANY?.trim() || "HostingBeyond",
    EMail:
      process.env.DOMAIN_REGISTRANT_EMAIL?.trim() || "domains-ote@example.com",
    AddressLine1:
      process.env.DOMAIN_REGISTRANT_ADDRESS?.trim() || "1 Main Street",
    AddressLine2: "",
    City: process.env.DOMAIN_REGISTRANT_CITY?.trim() || "Wilmington",
    State: process.env.DOMAIN_REGISTRANT_STATE?.trim() || "DE",
    Country: process.env.DOMAIN_REGISTRANT_COUNTRY?.trim() || "US",
    ZipCode: process.env.DOMAIN_REGISTRANT_ZIP?.trim() || "19801",
    Phone: process.env.DOMAIN_REGISTRANT_PHONE?.trim() || "5555550100",
    PhoneCountryCode: process.env.DOMAIN_REGISTRANT_PHONE_CC?.trim() || "1",
    Fax: "",
    FaxCountryCode: "",
    Type: "Contact",
  };
}

export function defaultRegistrationContacts() {
  const c = defaultRegistrantContact();
  return {
    Registrant: c,
    Administrative: c,
    Billing: c,
    Technical: c,
  };
}

export function defaultNameservers(): string[] {
  const raw = process.env.DOMAIN_DEFAULT_NAMESERVERS?.trim();
  if (raw) {
    return raw.split(/[\s,]+/).filter(Boolean);
  }
  return ["ns1.hostingbeyond.com", "ns2.hostingbeyond.com"];
}
