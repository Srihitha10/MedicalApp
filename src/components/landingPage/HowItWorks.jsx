import React from "react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Secure Registration",
      description:
        "Register with our platform to receive a unique blockchain identity protected by multi-factor authentication.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Upload Medical Records",
      description:
        "Securely upload your medical documents which are encrypted and stored on IPFS with only the hash saved on the blockchain.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Manage Access Permissions",
      description:
        "Grant access to specific healthcare providers through smart contracts that enforce your access control policies.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Track Access Activity",
      description:
        "Monitor who accessed your records with detailed audit logs, receiving notifications for all access attempts.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-gray-50">
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
              Process
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              How MedSecure Works
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our blockchain solution puts you in control of your medical data
              with cutting-edge security.
            </p>
          </div>

          <div className="mt-20">
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>

              {/* Steps */}
              <div className="space-y-24">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`relative md:flex ${
                      index % 2 === 0 ? "" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div className="md:w-1/2 mb-8 md:mb-0 md:px-12">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center">
                          <div className="mr-4">{step.icon}</div>
                          <div>
                            <span className="text-blue-600 font-bold">
                              {step.number}
                            </span>
                            <h3 className="text-xl font-semibold text-gray-900 mt-1">
                              {step.title}
                            </h3>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-600">{step.description}</p>
                      </div>
                    </div>

                    {/* Timeline dot */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-24">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="px-6 py-8 sm:p-10">
                <h3 className="text-2xl font-extrabold text-gray-900 text-center">
                  Technical Architecture
                </h3>
                <div className="mt-8 flex justify-center">
                  <div className="max-w-4xl w-full">
                    <svg
                      className="w-full"
                      viewBox="0 0 800 400"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Patient Layer */}
                      <rect
                        x="20"
                        y="20"
                        width="760"
                        height="70"
                        rx="8"
                        fill="#EBF5FF"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <text
                        x="400"
                        y="55"
                        textAnchor="middle"
                        fill="#1E40AF"
                        fontWeight="bold"
                        fontSize="18"
                      >
                        Patient Interface Layer
                      </text>
                      <rect
                        x="60"
                        y="40"
                        width="100"
                        height="30"
                        rx="4"
                        fill="#DBEAFE"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text
                        x="110"
                        y="60"
                        textAnchor="middle"
                        fill="#1E40AF"
                        fontSize="12"
                      >
                        Web App
                      </text>
                      <rect
                        x="200"
                        y="40"
                        width="100"
                        height="30"
                        rx="4"
                        fill="#DBEAFE"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text
                        x="250"
                        y="60"
                        textAnchor="middle"
                        fill="#1E40AF"
                        fontSize="12"
                      >
                        Mobile App
                      </text>
                      <rect
                        x="340"
                        y="40"
                        width="100"
                        height="30"
                        rx="4"
                        fill="#DBEAFE"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text
                        x="390"
                        y="60"
                        textAnchor="middle"
                        fill="#1E40AF"
                        fontSize="12"
                      >
                        Authentication
                      </text>
                      <rect
                        x="480"
                        y="40"
                        width="120"
                        height="30"
                        rx="4"
                        fill="#DBEAFE"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text
                        x="540"
                        y="60"
                        textAnchor="middle"
                        fill="#1E40AF"
                        fontSize="12"
                      >
                        Access Management
                      </text>
                      <rect
                        x="640"
                        y="40"
                        width="100"
                        height="30"
                        rx="4"
                        fill="#DBEAFE"
                        stroke="#3B82F6"
                        strokeWidth="1"
                      />
                      <text
                        x="690"
                        y="60"
                        textAnchor="middle"
                        fill="#1E40AF"
                        fontSize="12"
                      >
                        Notifications
                      </text>

                      {/* Arrows from Patient to Logic Layer */}
                      <path
                        d="M110 70 L110 120"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M250 70 L250 120"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M390 70 L390 120"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M540 70 L540 120"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M690 70 L690 120"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />

                      {/* Business Logic Layer */}
                      <rect
                        x="20"
                        y="120"
                        width="760"
                        height="70"
                        rx="8"
                        fill="#EDE9FE"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                      />
                      <text
                        x="400"
                        y="155"
                        textAnchor="middle"
                        fill="#5B21B6"
                        fontWeight="bold"
                        fontSize="18"
                      >
                        Business Logic Layer
                      </text>
                      <rect
                        x="60"
                        y="140"
                        width="140"
                        height="30"
                        rx="4"
                        fill="#DDD6FE"
                        stroke="#8B5CF6"
                        strokeWidth="1"
                      />
                      <text
                        x="130"
                        y="160"
                        textAnchor="middle"
                        fill="#5B21B6"
                        fontSize="12"
                      >
                        Smart Contracts
                      </text>
                      <rect
                        x="240"
                        y="140"
                        width="140"
                        height="30"
                        rx="4"
                        fill="#DDD6FE"
                        stroke="#8B5CF6"
                        strokeWidth="1"
                      />
                      <text
                        x="310"
                        y="160"
                        textAnchor="middle"
                        fill="#5B21B6"
                        fontSize="12"
                      >
                        Access Control
                      </text>
                      <rect
                        x="420"
                        y="140"
                        width="140"
                        height="30"
                        rx="4"
                        fill="#DDD6FE"
                        stroke="#8B5CF6"
                        strokeWidth="1"
                      />
                      <text
                        x="490"
                        y="160"
                        textAnchor="middle"
                        fill="#5B21B6"
                        fontSize="12"
                      >
                        Encryption Service
                      </text>
                      <rect
                        x="600"
                        y="140"
                        width="140"
                        height="30"
                        rx="4"
                        fill="#DDD6FE"
                        stroke="#8B5CF6"
                        strokeWidth="1"
                      />
                      <text
                        x="670"
                        y="160"
                        textAnchor="middle"
                        fill="#5B21B6"
                        fontSize="12"
                      >
                        Audit Logging
                      </text>

                      {/* Arrows from Logic to Data Layer */}
                      <path
                        d="M130 190 L130 240"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M310 190 L310 240"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M490 190 L490 240"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M670 190 L670 240"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />

                      {/* Data Layer */}
                      <rect
                        x="20"
                        y="240"
                        width="760"
                        height="70"
                        rx="8"
                        fill="#ECFDF5"
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <text
                        x="400"
                        y="275"
                        textAnchor="middle"
                        fill="#065F46"
                        fontWeight="bold"
                        fontSize="18"
                      >
                        Data Storage Layer
                      </text>
                      <rect
                        x="60"
                        y="260"
                        width="200"
                        height="30"
                        rx="4"
                        fill="#D1FAE5"
                        stroke="#10B981"
                        strokeWidth="1"
                      />
                      <text
                        x="160"
                        y="280"
                        textAnchor="middle"
                        fill="#065F46"
                        fontSize="12"
                      >
                        Blockchain (Record Hashes)
                      </text>
                      <rect
                        x="300"
                        y="260"
                        width="200"
                        height="30"
                        rx="4"
                        fill="#D1FAE5"
                        stroke="#10B981"
                        strokeWidth="1"
                      />
                      <text
                        x="400"
                        y="280"
                        textAnchor="middle"
                        fill="#065F46"
                        fontSize="12"
                      >
                        IPFS (Encrypted Files)
                      </text>
                      <rect
                        x="540"
                        y="260"
                        width="200"
                        height="30"
                        rx="4"
                        fill="#D1FAE5"
                        stroke="#10B981"
                        strokeWidth="1"
                      />
                      <text
                        x="640"
                        y="280"
                        textAnchor="middle"
                        fill="#065F46"
                        fontSize="12"
                      >
                        Distributed Database
                      </text>

                      {/* External Layer */}
                      <rect
                        x="20"
                        y="340"
                        width="760"
                        height="40"
                        rx="8"
                        fill="#FEF3C7"
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                      <text
                        x="400"
                        y="365"
                        textAnchor="middle"
                        fill="#92400E"
                        fontWeight="bold"
                        fontSize="16"
                      >
                        Healthcare Providers & Third-Party Systems
                      </text>

                      {/* Arrows from Data to External Layer */}
                      <path
                        d="M160 310 L160 340"
                        stroke="#10B981"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M400 310 L400 340"
                        stroke="#10B981"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                      <path
                        d="M640 310 L640 340"
                        stroke="#10B981"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />

                      {/* Arrow definition */}
                      <defs>
                        <marker
                          id="arrow"
                          viewBox="0 0 10 10"
                          refX="5"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4B5563" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
            >
              Get Started Now
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Join thousands of users who are already securing their medical
              data with blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
