import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { isFieldForListingType } from '../../util/fieldHelpers';

import { Heading } from '../../components';

import css from './ListingPage.module.css';

const SectionDetailsMaybe2 = props => {
  const { publicData, metadata = {}, listingFieldConfigs, isFieldForCategory, intl } = props;

  if (!publicData || !listingFieldConfigs) {
    return null;
  }

  const pickListingFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, showConfig = {} } = config;
    const listingType = publicData.listingType;
    const isTargetListingType = isFieldForListingType(listingType, config);
    const isTargetCategory = isFieldForCategory(config);

    const { isDetail, label } = showConfig;
    const publicDataValue = publicData[key];
    const metadataValue = metadata[key];
    const value = typeof publicDataValue != null ? publicDataValue : metadataValue;

    if (isDetail && isTargetListingType && isTargetCategory && typeof value !== 'undefined') {
      const findSelectedOption = enumValue => enumOptions?.find(o => enumValue === `${o.option}`);
      const getBooleanMessage = value =>
        value
          ? intl.formatMessage({ id: 'SearchPage.detailYes' })
          : intl.formatMessage({ id: 'SearchPage.detailNo' });
      const optionConfig = findSelectedOption(value);

      return schemaType === 'enum'
        ? filteredConfigs.concat({ key, value: optionConfig?.label, label })
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
      
      <div className={css.dimensions}><span>Dimensions: </span><span>D {depthwidthheight.width} x W {depthwidthheight.width} x H {depthwidthheight.height}</span> cm</div>
      
      {existingListingFields.map(detail => {

      // checking for Depth, width, height in custom fields
      if(detail.key == 'depth' || detail.key === 'width' || detail.key === 'height') {
        return (
          <></>
        )
      } else {

      return (
        <ul className={css.details}>
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
