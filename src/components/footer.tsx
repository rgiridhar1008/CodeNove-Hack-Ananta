
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 md:order-1">&copy; {new Date().getFullYear()} Civix. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground order-3 md:order-2">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
            <div className="flex items-center gap-2 order-1 md:order-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com/rgiridhar1008" target="_blank" aria-label="GitHub">
                  <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://www.linkedin.com/in/giridhar-rls/" target="_blank" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Link>
              </Button>
            </div>
          </div>
          <Separator />
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Developed by Team CodeNova</p>
            <div className="text-xs text-muted-foreground flex flex-wrap justify-center items-center gap-x-2">
              <a href="https://www.linkedin.com/in/giridhar-rls/" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">Rachakonda Lakshmi Sai Giridhar</a>
              <span>|</span>
              <span>Mani MahaLakshmi Vale</span>
              <span>|</span>
              <span>Pranathi Prathipati</span>
              <span>|</span>
              <span>DonthiReddy Krishna Chaitanya</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
