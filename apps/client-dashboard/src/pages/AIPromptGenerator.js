import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DocumentDuplicateIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
const AIPromptGenerator = () => {
    const [output, setOutput] = useState("");
    const [sections, setSections] = useState([
        {
            id: "persona",
            title: "Persona & Goal",
            placeholder: "Enter You're a helpful AI real estate assistant for simple realty tasked to converse with potential homebuyers over the phone with the goal of enticing them to sell their home after asking probing questions to learn the homeowner's needs.",
            enabled: false,
            value: "",
        },
        {
            id: "introduction",
            title: "Introduction",
            placeholder: "Enter Create a welcoming and engaging introductory prompt using the user's company name and service area.",
            enabled: false,
            value: "",
        },
        {
            id: "value",
            title: "Value Proposition",
            placeholder: "Enter Develop a prompt that clearly communicates the unique benefits or services of the user's offering.",
            enabled: false,
            value: "",
        },
        {
            id: "needs",
            title: "Understanding the Client's Needs",
            placeholder: "Enter Formulate questions or prompts that encourage clients to share their specific requirements.",
            enabled: false,
            value: "",
        },
        {
            id: "services",
            title: "Explaining {company services} Services",
            placeholder: "Enter Generate detailed explanations about the user's services, customized to potential client interests.",
            enabled: false,
            value: "",
        },
        {
            id: "expertise",
            title: "Demonstrating Personalization and Expertise",
            placeholder: "Enter Craft prompts demonstrating the user's expertise and a personalized approach.",
            enabled: false,
            value: "",
        },
        {
            id: "engagement",
            title: "Engagement and Responsiveness",
            placeholder: "Enter Create interactive prompts for addressing client queries or concerns.",
            enabled: false,
            value: "",
        },
        {
            id: "cost",
            title: "Addressing Cost and Offers",
            placeholder: "Enter Formulate prompts discussing pricing and offers transparently.",
            enabled: false,
            value: "",
        },
        {
            id: "cta",
            title: "Call to Action",
            placeholder: "Enter Develop a prompt encouraging a specific client action, like a meeting or follow-up.",
            enabled: false,
            value: "",
        },
        {
            id: "style",
            title: "Language and Interaction Style",
            placeholder: "Enter Adjust the language and style of the prompts to match the user's brand voice and target audience.",
            enabled: false,
            value: "",
        },
        {
            id: "qualifying",
            title: "Qualifying Prospect for Sales Team",
            placeholder: "Enter Based on what you've shared, it sounds like you could really benefit from our services. Would you like to schedule a meeting with one of our real estate specialists to discuss this further?",
            enabled: false,
            value: "",
        },
        {
            id: "objections",
            title: "Identify Common Objections",
            placeholder: "Enter Start by listing common objections that might occur during calls. This will help the AI recognize and categorize objections when they arise.",
            enabled: false,
            value: "",
        },
        {
            id: "knowledge",
            title: "Company Knowledge Base",
            placeholder: "Enter SimpleRealty is a place where over two decades of real estate excellence meets your property dreams. Since our inception 20+ years ago, we've been more than just a company; we've been a trusted partner in turning thousands of real estate aspirations into reality.",
            enabled: false,
            value: "",
        },
    ]);
    const handleToggleSection = (id) => {
        setSections(sections.map((section) => section.id === id ? { ...section, enabled: !section.enabled } : section));
    };
    const handleSectionChange = (id, value) => {
        setSections(sections.map((section) => section.id === id ? { ...section, value } : section));
    };
    const handleGeneratePrompt = () => {
        const enabledSections = sections.filter((s) => s.enabled && s.value.trim());
        if (enabledSections.length === 0) {
            setOutput("I'm sorry, it appears that the input you mentioned has not been provided. Could you please provide the necessary information about the business so I can create an AI prompt for you? |");
            return;
        }
        let generatedPrompt = "";
        enabledSections.forEach((section) => {
            generatedPrompt += `${section.title}:\n${section.value}\n\n`;
        });
        setOutput(generatedPrompt);
    };
    const handleCopyOutput = () => {
        navigator.clipboard.writeText(output);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-end py-4 px-6 text-sm text-gray-500", children: [_jsx(HomeIcon, { className: "w-4 h-4" }), _jsx("span", { className: "mx-2", children: ">" }), _jsx("span", { className: "text-gray-900 font-medium", children: "AI Prompt Generator" })] }), _jsxs("div", { className: "w-full px-6 pb-12", children: [_jsx("div", { className: "mb-8", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "AI Prompt Generator" }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [sections.map((section) => (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-5", children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-3", children: [_jsx("input", { type: "checkbox", checked: section.enabled, onChange: () => handleToggleSection(section.id), className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" }), _jsx("label", { className: "text-sm font-medium text-gray-900 cursor-pointer", onClick: () => handleToggleSection(section.id), children: section.title })] }), _jsx("textarea", { value: section.value, onChange: (e) => handleSectionChange(section.id, e.target.value), placeholder: section.placeholder, disabled: !section.enabled, className: `w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed ${section.enabled
                                                    ? "text-gray-700 bg-white"
                                                    : "text-gray-400 bg-gray-50"}`, rows: 3 })] }, section.id))), _jsx("div", { className: "flex justify-end pt-4", children: _jsx("button", { onClick: handleGeneratePrompt, className: "px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium", children: "Generate Prompt" }) })] }), _jsx("div", { className: "", children: _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-5 sticky top-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700", children: "Output will appear here..." }), _jsx("button", { onClick: handleCopyOutput, disabled: !output, className: `p-1.5 rounded transition-colors ${output
                                                        ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                                                        : "text-gray-300 cursor-not-allowed"}`, title: "Copy to clipboard", children: _jsx(DocumentDuplicateIcon, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "min-h-[600px] max-h-[800px] overflow-y-auto pr-2 custom-scrollbar", children: output ? (_jsx("div", { className: "text-sm text-gray-700 whitespace-pre-wrap leading-relaxed", children: output })) : (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("div", { className: "text-sm text-gray-400", children: "Output will appear here..." }) })) })] }) })] })] })] }));
};
export default AIPromptGenerator;
