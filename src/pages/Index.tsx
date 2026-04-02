import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Coffee, Utensils, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/shared/FloatingParticles';

const features = [
  {
    icon: Calendar,
    title: 'Real-Time Availability',
    description: 'See table availability instantly and book in seconds',
  },
  {
    icon: Utensils,
    title: 'Pre-Order Your Meal',
    description: 'Browse our menu and have your order ready when you arrive',
  },
  {
    icon: Clock,
    title: 'Easy Check-In',
    description: 'Seamless arrival experience with digital check-in',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1920&h=1080&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        {/* Floating Particles */}
        <FloatingParticles count={30} />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Premium Dining Experience</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6"
            >
              <span className="text-gradient-gold">Noir</span> Lounge
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Where exceptional coffee meets elegant ambiance. 
              Experience the art of relaxation in our carefully curated space.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/book">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow text-lg px-8 py-6">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a Table
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 py-6">
                  <Coffee className="w-5 h-5 mr-2" />
                  View Menu
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </motion.div>
          </motion.div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient-gold">Noir Lounge</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We've crafted every detail to ensure your visit is nothing short of extraordinary
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-panel p-8 text-center group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:gold-glow-sm transition-all"
                >
                  <feature.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ambiance Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                An Intimate <span className="text-gradient-gold">Escape</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Step into a world where time slows down. Our carefully designed space 
                combines modern elegance with cozy warmth, creating the perfect backdrop 
                for meaningful conversations and quiet moments of reflection.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="font-serif text-4xl font-bold text-primary">28+</div>
                  <div className="text-muted-foreground text-sm">Premium Tables</div>
                </div>
                <div>
                  <div className="font-serif text-4xl font-bold text-primary">4</div>
                  <div className="text-muted-foreground text-sm">Unique Zones</div>
                </div>
                <div>
                  <div className="font-serif text-4xl font-bold text-primary">100+</div>
                  <div className="text-muted-foreground text-sm">Happy Guests Daily</div>
                </div>
              </div>
              <Link to="/book">
                <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gold-glow-sm">
                  Reserve Your Spot
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&h=500&fit=crop"
                  alt="Café interior"
                  className="rounded-2xl object-cover h-64 w-full"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=300&fit=crop"
                  alt="Coffee preparation"
                  className="rounded-2xl object-cover h-48 w-full mt-8"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop"
                  alt="Cozy seating"
                  className="rounded-2xl object-cover h-48 w-full -mt-8"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=500&fit=crop"
                  alt="Ambiance lighting"
                  className="rounded-2xl object-cover h-64 w-full"
                />
              </div>
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-12 md:p-16 text-center relative overflow-hidden gold-glow"
          >
            <FloatingParticles count={15} />
            <div className="relative z-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Ready for an Unforgettable Evening?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Reserve your table now and let us create a memorable experience for you
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/book">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
                    <Users className="w-5 h-5 mr-2" />
                    Book Your Table
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button size="lg" variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 py-6">
                    Explore Our Menu
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
