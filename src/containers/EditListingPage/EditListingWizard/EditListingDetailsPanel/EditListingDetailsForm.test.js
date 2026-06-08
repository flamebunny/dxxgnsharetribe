import React from 'react';
import '@testing-library/jest-dom';

import { pickCategoryFields } from '../../../../util/fieldHelpers';
import { fakeIntl } from '../../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import EditListingDetailsForm from './EditListingDetailsForm';

const { screen, userEvent } = testingLibrary;

const noop = () => null;

describe('EditListingDetailsForm', () => {
  it('Check that shipping fees can be given and submit button activates', async () => {
    const user = userEvent.setup();
    const saveActionMsg = 'Save details';

    const selectableListingTypes = [
      {
        listingType: 'sell-bicycles',
        transactionProcessAlias: 'default-purchase/release-1',
        unitType: 'item',
      },
    ];

    const listingFieldsConfig = [
      {
        key: 'clothing',
        scope: 'public',
        listingTypeConfig: {
          limitToListingTypeIds: true,
          listingTypeIds: ['sell-bicycles'],
        },
        schemaType: 'enum',
        enumOptions: [
          { option: 'men', label: 'Men' },
          { option: 'women', label: 'Women' },
          { option: 'kids', label: 'Kids' },
        ],
        filterConfig: {
          showFilter: true,
          label: 'Clothing',
        },
        showConfig: {
          label: 'Clothing',
          isDetail: true,
        },
        saveConfig: {
          label: 'Clothing',
        },
      },
      {
        key: 'amenities',
        scope: 'public',
        listingTypeConfig: {
          limitToListingTypeIds: true,
          listingTypeIds: ['rent-bicycles-daily', 'rent-bicycles-nightly', 'rent-bicycles-hourly'],
        },
        schemaType: 'multi-enum',
        enumOptions: [
          { option: 'towels', label: 'Towels' },
          { option: 'bathroom', label: 'Bathroom' },
          { option: 'swimming_pool', label: 'Swimming pool' },
          { option: 'barbeque', label: 'Barbeque' },
        ],
        filterConfig: {
          showFilter: true,
          label: 'Amenities',
        },
        showConfig: {
          label: 'Amenities',
        },
        saveConfig: {
          label: 'Amenities',
        },
      },
    ];

    render(
      <EditListingDetailsForm
        intl={fakeIntl}
        dispatch={noop}
        onListingTypeChange={noop}
        onSubmit={v => v}
        saveActionMsg={saveActionMsg}
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
        listingFieldsConfig={listingFieldsConfig}
        categoryPrefix="categoryLevel"
        selectableCategories={[]}
        pickSelectedCategories={values => pickCategoryFields(values, 'categoryLevel', 1, [])}
        selectableListingTypes={selectableListingTypes}
        hasExistingListingType={true}
        initialValues={selectableListingTypes[0]}
        marketplaceCurrency="EUR"
      />
    );

    // Pickup fields
    const title = 'EditListingDetailsForm.title';
    expect(screen.getByText(title)).toBeInTheDocument();

    const description = 'EditListingDetailsForm.description';
    expect(screen.getByText(description)).toBeInTheDocument();

    // Test that save button is disabled at first
    expect(screen.getByRole('button', { name: saveActionMsg })).toBeDisabled();

    // Fill mandatory attributes
    await user.type(screen.getByRole('textbox', { name: title }), 'My Listing');
    await user.type(screen.getByRole('textbox', { name: description }), 'Lorem ipsum');

    // Fill custom listing field
    await user.selectOptions(screen.getByLabelText('Clothing'), 'kids');

    // Test that save button is enabled
    expect(screen.getByRole('button', { name: saveActionMsg })).toBeEnabled();
  });

  it('shows material subcategory fields below their matching material option', async () => {
    const user = userEvent.setup();
    const selectableListingTypes = [
      {
        listingType: 'sell-bicycles',
        transactionProcessAlias: 'default-purchase/release-1',
        unitType: 'item',
      },
    ];
    const sharedConfig = {
      scope: 'public',
      listingTypeConfig: {
        limitToListingTypeIds: true,
        listingTypeIds: ['sell-bicycles'],
      },
      schemaType: 'multi-enum',
      showConfig: {},
    };
    const listingFieldsConfig = [
      {
        ...sharedConfig,
        key: 'materials',
        enumOptions: [
          { option: 'ceramics', label: 'Ceramics' },
          { option: 'glass', label: 'Glass' },
        ],
        saveConfig: { label: 'Materials' },
      },
      {
        ...sharedConfig,
        key: 'materialCeramics',
        enumOptions: [{ option: 'bricks', label: 'Bricks' }],
        saveConfig: { label: 'Ceramic materials' },
      },
      {
        ...sharedConfig,
        key: 'materialGlass',
        enumOptions: [{ option: 'blown-glass', label: 'Blown glass' }],
        saveConfig: { label: 'Glass materials' },
      },
    ];

    render(
      <EditListingDetailsForm
        intl={fakeIntl}
        dispatch={noop}
        onListingTypeChange={noop}
        onSubmit={v => v}
        saveActionMsg="Save details"
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
        listingFieldsConfig={listingFieldsConfig}
        categoryPrefix="categoryLevel"
        selectableCategories={[]}
        pickSelectedCategories={values => pickCategoryFields(values, 'categoryLevel', 1, [])}
        selectableListingTypes={selectableListingTypes}
        hasExistingListingType={true}
        initialValues={selectableListingTypes[0]}
        marketplaceCurrency="EUR"
        customListingFieldsOnly
      />
    );

    expect(screen.queryByText('Ceramic materials')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Bricks')).toBeInTheDocument();
    expect(screen.getByLabelText('Blown glass')).toBeInTheDocument();
    expect(screen.queryByText('Glass materials')).not.toBeInTheDocument();

    const materialsField = screen.getByText('Materials').closest('fieldset');
    const ceramicsOption = screen.getByLabelText('Ceramics');
    const glassOption = screen.getByLabelText('Glass');
    const ceramicMaterials = screen.getByLabelText('Bricks');
    const glassMaterials = screen.getByLabelText('Blown glass');

    expect(materialsField).toContainElement(ceramicMaterials);
    expect(materialsField).toContainElement(glassMaterials);
    expect(ceramicsOption.compareDocumentPosition(ceramicMaterials)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(ceramicMaterials.compareDocumentPosition(glassOption)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(glassOption.compareDocumentPosition(glassMaterials)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );

    expect(ceramicsOption).not.toBeChecked();
    await user.click(ceramicMaterials);
    expect(ceramicsOption).toBeChecked();
  });

  it('renders categories and nested subcategories as radio buttons', async () => {
    const user = userEvent.setup();
    const selectableListingTypes = [
      {
        listingType: 'sell-bicycles',
        transactionProcessAlias: 'default-purchase/release-1',
        unitType: 'item',
      },
    ];
    const selectableCategories = [
      {
        id: 'objects',
        name: 'Objects',
        subcategories: [
          { id: 'chairs', name: 'Chairs' },
          { id: 'tables', name: 'Tables' },
        ],
      },
      {
        id: 'lighting',
        name: 'Lighting',
        subcategories: [{ id: 'lamps', name: 'Lamps' }],
      },
    ];

    render(
      <EditListingDetailsForm
        intl={fakeIntl}
        dispatch={noop}
        onListingTypeChange={noop}
        onSubmit={v => v}
        saveActionMsg="Save details"
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
        listingFieldsConfig={[]}
        categoryPrefix="categoryLevel"
        selectableCategories={selectableCategories}
        pickSelectedCategories={values =>
          pickCategoryFields(values, 'categoryLevel', 1, selectableCategories)
        }
        selectableListingTypes={selectableListingTypes}
        hasExistingListingType={true}
        initialValues={selectableListingTypes[0]}
        marketplaceCurrency="EUR"
      />
    );

    expect(screen.queryByRole('combobox', { name: 'EditListingIdForm.categoryLabel' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Objects' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Chairs' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Objects' }));

    expect(screen.getByRole('radio', { name: 'Objects' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Chairs' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Tables' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Lighting' }));

    expect(screen.getByRole('radio', { name: 'Lighting' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: 'Chairs' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Lamps' })).toBeInTheDocument();
  });

  it('renders edition type as radio buttons', async () => {
    const user = userEvent.setup();
    const selectableListingTypes = [
      {
        listingType: 'sell-bicycles',
        transactionProcessAlias: 'default-purchase/release-1',
        unitType: 'item',
      },
    ];
    const listingFieldsConfig = [
      {
        key: 'editionType',
        scope: 'public',
        schemaType: 'enum',
        enumOptions: [
          { option: 'unique', label: 'Unique' },
          { option: 'limited', label: 'Limited edition' },
        ],
        saveConfig: {
          label: 'Edition Type',
        },
      },
      {
        key: 'editionOf',
        scope: 'public',
        schemaType: 'long',
        saveConfig: {
          label: 'Edition of',
        },
      },
      {
        key: 'artistProof',
        scope: 'public',
        schemaType: 'long',
        saveConfig: {
          label: "Artist's proof",
        },
      },
    ];

    render(
      <EditListingDetailsForm
        intl={fakeIntl}
        dispatch={noop}
        onListingTypeChange={noop}
        onSubmit={v => v}
        saveActionMsg="Save details"
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
        listingFieldsConfig={listingFieldsConfig}
        categoryPrefix="categoryLevel"
        selectableCategories={[]}
        pickSelectedCategories={values => pickCategoryFields(values, 'categoryLevel', 1, [])}
        selectableListingTypes={selectableListingTypes}
        hasExistingListingType={true}
        initialValues={selectableListingTypes[0]}
        marketplaceCurrency="EUR"
        customListingFieldsOnly
      />
    );

    expect(screen.queryByRole('combobox', { name: 'Edition Type' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Unique' })).toBeInTheDocument();
    expect(screen.queryByText('EditListingDetailsForm.editionDetailsLabel')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: 'Edition of' })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: "Artist's proof" })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Limited edition' }));

    expect(screen.getByRole('radio', { name: 'Limited edition' })).toBeChecked();
    expect(screen.getByText('EditListingDetailsForm.editionDetailsLabel')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Edition of' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: "Artist's proof" })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Unique' }));

    expect(screen.queryByText('EditListingDetailsForm.editionDetailsLabel')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: 'Edition of' })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: "Artist's proof" })).not.toBeInTheDocument();
  });
});
