import React from "react";
interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}
declare const DatePicker: React.FC<DatePickerProps>;
export default DatePicker;
