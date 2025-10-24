import React, { useState } from "react";
import {
  HomeIcon,
  CheckIcon,
  // CreditCardIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const SubClients: React.FC = () => {
  const [showPricingPlans, setShowPricingPlans] = useState(false);

  const handleUpgradeClick = () => {
    setShowPricingPlans(true);
  };

  const handleBackClick = () => {
    setShowPricingPlans(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="#" className="text-gray-700 hover:text-blue-600">
              <HomeIcon className="w-4 h-4 mr-2" />
              Dashboard
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-gray-500 md:ml-2">Sub Clients</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sub Clients</h1>
      </div>

      {!showPricingPlans ? (
        /* Action Required View */
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-2xl w-full text-center">
            {/* PRIX AI Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17h-2v-6h2v6zm0-8h-2V7h2v4z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">PRIX AI</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Action Required
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              An Agency plan is required to create and manage sub-clients. With
              an Agency plan, you can oversee multiple businesses from one
              dashboard, set up unique prompts for each sub-client, and manage
              billing and reporting across all accounts. Upgrade to the Agency
              plan to start adding and managing sub-clients.
            </p>

            <button
              onClick={handleUpgradeClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      ) : (
        /* Pricing Plans View */
        <div>
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Sub Clients
            </button>
          </div>

          {/* Top Right Icons */}
          <div className="flex justify-end mb-6 space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Limited Plan */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Limited
                </h3>
                <div className="text-3xl font-bold text-gray-900">
                  $30/Month
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">$30/month</span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Unlimited calls, booked appointments, & transfers
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Ability to create inbound & outbound agents
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Capable of 12+ languages
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Testing and single launch calls without the ability for
                    campaigns or complete automations.
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">30+ AI voices</span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Pre-made prompt templates
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Voicemail Detection: Detects voicemail and either hangs up
                    or leaves a pre-set voicemail message
                  </span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Activate
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Business
                </h3>
                <div className="text-3xl font-bold text-gray-900">
                  $500/Month
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">$500/month</span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    One time activation fee
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    $0.20/min of talk time
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    2,000 minutes of talk time included
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    High-Speed Dialing (1800 Calls in 60 seconds)
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Mid-Call Actions
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    AI IVR Navigation
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Custom Business Support
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    White Glove Onboarding & AI Agents
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    All in One Business Management
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Dedicated Customer Success Manager
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Support via Slack
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Native GoHighLevel Integration
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    CRM Agnostic (Can trigger calls from most platforms)
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    SimpleTalk University
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Connects to 6,000+ apps
                  </span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Schedule A Demo
              </button>
            </div>

            {/* Agency Plan */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H14V15H12V13H14V11H12V9H20V19M18,11H16V13H18V11M18,15H16V17H18V15Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Agency
                </h3>
                <div className="text-3xl font-bold text-gray-900">
                  $10,000/Month
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">$10000/month</span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    $0.16/min of talk time
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Unlimited Sub Accounts
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Resell Minutes at Premium
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Included GoHighLevel CRM or Plugin with any CRM
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Revenue Growth: Generate new revenue streams with AI-powered
                    call handling
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Competitive Edge: Enhance client service capabilities with
                    advanced technology
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Scalability: Easily scale operations with minimal overhead
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Client Retention: Improve client satisfaction with efficient
                    solutions
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Turnkey Solution: Provide a ready to use AI system without
                    extensive technical knowledge
                  </span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Schedule A Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubClients;
