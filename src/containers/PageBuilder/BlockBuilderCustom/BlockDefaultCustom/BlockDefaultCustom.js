import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockContainerCustom from '../BlockContainerCustom';

import css from './BlockDefaultCustom.module.css';

const FieldMedia = props => {
  const { className, media, sizes, options } = props;
  const hasMediaField = hasDataInFields([media], options);
  return hasMediaField ? (
    <div className={classNames(className, css.media)}>
      <Field data={media} sizes={sizes} options={options} />
    </div>
  ) : null;
};

const BlockDefaultCustom = props => {
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
  const classes = classNames(rootClassName || css.root, className);
  const hasTextComponentFields = hasDataInFields([title, text, callToAction], options);

  const alignmentClasses = {
    left: css.alignLeft,
    center: css.alignCenter,
    right: css.alignRight,
  };

  const alignmentClass = alignmentClasses[alignment];

  return (
    <BlockContainerCustom id={blockId} className={classNames(classes, css.orderblocks)}>

      {hasTextComponentFields ? (
        <div className={classNames(textClassName, alignmentClass, css.text, css.orderblockschild)}>
          <h3><a href={callToAction.href}>{callToAction.content}</a></h3>
        </div>
      ) : null}
      <FieldMedia
        media={media}
        sizes={responsiveImageSizes}
        className={classNames(mediaClassName, css.orderblockschild)}
        options={options}
      />
      
    </BlockContainerCustom>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

BlockDefaultCustom.defaultProps = {
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

BlockDefaultCustom.propTypes = {
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

export default BlockDefaultCustom;
