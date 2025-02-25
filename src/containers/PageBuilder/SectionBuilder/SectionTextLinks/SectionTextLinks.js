import React from 'react';
import { arrayOf, bool, func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';

import css from './SectionTextLinks.module.css';

// Section component that shows features.
// Block content are shown in a row-like way:
// [image] text
// text [image]
// [image] text
const SectionTextLinks = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    title,
    description,
    appearance,
    callToAction,
    blocks,
    isInsideContainer,
    options,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);
  const hasBlocks = blocks?.length > 0;

  return (
    <SectionContainer
      id={sectionId}
      className={classNames(className)}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >
      {hasHeaderFields ? (
        <header className={defaultClasses.sectionDetails}>
          <Field data={title} className={classNames(defaultClasses, css.ebgaramond)} options={fieldOptions} />
          <Field data={description} className={defaultClasses.description} options={fieldOptions} />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
        </header>
      ) : null}
      {hasBlocks ? (
        <div
          className={classNames(defaultClasses.blockContainer, css.featuresMain, {
            [css.noSidePaddings]: isInsideContainer,
          })}
        >
          <BlockBuilder
            rootClassName={css.block}
            className={classNames(className, css.button)}
            ctaButtonClass={defaultClasses.ctaButton}
            blocks={blocks}
            sectionId={sectionId}
            responsiveImageSizes="(max-width: 767px) 100vw, 568px"
            options={options}
          />
        </div>
      ) : null}
    </SectionContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionTextLinks.defaultProps = {
  className: null,
  rootClassName: null,
  defaultClasses: null,
  textClassName: null,
  title: null,
  description: null,
  appearance: null,
  callToAction: null,
  blocks: [],
  isInsideContainer: false,
  options: null,
};

SectionTextLinks.propTypes = {
  sectionId: string.isRequired,
  className: string,
  rootClassName: string,
  defaultClasses: shape({
    sectionDetails: string,
    title: string,
    description: string,
    ctaButton: string,
  }),
  title: object,
  description: object,
  appearance: object,
  callToAction: object,
  blocks: arrayOf(object),
  isInsideContainer: bool,
  options: propTypeOption,
};

export default SectionTextLinks;
