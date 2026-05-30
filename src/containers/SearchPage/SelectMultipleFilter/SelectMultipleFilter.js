import React from 'react';
import classNames from 'classnames';

import { useIntl } from '../../../util/reactIntl';
import { constructQueryParamName, parseSelectFilterOptions } from '../../../util/search';
import { SCHEMA_TYPE_ENUM, SCHEMA_TYPE_MULTI_ENUM } from '../../../util/types';

import { FieldCheckbox } from '../../../components';
import { getMaterialSubcategoryOption } from '../../EditListingPage/EditListingWizard/materialSubcategoryFields';

import FilterPlain from '../FilterPlain/FilterPlain';
import FilterPopup from '../FilterPopup/FilterPopup';

import css from './SelectMultipleFilter.module.css';

// SelectMultipleFilter doesn't need array mutators since it doesn't require validation.
// TODO: Live edit didn't work with FieldCheckboxGroup
//       There's a mutation problem: formstate.dirty is not reliable with it.
const GroupOfFieldCheckboxes = props => {
  const { id, className, name, options, legend, materialSubcategoryFilters = [] } = props;

  const subcategoryFilterByMaterial = materialSubcategoryFilters.reduce((picked, fieldConfig) => {
    const materialOption = getMaterialSubcategoryOption(fieldConfig, [
      { key: 'materials', enumOptions: options },
      ...materialSubcategoryFilters,
    ]);
    return materialOption ? { ...picked, [materialOption]: fieldConfig } : picked;
  }, {});

  return (
    <fieldset className={className}>
      {legend ? <legend className={css.accessibilityLegend}>{legend}</legend> : null}
      <ul className={css.list}>
        {options.map(optionConfig => {
          const { option, label } = optionConfig;
          const fieldId = `${id}.${option}`;
          const subcategoryFilter = subcategoryFilterByMaterial[option];
          const subcategoryName = subcategoryFilter?.key?.replace(/\s+/g, '-');
          const subcategoryOptions = subcategoryFilter?.enumOptions || [];
          const showSubcategory = subcategoryOptions.length > 0;

          return (
            <li key={fieldId} className={css.item}>
              <FieldCheckbox id={fieldId} name={name} label={label} value={option} />
              {showSubcategory ? (
                <ul className={css.subcategoryList}>
                  {subcategoryOptions.map(subcategoryOptionConfig => {
                    const subcategoryOption = subcategoryOptionConfig.option;
                    const subcategoryLabel = subcategoryOptionConfig.label;
                    const subcategoryFieldId = `${fieldId}.${subcategoryOption}`;

                    return (
                      <li key={subcategoryFieldId} className={css.subcategoryItem}>
                        <FieldCheckbox
                          id={subcategoryFieldId}
                          name={subcategoryName}
                          label={subcategoryLabel}
                          value={subcategoryOption}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
};

const getQueryParamName = queryParamNames => {
  return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
};

const getNamespacedFilterName = fieldConfig => fieldConfig?.key?.replace(/\s+/g, '-');

// Format URI component's query param: { pub_key: 'has_all:a,b,c' }
const format = (selectedOptions, queryParamName, schemaType, searchMode) => {
  const hasOptionsSelected = selectedOptions && selectedOptions.length > 0;
  const mode = schemaType === SCHEMA_TYPE_MULTI_ENUM && searchMode ? `${searchMode}:` : '';
  const value = hasOptionsSelected ? `${mode}${selectedOptions.join(',')}` : null;
  return { [queryParamName]: value };
};

/**
 * SelectMultipleFilter component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} props.id - The id
 * @param {string} props.name - The name
 * @param {node} props.label - The label
 * @param {Function} props.getAriaLabel - The function to retrieve the aria label for the component
 * @param {Array<string>} props.queryParamNames - The query param names
 * @param {Object} props.initialValues - The initial values
 * @param {Function} props.onSubmit - The function to handle the submit
 * @param {Array<Object>} props.options - The options
 * @param {SCHEMA_TYPE_ENUM | SCHEMA_TYPE_MULTI_ENUM} props.schemaType - The schema type
 * @param {'has_all' | 'has_any'} props.searchMode - The search mode
 * @param {boolean} [props.showAsPopup] - Whether to show as popup
 * @param {number} [props.contentPlacementOffset] - The content placement offset
 * @returns {JSX.Element}
 */
const SelectMultipleFilter = props => {
  const intl = useIntl();
  const {
    rootClassName,
    className,
    id,
    name,
    label,
    getAriaLabel,
    options,
    initialValues,
    contentPlacementOffset = 0,
    onSubmit,
    queryParamNames,
    schemaType,
    searchMode,
    materialSubcategoryFilters = [],
    isMaterialsFilter = false,
    isColorsFilter = false,
    showAsPopup,
    plainClassName: plainClassNameProp,
    popupContentClassName: popupContentClassNameProp,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className, {
    [css.materialsFilter]: isMaterialsFilter,
    [css.colorsFilter]: isColorsFilter,
  });
  const popupContentClassName = classNames(popupContentClassNameProp, {
    [css.materialsFilterContent]: isMaterialsFilter,
    [css.colorsFilterContent]: isColorsFilter,
  });
  const plainClassName = classNames(plainClassNameProp, {
    [css.materialsFilterContent]: isMaterialsFilter,
    [css.colorsFilterContent]: isColorsFilter,
  });

  const queryParamName = getQueryParamName(queryParamNames);
  const hasInitialValues = !!initialValues && !!initialValues[queryParamName];
  // Parse options from param strings like "has_all:a,b,c" or "a,b,c"
  const selectedOptions = hasInitialValues
    ? parseSelectFilterOptions(initialValues[queryParamName])
    : [];

  const labelForPopup = hasInitialValues
    ? intl.formatMessage(
        { id: 'SelectMultipleFilter.labelSelected' },
        { labelText: label, count: selectedOptions.length }
      )
    : label;

  const labelSelectionForPlain = hasInitialValues
    ? intl.formatMessage(
        { id: 'SelectMultipleFilterPlainForm.labelSelected' },
        { count: selectedOptions.length }
      )
    : '';

  // pass the initial values with the name key so that
  // they can be passed to the correct field
  const subcategoryInitialValues = materialSubcategoryFilters.reduce((picked, fieldConfig) => {
    const subcategoryQueryParamName = constructQueryParamName(fieldConfig.key, fieldConfig.scope);
    const selectedSubcategoryOptions = initialValues?.[subcategoryQueryParamName]
      ? parseSelectFilterOptions(initialValues[subcategoryQueryParamName])
      : [];
    const subcategoryName = getNamespacedFilterName(fieldConfig);

    return selectedSubcategoryOptions.length > 0
      ? { ...picked, [subcategoryName]: selectedSubcategoryOptions }
      : picked;
  }, {});
  const namedInitialValues = { [name]: selectedOptions, ...subcategoryInitialValues };

  const handleSubmit = values => {
    const usedValue = values ? values[name] : values;
    const parentFilterParams = format(usedValue, queryParamName, schemaType, searchMode);
    const subcategoryFilterParams = materialSubcategoryFilters.reduce((picked, fieldConfig) => {
      const subcategoryName = getNamespacedFilterName(fieldConfig);
      const subcategoryQueryParamName = constructQueryParamName(fieldConfig.key, fieldConfig.scope);
      const selectedSubcategoryOptions = values ? values[subcategoryName] : [];

      return {
        ...picked,
        ...format(
          selectedSubcategoryOptions,
          subcategoryQueryParamName,
          fieldConfig.schemaType,
          fieldConfig.filterConfig?.searchMode
        ),
      };
    }, {});

    onSubmit({ ...parentFilterParams, ...subcategoryFilterParams });
  };

  return showAsPopup ? (
    <FilterPopup
      className={classes}
      rootClassName={rootClassName}
      label={labelForPopup}
      ariaLabel={getAriaLabel(label, selectedOptions.join(', '))}
      isSelected={hasInitialValues}
      id={`${id}.popup`}
      showAsPopup
      contentPlacementOffset={contentPlacementOffset}
      popupContentClassName={popupContentClassName}
      onSubmit={handleSubmit}
      initialValues={namedInitialValues}
      keepDirtyOnReinitialize
      {...rest}
    >
      <GroupOfFieldCheckboxes
        className={css.fieldGroup}
        name={name}
        id={`${id}-checkbox-group`}
        options={options}
        materialSubcategoryFilters={materialSubcategoryFilters}
        legend={label}
      />
    </FilterPopup>
  ) : (
    <FilterPlain
      className={className}
      rootClassName={rootClassName}
      label={label}
      labelSelection={labelSelectionForPlain}
      ariaLabel={getAriaLabel(label, selectedOptions.join(', '))}
      isSelected={hasInitialValues}
      id={`${id}.plain`}
      liveEdit
      plainClassName={plainClassName}
      onSubmit={handleSubmit}
      initialValues={namedInitialValues}
      {...rest}
    >
      <GroupOfFieldCheckboxes
        className={css.fieldGroupPlain}
        name={name}
        id={`${id}-checkbox-group`}
        options={options}
        materialSubcategoryFilters={materialSubcategoryFilters}
        legend={label}
      />
    </FilterPlain>
  );
};

export default SelectMultipleFilter;
