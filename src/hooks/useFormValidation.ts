import { useState, useCallback, useEffect } from 'react';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationOptions<T> {
  schema: ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface FormValidationResult<T> {
  values: T;
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  touched: Record<string, boolean>;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, message: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  reset: (newValues?: Partial<T>) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: FormValidationOptions<T>
): FormValidationResult<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Debounce timer for validation
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const { schema, validateOnChange = true, validateOnBlur = true, debounceMs = 300 } = options;

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    try {
      // Validate just this field using schema.pick()
      const fieldSchema = schema.pick({ [field]: true } as any);
      const fieldValue = { [field]: values[field] };
      
      await fieldSchema.parseAsync(fieldValue);
      
      // Clear error if validation passes
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === field);
        if (fieldError) {
          setErrorsState(prev => ({
            ...prev,
            [field as string]: fieldError.message
          }));
        }
      }
      return false;
    }
  }, [schema, values]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      await schema.parseAsync(values);
      setErrorsState({});
      setIsValidating(false);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrorsState(newErrors);
      }
      setIsValidating(false);
      return false;
    }
  }, [schema, values]);

  const debouncedValidateField = useCallback((field: keyof T) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      validateField(field);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [validateField, debounceMs, debounceTimer]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }

    // Validate on change if enabled
    if (validateOnChange && touched[field as string]) {
      debouncedValidateField(field);
    }
  }, [errors, touched, validateOnChange, debouncedValidateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, message: string) => {
    setErrorsState(prev => ({ ...prev, [field as string]: message }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const setTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [field as string]: isTouched }));
  }, []);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setValue(name as keyof T, fieldValue);
  }, [setValue]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched(name as keyof T, true);
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      validateField(name as keyof T);
    }
  }, [validateOnBlur, validateField, setTouched]);

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    setValuesState(resetValues);
    setErrorsState({});
    setTouchedState({});
    setIsValidating(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0 && !isValidating;

  return {
    values,
    errors,
    isValid,
    isValidating,
    touched,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    reset,
    setTouched
  };
}