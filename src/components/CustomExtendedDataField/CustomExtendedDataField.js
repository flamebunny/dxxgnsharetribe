import React from 'react';
import classNames from 'classnames';

// Import config and utils
import { useIntl } from '../../util/reactIntl';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_SHORT_TEXT,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_YOUTUBE,
} from '../../util/types';
import {
  required,
  nonEmptyArray,
  validateInteger,
  validateYoutubeURL,
} from '../../util/validators';
import { addDynamicListingFieldOptions } from '../../util/dynamicListingFieldOptions';
// Import shared components
import { FieldCheckboxGroup, FieldSelect, FieldTextInput, FieldBoolean } from '../../components';
// Import modules from this directory
import css from './CustomExtendedDataField.module.css';

const createFilterOptions = options => options.map(o => ({ key: `${o.option}`, label: o.label }));

const getLabel = props =>
  props.hideLabel ? null : props.fieldConfig?.saveConfig?.label || props.fieldConfig?.label;
const getClassName = props => classNames(css.customField, props.className);
const getPlaceholder = (props, fallbackMessageId) =>
  props.hidePlaceholder
    ? ''
    : props.fieldConfig?.saveConfig?.placeholderMessage ||
      props.intl.formatMessage({ id: fallbackMessageId });

const CustomFieldEnum = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { placeholderMessage, isRequired, requiredMessage } = saveConfig || {};
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder = getPlaceholder(props, 'CustomExtendedDataField.placeholderSingleSelect');
  const filterOptions = createFilterOptions(enumOptions);

  const label = getLabel(props);

  return filterOptions ? (
    <FieldSelect
      className={getClassName(props)}
      name={name}
      id={formId ? `${formId}.${name}` : name}
      label={label}
      helpText={fieldConfig?.helpText}
      {...validateMaybe}
    >
      <option disabled value="">
        {placeholder}
      </option>
      {filterOptions.map(optionConfig => {
        const key = optionConfig.key;
        return (
          <option key={key} value={key}>
            {optionConfig.label}
          </option>
        );
      })}
    </FieldSelect>
  ) : null;
};

const CustomFieldMultiEnum = props => {
  const {
    name,
    fieldConfig,
    defaultRequiredMessage,
    formId,
    labelClassName,
    optionLabelClassName,
    onOptionChange,
  } = props;
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { isRequired, requiredMessage } = saveConfig || {};
  const label = getLabel(props);
  const validateMaybe = isRequired
    ? { validate: nonEmptyArray(requiredMessage || defaultRequiredMessage) }
    : {};

  return enumOptions ? (
    <FieldCheckboxGroup
      className={getClassName(props)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      label={label}
      labelClassName={labelClassName}
      helpText={fieldConfig?.helpText}
      optionLabelClassName={optionLabelClassName}
      onOptionChange={onOptionChange}
      options={createFilterOptions(enumOptions)}
      {...validateMaybe}
    />
  ) : null;
};

const CustomFieldShortText = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(props);
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder = getPlaceholder(props, 'CustomExtendedDataField.placeholderText');

  return (
    <FieldTextInput
      className={getClassName(props)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="text"
      maxLength={70}
      label={label}
      labelClassName={props.labelClassName}
      inputRootClass={props.inputRootClass}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      {...validateMaybe}
    />
  );
};

const CustomFieldText = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(props);
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder = getPlaceholder(props, 'CustomExtendedDataField.placeholderText');

  return (
    <FieldTextInput
      className={getClassName(props)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="textarea"
      label={label}
      labelClassName={props.labelClassName}
      inputRootClass={props.inputRootClass}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      {...validateMaybe}
    />
  );
};

const CustomFieldLong = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { minimum, maximum, saveConfig } = fieldConfig;
  const { isRequired, requiredMessage } = saveConfig || {};
  const label = getLabel(props);
  const placeholder = getPlaceholder(props, 'CustomExtendedDataField.placeholderLong');
  const numberTooSmallMessage = intl.formatMessage(
    { id: 'CustomExtendedDataField.numberTooSmall' },
    { min: minimum }
  );
  const numberTooBigMessage = intl.formatMessage(
    { id: 'CustomExtendedDataField.numberTooBig' },
    { max: maximum }
  );

  // Field with schema type 'long' will always be validated against min & max
  const validate = (value, min, max) => {
    const requiredMsg = requiredMessage || defaultRequiredMessage;
    return isRequired && value == null
      ? requiredMsg
      : validateInteger(value, max, min, numberTooSmallMessage, numberTooBigMessage);
  };

  return (
    <FieldTextInput
      className={getClassName(props)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="number"
      step="1"
      helpText={fieldConfig?.helpText}
      parse={value => {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }}
      label={label}
      labelClassName={props.labelClassName}
      inputRootClass={props.inputRootClass}
      placeholder={placeholder}
      validate={value => validate(value, minimum, maximum)}
      onWheel={e => {
        // fix: number input should not change value on scroll
        if (e.target === document.activeElement) {
          // Prevent the input value change, because we prefer page scrolling
          e.target.blur();

          // Refocus immediately, on the next tick (after the current function is done)
          setTimeout(() => {
            e.target.focus();
          }, 0);
        }
      }}
    />
  );
};

const CustomFieldBoolean = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(props);
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder = getPlaceholder(props, 'CustomExtendedDataField.placeholderBoolean');

  return (
    <FieldBoolean
      className={getClassName(props)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      label={label}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      {...validateMaybe}
    />
  );
};

const CustomFieldYoutube = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(props);
  const placeholder = getPlaceholder(props, 'CustomExtendedDataField.placeholderYoutubeVideoURL');

  const notValidUrlMessage = intl.formatMessage({
    id: 'CustomExtendedDataField.notValidYoutubeVideoURL',
  });

  const validate = value => {
    const requiredMsg = requiredMessage || defaultRequiredMessage;
    return isRequired && value == null
      ? requiredMsg
      : validateYoutubeURL(value, notValidUrlMessage);
  };

  return (
    <FieldTextInput
      className={getClassName(props)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="text"
      label={label}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      validate={value => validate(value)}
    />
  );
};

/**
 * Return Final Form field for each configuration according to schema type.
 *
 * These custom extended data fields are for generating input fields from configuration defined
 * in marketplace-custom-config.js. Other panels in EditListingWizard might add more extended data
 * fields (e.g. shipping fee), but these are independently customizable.
 *
 * @param {Object} props should contain fieldConfig that defines schemaType, enumOptions?, and
 * saveConfig for the field.
 */
const CustomExtendedDataField = props => {
  const intl = useIntl();
  const fieldConfig = addDynamicListingFieldOptions([props?.fieldConfig])[0];
  const { enumOptions = [], schemaType } = fieldConfig || {};
  const propsWithDynamicOptions = { ...props, fieldConfig };
  const defaultRequiredMessage = intl.formatMessage({
    id: 'CustomExtendedDataField.required',
  });
  const renderFieldComponent = (FieldComponent, props) => (
    <FieldComponent {...props} defaultRequiredMessage={defaultRequiredMessage} intl={intl} />
  );

  return schemaType === SCHEMA_TYPE_ENUM && enumOptions
    ? renderFieldComponent(CustomFieldEnum, propsWithDynamicOptions)
    : schemaType === SCHEMA_TYPE_MULTI_ENUM && enumOptions
    ? renderFieldComponent(CustomFieldMultiEnum, propsWithDynamicOptions)
    : schemaType === SCHEMA_TYPE_SHORT_TEXT
    ? renderFieldComponent(CustomFieldShortText, propsWithDynamicOptions)
    : schemaType === SCHEMA_TYPE_TEXT
    ? renderFieldComponent(CustomFieldText, propsWithDynamicOptions)
    : schemaType === SCHEMA_TYPE_LONG
    ? renderFieldComponent(CustomFieldLong, propsWithDynamicOptions)
    : schemaType === SCHEMA_TYPE_BOOLEAN
    ? renderFieldComponent(CustomFieldBoolean, propsWithDynamicOptions)
    : schemaType === SCHEMA_TYPE_YOUTUBE
    ? renderFieldComponent(CustomFieldYoutube, propsWithDynamicOptions)
    : null;
};

export default CustomExtendedDataField;
