const MATERIALS_FIELD_KEY = 'materials';
const MATERIAL_SUBCATEGORY_PREFIX = 'material';

const namespacedKey = fieldConfig => {
  const { key, scope = 'public' } = fieldConfig || {};
  return `${scope === 'public' ? 'pub' : 'priv'}_${key}`;
};

const toPascalCase = value =>
  `${value || ''}`
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');

const getMaterialsFieldConfig = listingFieldConfigs =>
  listingFieldConfigs.find(fieldConfig => fieldConfig?.key === MATERIALS_FIELD_KEY);

export const isMaterialsField = fieldConfig => fieldConfig?.key === MATERIALS_FIELD_KEY;

export const isMaterialSubcategoryField = (fieldConfig, listingFieldConfigs = []) =>
  !!getMaterialSubcategoryOption(fieldConfig, listingFieldConfigs);

export const getMaterialSubcategoryFieldConfig = (materialOption, listingFieldConfigs = []) => {
  const expectedKey = `${MATERIAL_SUBCATEGORY_PREFIX}${toPascalCase(materialOption)}`;
  return listingFieldConfigs.find(fieldConfig => fieldConfig?.key === expectedKey);
};

export const getMaterialSubcategoryOption = (fieldConfig, listingFieldConfigs = []) => {
  const key = fieldConfig?.key || '';
  const materialsFieldConfig = getMaterialsFieldConfig(listingFieldConfigs);

  if (
    !materialsFieldConfig ||
    !key.startsWith(MATERIAL_SUBCATEGORY_PREFIX) ||
    key === MATERIALS_FIELD_KEY
  ) {
    return null;
  }

  return materialsFieldConfig.enumOptions?.find(
    optionConfig => key === `${MATERIAL_SUBCATEGORY_PREFIX}${toPascalCase(optionConfig.option)}`
  )?.option;
};

export const isMaterialSubcategorySelected = (values, fieldConfig, listingFieldConfigs = []) => {
  const materialOption = getMaterialSubcategoryOption(fieldConfig, listingFieldConfigs);

  if (!materialOption) {
    return true;
  }

  const materialsFieldConfig = getMaterialsFieldConfig(listingFieldConfigs);
  const selectedMaterials = values?.[namespacedKey(materialsFieldConfig)] || [];

  return selectedMaterials.includes(materialOption);
};
