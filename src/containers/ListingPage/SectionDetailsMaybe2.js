import React from 'react';

import { isFieldForListingType, getFieldValue } from '../../util/fieldHelpers';
import {
  getMaterialSubcategoryFieldConfig,
  isMaterialsField,
  isMaterialSubcategoryField,
} from '../EditListingPage/EditListingWizard/materialSubcategoryFields';

import css from './ListingPage.module.css';

const SectionDetailsMaybe2 = props => {
  const { publicData, metadata = {}, listingFieldConfigs, isFieldForCategory, intl } = props;

  if (!publicData || !Array.isArray(listingFieldConfigs)) {
    return null;
  }

  const normalizeFieldName = str =>
    typeof str === 'string'
      ? str
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/['\u2019]/g, '')
          .replace(/[_-]+/g, ' ')
          .trim()
          .toLowerCase()
      : '';

  const fieldMatchesName = (fieldConfig, fieldNames) => {
    const normalizedFieldNames = fieldNames.map(normalizeFieldName);
    const fieldLabel =
      fieldConfig?.saveConfig?.label ||
      fieldConfig?.showConfig?.label ||
      fieldConfig?.filterConfig?.label ||
      fieldConfig?.label;
    const candidates = [fieldConfig?.key, fieldLabel].map(normalizeFieldName);

    return candidates.some(candidate => normalizedFieldNames.includes(candidate));
  };

  const isEditionTypeField = fieldConfig => fieldMatchesName(fieldConfig, ['edition type']);
  const isEditionDetailsField = fieldConfig =>
    fieldMatchesName(fieldConfig, [
      'edition of',
      "artist's proof",
      'artist proof',
      'artists proof',
    ]);
  const isArtistProofField = fieldConfig =>
    fieldMatchesName(fieldConfig, ["artist's proof", 'artist proof', 'artists proof']);
  const isEditionOfField = fieldConfig => fieldMatchesName(fieldConfig, ['edition of']);

  const getSelectedOptionLabel = (enumOptions = [], enumValue) =>
    enumOptions.find(o => enumValue === `${o.option}`)?.label || enumValue;

  const getMultiEnumLabels = (enumOptions = [], values) =>
    Array.isArray(values)
      ? values.map(value => getSelectedOptionLabel(enumOptions, value)).filter(Boolean)
      : [];

  const getFieldDisplayValue = (fieldConfig, value) => {
    const { schemaType, enumOptions } = fieldConfig || {};
    const getBooleanMessage = bool =>
      bool
        ? intl.formatMessage({ id: 'SearchPage.detailYes' })
        : intl.formatMessage({ id: 'SearchPage.detailNo' });

    return schemaType === 'enum'
      ? getSelectedOptionLabel(enumOptions, value)
      : schemaType === 'multi-enum' && Array.isArray(value)
      ? getMultiEnumLabels(enumOptions, value).join(', ')
      : schemaType === 'boolean'
      ? getBooleanMessage(value)
      : ['long', 'text', 'shortText'].includes(schemaType)
      ? value
      : null;
  };

  const getEditionDetailsValue = selectedEditionLabel => {
    const limitedEditionSelected = `${selectedEditionLabel}`.toLowerCase().includes('limited');

    if (!limitedEditionSelected) {
      return null;
    }

    const editionDetailsFields = listingFieldConfigs
      .filter(isEditionDetailsField)
      .sort((a, b) => {
        if (isArtistProofField(a)) {
          return -1;
        }
        if (isArtistProofField(b)) {
          return 1;
        }
        if (isEditionOfField(a)) {
          return -1;
        }
        if (isEditionOfField(b)) {
          return 1;
        }
        return 0;
      })
      .map(fieldConfig => {
        const { key, saveConfig = {}, showConfig = {} } = fieldConfig || {};
        const publicDataValue = getFieldValue(publicData, key);
        const metadataValue = getFieldValue(metadata, key);
        const value = publicDataValue != null ? publicDataValue : metadataValue;
        const displayValue = value != null ? getFieldDisplayValue(fieldConfig, value) : null;

        return displayValue != null
          ? {
              key,
              label: showConfig.label || saveConfig.label,
              value: displayValue,
            }
          : null;
      })
      .filter(Boolean);

    return editionDetailsFields.length > 0
      ? [
          <React.Fragment key="editionTypeValue">
            {selectedEditionLabel}
          </React.Fragment>,
          ...editionDetailsFields.map(detail => (
            <React.Fragment key={detail.key}>
              <br />
              {detail.label}: {detail.value}
            </React.Fragment>
          )),
        ]
      : selectedEditionLabel;
  };

  const getMaterialsValue = values => {
    const materialsFieldConfig = listingFieldConfigs.find(isMaterialsField);

    return Array.isArray(values)
      ? values
          .map(materialOption => {
            const subcategoryFieldConfig = getMaterialSubcategoryFieldConfig(
              materialOption,
              listingFieldConfigs
            );
            const subcategoryValues = getFieldValue(publicData, subcategoryFieldConfig?.key);
            const subcategoryLabels = getMultiEnumLabels(
              subcategoryFieldConfig?.enumOptions,
              subcategoryValues
            );
            const materialLabel = getSelectedOptionLabel(
              materialsFieldConfig?.enumOptions,
              materialOption
            );

            return subcategoryLabels.length > 0
              ? `${materialLabel}: ${subcategoryLabels.join(', ')}`
              : materialLabel;
          })
          .filter(Boolean)
          .map((materialLabel, index) => (
            <React.Fragment key={materialLabel}>
              {index > 0 ? <br /> : null}
              {materialLabel}
            </React.Fragment>
          ))
      : null;
  };

  const pickListingFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, showConfig = {} } = config;
    const listingType = publicData.listingType;
    const isTargetListingType = isFieldForListingType(listingType, config);
    const isTargetCategory = isFieldForCategory(config);
    const isMaterialSubcategory = isMaterialSubcategoryField(config, listingFieldConfigs);
    const isEditionDetailsSubfield = isEditionDetailsField(config);

    const { isDetail, label } = showConfig;
    const publicDataValue = getFieldValue(publicData, key);
    const metadataValue = getFieldValue(metadata, key);
    const value = publicDataValue != null ? publicDataValue : metadataValue;

    if (
      isDetail &&
      isTargetListingType &&
      isTargetCategory &&
      value != null &&
      !isMaterialSubcategory &&
      !isEditionDetailsSubfield
    ) {
      const findSelectedOption = enumValue => enumOptions?.find(o => enumValue === `${o.option}`);
      const getEnumLabel = enumValue => findSelectedOption(enumValue)?.label || enumValue;
      const getBooleanMessage = value =>
        value
          ? intl.formatMessage({ id: 'SearchPage.detailYes' })
          : intl.formatMessage({ id: 'SearchPage.detailNo' });
      const enumValue = getEnumLabel(value);
      const editionValue = isEditionTypeField(config) ? getEditionDetailsValue(enumValue) : null;
      const materialsValue = isMaterialsField(config) ? getMaterialsValue(value) : null;
      const multiEnumValue = Array.isArray(value)
        ? value.map(getEnumLabel).filter(Boolean).join(', ')
        : null;

      return schemaType === 'enum'
        ? filteredConfigs.concat({ key, value: editionValue || enumValue, label })
        : materialsValue?.length > 0
        ? filteredConfigs.concat({ key, value: materialsValue, label })
        : schemaType === 'multi-enum' && multiEnumValue
        ? filteredConfigs.concat({ key, value: multiEnumValue, label })
        : schemaType === 'boolean'
        ? filteredConfigs.concat({ key, value: getBooleanMessage(value), label })
        : schemaType === 'long'
        ? filteredConfigs.concat({ key, value, label })
        : filteredConfigs;
    }
    return filteredConfigs;
  };

  const existingListingFields = listingFieldConfigs.reduce(pickListingFields, []);
  const depthwidthheight = [];

  return existingListingFields.length > 0 ? (
    <>  
      {existingListingFields.map(detail => {
        if(detail.key === 'depth') {
          depthwidthheight.depth = detail.value            
        } else if (detail.key === 'width') {
          depthwidthheight.width = detail.value   
        } else if (detail.key === 'height') {
          depthwidthheight.height = detail.value   
        } else {

        }
      })}
      
      <div className={css.dimensions}><span>Dimensions: </span><span>W {depthwidthheight.width} x H {depthwidthheight.height} x D {depthwidthheight.depth} cm</span></div>
      
      {existingListingFields.map((detail, i) => {

      // checking for Depth, width, height in custom fields
      if(detail.key == 'depth' || detail.key === 'width' || detail.key === 'height') {
        
      } else {

      return (
        <ul key={i} className={css.details}>
          <li key={detail.key} className={css.detailsRow}>
            <div className={css.detailstext}><span>{detail.label}: </span><span>{detail.value}</span></div>
          </li>
        </ul>
      )
    }

    })}
      
    </>
  ) : null;
};

export default SectionDetailsMaybe2;
