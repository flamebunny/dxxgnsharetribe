import React from 'react';

// Utils
import { SCHEMA_TYPE_MULTI_ENUM, SCHEMA_TYPE_TEXT, SCHEMA_TYPE_YOUTUBE } from '../../util/types.js';
import {
  isFieldForCategory,
  pickCategoryFields,
  pickCustomFieldProps,
} from '../../util/fieldHelpers.js';

import SectionDetailsMaybe2 from './SectionDetailsMaybe2.js';
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe.js';
import SectionTextMaybe2 from './SectionTextMaybe2.js';
import SectionYoutubeVideoMaybe from './SectionYoutubeVideoMaybe.js';
import { Heading } from '../../components';
import css from './ListingPage.module.css';

/**
 * Renders custom listing fields.
 * - SectionDetailsMaybe is used if schemaType is 'enum', 'long', or 'boolean'
 * - SectionMultiEnumMaybe is used if schemaType is 'multi-enum'
 * - SectionTextMaybe is used if schemaType is 'text'
 *
 * @param {*} props include publicData, metadata, listingFieldConfigs, categoryConfiguration
 * @returns React.Fragment containing aforementioned components
 */
const CustomListingFields2 = props => {
  const { publicData, metadata, listingFieldConfigs, categoryConfiguration, heading } = props;  

  const { key: categoryPrefix, categories: listingCategoriesConfig } = categoryConfiguration;
  const categoriesObj = pickCategoryFields(publicData, categoryPrefix, 1, listingCategoriesConfig);
  const currentCategories = Object.values(categoriesObj);

  const isFieldForSelectedCategories = fieldConfig => {    
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig);
    return isTargetCategory;
  };
  const propsForCustomFields =
    pickCustomFieldProps(
      publicData,
      metadata,
      listingFieldConfigs,
      'listingType',
      isFieldForSelectedCategories
    ) || [];

  return (
    <section className={css.sectionDetails}>
      {heading ? (
        <Heading as="h2" rootClassName={css.sectionHeading}>
          {heading}
        </Heading>
      ) : null}
      <SectionDetailsMaybe2 {...props} isFieldForCategory={isFieldForSelectedCategories} />
      {propsForCustomFields.map(customFieldProps => {
        const { schemaType, ...fieldProps } = customFieldProps;

        

        return schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
          <SectionMultiEnumMaybe {...fieldProps} />
        ) : schemaType === SCHEMA_TYPE_TEXT ? (
          <SectionTextMaybe2 {...fieldProps} />
        ) : schemaType === SCHEMA_TYPE_YOUTUBE ? (
          <SectionYoutubeVideoMaybe {...fieldProps} />
        ) : null;
      })}
    </section>
  );
};

export default CustomListingFields2;
