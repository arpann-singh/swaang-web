"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { teamMembers as mockTeam } from "@/data/mockData";
import { getTeam } from "@/lib/dataService";

const Team = () => {
  const [members, setMembers] = useState<any[]>(mockTeam);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTeam();
      if (data) setMembers(data);
    };
    fetchData();
  }, []);

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-playfair text-4xl md:text-5xl mb-16 text-white"
        >
          The Creative Ensemble
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative h-[450px] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                  <h3 className="font-playfair text-2xl text-white">{member.name}</h3>
                  <p className="text-gray-500 font-inter text-xs tracking-[0.3em] uppercase mt-2">
                    {member.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
