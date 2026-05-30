import {
  getMaterialSubcategoryOption,
  isMaterialSubcategorySelected,
} from './materialSubcategoryFields';

describe('materialSubcategoryFields', () => {
  const listingFieldConfigs = [
    {
      key: 'materials',
      scope: 'public',
      enumOptions: [
        { option: 'ceramics', label: 'Ceramics' },
        { option: 'stained-glass', label: 'Stained glass' },
      ],
    },
    { key: 'materialCeramics', scope: 'public' },
    { key: 'materialStainedGlass', scope: 'public' },
  ];

  it('maps material subcategory field keys to parent material options', () => {
    expect(getMaterialSubcategoryOption(listingFieldConfigs[1], listingFieldConfigs)).toEqual(
      'ceramics'
    );
    expect(getMaterialSubcategoryOption(listingFieldConfigs[2], listingFieldConfigs)).toEqual(
      'stained-glass'
    );
  });

  it('shows material subcategory fields only when the matching parent material is selected', () => {
    const values = { pub_materials: ['ceramics'] };

    expect(isMaterialSubcategorySelected(values, listingFieldConfigs[1], listingFieldConfigs)).toBe(
      true
    );
    expect(isMaterialSubcategorySelected(values, listingFieldConfigs[2], listingFieldConfigs)).toBe(
      false
    );
  });
});
