import React from 'react';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import css from './FieldCheckbox.module.css';

/**
 * IconCheckbox
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.checkedClassName overwrite components own css.checked
 * @param {string?} props.boxClassName overwrite components own css.box
 * @returns {JSX.Element} checkbox svg that places the native checkbox
 */
const IconCheckbox = props => {
  const { className, checkedClassName, boxClassName } = props;
  return (
    <>
<svg
  className={className}
  width="20"
  height="20"
  xmlns="http://www.w3.org/2000/svg"
  role="presentation"
  viewBox="0 0 20 20"
>
  <g fill="none" fillRule="evenodd">
    <rect
      className={checkedClassName || css.checked}
      x="2"
      y="2"
      width="16"
      height="16"
      rx="0"
    />

    <rect
      className={boxClassName || css.box}
      x="2"
      y="2"
      width="16"
      height="16"
      strokeWidth="2"
      rx="0"
    />

    <path
      className={checkedClassName || css.pathchecked}
      d="M6 6L14 14M14 6L6 14"
      stroke="#FFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </g>
</svg>

    </>
  );
};

/**
 * Final Form Field containing checkbox input
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.svgClassName is passed to checkbox svg as className
 * @param {string?} props.textClassName overwrite components own css.textRoot given to label
 * @param {string} props.id givent to input
 * @param {string} props.name Name groups several checkboxes to an array of selected values
 * @param {string} props.value Checkbox needs a value that is passed forward when user checks the checkbox
 * @param {ReactNode} props.label
 * @returns {JSX.Element} Final Form Field containing checkbox input
 */
const FieldCheckbox = props => {
  const {
    rootClassName,
    className,
    svgClassName,
    textClassName,
    id,
    label,
    useSuccessColor,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  // This is a workaround for a bug in Firefox & React Final Form.
  // https://github.com/final-form/react-final-form/issues/134
  const handleOnChange = (input, event) => {
    const { onBlur, onChange } = input;
    onChange(event);
    onBlur(event);

    // If onChange has been passed as a props to FieldCheckbox
    if (rest.onChange) {
      rest.onChange(event);
    }
  };

  const successColorVariantMaybe = useSuccessColor
    ? {
        checkedClassName: css.checkedSuccess,
        boxClassName: css.boxSuccess,
      }
    : {};
  const disabledColorMaybe = rest.disabled
    ? {
        checkedClassName: css.checkedDisabled,
        boxClassName: css.boxDisabled,
      }
    : {};

  return (
    <span className={classes}>
      <Field type="checkbox" {...rest}>
        {props => {
          const { input, disabled } = props;
          return (
            <input
              id={id}
              className={css.input}
              {...input}
              onChange={event => handleOnChange(input, event)}
              disabled={disabled}
            />
          );
        }}
      </Field>
      <label htmlFor={id} className={css.label}>
        <span className={css.checkboxWrapper}>
          <IconCheckbox
            className={svgClassName}
            {...successColorVariantMaybe}
            {...disabledColorMaybe}
          />
        </span>
        <span className={classNames(css.text, textClassName || css.textRoot)}>{label}</span>
      </label>
    </span>
  );
};

export default FieldCheckbox;
