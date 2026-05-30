import {
  addDynamicListingFieldOptions,
  designYearOptions,
  isDesignYearField,
} from './dynamicListingFieldOptions';

describe('dynamicListingFieldOptions', () => {
  it('creates design year options from 2010 through the current year', () => {
    expect(designYearOptions(2010, 2012)).toEqual([
      { option: '2010', label: '2010' },
      { option: '2011', label: '2011' },
      { option: '2012', label: '2012' },
    ]);
  });

  it('matches design year by key or configured label', () => {
    expect(isDesignYearField({ key: 'designYear' })).toBe(true);
    expect(isDesignYearField({ key: 'year', saveConfig: { label: 'Design year' } })).toBe(true);
    expect(isDesignYearField({ key: 'editionType' })).toBe(false);
  });

  it('replaces hosted design year enum options with generated options', () => {
    const fields = [
      {
        key: 'designYear',
        enumOptions: [{ option: '2010', label: '2010' }],
      },
      {
        key: 'editionType',
        enumOptions: [{ option: 'limited', label: 'Limited' }],
      },
    ];

    expect(addDynamicListingFieldOptions(fields)[0].enumOptions).toContainEqual({
      option: `${new Date(Date.now()).getFullYear()}`,
      label: `${new Date(Date.now()).getFullYear()}`,
    });
    expect(addDynamicListingFieldOptions(fields)[1].enumOptions).toEqual(fields[1].enumOptions);
  });
});
