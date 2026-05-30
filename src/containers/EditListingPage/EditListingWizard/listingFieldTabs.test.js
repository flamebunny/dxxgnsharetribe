import {
  DETAILS_FIELD_TAB,
  EDITION_FIELD_TAB,
  ID_FIELD_TAB,
  INFORMATION_FIELD_TAB,
  filterListingFieldsForTab,
  getListingFieldTab,
} from './listingFieldTabs';

describe('listingFieldTabs', () => {
  it('assigns id fields by key or configured label', () => {
    expect(getListingFieldTab({ key: 'designYear' })).toEqual(ID_FIELD_TAB);
    expect(getListingFieldTab({ key: 'country_of_production' })).toEqual(ID_FIELD_TAB);
    expect(
      getListingFieldTab({ key: 'country', saveConfig: { label: 'Country of production' } })
    ).toEqual(ID_FIELD_TAB);
  });

  it('assigns edition fields by key or configured label', () => {
    expect(getListingFieldTab({ key: 'editionType' })).toEqual(EDITION_FIELD_TAB);
    expect(getListingFieldTab({ key: 'edition_details' })).toEqual(EDITION_FIELD_TAB);
    expect(getListingFieldTab({ key: 'editionOf' })).toEqual(EDITION_FIELD_TAB);
    expect(getListingFieldTab({ key: 'artistProof' })).toEqual(EDITION_FIELD_TAB);
    expect(getListingFieldTab({ key: 'proof', saveConfig: { label: "Artist's proof" } })).toEqual(
      EDITION_FIELD_TAB
    );
    expect(getListingFieldTab({ key: 'auth', saveConfig: { label: 'Authentication' } })).toEqual(
      EDITION_FIELD_TAB
    );
  });

  it('keeps unrelated fields on information tab', () => {
    const fields = [
      { key: 'designYear' },
      { key: 'editionType' },
      { key: 'materials', saveConfig: { label: 'Materials' } },
      { key: 'auth', showConfig: { label: 'Authentication' } },
      { key: 'details', saveConfig: { label: 'Detailed notes' } },
    ];

    expect(filterListingFieldsForTab(fields, ID_FIELD_TAB)).toEqual([fields[0]]);
    expect(filterListingFieldsForTab(fields, EDITION_FIELD_TAB)).toEqual([fields[1], fields[3]]);
    expect(filterListingFieldsForTab(fields, INFORMATION_FIELD_TAB)).toEqual([fields[2]]);
    expect(filterListingFieldsForTab(fields, DETAILS_FIELD_TAB)).toEqual([fields[4]]);
  });
});
