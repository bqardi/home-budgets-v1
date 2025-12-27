import { useState, useCallback } from "react";

// Type definitions
export interface FormValues {
  [key: string]: string | number | readonly string[] | undefined;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface UseConstraintValidationReturn {
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    onSubmit?: (values: FormValues) => void
  ) => void;
  validateField: (
    name: string,
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  ) => boolean;
  validateForm: (form: HTMLFormElement) => boolean;
}

/**
 * Custom hook for constraint validation with custom error messages
 * @param {FormValues} initialValues - Initial form values
 * @returns {UseConstraintValidationReturn} Validation state and methods
 */
export function useConstraintValidation(
  initialValues: FormValues = {}
): UseConstraintValidationReturn {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  /**
   * Gets validation error message for a form element
   * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} element - The form element
   * @returns {string} The validation error message
   */
  const getValidationErrorMessage = useCallback(
    (
      element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): string => {
      const validationStates = [
        "valueMissing",
        "typeMismatch",
        "tooShort",
        "tooLong",
        "stepMismatch",
        "rangeUnderflow",
        "rangeOverflow",
        "patternMismatch",
        "customError",
        "badInput",
      ];

      const errorType = validationStates.find(
        (key) =>
          (element as HTMLInputElement).validity[key as keyof ValidityState]
      );
      if (errorType && (element as HTMLElement).dataset[errorType]) {
        return (element as HTMLElement).dataset[errorType] || "";
      }
      return (element as HTMLInputElement).validationMessage || "";
    },
    []
  );

  /**
   * Validates a single input field
   * @param {string} name - Field name
   * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} element - The input element
   */
  const validateField = useCallback(
    (
      name: string,
      element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): boolean => {
      if (!(element as HTMLInputElement).checkValidity()) {
        const errorMessage = getValidationErrorMessage(element);
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        return false;
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
        return true;
      }
    },
    [getValidationErrorMessage]
  );

  /**
   * Handles input change
   * @param {React.ChangeEvent} e - Input event
   */
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (touched[name] && errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [touched, errors]
  );

  /**
   * Handles input blur (when field loses focus)
   * @param {React.FocusEvent} e - Blur event
   */
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, e.target);
    },
    [validateField]
  );

  /**
   * Validates entire form
   * @param {HTMLFormElement} form - The form element
   * @returns {boolean} True if form is valid
   */
  const validateForm = useCallback(
    (form: HTMLFormElement): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      // Validate all form inputs
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        const element = input as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement;
        const name = element.name;
        if (!(element as HTMLInputElement).checkValidity()) {
          newErrors[name] = getValidationErrorMessage(element);
          isValid = false;
        }
        setTouched((prev) => ({ ...prev, [name]: true }));
      });

      setErrors(newErrors);

      // Focus first invalid field
      if (!isValid) {
        const firstInvalid = form.querySelector(":invalid") as HTMLElement;
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }

      return isValid;
    },
    [getValidationErrorMessage]
  );

  /**
   * Handles form submission
   * @param {React.FormEvent} e - Submit event
   * @param {Function} onSubmit - Submit callback
   */
  const handleSubmit = useCallback(
    (
      e: React.FormEvent<HTMLFormElement>,
      onSubmit?: (values: FormValues) => void
    ) => {
      e.preventDefault();
      const isValid = validateForm(e.currentTarget);

      if (isValid && onSubmit) {
        onSubmit(values);
      }
    },
    [values, validateForm]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
  };
}
