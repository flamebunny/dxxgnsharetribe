import React, { useState, useEffect } from 'react';
import { Field, Form as FinalForm, FormSpy } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { displayDescription } from '../../../../util/configHelpers.js';
import { useConfiguration } from '../../../../context/configurationContext.js';
import { EXTENDED_DATA_SCHEMA_TYPES, SCHEMA_TYPE_ENUM, propTypes } from '../../../../util/types';
import {
  isFieldForCategory,
  isFieldForListingType,
  isValidCurrencyForTransactionProcess,
} from '../../../../util/fieldHelpers';
import { maxLength, required, composeValidators } from '../../../../util/validators';

// Import shared components
import {
  Form,
  Button,
  FieldRadioButton,
  FieldSelect,
  FieldTextInput,
  Heading,
  CustomExtendedDataField,
  FieldCheckbox,
  ValidationError,
} from '../../../../components';

// Import modules from this directory
import {
  getMaterialSubcategoryFieldConfig,
  isMaterialsField,
  isMaterialSubcategoryField,
  isMaterialSubcategorySelected,
} from '../materialSubcategoryFields';
import css from './EditListingDetailsForm.module.css';

const TITLE_MAX_LENGTH = 60;

// Show various error messages
const ErrorMessage = props => {
  const { fetchErrors } = props;
  const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
  const errorMessage = updateListingError ? (
    <FormattedMessage id="EditListingDetailsForm.updateFailed" />
  ) : createListingDraftError ? (
    <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
  ) : showListingsError ? (
    <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
  ) : null;

  if (errorMessage) {
    return <p className={css.error}>{errorMessage}</p>;
  }
  return null;
};

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

// Field component that either allows selecting listing type (if multiple types are available)
// or just renders hidden fields:
// - listingType              Set of predefined configurations for each listing type
// - transactionProcessAlias  Initiate correct transaction against Marketplace API
// - unitType                 Main use case: pricing unit
const FieldSelectListingType = props => {
  const {
    name,
    listingTypes,
    hasPredefinedListingType,
    onListingTypeChange,
    formApi,
    formId,
    intl,
  } = props;
  const hasMultipleListingTypes = listingTypes?.length > 1;

  const handleOnChange = value => {
    const selectedListingType = listingTypes.find(config => config.listingType === value);
    formApi.change('transactionProcessAlias', selectedListingType.transactionProcessAlias);
    formApi.change('unitType', selectedListingType.unitType);

    if (onListingTypeChange) {
      onListingTypeChange(selectedListingType);
    }
  };
  const getListingTypeLabel = listingType => {
    const listingTypeConfig = listingTypes.find(config => config.listingType === listingType);
    return listingTypeConfig ? listingTypeConfig.label : listingType;
  };

  return hasMultipleListingTypes && !hasPredefinedListingType ? (
    <>
      <FieldSelect
        id={formId ? `${formId}.${name}` : name}
        name={name}
        className={css.listingTypeSelect}
        label={intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
        validate={required(
          intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeRequired' })
        )}
        onChange={handleOnChange}
      >
        <option disabled value="">
          {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypePlaceholder' })}
        </option>
        {listingTypes.map(config => {
          const type = config.listingType;
          return (
            <option key={type} value={type}>
              {config.label}
            </option>
          );
        })}
      </FieldSelect>
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  ) : hasMultipleListingTypes && hasPredefinedListingType ? (
    <div className={css.listingTypeSelect}>
      <Heading as="h5" rootClassName={css.selectedLabel}>
        {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
      </Heading>
      <p className={css.selectedValue}>{getListingTypeLabel(formApi.getFieldState(name)?.value)}</p>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </div>
  ) : (
    <>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  );
};

// Finds the correct subcategory within the given categories array based on the provided categoryIdToFind.
const findCategoryConfig = (categories, categoryIdToFind) => {
  return categories?.find(category => category.id === categoryIdToFind);
};

/**
 * Recursively render category fields as nested radio groups.
 */
const CategoryField = props => {
  const { currentCategoryOptions, level, values, prefix, handleCategoryChange, intl } = props;

  const currentCategoryKey = `${prefix}${level}`;
  const label = intl.formatMessage(
    { id: 'EditListingIdForm.categoryLabel' },
    { categoryLevel: currentCategoryKey }
  );
  const validationMessage = intl.formatMessage(
    { id: 'EditListingIdForm.categoryRequired' },
    { categoryLevel: currentCategoryKey }
  );

  const selectedCategory = values[currentCategoryKey];

  return currentCategoryOptions ? (
    <Field
      name={currentCategoryKey}
      validate={required(validationMessage)}
      subscription={{ touched: true, error: true, invalid: true }}
    >
      {fieldRenderProps => {
        const { meta } = fieldRenderProps;

        return (
          <fieldset
            className={classNames(css.categoryGroup, css.categoryRadioGroup, {
              [css.subcategoryRadioGroup]: level > 1,
            })}
          >
            {label && level === 1 ? <div className={css.label}>{label}</div> : null}
            <ul className={css.categoryRadioOptions}>
              {currentCategoryOptions.map(option => {
                const optionId = `${currentCategoryKey}.${option.id}`;
                const isChecked = selectedCategory === option.id;
                const hasNestedCategories = option.subcategories?.length > 0;

                return (
                  <li key={option.id} className={css.categoryRadioItem}>
                    <FieldRadioButton
                      id={optionId}
                      name={currentCategoryKey}
                      value={option.id}
                      label={option.name}
                      rootClassName={css.categoryRadioOption}
                      className={classNames({
                        [css.categoryRadioOptionSelected]: isChecked,
                      })}
                      onChange={event => {
                        handleCategoryChange(
                          event.currentTarget.value,
                          level,
                          currentCategoryOptions
                        );
                      }}
                    />
                    {isChecked && hasNestedCategories ? (
                      <div className={css.nestedCategoryRadioGroup}>
                        <CategoryField
                          currentCategoryOptions={option.subcategories}
                          level={level + 1}
                          values={values}
                          prefix={prefix}
                          handleCategoryChange={handleCategoryChange}
                          intl={intl}
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <ValidationError fieldMeta={meta} />
          </fieldset>
        );
      }}
    </Field>
  ) : null;
};

const FieldSelectCategory = props => {
  useEffect(() => {
    checkIfInitialValuesExist();
  }, []);

  const { prefix, listingCategories, formApi, intl, setAllCategoriesChosen, values } = props;

  // Counts the number of selected categories in the form values based on the given prefix.
  const countSelectedCategories = () => {
    return Object.keys(values).filter(key => key.startsWith(prefix)).length;
  };

  // Checks if initial values exist for categories and sets the state accordingly.
  // If initial values exist, it sets `allCategoriesChosen` state to true; otherwise, it sets it to false
  const checkIfInitialValuesExist = () => {
    const count = countSelectedCategories(values, prefix);
    setAllCategoriesChosen(count > 0);
  };

  // If a parent category changes, clear all child category values
  const handleCategoryChange = (category, level, currentCategoryOptions) => {
    const selectedCatLenght = countSelectedCategories();
    if (level < selectedCatLenght) {
      for (let i = selectedCatLenght; i > level; i--) {
        formApi.change(`${prefix}${i}`, null);
      }
    }
    const categoryConfig = findCategoryConfig(currentCategoryOptions, category).subcategories;
    setAllCategoriesChosen(!categoryConfig || categoryConfig.length === 0);
  };

  return (
    <CategoryField
      currentCategoryOptions={listingCategories}
      level={1}
      values={values}
      prefix={prefix}
      handleCategoryChange={handleCategoryChange}
      intl={intl}
    />
  );
};

const createFilterOptions = options => options.map(o => ({ key: `${o.option}`, label: o.label }));

const normalizeFieldName = str =>
  typeof str === 'string'
    ? str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/['’]/g, '')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase()
    : '';

const fieldMatchesName = (fieldConfig, fieldNames) => {
  const label =
    fieldConfig?.saveConfig?.label ||
    fieldConfig?.showConfig?.label ||
    fieldConfig?.filterConfig?.label ||
    fieldConfig?.label ||
    '';
  const normalizedLabel = normalizeFieldName(label);
  const normalizedKey = normalizeFieldName(fieldConfig?.key);

  return fieldNames.some(fieldName => {
    const normalizedFieldName = normalizeFieldName(fieldName);
    return normalizedLabel === normalizedFieldName || normalizedKey === normalizedFieldName;
  });
};

const isEditionTypeField = fieldConfig => {
  return fieldMatchesName(fieldConfig, ['edition type']);
};

const isEditionDetailsField = fieldConfig => {
  return fieldMatchesName(fieldConfig, [
    'edition details',
    'edition of',
    "artist's proof",
    'artist proof',
    'artists proof',
  ]);
};

const isEditionDetailsGroupField = fieldConfig => {
  return fieldMatchesName(fieldConfig, [
    'edition of',
    "artist's proof",
    'artist proof',
    'artists proof',
  ]);
};

const isAuthenticationField = fieldConfig => {
  return fieldMatchesName(fieldConfig, ['authentication']);
};

const isColorsField = fieldConfig => {
  console.log
  return fieldMatchesName(fieldConfig, ['colorId']);
};

const isDimensionField = fieldConfig => {
  return fieldMatchesName(fieldConfig, ['width', 'depth', 'height']);
};

const namespacedFieldName = fieldConfig => {
  const { key, scope = 'public' } = fieldConfig || {};
  return scope === 'public' ? `pub_${key}` : `priv_${key}`;
};

const isLimitedEditionSelected = (values, listingFieldsConfig = []) => {
  const editionTypeField = listingFieldsConfig.find(isEditionTypeField);
  const editionTypeValue = editionTypeField ? values?.[namespacedFieldName(editionTypeField)] : null;
  const selectedOption = editionTypeField?.enumOptions?.find(
    optionConfig => optionConfig.option === editionTypeValue
  );
  const selectedOptionText = `${selectedOption?.option || editionTypeValue || ''} ${
    selectedOption?.label || ''
  }`;

  return selectedOptionText.toLowerCase().includes('limited');
};

const EnumRadioField = props => {
  const { fieldConfig, formId, intl, className } = props;
  const { key, scope = 'public', enumOptions = [], saveConfig = {} } = fieldConfig || {};
  const name = scope === 'public' ? `pub_${key}` : `priv_${key}`;
  const fieldId = formId ? `${formId}.${name}` : name;
  const options = createFilterOptions(enumOptions);
  const label = saveConfig.label || fieldConfig?.label;
  const validateMaybe = saveConfig.isRequired
    ? required(
        saveConfig.requiredMessage ||
          intl.formatMessage({ id: 'EditListingDetailsForm.defaultRequiredMessage' })
      )
    : null;

  return (
    <Field
      name={name}
      validate={validateMaybe}
      subscription={{ touched: true, error: true, invalid: true }}
    >
      {fieldRenderProps => {
        const { meta } = fieldRenderProps;

        return (
          <fieldset className={classNames(css.enumRadioField, className)}>
            {label ? <div className={css.label}>{label}</div> : null}
            <div className={css.enumRadioOptions}>
              {options.map(optionConfig => (
                <FieldRadioButton
                  key={optionConfig.key}
                  id={`${fieldId}.${optionConfig.key}`}
                  name={name}
                  value={optionConfig.key}
                  label={optionConfig.label}
                  rootClassName={css.enumRadioOption}
                  textClassName={css.editionOptionText}
                />
              ))}
            </div>
            <ValidationError fieldMeta={meta} />
          </fieldset>
        );
      }}
    </Field>
  );
};

const MaterialSubcategoryField = props => {
  const { fieldConfig, formId, intl } = props;
  const { key, scope = 'public' } = fieldConfig || {};
  const name = scope === 'public' ? `pub_${key}` : `priv_${key}`;

  return (
    <div className={css.materialSubcategory}>
      <CustomExtendedDataField
        name={name}
        hideLabel
        fieldConfig={fieldConfig}
        defaultRequiredMessage={intl.formatMessage({
          id: 'EditListingDetailsForm.defaultRequiredMessage',
        })}
        formId={formId}
      />
    </div>
  );
};

const MaterialsField = props => {
  const { fieldConfig, listingFieldsConfig, formId, intl } = props;
  const { key, scope = 'public', saveConfig = {}, enumOptions = [] } = fieldConfig || {};
  const name = scope === 'public' ? `pub_${key}` : `priv_${key}`;
  const options = createFilterOptions(enumOptions);

  return (
    <FieldArray name={name}>
      {({ fields, meta }) => (
        <fieldset className={css.materialsField}>
          {saveConfig.label ? <div className={css.label}>{saveConfig.label}</div> : null}
          <ul className={css.materialsList}>
            {options.map(optionConfig => {
              const fieldId = `${formId}.${name}.${optionConfig.key}`;
              const subcategoryFieldConfig = getMaterialSubcategoryFieldConfig(
                optionConfig.key,
                listingFieldsConfig
              );

              return (
                <li key={fieldId} className={css.materialsItem}>
                  <FieldCheckbox
                    id={fieldId}
                    name={fields.name}
                    label={optionConfig.label}
                    value={optionConfig.key}
                  />
                  {subcategoryFieldConfig ? (
                    <MaterialSubcategoryField
                      fieldConfig={subcategoryFieldConfig}
                      formId={formId}
                      intl={intl}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
          {meta.touched && meta.error ? <p className={css.error}>{meta.error}</p> : null}
        </fieldset>
      )}
    </FieldArray>
  );
};

const EditionDetailsFieldGroup = props => {
  const { fields, formId, intl } = props;

  return (
    <fieldset className={css.editionDetailsFieldGroup}>
      <div className={css.label}>
        {intl.formatMessage({ id: 'EditListingDetailsForm.editionDetailsLabel' })}
      </div>
      <div className={css.editionDetailsFields}>
        {fields.map(fieldConfig => {
          const namespacedKey = namespacedFieldName(fieldConfig);

          return (
            <CustomExtendedDataField
              key={namespacedKey}
              name={namespacedKey}
              className={css.editionDetailsInputField}
              labelClassName={css.editionDetailsInputLabel}
              inputRootClass={css.editionDetailsInput}
              hidePlaceholder
              fieldConfig={fieldConfig}
              defaultRequiredMessage={intl.formatMessage({
                id: 'EditListingDetailsForm.defaultRequiredMessage',
              })}
              formId={formId}
            />
          );
        })}
      </div>
    </fieldset>
  );
};

// Add collect data for listing fields (both publicData and privateData) based on configuration
const AddListingFields = props => {
  const {
    listingType,
    listingFieldsConfig,
    selectedCategories,
    formId,
    intl,
    values,
    isEditionTab,
    isInformationTab,
  } = props;
  const targetCategoryIds = Object.values(selectedCategories);
  const limitedEditionSelected = isLimitedEditionSelected(values, listingFieldsConfig);
  let hasRenderedEditionDetailsGroup = false;

  const fields = listingFieldsConfig.reduce((pickedFields, fieldConfig) => {
    const { key, schemaType, scope } = fieldConfig || {};
    const namespacedKey = namespacedFieldName(fieldConfig);

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isProviderScope = ['public', 'private'].includes(scope);
    const isTargetListingType = isFieldForListingType(listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);
    const isSelectedMaterialSubcategory = isMaterialSubcategorySelected(
      values,
      fieldConfig,
      listingFieldsConfig
    );
    const isNestedMaterialSubcategory = isMaterialSubcategoryField(
      fieldConfig,
      listingFieldsConfig
    );
    const isHiddenEditionDetails = isEditionDetailsField(fieldConfig) && !limitedEditionSelected;
    const isEditionDetailsSubfield = isEditionDetailsGroupField(fieldConfig);
    const shouldRenderField =
      isKnownSchemaType &&
      isProviderScope &&
      isTargetListingType &&
      isTargetCategory &&
      isSelectedMaterialSubcategory &&
      !isNestedMaterialSubcategory &&
      !isHiddenEditionDetails;

    if (!shouldRenderField) {
      return pickedFields;
    }

    if (isEditionDetailsSubfield) {
      if (hasRenderedEditionDetailsGroup) {
        return pickedFields;
      }

      hasRenderedEditionDetailsGroup = true;
      const editionDetailsFields = listingFieldsConfig.filter(detailsFieldConfig => {
        const detailsTargetCategory = isFieldForCategory(targetCategoryIds, detailsFieldConfig);

        return (
          isEditionDetailsGroupField(detailsFieldConfig) &&
          isFieldForListingType(listingType, detailsFieldConfig) &&
          detailsTargetCategory
        );
      });

      return [
        ...pickedFields,
        <EditionDetailsFieldGroup
          key="editionDetailsFieldGroup"
          fields={editionDetailsFields}
          formId={formId}
          intl={intl}
        />,
      ];
    }

    const field =
      isMaterialsField(fieldConfig) && schemaType === 'multi-enum' ? (
        <MaterialsField
          key={namespacedKey}
          fieldConfig={fieldConfig}
          listingFieldsConfig={listingFieldsConfig}
          formId={formId}
          intl={intl}
        />
      ) : schemaType === SCHEMA_TYPE_ENUM && isEditionTypeField(fieldConfig) ? (
        <EnumRadioField
          key={namespacedKey}
          fieldConfig={fieldConfig}
          formId={formId}
          intl={intl}
          className={css.editionTypeField}
        />
      ) : (
        <CustomExtendedDataField
          key={namespacedKey}
          name={namespacedKey}
          className={classNames({
            [css.editionCustomField]: isEditionTab,
            [css.authenticationField]: isEditionTab && isAuthenticationField(fieldConfig),
            [css.colorsCustomField]: isColorsField(fieldConfig),
            colorsCustomField: isColorsField(fieldConfig),
            [css.dimensionField]: isInformationTab && isDimensionField(fieldConfig),
          })}
          labelClassName={isEditionTab ? css.editionFieldLabel : null}
          optionLabelClassName={isEditionTab ? css.editionOptionText : null}
          fieldConfig={fieldConfig}
          defaultRequiredMessage={intl.formatMessage({
            id: 'EditListingDetailsForm.defaultRequiredMessage',
          })}
          formId={formId}
        />
      );

    return [...pickedFields, field];
  }, []);

  return <>{fields}</>;
};

// Return configuration for given listingType
const getListingTypeConfig = (config, listingType) => {
  return config.listing.listingTypes?.find(config => config.listingType === listingType);
};

/**
 * Form that asks title, description, transaction process and unit type for pricing
 * In addition, it asks about custom fields according to marketplace-custom-config.js
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.formId] - The form id
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {boolean} props.updated - Whether the form is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.fetchErrors - The fetch errors object
 * @param {propTypes.error} [props.fetchErrors.createListingDraftError] - The create listing draft error
 * @param {propTypes.error} [props.fetchErrors.showListingsError] - The show listings error
 * @param {propTypes.error} [props.fetchErrors.updateListingError] - The update listing error
 * @param {Function} props.pickSelectedCategories - The pick selected categories function
 * @param {Array<Object>} props.selectableListingTypes - The selectable listing types
 * @param {boolean} props.hasPredefinedListingType - Whether the listing type is already saved or predefined through URL
 * @param {propTypes.listingFields} props.listingFieldsConfig - The listing fields config
 * @param {string} props.listingCurrency - The listing currency
 * @param {string} props.saveActionMsg - The save action message
 * @param {boolean} [props.autoFocus] - Whether the form should autofocus
 * @param {Function} props.onListingTypeChange - The listing type change function
 * @param {Function} props.onSubmit - The submit function
 * @returns {JSX.Element}
 */
const EditListingDetailsForm = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        formId = 'EditListingDetailsForm',
        form: formApi,
        handleSubmit,
        onChange,
        onListingTypeChange,
        invalid,
        pristine,
        marketplaceCurrency,
        marketplaceName,
        selectableListingTypes,
        selectableCategories,
        hasPredefinedListingType = false,
        pickSelectedCategories,
        categoryPrefix,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingFieldsConfig = [],
        listingCurrency,
        isIdTab = false,
        isEditionTab = false,
        isInformationTab = false,
        customListingFieldsOnly = false,
        values,
      } = formRenderProps;

      const intl = useIntl();
      const { listingType, transactionProcessAlias, unitType } = values;
      const [allCategoriesChosen, setAllCategoriesChosen] = useState(false);

      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      // Determine the currency to validate:
      // - If editing an existing listing, use the listing's currency.
      // - If creating a new listing, fall back to the default marketplace currency.
      const currencyToCheck = listingCurrency || marketplaceCurrency;

      // Verify if the selected listing type's transaction process supports the chosen currency.
      // This checks compatibility between the transaction process
      // and the marketplace or listing currency.
      const isCompatibleCurrency = isValidCurrencyForTransactionProcess(
        transactionProcessAlias,
        currencyToCheck
      );

      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);

      const hasCategories = selectableCategories && selectableCategories.length > 0;
      const showCategories = listingType && hasCategories;

      const showTitle = hasCategories ? allCategoriesChosen : listingType;

      const config = useConfiguration();
      const listingTypeConfig = getListingTypeConfig(config, listingType);
      const showDescriptionMaybe = displayDescription(listingTypeConfig);
      const showDescription = hasCategories
        ? allCategoriesChosen && showDescriptionMaybe
        : showDescriptionMaybe;

      const showListingFields = customListingFieldsOnly
        ? listingType
        : hasCategories
        ? allCategoriesChosen
        : listingType;

      const classes = classNames(css.root, css.form, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const hasMandatoryListingTypeData = listingType && transactionProcessAlias && unitType;
      const submitDisabled =
        invalid ||
        disabled ||
        submitInProgress ||
        !hasMandatoryListingTypeData ||
        !isCompatibleCurrency;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {onChange ? (
            <FormSpy subscription={{ values: true }} onChange={({ values }) => onChange(values)} />
          ) : null}

          <div className={css.containerGroup}>

            <ErrorMessage fetchErrors={fetchErrors} />

            <FieldSelectListingType
              name="listingType"
              listingTypes={selectableListingTypes}
              hasPredefinedListingType={hasPredefinedListingType}
              onListingTypeChange={onListingTypeChange}
              formApi={formApi}
              formId={formId}
              intl={intl}
            />

            

            {!customListingFieldsOnly && isCompatibleCurrency && (
              <FieldTextInput
                id={`${formId}title`}
                name="title"               
                className={ classNames(css.title, css.fullWidth)}
                type="text"
                label={intl.formatMessage({ id: 'EditListingDetailsForm.title' })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDetailsForm.titlePlaceholder',
                })}
                maxLength={TITLE_MAX_LENGTH}
                validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
                autoFocus={autoFocus}
              />
            )}

            {!customListingFieldsOnly && isCompatibleCurrency && (
              <FieldTextInput
                id={`${formId}description`}
                name="description"
                className={ classNames(css.description, css.fullWidth)}
                type="textarea"
                label={intl.formatMessage({ id: 'EditListingDetailsForm.description' })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDetailsForm.descriptionPlaceholder',
                })}
                validate={required(
                  intl.formatMessage({
                    id: 'EditListingDetailsForm.descriptionRequired',
                  })
                )}
              />
            )}

            {!customListingFieldsOnly && showCategories && isCompatibleCurrency && (
              <div
                className={classNames({
                  [css.idCategoryColumn]: isIdTab,
                  [css.fullWidth]: !isIdTab,
                })}
              >
                <FieldSelectCategory
                  values={values}
                  prefix={categoryPrefix}
                  listingCategories={selectableCategories}
                  formApi={formApi}
                  intl={intl}
                  allCategoriesChosen={allCategoriesChosen}
                  setAllCategoriesChosen={setAllCategoriesChosen}
                />
              </div>
            )}

            {isCompatibleCurrency && (
              <div
                className={classNames(css.customfields, {
                  [css.idCustomFieldsColumn]: isIdTab,
                  [css.editionCustomFields]: isEditionTab,
                  [css.informationCustomFields]: isInformationTab,
                  [css.fullWidth]: !isIdTab,
                })}
              >
                <AddListingFields
                  listingType={listingType}
                  listingFieldsConfig={listingFieldsConfig}
                  selectedCategories={pickSelectedCategories(values)}
                  formId={formId}
                  intl={intl}
                  values={values}
                  isEditionTab={isEditionTab}
                  isInformationTab={isInformationTab}
                />
              </div>
            )}

            {!isCompatibleCurrency && listingType && (
              <p className={css.error}>
                <FormattedMessage
                  id="EditListingDetailsForm.incompatibleCurrency"
                  values={{ marketplaceName, marketplaceCurrency }}
                />
              </p>
            )}

            <Button
              
              className={ classNames(css.submitButton, css.fullWidth)}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
            </div>
        </Form>
      );
    }}
  />
);

export default EditListingDetailsForm;
