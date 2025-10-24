import { useState, useCallback, useRef } from 'react';
export const useAdvancedForm = (config) => {
    const { fields, onSubmit, onError, validateOnChange = true, validateOnBlur = true, resetOnSubmit = true, } = config;
    // Initialize form state
    const getInitialValues = () => {
        const values = {};
        fields.forEach(field => {
            values[field.name] = field.defaultValue || '';
        });
        return values;
    };
    const getInitialErrors = () => {
        const errors = {};
        fields.forEach(field => {
            errors[field.name] = '';
        });
        return errors;
    };
    const getInitialTouched = () => {
        const touched = {};
        fields.forEach(field => {
            touched[field.name] = false;
        });
        return touched;
    };
    const [formState, setFormState] = useState({
        values: getInitialValues(),
        errors: getInitialErrors(),
        touched: getInitialTouched(),
        isSubmitting: false,
        isValid: true,
        isDirty: false,
    });
    const initialValuesRef = useRef(getInitialValues());
    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const validatePhone = (phone) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };
    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    };
    const validateField = useCallback((name, value) => {
        const field = fields.find(f => f.name === name);
        if (!field?.validation)
            return null;
        const rules = field.validation;
        // Required validation
        if (rules.required && (!value || value.toString().trim() === '')) {
            return `${field.label || name} es requerido`;
        }
        // Skip other validations if value is empty and not required
        if (!value || value.toString().trim() === '')
            return null;
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
    const validateForm = useCallback(() => {
        const errors = {};
        fields.forEach(field => {
            const error = validateField(field.name, formState.values[field.name]);
            if (error) {
                errors[field.name] = error;
            }
        });
        return errors;
    }, [fields, formState.values, validateField]);
    // Event handlers
    const handleChange = useCallback((name, value) => {
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
    const handleBlur = useCallback((name) => {
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
    const handleSubmit = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
        }
        // Mark all fields as touched
        const allTouched = fields.reduce((acc, field) => {
            acc[field.name] = true;
            return acc;
        }, {});
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
        }
        catch (error) {
            console.error('Form submission error:', error);
        }
        finally {
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
    const setValue = useCallback((name, value) => {
        handleChange(name, value);
    }, [handleChange]);
    const setError = useCallback((name, error) => {
        setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, [name]: error },
        }));
    }, []);
    const clearError = useCallback((name) => {
        setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, [name]: '' },
        }));
    }, []);
    const getFieldProps = useCallback((name) => {
        const field = fields.find(f => f.name === name);
        if (!field)
            return {};
        return {
            name,
            value: formState.values[name] || '',
            error: formState.errors[name],
            touched: formState.touched[name],
            onChange: (e) => {
                handleChange(name, e.target.value);
            },
            onBlur: () => handleBlur(name),
            placeholder: field.placeholder,
        };
    }, [fields, formState, handleChange, handleBlur]);
    // Helper functions
    const hasError = (name) => {
        return !!(formState.errors[name] && formState.touched[name]);
    };
    const getError = (name) => {
        return formState.touched[name] ? formState.errors[name] || '' : '';
    };
    const isFieldTouched = (name) => {
        return formState.touched[name];
    };
    const isFieldValid = (name) => {
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
