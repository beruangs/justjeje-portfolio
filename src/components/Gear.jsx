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
                  className="card p-6 md:p-8 text-center flex flex-col items-center justify-center border-secondary/10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, borderColor: 'rgba(80, 109, 255, 0.4)' }}
                >
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-4 md:mb-6"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{item.name}</h3>
                  <div className="w-10 h-1 bg-secondary rounded-full mb-3"></div>
                  <p className="text-light font-medium text-sm md:text-base tracking-tight">{item.type}</p>
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
