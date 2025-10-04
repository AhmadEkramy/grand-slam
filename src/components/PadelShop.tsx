import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../hooks/useProducts';

const PadelShop: React.FC = () => {
  const { t } = useLanguage();
  const { products } = useProducts();

  const handlePurchase = (product: any) => {
    const message = encodeURIComponent(t('whatsappPurchaseMsg', `Hi! I'm interested in purchasing ${product.name} for ${product.price} EGP`));
    window.open(`https://wa.me/+201006115163?text=${message}`, '_blank');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-primary mb-12">
          {t('padelShop', 'Padel Shop')}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="card hover-lift">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <h3 className="text-2xl font-bold text-primary mb-3">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-accent">
                  {product.price} {t('egp', 'EGP')}
                </span>
                <button
                  onClick={() => handlePurchase(product)}
                  className="btn-primary"
                >
                  {t('buyNow', 'Buy Now')} 🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PadelShop;
