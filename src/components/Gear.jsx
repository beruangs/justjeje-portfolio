import React from 'react';
import { motion } from 'framer-motion';
import profileData from '../data/profile.json';

const Gear = () => {
  return (
    <section id="gear" className="section bg-dark">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">Gear</h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {profileData.gear.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800 rounded-lg p-6 text-center"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(80, 109, 255, 0.3)' }}
                >
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-3 md:mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{item.name}</h3>
                  <p className="text-light text-sm md:text-base">{item.type}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Gear;
