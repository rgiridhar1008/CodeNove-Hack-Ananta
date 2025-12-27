
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import dynamic from 'next/dynamic';

const ContactForm = dynamic(() => import('@/components/contact-form').then(mod => mod.ContactForm), { ssr: false });

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions or want to get involved? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8 animate-slide-in-up">
          <h2 className="text-2xl font-bold">Get in Touch</h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href="mailto:contact@civix.in" className="text-muted-foreground hover:text-primary transition-colors">
                    contact@civix.in
                  </a>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <a href="tel:+919876543210" className="text-muted-foreground hover:text-primary transition-colors">
                    +91 98765 43210
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-muted-foreground">Gachibowli, Hyderabad, India 500032</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="animate-slide-in-up" style={{animationDelay: '150ms'}}>
          <h2 className="text-2xl font-bold mb-8">Send a Message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
