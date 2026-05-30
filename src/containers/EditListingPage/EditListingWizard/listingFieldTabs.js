export const ID_FIELD_TAB = 'id';
export const EDITION_FIELD_TAB = 'edition';
export const INFORMATION_FIELD_TAB = 'information';
export const DETAILS_FIELD_TAB = 'details';

const FIELD_TABS = [ID_FIELD_TAB, EDITION_FIELD_TAB, INFORMATION_FIELD_TAB, DETAILS_FIELD_TAB];
const ID_FIELD_NAMES = ['design year', 'country of production'];
const EDITION_FIELD_NAMES = [
  'edition type',
  'edition details',
  'edition of',
  "artist's proof",
  'artist proof',
  'artists proof',
  'authentication',
];

const normalizeFieldName = str => {
  return typeof str === 'string'
    ? str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/['’]/g, '')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase()
    : null;
};

const fieldMatchesNames = (fieldConfig, fieldNames) => {
  const normalizedFieldNames = fieldNames.map(normalizeFieldName);
  const fieldLabel =
    fieldConfig?.saveConfig?.label ||
    fieldConfig?.showConfig?.label ||
    fieldConfig?.filterConfig?.label;
  const candidates = [
    fieldConfig?.key,
    fieldLabel,
    fieldConfig?.saveConfig?.placeholderMessage,
    fieldConfig?.showConfig?.labelMessage,
  ].map(normalizeFieldName);

  return candidates.some(candidate => normalizedFieldNames.includes(candidate));
};

export const getListingFieldTab = fieldConfig => {
  const configuredTab =
    fieldConfig?.editListingTab ||
    fieldConfig?.saveConfig?.editListingTab ||
    fieldConfig?.showConfig?.editListingTab;

  if (FIELD_TABS.includes(configuredTab)) {
    return configuredTab;
  }

  if (fieldMatchesNames(fieldConfig, ID_FIELD_NAMES)) {
    return ID_FIELD_TAB;
  }

  if (fieldMatchesNames(fieldConfig, EDITION_FIELD_NAMES)) {
    return EDITION_FIELD_TAB;
  }

  return FIELD_TABS.includes(fieldConfig?.key) ? fieldConfig.key : INFORMATION_FIELD_TAB;
};

export const filterListingFieldsForTab = (listingFields = [], tab = INFORMATION_FIELD_TAB) => {
  return listingFields.filter(fieldConfig => getListingFieldTab(fieldConfig) === tab);
};
