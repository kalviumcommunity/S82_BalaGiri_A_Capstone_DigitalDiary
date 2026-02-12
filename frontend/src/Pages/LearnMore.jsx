import React from 'react';
import { motion } from 'framer-motion';
import {
  BookHeart,
  Search,
  Image as ImageIcon,
  Mic,
  Database,
  Code2,
  Server,
  ShieldCheck,
  Palette,
  Layout,
  Sparkles
} from 'lucide-react';

function LearnMore({ currentTheme, isDark }) {

  const theme = currentTheme || {
    background: 'from-gray-900 via-gray-800 to-gray-900',
    text: 'text-white',
    subtext: 'text-gray-300'
  };


  const fallbackBg = isDark ? 'bg-[#0B1026]' : 'bg-[#B8D9F2]';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 80, damping: 20 }
    }
  };

  const features = [
    {
      icon: <BookHeart className="w-6 h-6" />,
      title: "Rich Entries",
      description: "Create detailed entries with titles, content, mood tracking, and timestamps.",
      bg: "bg-pink-500",
      text: isDark ? "text-pink-300" : "text-pink-600"
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: "Media Support",
      description: "Enhance your memories by attaching multiple photos to every entry.",
      bg: "bg-blue-500",
      text: isDark ? "text-blue-300" : "text-blue-600"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Notes",
      description: "Record your thoughts directly in the browser and attach audio clips.",
      bg: "bg-purple-500",
      text: isDark ? "text-purple-300" : "text-purple-600"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description: "Instantly find past memories by searching through titles and content.",
      bg: "bg-yellow-500",
      text: isDark ? "text-yellow-300" : "text-yellow-700"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Theming",
      description: "Toggle between a soothing Dark Mode and a vibrant Light Mode.",
      bg: "bg-teal-500",
      text: isDark ? "text-teal-300" : "text-teal-700"
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Clean UI",
      description: "Distraction-free interface focusing purely on your writing experience.",
      bg: "bg-indigo-500",
      text: isDark ? "text-indigo-300" : "text-indigo-700"
    }
  ];

  const techStack = {
    Frontend: [
      { name: "React 18", icon: <Code2 className="w-4 h-4" />, color: isDark ? "text-blue-300" : "text-blue-700" },
      { name: "Tailwind CSS", icon: <Palette className="w-4 h-4" />, color: isDark ? "text-teal-300" : "text-teal-700" },
      { name: "Framer Motion", icon: <Layout className="w-4 h-4" />, color: isDark ? "text-purple-300" : "text-purple-700" },
      { name: "Lucide Icons", icon: <ImageIcon className="w-4 h-4" />, color: isDark ? "text-orange-300" : "text-orange-700" },
    ],
    Backend: [
      { name: "Node.js", icon: <Server className="w-4 h-4" />, color: isDark ? "text-green-300" : "text-green-700" },
      { name: "Express", icon: <Server className="w-4 h-4" />, color: isDark ? "text-gray-300" : "text-gray-700" },
      { name: "MongoDB", icon: <Database className="w-4 h-4" />, color: isDark ? "text-green-300" : "text-green-700" },
      { name: "JWT Auth", icon: <ShieldCheck className="w-4 h-4" />, color: isDark ? "text-yellow-300" : "text-yellow-700" },
    ]
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${fallbackBg} bg-gradient-to-br ${theme.background} pt-36 pb-12 px-4 sm:px-6 lg:px-8`}>


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ willChange: 'transform' }}
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transform-gpu ${isDark ? 'bg-purple-600' : 'bg-blue-300'}`}
        />
        <motion.div
          style={{ willChange: 'transform' }}
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transform-gpu ${isDark ? 'bg-blue-600' : 'bg-cyan-300'}`}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto space-y-20"
      >

        <motion.div variants={itemVariants} className="text-center space-y-6">
          <motion.div
            className={`inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-6 ${theme.text}`}
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </motion.div>
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight ${theme.text} drop-shadow-xl`}>
            More Than Just <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              A Diary
            </span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${theme.subtext}`}>
            Experience the perfect blend of security, simplicity, and modern design.
            From mood tracking to voice notes, we've built the ultimate companion for your thoughts.
          </p>
        </motion.div>


        <motion.div variants={itemVariants} className="relative">
          <div className="flex items-center justify-center gap-3 mb-20">
            <div className={`h-px w-12 ${isDark ? 'bg-white/20' : 'bg-black/10'}`}></div>
            <h2 className={`text-2xl font-bold uppercase tracking-widest ${theme.text} opacity-80`}>Journey Through Features</h2>
            <div className={`h-px w-12 ${isDark ? 'bg-white/20' : 'bg-black/10'}`}></div>
          </div>

          <div className="relative max-w-5xl mx-auto">

            <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b ${isDark ? 'from-transparent via-purple-500/50 to-transparent' : 'from-transparent via-blue-400/50 to-transparent'}`} />

            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                className={`relative flex items-center mb-16 md:mb-24 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
              >

                <div className="hidden md:block w-5/12" />


                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-4 border-white/10 backdrop-blur-md z-10 shadow-lg bg-gradient-to-br from-white/20 to-white/5">
                  <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${feature.bg} shadow-[0_0_10px_currentColor]`} />
                </div>


                <div className="pl-16 md:pl-0 w-full md:w-5/12">
                  <div className={`p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:border-white/20 hover:bg-white/10 transition-all duration-300 group`}>
                    <div className={`p-3 rounded-xl w-fit mb-4 ${feature.bg} bg-opacity-10 ${feature.text}  group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className={`text-2xl font-bold mb-3 ${theme.text}`}>
                      {feature.title}
                    </h3>
                    <p className={`${theme.subtext} leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>


        <motion.div variants={itemVariants} className="relative rounded-[2.5rem] p-10 overflow-hidden border border-white/10 shadow-2xl">
          <div className={`absolute inset-0 bg-white/5 backdrop-blur-md`}></div>

          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[80px] opacity-30 ${isDark ? 'bg-pink-600' : 'bg-pink-300'} pointer-events-none`}></div>

          <div className="relative z-10">
            <h2 className={`text-3xl font-bold text-center mb-16 ${theme.text}`}>Built With The Best</h2>

            <div className="grid md:grid-cols-2 gap-16">

              <div className="space-y-8">
                <h3 className={`text-xl font-bold uppercase tracking-wider text-center ${theme.text} border-b border-white/10 pb-4`}>
                  Frontend Ecosystem
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {techStack.Frontend.map((tech, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all ${theme.text}`}
                    >
                      <div className={`p-2 rounded-lg bg-white/5 ${tech.color} bg-opacity-10`}>
                        {tech.icon}
                      </div>
                      <span className="font-semibold">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>


              <div className="space-y-8">
                <h3 className={`text-xl font-bold uppercase tracking-wider text-center ${theme.text} border-b border-white/10 pb-4`}>
                  Backend Architecture
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {techStack.Backend.map((tech, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all ${theme.text}`}
                    >
                      <div className={`p-2 rounded-lg bg-white/5 ${tech.color} bg-opacity-10`}>
                        {tech.icon}
                      </div>
                      <span className="font-semibold">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LearnMore;
