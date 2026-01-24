import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import profileData from '../data/profile.json';
import { portfolioAPI } from '../utils/api';

const About = () => {
  const [totalProjects, setTotalProjects] = React.useState(0);

  React.useEffect(() => {
    portfolioAPI.getAll().then(res => {
      if (res.success) setTotalProjects(res.data.length);
    });
  }, []);

  // Calculate years of experience from 2019
  const startYear = 2019;
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = currentYear - startYear;

  // Parallax effect
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  return (
    <section id="about" className="section bg-gray-900 relative">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">About</h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Profile Image with Parallax */}
            <motion.div
              className="md:col-span-1 mx-auto md:mx-0 w-full max-w-xs md:max-w-none"
              style={{ y, opacity }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src={profileData.profileImage}
                alt={profileData.fullname}
                className="rounded-3xl w-full shadow-2xl"
              />
            </motion.div>

            {/* Content */}
            <div className="md:col-span-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                {profileData.title}
              </h3>
              <p className="text-light text-sm md:text-base leading-relaxed mb-4 md:mb-6 italic">
                {profileData.about}
              </p>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 text-sm md:text-base">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Fullname:</strong>
                    <span className="ml-2">{profileData.fullname}</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Age:</strong>
                    <span className="ml-2">{profileData.age}</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>City:</strong>
                    <span className="ml-2">{profileData.city}</span>
                  </li>
                </ul>

                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Freelance:</strong>
                    <span className="ml-2 text-green-400">{profileData.freelance}</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Instagram:</strong>
                    <span className="ml-2">@justjejee._</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>E-Mail:</strong>
                    <span className="ml-2">{profileData.contact.email}</span>
                  </li>
                </ul>
              </div>

              <motion.a
                href={profileData.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Available for hire
              </motion.a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12 md:mt-16">
            {[
              { icon: '💼', label: 'Years of experiences', value: yearsOfExperience },
              { icon: '🎬', label: 'Projects completed', value: totalProjects },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="card p-6 md:p-8 text-center flex flex-col items-center justify-center border-secondary/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, borderColor: 'rgba(80, 109, 255, 0.5)' }}
              >
                <div className="text-4xl md:text-5xl mb-4">{stat.icon}</div>
                <motion.div
                  className="text-5xl md:text-6xl font-bold text-secondary mb-3"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3, type: 'spring' }}
                >
                  {stat.value}+
                </motion.div>
                <p className="text-light text-base md:text-lg font-bold tracking-wide uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
