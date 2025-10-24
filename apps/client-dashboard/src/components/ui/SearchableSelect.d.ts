import React from "react";
interface SearchableSelectOption {
    value: string;
    label: string;
}
interface SearchableSelectProps {
    options: (SearchableSelectOption | string)[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}
declare const SearchableSelect: React.FC<SearchableSelectProps>;
export default SearchableSelect;
