import React from 'react';

const socialLinks = [
  {
    href: 'https://www.instagram.com/_ahmedekramy?igsh=MXJmY2ljdjZzenZiMw==',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="8" stroke="#60A5FA" strokeWidth="2" fill="none" />
        <rect x="9.5" y="9.5" width="13" height="13" rx="6.5" stroke="#60A5FA" strokeWidth="2" fill="none" />
        <circle cx="23" cy="9" r="1.5" fill="#60A5FA" />
      </svg>
    ),
    color: 'text-blue-400',
  },
  {
    href: 'https://www.facebook.com/share/16iD6otQMv/',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="8" stroke="#60A5FA" strokeWidth="2" fill="none" />
        <path d="M18 10.5h2V8h-2c-2.2 0-4 1.8-4 4v2H10v3h4v7h3v-7h2.1l.4-3H17v-2c0-.6.4-1 1-1z" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    color: 'text-blue-400',
  },
  {
    href: 'https://wa.me/201094543689',
    label: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="8" stroke="#60A5FA" strokeWidth="2" fill="none" />
        <path d="M21.5 17.5c-.3-.2-1.7-.9-2-.9-.2 0-.4-.1-.6.1-.2.2-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5-.2 0-.4 0-.6 0-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5 0 1.5 1.1 2.9 1.2 3.1.1.2 2.1 3.2 5.1 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4 0-.1-.3-.2-.6-.3z" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    color: 'text-blue-400',
  },
];

const Footer = () => (
  <footer className="w-full bg-gray-900 text-white py-8 mt-12 animate-fade-in-up">
    <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
      <a
        href="https://www.instagram.com/_ahmedekramy?igsh=MXJmY2ljdjZzenZiMw=="
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-lg text-white transition-all duration-300 group hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)] hover:text-primary"
      >
        Website by Ahmed Ekramy
      </a>
      <span className="text-sm text-gray-400 mt-1">Computer Engineer & Full Stack Developer</span>
      <div className="flex gap-10 mt-6">
        {socialLinks.map(({ href, label, icon, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex flex-col items-center group"
          >
            <span className="rounded-2xl p-3 border border-transparent group-hover:border-blue-400 transition-all duration-300 group-hover:shadow-[0_0_16px_2px_rgba(59,130,246,0.5)]">
              {icon}
            </span>
            <span className={`mt-2 text-sm font-medium ${color} group-hover:text-blue-400 transition-all duration-300`}>{label}</span>
          </a>
        ))}
      </div>
      <span className="text-xs text-gray-500 mt-6">&copy; {new Date().getFullYear()} Grand Slam. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer; 