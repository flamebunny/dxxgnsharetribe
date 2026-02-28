import React, { useState } from "react";
import { arrayOf, bool, func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionTextAccordion.module.css';
import IconPlus from '../../../SearchPage/IconPlus/IconPlus';

// Section component that's able to show article content
// The article content is mainly supposed to be inside a block
const SectionTextAccordion = props => {
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

  // state to track open/closed
  const [isOpen, setIsOpen] = useState(false);

  // function to toggle state
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };


  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);
  const hasBlocks = blocks?.length > 0;

  console.log(title);

  return (
    <SectionContainer
      id={sectionId}
      className={classNames(className, css.accordion)}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >

      <div className={classNames(css.container)}>
      {hasHeaderFields ? (
        <header 
          className={classNames(css.root, css.header)}
        >
          <div>
            <Field data={title} className={classNames(css.title)} options={fieldOptions} onClick={toggleAccordion} />
             <span className={css.openSign}>
                <IconPlus isOpen={isOpen} />
              </span>
          </div>
          <Field data={description} className={css.description} options={fieldOptions} onClick={toggleAccordion} />
          <Field data={callToAction} className={css.ctaButton} options={fieldOptions} onClick={toggleAccordion} />
        </header>
      ) : null}
      {hasBlocks ? (
        <div
          className={classNames(css.articleMain, {
            [css.noSidePaddings]: isInsideContainer,
          },
          `${isOpen ? css.open : ""}`
        )}
        >
          <BlockBuilder
            blocks={blocks}
            sectionId={sectionId}
            ctaButtonClass={defaultClasses.ctaButton}
            options={options}
          />
        </div>
      ) : null}
      </div>
    </SectionContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionTextAccordion.defaultProps = {
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

SectionTextAccordion.propTypes = {
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

export default SectionTextAccordion;
