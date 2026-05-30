const DESIGN_YEAR_FIELD_NAMES = ['design year'];
const DESIGN_YEAR_START = 2010;

const normalizeFieldName = str => {
  return typeof str === 'string'
    ? str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
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
  const candidates = [fieldConfig?.key, fieldLabel].map(normalizeFieldName);

  return candidates.some(candidate => normalizedFieldNames.includes(candidate));
};

const currentYear = () => new Date(Date.now()).getFullYear();

export const designYearOptions = (startYear = DESIGN_YEAR_START, endYear = currentYear()) => {
  const firstYear = Math.min(startYear, endYear);
  const optionCount = endYear - firstYear + 1;

  return Array.from({ length: optionCount }, (_, index) => {
    const year = `${firstYear + index}`;
    return { option: year, label: year };
  });
};

export const isDesignYearField = fieldConfig => {
  return fieldMatchesNames(fieldConfig, DESIGN_YEAR_FIELD_NAMES);
};

export const addDynamicListingFieldOptions = (listingFields = []) => {
  return listingFields.map(fieldConfig =>
    isDesignYearField(fieldConfig)
      ? {
          ...fieldConfig,
          enumOptions: designYearOptions(),
        }
      : fieldConfig
  );
};
