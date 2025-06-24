import React from 'react';

const socials = [
  {
    label: 'WhatsApp',
    onClick: () => {
      const phoneNumber = '+201006115163';
      const message = encodeURIComponent("Hello! I'm interested in booking a padel court.");
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    },
    color: 'bg-green-500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.686z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    onClick: () => {
      window.open('https://www.facebook.com/share/16X9br8kBe/', '_blank');
    },
    color: 'bg-[#1877F3]',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 10.5h2V8h-2c-2.2 0-4 1.8-4 4v2H10v3h4v7h3v-7h2.1l.4-3H17v-2c0-.6.4-1 1-1z" stroke="#fff" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    onClick: () => {
      window.open('https://www.instagram.com/grandslamacademy1?igsh=MTV3OW1qNDA4NXE5ZA==', '_blank');
    },
    color: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="20" height="20" rx="6" stroke="#fff" strokeWidth="2" fill="none" />
        <rect x="12" y="12" width="8" height="8" rx="4" stroke="#fff" strokeWidth="2" fill="none" />
        <circle cx="22" cy="10" r="1" fill="#fff" />
      </svg>
    ),
  },
];

const SocialFloat = () => (
  <div className="fixed z-50 bottom-6 right-6 flex flex-col gap-4 items-end">
    {socials.map(({ label, onClick, color, icon }) => (
      <button
        key={label}
        onClick={onClick}
        aria-label={label}
        className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg ${color} hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.5)] transition-all duration-300`}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      >
        <span className="group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
      </button>
    ))}
  </div>
);

export default SocialFloat; 