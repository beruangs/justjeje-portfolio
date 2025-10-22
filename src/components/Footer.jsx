import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-dark border-t border-gray-800 py-6 md:py-8">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-light text-sm md:text-base mb-2">
            &copy; Copyright <strong className="text-white">Just-Jeje</strong>
          </p>
          <p className="text-sm text-gray-500">
            Designed with ❤️ using React & Tailwind CSS
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
