import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../MasonaryField';
import BlockContainer from '../BlockContainer';

import css from './BlockDefault.module.css';

const FieldMedia = props => {
  const { className, media, sizes, options } = props;
  const hasMediaField = hasDataInFields([media], options);
  return hasMediaField ? (
    <div className={classNames(className, css.media, css.masonarymedia)}>
      <Field data={media} sizes={sizes} options={options} className={classNames(css.testy)} />
    </div>
  ) : null;
};

const BlockDefault = props => {
  const {
    blockId,
    className,
    rootClassName,
    mediaClassName,
    textClassName,
    ctaButtonClass,
    title,
    text,
    callToAction,
    media,
    responsiveImageSizes,
    options,
    alignment,
  } = props;
  const classes = classNames(rootClassName || css.root, className, css.posrel);
  const hasTextComponentFields = hasDataInFields([title, text, callToAction], options);

  const alignmentClasses = {
    left: css.alignLeft,
    center: css.alignCenter,
    right: css.alignRight,
  };

  const alignmentClass = alignmentClasses[alignment];

  return (
    <BlockContainer id={blockId} className={classes}>
      <FieldMedia
        media={media}
        sizes={responsiveImageSizes}
        className={mediaClassName}
        options={options}
      />
      {hasTextComponentFields ? (
        <div className={classNames(textClassName, alignmentClass, css.posabs, css.maxwh)}>
          <Field data={title} options={options} className={classNames(css.hide)} />
          <Field data={text} options={options} />
          <Field data={callToAction} className={classNames(ctaButtonClass, css.buttonMaxwh)} options={options} />
        </div>
      ) : null}
    </BlockContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

BlockDefault.defaultProps = {
  className: null,
  rootClassName: null,
  mediaClassName: null,
  textClassName: null,
  ctaButtonClass: null,
  title: null,
  text: null,
  callToAction: null,
  media: null,
  responsiveImageSizes: null,
  options: null,
};

BlockDefault.propTypes = {
  blockId: string,
  className: string,
  rootClassName: string,
  mediaClassName: string,
  textClassName: string,
  ctaButtonClass: string,
  title: object,
  text: object,
  callToAction: object,
  media: object,
  responsiveImageSizes: string,
  options: propTypeOption,
};

export default BlockDefault;
