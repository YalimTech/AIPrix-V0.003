import { useState, useCallback, useRef } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
}

interface FieldConfig {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  validation?: ValidationRule;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

interface FormConfig {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onError?: (errors: Record<string, string>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export const useAdvancedForm = (config: FormConfig) => {
  const {
    fields,
    onSubmit,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = true,
  } = config;

  // Initialize form state
  const getInitialValues = () => {
    const values: Record<string, any> = {};
    fields.forEach(field => {
      values[field.name] = field.defaultValue || '';
    });
    return values;
  };

  const getInitialErrors = () => {
    const errors: Record<string, string> = {};
    fields.forEach(field => {
      errors[field.name] = '';
    });
    return errors;
  };

  const getInitialTouched = () => {
    const touched: Record<string, boolean> = {};
    fields.forEach(field => {
      touched[field.name] = false;
    });
    return touched;
  };

  const [formState, setFormState] = useState<FormState>({
    values: getInitialValues(),
    errors: getInitialErrors(),
    touched: getInitialTouched(),
    isSubmitting: false,
    isValid: true,
    isDirty: false,
  });

  const initialValuesRef = useRef(getInitialValues());

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = useCallback((name: string, value: any): string | null => {
    const field = fields.find(f => f.name === name);
    if (!field?.validation) return null;

    const rules = field.validation;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${field.label || name} es requerido`;
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') return null;

    // Email validation
    if (rules.email && !validateEmail(value)) {
      return 'Por favor ingresa un email válido';
    }

    // Phone validation
    if (rules.phone && !validatePhone(value)) {
      return 'Por favor ingresa un número telefónico válido';
    }

    // URL validation
    if (rules.url && !validateUrl(value)) {
      return 'Por favor ingresa una URL válida';
    }

    // Number validation
    if (rules.number && isNaN(Number(value))) {
      return 'Por favor ingresa un número válido';
    }

    // Min/Max validation for numbers
    if (rules.number && !isNaN(Number(value))) {
      const numValue = Number(value);
      if (rules.min !== undefined && numValue < rules.min) {
        return `El valor debe ser mayor o igual a ${rules.min}`;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `El valor debe ser menor o igual a ${rules.max}`;
      }
    }

    // Length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return `Debe tener al menos ${rules.minLength} caracteres`;
    }
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return `No puede tener más de ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'El formato no es válido';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [fields]);

  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field.name, formState.values[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    return errors;
  }, [fields, formState.values, validateField]);

  // Event handlers
  const handleChange = useCallback((name: string, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const newTouched = { ...prev.touched, [name]: true };
      
      const newErrors = { ...prev.errors };
      if (validateOnChange) {
        const error = validateField(name, value);
        newErrors[name] = error || '';
      }

      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
      const isValid = Object.values(newErrors).every(error => !error);

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        touched: newTouched,
        isDirty,
        isValid,
      };
    });
  }, [validateOnChange, validateField]);

  const handleBlur = useCallback((name: string) => {
    setFormState(prev => {
      const newTouched = { ...prev.touched, [name]: true };
      
      const newErrors = { ...prev.errors };
      if (validateOnBlur) {
        const error = validateField(name, prev.values[name]);
        newErrors[name] = error || '';
      }

      const isValid = Object.values(newErrors).every(error => !error);

      return {
        ...prev,
        touched: newTouched,
        errors: newErrors,
        isValid,
      };
    });
  }, [validateOnBlur, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);

    // Validate all fields
    const errors = validateForm();
    const isValid = Object.keys(errors).length === 0;

    setFormState(prev => ({
      ...prev,
      touched: allTouched,
      errors,
      isValid,
    }));

    if (!isValid) {
      if (onError) {
        onError(errors);
      }
      return;
    }

    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      await onSubmit(formState.values);
      
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [fields, validateForm, onSubmit, onError, resetOnSubmit, formState.values]);

  const reset = useCallback(() => {
    const initialValues = getInitialValues();
    setFormState({
      values: initialValues,
      errors: getInitialErrors(),
      touched: getInitialTouched(),
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });
    initialValuesRef.current = initialValues;
  }, [fields]);

  const setValue = useCallback((name: string, value: any) => {
    handleChange(name, value);
  }, [handleChange]);

  const setError = useCallback((name: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  const clearError = useCallback((name: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: '' },
    }));
  }, []);

  const getFieldProps = useCallback((name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return {};

    return {
      name,
      value: formState.values[name] || '',
      error: formState.errors[name],
      touched: formState.touched[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleChange(name, e.target.value);
      },
      onBlur: () => handleBlur(name),
      placeholder: field.placeholder,
    };
  }, [fields, formState, handleChange, handleBlur]);

  // Helper functions
  const hasError = (name: string): boolean => {
    return !!(formState.errors[name] && formState.touched[name]);
  };

  const getError = (name: string): string => {
    return formState.touched[name] ? formState.errors[name] || '' : '';
  };

  const isFieldTouched = (name: string): boolean => {
    return formState.touched[name];
  };

  const isFieldValid = (name: string): boolean => {
    return !formState.errors[name] || !formState.touched[name];
  };

  return {
    // Form state
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    
    // Event handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Form actions
    reset,
    setValue,
    setError,
    clearError,
    
    // Field utilities
    getFieldProps,
    hasError,
    getError,
    isFieldTouched,
    isFieldValid,
    
    // Validation
    validateField,
    validateForm,
  };
};
