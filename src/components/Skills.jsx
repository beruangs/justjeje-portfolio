import React from 'react';
import { motion } from 'framer-motion';
import profileData from '../data/profile.json';

const Skills = () => {
  return (
    <section id="skills" className="section bg-gray-900">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">Skills</h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {profileData.skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm md:text-base">
                    <span className="font-semibold text-white">{skill.name}</span>
                    <span className="text-secondary font-bold">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 md:h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-secondary to-primary h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
