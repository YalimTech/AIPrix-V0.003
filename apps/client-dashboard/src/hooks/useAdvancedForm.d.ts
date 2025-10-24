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
    options?: Array<{
        value: string;
        label: string;
    }>;
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
export declare const useAdvancedForm: (config: FormConfig) => {
    values: Record<string, any>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
    handleChange: (name: string, value: any) => void;
    handleBlur: (name: string) => void;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    reset: () => void;
    setValue: (name: string, value: any) => void;
    setError: (name: string, error: string) => void;
    clearError: (name: string) => void;
    getFieldProps: (name: string) => {
        name?: undefined;
        value?: undefined;
        error?: undefined;
        touched?: undefined;
        onChange?: undefined;
        onBlur?: undefined;
        placeholder?: undefined;
    } | {
        name: string;
        value: any;
        error: string;
        touched: boolean;
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
        onBlur: () => void;
        placeholder: string | undefined;
    };
    hasError: (name: string) => boolean;
    getError: (name: string) => string;
    isFieldTouched: (name: string) => boolean;
    isFieldValid: (name: string) => boolean;
    validateField: (name: string, value: any) => string | null;
    validateForm: () => Record<string, string>;
};
export {};
