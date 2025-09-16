import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Name */}
        <h1 className="text-6xl font-bold tracking-tight">
          Quinn Sprouse
        </h1>

        {/* Title/Role */}
        <p className="text-2xl text-muted-foreground">
          Full-Stack Developer
        </p>

        {/* Bio */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Building modern web applications with cutting-edge technologies.
          Focused on creating beautiful, performant, and user-friendly experiences.
        </p>

        {/* CTAs */}
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" className="font-medium" asChild>
            <a href="/projects">
              View Projects
              <ArrowRight className="ml-2 size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="font-medium" asChild>
            <a href="/contact">
              Get in Touch
              <Mail className="ml-2 size-4" />
            </a>
          </Button>
        </div>

        {/* Social Links */}
        <div className="flex gap-4 justify-center pt-8">
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/quinnsprouse" target="_blank" rel="noopener noreferrer">
              <Github className="size-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://linkedin.com/in/quinnsprouse" target="_blank" rel="noopener noreferrer">
              <Linkedin className="size-5" />
            </a>
          </Button>
        </div>

        {/* Tech Stack */}
        <div className="pt-12">
          <p className="text-sm text-muted-foreground mb-4">Technologies I work with</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['React', 'TypeScript', 'Node.js', 'Next.js', 'TanStack', 'Tailwind CSS'].map((tech) => (
              <Badge key={tech} variant="outline" className="px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}