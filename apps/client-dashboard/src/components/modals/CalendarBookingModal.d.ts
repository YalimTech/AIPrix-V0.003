import React from "react";
interface CalendarBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: CalendarConfig) => void;
    currentConfig?: CalendarConfig;
}
interface GHLConfig {
    provider: "GHL";
    calendarId: string;
    timezone: string;
}
interface CalComConfig {
    provider: "Cal.com";
    username: string;
    apiKey: string;
    eventId: string;
    location: string;
    enableRescheduling: boolean;
}
type CalendarConfig = GHLConfig | CalComConfig;
declare const CalendarBookingModal: React.FC<CalendarBookingModalProps>;
export default CalendarBookingModal;
