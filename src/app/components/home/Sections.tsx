import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, ArrowRight, Linkedin } from 'lucide-react';
import { Button, Card } from '../ui/Base';
import { ImageWithFallback } from '../figma/ImageWithFallback';

/* --- Cultural Grid Section --- */
const cultureCards = [
  { title: "Faith & Philosophy", img: "https://images.unsplash.com/photo-1764426383066-0ae38daa967b?q=80&w=800&auto=format&fit=crop" },
  { title: "Art & Architecture", img: "https://images.unsplash.com/photo-1630663129615-a2331ed88ab6?q=80&w=800&auto=format&fit=crop" },
  { title: "Music & Dance", img: "https://images.unsplash.com/photo-1575669572405-52da19d6a7db?q=80&w=800&auto=format&fit=crop" },
  { title: "Literature & Languages", img: "https://images.unsplash.com/photo-1562164914-f71b2835e86b?q=80&w=800&auto=format&fit=crop" },
  { title: "Ethnic Traditions", img: "https://images.unsplash.com/photo-1763184176470-2115508594d3?q=80&w=800&auto=format&fit=crop" },
];

export function CulturalGrid() {
  return (
    <section id="cultural-grid" className="py-16 md:py-24 bg-[var(--color-background-primary)]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-deep-indigo)] mb-4">The Many Indias</h2>
          <div className="h-1 w-24 bg-[var(--color-saffron-primary)] mx-auto rounded-full" />
        </motion.div>

        {/* Mobile Horizontal Scroll / Desktop Grid */}
        <div className="flex overflow-x-auto gap-6 pb-8 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-6 md:overflow-visible snap-x snap-mandatory hide-scrollbar">
          {cultureCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="min-w-[260px] md:min-w-0 snap-center"
            >
              <div className="group relative h-80 rounded-[var(--radius-card)] overflow-hidden shadow-md cursor-pointer">
                <ImageWithFallback 
                  src={card.img} 
                  alt={card.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-white font-serif text-xl font-bold leading-tight group-hover:text-[var(--color-saffron-primary)] transition-colors">
                    {card.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- India & America Section --- */
export function IndiaAmerica() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[var(--radius-card)] overflow-hidden shadow-xl aspect-[4/3]"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/flagged/photo-1579503429289-6de86c9fc2de?q=80&w=1200&auto=format&fit=crop"
              alt="Diverse Community"
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="w-16 h-1 bg-[var(--color-gold-divider)]" />
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[var(--color-deep-indigo)] leading-tight">
              Bridging Cultures,<br />Building Community.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We celebrate the rich tapestry of Indian heritage while embracing the democratic values we share with America. 
              Our mission is to foster understanding, celebrate diversity, and create a welcoming space for all communities to connect.
            </p>
            <Button variant="outline" className="self-start mt-4">
              Learn About Our Mission
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* --- Events Section --- */
const events = [
  { 
    title: "Classical Ragas: Evening Concert", 
    date: "Mar 15", 
    category: "Music",
    img: "https://images.unsplash.com/photo-1771238113736-5954f174156b?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    title: "Modern India: Economic Seminar", 
    date: "Mar 22", 
    category: "Talk",
    img: "https://images.unsplash.com/photo-1759456629070-8e222ab878ba?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    title: "Spring Festival & Dance", 
    date: "Apr 05", 
    category: "Festival",
    img: "https://images.unsplash.com/photo-1630663129615-a2331ed88ab6?q=80&w=800&auto=format&fit=crop" 
  },
];

export function Events() {
  return (
    <section id="events" className="py-16 md:py-24 bg-[var(--color-ivory-bg)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-deep-indigo)] mb-2">Upcoming Events</h2>
            <p className="text-gray-600">Join us for cultural celebrations and learning.</p>
          </div>
          <Button variant="ghost" className="hidden md:flex">View All Events <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Card className="h-full flex flex-col group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback 
                    src={event.img} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--color-deep-indigo)] shadow-sm">
                    {event.category}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-[var(--color-saffron-primary)] font-bold text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[var(--color-deep-indigo)] mb-3 group-hover:text-[var(--color-peacock-blue)] transition-colors">
                    {event.title}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>Providence, RI</span>
                    <span className="text-[var(--color-peacock-blue)] font-medium group-hover:underline">Details</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" fullWidth>View All Events</Button>
        </div>
      </div>
    </section>
  );
}

/* --- Donation Strip --- */
export function DonationStrip() {
  return (
    <section className="py-20 bg-[var(--color-deep-indigo)] text-white relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--color-peacock-blue)] opacity-10 skew-x-12" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl font-bold mb-6 leading-tight"
          >
            Support the Future of Our Heritage
          </motion.h2>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your contribution helps us preserve history, celebrate culture, and educate future generations. Join our mission today.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="bg-[var(--color-saffron-primary)] text-white hover:bg-white hover:text-[var(--color-saffron-primary)] shadow-lg px-12 text-lg font-semibold">
              Make a Donation
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* --- Visit Section --- */
export function Visit() {
  return (
    <section id="visit" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-deep-indigo)] mb-8">Plan Your Visit</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-ivory-bg)] flex items-center justify-center shrink-0 text-[var(--color-peacock-blue)]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">123 Heritage Way<br />Providence, RI 02903</p>
                  <a href="#" className="text-[var(--color-peacock-blue)] text-sm font-medium mt-2 inline-block hover:underline">Get Directions</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-ivory-bg)] flex items-center justify-center shrink-0 text-[var(--color-peacock-blue)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Hours</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-gray-600">
                    <span>Mon - Fri</span>
                    <span>10:00 AM - 5:00 PM</span>
                    <span>Saturday</span>
                    <span>10:00 AM - 6:00 PM</span>
                    <span>Sunday</span>
                    <span>12:00 PM - 5:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--color-ivory-bg)] rounded-[var(--radius-card)] mt-6">
                <h4 className="font-bold text-[var(--color-deep-indigo)] mb-2">Accessibility</h4>
                <p className="text-sm text-gray-600">
                  Our facility is fully wheelchair accessible. We offer sensory-friendly hours on the first Tuesday of every month.
                </p>
              </div>
            </div>
          </div>

          <div className="h-full min-h-[400px] bg-gray-100 rounded-[var(--radius-card)] overflow-hidden relative shadow-inner">
            {/* Map Placeholder */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2973.078492023964!2d-71.4128!3d41.8240!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e4451158a55555%3A0x5555555555555555!2sProvidence%2C%20RI!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              className="absolute inset-0 filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Leadership Section --- */
const leaders = [
  { 
    name: "Dr. Arun Sharma", 
    role: "President", 
    bio: "Former Dean of Cultural Studies with over 20 years of experience in museum curation.",
    img: "https://images.unsplash.com/photo-1758600588319-fa4097ee5208?q=80&w=400&auto=format&fit=crop"
  },
  { 
    name: "Priya Patel", 
    role: "Chairwoman", 
    bio: "Community leader and philanthropist dedicated to preserving Indian heritage in New England.",
    img: "https://images.unsplash.com/photo-1610189019383-606d9eaa6766?q=80&w=400&auto=format&fit=crop"
  },
  { 
    name: "Rajiv Singh", 
    role: "Founder", 
    bio: "Visionary entrepreneur who established the society to bridge cultures and generations.",
    img: "https://images.unsplash.com/photo-1769636929231-3cd7f853d038?q=80&w=400&auto=format&fit=crop"
  },
];

export function Leadership() {
  return (
    <section id="leadership" className="py-16 md:py-24 bg-[var(--color-ivory-bg)] border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-deep-indigo)] mb-4">Leadership</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated individuals guiding our vision and mission forward.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {leaders.map((leader, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md">
                <ImageWithFallback 
                  src={leader.img} 
                  alt={leader.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--color-deep-indigo)] mb-1">{leader.name}</h3>
              <p className="text-[var(--color-saffron-primary)] font-medium text-sm tracking-wide uppercase mb-3">{leader.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto mb-4">{leader.bio}</p>
              <a href="#" className="text-gray-400 hover:text-[#0077b5] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
