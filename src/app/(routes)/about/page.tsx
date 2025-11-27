/* eslint-disable react/no-unescaped-entities */
"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import Image from "next/image";
import { Building2, Users, Shield, Award, Heart, Home } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#1d2b1f]">
      <Navbar variant="community" />

      {/* Hero Section */}
      <section className="relative isolate min-h-[50vh] w-full overflow-hidden">
        <Image
          src="/hero.png"
          alt="Promenade Residence"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex min-h-[50vh] flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="text-5xl font-serif font-semibold uppercase tracking-wider sm:text-6xl lg:text-7xl">
            About Us
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            Discover the story behind Promenade Residence and our commitment to creating
            exceptional living experiences.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          {/* Our Story */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-semibold text-[#1b2b1e] mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none prose-p:text-[#4e5c51]">
              <p className="mb-4">
                Promenade Residence was established with a vision to create a premier residential
                community that combines modern living with a sense of belonging. Since our inception,
                we have been dedicated to providing residents with not just a place to live, but a
                place to call home.
              </p>
              <p className="mb-4">
                Our community is built on the foundation of quality, integrity, and a commitment to
                excellence. We understand that a home is more than just four walls—it's where
                memories are made, families grow, and lives flourish.
              </p>
              <p>
                Through careful planning and attention to detail, we have created a residential
                environment that offers comfort, security, and a vibrant community spirit. Every
                aspect of Promenade Residence has been designed with our residents' well-being and
                satisfaction in mind.
              </p>
            </div>
          </div>

          {/* Our Mission & Vision */}
          <div className="grid gap-8 md:grid-cols-2 mb-16">
            <div className="rounded-2xl border border-[#e1e3dc] bg-[#f7f7f3] p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-[#327248]" />
                <h3 className="text-2xl font-semibold text-[#1b2b1e]">Our Mission</h3>
              </div>
              <p className="text-[#4e5c51] leading-relaxed">
                To provide exceptional residential living experiences by maintaining the highest
                standards of service, fostering a sense of community, and ensuring the safety and
                well-being of all residents. We are committed to creating an environment where
                families can thrive and individuals can find peace and comfort.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e1e3dc] bg-[#f7f7f3] p-8">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-8 w-8 text-[#327248]" />
                <h3 className="text-2xl font-semibold text-[#1b2b1e]">Our Vision</h3>
              </div>
              <p className="text-[#4e5c51] leading-relaxed">
                To be recognized as the premier residential community that sets the standard for
                quality living, community engagement, and resident satisfaction. We envision a
                future where Promenade Residence continues to be a place where residents are proud
                to call home for generations to come.
              </p>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-semibold text-[#1b2b1e] mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-[#e1e3dc] bg-white p-6 text-center">
                <Shield className="h-12 w-12 text-[#327248] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-2">Security</h4>
                <p className="text-sm text-[#4e5c51]">
                  Ensuring the safety and security of all residents and their properties.
                </p>
              </div>

              <div className="rounded-xl border border-[#e1e3dc] bg-white p-6 text-center">
                <Users className="h-12 w-12 text-[#327248] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-2">Community</h4>
                <p className="text-sm text-[#4e5c51]">
                  Fostering a strong sense of community and neighborly connections.
                </p>
              </div>

              <div className="rounded-xl border border-[#e1e3dc] bg-white p-6 text-center">
                <Home className="h-12 w-12 text-[#327248] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-2">Quality</h4>
                <p className="text-sm text-[#4e5c51]">
                  Maintaining the highest standards in property management and services.
                </p>
              </div>

              <div className="rounded-xl border border-[#e1e3dc] bg-white p-6 text-center">
                <Building2 className="h-12 w-12 text-[#327248] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-2">Excellence</h4>
                <p className="text-sm text-[#4e5c51]">
                  Striving for excellence in every aspect of community living.
                </p>
              </div>

              <div className="rounded-xl border border-[#e1e3dc] bg-white p-6 text-center">
                <Heart className="h-12 w-12 text-[#327248] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-2">Respect</h4>
                <p className="text-sm text-[#4e5c51]">
                  Treating all residents with dignity, respect, and understanding.
                </p>
              </div>

              <div className="rounded-xl border border-[#e1e3dc] bg-white p-6 text-center">
                <Award className="h-12 w-12 text-[#327248] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-2">Integrity</h4>
                <p className="text-sm text-[#4e5c51]">
                  Conducting all operations with honesty, transparency, and ethical practices.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-semibold text-[#1b2b1e] mb-6">
              What We Offer
            </h2>
            <div className="prose prose-lg max-w-none prose-p:text-[#4e5c51]">
              <p className="mb-4">
                Promenade Residence offers a comprehensive range of amenities and services designed
                to enhance your living experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Modern Amenities:</strong> Multi-purpose hall, gazebo, basketball court,
                  swimming pool, and more</li>
                <li><strong>Secure Environment:</strong> 24/7 security, access control systems, and
                  surveillance</li>
                <li><strong>Professional Management:</strong> Dedicated management team committed
                  to resident satisfaction</li>
                <li><strong>Digital Platform:</strong> Easy access to services, payments, and
                  community information</li>
                <li><strong>Community Events:</strong> Regular activities and gatherings to foster
                  neighborly connections</li>
                <li><strong>Maintenance Services:</strong> Prompt response to maintenance requests
                  and property upkeep</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-[#e1e3dc] bg-[#f7f7f3] p-8">
            <h2 className="text-3xl font-serif font-semibold text-[#1b2b1e] mb-6">
              Get in Touch
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-3">Management Office</h4>
                <ul className="space-y-2 text-[#4e5c51]">
                  <li><strong>Phone:</strong> +63 928 984 8643</li>
                  <li><strong>Email:</strong> thepromenaderesidences@gmail.com</li>
                  <li><strong>Office Hours:</strong> Monday to Sunday, 8:00 AM - 5:00 PM</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#1b2b1e] mb-3">Emergency</h4>
                <ul className="space-y-2 text-[#4e5c51]">
                  <li><strong>Emergency Hotline:</strong> +63 928 984 8643</li>
                  <li><strong>Available:</strong> 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AboutPage;

