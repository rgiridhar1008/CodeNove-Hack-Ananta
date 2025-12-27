
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldOff,
  ShieldCheck,
  Cpu,
  Heart,
  Eye,
  Users,
  Building
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          What is Civix?
        </h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
          Civix is a digital civic engagement platform designed to empower
          Hyderabad citizens and students to actively participate in improving
          their local communities. It provides a single, transparent dashboard
          to report civic issues, track their resolution, and engage with

          governance through data and participation.
        </p>
      </div>

      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="shadow-lg animate-slide-in-up" style={{ animationDelay: '150ms'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldOff className="h-6 w-6 text-primary" />
                    The Problem We Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>Fragmented reporting portals for different civic bodies.</li>
                    <li>Lack of transparency in issue status and timelines.</li>
                    <li>No clear accountability or escalation visibility.</li>
                    <li>Limited and often discouraging citizen participation.</li>
                    <li>Absence of data-driven insights for authorities.</li>
                    <li>Difficult to track recurring or area-specific problems.</li>
                    <li>No feedback loop to inform citizens of resolution.</li>
                  </ul>
                  <p className="mt-4 text-muted-foreground">
                    As a result, issues remain unresolved for long periods, especially
                    around campuses and residential communities, leading to citizen frustration.
                  </p>
                </CardContent>
            </Card>
          <Card className="shadow-lg animate-slide-in-up" style={{ animationDelay: '300ms'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Civix simplifies and unifies civic issue reporting by offering:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Geo-tagged grievance submission</li>
                <li>Real-time status tracking</li>
                <li>Photo-based evidence</li>
                <li>Expected resolution timelines</li>
                <li>Admin dashboards for issue management</li>
                <li>AI-powered duplicate detection</li>
              </ul>
              <p className="mt-4 font-semibold">
                This ensures clarity, accountability, and trust between citizens
                and authorities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Mission</h2>
        <p className="mt-2 text-muted-foreground md:text-lg max-w-3xl mx-auto">
          To strengthen e-governance and civic participation by making issue
          reporting simple, transparent, data-driven, and accessible to
          everyone.
        </p>
      </section>

      <section className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Impact</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="animate-slide-in-up" style={{ animationDelay: '450ms'}}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary"/>
                        For Citizens & Students
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                        <li>Faster issue reporting</li>
                        <li>Clear visibility into resolution progress</li>
                        <li>Recognition for civic contributions</li>
                        <li>Safer and cleaner campus surroundings</li>
                    </ul>
                </CardContent>
            </Card>
            <Card className="animate-slide-in-up" style={{ animationDelay: '600ms'}}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-6 w-6 text-primary"/>
                        For Authorities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                        <li>Centralized grievance data</li>
                        <li>Priority-based issue handling</li>
                        <li>Area-wise issue analytics</li>
                        <li>Improved resource planning</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </section>
      
      <section>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Foundation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow animate-slide-in-up" style={{ animationDelay: '750ms'}}>
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Cpu className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Technology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Leveraging Firebase, Google Maps, and an AI-ready architecture for a smart, scalable solution.</p>
                </CardContent>
            </Card>
             <Card className="text-center shadow-md hover:shadow-xl transition-shadow animate-slide-in-up" style={{ animationDelay: '900ms'}}>
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Public Interest</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Supporting digital governance, smart city objectives, and transparent administration.</p>
                </CardContent>
            </Card>
             <Card className="text-center shadow-md hover:shadow-xl transition-shadow animate-slide-in-up" style={{ animationDelay: '1050ms'}}>
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Future Vision</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aiming for AI-assisted classification, multilingual support, and direct municipal integrations.</p>
                </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
